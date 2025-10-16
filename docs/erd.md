# ERD v1 — WellTrack MVP

## Entities
**Organization**
- id (PK)
- name
- description
- createdAt

**Project**
- id (PK)
- organizationId (FK)
- name
- startDate
- endDate

**Well**
- id (PK)
- projectId (FK)
- name
- location
- depth

**Stage**
- id (PK)
- wellId (FK)
- name
- status
- startDate
- endDate

**Event**
- id (PK)
- stageId (FK)
- type (enum: drilling, completion, etc.)
- description
- timestamp

**File**
- id (PK)
- eventId (FK)
- s3Key
- fileType
- uploadedAt

**Template**
- id (PK)
- type (enum: csv, pdf, etc.)
- schema
