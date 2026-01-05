/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString, cleanObject } from '../../utils';
import {
	LEVER_OPPORTUNITY_ORIGINS,
	LEVER_CONFIDENTIALITY_OPTIONS,
	LEVER_EXPAND_OPTIONS,
	LEVER_ARCHIVE_REASONS,
} from '../../constants';

export const opportunityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['opportunity'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new opportunity',
				action: 'Create an opportunity',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single opportunity',
				action: 'Get an opportunity',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many opportunities',
				action: 'Get many opportunities',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an opportunity',
				action: 'Update an opportunity',
			},
			{
				name: 'Update Stage',
				value: 'updateStage',
				description: 'Move opportunity to a different pipeline stage',
				action: 'Update opportunity stage',
			},
			{
				name: 'Update Archive State',
				value: 'updateArchiveState',
				description: 'Archive or unarchive an opportunity',
				action: 'Update opportunity archive state',
			},
			{
				name: 'Update Tags',
				value: 'updateTags',
				description: 'Add or remove tags from an opportunity',
				action: 'Update opportunity tags',
			},
			{
				name: 'Update Sources',
				value: 'updateSources',
				description: 'Update opportunity sources',
				action: 'Update opportunity sources',
			},
			{
				name: 'List Deleted',
				value: 'listDeleted',
				description: 'Get deleted opportunities',
				action: 'List deleted opportunities',
			},
		],
		default: 'get',
	},
];

