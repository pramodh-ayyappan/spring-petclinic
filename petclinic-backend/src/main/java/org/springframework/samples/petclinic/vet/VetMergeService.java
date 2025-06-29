package org.springframework.samples.petclinic.vet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Service to merge veterinarian data from database and JSON file
 */
@Service
public class VetMergeService {

	private static final Logger logger = LoggerFactory.getLogger(VetMergeService.class);

	private final VetRepository vetRepository;

	private final ObjectMapper objectMapper;

	private final ResourceLoader resourceLoader;

	@Value("${petclinic.additional-vets.file-path:additional-vets.json}")
	private String additionalVetsFilePath;

	@Value("${petclinic.additional-vets.enabled:true}")
	private boolean additionalVetsEnabled;

	public VetMergeService(VetRepository vetRepository, ObjectMapper objectMapper, ResourceLoader resourceLoader) {
		this.vetRepository = vetRepository;
		this.objectMapper = objectMapper;
		this.resourceLoader = resourceLoader;
	}

	/**
	 * Get all vets with merged data (database + JSON)
	 */
	public Collection<Vet> findAllMerged() {
		Collection<Vet> databaseVets = vetRepository.findAll();

		if (!additionalVetsEnabled) {
			return databaseVets;
		}

		List<Vet> additionalVets = loadAdditionalVets();
		return mergeVets(databaseVets, additionalVets);
	}

	/**
	 * Get paginated vets with merged data (database + JSON)
	 */
	public Page<Vet> findAllMerged(Pageable pageable) {
		Collection<Vet> allMergedVets = findAllMerged();
		List<Vet> vetList = new ArrayList<>(allMergedVets);

		// Manual pagination since we're working with merged data
		int start = (int) pageable.getOffset();
		int end = Math.min((start + pageable.getPageSize()), vetList.size());

		List<Vet> pageContent = vetList.subList(start, end);

		return new PageImpl<>(pageContent, pageable, vetList.size());
	}

	/**
	 * Get only database vets (original functionality)
	 */
	public Collection<Vet> findAllDatabase() {
		return vetRepository.findAll();
	}

	/**
	 * Get paginated database vets (original functionality)
	 */
	public Page<Vet> findAllDatabase(Pageable pageable) {
		return vetRepository.findAll(pageable);
	}

	/**
	 * Get only additional vets from JSON file
	 */
	public List<Vet> findAllAdditional() {
		if (!additionalVetsEnabled) {
			return new ArrayList<>();
		}
		return loadAdditionalVets();
	}

