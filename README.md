# n8n-nodes-lever

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Lever, a modern applicant tracking system (ATS) that combines ATS and CRM functionality. This node enables workflow automation for recruiting operations, candidate management, and hiring workflows through Lever's REST API.

![n8n](https://img.shields.io/badge/n8n-community--node-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)

## Features

- **11 Resource Categories**: Opportunities, Applications, Postings, Feedback, Interviews, Users, Stages, Requisitions, Files, Notes, and Webhooks
- **60+ Operations**: Comprehensive CRUD operations across all resources
- **Dual Authentication**: Support for both API Key (HTTP Basic) and OAuth2 authentication
- **Multi-Region Support**: Native support for both US and EU Lever API endpoints
- **Webhook Triggers**: Real-time event notifications for 10 different event types
- **File Operations**: Upload, download, and manage candidate files
- **Pagination Handling**: Automatic pagination for large result sets
- **Rate Limit Management**: Built-in exponential backoff for rate limit handling

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-lever` and confirm installation

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-lever
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-lever.git
cd n8n-nodes-lever

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-lever

# Restart n8n
n8n start
```

## Credentials Setup

### API Key Authentication

| Field | Description |
|-------|-------------|
| **Authentication Type** | Select "API Key" |
| **API Key** | Your Lever API key from Settings > Integrations & API |
| **Region** | Select "US" or "EU" based on your Lever instance |

### OAuth2 Authentication

| Field | Description |
|-------|-------------|
| **Authentication Type** | Select "OAuth2" |
| **Client ID** | Your OAuth2 client ID |
| **Client Secret** | Your OAuth2 client secret |
| **Region** | Select "US" or "EU" based on your Lever instance |

## Resources & Operations

### Opportunity (Candidate)
| Operation | Description |
|-----------|-------------|
| Create | Create a new opportunity |
| Get | Retrieve a single opportunity |
| Get Many | List all opportunities with filters |
| Update | Update opportunity details |
| Update Stage | Move to a different pipeline stage |
| Update Archive State | Archive or unarchive |
| Update Tags | Add or remove tags |
| Update Sources | Update sourcing information |
| List Deleted | Get deleted opportunities |

### Application
| Operation | Description |
|-----------|-------------|
| Create | Create a new application |
| Get | Get application details |
| Get Many | List applications for an opportunity |

### Posting (Job)
| Operation | Description |
|-----------|-------------|
| Create | Create a new job posting |
| Get | Get posting details |
| Get Many | List all postings |
| Update | Update posting details |
| Get Application Questions | Get application form questions |
| Apply to Posting | Submit an application |

### Feedback
| Operation | Description |
|-----------|-------------|
| Create | Submit feedback form |
| Get | Get feedback details |
| Get Many | List all feedback |
| Update | Update feedback |
| Delete | Delete feedback |

### Interview
| Operation | Description |
|-----------|-------------|
| Create | Schedule an interview |
| Get | Get interview details |
| Get Many | List interviews |
| Update | Update interview details |
| Delete | Cancel an interview |

### User
| Operation | Description |
|-----------|-------------|
| Create | Create a new user |
| Get | Get user details |
| Get Many | List all users |
| Update | Update user details |
| Deactivate | Deactivate a user |
| Reactivate | Reactivate a user |

### Stage
| Operation | Description |
|-----------|-------------|
| Get | Get stage details |
| Get Many | List pipeline stages |

### Requisition
| Operation | Description |
|-----------|-------------|
| Create | Create a new requisition |
| Get | Get requisition details |
| Get Many | List requisitions |
| Update | Update requisition |
| Delete | Delete requisition |

### File
| Operation | Description |
|-----------|-------------|
| Upload | Upload a file to an opportunity |
| Get | Get file metadata |
| Get Many | List files for an opportunity |
| Download | Download a file |
| Delete | Delete a file |

### Note
| Operation | Description |
|-----------|-------------|
| Create | Add a note |
| Get | Get note details |
| Get Many | List notes |
| Delete | Delete a note |

### Webhook
| Operation | Description |
|-----------|-------------|
| Create | Create a webhook |
| Get Many | List webhooks |
| Update | Update webhook |
| Delete | Delete webhook |

## Trigger Node

The Lever Trigger node listens for real-time events from Lever:

| Event | Description |
|-------|-------------|
| Application Created | New application submitted |
| Candidate Hired | Candidate marked as hired |
| Candidate Stage Change | Candidate moved to new stage |
| Candidate Archive Change | Candidate archived/unarchived |
| Candidate Deleted | Candidate deleted |
| Interview Created | New interview scheduled |
| Interview Updated | Interview details changed |
| Interview Deleted | Interview cancelled |
| Contact Created | New contact added |
| Contact Updated | Contact details updated |

## Usage Examples

### Create a New Opportunity

```javascript
// Example: Create an opportunity from a form submission
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "posting_id": "abc123",
  "origin": "applied",
  "sources": ["LinkedIn"],
  "tags": ["engineering", "senior"]
}
```

### Move Candidate to Next Stage

```javascript
// Example: Update opportunity stage
{
  "opportunityId": "opp_123",
  "stageId": "stage_456"
}
```

### Schedule an Interview

```javascript
// Example: Create interview
{
  "opportunityId": "opp_123",
  "panelId": "panel_789",
  "interviewers": ["user_001", "user_002"],
  "date": "2024-02-15T14:00:00Z",
  "duration": 60,
  "location": "Conference Room A"
}
```

## Lever Concepts

### Opportunities vs Contacts
- **Opportunity**: A candidate for a specific job opening
- **Contact**: The person's profile, which can have multiple opportunities

### Pipeline Stages
Lever uses customizable pipeline stages to track candidate progress:
- New Lead → Reached Out → Phone Screen → Onsite → Offer → Hired

### Archive Reasons
When archiving candidates, specify a reason:
- Hired, Withdrew, Position Filled, Not Qualified, Declined Offer, Timing, Other

## API Regions

| Region | Base URL |
|--------|----------|
| US | https://api.lever.co/v1 |
| EU | https://api-eu.lever.co/v1 |

## Error Handling

The node handles common API errors:

| Status | Description | Resolution |
|--------|-------------|------------|
| 400 | Invalid request | Check parameter values |
| 401 | Unauthorized | Verify API key |
| 403 | Forbidden | Check permissions |
| 404 | Not found | Verify resource ID |
| 429 | Rate limited | Automatic retry with backoff |
| 500 | Server error | Retry later |

## Security Best Practices

1. **Store API keys securely**: Use n8n's credential storage
2. **Use OAuth2 for production**: More secure than API keys
3. **Verify webhook signatures**: Enable signature verification in trigger
4. **Limit API scopes**: Request only necessary permissions
5. **Monitor API usage**: Watch for unusual patterns

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-lever/issues)
- **Documentation**: [Lever API Docs](https://hire.lever.co/developer/documentation)
- **Community**: [n8n Community](https://community.n8n.io)

## Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [Lever](https://lever.co) - Talent acquisition suite
- [Velocity BPA](https://velobpa.com) - Business process automation
