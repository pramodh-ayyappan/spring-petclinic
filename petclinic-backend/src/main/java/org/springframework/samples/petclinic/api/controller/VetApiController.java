package org.springframework.samples.petclinic.api.controller;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.api.dto.VetDto;
import org.springframework.samples.petclinic.api.mapper.PetClinicMapper;
import org.springframework.samples.petclinic.vet.Vet;
import org.springframework.samples.petclinic.vet.VetMergeService;
import org.springframework.samples.petclinic.vet.VetRepository;
import org.springframework.web.bind.annotation.*;

/**
 * REST API Controller for Vet operations
 */
@RestController
@RequestMapping("/api/vets")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from React app
public class VetApiController {

	private final VetRepository vetRepository;

	private final VetMergeService vetMergeService;

	private final PetClinicMapper mapper;

	public VetApiController(VetRepository vetRepository, VetMergeService vetMergeService, PetClinicMapper mapper) {
		this.vetRepository = vetRepository;
		this.vetMergeService = vetMergeService;
		this.mapper = mapper;
	}

	/**
	 * Get all vets with pagination (merged data by default)
	 */
	@GetMapping
	public ResponseEntity<OwnerApiController.PagedResponse<VetDto>> getAllVets(
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "merged") String source) {

		Pageable pageable = PageRequest.of(page, size);
		Page<Vet> vetPage;

		switch (source.toLowerCase()) {
			case "database":
			case "backend":
				vetPage = vetMergeService.findAllDatabase(pageable);
				break;
			case "additional":
			case "json":
				// For additional vets, we need to handle pagination manually
				List<Vet> additionalVets = vetMergeService.findAllAdditional();
				int start = page * size;
				int end = Math.min(start + size, additionalVets.size());
				List<Vet> pageContent = additionalVets.subList(start, end);
				vetPage = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, additionalVets.size());
				break;
			case "merged":
			default:
				vetPage = vetMergeService.findAllMerged(pageable);
				break;
		}

		List<VetDto> vetDtos = mapper.toVetDtoList(vetPage.getContent());
		OwnerApiController.PagedResponse<VetDto> response = new OwnerApiController.PagedResponse<>(vetDtos,
				vetPage.getNumber(), vetPage.getSize(), vetPage.getTotalElements(), vetPage.getTotalPages(),
				vetPage.isFirst(), vetPage.isLast());

		return ResponseEntity.ok(response);
	}

	/**
	 * Get all vets (non-paginated, merged data by default)
	 */
	@GetMapping("/all")
	public ResponseEntity<List<VetDto>> getAllVetsSimple(@RequestParam(defaultValue = "merged") String source) {
		Collection<Vet> vets;

		switch (source.toLowerCase()) {
			case "database":
			case "backend":
				vets = vetMergeService.findAllDatabase();
				break;
			case "additional":
			case "json":
				vets = vetMergeService.findAllAdditional();
				break;
			case "merged":
			default:
				vets = vetMergeService.findAllMerged();
				break;
		}

		List<Vet> vetList = vets.stream().toList();
		return ResponseEntity.ok(mapper.toVetDtoList(vetList));
	}

	/**
	 * Get merged vets specifically (database + JSON)
	 */
	@GetMapping("/merged")
	public ResponseEntity<OwnerApiController.PagedResponse<VetDto>> getMergedVets(
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<Vet> vetPage = vetMergeService.findAllMerged(pageable);

		List<VetDto> vetDtos = mapper.toVetDtoList(vetPage.getContent());
		OwnerApiController.PagedResponse<VetDto> response = new OwnerApiController.PagedResponse<>(vetDtos,
				vetPage.getNumber(), vetPage.getSize(), vetPage.getTotalElements(), vetPage.getTotalPages(),
				vetPage.isFirst(), vetPage.isLast());

		return ResponseEntity.ok(response);
	}

	/**
	 * Get database vets only (original data)
	 */
	@GetMapping("/database")
	public ResponseEntity<OwnerApiController.PagedResponse<VetDto>> getDatabaseVets(
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<Vet> vetPage = vetMergeService.findAllDatabase(pageable);

		List<VetDto> vetDtos = mapper.toVetDtoList(vetPage.getContent());
		OwnerApiController.PagedResponse<VetDto> response = new OwnerApiController.PagedResponse<>(vetDtos,
				vetPage.getNumber(), vetPage.getSize(), vetPage.getTotalElements(), vetPage.getTotalPages(),
				vetPage.isFirst(), vetPage.isLast());

		return ResponseEntity.ok(response);
	}

	/**
	 * Get additional vets only (from JSON file)
	 */
	@GetMapping("/additional")
	public ResponseEntity<List<VetDto>> getAdditionalVets() {
		List<Vet> additionalVets = vetMergeService.findAllAdditional();
		return ResponseEntity.ok(mapper.toVetDtoList(additionalVets));
	}

}
