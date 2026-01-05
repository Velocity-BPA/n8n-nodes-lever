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

import { leverApiRequest, leverApiRequestAllItems, leverApiUploadFile, leverApiDownloadFile } from '../../transport';

export const fileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a file',
				action: 'Delete a file',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Download a file',
				action: 'Download a file',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a file',
				action: 'Get a file',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many files',
				action: 'Get many files',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a file',
				action: 'Upload a file',
			},
		],
		default: 'getAll',
	},
];

export const fileFields: INodeProperties[] = [
	// ----------------------------------
	//         file: upload
	// ----------------------------------
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload', 'get', 'getAll', 'download', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the opportunity to associate the file with',
	},
	{
		displayName: 'Input Data Field Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload'],
			},
		},
		placeholder: 'e.g. data',
		description: 'The name of the input field containing the binary file data to upload',
	},

	// ----------------------------------
	//         file: get / download / delete
	// ----------------------------------
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['get', 'download', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the file',
	},

	// ----------------------------------
	//         file: download
	// ----------------------------------
	{
		displayName: 'Output Data Field Name',
		name: 'binaryPropertyNameOutput',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['download'],
			},
		},
		description: 'The name of the output field to put the binary data in',
	},

	// ----------------------------------
	//         file: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['file'],
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
				resource: ['file'],
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

export async function executeFileOperations(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const returnData: INodeExecutionData[] = [];

	if (operation === 'upload') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

		const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
		let fileBuffer: Buffer;

		if (binaryData.id) {
			fileBuffer = await this.helpers.binaryToBuffer(
				await this.helpers.getBinaryStream(binaryData.id),
			);
		} else {
			fileBuffer = Buffer.from(binaryData.data, 'base64');
		}

		const fileName = binaryData.fileName || 'file';
		const mimeType = binaryData.mimeType || 'application/octet-stream';

		const response = await leverApiUploadFile.call(
			this,
			opportunityId,
			fileBuffer,
			fileName,
			mimeType,
		);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'get') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const fileId = this.getNodeParameter('fileId', index) as string;

		const response = await leverApiRequest.call(
			this,
			'GET',
			`/opportunities/${opportunityId}/files/${fileId}`,
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

		let response: IDataObject[];

		if (returnAll) {
			response = await leverApiRequestAllItems.call(
				this,
				'GET',
				`/opportunities/${opportunityId}/files`,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			response = await leverApiRequestAllItems.call(
				this,
				'GET',
				`/opportunities/${opportunityId}/files`,
				{},
				{},
				limit,
			);
		}

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(response),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	if (operation === 'download') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const fileId = this.getNodeParameter('fileId', index) as string;
		const binaryPropertyNameOutput = this.getNodeParameter('binaryPropertyNameOutput', index) as string;

		// First get file metadata to get the filename
		const fileMetadata = (await leverApiRequest.call(
			this,
			'GET',
			`/opportunities/${opportunityId}/files/${fileId}`,
		)) as IDataObject;

		const fileData = (fileMetadata.data as IDataObject) || fileMetadata;
		const fileName = (fileData.name as string) || 'download';
		const mimeType = (fileData.type as string) || 'application/octet-stream';

		// Download the file
		const buffer = await leverApiDownloadFile.call(this, opportunityId, fileId);

		const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, mimeType);

		returnData.push({
			json: fileData,
			binary: {
				[binaryPropertyNameOutput]: binaryData,
			},
		});
	}

	if (operation === 'delete') {
		const opportunityId = this.getNodeParameter('opportunityId', index) as string;
		const fileId = this.getNodeParameter('fileId', index) as string;

		await leverApiRequest.call(
			this,
			'DELETE',
			`/opportunities/${opportunityId}/files/${fileId}`,
		);

		const executionData = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray({ success: true, fileId }),
			{ itemData: { item: index } },
		);
		returnData.push(...executionData);
	}

	return returnData;
}
