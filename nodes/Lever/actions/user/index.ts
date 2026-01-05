/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString, cleanObject } from '../../utils';
import { LEVER_ACCESS_ROLES } from '../../constants';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new user',
				action: 'Create a user',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a user',
				action: 'Get a user',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many users',
				action: 'Get many users',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a user',
				action: 'Update a user',
			},
			{
				name: 'Deactivate',
				value: 'deactivate',
				description: 'Deactivate a user',
				action: 'Deactivate a user',
			},
			{
				name: 'Reactivate',
				value: 'reactivate',
				description: 'Reactivate a deactivated user',
				action: 'Reactivate a user',
			},
		],
		default: 'get',
	},
];

export const userFields: INodeProperties[] = [
	// ----------------------------------
	//         user:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		description: 'Full name of the user',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		description: 'Email address of the user',
	},
	{
		displayName: 'Access Role',
		name: 'accessRole',
		type: 'options',
		options: LEVER_ACCESS_ROLES.map((r) => ({ name: r.name, value: r.value })),
		required: true,
		default: 'member',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		description: 'The access role for the user',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'External Directory ID',
				name: 'externalDirectoryId',
				type: 'string',
				default: '',
				description: 'External directory ID (for SSO integration)',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Job title of the user',
			},
			{
				displayName: 'Linked Contact IDs',
				name: 'linkedContactIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of linked contact IDs',
			},
			{
				displayName: 'Photo URL',
				name: 'photo',
				type: 'string',
				default: '',
				description: 'URL of the user\'s profile photo',
			},
			{
				displayName: 'Send Invite Email',
				name: 'sendEmail',
				type: 'boolean',
				default: true,
				description: 'Whether to send an invite email to the user',
			},
		],
	},

	// ----------------------------------
	//         user:get
	// ----------------------------------
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get', 'update', 'deactivate', 'reactivate'],
			},
		},
		description: 'The ID of the user',
	},

	// ----------------------------------
	//         user:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['user'],
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
				resource: ['user'],
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
				resource: ['user'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Access Role',
				name: 'accessRole',
				type: 'options',
				options: LEVER_ACCESS_ROLES.map((r) => ({ name: r.name, value: r.value })),
				default: '',
				description: 'Filter by access role',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Filter by email address',
			},
			{
				displayName: 'External Directory ID',
				name: 'externalDirectoryId',
				type: 'string',
				default: '',
				description: 'Filter by external directory ID',
			},
			{
				displayName: 'Include Deactivated',
				name: 'includeDeactivated',
				type: 'boolean',
				default: false,
				description: 'Whether to include deactivated users',
			},
		],
	},

	// ----------------------------------
	//         user:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Access Role',
				name: 'accessRole',
				type: 'options',
				options: LEVER_ACCESS_ROLES.map((r) => ({ name: r.name, value: r.value })),
				default: 'member',
				description: 'The access role for the user',
			},
			{
				displayName: 'External Directory ID',
				name: 'externalDirectoryId',
				type: 'string',
				default: '',
				description: 'External directory ID',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Job title of the user',
			},
			{
				displayName: 'Linked Contact IDs',
				name: 'linkedContactIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of linked contact IDs',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the user',
			},
			{
				displayName: 'Photo URL',
				name: 'photo',
				type: 'string',
				default: '',
				description: 'URL of the user\'s profile photo',
			},
		],
	},
];

export async function executeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', i) as string;
			const email = this.getNodeParameter('email', i) as string;
			const accessRole = this.getNodeParameter('accessRole', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				name,
				email,
				accessRole,
			};

			// Process linked contact IDs
			if (additionalFields.linkedContactIds) {
				body.linkedContactIds = (additionalFields.linkedContactIds as string)
					.split(',')
					.map((id) => id.trim());
				delete additionalFields.linkedContactIds;
			}

			// Copy remaining fields
			Object.assign(body, additionalFields);

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				'/users',
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'get': {
			const userId = this.getNodeParameter('userId', i) as string;

			responseData = (await leverApiRequest.call(this, 'GET', `/users/${userId}`)) as IDataObject;
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const qs = buildQueryString(filters);

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/users', {}, qs);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/users', {}, qs, limit);
			}
			break;
		}

		case 'update': {
			const userId = this.getNodeParameter('userId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			// Process linked contact IDs
			if (updateFields.linkedContactIds) {
				body.linkedContactIds = (updateFields.linkedContactIds as string)
					.split(',')
					.map((id) => id.trim());
				delete updateFields.linkedContactIds;
			}

			// Copy remaining fields
			Object.assign(body, updateFields);

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/users/${userId}`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'deactivate': {
			const userId = this.getNodeParameter('userId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				`/users/${userId}/deactivate`,
			)) as IDataObject;
			break;
		}

		case 'reactivate': {
			const userId = this.getNodeParameter('userId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				`/users/${userId}/reactivate`,
			)) as IDataObject;
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
