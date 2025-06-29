package org.springframework.samples.petclinic.api.dto;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Pet API responses
 */
public class PetDto {

	@JsonProperty("id")
	private Integer id;

	@JsonProperty("name")
	private String name;

	@JsonProperty("birthDate")
	private LocalDate birthDate;

	@JsonProperty("type")
	private PetTypeDto type;

	@JsonProperty("visits")
	private List<VisitDto> visits;

	@JsonProperty("ownerId")
	private Integer ownerId;

	// Constructors
	public PetDto() {
	}

	public PetDto(Integer id, String name, LocalDate birthDate, PetTypeDto type, Integer ownerId) {
		this.id = id;
		this.name = name;
		this.birthDate = birthDate;
		this.type = type;
		this.ownerId = ownerId;
	}

	// Getters and Setters
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public LocalDate getBirthDate() {
		return birthDate;
	}

	public void setBirthDate(LocalDate birthDate) {
		this.birthDate = birthDate;
	}

	public PetTypeDto getType() {
		return type;
	}

	public void setType(PetTypeDto type) {
		this.type = type;
	}

	public List<VisitDto> getVisits() {
		return visits;
	}

	public void setVisits(List<VisitDto> visits) {
		this.visits = visits;
	}

	public Integer getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(Integer ownerId) {
		this.ownerId = ownerId;
	}

}
