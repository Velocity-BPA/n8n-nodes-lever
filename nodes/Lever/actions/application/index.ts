/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString } from '../../utils';
import { LEVER_APPLICATION_TYPES } from '../../constants';

export const applicationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['application'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new application for an opportunity',
				action: 'Create an application',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an application',
				action: 'Get an application',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many applications',
				action: 'Get many applications',
			},
		],
		default: 'get',
	},
];

export const applicationFields: INodeProperties[] = [
	// ----------------------------------
	//         application:create
	// ----------------------------------
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['create', 'getAll'],
			},
		},
		description: 'The ID of the opportunity',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: LEVER_APPLICATION_TYPES.map((t) => ({ name: t.name, value: t.value })),
		default: 'posting',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['create'],
			},
		},
		description: 'The type of application',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Comments',
				name: 'comments',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Comments or notes about the application',
			},
			{
				displayName: 'Posting ID',
				name: 'posting',
				type: 'string',
				default: '',
				description: 'The job posting ID for this application',
			},
			{
				displayName: 'Referrer ID',
				name: 'referrer',
				type: 'string',
				default: '',
				description: 'User ID of the referrer (for referral applications)',
			},
			{
				displayName: 'Requisition ID',
				name: 'requisitionId',
				type: 'string',
				default: '',
				description: 'The requisition ID for this application',
			},
			{
				displayName: 'User ID',
				name: 'user',
				type: 'string',
				default: '',
				description: 'User ID who created the application',
			},
		],
	},

	// ----------------------------------
	//         application:get
	// ----------------------------------
	{
		displayName: 'Application ID',
		name: 'applicationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['get'],
			},
		},
		description: 'The ID of the application',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				options: [
					{ name: 'Opportunity', value: 'opportunity' },
					{ name: 'Posting', value: 'posting' },
					{ name: 'User', value: 'user' },
				],
				default: [],
				description: 'Related objects to include in the response',
			},
		],
	},

	// ----------------------------------
	//         application:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['application'],
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
				resource: ['application'],
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
				resource: ['application'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				options: [
					{ name: 'Opportunity', value: 'opportunity' },
					{ name: 'Posting', value: 'posting' },
					{ name: 'User', value: 'user' },
				],
				default: [],
				description: 'Related objects to include',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: LEVER_APPLICATION_TYPES.map((t) => ({ name: t.name, value: t.value })),
				default: '',
				description: 'Filter by application type',
			},
		],
	},
];

export async function executeApplicationOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const type = this.getNodeParameter('type', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = { type };

			// Copy additional fields
			const fields = ['comments', 'posting', 'referrer', 'requisitionId', 'user'];
			for (const field of fields) {
				if (additionalFields[field]) {
					body[field] = additionalFields[field];
				}
			}

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				`/opportunities/${opportunityId}/applications`,
				body,
			)) as IDataObject;
			break;
		}

		case 'get': {
			const applicationId = this.getNodeParameter('applicationId', i) as string;
			const options = this.getNodeParameter('options', i) as IDataObject;
			const qs = buildQueryString(options);

			if (options.expand && Array.isArray(options.expand) && options.expand.length > 0) {
				qs.expand = (options.expand as string[]).join(',');
			}

			responseData = (await leverApiRequest.call(
				this,
				'GET',
				`/applications/${applicationId}`,
				{},
				qs,
			)) as IDataObject;
			break;
		}

		case 'getAll': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const qs = buildQueryString(filters);

			if (filters.expand && Array.isArray(filters.expand) && filters.expand.length > 0) {
				qs.expand = (filters.expand as string[]).join(',');
			}

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					`/opportunities/${opportunityId}/applications`,
					{},
					qs,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					`/opportunities/${opportunityId}/applications`,
					{},
					qs,
					limit,
				);
			}
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
