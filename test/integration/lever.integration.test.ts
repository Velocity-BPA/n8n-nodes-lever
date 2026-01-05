/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for the Lever n8n node
 *
 * These tests verify the node's integration with the actual Lever API.
 * They require valid Lever API credentials to run.
 *
 * To run integration tests:
 * 1. Set the LEVER_API_KEY environment variable
 * 2. Optionally set LEVER_REGION (defaults to 'us')
 * 3. Run: npm test -- --testPathPattern=integration
 *
 * Note: These tests perform actual API calls and may affect your Lever account.
 * Use a sandbox/test environment when possible.
 */

describe('Lever Integration Tests', () => {
	const apiKey = process.env.LEVER_API_KEY;
	const region = process.env.LEVER_REGION || 'us';

	const skipMessage = 'Skipping integration tests: LEVER_API_KEY not set';

	describe('API Connection', () => {
		it('should verify API credentials are set', () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			expect(apiKey).toBeDefined();
			expect(typeof apiKey).toBe('string');
			expect(apiKey.length).toBeGreaterThan(0);
		});

		it('should have valid region setting', () => {
			expect(['us', 'eu']).toContain(region);
		});
	});

	describe('Opportunities Resource', () => {
		it.skip('should list opportunities', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test would make actual API call
			// This is a placeholder for manual testing
		});

		it.skip('should create and retrieve an opportunity', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test would:
			// 1. Create a new opportunity
			// 2. Retrieve it by ID
			// 3. Verify the data matches
			// 4. Clean up (archive/delete)
		});
	});

	describe('Postings Resource', () => {
		it.skip('should list job postings', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test for listing postings
		});
	});

	describe('Users Resource', () => {
		it.skip('should list users', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test for listing users
		});
	});

	describe('Stages Resource', () => {
		it.skip('should list pipeline stages', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test for listing stages
		});
	});

	describe('Webhooks Resource', () => {
		it.skip('should create and delete a webhook', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test would:
			// 1. Create a test webhook
			// 2. Verify it was created
			// 3. Delete the webhook
		});
	});

	describe('Rate Limiting', () => {
		it.skip('should handle rate limiting gracefully', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test would make rapid requests
			// to verify rate limit handling
		});
	});

	describe('Pagination', () => {
		it.skip('should paginate through large result sets', async () => {
			if (!apiKey) {
				console.warn(skipMessage);
				return;
			}
			// Integration test for pagination
		});
	});
});

describe('Lever Node Structure', () => {
	it('should export Lever node class', () => {
		const { Lever } = require('../../nodes/Lever/Lever.node');
		expect(Lever).toBeDefined();
		const instance = new Lever();
		expect(instance.description).toBeDefined();
		expect(instance.description.displayName).toBe('Lever');
	});

	it('should export LeverTrigger node class', () => {
		const { LeverTrigger } = require('../../nodes/Lever/LeverTrigger.node');
		expect(LeverTrigger).toBeDefined();
		const instance = new LeverTrigger();
		expect(instance.description).toBeDefined();
		expect(instance.description.displayName).toBe('Lever Trigger');
	});

	it('should have correct resource options', () => {
		const { Lever } = require('../../nodes/Lever/Lever.node');
		const instance = new Lever();
		const resourceProperty = instance.description.properties.find(
			(p: { name: string }) => p.name === 'resource'
		);
		expect(resourceProperty).toBeDefined();
		expect(resourceProperty.options).toHaveLength(11);
	});

	it('should have webhook methods in trigger', () => {
		const { LeverTrigger } = require('../../nodes/Lever/LeverTrigger.node');
		const instance = new LeverTrigger();
		expect(instance.webhookMethods).toBeDefined();
		expect(instance.webhookMethods.default).toBeDefined();
		expect(instance.webhookMethods.default.checkExists).toBeDefined();
		expect(instance.webhookMethods.default.create).toBeDefined();
		expect(instance.webhookMethods.default.delete).toBeDefined();
	});
});
