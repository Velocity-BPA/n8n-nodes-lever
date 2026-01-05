/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString, cleanObject } from '../../utils';
import { LEVER_POSTING_STATES, LEVER_CONFIDENTIALITY_OPTIONS } from '../../constants';

export const postingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['posting'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new job posting',
				action: 'Create a posting',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a job posting',
				action: 'Get a posting',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many job postings',
				action: 'Get many postings',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a job posting',
				action: 'Update a posting',
			},
			{
				name: 'Get Application Questions',
				value: 'getApplicationQuestions',
				description: 'Get application form questions',
				action: 'Get application questions',
			},
			{
				name: 'Apply to Posting',
				value: 'applyToPosting',
				description: 'Submit an application to a posting',
				action: 'Apply to posting',
			},
		],
		default: 'get',
	},
];

export const postingFields: INodeProperties[] = [
	// ----------------------------------
	//         posting:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['create'],
			},
		},
		description: 'The job title',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Commitment',
				name: 'commitment',
				type: 'string',
				default: '',
				description: 'Employment commitment (e.g., Full-time, Part-time)',
			},
			{
				displayName: 'Confidentiality',
				name: 'confidentiality',
				type: 'options',
				options: LEVER_CONFIDENTIALITY_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
				default: 'non-confidential',
				description: 'Confidentiality level',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'Job description text',
			},
			{
				displayName: 'Description (HTML)',
				name: 'descriptionHtml',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'Job description in HTML format',
			},
			{
				displayName: 'Distribution Channels',
				name: 'distributionChannels',
				type: 'string',
				default: '',
				description: 'Comma-separated distribution channels',
			},
			{
				displayName: 'Hiring Manager ID',
				name: 'hiringManager',
				type: 'string',
				default: '',
				description: 'User ID of the hiring manager',
			},
			{
				displayName: 'Level',
				name: 'level',
				type: 'string',
				default: '',
				description: 'Job level (e.g., Senior, Junior)',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Job location',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'User ID of the posting owner',
			},
			{
				displayName: 'Requisition Code',
				name: 'requisitionCode',
				type: 'string',
				default: '',
				description: 'Associated requisition code',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: LEVER_POSTING_STATES.map((s) => ({ name: s.name, value: s.value })),
				default: 'draft',
				description: 'Posting state',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
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
	//         posting:get
	// ----------------------------------
	{
		displayName: 'Posting ID',
		name: 'postingId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['get', 'update', 'getApplicationQuestions', 'applyToPosting'],
			},
		},
		description: 'The ID of the posting',
	},

	// ----------------------------------
	//         posting:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['posting'],
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
				resource: ['posting'],
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
				resource: ['posting'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Commitment',
				name: 'commitment',
				type: 'string',
				default: '',
				description: 'Filter by commitment type',
			},
			{
				displayName: 'Confidentiality',
				name: 'confidentiality',
				type: 'options',
				options: LEVER_CONFIDENTIALITY_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
				default: '',
				description: 'Filter by confidentiality',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Filter by department',
			},
			{
				displayName: 'Level',
				name: 'level',
				type: 'string',
				default: '',
				description: 'Filter by level',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Filter by location',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: LEVER_POSTING_STATES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Filter by state',
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
	//         posting:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Commitment',
				name: 'commitment',
				type: 'string',
				default: '',
				description: 'Employment commitment',
			},
			{
				displayName: 'Confidentiality',
				name: 'confidentiality',
				type: 'options',
				options: LEVER_CONFIDENTIALITY_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
				default: 'non-confidential',
				description: 'Confidentiality level',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				default: '',
				description: 'Department name',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				description: 'Job description text',
			},
			{
				displayName: 'Hiring Manager ID',
				name: 'hiringManager',
				type: 'string',
				default: '',
				description: 'User ID of the hiring manager',
			},
			{
				displayName: 'Level',
				name: 'level',
				type: 'string',
				default: '',
				description: 'Job level',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Job location',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'User ID of the posting owner',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: LEVER_POSTING_STATES.map((s) => ({ name: s.name, value: s.value })),
				default: 'draft',
				description: 'Posting state',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Team',
				name: 'team',
				type: 'string',
				default: '',
				description: 'Team name',
			},
			{
				displayName: 'Title',
				name: 'text',
				type: 'string',
				default: '',
				description: 'Job title',
			},
		],
	},

	// ----------------------------------
	//         posting:applyToPosting
	// ----------------------------------
	{
		displayName: 'Candidate Name',
		name: 'candidateName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['applyToPosting'],
			},
		},
		description: 'Name of the candidate applying',
	},
	{
		displayName: 'Candidate Email',
		name: 'candidateEmail',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'name@email.com',
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['applyToPosting'],
			},
		},
		description: 'Email of the candidate applying',
	},
	{
		displayName: 'Application Options',
		name: 'applicationOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['posting'],
				operation: ['applyToPosting'],
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
				description: 'Additional comments or cover letter',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Current company',
			},
			{
				displayName: 'Headline',
				name: 'headline',
				type: 'string',
				default: '',
				description: 'Candidate headline or title',
			},
			{
				displayName: 'Links',
				name: 'links',
				type: 'string',
				default: '',
				description: 'Comma-separated links (LinkedIn, portfolio, etc.)',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Candidate location',
			},
			{
				displayName: 'Origin',
				name: 'origin',
				type: 'string',
				default: 'applied',
				description: 'Application origin',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Candidate phone number',
			},
			{
				displayName: 'Sources',
				name: 'sources',
				type: 'string',
				default: '',
				description: 'Comma-separated list of sources',
			},
		],
	},
];