export const opportunityFields: INodeProperties[] = [
	// ----------------------------------
	//         opportunity:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['create'],
			},
		},
		description: 'Candidate name',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Contact ID',
				name: 'contact',
				type: 'string',
				default: '',
				description: 'ID of an existing contact to associate',
			},
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				default: '',
				description: 'Comma-separated list of email addresses',
			},
			{
				displayName: 'Headline',
				name: 'headline',
				type: 'string',
				default: '',
				description: 'Short headline or title for the candidate',
			},
			{
				displayName: 'Links',
				name: 'links',
				type: 'string',
				default: '',
				description: 'Comma-separated list of links (LinkedIn, portfolio, etc.)',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Location of the candidate',
			},
			{
				displayName: 'Origin',
				name: 'origin',
				type: 'options',
				options: LEVER_OPPORTUNITY_ORIGINS.map((o) => ({ name: o.name, value: o.value })),
				default: 'sourced',
				description: 'How the candidate was sourced',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'User ID of the opportunity owner',
			},
			{
				displayName: 'Phones',
				name: 'phones',
				type: 'string',
				default: '',
				description: 'Comma-separated list of phone numbers',
			},
			{
				displayName: 'Posting ID',
				name: 'posting',
				type: 'string',
				default: '',
				description: 'Job posting to associate with this opportunity',
			},
			{
				displayName: 'Sources',
				name: 'sources',
				type: 'string',
				default: '',
				description: 'Comma-separated list of sources',
			},
			{
				displayName: 'Stage ID',
				name: 'stage',
				type: 'string',
				default: '',
				description: 'Pipeline stage ID',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
		],
	},

	// ----------------------------------
	//         opportunity:get
	// ----------------------------------
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['get', 'update', 'updateStage', 'updateArchiveState', 'updateTags', 'updateSources'],
			},
		},
		description: 'The ID of the opportunity',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				options: LEVER_EXPAND_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
				default: [],
				description: 'Related objects to include in the response',
			},
		],
	},

	// ----------------------------------
	//         opportunity:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['getAll', 'listDeleted'],
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
				resource: ['opportunity'],
				operation: ['getAll', 'listDeleted'],
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
				resource: ['opportunity'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to include archived opportunities',
			},
			{
				displayName: 'Confidentiality',
				name: 'confidentiality',
				type: 'options',
				options: LEVER_CONFIDENTIALITY_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
				default: 'non-confidential',
				description: 'Filter by confidentiality',
			},
			{
				displayName: 'Contact ID',
				name: 'contact_id',
				type: 'string',
				default: '',
				description: 'Filter by contact ID',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Filter by email address',
			},
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				options: LEVER_EXPAND_OPTIONS.map((o) => ({ name: o.name, value: o.value })),
				default: [],
				description: 'Related objects to include',
			},
			{
				displayName: 'Origin',
				name: 'origin',
				type: 'options',
				options: LEVER_OPPORTUNITY_ORIGINS.map((o) => ({ name: o.name, value: o.value })),
				default: '',
				description: 'Filter by origin',
			},
			{
				displayName: 'Posting ID',
				name: 'posting_id',
				type: 'string',
				default: '',
				description: 'Filter by posting ID',
			},
			{
				displayName: 'Stage ID',
				name: 'stage_id',
				type: 'string',
				default: '',
				description: 'Filter by stage ID',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags to filter by',
			},
		],
	},

	// ----------------------------------
	//         opportunity:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				default: '',
				description: 'Comma-separated list of email addresses',
			},
			{
				displayName: 'Headline',
				name: 'headline',
				type: 'string',
				default: '',
				description: 'Short headline or title',
			},
			{
				displayName: 'Links',
				name: 'links',
				type: 'string',
				default: '',
				description: 'Comma-separated list of links',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Location of the candidate',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Candidate name',
			},
			{
				displayName: 'Owner ID',
				name: 'owner',
				type: 'string',
				default: '',
				description: 'User ID of the owner',
			},
			{
				displayName: 'Phones',
				name: 'phones',
				type: 'string',
				default: '',
				description: 'Comma-separated list of phone numbers',
			},
		],
	},

	// ----------------------------------
	//         opportunity:updateStage
	// ----------------------------------
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['updateStage'],
			},
		},
		description: 'The ID of the stage to move the opportunity to',
	},

	// ----------------------------------
	//         opportunity:updateArchiveState
	// ----------------------------------
	{
		displayName: 'Action',
		name: 'archiveAction',
		type: 'options',
		options: [
			{
				name: 'Archive',
				value: 'archive',
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
			},
		],
		default: 'archive',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['updateArchiveState'],
			},
		},
		description: 'Whether to archive or unarchive the opportunity',
	},
	{
		displayName: 'Archive Reason',
		name: 'archiveReason',
		type: 'options',
		options: LEVER_ARCHIVE_REASONS.map((o) => ({ name: o.name, value: o.value })),
		default: 'other',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['updateArchiveState'],
				archiveAction: ['archive'],
			},
		},
		description: 'The reason for archiving',
	},

	// ----------------------------------
	//         opportunity:updateTags
	// ----------------------------------
	{
		displayName: 'Action',
		name: 'tagAction',
		type: 'options',
		options: [
			{
				name: 'Add Tags',
				value: 'add',
			},
			{
				name: 'Remove Tags',
				value: 'remove',
			},
			{
				name: 'Replace Tags',
				value: 'replace',
			},
		],
		default: 'add',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['updateTags'],
			},
		},
		description: 'How to update the tags',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['updateTags'],
			},
		},
		description: 'Comma-separated list of tags',
	},

	// ----------------------------------
	//         opportunity:updateSources
	// ----------------------------------
	{
		displayName: 'Sources',
		name: 'sources',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['opportunity'],
				operation: ['updateSources'],
			},
		},
		description: 'Comma-separated list of sources',
	},
];

