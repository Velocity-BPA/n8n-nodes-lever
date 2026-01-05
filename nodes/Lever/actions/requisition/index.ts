/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString, cleanObject } from '../../utils';
import { LEVER_REQUISITION_STATUSES } from '../../constants';

export const requisitionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['requisition'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new requisition',
				action: 'Create a requisition',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a requisition',
				action: 'Get a requisition',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many requisitions',
				action: 'Get many requisitions',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a requisition',
				action: 'Update a requisition',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a requisition',
				action: 'Delete a requisition',
			},
		],
		default: 'get',
	},
];

export const requisitionFields: INodeProperties[] = [
	// ----------------------------------
	//         requisition:create
	// ----------------------------------
	{
		displayName: 'Requisition Code',
		name: 'requisitionCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['requisition'],
				operation: ['create'],
			},
		},
		description: 'Unique requisition code/identifier',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: LEVER_REQUISITION_STATUSES.map((s) => ({ name: s.name, value: s.value })),
		required: true,
		default: 'draft',
		displayOptions: {
			show: {
				resource: ['requisition'],
				operation: ['create'],
			},
		},
		description: 'Status of the requisition',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['requisition'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Backfill',
				name: 'backfill',
				type: 'boolean',
				default: false,
				description: 'Whether this is a backfill position',
			},
			{
				displayName: 'Compensation Max',
				name: 'compensationMax',
				type: 'number',
				default: 0,
				description: 'Maximum compensation',
			},
			{
				displayName: 'Compensation Min',
				name: 'compensationMin',
				type: 'number',
				default: 0,
				description: 'Minimum compensation',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Compensation currency (ISO 4217)',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Employment Status',
				name: 'employmentStatus',
				type: 'string',
				default: '',
				description: 'Employment status (e.g., Full-time)',
			},
			{
				displayName: 'Headcount Total',
				name: 'headcountTotal',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Total open positions',
			},
			{
				displayName: 'Hiring Manager ID',
				name: 'hiringManager',
				type: 'string',
				default: '',
				description: 'User ID of the hiring manager',
			},
			{
				displayName: 'Internal Notes',
				name: 'internalNotes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Internal notes about the requisition',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Job location',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Requisition name/title',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'User ID of the requisition owner',
			},
			{
				displayName: 'Pay Interval',
				name: 'interval',
				type: 'options',
				options: [
					{ name: 'Yearly', value: 'yearly' },
					{ name: 'Monthly', value: 'monthly' },
					{ name: 'Hourly', value: 'hourly' },
				],
				default: 'yearly',
				description: 'Compensation interval',
			},
			{
				displayName: 'Team',
				name: 'team',
				type: 'string',
				default: '',
				description: 'Team name',
			},
		],
	},

	// ----------------------------------
	//         requisition:get
	// ----------------------------------
	{
		displayName: 'Requisition ID',
		name: 'requisitionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['requisition'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the requisition',
	},

	// ----------------------------------
	//         requisition:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['requisition'],
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
				resource: ['requisition'],
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
				resource: ['requisition'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Filter by department',
			},
			{
				displayName: 'Hiring Manager ID',
				name: 'hiringManager',
				type: 'string',
				default: '',
				description: 'Filter by hiring manager',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Filter by location',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'Filter by owner',
			},
			{
				displayName: 'Requisition Code',
				name: 'requisitionCode',
				type: 'string',
				default: '',
				description: 'Filter by requisition code',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: LEVER_REQUISITION_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Filter by status',
			},
			{
				displayName: 'Team',
				name: 'team',
				type: 'string',
				default: '',
				description: 'Filter by team',
			},
		],
	},

	// ----------------------------------
	//         requisition:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['requisition'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Backfill',
				name: 'backfill',
				type: 'boolean',
				default: false,
				description: 'Whether this is a backfill position',
			},
			{
				displayName: 'Compensation Max',
				name: 'compensationMax',
				type: 'number',
				default: 0,
				description: 'Maximum compensation',
			},
			{
				displayName: 'Compensation Min',
				name: 'compensationMin',
				type: 'number',
				default: 0,
				description: 'Minimum compensation',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Compensation currency',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Employment Status',
				name: 'employmentStatus',
				type: 'string',
				default: '',
				description: 'Employment status',
			},
			{
				displayName: 'Headcount Total',
				name: 'headcountTotal',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Total open positions',
			},
			{
				displayName: 'Hiring Manager ID',
				name: 'hiringManager',
				type: 'string',
				default: '',
				description: 'User ID of the hiring manager',
			},
			{
				displayName: 'Internal Notes',
				name: 'internalNotes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Internal notes',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Job location',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Requisition name',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'User ID of the owner',
			},
			{
				displayName: 'Pay Interval',
				name: 'interval',
				type: 'options',
				options: [
					{ name: 'Yearly', value: 'yearly' },
					{ name: 'Monthly', value: 'monthly' },
					{ name: 'Hourly', value: 'hourly' },
				],
				default: 'yearly',
				description: 'Compensation interval',
			},
			{
				displayName: 'Requisition Code',
				name: 'requisitionCode',
				type: 'string',
				default: '',
				description: 'Requisition code',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: LEVER_REQUISITION_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: 'draft',
				description: 'Status',
			},
			{
				displayName: 'Team',
				name: 'team',
				type: 'string',
				default: '',
				description: 'Team name',
			},
		],
	},
];

