package org.springframework.samples.petclinic.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Base64;

/**
 * Service for handling admin authentication
 */
@Service
public class AdminAuthService {

	@Value("${petclinic.admin.username}")
	private String adminUsername;

	@Value("${petclinic.admin.password}")
	private String adminPassword;

	/**
	 * Validate admin credentials using Basic Authentication
	 * @param authHeader Authorization header value
	 * @return true if valid admin credentials
	 */
	public boolean validateAdminAuth(String authHeader) {
		if (authHeader == null || !authHeader.startsWith("Basic ")) {
			return false;
		}

		try {
			String base64Credentials = authHeader.substring("Basic ".length());
			byte[] credentialsBytes = Base64.getDecoder().decode(base64Credentials);
			String credentials = new String(credentialsBytes);

			String[] parts = credentials.split(":", 2);
			if (parts.length != 2) {
				return false;
			}

			String username = parts[0];
			String password = parts[1];

			return adminUsername.equals(username) && adminPassword.equals(password);
		}
		catch (Exception e) {
			return false;
		}
	}

	/**
	 * Create a Basic Auth header value for the configured admin credentials
	 * @return Basic Auth header value
	 */
	public String createBasicAuthHeader() {
		String credentials = adminUsername + ":" + adminPassword;
		return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());
	}

	/**
	 * Get admin username (for UI display)
	 * @return admin username
	 */
	public String getAdminUsername() {
		return adminUsername;
	}

}
