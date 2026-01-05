/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString, cleanObject } from '../../utils';

export const feedbackOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['feedback'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Submit feedback for a candidate',
				action: 'Create feedback',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get feedback details',
				action: 'Get feedback',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many feedback submissions',
				action: 'Get many feedback',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update feedback',
				action: 'Update feedback',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete feedback',
				action: 'Delete feedback',
			},
		],
		default: 'get',
	},
];

export const feedbackFields: INodeProperties[] = [
	// ----------------------------------
	//         feedback:create
	// ----------------------------------
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['create', 'getAll'],
			},
		},
		description: 'The ID of the opportunity (candidate)',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['create'],
			},
		},
		description: 'The ID of the user submitting feedback',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Base Template ID',
				name: 'baseTemplateId',
				type: 'string',
				default: '',
				description: 'ID of the feedback form template to use',
			},
			{
				displayName: 'Completed At',
				name: 'completedAt',
				type: 'dateTime',
				default: '',
				description: 'When the feedback was completed',
			},
			{
				displayName: 'Fields (JSON)',
				name: 'fields',
				type: 'json',
				default: '[]',
				description: 'Feedback form field values as JSON array',
			},
			{
				displayName: 'Interview ID',
				name: 'interview',
				type: 'string',
				default: '',
				description: 'ID of the associated interview',
			},
			{
				displayName: 'Panel ID',
				name: 'panel',
				type: 'string',
				default: '',
				description: 'ID of the interview panel',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Feedback text/comments',
			},
		],
	},

	// ----------------------------------
	//         feedback:get
	// ----------------------------------
	{
		displayName: 'Feedback ID',
		name: 'feedbackId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the feedback',
	},

	// ----------------------------------
	//         feedback:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Deleted',
				name: 'include_deleted',
				type: 'boolean',
				default: false,
				description: 'Whether to include deleted feedback',
			},
			{
				displayName: 'Interview ID',
				name: 'interview_id',
				type: 'string',
				default: '',
				description: 'Filter by interview ID',
			},
			{
				displayName: 'Panel ID',
				name: 'panel_id',
				type: 'string',
				default: '',
				description: 'Filter by panel ID',
			},
		],
	},

	// ----------------------------------
	//         feedback:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Completed At',
				name: 'completedAt',
				type: 'dateTime',
				default: '',
				description: 'When the feedback was completed',
			},
			{
				displayName: 'Fields (JSON)',
				name: 'fields',
				type: 'json',
				default: '[]',
				description: 'Feedback form field values as JSON array',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Feedback text/comments',
			},
		],
	},
];

export async function executeFeedbackOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const userId = this.getNodeParameter('userId', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				user: userId,
			};

			// Process fields
			if (additionalFields.fields) {
				try {
					body.fields =
						typeof additionalFields.fields === 'string'
							? JSON.parse(additionalFields.fields)
							: additionalFields.fields;
				} catch {
					throw new Error('Invalid JSON in Fields parameter');
				}
				delete additionalFields.fields;
			}

			// Process timestamp
			if (additionalFields.completedAt) {
				body.completedAt = new Date(additionalFields.completedAt as string).getTime();
				delete additionalFields.completedAt;
			}

			// Copy remaining fields
			Object.assign(body, additionalFields);

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				`/opportunities/${opportunityId}/feedback`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'get': {
			const feedbackId = this.getNodeParameter('feedbackId', i) as string;

			responseData = (await leverApiRequest.call(this, 'GET', `/feedback/${feedbackId}`)) as IDataObject;
			break;
		}

		case 'getAll': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const qs = buildQueryString(filters);

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					`/opportunities/${opportunityId}/feedback`,
					{},
					qs,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					`/opportunities/${opportunityId}/feedback`,
					{},
					qs,
					limit,
				);
			}
			break;
		}

		case 'update': {
			const feedbackId = this.getNodeParameter('feedbackId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			// Process fields
			if (updateFields.fields) {
				try {
					body.fields =
						typeof updateFields.fields === 'string'
							? JSON.parse(updateFields.fields)
							: updateFields.fields;
				} catch {
					throw new Error('Invalid JSON in Fields parameter');
				}
				delete updateFields.fields;
			}

			// Process timestamp
			if (updateFields.completedAt) {
				body.completedAt = new Date(updateFields.completedAt as string).getTime();
				delete updateFields.completedAt;
			}

			// Copy remaining fields
			Object.assign(body, updateFields);

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/feedback/${feedbackId}`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'delete': {
			const feedbackId = this.getNodeParameter('feedbackId', i) as string;

			responseData = (await leverApiRequest.call(this, 'DELETE', `/feedback/${feedbackId}`)) as IDataObject;
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
