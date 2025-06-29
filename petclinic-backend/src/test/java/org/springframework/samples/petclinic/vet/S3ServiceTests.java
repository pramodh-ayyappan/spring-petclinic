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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test class for the {@link S3Service}
 */
@ExtendWith(MockitoExtension.class)
class S3ServiceTests {

	@Mock
	private S3Client s3Client;

	private S3Service s3Service;

	@BeforeEach
	void setUp() {
		// Create S3Service with constructor that bypasses AWS credentials validation
		s3Service = new S3Service("test-key", "test-secret", "", "us-east-1", "test-bucket");
		// Inject mocked S3Client
		ReflectionTestUtils.setField(s3Service, "s3Client", s3Client);
		// Ensure awsCredentialsValid is true for tests
		ReflectionTestUtils.setField(s3Service, "awsCredentialsValid", true);
	}

	@Test
	void testPushJsonToS3Success() {
		// Given
		String key = "test.json";
		String jsonContent = "{\"test\": \"data\"}";

		// When
		boolean result = s3Service.pushJsonToS3(key, jsonContent);

		// Then
		assertTrue(result);
		verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
	}

	@Test
	void testPushJsonToS3Failure() {
		// Given
		String key = "test.json";
		String jsonContent = "{\"test\": \"data\"}";
		doThrow(new RuntimeException("Test exception")).when(s3Client)
			.putObject(any(PutObjectRequest.class), any(RequestBody.class));

		// When
		boolean result = s3Service.pushJsonToS3(key, jsonContent);

		// Then
		assertFalse(result);
	}

	@Test
	void testRemoveFromS3Success() {
		// Given
		String key = "test.json";

		// When
		boolean result = s3Service.removeFromS3(key);

		// Then
		assertTrue(result);
		verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
	}

	@Test
	void testRemoveFromS3Failure() {
		// Given
		String key = "test.json";
		doThrow(new RuntimeException("Test exception")).when(s3Client).deleteObject(any(DeleteObjectRequest.class));

		// When
		boolean result = s3Service.removeFromS3(key);

		// Then
		assertFalse(result);
	}

	@Test
	void testListFilesFromS3Success() {
		// Given
		List<S3Object> s3Objects = new ArrayList<>();
		S3Object obj1 = S3Object.builder().key("file1.json").build();
		S3Object obj2 = S3Object.builder().key("file2.json").build();
		s3Objects.add(obj1);
		s3Objects.add(obj2);

		ListObjectsV2Response response = ListObjectsV2Response.builder().contents(s3Objects).build();
		when(s3Client.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(response);

		// When
		List<String> result = s3Service.listFilesFromS3();

		// Then
		assertEquals(2, result.size());
		assertEquals("file1.json", result.get(0));
		assertEquals("file2.json", result.get(1));
	}

	@Test
	void testListFilesFromS3Failure() {
		// Given
		doThrow(new RuntimeException("Test exception")).when(s3Client).listObjectsV2(any(ListObjectsV2Request.class));

		// When
		List<String> result = s3Service.listFilesFromS3();

		// Then
		assertTrue(result.isEmpty());
	}

}
