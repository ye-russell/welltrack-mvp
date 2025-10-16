# WellTrack MVP — Database Schema (DynamoDB)

## Overview
This document defines the DynamoDB table structure for WellTrack MVP. We'll use a **hybrid approach** with dedicated tables for core entities to simplify queries and maintain clear relationships.

---

## Table Definitions

### 1. Users Table
**Purpose:** Store user account information

| Attribute | Type | Description |
|-----------|------|-------------|
| `userId` (PK) | String | UUID v4 |
| `email` | String | User email (unique) |
| `passwordHash` | String | Bcrypt hashed password |
| `name` | String | Full name |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `lastLoginAt` | String | ISO 8601 timestamp |

**GSI:**
- `EmailIndex`: `email` (PK) → for login queries

---

### 2. Organizations Table
**Purpose:** Store organization/company information

| Attribute | Type | Description |
|-----------|------|-------------|
| `orgId` (PK) | String | UUID v4 |
| `name` | String | Organization name |
| `description` | String | Optional description |
| `ownerId` | String | User ID of owner |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `createdBy` | String | User ID |

---

### 3. Memberships Table
**Purpose:** Link users to organizations with roles (RBAC)

| Attribute | Type | Description |
|-----------|------|-------------|
| `membershipId` (PK) | String | UUID v4 |
| `orgId` | String | Organization ID |
| `userId` | String | User ID |
| `role` | String | `OWNER`, `ADMIN`, `EDITOR`, `VIEWER` |
| `invitedBy` | String | User ID who invited |
| `invitedAt` | String | ISO 8601 timestamp |
| `status` | String | `ACTIVE`, `INVITED`, `REMOVED` |

**GSI:**
- `OrgMembersIndex`: `orgId` (PK) + `userId` (SK) → list members by org
- `UserOrgsIndex`: `userId` (PK) → list orgs by user

---

### 4. Projects Table
**Purpose:** Store projects (fields) within organizations

| Attribute | Type | Description |
|-----------|------|-------------|
| `projectId` (PK) | String | UUID v4 |
| `orgId` | String | Organization ID |
| `name` | String | Project name |
| `location` | String | Geographical location |
| `description` | String | Optional description |
| `status` | String | `ACTIVE`, `COMPLETED`, `ARCHIVED` |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `createdBy` | String | User ID |
| `updatedBy` | String | User ID |

**GSI:**
- `OrgProjectsIndex`: `orgId` (PK) + `createdAt` (SK) → list projects by org

---

### 5. Wells Table
**Purpose:** Store well information

| Attribute | Type | Description |
|-----------|------|-------------|
| `wellId` (PK) | String | UUID v4 |
| `projectId` | String | Project ID |
| `orgId` | String | Organization ID (for quick access) |
| `name` | String | Well name/identifier |
| `wellNumber` | String | Official well number |
| `location` | Map | `{ latitude: Number, longitude: Number }` |
| `depth` | Number | Total depth in meters |
| `status` | String | `PLANNING`, `DRILLING`, `COMPLETED`, `ABANDONED` |
| `startDate` | String | ISO 8601 date |
| `endDate` | String | ISO 8601 date (nullable) |
| `metadata` | Map | Flexible key-value pairs |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `createdBy` | String | User ID |
| `updatedBy` | String | User ID |

**GSI:**
- `ProjectWellsIndex`: `projectId` (PK) + `createdAt` (SK) → list wells by project
- `OrgWellsIndex`: `orgId` (PK) + `name` (SK) → search wells by org

---

### 6. Stages Table
**Purpose:** Store stages/phases of well operations

| Attribute | Type | Description |
|-----------|------|-------------|
| `stageId` (PK) | String | UUID v4 |
| `wellId` | String | Well ID |
| `name` | String | Stage name (e.g., "Drilling", "Completion") |
| `type` | String | `DRILLING`, `COMPLETION`, `TESTING`, `PRODUCTION`, `OTHER` |
| `startDate` | String | ISO 8601 timestamp |
| `endDate` | String | ISO 8601 timestamp (nullable) |
| `status` | String | `PLANNED`, `IN_PROGRESS`, `COMPLETED` |
| `order` | Number | Display order (0, 1, 2...) |
| `description` | String | Optional notes |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `createdBy` | String | User ID |
| `updatedBy` | String | User ID |

**GSI:**
- `WellStagesIndex`: `wellId` (PK) + `order` (SK) → list stages by well in order

---

### 7. Events Table
**Purpose:** Store events/activities within stages

