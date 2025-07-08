package org.springframework.samples.petclinic.api.controller;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.admin.AdminAuthService;
import org.springframework.samples.petclinic.owner.Owner;
import org.springframework.samples.petclinic.owner.OwnerRepository;
import org.springframework.samples.petclinic.owner.Owners;
import org.springframework.samples.petclinic.vet.S3Service;
import org.springframework.samples.petclinic.vet.Vet;
import org.springframework.samples.petclinic.vet.VetMergeService;
import org.springframework.samples.petclinic.vet.Vets;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * REST API Controller for S3 and Export operations
 */
@RestController
@RequestMapping("/api/s3")
@CrossOrigin(originPatterns = "*") // Allow requests from any origin for Kubernetes
public class S3ApiController {

	private final S3Service s3Service;

	private final VetMergeService vetMergeService;

	private final OwnerRepository ownerRepository;

	private final ObjectMapper objectMapper;

	private final AdminAuthService adminAuthService;

	@Value("${petclinic.export.directory:./exports}")
	private String exportDirectory;

	public S3ApiController(S3Service s3Service, VetMergeService vetMergeService, OwnerRepository ownerRepository,
			AdminAuthService adminAuthService) {
		this.s3Service = s3Service;
		this.vetMergeService = vetMergeService;
		this.ownerRepository = ownerRepository;
		this.adminAuthService = adminAuthService;
		this.objectMapper = new ObjectMapper();
		this.objectMapper.registerModule(new JavaTimeModule());
		this.objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
		this.objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
	}

	/**
	 * Check admin authentication
	 */
	private ResponseEntity<ApiResponse> checkAdminAuth(String authHeader) {
		if (!adminAuthService.validateAdminAuth(authHeader)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(new ApiResponse(false, "Admin authentication required"));
		}
		return null; // null means auth is valid
	}

