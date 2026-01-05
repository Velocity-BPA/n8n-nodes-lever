/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { LEVER_API_BASE_URLS, LEVER_WEBHOOK_EVENTS, LEVER_RESOURCES } from '../../nodes/Lever/constants';
import { getBaseUrl } from '../../nodes/Lever/transport';
import {
	buildQueryString,
	processArrayField,
	convertTimestampToIso,
	convertIsoToTimestamp,
	extractIdFromResponse,
} from '../../nodes/Lever/utils';
import type { ILeverCredentials } from '../../nodes/Lever/types/LeverTypes';

describe('Lever Node Constants', () => {
	describe('LEVER_API_BASE_URLS', () => {
		it('should have correct US base URL', () => {
			expect(LEVER_API_BASE_URLS.us).toBe('https://api.lever.co/v1');
		});

		it('should have correct EU base URL', () => {
			expect(LEVER_API_BASE_URLS.eu).toBe('https://api-eu.lever.co/v1');
		});
	});

	describe('LEVER_WEBHOOK_EVENTS', () => {
		it('should contain expected webhook events', () => {
			const eventValues = LEVER_WEBHOOK_EVENTS.map((e) => e.value);
			expect(eventValues).toContain('applicationCreated');
			expect(eventValues).toContain('candidateHired');
			expect(eventValues).toContain('candidateStageChange');
			expect(eventValues).toContain('candidateArchiveChange');
			expect(eventValues).toContain('candidateDeleted');
			expect(eventValues).toContain('interviewCreated');
			expect(eventValues).toContain('interviewUpdated');
			expect(eventValues).toContain('interviewDeleted');
		});

		it('should have 10 webhook events', () => {
			expect(LEVER_WEBHOOK_EVENTS).toHaveLength(10);
		});
	});

	describe('LEVER_RESOURCES', () => {
		it('should have all 11 resources', () => {
			expect(Object.keys(LEVER_RESOURCES)).toHaveLength(11);
			expect(LEVER_RESOURCES.opportunity).toBe('opportunities');
			expect(LEVER_RESOURCES.application).toBe('applications');
			expect(LEVER_RESOURCES.posting).toBe('postings');
			expect(LEVER_RESOURCES.feedback).toBe('feedback');
			expect(LEVER_RESOURCES.interview).toBe('interviews');
			expect(LEVER_RESOURCES.user).toBe('users');
			expect(LEVER_RESOURCES.stage).toBe('stages');
			expect(LEVER_RESOURCES.requisition).toBe('requisitions');
			expect(LEVER_RESOURCES.file).toBe('files');
			expect(LEVER_RESOURCES.note).toBe('notes');
			expect(LEVER_RESOURCES.webhook).toBe('webhooks');
		});
	});
});

describe('Lever Node Transport', () => {
	describe('getBaseUrl', () => {
		it('should return US URL for us region', () => {
			const credentials: ILeverCredentials = {
				authType: 'apiKey',
				apiKey: 'test-key',
				region: 'us',
			};
			expect(getBaseUrl(credentials)).toBe('https://api.lever.co/v1');
		});

		it('should return EU URL for eu region', () => {
			const credentials: ILeverCredentials = {
				authType: 'apiKey',
				apiKey: 'test-key',
				region: 'eu',
			};
			expect(getBaseUrl(credentials)).toBe('https://api-eu.lever.co/v1');
		});

		it('should default to US URL for undefined region', () => {
			const credentials: ILeverCredentials = {
				authType: 'apiKey',
				apiKey: 'test-key',
			} as ILeverCredentials;
			expect(getBaseUrl(credentials)).toBe('https://api.lever.co/v1');
		});
	});
});

describe('Lever Node Utils', () => {
	describe('buildQueryString', () => {
		it('should filter out undefined and empty values', () => {
			const input = {
				key1: 'value1',
				key2: undefined,
				key3: '',
				key4: 'value4',
			};
			const result = buildQueryString(input);
			expect(result).toEqual({ key1: 'value1', key4: 'value4' });
		});

		it('should handle empty object', () => {
			expect(buildQueryString({})).toEqual({});
		});

		it('should preserve numeric values', () => {
			const input = { limit: 100, offset: 0 };
			expect(buildQueryString(input)).toEqual({ limit: 100, offset: 0 });
		});
	});

	describe('processArrayField', () => {
		it('should convert comma-separated string to array', () => {
			expect(processArrayField('a,b,c')).toEqual(['a', 'b', 'c']);
		});

		it('should trim whitespace from items', () => {
			expect(processArrayField('a , b , c')).toEqual(['a', 'b', 'c']);
		});

		it('should return array as-is', () => {
			expect(processArrayField(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
		});

		it('should handle single value', () => {
			expect(processArrayField('single')).toEqual(['single']);
		});

		it('should return undefined for empty string', () => {
			expect(processArrayField('')).toBeUndefined();
		});
	});

	describe('convertTimestampToIso', () => {
		it('should convert Unix timestamp to ISO string', () => {
			const timestamp = 1704067200000; // 2024-01-01T00:00:00.000Z
			const result = convertTimestampToIso(timestamp);
			expect(result).toBe('2024-01-01T00:00:00.000Z');
		});

		it('should return undefined for undefined input', () => {
			expect(convertTimestampToIso(undefined)).toBeUndefined();
		});
	});

	describe('convertIsoToTimestamp', () => {
		it('should convert ISO string to Unix timestamp', () => {
			const iso = '2024-01-01T00:00:00.000Z';
			const result = convertIsoToTimestamp(iso);
			expect(result).toBe(1704067200000);
		});

		it('should return undefined for undefined input', () => {
			expect(convertIsoToTimestamp(undefined)).toBeUndefined();
		});
	});

	describe('extractIdFromResponse', () => {
		it('should extract id from data wrapper', () => {
			const response = { data: { id: '12345' } };
			expect(extractIdFromResponse(response)).toBe('12345');
		});

		it('should extract id from flat response', () => {
			const response = { id: '12345' };
			expect(extractIdFromResponse(response)).toBe('12345');
		});

		it('should return undefined when no id found', () => {
			const response = { name: 'test' };
			expect(extractIdFromResponse(response)).toBeUndefined();
		});
	});
});

describe('Lever Node Type Definitions', () => {
	it('should have valid credential interface structure', () => {
		const credentials: ILeverCredentials = {
			authType: 'apiKey',
			apiKey: 'test-api-key',
			region: 'us',
		};
		expect(credentials.authType).toBe('apiKey');
		expect(credentials.apiKey).toBe('test-api-key');
		expect(credentials.region).toBe('us');
	});

	it('should support OAuth2 credentials', () => {
		const credentials: ILeverCredentials = {
			authType: 'oauth2',
			accessToken: 'test-token',
			refreshToken: 'refresh-token',
			region: 'eu',
		};
		expect(credentials.authType).toBe('oauth2');
		expect(credentials.accessToken).toBe('test-token');
		expect(credentials.region).toBe('eu');
	});
});
