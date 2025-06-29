package org.springframework.samples.petclinic.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for PetType API responses
 */
public class PetTypeDto {

	@JsonProperty("id")
	private Integer id;

	@JsonProperty("name")
	private String name;

	// Constructors
	public PetTypeDto() {
	}

	public PetTypeDto(Integer id, String name) {
		this.id = id;
		this.name = name;
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

}
