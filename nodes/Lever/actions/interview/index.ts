/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { leverApiRequest, leverApiRequestAllItems } from '../../transport';
import { buildQueryString, cleanObject } from '../../utils';

export const interviewOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['interview'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Schedule a new interview',
				action: 'Create an interview',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get interview details',
				action: 'Get an interview',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many interviews',
				action: 'Get many interviews',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an interview',
				action: 'Update an interview',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Cancel/delete an interview',
				action: 'Delete an interview',
			},
		],
		default: 'get',
	},
];

export const interviewFields: INodeProperties[] = [
	// ----------------------------------
	//         interview:create
	// ----------------------------------
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['create', 'getAll'],
			},
		},
		description: 'The ID of the opportunity (candidate)',
	},
	{
		displayName: 'Panel ID',
		name: 'panelId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['create'],
			},
		},
		description: 'The ID of the interview panel',
	},
	{
		displayName: 'Interview Date',
		name: 'date',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['create'],
			},
		},
		description: 'Date and time of the interview',
	},
	{
		displayName: 'Duration (Minutes)',
		name: 'duration',
		type: 'number',
		required: true,
		default: 60,
		typeOptions: {
			minValue: 15,
			maxValue: 480,
		},
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['create'],
			},
		},
		description: 'Duration of the interview in minutes',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Feedback Reminder',
				name: 'feedbackReminder',
				type: 'options',
				options: [
					{ name: 'Same Day', value: 'sameDay' },
					{ name: 'Next Day', value: 'nextDay' },
					{ name: 'In 2 Days', value: 'twoDays' },
					{ name: 'In 3 Days', value: 'threeDays' },
					{ name: 'Never', value: 'never' },
				],
				default: 'nextDay',
				description: 'When to send feedback reminder',
			},
			{
				displayName: 'Feedback Template ID',
				name: 'feedbackTemplate',
				type: 'string',
				default: '',
				description: 'ID of the feedback form template',
			},
			{
				displayName: 'Google Calendar Event URL',
				name: 'gcalEventUrl',
				type: 'string',
				default: '',
				description: 'URL of the Google Calendar event',
			},
			{
				displayName: 'Interviewer IDs',
				name: 'interviewers',
				type: 'string',
				default: '',
				description: 'Comma-separated list of interviewer user IDs',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Interview location (room, address, video link)',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the interview',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject line for the interview',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: '',
				placeholder: 'America/New_York',
				description: 'Timezone for the interview',
			},
			{
				displayName: 'User ID',
				name: 'user',
				type: 'string',
				default: '',
				description: 'ID of the user scheduling the interview',
			},
		],
	},

	// ----------------------------------
	//         interview:get
	// ----------------------------------
	{
		displayName: 'Interview ID',
		name: 'interviewId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the interview',
	},

	// ----------------------------------
	//         interview:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['interview'],
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
				resource: ['interview'],
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
				resource: ['interview'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Expand',
				name: 'expand',
				type: 'multiOptions',
				options: [
					{ name: 'Interviewers', value: 'interviewers' },
					{ name: 'Panel', value: 'panel' },
					{ name: 'User', value: 'user' },
				],
				default: [],
				description: 'Related objects to include',
			},
			{
				displayName: 'Include Canceled',
				name: 'include_canceled',
				type: 'boolean',
				default: false,
				description: 'Whether to include canceled interviews',
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
	//         interview:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['interview'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'New date and time for the interview',
			},
			{
				displayName: 'Duration (Minutes)',
				name: 'duration',
				type: 'number',
				typeOptions: {
					minValue: 15,
					maxValue: 480,
				},
				default: 60,
				description: 'Duration of the interview in minutes',
			},
			{
				displayName: 'Feedback Reminder',
				name: 'feedbackReminder',
				type: 'options',
				options: [
					{ name: 'Same Day', value: 'sameDay' },
					{ name: 'Next Day', value: 'nextDay' },
					{ name: 'In 2 Days', value: 'twoDays' },
					{ name: 'In 3 Days', value: 'threeDays' },
					{ name: 'Never', value: 'never' },
				],
				default: 'nextDay',
				description: 'When to send feedback reminder',
			},
			{
				displayName: 'Feedback Template ID',
				name: 'feedbackTemplate',
				type: 'string',
				default: '',
				description: 'ID of the feedback form template',
			},
			{
				displayName: 'Google Calendar Event URL',
				name: 'gcalEventUrl',
				type: 'string',
				default: '',
				description: 'URL of the Google Calendar event',
			},
			{
				displayName: 'Interviewer IDs',
				name: 'interviewers',
				type: 'string',
				default: '',
				description: 'Comma-separated list of interviewer user IDs',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Interview location',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the interview',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject line for the interview',
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: '',
				placeholder: 'America/New_York',
				description: 'Timezone for the interview',
			},
		],
	},
];

export async function executeInterviewOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const opportunityId = this.getNodeParameter('opportunityId', i) as string;
			const panelId = this.getNodeParameter('panelId', i) as string;
			const date = this.getNodeParameter('date', i) as string;
			const duration = this.getNodeParameter('duration', i) as number;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				panel: panelId,
				date: new Date(date).getTime(),
				duration,
			};

			// Process interviewer IDs
			if (additionalFields.interviewers) {
				body.interviewers = (additionalFields.interviewers as string)
					.split(',')
					.map((id) => ({ id: id.trim() }));
				delete additionalFields.interviewers;
			}

			// Copy remaining fields
			Object.assign(body, additionalFields);

			responseData = (await leverApiRequest.call(
				this,
				'POST',
				`/opportunities/${opportunityId}/interviews`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'get': {
			const interviewId = this.getNodeParameter('interviewId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'GET',
				`/interviews/${interviewId}`,
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
					`/opportunities/${opportunityId}/interviews`,
					{},
					qs,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await leverApiRequestAllItems.call(
					this,
					'GET',
					`/opportunities/${opportunityId}/interviews`,
					{},
					qs,
					limit,
				);
			}
			break;
		}

		case 'update': {
			const interviewId = this.getNodeParameter('interviewId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			// Process date
			if (updateFields.date) {
				body.date = new Date(updateFields.date as string).getTime();
				delete updateFields.date;
			}

			// Process interviewer IDs
			if (updateFields.interviewers) {
				body.interviewers = (updateFields.interviewers as string)
					.split(',')
					.map((id) => ({ id: id.trim() }));
				delete updateFields.interviewers;
			}

			// Copy remaining fields
			Object.assign(body, updateFields);

			responseData = (await leverApiRequest.call(
				this,
				'PUT',
				`/interviews/${interviewId}`,
				cleanObject(body),
			)) as IDataObject;
			break;
		}

		case 'delete': {
			const interviewId = this.getNodeParameter('interviewId', i) as string;

			responseData = (await leverApiRequest.call(
				this,
				'DELETE',
				`/interviews/${interviewId}`,
			)) as IDataObject;
			break;
		}

		default:
			throw new Error(`The operation "${operation}" is not supported`);
	}

	return responseData;
}
