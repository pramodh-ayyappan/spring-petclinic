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
package org.springframework.samples.petclinic.owner;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.samples.petclinic.vet.S3Service;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.validation.Valid;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * @author Juergen Hoeller
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Michael Isvy
 * @author Wick Dynex
 */
@Controller
class OwnerController {

	private static final String VIEWS_OWNER_CREATE_OR_UPDATE_FORM = "owners/createOrUpdateOwnerForm";

	private final OwnerRepository owners;

	private final S3Service s3Service;

	private final ObjectMapper objectMapper;

	public OwnerController(OwnerRepository owners, S3Service s3Service) {
		this.owners = owners;
		this.s3Service = s3Service;
		this.objectMapper = new ObjectMapper();
		// Register the JavaTimeModule to handle Java 8 date/time types
		this.objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
		// Configure to use ISO-8601 date/time format
		this.objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
				false);
	}

	@InitBinder
	public void setAllowedFields(WebDataBinder dataBinder) {
		dataBinder.setDisallowedFields("id");
	}

	@ModelAttribute("owner")
	public Owner findOwner(@PathVariable(name = "ownerId", required = false) Integer ownerId) {
		return ownerId == null ? new Owner()
				: this.owners.findById(ownerId)
					.orElseThrow(() -> new IllegalArgumentException("Owner not found with id: " + ownerId
							+ ". Please ensure the ID is correct " + "and the owner exists in the database."));
	}

	@GetMapping("/owners/new")
	public String initCreationForm() {
		return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
	}

	@PostMapping("/owners/new")
	public String processCreationForm(@Valid Owner owner, BindingResult result, RedirectAttributes redirectAttributes) {
		if (result.hasErrors()) {
			redirectAttributes.addFlashAttribute("error", "There was an error in creating the owner.");
			return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
		}

		this.owners.save(owner);
		redirectAttributes.addFlashAttribute("message", "New Owner Created");
		return "redirect:/owners/" + owner.getId();
	}

	@GetMapping("/owners/find")
	public String initFindForm() {
		return "owners/findOwners";
	}

	@GetMapping("/owners")
	public String processFindForm(@RequestParam(defaultValue = "1") int page, Owner owner, BindingResult result,
			Model model) {
		// allow parameterless GET request for /owners to return all records
		if (owner.getLastName() == null) {
			owner.setLastName(""); // empty string signifies broadest possible search
		}

		// find owners by last name
		Page<Owner> ownersResults = findPaginatedForOwnersLastName(page, owner.getLastName());
		if (ownersResults.isEmpty()) {
			// no owners found
			result.rejectValue("lastName", "notFound", "not found");
			return "owners/findOwners";
		}

		if (ownersResults.getTotalElements() == 1) {
			// 1 owner found
			owner = ownersResults.iterator().next();
			return "redirect:/owners/" + owner.getId();
		}

		// multiple owners found
		return addPaginationModel(page, model, ownersResults);
	}

	private String addPaginationModel(int page, Model model, Page<Owner> paginated) {
		List<Owner> listOwners = paginated.getContent();
		model.addAttribute("currentPage", page);
		model.addAttribute("totalPages", paginated.getTotalPages());
		model.addAttribute("totalItems", paginated.getTotalElements());
		model.addAttribute("listOwners", listOwners);
		return "owners/ownersList";
	}

	private Page<Owner> findPaginatedForOwnersLastName(int page, String lastname) {
		int pageSize = 5;
		Pageable pageable = PageRequest.of(page - 1, pageSize);
		return owners.findByLastNameStartingWith(lastname, pageable);
	}

	@GetMapping("/owners/{ownerId}/edit")
	public String initUpdateOwnerForm() {
		return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
	}

	@PostMapping("/owners/{ownerId}/edit")
	public String processUpdateOwnerForm(@Valid Owner owner, BindingResult result, @PathVariable("ownerId") int ownerId,
			RedirectAttributes redirectAttributes) {
		if (result.hasErrors()) {
			redirectAttributes.addFlashAttribute("error", "There was an error in updating the owner.");
			return VIEWS_OWNER_CREATE_OR_UPDATE_FORM;
		}

		if (owner.getId() != ownerId) {
			result.rejectValue("id", "mismatch", "The owner ID in the form does not match the URL.");
			redirectAttributes.addFlashAttribute("error", "Owner ID mismatch. Please try again.");
			return "redirect:/owners/{ownerId}/edit";
		}

		owner.setId(ownerId);
		this.owners.save(owner);
		redirectAttributes.addFlashAttribute("message", "Owner Values Updated");
		return "redirect:/owners/{ownerId}";
	}

	/**
	 * Custom handler for displaying an owner.
	 * @param ownerId the ID of the owner to display
	 * @return a ModelMap with the model attributes for the view
	 */
	@GetMapping("/owners/{ownerId}")
	public ModelAndView showOwner(@PathVariable("ownerId") int ownerId) {
		ModelAndView mav = new ModelAndView("owners/ownerDetails");
		Optional<Owner> optionalOwner = this.owners.findById(ownerId);
		Owner owner = optionalOwner.orElseThrow(() -> new IllegalArgumentException(
				"Owner not found with id: " + ownerId + ". Please ensure the ID is correct "));
		mav.addObject(owner);
		return mav;
	}

	/**
	 * Push owner data to S3 as JSON.
	 * @param ownerId the ID of the owner to push
	 * @param filename The filename to use in S3
	 * @param redirectAttributes For flash attributes
	 * @return Redirect to owner details page
	 */
	@PostMapping("/owners/{ownerId}/s3/push")
	public String pushOwnerToS3(@PathVariable("ownerId") int ownerId,
			@RequestParam(defaultValue = "owner.json") String filename, RedirectAttributes redirectAttributes) {
		try {
			Optional<Owner> optionalOwner = this.owners.findById(ownerId);
			Owner owner = optionalOwner.orElseThrow(() -> new IllegalArgumentException(
					"Owner not found with id: " + ownerId + ". Please ensure the ID is correct "));

			String jsonContent = objectMapper.writeValueAsString(owner);

			boolean success = s3Service.pushJsonToS3(filename, jsonContent);
			if (success) {
				redirectAttributes.addFlashAttribute("message", "Successfully pushed owner data to S3");
			}
			else {
				redirectAttributes.addFlashAttribute("error", "Failed to push owner data to S3");
			}
		}
		catch (Exception e) {
			redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
		}
		return "redirect:/owners/{ownerId}";
	}

	/**
	 * Push all owners data to S3 as JSON.
	 * @param filename The filename to use in S3
	 * @param redirectAttributes For flash attributes
	 * @return Redirect to owners list page
	 */
	@PostMapping("/owners/s3/push")
	public String pushAllOwnersToS3(@RequestParam(defaultValue = "owners.json") String filename,
			RedirectAttributes redirectAttributes) {
		try {
			Owners owners = new Owners();
			owners.getOwnerList().addAll(this.owners.findAll());
			String jsonContent = objectMapper.writeValueAsString(owners);

			boolean success = s3Service.pushJsonToS3(filename, jsonContent);
			if (success) {
				redirectAttributes.addFlashAttribute("message", "Successfully pushed all owners data to S3");
			}
			else {
				redirectAttributes.addFlashAttribute("error", "Failed to push all owners data to S3");
			}
		}
		catch (Exception e) {
			redirectAttributes.addFlashAttribute("error", "Error: " + e.getMessage());
		}
		return "redirect:/owners";
	}

	/**
	 * Remove a file from S3.
	 * @param filename The filename to remove from S3
	 * @param redirectAttributes For flash attributes
	 * @return Redirect to S3 files list page
	 */
	@PostMapping("/owners/s3/remove")
	public String removeFromS3(@RequestParam String filename, RedirectAttributes redirectAttributes) {
		boolean success = s3Service.removeFromS3(filename);
		if (success) {
			redirectAttributes.addFlashAttribute("message", "Successfully removed " + filename + " from S3");
		}
		else {
			redirectAttributes.addFlashAttribute("error", "Failed to remove " + filename + " from S3");
		}
		return "redirect:/owners/s3/list";
	}

	/**
	 * List all files in the S3 bucket.
	 * @param model The model to add attributes to
	 * @return The owners S3 files page
	 */
	@GetMapping("/owners/s3/list")
	public String listS3Files(Model model) {
		List<String> s3Files = s3Service.listFilesFromS3();
		model.addAttribute("s3Files", s3Files);
		return "owners/s3Files";
	}

	/**
	 * API endpoint to list S3 files.
	 * @return List of S3 files
	 */
	@GetMapping("/api/owners/s3/list")
	public @ResponseBody List<String> listS3FilesApi() {
		return s3Service.listFilesFromS3();
	}

}
