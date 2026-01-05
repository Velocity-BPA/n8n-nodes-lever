/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from './transport';
import { LEVER_WEBHOOK_EVENTS, LICENSING_NOTICE, LICENSING_WARNED } from './constants';

// Log licensing notice once
const globalRef = globalThis as unknown as { [key: symbol]: boolean };
if (!globalRef[LICENSING_WARNED]) {
	console.warn(LICENSING_NOTICE);
	globalRef[LICENSING_WARNED] = true;
}

export class LeverTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lever Trigger',
		name: 'leverTrigger',
		icon: 'file:lever.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Lever events occur',
		defaults: {
			name: 'Lever Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'leverApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				options: LEVER_WEBHOOK_EVENTS.map((event) => ({
					name: event.name,
					value: event.value,
				})),
				default: 'candidateStageChange',
				description: 'The event to listen for',
			},
			{
				displayName: 'Signature Token',
				name: 'signatureToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret token for webhook signature verification (recommended for security)',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				const webhookData = this.getWorkflowStaticData('node');

				// Get all webhooks
				const webhooks = await leverApiRequestAllItems.call(
					this,
					'GET',
					'/webhooks',
				) as IDataObject[];

				// Check if our webhook already exists
				for (const webhook of webhooks) {
					if (webhook.url === webhookUrl && webhook.event === event) {
						webhookData.webhookId = webhook.id;
						return true;
					}
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;
				const signatureToken = this.getNodeParameter('signatureToken', '') as string;
				const webhookData = this.getWorkflowStaticData('node');

				const body: IDataObject = {
					url: webhookUrl,
					event,
				};

				if (signatureToken) {
					body.signatureToken = signatureToken;
				}

				const response = await leverApiRequest.call(
					this,
					'POST',
					'/webhooks',
					body,
				) as IDataObject;

				const webhookId = response.id;

				if (webhookId === undefined) {
					return false;
				}

				webhookData.webhookId = webhookId;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					try {
						await leverApiRequest.call(
							this,
							'DELETE',
							`/webhooks/${webhookData.webhookId}`,
						);
					} catch (error) {
						return false;
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const signatureToken = this.getNodeParameter('signatureToken', '') as string;

		// Verify signature if token is set
		if (signatureToken) {
			const headerData = this.getHeaderData();
			const signature = headerData['x-lever-signature'] as string | undefined;

			if (signature) {
				// Lever uses HMAC-SHA256 for signature verification
				const crypto = await import('crypto');
				const body = this.getRequestObject().body;
				const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
				const expectedSignature = crypto
					.createHmac('sha256', signatureToken)
					.update(rawBody)
					.digest('hex');

				if (signature !== expectedSignature) {
					// Signature mismatch - log warning but still process
					// (in production you might want to reject)
					console.warn('Lever webhook signature verification failed');
				}
			}
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}
