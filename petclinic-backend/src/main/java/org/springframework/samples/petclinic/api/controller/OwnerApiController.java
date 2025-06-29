package org.springframework.samples.petclinic.api.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.api.dto.OwnerDto;
import org.springframework.samples.petclinic.api.mapper.PetClinicMapper;
import org.springframework.samples.petclinic.owner.Owner;
import org.springframework.samples.petclinic.owner.OwnerRepository;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST API Controller for Owner operations
 */
@RestController
@RequestMapping("/api/owners")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from React app
public class OwnerApiController {

	private final OwnerRepository ownerRepository;

	private final PetClinicMapper mapper;

	public OwnerApiController(OwnerRepository ownerRepository, PetClinicMapper mapper) {
		this.ownerRepository = ownerRepository;
		this.mapper = mapper;
	}

	/**
	 * Get all owners with pagination
	 */
	@GetMapping
	public ResponseEntity<PagedResponse<OwnerDto>> getAllOwners(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String lastName) {

		Pageable pageable = PageRequest.of(page, size);
		Page<Owner> ownerPage;

		if (lastName != null && !lastName.trim().isEmpty()) {
			ownerPage = ownerRepository.findByLastNameStartingWith(lastName, pageable);
		}
		else {
			ownerPage = ownerRepository.findAll(pageable);
		}

		List<OwnerDto> ownerDtos = mapper.toOwnerDtoList(ownerPage.getContent());
		PagedResponse<OwnerDto> response = new PagedResponse<>(ownerDtos, ownerPage.getNumber(), ownerPage.getSize(),
				ownerPage.getTotalElements(), ownerPage.getTotalPages(), ownerPage.isFirst(), ownerPage.isLast());

		return ResponseEntity.ok(response);
	}

	/**
	 * Get owner by ID
	 */
	@GetMapping("/{id}")
	public ResponseEntity<OwnerDto> getOwnerById(@PathVariable Integer id) {
		Optional<Owner> owner = ownerRepository.findById(id);
		if (owner.isPresent()) {
			return ResponseEntity.ok(mapper.toOwnerDto(owner.get()));
		}
		else {
			return ResponseEntity.notFound().build();
		}
	}

	/**
	 * Create new owner
	 */
	@PostMapping
	public ResponseEntity<?> createOwner(@Valid @RequestBody CreateOwnerRequest request, BindingResult result) {
		if (result.hasErrors()) {
			return ResponseEntity.badRequest().body(new ErrorResponse("Validation failed", result.getAllErrors()));
		}

		Owner owner = new Owner();
		owner.setFirstName(request.getFirstName());
		owner.setLastName(request.getLastName());
		owner.setAddress(request.getAddress());
		owner.setCity(request.getCity());
		owner.setTelephone(request.getTelephone());

		Owner savedOwner = ownerRepository.save(owner);
		return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toOwnerDto(savedOwner));
	}

	/**
	 * Update existing owner
	 */
	@PutMapping("/{id}")
	public ResponseEntity<?> updateOwner(@PathVariable Integer id, @Valid @RequestBody CreateOwnerRequest request,
			BindingResult result) {
		if (result.hasErrors()) {
			return ResponseEntity.badRequest().body(new ErrorResponse("Validation failed", result.getAllErrors()));
		}

		Optional<Owner> existingOwner = ownerRepository.findById(id);
		if (!existingOwner.isPresent()) {
			return ResponseEntity.notFound().build();
		}

		Owner owner = existingOwner.get();
		owner.setFirstName(request.getFirstName());
		owner.setLastName(request.getLastName());
		owner.setAddress(request.getAddress());
		owner.setCity(request.getCity());
		owner.setTelephone(request.getTelephone());

		Owner savedOwner = ownerRepository.save(owner);
		return ResponseEntity.ok(mapper.toOwnerDto(savedOwner));
	}

	/**
	 * Delete owner
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteOwner(@PathVariable Integer id) {
		if (ownerRepository.existsById(id)) {
			ownerRepository.deleteById(id);
			return ResponseEntity.noContent().build();
		}
		else {
			return ResponseEntity.notFound().build();
		}
	}

	// Request/Response classes
	public static class CreateOwnerRequest {

		private String firstName;

		private String lastName;

		private String address;

		private String city;

		private String telephone;

		// Getters and setters
		public String getFirstName() {
			return firstName;
		}

		public void setFirstName(String firstName) {
			this.firstName = firstName;
		}

		public String getLastName() {
			return lastName;
		}

		public void setLastName(String lastName) {
			this.lastName = lastName;
		}

		public String getAddress() {
			return address;
		}

		public void setAddress(String address) {
			this.address = address;
		}

		public String getCity() {
			return city;
		}

		public void setCity(String city) {
			this.city = city;
		}

		public String getTelephone() {
			return telephone;
		}

		public void setTelephone(String telephone) {
			this.telephone = telephone;
		}

	}

	public static class PagedResponse<T> {

		private List<T> content;

		private int page;

		private int size;

		private long totalElements;

		private int totalPages;

		private boolean first;

		private boolean last;

		public PagedResponse(List<T> content, int page, int size, long totalElements, int totalPages, boolean first,
				boolean last) {
			this.content = content;
			this.page = page;
			this.size = size;
			this.totalElements = totalElements;
			this.totalPages = totalPages;
			this.first = first;
			this.last = last;
		}

		// Getters
		public List<T> getContent() {
			return content;
		}

		public int getPage() {
			return page;
		}

		public int getSize() {
			return size;
		}

		public long getTotalElements() {
			return totalElements;
		}

		public int getTotalPages() {
			return totalPages;
		}

		public boolean isFirst() {
			return first;
		}

		public boolean isLast() {
			return last;
		}

	}

	public static class ErrorResponse {

		private String message;

		private Object errors;

		public ErrorResponse(String message, Object errors) {
			this.message = message;
			this.errors = errors;
		}

		public String getMessage() {
			return message;
		}

		public Object getErrors() {
			return errors;
		}

	}

}
