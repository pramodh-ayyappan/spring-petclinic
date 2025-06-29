package org.springframework.samples.petclinic.api.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.samples.petclinic.api.dto.*;
import org.springframework.samples.petclinic.owner.*;
import org.springframework.samples.petclinic.vet.*;
import org.springframework.stereotype.Component;

/**
 * Mapper utility to convert between entities and DTOs
 */
@Component
public class PetClinicMapper {

	// Owner mappings
	public OwnerDto toOwnerDto(Owner owner) {
		if (owner == null) {
			return null;
		}

		OwnerDto dto = new OwnerDto(owner.getId(), owner.getFirstName(), owner.getLastName(), owner.getAddress(),
				owner.getCity(), owner.getTelephone());

		if (owner.getPets() != null) {
			dto.setPets(owner.getPets().stream().map(this::toPetDto).collect(Collectors.toList()));
		}

		return dto;
	}

	public List<OwnerDto> toOwnerDtoList(List<Owner> owners) {
		return owners.stream().map(this::toOwnerDto).collect(Collectors.toList());
	}

	// Pet mappings
	public PetDto toPetDto(Pet pet) {
		if (pet == null) {
			return null;
		}

		PetDto dto = new PetDto(pet.getId(), pet.getName(), pet.getBirthDate(), toPetTypeDto(pet.getType()), null // ownerId
																													// will
																													// be
																													// set
																													// separately
																													// if
																													// needed
		);

		if (pet.getVisits() != null) {
			dto.setVisits(pet.getVisits().stream().map(this::toVisitDto).collect(Collectors.toList()));
		}

		return dto;
	}

	public List<PetDto> toPetDtoList(List<Pet> pets) {
		return pets.stream().map(this::toPetDto).collect(Collectors.toList());
	}

	// Vet mappings
	public VetDto toVetDto(Vet vet) {
		if (vet == null) {
			return null;
		}

		VetDto dto = new VetDto(vet.getId(), vet.getFirstName(), vet.getLastName());

		if (vet.getSpecialties() != null) {
			dto.setSpecialties(vet.getSpecialties().stream().map(this::toSpecialtyDto).collect(Collectors.toList()));
		}

		return dto;
	}

	public List<VetDto> toVetDtoList(List<Vet> vets) {
		return vets.stream().map(this::toVetDto).collect(Collectors.toList());
	}

	// Visit mappings
	public VisitDto toVisitDto(Visit visit) {
		if (visit == null) {
			return null;
		}

		return new VisitDto(visit.getId(), visit.getDate(), visit.getDescription(), null // petId
																							// will
																							// be
																							// set
																							// separately
																							// if
																							// needed
		);
	}

	public List<VisitDto> toVisitDtoList(List<Visit> visits) {
		return visits.stream().map(this::toVisitDto).collect(Collectors.toList());
	}

	// PetType mappings
	public PetTypeDto toPetTypeDto(PetType petType) {
		if (petType == null) {
			return null;
		}

		return new PetTypeDto(petType.getId(), petType.getName());
	}

	public List<PetTypeDto> toPetTypeDtoList(List<PetType> petTypes) {
		return petTypes.stream().map(this::toPetTypeDto).collect(Collectors.toList());
	}

	// Specialty mappings
	public SpecialtyDto toSpecialtyDto(Specialty specialty) {
		if (specialty == null) {
			return null;
		}

		return new SpecialtyDto(specialty.getId(), specialty.getName());
	}

	public List<SpecialtyDto> toSpecialtyDtoList(List<Specialty> specialties) {
		return specialties.stream().map(this::toSpecialtyDto).collect(Collectors.toList());
	}

}
