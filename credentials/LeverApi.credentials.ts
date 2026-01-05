/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LeverApi implements ICredentialType {
	name = 'leverApi';
	displayName = 'Lever API';
	documentationUrl = 'https://hire.lever.co/developer/documentation';
	properties: INodeProperties[] = [
		{
			displayName: 'Authentication Type',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'API Key',
					value: 'apiKey',
				},
				{
					name: 'OAuth2',
					value: 'oauth2',
				},
			],
			default: 'apiKey',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			displayOptions: {
				show: {
					authType: ['apiKey'],
				},
			},
			description: 'The API key for your Lever account. Found in Settings > Integrations > API Credentials.',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'United States (US)',
					value: 'us',
				},
				{
					name: 'European Union (EU)',
					value: 'eu',
				},
			],
			default: 'us',
			description: 'The region where your Lever account is hosted',
		},
		{
			displayName: 'OAuth2 - Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authType: ['oauth2'],
				},
			},
			description: 'The client ID for your OAuth2 application',
		},
		{
			displayName: 'OAuth2 - Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authType: ['oauth2'],
				},
			},
			description: 'The client secret for your OAuth2 application',
		},
		{
			displayName: 'OAuth2 - Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authType: ['oauth2'],
				},
			},
			description: 'The access token obtained from OAuth2 flow',
		},
		{
			displayName: 'OAuth2 - Refresh Token',
			name: 'refreshToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authType: ['oauth2'],
				},
			},
			description: 'The refresh token obtained from OAuth2 flow',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.authType === "apiKey" ? $credentials.apiKey : $credentials.accessToken}}',
				password: '',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.region === "eu" ? "https://api-eu.lever.co/v1" : "https://api.lever.co/v1"}}',
			url: '/users',
			qs: {
				limit: 1,
			},
		},
	};
}
