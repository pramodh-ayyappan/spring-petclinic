/*
 * Copyright 2012-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.samples.petclinic.vet;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for AWS S3 operations related to Veterinarians data.
 */
@Service
public class S3Service {

	private S3Client s3Client;

	private final String bucketName;

	private boolean awsCredentialsValid = true;

	public S3Service(@Value("${aws.accessKeyId:}") String accessKey, @Value("${aws.secretKey:}") String secretKey,
			@Value("${aws.profile:}") String profile, @Value("${aws.region:us-east-1}") String region,
			@Value("${aws.s3.bucket:petclinic-vets}") String bucketName) {

		this.bucketName = bucketName;

		try {
			AwsCredentialsProvider credentialsProvider;

			// Check if profile is provided
			if (profile != null && !profile.trim().isEmpty()) {
				System.out.println("Using AWS profile: " + profile);
				credentialsProvider = ProfileCredentialsProvider.create(profile);
			}
			// Check if access key and secret key are provided
			else if (accessKey != null && !accessKey.trim().isEmpty() && secretKey != null
					&& !secretKey.trim().isEmpty()) {
				System.out.println("Using AWS access key and secret key");
				AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
				credentialsProvider = StaticCredentialsProvider.create(awsCredentials);
			}
			// No explicit credentials provided, use default credentials provider chain
			// This supports: Environment variables, Java system properties, Web Identity
			// Token (IRSA),
			// IAM roles for EC2/ECS, and credential profiles
			else {
				System.out.println("No explicit AWS credentials provided. Using default credentials provider chain.");
				System.out.println(
						"This supports: Environment variables, IRSA (Web Identity Token), IAM roles, and credential profiles.");
				credentialsProvider = DefaultCredentialsProvider.create();
			}

			this.s3Client = S3Client.builder()
				.region(Region.of(region))
				.credentialsProvider(credentialsProvider)
				.build();

			// Test connection to verify credentials by checking if the bucket exists
			// instead of listing all buckets which requires s3:ListAllMyBuckets
			// permission
			HeadBucketRequest headBucketRequest = HeadBucketRequest.builder().bucket(bucketName).build();
			this.s3Client.headBucket(headBucketRequest);
			System.out.println("Successfully connected to AWS S3 bucket: " + bucketName + " using region: " + region);
		}
		catch (Exception e) {
			this.awsCredentialsValid = false;
			System.out.println("Error initializing AWS S3 client: " + e.getMessage());
			System.out.println("S3 operations are unavailable. Please check AWS credentials and S3 configuration.");

			// Log helpful debugging information
			System.out.println("Debug info:");
			System.out.println("- AWS_REGION: " + System.getenv("AWS_REGION"));
			System.out.println("- AWS_ROLE_ARN: " + System.getenv("AWS_ROLE_ARN"));
			System.out.println("- AWS_WEB_IDENTITY_TOKEN_FILE: " + System.getenv("AWS_WEB_IDENTITY_TOKEN_FILE"));
			System.out.println("- S3 Bucket: " + bucketName);
		}
	}

	/**
	 * Push JSON data to S3 bucket.
	 * @param key The key (filename) to use in S3
	 * @param jsonContent The JSON content to upload
	 * @return true if successful, false otherwise
	 */
	public boolean pushJsonToS3(String key, String jsonContent) {
		if (!awsCredentialsValid) {
			System.out.println("AWS credentials not configured. Cannot upload to S3: " + key);
			return false;
		}

		try {
			PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.contentType("application/json")
				.build();

			s3Client.putObject(putObjectRequest, RequestBody.fromString(jsonContent));
			System.out.println("Successfully uploaded to S3: " + key);
			return true;
		}
		catch (Exception e) {
			System.out.println("Failed to upload to S3: " + key + " - " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * Remove a file from S3 bucket.
	 * @param key The key (filename) to remove
	 * @return true if successful, false otherwise
	 */
	public boolean removeFromS3(String key) {
		if (!awsCredentialsValid) {
			System.out.println("AWS credentials not configured. Cannot remove from S3: " + key);
			return false;
		}

		try {
			DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder().bucket(bucketName).key(key).build();

			s3Client.deleteObject(deleteObjectRequest);
			System.out.println("Successfully removed from S3: " + key);
			return true;
		}
		catch (Exception e) {
			System.out.println("Failed to remove from S3: " + key + " - " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * List all files in the S3 bucket.
	 * @return List of S3 object keys (filenames)
	 */
	public List<String> listFilesFromS3() {
		if (!awsCredentialsValid) {
			System.out.println("AWS credentials not configured. S3 operations are unavailable.");
			return new ArrayList<>();
		}

		try {
			ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder().bucket(bucketName).build();

			ListObjectsV2Response listObjectsResponse = s3Client.listObjectsV2(listObjectsRequest);
			return listObjectsResponse.contents().stream().map(S3Object::key).collect(Collectors.toList());
		}
		catch (Exception e) {
			e.printStackTrace();
			return new ArrayList<>();
		}
	}

	/**
	 * List all files in the S3 bucket with detailed metadata.
	 * @return List of S3FileInfo with metadata
	 */
	public List<S3FileInfo> listFilesWithMetadata() {
		if (!awsCredentialsValid) {
			System.out.println("AWS credentials not configured. S3 operations are unavailable.");
			return new ArrayList<>();
		}

		try {
			ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder().bucket(bucketName).build();

			ListObjectsV2Response listObjectsResponse = s3Client.listObjectsV2(listObjectsRequest);
			return listObjectsResponse.contents()
				.stream()
				.map(obj -> new S3FileInfo(obj.key(), obj.size(), obj.lastModified()))
				.collect(Collectors.toList());
		}
		catch (Exception e) {
			e.printStackTrace();
			return new ArrayList<>();
		}
	}

	/**
	 * Get S3 bucket name for reference
	 * @return bucket name
	 */
	public String getBucketName() {
		return bucketName;
	}

	/**
	 * Check if AWS credentials are valid
	 * @return true if credentials are valid, false if simulating
	 */
	public boolean isAwsCredentialsValid() {
		return awsCredentialsValid;
	}

	/**
	 * Simple class to hold S3 file information
	 */
	public static class S3FileInfo {

		private String key;

		private Long size;

		private Instant lastModified;

		public S3FileInfo(String key, Long size, Instant lastModified) {
			this.key = key;
			this.size = size;
			this.lastModified = lastModified;
		}

		public String getKey() {
			return key;
		}

		public void setKey(String key) {
			this.key = key;
		}

		public Long getSize() {
			return size;
		}

		public void setSize(Long size) {
			this.size = size;
		}

		public Instant getLastModified() {
			return lastModified;
		}

		public void setLastModified(Instant lastModified) {
			this.lastModified = lastModified;
		}

	}

}
