// ============================================
// WellTrack MVP — Zod Validation Schemas
// ============================================

import { z } from 'zod';

// ---------------
// User & Auth Schemas
// ---------------

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// ---------------
// Organization Schemas
// ---------------

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']),
});

// ---------------
// Project Schemas
// ---------------

export const createProjectSchema = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

// ---------------
// Well Schemas
// ---------------

export const wellLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createWellSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'Well name is required').max(100),
  wellNumber: z.string().max(50).optional(),
  location: wellLocationSchema.optional(),
  depth: z.number().positive('Depth must be positive').optional(),
  startDate: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateWellSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  wellNumber: z.string().max(50).optional(),
  location: wellLocationSchema.optional(),
  depth: z.number().positive().optional(),
  status: z.enum(['PLANNING', 'DRILLING', 'COMPLETED', 'ABANDONED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// ---------------
// Stage Schemas
// ---------------

export const createStageSchema = z.object({
  wellId: z.string().uuid('Invalid well ID'),
  name: z.string().min(1, 'Stage name is required').max(100),
  type: z.enum(['DRILLING', 'COMPLETION', 'TESTING', 'PRODUCTION', 'OTHER']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime().optional(),
  description: z.string().max(1000).optional(),
}).refine(
  (data) => {
    if (data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const updateStageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['DRILLING', 'COMPLETION', 'TESTING', 'PRODUCTION', 'OTHER']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  description: z.string().max(1000).optional(),
});

// ---------------
// Event Schemas
// ---------------

export const createEventSchema = z.object({
  wellId: z.string().uuid('Invalid well ID'),
  stageId: z.string().uuid().optional(),
  type: z.enum(['ACTIVITY', 'FILE_UPLOAD', 'STATUS_CHANGE', 'NOTE', 'OTHER']),
  title: z.string().min(1, 'Event title is required').max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const updateEventSchema = z.object({
  type: z.enum(['ACTIVITY', 'FILE_UPLOAD', 'STATUS_CHANGE', 'NOTE', 'OTHER']).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// ---------------
// File Schemas
// ---------------

export const fileUploadSchema = z.object({
  wellId: z.string().uuid('Invalid well ID'),
  stageId: z.string().uuid().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string(),
  fileSize: z.number().positive().max(100 * 1024 * 1024, 'File size must be less than 100MB'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// ---------------
// Query Schemas
// ---------------

export const listProjectsSchema = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
  limit: z.number().int().positive().max(100).optional(),
  nextToken: z.string().optional(),
});

export const listWellsSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  limit: z.number().int().positive().max(100).optional(),
  nextToken: z.string().optional(),
});

export const listStagesSchema = z.object({
  wellId: z.string().uuid('Invalid well ID'),
});

export const listEventsSchema = z.object({
  wellId: z.string().uuid('Invalid well ID'),
  stageId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).optional(),
  nextToken: z.string().optional(),
});

export const listFilesSchema = z.object({
  wellId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  orgId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).optional(),
  nextToken: z.string().optional(),
}).refine(
  (data) => data.wellId || data.stageId || data.orgId,
  {
    message: 'At least one of wellId, stageId, or orgId must be provided',
  }
);

// ---------------
// Type Exports
// ---------------

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateWellInput = z.infer<typeof createWellSchema>;
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
