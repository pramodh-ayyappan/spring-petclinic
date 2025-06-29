package org.springframework.samples.petclinic.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Specialty API responses
 */
public class SpecialtyDto {

	@JsonProperty("id")
	private Integer id;

	@JsonProperty("name")
	private String name;

	// Constructors
	public SpecialtyDto() {
	}

	public SpecialtyDto(Integer id, String name) {
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