export async function executeOpportunityOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = { name };

			// Process array fields
			if (additionalFields.emails) {
				body.emails = (additionalFields.emails as string).split(',').map((e) => e.trim());
			}
			if (additionalFields.phones) {
				body.phones = (additionalFields.phones as string).split(',').map((p) => p.trim());
			}
			if (additionalFields.links) {
				body.links = (additionalFields.links as string).split(',').map((l) => l.trim());
			}
			if (additionalFields.tags) {
				body.tags = (additionalFields.tags as string).split(',').map((t) => t.trim());
			}
			if (additionalFields.sources) {
				body.sources = (additionalFields.sources as string).split(',').map((s) => s.trim());
			}

			// Copy simple fields
			const simpleFields = ['contact', 'headline', 'location', 'origin', 'owner', 'posting', 'stage'];
			for (const field of simpleFields) {
				if (additionalFields[field]) {
					body[field] = additionalFields[field];
				}
			}

			responseData = (await leverApiRequest.call(this, 'POST', '/opportunities', body)) as IDataObject;
			break;
		}

		case 'get': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const options = this.getNodeParameter('options', i) as IDataObject;
			const qs = buildQueryString(options);

			if (options.expand && Array.isArray(options.expand) && options.expand.length > 0) {
				qs.expand = (options.expand as string[]).join(',');
			}

			responseData = (await leverApiRequest.call(
				this,
				'GET',
				`/opportunities/${opportunityId}`,
				{},
				qs,
			)) as IDataObject;
			break;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const qs = buildQueryString(filters);

			if (filters.expand && Array.isArray(filters.expand) && filters.expand.length > 0) {
				qs.expand = (filters.expand as string[]).join(',');
			}
			if (filters.tags) {
				qs.tags = (filters.tags as string).split(',').map((t) => t.trim());
			}

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/opportunities', {}, qs);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/opportunities', {}, qs, limit);
			}
			break;
		}

		case 'update': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			// Process array fields
			if (updateFields.emails) {
				body.emails = (updateFields.emails as string).split(',').map((e) => e.trim());
			}
			if (updateFields.phones) {
				body.phones = (updateFields.phones as string).split(',').map((p) => p.trim());
			}
			if (updateFields.links) {
				body.links = (updateFields.links as string).split(',').map((l) => l.trim());
			}

			// Copy simple fields
			const simpleFields = ['headline', 'location', 'name', 'owner'];
			for (const field of simpleFields) {
				if (updateFields[field]) {
					body[field] = updateFields[field];
				}
			}

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/opportunities/${opportunityId}`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'updateStage': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const stageId = this.getNodeParameter('stageId', i) as string;

			responseData = (await leverApiRequest.call(this, 'PUT', `/opportunities/${opportunityId}/stage`, {
				stage: stageId,
			})) as IDataObject;
			break;
		}

		case 'updateArchiveState': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const archiveAction = this.getNodeParameter('archiveAction', i) as string;

			if (archiveAction === 'archive') {
				const archiveReason = this.getNodeParameter('archiveReason', i) as string;
				responseData = (await leverApiRequest.call(
					this,
					'PUT',
					`/opportunities/${opportunityId}/archived`,
					{ reason: archiveReason },
				)) as IDataObject;
			} else {
				responseData = (await leverApiRequest.call(
					this,
					'DELETE',
					`/opportunities/${opportunityId}/archived`,
				)) as IDataObject;
			}
			break;
		}

		case 'updateTags': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const tagAction = this.getNodeParameter('tagAction', i) as string;
			const tags = (this.getNodeParameter('tags', i) as string).split(',').map((t) => t.trim());

			let method: 'POST' | 'PUT' | 'DELETE' = 'POST';
			if (tagAction === 'replace') {
				method = 'PUT';
			} else if (tagAction === 'remove') {
				method = 'DELETE';
			}

			responseData = (await leverApiRequest.call(this, method, `/opportunities/${opportunityId}/tags`, {
				tags,
			})) as IDataObject;
			break;
		}

		case 'updateSources': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const sources = (this.getNodeParameter('sources', i) as string).split(',').map((s) => s.trim());

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/opportunities/${opportunityId}/sources`,
				{ sources },
			)) as IDataObject;
			break;
		}

		case 'listDeleted': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await leverApiRequestAllItems.call(this, 'GET', '/opportunities/deleted');
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					'/opportunities/deleted',
					{},
					{},
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
