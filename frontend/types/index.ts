// ============================================
// WellTrack MVP — TypeScript Type Definitions
// ============================================

// ---------------
// User & Auth
// ---------------

export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// ---------------
// Organization
// ---------------

export interface Organization {
  orgId: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ---------------
// Membership (RBAC)
// ---------------

export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type MembershipStatus = 'ACTIVE' | 'INVITED' | 'REMOVED';

export interface Membership {
  membershipId: string;
  orgId: string;
  userId: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  status: MembershipStatus;
}

export interface MembershipWithUser extends Membership {
  user: User;
}

// ---------------
// Project (Field)
// ---------------

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  projectId: string;
  orgId: string;
  name: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ---------------
// Well
// ---------------

export type WellStatus = 'PLANNING' | 'DRILLING' | 'COMPLETED' | 'ABANDONED';

export interface WellLocation {
  latitude: number;
  longitude: number;
}

export interface Well {
  wellId: string;
  projectId: string;
  orgId: string;
  name: string;
  wellNumber?: string;
  location?: WellLocation;
  depth?: number; // in meters
  status: WellStatus;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ---------------
// Stage
// ---------------

export type StageType = 'DRILLING' | 'COMPLETION' | 'TESTING' | 'PRODUCTION' | 'OTHER';
export type StageStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Stage {
  stageId: string;
  wellId: string;
  name: string;
  type: StageType;
  startDate: string;
  endDate?: string;
  status: StageStatus;
  order: number; // Display order (0, 1, 2...)
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ---------------
// Event
// ---------------

export type EventType = 'ACTIVITY' | 'FILE_UPLOAD' | 'STATUS_CHANGE' | 'NOTE' | 'OTHER';

export interface Event {
  eventId: string;
  wellId: string;
  stageId?: string;
  type: EventType;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string; // For range events
  metadata?: Record<string, any>;
  fileId?: string; // Related file
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ---------------
// File
// ---------------

export interface FileMetadata {
  fileId: string;
  wellId: string;
  stageId?: string;
  eventId: string; // Auto-created event on upload
  orgId: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // bytes
  s3Key: string;
  s3Bucket: string;
  uploadedAt: string;
  uploadedBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// ---------------
// Audit Log
// ---------------

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type EntityType = 'USER' | 'ORGANIZATION' | 'MEMBERSHIP' | 'PROJECT' | 'WELL' | 'STAGE' | 'EVENT' | 'FILE';

export interface AuditLog {
  logId: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  changes?: Record<string, any>; // { oldValue: ..., newValue: ... }
  userId: string;
  timestamp: string;
  ipAddress?: string;
}

// ---------------
// API Response Types
// ---------------

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  nextToken?: string;
  count: number;
}

// ---------------
// Form Input Types
// ---------------

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
}

export interface InviteMemberInput {
  email: string;
  role: UserRole;
}

export interface CreateProjectInput {
  orgId: string;
  name: string;
  location?: string;
  description?: string;
}

export interface CreateWellInput {
  projectId: string;
  name: string;
  wellNumber?: string;
  location?: WellLocation;
  depth?: number;
  startDate?: string;
}

export interface CreateStageInput {
  wellId: string;
  name: string;
  type: StageType;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface CreateEventInput {
  wellId: string;
  stageId?: string;
  type: EventType;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadInput {
  wellId: string;
  stageId?: string;
  file: File;
  tags?: string[];
}

// ---------------
// NextAuth Types
// ---------------

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
  
  interface User extends SessionUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