export async function executePostingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const text = this.getNodeParameter('text', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = { text };

			// Build categories object
			const categories: IDataObject = {};
			const categoryFields = ['commitment', 'department', 'level', 'location', 'team'];
			for (const field of categoryFields) {
				if (additionalFields[field]) {
					categories[field] = additionalFields[field];
					delete additionalFields[field];
				}
			}
			if (Object.keys(categories).length > 0) {
				body.categories = categories;
			}

			// Build content object
			const content: IDataObject = {};
			if (additionalFields.description) {
				content.description = additionalFields.description;
				delete additionalFields.description;
			}
			if (additionalFields.descriptionHtml) {
				content.descriptionHtml = additionalFields.descriptionHtml;
				delete additionalFields.descriptionHtml;
			}
			if (Object.keys(content).length > 0) {
				body.content = content;
			}

			// Process array fields
			if (additionalFields.tags) {
				body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());
				delete additionalFields.tags;
			}
			if (additionalFields.distributionChannels) {
				body.distributionChannels = (additionalFields.distributionChannels as string)
					.split(',')
					.map((c) => c.trim());
				delete additionalFields.distributionChannels;
			}

			// Copy remaining fields
			Object.assign(body, additionalFields);

			responseData = (await leverApiRequest.call(this, 'POST', '/postings', cleanObject(body))) as IDataObject;
			break;
		}

		case 'get': {
			const postingId = this.getNodeParameter('postingId', i) as string;

			responseData = (await leverApiRequest.call(this, 'GET', `/postings/${postingId}`)) as IDataObject;
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const qs = buildQueryString(filters);

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/postings', {}, qs);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/postings', {}, qs, limit);
			}
			break;
		}

		case 'update': {
			const postingId = this.getNodeParameter('postingId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			// Build categories object
			const categories: IDataObject = {};
			const categoryFields = ['commitment', 'department', 'level', 'location', 'team'];
			for (const field of categoryFields) {
				if (updateFields[field]) {
					categories[field] = updateFields[field];
					delete updateFields[field];
				}
			}
			if (Object.keys(categories).length > 0) {
				body.categories = categories;
			}

			// Build content object
			if (updateFields.description) {
				body.content = { description: updateFields.description };
				delete updateFields.description;
			}

			// Process array fields
			if (updateFields.tags) {
				body.tags = (updateFields.tags as string).split(',').map((t) => t.trim());
				delete updateFields.tags;
			}

			// Copy remaining fields
			Object.assign(body, updateFields);

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/postings/${postingId}`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'getApplicationQuestions': {
			const postingId = this.getNodeParameter('postingId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'GET',
				`/postings/${postingId}/apply`,
			)) as IDataObject;
			break;
		}

		case 'applyToPosting': {
			const postingId = this.getNodeParameter('postingId', i) as string;
			const candidateName = this.getNodeParameter('candidateName', i) as string;
			const candidateEmail = this.getNodeParameter('candidateEmail', i) as string;
			const applicationOptions = this.getNodeParameter('applicationOptions', i) as IDataObject;

			const body: IDataObject = {
				name: candidateName,
				email: candidateEmail,
			};

			// Process array fields
			if (applicationOptions.links) {
				body.links = (applicationOptions.links as string).split(',').map((l) => l.trim());
				delete applicationOptions.links;
			}
			if (applicationOptions.sources) {
				body.sources = (applicationOptions.sources as string).split(',').map((s) => s.trim());
				delete applicationOptions.sources;
			}

			// Copy remaining fields
			Object.assign(body, applicationOptions);

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				`/postings/${postingId}/apply`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
