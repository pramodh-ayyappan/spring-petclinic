package org.springframework.samples.petclinic.api.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Visit API responses
 */
public class VisitDto {

	@JsonProperty("id")
	private Integer id;

	@JsonProperty("date")
	private LocalDate date;

	@JsonProperty("description")
	private String description;

	@JsonProperty("petId")
	private Integer petId;

	// Constructors
	public VisitDto() {
	}

	public VisitDto(Integer id, LocalDate date, String description, Integer petId) {
		this.id = id;
		this.date = date;
		this.description = description;
		this.petId = petId;
	}

	// Getters and Setters
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Integer getPetId() {
		return petId;
	}

	public void setPetId(Integer petId) {
		this.petId = petId;
	}

}
