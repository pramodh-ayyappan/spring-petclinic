/*
 * Copyright 2012-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.samples.petclinic.vet;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * @author Juergen Hoeller
 * @author Mark Fisher
 * @author Ken Krebs
 * @author Arjen Poutsma
 */
@Controller
class VetController {

	private final VetRepository vetRepository;

	private final VetMergeService vetMergeService;

	private final S3Service s3Service;

	private final ObjectMapper objectMapper;

	public VetController(VetRepository vetRepository, VetMergeService vetMergeService, S3Service s3Service) {
		this.vetRepository = vetRepository;
		this.vetMergeService = vetMergeService;
		this.s3Service = s3Service;
		this.objectMapper = new ObjectMapper();
		// Register the JavaTimeModule to handle Java 8 date/time types
		this.objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
		// Configure to use ISO-8601 date/time format
		this.objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
				false);
	}

	@GetMapping("/vets.html")
	public String showVetList(@RequestParam(defaultValue = "1") int page, Model model) {
		// Here we are returning an object of type 'Vets' rather than a collection of Vet
		// objects so it is simpler for Object-Xml mapping
		Vets vets = new Vets();
		Page<Vet> paginated = findPaginated(page);
		vets.getVetList().addAll(paginated.toList());
		return addPaginationModel(page, paginated, model);
	}

	private String addPaginationModel(int page, Page<Vet> paginated, Model model) {
		List<Vet> listVets = paginated.getContent();
		model.addAttribute("currentPage", page);
		model.addAttribute("totalPages", paginated.getTotalPages());
		model.addAttribute("totalItems", paginated.getTotalElements());
		model.addAttribute("listVets", listVets);
		return "vets/vetList";
	}

	private Page<Vet> findPaginated(int page) {
		int pageSize = 5;
		Pageable pageable = PageRequest.of(page - 1, pageSize);
		// Use merged data for the web interface
		return vetMergeService.findAllMerged(pageable);
	}

	@GetMapping({ "/vets" })
	public @ResponseBody Vets showResourcesVetList() {
		// Here we are returning an object of type 'Vets' rather than a collection of Vet
		// objects so it is simpler for JSon/Object mapping
		Vets vets = new Vets();
		// Use merged data for the JSON endpoint
		vets.getVetList().addAll(this.vetMergeService.findAllMerged());
		return vets;
	}

	/**
	 * Push veterinarians data to S3 as JSON.
	 * @param filename The filename to use in S3
	 * @param redirectAttributes For flash attributes
	 * @return Redirect to vets list page
	 */
	@PostMapping("/vets/s3/push")
	public String pushVetsToS3(@RequestParam(defaultValue = "vets.json") String filename,
			RedirectAttributes redirectAttributes) {
		try {
			Vets vets = new Vets();
			vets.getVetList().addAll(this.vetRepository.findAll());
			String jsonContent = objectMapper.writeValueAsString(vets);

			boolean success = s3Service.pushJsonToS3(filename, jsonContent);
			if (success) {
				redirectAttributes.addFlashAttribute("message", "Successfully pushed veterinarians data to S3");
			}
			else {
				redirectAttributes.addFlashAttribute("error", "Failed to push veterinarians data to S3");
			}
		}
		catch (Exception e) {
			redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
		}
		return "redirect:/vets.html";
	}

	/**
	 * Remove a file from S3.
	 * @param filename The filename to remove from S3
	 * @param redirectAttributes For flash attributes
	 * @return Redirect to vets list page
	 */
	@PostMapping("/vets/s3/remove")
	public String removeFromS3(@RequestParam String filename, RedirectAttributes redirectAttributes) {
		boolean success = s3Service.removeFromS3(filename);
		if (success) {
			redirectAttributes.addFlashAttribute("message", "Successfully removed " + filename + " from S3");
		}
		else {
			redirectAttributes.addFlashAttribute("error", "Failed to remove " + filename + " from S3");
		}
		return "redirect:/vets.html";
	}

	/**
	 * List all files in the S3 bucket.
	 * @param model The model to add attributes to
	 * @return The vets list page with S3 files
	 */
	@GetMapping("/vets/s3/list")
	public String listS3Files(Model model) {
		List<String> s3Files = s3Service.listFilesFromS3();
		model.addAttribute("s3Files", s3Files);
		return "vets/s3Files";
	}

	/**
	 * API endpoint to list S3 files.
	 * @return List of S3 files
	 */
	@GetMapping("/api/vets/s3/list")
	public @ResponseBody List<String> listS3FilesApi() {
		return s3Service.listFilesFromS3();
	}

}
