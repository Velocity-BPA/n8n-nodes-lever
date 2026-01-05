/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface ILeverCredentials {
	authType: 'apiKey' | 'oauth2';
	apiKey?: string;
	region: 'us' | 'eu';
	clientId?: string;
	clientSecret?: string;
	accessToken?: string;
	refreshToken?: string;
}

export interface ILeverPaginatedResponse<T> {
	data: T[];
	hasNext: boolean;
	next?: string;
}

export interface ILeverOpportunity {
	id: string;
	name: string;
	headline?: string;
	contact?: string;
	emails?: string[];
	phones?: string[];
	links?: string[];
	location?: string;
	stage?: string;
	stageChanges?: ILeverStageChange[];
	archived?: ILeverArchiveState;
	archiveReason?: string;
	origin?: string;
	sources?: string[];
	tags?: string[];
	applications?: string[];
	followers?: string[];
	owner?: string;
	confidentiality?: string;
	createdAt?: number;
	updatedAt?: number;
	lastInteractionAt?: number;
	lastAdvancedAt?: number;
	snoozedUntil?: number;
	urls?: {
		list?: string;
		show?: string;
	};
	dataProtection?: ILeverDataProtection;
}

export interface ILeverStageChange {
	toStageId: string;
	toStageIndex?: number;
	userId?: string;
	updatedAt?: number;
}

export interface ILeverArchiveState {
	reason?: string;
	archivedAt?: number;
}

export interface ILeverDataProtection {
	store?: {
		allowed?: boolean;
		expiresAt?: number;
	};
	contact?: {
		allowed?: boolean;
		expiresAt?: number;
	};
}

export interface ILeverApplication {
	id: string;
	opportunityId: string;
	candidateId?: string;
	posting?: string;
	postingHiringManager?: string;
	postingOwner?: string;
	type?: string;
	requisitionId?: string;
	requisitionCode?: string;
	user?: string;
	name?: string;
	email?: string;
	phone?: string;
	company?: string;
	createdAt?: number;
	archived?: ILeverArchiveState;
	comments?: string;
	referrer?: string;
	customQuestions?: ILeverCustomQuestion[];
}

export interface ILeverCustomQuestion {
	id: string;
	question: string;
	answer: string;
}

export interface ILeverPosting {
	id: string;
	text: string;
	state: 'published' | 'internal' | 'closed' | 'draft' | 'pending' | 'rejected';
	distributionChannels?: string[];
	user?: string;
	owner?: string;
	hiringManager?: string;
	categories?: ILeverCategories;
	tags?: string[];
	content?: ILeverPostingContent;
	followers?: string[];
	requisitionCode?: string;
	requisitionCodes?: string[];
	urls?: {
		list?: string;
		show?: string;
		apply?: string;
	};
	createdAt?: number;
	updatedAt?: number;
	confidentiality?: string;
}

export interface ILeverCategories {
	department?: string;
	team?: string;
	location?: string;
	commitment?: string;
	level?: string;
}

export interface ILeverPostingContent {
	description?: string;
	descriptionHtml?: string;
	lists?: ILeverPostingList[];
	closing?: string;
	closingHtml?: string;
}

export interface ILeverPostingList {
	text: string;
	content: string;
}

export interface ILeverFeedback {
	id: string;
	type: string;
	text?: string;
	instructions?: string;
	fields?: ILeverFeedbackField[];
	baseTemplateId?: string;
	user?: string;
	panel?: string;
	interview?: string;
	createdAt?: number;
	completedAt?: number;
	updatedAt?: number;
	deletedAt?: number;
}

export interface ILeverFeedbackField {
	description?: string;
	type?: string;
	text?: string;
	value?: string | number;
	code?: string;
	prompt?: string;
	required?: boolean;
	scores?: ILeverFeedbackScore[];
}

export interface ILeverFeedbackScore {
	text: string;
	description?: string;
}

