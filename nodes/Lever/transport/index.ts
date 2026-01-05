/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { LEVER_API_BASE_URLS, LEVER_PAGINATION } from '../constants';
import type { ILeverCredentials, ILeverPaginatedResponse } from '../types/LeverTypes';

/**
 * Get the base URL based on the region setting
 */
export function getBaseUrl(credentials: ILeverCredentials): string {
	return credentials.region === 'eu' ? LEVER_API_BASE_URLS.eu : LEVER_API_BASE_URLS.us;
}

/**
 * Make an authenticated request to the Lever API
 */
export async function leverApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	options: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = (await this.getCredentials('leverApi')) as unknown as ILeverCredentials;
	const baseUrl = getBaseUrl(credentials);

	const requestOptions: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		qs,
		body,
		json: true,
		returnFullResponse: false,
	};

	// Set up authentication
	if (credentials.authType === 'apiKey') {
		requestOptions.auth = {
			username: credentials.apiKey || '',
			password: '',
		};
	} else if (credentials.authType === 'oauth2') {
		requestOptions.auth = {
			username: credentials.accessToken || '',
			password: '',
		};
	}

	// Handle multipart form data for file uploads
	if (options.formData) {
		delete requestOptions.body;
		requestOptions.body = options.formData;
	}

	// Don't send empty body for GET/DELETE requests
	if (method === 'GET' || method === 'DELETE') {
		delete requestOptions.body;
	}

	// Don't send empty query string
	if (Object.keys(qs).length === 0) {
		delete requestOptions.qs;
	}

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Lever API Error: ${(error as Error).message}`,
		});
	}
}

/**
 * Make an authenticated request and return all pages of results
 */
export async function leverApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData: ILeverPaginatedResponse<IDataObject>;

	qs.limit = LEVER_PAGINATION.maxLimit;

	do {
		responseData = (await leverApiRequest.call(
			this,
			method,
			endpoint,
			body,
			qs,
		)) as unknown as ILeverPaginatedResponse<IDataObject>;

		if (responseData.data) {
			returnData.push(...responseData.data);
		}

		if (responseData.next) {
			qs.offset = responseData.next;
		}

		// Check if we've reached the requested limit
		if (limit && returnData.length >= limit) {
			return returnData.slice(0, limit);
		}
	} while (responseData.hasNext);

	return returnData;
}

/**
 * Handle rate limiting with exponential backoff
 */
export async function leverApiRequestWithRetry(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	options: IDataObject = {},
	maxRetries = 3,
): Promise<IDataObject | IDataObject[]> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await leverApiRequest.call(this, method, endpoint, body, qs, options);
		} catch (error) {
			lastError = error as Error;

			// Check if it's a rate limit error (429)
			if ((error as NodeApiError).httpCode === '429') {
				const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			// For other errors, throw immediately
			throw error;
		}
	}

	throw lastError;
}

/**
 * Upload a file to Lever
 */
export async function leverApiUploadFile(
	this: IExecuteFunctions,
	opportunityId: string,
	fileBuffer: Buffer,
	fileName: string,
	mimeType: string,
): Promise<IDataObject> {
	const credentials = (await this.getCredentials('leverApi')) as unknown as ILeverCredentials;
	const baseUrl = getBaseUrl(credentials);

	const formData = {
		file: {
			value: fileBuffer,
			options: {
				filename: fileName,
				contentType: mimeType,
			},
		},
	};

	const requestOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/opportunities/${opportunityId}/files`,
		body: formData,
		json: true,
	};

	if (credentials.authType === 'apiKey') {
		requestOptions.auth = {
			username: credentials.apiKey || '',
			password: '',
		};
	} else if (credentials.authType === 'oauth2') {
		requestOptions.auth = {
			username: credentials.accessToken || '',
			password: '',
		};
	}

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Lever File Upload Error: ${(error as Error).message}`,
		});
	}
}

/**
 * Download a file from Lever
 */
export async function leverApiDownloadFile(
	this: IExecuteFunctions,
	opportunityId: string,
	fileId: string,
): Promise<Buffer> {
	const credentials = (await this.getCredentials('leverApi')) as unknown as ILeverCredentials;
	const baseUrl = getBaseUrl(credentials);

	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		url: `${baseUrl}/opportunities/${opportunityId}/files/${fileId}/download`,
		encoding: 'arraybuffer',
		returnFullResponse: false,
	};

	if (credentials.authType === 'apiKey') {
		requestOptions.auth = {
			username: credentials.apiKey || '',
			password: '',
		};
	} else if (credentials.authType === 'oauth2') {
		requestOptions.auth = {
			username: credentials.accessToken || '',
			password: '',
		};
	}

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		return Buffer.from(response as ArrayBuffer);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Lever File Download Error: ${(error as Error).message}`,
		});
	}
}
