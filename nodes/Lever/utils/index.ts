/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Convert an array of objects to n8n execution data format
 */
export function toExecutionData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({ json: item }));
	}
	return [{ json: data }];
}

/**
 * Process expand parameter for API requests
 */
export function processExpandParam(expand: string[]): string {
	return expand.join(',');
}

/**
 * Convert timestamp to ISO string
 */
export function timestampToIso(timestamp: number): string {
	return new Date(timestamp).toISOString();
}

/**
 * Convert ISO string to timestamp
 */
export function isoToTimestamp(isoString: string): number {
	return new Date(isoString).getTime();
}

/**
 * Build query string parameters from options
 */
export function buildQueryString(options: IDataObject): IDataObject {
	const qs: IDataObject = {};

	for (const [key, value] of Object.entries(options)) {
		if (value !== undefined && value !== null && value !== '') {
			if (Array.isArray(value)) {
				if (value.length > 0) {
					qs[key] = value.join(',');
				}
			} else {
				qs[key] = value;
			}
		}
	}

	return qs;
}

/**
 * Clean object by removing undefined and null values
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			cleaned[key] = value;
		}
	}

	return cleaned;
}

/**
 * Parse tags from various formats
 */
export function parseTags(tags: string | string[]): string[] {
	if (Array.isArray(tags)) {
		return tags;
	}
	return tags.split(',').map((tag) => tag.trim());
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'An unknown error occurred';
}

/**
 * Validate UUID format
 */
export function isValidUuid(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}

/**
 * Validate Lever ID format (not always UUID)
 */
export function isValidLeverId(id: string): boolean {
	// Lever IDs can be UUIDs or alphanumeric strings
	return /^[a-f0-9-]+$/i.test(id) && id.length >= 8;
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
	try {
		return JSON.parse(jsonString) as T;
	} catch {
		return fallback;
	}
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends IDataObject>(target: T, source: Partial<T>): T {
	const output = { ...target };

	for (const key of Object.keys(source)) {
		const sourceValue = source[key as keyof T];
		const targetValue = target[key as keyof T];

		if (isObject(sourceValue) && isObject(targetValue)) {
			output[key as keyof T] = deepMerge(
				targetValue as IDataObject,
				sourceValue as IDataObject,
			) as T[keyof T];
		} else if (sourceValue !== undefined) {
			output[key as keyof T] = sourceValue as T[keyof T];
		}
	}

	return output;
}

/**
 * Check if value is a plain object
 */
function isObject(item: unknown): item is IDataObject {
	return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			const delay = baseDelay * Math.pow(2, attempt);
			await sleep(delay);
		}
	}

	throw lastError;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Format phone number (basic cleanup)
 */
export function formatPhoneNumber(phone: string): string {
	return phone.replace(/[^\d+]/g, '');
}

/**
 * Capitalize first letter of string
 */
export function capitalizeFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Process array field from comma-separated string or array
 */
export function processArrayField(value: string | string[] | undefined): string[] | undefined {
	if (!value) return undefined;
	if (Array.isArray(value)) return value;
	if (typeof value === 'string' && value.trim() === '') return undefined;
	return value.split(',').map((item) => item.trim());
}

/**
 * Convert Unix timestamp to ISO string
 */
export function convertTimestampToIso(timestamp: number | undefined): string | undefined {
	if (timestamp === undefined) return undefined;
	return new Date(timestamp).toISOString();
}

/**
 * Convert ISO string to Unix timestamp
 */
export function convertIsoToTimestamp(isoString: string | undefined): number | undefined {
	if (isoString === undefined) return undefined;
	return new Date(isoString).getTime();
}

/**
 * Extract ID from Lever API response
 */
export function extractIdFromResponse(response: IDataObject): string | undefined {
	if (response.data && typeof response.data === 'object') {
		const data = response.data as IDataObject;
		return data.id as string | undefined;
	}
	return response.id as string | undefined;
}
