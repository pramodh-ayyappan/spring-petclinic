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
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

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
			// Check if profile is provided
			if (profile != null && !profile.trim().isEmpty()) {
				System.out.println("Using AWS profile: " + profile);
				this.s3Client = S3Client.builder()
					.region(Region.of(region))
					.credentialsProvider(ProfileCredentialsProvider.create(profile))
					.build();
			}
			// Check if access key and secret key are provided
			else if (accessKey != null && !accessKey.trim().isEmpty() && secretKey != null
					&& !secretKey.trim().isEmpty()) {
				System.out.println("Using AWS access key and secret key");
				AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
				this.s3Client = S3Client.builder()
					.region(Region.of(region))
					.credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
					.build();
			}
			// No credentials provided, use default credentials provider chain (for
			// ECS/EC2 IAM roles)
			else {
				System.out.println("No explicit AWS credentials provided. Using default credentials provider chain.");
				this.s3Client = S3Client.builder().region(Region.of(region)).build();
			}

			// Test connection to verify credentials by checking if the bucket exists
			// instead of listing all buckets which requires s3:ListAllMyBuckets
			// permission
			HeadBucketRequest headBucketRequest = HeadBucketRequest.builder().bucket(bucketName).build();
			this.s3Client.headBucket(headBucketRequest);
			System.out.println("Successfully connected to AWS S3 bucket: " + bucketName);
		}
		catch (Exception e) {
			this.awsCredentialsValid = false;
			System.out.println("Error initializing AWS S3 client: " + e.getMessage());
			System.out.println("S3 operations will be simulated.");
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
			System.out.println("Simulating S3 push operation for key: " + key);
			return true;
		}

		try {
			PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.contentType("application/json")
				.build();

			s3Client.putObject(putObjectRequest, RequestBody.fromString(jsonContent));
			return true;
		}
		catch (Exception e) {
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
			System.out.println("Simulating S3 remove operation for key: " + key);
			return true;
		}

		try {
			DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder().bucket(bucketName).key(key).build();

			s3Client.deleteObject(deleteObjectRequest);
			return true;
		}
		catch (Exception e) {
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
			System.out.println("Simulating S3 list operation");
			List<String> mockFiles = new ArrayList<>();
			mockFiles.add("mock-vets.json");
			mockFiles.add("mock-vets-backup.json");
			return mockFiles;
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

}
