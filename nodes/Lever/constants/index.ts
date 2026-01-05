/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const LEVER_API_BASE_URLS = {
	us: 'https://api.lever.co/v1',
	eu: 'https://api-eu.lever.co/v1',
} as const;

export const LEVER_AUTH_URLS = {
	authorize: 'https://auth.lever.co/authorize',
	token: 'https://auth.lever.co/oauth/token',
	audience: 'https://api.lever.co/v1/',
} as const;

export const LEVER_RATE_LIMITS = {
	requestsPerSecond: 10,
	burstLimit: 20,
} as const;

export const LEVER_PAGINATION = {
	defaultLimit: 100,
	maxLimit: 100,
} as const;

export const LEVER_ACCESS_ROLES = [
	{ name: 'Super Admin', value: 'super admin' },
	{ name: 'Admin', value: 'admin' },
	{ name: 'Team Lead', value: 'team lead' },
	{ name: 'Member', value: 'member' },
	{ name: 'Interviewer', value: 'interviewer' },
] as const;

export const LEVER_POSTING_STATES = [
	{ name: 'Published', value: 'published' },
	{ name: 'Internal', value: 'internal' },
	{ name: 'Closed', value: 'closed' },
	{ name: 'Draft', value: 'draft' },
	{ name: 'Pending', value: 'pending' },
	{ name: 'Rejected', value: 'rejected' },
] as const;

export const LEVER_REQUISITION_STATUSES = [
	{ name: 'Open', value: 'open' },
	{ name: 'Draft', value: 'draft' },
	{ name: 'Approved', value: 'approved' },
	{ name: 'Closed', value: 'closed' },
	{ name: 'On Hold', value: 'onHold' },
] as const;

export const LEVER_OPPORTUNITY_ORIGINS = [
	{ name: 'Applied', value: 'applied' },
	{ name: 'Sourced', value: 'sourced' },
	{ name: 'Referred', value: 'referred' },
	{ name: 'Agency', value: 'agency' },
] as const;

export const LEVER_CONFIDENTIALITY_OPTIONS = [
	{ name: 'Non-Confidential', value: 'non-confidential' },
	{ name: 'Confidential', value: 'confidential' },
] as const;

export const LEVER_EXPAND_OPTIONS = [
	{ name: 'Applications', value: 'applications' },
	{ name: 'Stage', value: 'stage' },
	{ name: 'Owner', value: 'owner' },
	{ name: 'Followers', value: 'followers' },
	{ name: 'Sourcers', value: 'sourcers' },
	{ name: 'Contact', value: 'contact' },
] as const;

export const LEVER_WEBHOOK_EVENTS = [
	{ name: 'Application Created', value: 'applicationCreated' },
	{ name: 'Candidate Hired', value: 'candidateHired' },
	{ name: 'Candidate Stage Change', value: 'candidateStageChange' },
	{ name: 'Candidate Archive Change', value: 'candidateArchiveChange' },
	{ name: 'Candidate Deleted', value: 'candidateDeleted' },
	{ name: 'Interview Created', value: 'interviewCreated' },
	{ name: 'Interview Updated', value: 'interviewUpdated' },
	{ name: 'Interview Deleted', value: 'interviewDeleted' },
	{ name: 'Contact Created', value: 'contactCreated' },
	{ name: 'Contact Updated', value: 'contactUpdated' },
] as const;

export const LEVER_ARCHIVE_REASONS = [
	{ name: 'Hired', value: 'hired' },
	{ name: 'Withdrew', value: 'withdrew' },
	{ name: 'Position Filled', value: 'position-filled' },
	{ name: 'Not Qualified', value: 'not-qualified' },
	{ name: 'Declined Offer', value: 'declined-offer' },
	{ name: 'Timing', value: 'timing' },
	{ name: 'Other', value: 'other' },
] as const;

export const LEVER_APPLICATION_TYPES = [
	{ name: 'Posting', value: 'posting' },
	{ name: 'Referral', value: 'referral' },
	{ name: 'User', value: 'user' },
] as const;

export const LEVER_RESOURCES = {
	opportunity: 'opportunities',
	application: 'applications',
	posting: 'postings',
	feedback: 'feedback',
	interview: 'interviews',
	user: 'users',
	stage: 'stages',
	requisition: 'requisitions',
	file: 'files',
	note: 'notes',
	webhook: 'webhooks',
} as const;

export const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

export const LICENSING_WARNED = Symbol('LEVER_NODE_LICENSE_WARNED');