	/**
	 * List all files in S3 bucket
	 */
	@GetMapping("/files")
	public ResponseEntity<S3FilesResponse> listS3Files() {
		try {
			List<String> files = s3Service.listFilesFromS3();
			return ResponseEntity.ok(new S3FilesResponse(files, files.size(), s3Service.getBucketName(),
					s3Service.isAwsCredentialsValid()));
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new S3FilesResponse(List.of(), 0, "Error listing S3 files: " + e.getMessage()));
		}
	}

	/**
	 * List all files in S3 bucket with metadata
	 */
	@GetMapping("/files/detailed")
	public ResponseEntity<S3DetailedFilesResponse> listS3FilesDetailed() {
		try {
			List<S3Service.S3FileInfo> files = s3Service.listFilesWithMetadata();
			return ResponseEntity.ok(new S3DetailedFilesResponse(files, files.size(), s3Service.getBucketName(),
					s3Service.isAwsCredentialsValid()));
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new S3DetailedFilesResponse(List.of(), 0, s3Service.getBucketName(), false,
						"Error listing S3 files: " + e.getMessage()));
		}
	}

	/**
	 * Delete a specific file from S3
	 */
	@DeleteMapping("/files/{filename}")
	public ResponseEntity<ApiResponse> deleteS3File(@PathVariable String filename,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// Check admin authentication
		ResponseEntity<ApiResponse> authCheck = checkAdminAuth(authHeader);
		if (authCheck != null)
			return authCheck;
		try {
			boolean success = s3Service.removeFromS3(filename);
			if (success) {
				return ResponseEntity.ok(new ApiResponse(true, "File '" + filename + "' deleted successfully"));
			}
			else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse(false, "Failed to delete file '" + filename + "'"));
			}
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Error deleting file: " + e.getMessage()));
		}
	}

	/**
	 * Upload vets data to S3
	 */
	@PostMapping("/vets/upload")
	public ResponseEntity<ApiResponse> uploadVetsToS3(@RequestParam(defaultValue = "vets") String filename,
			@RequestParam(defaultValue = "merged") String source,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// Check admin authentication
		ResponseEntity<ApiResponse> authCheck = checkAdminAuth(authHeader);
		if (authCheck != null)
			return authCheck;
		try {
			Vets vets = new Vets();
			switch (source.toLowerCase()) {
				case "database":
				case "backend":
					vets.getVetList().addAll(vetMergeService.findAllDatabase());
					break;
				case "additional":
				case "json":
					vets.getVetList().addAll(vetMergeService.findAllAdditional());
					break;
				case "merged":
				default:
					vets.getVetList().addAll(vetMergeService.findAllMerged());
					break;
			}

			String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
			// Always include "vets" in the filename for clarity
			String baseFilename = filename.equals("export") ? "export_vets"
					: (filename.contains("vets") ? filename : filename + "_vets");
			String finalFilename = baseFilename + "_" + source + "_" + timestamp + ".json";

			String jsonContent = objectMapper.writeValueAsString(vets);
			boolean success = s3Service.pushJsonToS3(finalFilename, jsonContent);

			if (success) {
				return ResponseEntity.ok(new ApiResponse(true,
						"Vets data (" + source + ") uploaded to S3 as " + finalFilename,
						Map.of("filename", finalFilename, "recordCount", vets.getVetList().size(), "source", source)));
			}
			else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse(false, "Failed to upload vets data to S3"));
			}
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Error uploading vets data: " + e.getMessage()));
		}
	}

	/**
	 * Upload owners data to S3
	 */
	@PostMapping("/owners/upload")
	public ResponseEntity<ApiResponse> uploadOwnersToS3(@RequestParam(defaultValue = "owners") String filename,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// Check admin authentication
		ResponseEntity<ApiResponse> authCheck = checkAdminAuth(authHeader);
		if (authCheck != null)
			return authCheck;
		try {
			Owners owners = new Owners();
			owners.getOwnerList().addAll(ownerRepository.findAll());

			String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
			// Always include "owners" in the filename for clarity
			String baseFilename = filename.equals("export") ? "export_owners"
					: (filename.contains("owners") ? filename : filename + "_owners");
			String finalFilename = baseFilename + "_" + timestamp + ".json";

			String jsonContent = objectMapper.writeValueAsString(owners);
			boolean success = s3Service.pushJsonToS3(finalFilename, jsonContent);

			if (success) {
				return ResponseEntity.ok(new ApiResponse(true, "Owners data uploaded to S3 as " + finalFilename,
						Map.of("filename", finalFilename, "recordCount", owners.getOwnerList().size())));
			}
			else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse(false, "Failed to upload owners data to S3"));
			}
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Error uploading owners data: " + e.getMessage()));
		}
	}

	/**
	 * Export vets data to local file and optionally upload to S3
	 */
	@PostMapping("/vets/export")
	public ResponseEntity<ApiResponse> exportVetsToFile(@RequestParam(defaultValue = "vets") String filename,
			@RequestParam(defaultValue = "merged") String source,
			@RequestParam(defaultValue = "false") boolean uploadToS3,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// Check admin authentication
		ResponseEntity<ApiResponse> authCheck = checkAdminAuth(authHeader);
		if (authCheck != null)
			return authCheck;
		try {
			// Prepare data
			Vets vets = new Vets();
			switch (source.toLowerCase()) {
				case "database":
				case "backend":
					vets.getVetList().addAll(vetMergeService.findAllDatabase());
					break;
				case "additional":
				case "json":
					vets.getVetList().addAll(vetMergeService.findAllAdditional());
					break;
				case "merged":
				default:
					vets.getVetList().addAll(vetMergeService.findAllMerged());
					break;
			}

			// Create export directory if it doesn't exist
			Path exportPath = Paths.get(exportDirectory);
			Files.createDirectories(exportPath);

			// Generate filename with timestamp
			String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
			// Always include "vets" in the filename for clarity
			String baseFilename = filename.equals("export") ? "export_vets"
					: (filename.contains("vets") ? filename : filename + "_vets");
			String finalFilename = baseFilename + "_" + source + "_" + timestamp + ".json";
			Path filePath = exportPath.resolve(finalFilename);

			// Write to local file
			String jsonContent = objectMapper.writeValueAsString(vets);
			try (FileWriter writer = new FileWriter(filePath.toFile())) {
				writer.write(jsonContent);
			}

			// Optionally upload to S3
			String s3UploadResult = "";
			if (uploadToS3) {
				boolean s3Success = s3Service.pushJsonToS3(finalFilename, jsonContent);
				s3UploadResult = s3Success ? " and uploaded to S3" : " (S3 upload failed)";
			}

			return ResponseEntity
				.ok(new ApiResponse(true, "Vets data exported to " + filePath.toAbsolutePath() + s3UploadResult,
						Map.of("localFile", filePath.toAbsolutePath().toString(), "filename", finalFilename,
								"recordCount", vets.getVetList().size(), "source", source, "uploadedToS3",
								uploadToS3)));
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Error exporting vets data: " + e.getMessage()));
		}
	}

	/**
	 * Export owners data to local file and optionally upload to S3
	 */
	@PostMapping("/owners/export")
	public ResponseEntity<ApiResponse> exportOwnersToFile(@RequestParam(defaultValue = "owners") String filename,
			@RequestParam(defaultValue = "false") boolean uploadToS3,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// Check admin authentication
		ResponseEntity<ApiResponse> authCheck = checkAdminAuth(authHeader);
		if (authCheck != null)
			return authCheck;
		try {
			// Prepare data
			Owners owners = new Owners();
			owners.getOwnerList().addAll(ownerRepository.findAll());

			// Create export directory if it doesn't exist
			Path exportPath = Paths.get(exportDirectory);
			Files.createDirectories(exportPath);

			// Generate filename with timestamp
			String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
			// Always include "owners" in the filename for clarity
			String baseFilename = filename.equals("export") ? "export_owners"
					: (filename.contains("owners") ? filename : filename + "_owners");
			String finalFilename = baseFilename + "_" + timestamp + ".json";
			Path filePath = exportPath.resolve(finalFilename);

			// Write to local file
			String jsonContent = objectMapper.writeValueAsString(owners);
			try (FileWriter writer = new FileWriter(filePath.toFile())) {
				writer.write(jsonContent);
			}

			// Optionally upload to S3
			String s3UploadResult = "";
			if (uploadToS3) {
				boolean s3Success = s3Service.pushJsonToS3(finalFilename, jsonContent);
				s3UploadResult = s3Success ? " and uploaded to S3" : " (S3 upload failed)";
			}

			return ResponseEntity
				.ok(new ApiResponse(true, "Owners data exported to " + filePath.toAbsolutePath() + s3UploadResult,
						Map.of("localFile", filePath.toAbsolutePath().toString(), "filename", finalFilename,
								"recordCount", owners.getOwnerList().size(), "uploadedToS3", uploadToS3)));
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Error exporting owners data: " + e.getMessage()));
		}
	}

	/**
	 * Download exported file
	 */
	@GetMapping("/files/download/{filename}")
	public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
		try {
			Path filePath = Paths.get(exportDirectory, filename);
			File file = filePath.toFile();

			if (!file.exists()) {
				return ResponseEntity.notFound().build();
			}

			Resource resource = new FileSystemResource(file);

			return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.APPLICATION_OCTET_STREAM)
				.contentLength(file.length())
				.body(resource);
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * List local exported files
	 */
	@GetMapping("/files/local")
	public ResponseEntity<LocalFilesResponse> listLocalFiles() {
		try {
			Path exportPath = Paths.get(exportDirectory);
			if (!Files.exists(exportPath)) {
				return ResponseEntity.ok(new LocalFilesResponse(List.of(), 0, exportPath.toAbsolutePath().toString()));
			}

			List<String> files = Files.list(exportPath)
				.filter(Files::isRegularFile)
				.map(path -> path.getFileName().toString())
				.sorted()
				.toList();

			return ResponseEntity
				.ok(new LocalFilesResponse(files, files.size(), exportPath.toAbsolutePath().toString()));
		}
		catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new LocalFilesResponse(List.of(), 0, "", "Error listing local files: " + e.getMessage()));
		}
	}

	/**
	 * Delete local exported file
	 */
	@DeleteMapping("/files/local/{filename}")
	public ResponseEntity<ApiResponse> deleteLocalFile(@PathVariable String filename,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {
		// Check admin authentication
		ResponseEntity<ApiResponse> authCheck = checkAdminAuth(authHeader);
		if (authCheck != null)
			return authCheck;
		try {
			Path filePath = Paths.get(exportDirectory, filename);
			boolean deleted = Files.deleteIfExists(filePath);

			if (deleted) {
				return ResponseEntity.ok(new ApiResponse(true, "Local file '" + filename + "' deleted successfully"));
			}
			else {
				return ResponseEntity.notFound().build();
			}
		}
		catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ApiResponse(false, "Error deleting local file: " + e.getMessage()));
		}
	}

	/**
	 * Get admin info (for UI display)
	 */
	@GetMapping("/admin/info")
	public ResponseEntity<Map<String, Object>> getAdminInfo() {
		return ResponseEntity
			.ok(Map.of("username", adminAuthService.getAdminUsername(), "authRequired", true, "authType", "Basic"));
	}

	// Response classes
	public static class ApiResponse {

		private boolean success;

		private String message;

		private Map<String, Object> data;

		public ApiResponse(boolean success, String message) {
			this.success = success;
			this.message = message;
		}

		public ApiResponse(boolean success, String message, Map<String, Object> data) {
			this.success = success;
			this.message = message;
			this.data = data;
		}

		// Getters and setters
		public boolean isSuccess() {
			return success;
		}

		public void setSuccess(boolean success) {
			this.success = success;
		}

		public String getMessage() {
			return message;
		}

		public void setMessage(String message) {
			this.message = message;
		}

		public Map<String, Object> getData() {
			return data;
		}

		public void setData(Map<String, Object> data) {
			this.data = data;
		}

	}

	public static class S3FilesResponse {

		private List<String> files;

		private int count;

		private String bucketName;

		private boolean credentialsValid;

		private String error;

		public S3FilesResponse(List<String> files, int count, String bucketName, boolean credentialsValid) {
			this.files = files;
			this.count = count;
			this.bucketName = bucketName;
			this.credentialsValid = credentialsValid;
		}

		public S3FilesResponse(List<String> files, int count, String error) {
			this.files = files;
			this.count = count;
			this.error = error;
		}

		// Getters and setters
		public List<String> getFiles() {
			return files;
		}

		public void setFiles(List<String> files) {
			this.files = files;
		}

		public int getCount() {
			return count;
		}

		public void setCount(int count) {
			this.count = count;
		}

		public String getBucketName() {
			return bucketName;
		}

		public void setBucketName(String bucketName) {
			this.bucketName = bucketName;
		}

		public boolean isCredentialsValid() {
			return credentialsValid;
		}

		public void setCredentialsValid(boolean credentialsValid) {
			this.credentialsValid = credentialsValid;
		}

		public String getError() {
			return error;
		}

		public void setError(String error) {
			this.error = error;
		}

	}

	public static class S3DetailedFilesResponse {

		private List<S3Service.S3FileInfo> files;

		private int count;

		private String bucketName;

		private boolean credentialsValid;

		private String error;

		public S3DetailedFilesResponse(List<S3Service.S3FileInfo> files, int count, String bucketName,
				boolean credentialsValid) {
			this.files = files;
			this.count = count;
			this.bucketName = bucketName;
			this.credentialsValid = credentialsValid;
		}

		public S3DetailedFilesResponse(List<S3Service.S3FileInfo> files, int count, String bucketName,
				boolean credentialsValid, String error) {
			this.files = files;
			this.count = count;
			this.bucketName = bucketName;
			this.credentialsValid = credentialsValid;
			this.error = error;
		}

		// Getters and setters
		public List<S3Service.S3FileInfo> getFiles() {
			return files;
		}

		public void setFiles(List<S3Service.S3FileInfo> files) {
			this.files = files;
		}

		public int getCount() {
			return count;
		}

		public void setCount(int count) {
			this.count = count;
		}

		public String getBucketName() {
			return bucketName;
		}

		public void setBucketName(String bucketName) {
			this.bucketName = bucketName;
		}

		public boolean isCredentialsValid() {
			return credentialsValid;
		}

		public void setCredentialsValid(boolean credentialsValid) {
			this.credentialsValid = credentialsValid;
		}

		public String getError() {
			return error;
		}

		public void setError(String error) {
			this.error = error;
		}

	}

	public static class LocalFilesResponse {

		private List<String> files;

		private int count;

		private String directory;

		private String error;

		public LocalFilesResponse(List<String> files, int count, String directory) {
			this.files = files;
			this.count = count;
			this.directory = directory;
		}

		public LocalFilesResponse(List<String> files, int count, String directory, String error) {
			this.files = files;
			this.count = count;
			this.directory = directory;
			this.error = error;
		}

		// Getters and setters
		public List<String> getFiles() {
			return files;
		}

		public void setFiles(List<String> files) {
			this.files = files;
		}

		public int getCount() {
			return count;
		}

		public void setCount(int count) {
			this.count = count;
		}

		public String getDirectory() {
			return directory;
		}

		public void setDirectory(String directory) {
			this.directory = directory;
		}

		public String getError() {
			return error;
		}

		public void setError(String error) {
			this.error = error;
		}

	}

}
