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

	private final PetClinicMapper mapper;

	public VetApiController(VetRepository vetRepository, PetClinicMapper mapper) {
		this.vetRepository = vetRepository;
		this.mapper = mapper;
	}

	/**
	 * Get all vets with pagination
	 */
	@GetMapping
	public ResponseEntity<OwnerApiController.PagedResponse<VetDto>> getAllVets(
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size);
		Page<Vet> vetPage = vetRepository.findAll(pageable);

		List<VetDto> vetDtos = mapper.toVetDtoList(vetPage.getContent());
		OwnerApiController.PagedResponse<VetDto> response = new OwnerApiController.PagedResponse<>(vetDtos,
				vetPage.getNumber(), vetPage.getSize(), vetPage.getTotalElements(), vetPage.getTotalPages(),
				vetPage.isFirst(), vetPage.isLast());

		return ResponseEntity.ok(response);
	}

	/**
	 * Get all vets (non-paginated for simple listings)
	 */
	@GetMapping("/all")
	public ResponseEntity<List<VetDto>> getAllVetsSimple() {
		Collection<Vet> vets = vetRepository.findAll();
		List<Vet> vetList = vets.stream().toList();
		return ResponseEntity.ok(mapper.toVetDtoList(vetList));
	}

}
