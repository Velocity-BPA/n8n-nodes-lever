/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';

export const stageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['stage'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a pipeline stage',
				action: 'Get a stage',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many pipeline stages',
				action: 'Get many stages',
			},
		],
		default: 'getAll',
	},
];

export const stageFields: INodeProperties[] = [
	// ----------------------------------
	//         stage:get
	// ----------------------------------
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['stage'],
				operation: ['get'],
			},
		},
		description: 'The ID of the stage',
	},

	// ----------------------------------
	//         stage:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['stage'],
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
				resource: ['stage'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];

export async function executeStageOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'get': {
			const stageId = this.getNodeParameter('stageId', i) as string;

			responseData = (await leverApiRequest.call(this, 'GET', `/stages/${stageId}`)) as IDataObject;
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/stages');
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/stages', {}, {}, limit);
			}
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
