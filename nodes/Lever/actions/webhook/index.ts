/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { LEVER_WEBHOOK_EVENTS } from '../../constants';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a webhook',
				action: 'Create a webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many webhooks',
				action: 'Get many webhooks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook',
				action: 'Update a webhook',
			},
		],
		default: 'getAll',
	},
];

export const webhookFields: INodeProperties[] = [
	// ----------------------------------
	//         webhook: create
	// ----------------------------------
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://example.com/webhook',
		description: 'The URL that will receive webhook events',
	},
	{
		displayName: 'Event',
		name: 'event',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: LEVER_WEBHOOK_EVENTS.map((event) => ({
			name: event.name,
			value: event.value,
		})),
		default: 'candidateStageChange',
		description: 'The type of event to trigger the webhook',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Signature Token',
				name: 'signatureToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret token used to sign webhook payloads for verification',
			},
		],
	},

	// ----------------------------------
	//         webhook: update / delete
	// ----------------------------------
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the webhook',
	},

	// ----------------------------------
	//         webhook: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook is enabled',
			},
			{
				displayName: 'Signature Token',
				name: 'signatureToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret token used to sign webhook payloads for verification',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL that will receive webhook events',
			},
		],
	},

	// ----------------------------------
	//         webhook: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

export async function executeWebhookOperations(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const url = this.getNodeParameter('url', index) as string;
		const event = this.getNodeParameter('event', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			url,
			event,
		};

		if (additionalFields.signatureToken) {
			body.signatureToken = additionalFields.signatureToken;
		}

		const response = await leverApiRequest.call(this, 'POST', '/webhooks', body);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response as IDataObject),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		let response: IDataObject[];

		if (returnAll) {
			response = await leverApiRequestAllItems.call(this, 'GET', '/webhooks');
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			response = await leverApiRequestAllItems.call(this, 'GET', '/webhooks', {}, {}, limit);
		}

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'update') {
		const webhookId = this.getNodeParameter('webhookId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.url !== undefined) {
			body.url = updateFields.url;
		}

		if (updateFields.enabled !== undefined) {
			body.enabled = updateFields.enabled;
		}

		if (updateFields.signatureToken !== undefined) {
			body.signatureToken = updateFields.signatureToken;
		}

		const response = await leverApiRequest.call(this, 'PUT', `/webhooks/${webhookId}`, body);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response as IDataObject),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'delete') {
		const webhookId = this.getNodeParameter('webhookId', index) as string;

		await leverApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray({ success: true, webhookId }),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	return returnData;
}
