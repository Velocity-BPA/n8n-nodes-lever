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

export const noteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a note',
				action: 'Create a note',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a note',
				action: 'Delete a note',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a note',
				action: 'Get a note',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many notes',
				action: 'Get many notes',
			},
		],
		default: 'getAll',
	},
];

export const noteFields: INodeProperties[] = [
	// ----------------------------------
	//         note: create
	// ----------------------------------
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create', 'get', 'getAll', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the opportunity to associate the note with',
	},
	{
		displayName: 'Note Content',
		name: 'value',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The content of the note',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Notify Followers',
				name: 'notifyFollowers',
				type: 'boolean',
				default: false,
				description: 'Whether to notify followers of the opportunity',
			},
			{
				displayName: 'Performing User ID',
				name: 'performAs',
				type: 'string',
				default: '',
				description: 'The user ID to attribute this action to',
			},
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'boolean',
				default: false,
				description: 'Whether the note is private (only visible to super admins and the creator)',
			},
		],
	},

	// ----------------------------------
	//         note: get / delete
	// ----------------------------------
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['get', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the note',
	},

	// ----------------------------------
	//         note: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['note'],
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
				resource: ['note'],
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
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				options: [
					{
						name: 'User',
						value: 'user',
					},
				],
				default: [],
				description: 'Expand related objects in the response',
			},
		],
	},
];

export async function executeNoteOperations(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const returnData: INodeExecutionData[] = [];

	if (operation === 'create') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const value = this.getNodeParameter('value', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			value,
		};

		if (additionalFields.notifyFollowers !== undefined) {
			body.notifyFollowers = additionalFields.notifyFollowers;
		}

		if (additionalFields.secret !== undefined) {
			body.secret = additionalFields.secret;
		}

		const qs: IDataObject = {};
		if (additionalFields.performAs) {
			qs.perform_as = additionalFields.performAs;
		}

		const response = await leverApiRequest.call(
			this,
			'POST',
			`/opportunities/${opportunityId}/notes`,
			body,
			qs,
		);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response as IDataObject),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'get') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const noteId = this.getNodeParameter('noteId', index) as string;

		const response = await leverApiRequest.call(
			this,
			'GET',
			`/opportunities/${opportunityId}/notes/${noteId}`,
		);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response as IDataObject),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'getAll') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const options = this.getNodeParameter('options', index) as IDataObject;

		const qs: IDataObject = {};

		if (options.expand && (options.expand as string[]).length > 0) {
			qs.expand = (options.expand as string[]).join(',');
		}

		let response: IDataObject[];

		if (returnAll) {
			response = await leverApiRequestAllItems.call(
				this,
				'GET',
				`/opportunities/${opportunityId}/notes`,
				{},
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			response = await leverApiRequestAllItems.call(
				this,
				'GET',
				`/opportunities/${opportunityId}/notes`,
				{},
				qs,
				limit,
			);
		}

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'delete') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const noteId = this.getNodeParameter('noteId', index) as string;

		await leverApiRequest.call(
			this,
			'DELETE',
			`/opportunities/${opportunityId}/notes/${noteId}`,
		);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray({ success: true, noteId }),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	return returnData;
}
