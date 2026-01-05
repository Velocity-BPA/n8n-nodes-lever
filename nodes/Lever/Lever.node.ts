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
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { LICENSING_NOTICE, LICENSING_WARNED } from './constants';

// Import operations and fields
import { opportunityOperations, opportunityFields, executeOpportunityOperation } from './actions/opportunity';
import { applicationOperations, applicationFields, executeApplicationOperation } from './actions/application';
import { postingOperations, postingFields, executePostingOperation } from './actions/posting';
import { feedbackOperations, feedbackFields, executeFeedbackOperation } from './actions/feedback';
import { interviewOperations, interviewFields, executeInterviewOperation } from './actions/interview';
import { userOperations, userFields, executeUserOperation } from './actions/user';
import { stageOperations, stageFields, executeStageOperation } from './actions/stage';
import { requisitionOperations, requisitionFields, executeRequisitionOperation } from './actions/requisition';
import { fileOperations, fileFields, executeFileOperations } from './actions/file';
import { noteOperations, noteFields, executeNoteOperations } from './actions/note';
import { webhookOperations, webhookFields, executeWebhookOperations } from './actions/webhook';

// Log licensing notice once
const globalRef = globalThis as unknown as { [key: symbol]: boolean };
if (!globalRef[LICENSING_WARNED]) {
	console.warn(LICENSING_NOTICE);
	globalRef[LICENSING_WARNED] = true;
}

export class Lever implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lever',
		name: 'lever',
		icon: 'file:lever.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Lever ATS API',
		defaults: {
			name: 'Lever',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'leverApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Application',
						value: 'application',
					},
					{
						name: 'Feedback',
						value: 'feedback',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Interview',
						value: 'interview',
					},
					{
						name: 'Note',
						value: 'note',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
					{
						name: 'Posting',
						value: 'posting',
					},
					{
						name: 'Requisition',
						value: 'requisition',
					},
					{
						name: 'Stage',
						value: 'stage',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'opportunity',
			},
			// Operations
			...opportunityOperations,
			...applicationOperations,
			...postingOperations,
			...feedbackOperations,
			...interviewOperations,
			...userOperations,
			...stageOperations,
			...requisitionOperations,
			...fileOperations,
			...noteOperations,
			...webhookOperations,
			// Fields
			...opportunityFields,
			...applicationFields,
			...postingFields,
			...feedbackFields,
			...interviewFields,
			...userFields,
			...stageFields,
			...requisitionFields,
			...fileFields,
			...noteFields,
			...webhookFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] | INodeExecutionData[];

				switch (resource) {
					case 'opportunity':
						responseData = await executeOpportunityOperation.call(this, operation, i);
						break;
					case 'application':
						responseData = await executeApplicationOperation.call(this, operation, i);
						break;
					case 'posting':
						responseData = await executePostingOperation.call(this, operation, i);
						break;
					case 'feedback':
						responseData = await executeFeedbackOperation.call(this, operation, i);
						break;
					case 'interview':
						responseData = await executeInterviewOperation.call(this, operation, i);
						break;
					case 'user':
						responseData = await executeUserOperation.call(this, operation, i);
						break;
					case 'stage':
						responseData = await executeStageOperation.call(this, operation, i);
						break;
					case 'requisition':
						responseData = await executeRequisitionOperation.call(this, operation, i);
						break;
					case 'file': {
						// File operations return INodeExecutionData[] directly
						const fileResult = await executeFileOperations.call(this, i);
						returnData.push(...fileResult);
						continue;
					}
					case 'note': {
						// Note operations return INodeExecutionData[] directly
						const noteResult = await executeNoteOperations.call(this, i);
						returnData.push(...noteResult);
						continue;
					}
					case 'webhook': {
						// Webhook operations return INodeExecutionData[] directly
						const webhookResult = await executeWebhookOperations.call(this, i);
						returnData.push(...webhookResult);
						continue;
					}
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				// Handle response data for operations returning IDataObject
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
