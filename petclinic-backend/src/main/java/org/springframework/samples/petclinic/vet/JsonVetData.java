package org.springframework.samples.petclinic.vet;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for loading additional vet data from JSON file
 */
public class JsonVetData {

	@JsonProperty("additionalVets")
	private List<JsonVet> additionalVets;

	public List<JsonVet> getAdditionalVets() {
		return additionalVets;
	}

	public void setAdditionalVets(List<JsonVet> additionalVets) {
		this.additionalVets = additionalVets;
	}

	public static class JsonVet {

		@JsonProperty("id")
		private Integer id;

		@JsonProperty("firstName")
		private String firstName;

		@JsonProperty("lastName")
		private String lastName;

		@JsonProperty("specialties")
		private List<JsonSpecialty> specialties;

		// Constructors
		public JsonVet() {
		}

		// Getters and Setters
		public Integer getId() {
			return id;
		}

		public void setId(Integer id) {
			this.id = id;
		}

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

		public List<JsonSpecialty> getSpecialties() {
			return specialties;
		}

		public void setSpecialties(List<JsonSpecialty> specialties) {
			this.specialties = specialties;
		}

	}

	public static class JsonSpecialty {

		@JsonProperty("id")
		private Integer id;

		@JsonProperty("name")
		private String name;

		// Constructors
		public JsonSpecialty() {
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

}