| Attribute | Type | Description |
|-----------|------|-------------|
| `eventId` (PK) | String | UUID v4 |
| `wellId` | String | Well ID |
| `stageId` | String | Stage ID (nullable) |
| `type` | String | `ACTIVITY`, `FILE_UPLOAD`, `STATUS_CHANGE`, `NOTE`, `OTHER` |
| `title` | String | Event title |
| `description` | String | Event description |
| `startTime` | String | ISO 8601 timestamp |
| `endTime` | String | ISO 8601 timestamp (nullable, for range events) |
| `metadata` | Map | Flexible key-value pairs |
| `fileId` | String | Related file ID (nullable) |
| `createdAt` | String | ISO 8601 timestamp |
| `updatedAt` | String | ISO 8601 timestamp |
| `createdBy` | String | User ID |
| `updatedBy` | String | User ID |

**GSI:**
- `WellEventsIndex`: `wellId` (PK) + `startTime` (SK) → list events by well chronologically
- `StageEventsIndex`: `stageId` (PK) + `startTime` (SK) → list events by stage
- `DateEventsIndex`: `wellId#YYYY-MM-DD` (PK) + `startTime` (SK) → query events by date

---

### 8. Files Table
**Purpose:** Store file metadata (actual files in S3)

| Attribute | Type | Description |
|-----------|------|-------------|
| `fileId` (PK) | String | UUID v4 |
| `wellId` | String | Well ID |
| `stageId` | String | Stage ID (nullable) |
| `eventId` | String | Event ID (auto-created on upload) |
| `orgId` | String | Organization ID |
| `fileName` | String | Original filename |
| `fileType` | String | MIME type |
| `fileSize` | Number | Size in bytes |
| `s3Key` | String | S3 object key |
| `s3Bucket` | String | S3 bucket name |
| `uploadedAt` | String | ISO 8601 timestamp |
| `uploadedBy` | String | User ID |
| `tags` | List | Array of tag strings |
| `metadata` | Map | Flexible key-value pairs |

**GSI:**
- `WellFilesIndex`: `wellId` (PK) + `uploadedAt` (SK) → list files by well
- `StageFilesIndex`: `stageId` (PK) + `uploadedAt` (SK) → list files by stage
- `OrgFilesIndex`: `orgId` (PK) + `uploadedAt` (SK) → list all org files

---

### 9. AuditLog Table
**Purpose:** Track all changes for compliance and history

| Attribute | Type | Description |
|-----------|------|-------------|
| `logId` (PK) | String | UUID v4 |
| `entityType` | String | `WELL`, `STAGE`, `EVENT`, `FILE`, etc. |
| `entityId` | String | ID of the entity |
| `action` | String | `CREATE`, `UPDATE`, `DELETE` |
| `changes` | Map | Object with old/new values |
| `userId` | String | User who made the change |
| `timestamp` | String | ISO 8601 timestamp |
| `ipAddress` | String | User's IP address |

**GSI:**
- `EntityHistoryIndex`: `entityId` (PK) + `timestamp` (SK) → view entity history
- `UserActivityIndex`: `userId` (PK) + `timestamp` (SK) → view user activity

---

## Access Patterns

### Organizations
1. Get user's organizations → `UserOrgsIndex` on Memberships
2. Get organization details → `Organizations` query by PK
3. List organization members → `OrgMembersIndex` on Memberships

### Projects
1. List projects by organization → `OrgProjectsIndex` on Projects
2. Get project details → `Projects` query by PK

### Wells
1. List wells by project → `ProjectWellsIndex` on Wells
2. Get well details → `Wells` query by PK
3. Search wells by org → `OrgWellsIndex` on Wells

### Stages
1. List stages by well → `WellStagesIndex` on Stages (ordered)
2. Get stage details → `Stages` query by PK

### Events
1. List events by well → `WellEventsIndex` on Events
2. List events by stage → `StageEventsIndex` on Events
3. Query events by date → `DateEventsIndex` on Events
4. Get event details → `Events` query by PK

### Files
1. List files by well → `WellFilesIndex` on Files
2. List files by stage → `StageFilesIndex` on Files
3. Get file details → `Files` query by PK

---

## Capacity Planning

### Provisioned Mode (for MVP)
- **On-Demand Mode** recommended for MVP (auto-scaling, pay per request)
- Estimated costs: $1-5/month for testing phase

### Indexes Strategy
- Use **sparse indexes** where possible (only index items with that attribute)
- Project only necessary attributes to GSIs to save storage

---

## Security

1. **Encryption at rest:** Enable DynamoDB encryption
2. **IAM policies:** Least-privilege access for Lambda functions
3. **Data validation:** Validate all inputs before writes
4. **Audit logging:** All mutations logged to AuditLog table

---

## Next Steps

1. Create Terraform configuration for these tables
2. Implement DynamoDB client utility in `lib/db.ts`
3. Create TypeScript types matching this schema
4. Build API layer with proper access control