export async function executeRequisitionOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const requisitionCode = this.getNodeParameter('requisitionCode', i) as string;
			const status = this.getNodeParameter('status', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				requisitionCode,
				status,
			};

			// Build compensation band if fields are provided
			const compensationBand: IDataObject = {};
			if (additionalFields.compensationMin !== undefined) {
				compensationBand.min = additionalFields.compensationMin;
				delete additionalFields.compensationMin;
			}
			if (additionalFields.compensationMax !== undefined) {
				compensationBand.max = additionalFields.compensationMax;
				delete additionalFields.compensationMax;
			}
			if (additionalFields.currency) {
				compensationBand.currency = additionalFields.currency;
				delete additionalFields.currency;
			}
			if (additionalFields.interval) {
				compensationBand.interval = additionalFields.interval;
				delete additionalFields.interval;
			}
			if (Object.keys(compensationBand).length > 0) {
				body.compensationBand = compensationBand;
			}

			// Copy remaining fields
			Object.assign(body, additionalFields);

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				'/requisitions',
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'get': {
			const requisitionId = this.getNodeParameter('requisitionId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'GET',
				`/requisitions/${requisitionId}`,
			)) as IDataObject;
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const qs = buildQueryString(filters);

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/requisitions', {}, qs);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					'/requisitions',
					{},
					qs,
					limit,
				);
			}
			break;
		}

		case 'update': {
			const requisitionId = this.getNodeParameter('requisitionId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			// Build compensation band if fields are provided
			const compensationBand: IDataObject = {};
			if (updateFields.compensationMin !== undefined) {
				compensationBand.min = updateFields.compensationMin;
				delete updateFields.compensationMin;
			}
			if (updateFields.compensationMax !== undefined) {
				compensationBand.max = updateFields.compensationMax;
				delete updateFields.compensationMax;
			}
			if (updateFields.currency) {
				compensationBand.currency = updateFields.currency;
				delete updateFields.currency;
			}
			if (updateFields.interval) {
				compensationBand.interval = updateFields.interval;
				delete updateFields.interval;
			}
			if (Object.keys(compensationBand).length > 0) {
				body.compensationBand = compensationBand;
			}

			// Copy remaining fields
			Object.assign(body, updateFields);

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/requisitions/${requisitionId}`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'delete': {
			const requisitionId = this.getNodeParameter('requisitionId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'DELETE',
				`/requisitions/${requisitionId}`,
			)) as IDataObject;
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