export interface ILeverInterview {
	id: string;
	panel?: string;
	subject?: string;
	note?: string;
	interviewers?: ILeverInterviewer[];
	timezone?: string;
	createdAt?: number;
	date?: number;
	duration?: number;
	location?: string;
	feedbackTemplate?: string;
	feedbackForms?: string[];
	feedbackReminder?: string;
	user?: string;
	stage?: string;
	canceledAt?: number;
	gcalEventUrl?: string;
	postings?: string[];
}

export interface ILeverInterviewer {
	id: string;
	name?: string;
	email?: string;
}

export interface ILeverUser {
	id: string;
	name: string;
	username?: string;
	email: string;
	accessRole: 'super admin' | 'admin' | 'team lead' | 'member' | 'interviewer';
	photo?: string;
	createdAt?: number;
	deactivatedAt?: number;
	externalDirectoryId?: string;
	linkedContactIds?: string[];
	jobTitle?: string;
}

export interface ILeverStage {
	id: string;
	text: string;
	position?: number;
}

export interface ILeverRequisition {
	id: string;
	requisitionCode: string;
	name?: string;
	status: 'open' | 'draft' | 'approved' | 'closed' | 'onHold';
	headcountTotal?: number;
	headcountHired?: number;
	hiringManager?: string;
	owner?: string;
	backfill?: boolean;
	internalNotes?: string;
	compensationBand?: ILeverCompensationBand;
	employmentStatus?: string;
	location?: string;
	team?: string;
	department?: string;
	createdAt?: number;
	updatedAt?: number;
}

export interface ILeverCompensationBand {
	min?: number;
	max?: number;
	currency?: string;
	interval?: string;
}

export interface ILeverFile {
	id: string;
	name: string;
	uploadedAt?: number;
	downloadUrl?: string;
	ext?: string;
}

export interface ILeverNote {
	id: string;
	text: string;
	fields?: ILeverNoteField[];
	user?: string;
	secret?: boolean;
	completedAt?: number;
	createdAt?: number;
	deletedAt?: number;
}

export interface ILeverNoteField {
	type: string;
	text?: string;
	identifier?: string;
	description?: string;
	value?: string | number;
}

export interface ILeverWebhook {
	id: string;
	url: string;
	event: string;
	createdAt?: number;
	signatureToken?: string;
}

export type LeverResource =
	| 'opportunity'
	| 'application'
	| 'posting'
	| 'feedback'
	| 'interview'
	| 'user'
	| 'stage'
	| 'requisition'
	| 'file'
	| 'note'
	| 'webhook';

export type LeverOpportunityOperation =
	| 'create'
	| 'get'
	| 'getAll'
	| 'update'
	| 'updateStage'
	| 'updateArchiveState'
	| 'updateTags'
	| 'updateSources'
	| 'listDeleted';

export type LeverApplicationOperation = 'get' | 'getAll' | 'create';

export type LeverPostingOperation =
	| 'create'
	| 'get'
	| 'getAll'
	| 'update'
	| 'getApplicationQuestions'
	| 'applyToPosting';

export type LeverFeedbackOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';

export type LeverInterviewOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';

export type LeverUserOperation = 'create' | 'get' | 'getAll' | 'update' | 'deactivate' | 'reactivate';

export type LeverStageOperation = 'get' | 'getAll';

export type LeverRequisitionOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';

export type LeverFileOperation = 'upload' | 'get' | 'getAll' | 'download' | 'delete';

export type LeverNoteOperation = 'create' | 'get' | 'getAll' | 'delete';

export type LeverWebhookOperation = 'create' | 'getAll' | 'update' | 'delete';

export interface ILeverApiRequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	endpoint: string;
	body?: object;
	qs?: object;
	headers?: object;
}

export const LEVER_WEBHOOK_EVENTS = [
	'applicationCreated',
	'candidateHired',
	'candidateStageChange',
	'candidateArchiveChange',
	'candidateDeleted',
	'interviewCreated',
	'interviewUpdated',
	'interviewDeleted',
	'contactCreated',
	'contactUpdated',
] as const;

export type LeverWebhookEvent = (typeof LEVER_WEBHOOK_EVENTS)[number];