	/**
	 * Load additional vets from JSON file Supports both classpath resources and external
	 * file paths
	 */
	private List<Vet> loadAdditionalVets() {
		try {
			InputStream inputStream = null;
			String resolvedPath = null;

			// Try different approaches to locate the file
			if (isAbsolutePath(additionalVetsFilePath)) {
				// 1. Absolute path - try as external file
				File file = new File(additionalVetsFilePath);
				if (file.exists() && file.isFile()) {
					inputStream = new FileInputStream(file);
					resolvedPath = file.getAbsolutePath();
					logger.info("Loading additional vets from absolute path: {}", resolvedPath);
				}
			}
			else {
				// 2. Relative path - try multiple approaches

				// 2a. Try as Spring Resource (supports file:, classpath:, etc.)
				try {
					Resource resource = resourceLoader.getResource(additionalVetsFilePath);
					if (resource.exists()) {
						inputStream = resource.getInputStream();
						resolvedPath = resource.getDescription();
						logger.info("Loading additional vets from Spring resource: {}", resolvedPath);
					}
				}
				catch (Exception e) {
					logger.debug("Failed to load as Spring resource: {}", e.getMessage());
				}

				// 2b. Try with file: prefix
				if (inputStream == null) {
					try {
						Resource resource = resourceLoader.getResource("file:" + additionalVetsFilePath);
						if (resource.exists()) {
							inputStream = resource.getInputStream();
							resolvedPath = resource.getDescription();
							logger.info("Loading additional vets from file resource: {}", resolvedPath);
						}
					}
					catch (Exception e) {
						logger.debug("Failed to load as file resource: {}", e.getMessage());
					}
				}

				// 2c. Try as classpath resource
				if (inputStream == null) {
					try {
						Resource resource = resourceLoader.getResource("classpath:" + additionalVetsFilePath);
						if (resource.exists()) {
							inputStream = resource.getInputStream();
							resolvedPath = resource.getDescription();
							logger.info("Loading additional vets from classpath: {}", resolvedPath);
						}
					}
					catch (Exception e) {
						logger.debug("Failed to load as classpath resource: {}", e.getMessage());
					}
				}

				// 2d. Try relative to current working directory
				if (inputStream == null) {
					File file = new File(additionalVetsFilePath);
					if (file.exists() && file.isFile()) {
						inputStream = new FileInputStream(file);
						resolvedPath = file.getAbsolutePath();
						logger.info("Loading additional vets from relative path: {}", resolvedPath);
					}
				}
			}

			if (inputStream == null) {
				logger.warn("Additional vets file not found at any of the attempted locations: {}",
						additionalVetsFilePath);
				logger.info("Attempted locations:");
				logger.info("  - Absolute path: {}", additionalVetsFilePath);
				logger.info("  - Spring resource: {}", additionalVetsFilePath);
				logger.info("  - File resource: file:{}", additionalVetsFilePath);
				logger.info("  - Classpath resource: classpath:{}", additionalVetsFilePath);
				logger.info("  - Relative to working directory: {}",
						new File(additionalVetsFilePath).getAbsolutePath());
				return new ArrayList<>();
			}

			try (InputStream is = inputStream) {
				JsonVetData jsonData = objectMapper.readValue(is, JsonVetData.class);

				if (jsonData.getAdditionalVets() == null) {
					logger.warn("No additional vets found in file: {}", resolvedPath);
					return new ArrayList<>();
				}

				logger.info("Successfully loaded {} additional vets from: {}", jsonData.getAdditionalVets().size(),
						resolvedPath);

				return jsonData.getAdditionalVets()
					.stream()
					.map(this::convertJsonVetToVet)
					.collect(Collectors.toList());
			}
		}
		catch (IOException e) {
			logger.error("Error loading additional vets from {}: {}", additionalVetsFilePath, e.getMessage());
			return new ArrayList<>();
		}
	}

	/**
	 * Check if the path is absolute
	 */
	private boolean isAbsolutePath(String path) {
		if (path == null || path.isEmpty()) {
			return false;
		}
		// Check for Windows absolute paths (C:\...) or Unix absolute paths (/...)
		return path.matches("^[a-zA-Z]:\\\\.*") || path.startsWith("/");
	}

	/**
	 * Convert JSON vet to domain Vet object
	 */
	private Vet convertJsonVetToVet(JsonVetData.JsonVet jsonVet) {
		Vet vet = new Vet();
		vet.setId(jsonVet.getId());
		vet.setFirstName(jsonVet.getFirstName());
		vet.setLastName(jsonVet.getLastName());

		if (jsonVet.getSpecialties() != null) {
			for (JsonVetData.JsonSpecialty jsonSpecialty : jsonVet.getSpecialties()) {
				Specialty specialty = new Specialty();
				specialty.setId(jsonSpecialty.getId());
				specialty.setName(jsonSpecialty.getName());
				vet.addSpecialty(specialty);
			}
		}

		return vet;
	}

	/**
	 * Merge database and additional vets, with database vets taking priority for
	 * duplicate IDs
	 */
	private Collection<Vet> mergeVets(Collection<Vet> databaseVets, List<Vet> additionalVets) {
		Map<Integer, Vet> vetMap = new LinkedHashMap<>();

		// Add database vets first (they take priority)
		for (Vet vet : databaseVets) {
			vetMap.put(vet.getId(), vet);
		}

		// Add additional vets only if ID doesn't already exist
		for (Vet vet : additionalVets) {
			if (!vetMap.containsKey(vet.getId())) {
				vetMap.put(vet.getId(), vet);
			}
			else {
				logger.debug("Skipping additional vet with duplicate ID: {} - {} {}", vet.getId(), vet.getFirstName(),
						vet.getLastName());
			}
		}

		return vetMap.values();
	}

}
