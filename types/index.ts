import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { clientSchema } from '@/lib/validations/client';

// ============================================
// Client Types
// ============================================
export type Client = Prisma.ClientGetPayload<{}>;

export type ClientWithProjects = Prisma.ClientGetPayload<{
  include: { projects: true };
}>;

export type CreateClientDTO = z.infer<typeof clientSchema>;
export type UpdateClientDTO = z.infer<typeof clientSchema>;

// ============================================
// Project Types
// ============================================
export type Project = Prisma.ProjectGetPayload<{}>;

export type ProjectWithClient = Prisma.ProjectGetPayload<{
  include: { client: true };
}>;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    client: true;
    tasks: true;
    notes: true;
  };
}>;

// ============================================
// Task Types
// ============================================
export type Task = Prisma.TaskGetPayload<{}>;

export type TaskWithProject = Prisma.TaskGetPayload<{
  include: { project: true };
}>;

export type TaskWithProjectAndClient = Prisma.TaskGetPayload<{
  include: {
    project: {
      include: {
        client: true;
      };
    };
  };
}>;

// ============================================
// Note Types
// ============================================
export type Note = Prisma.NoteGetPayload<{}>;

export type NoteWithProject = Prisma.NoteGetPayload<{
  include: { project: true };
}>;

// ============================================
// API Response Types
// ============================================
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

export type ApiResponseWithMeta<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ============================================
// Enum Helper Types
// ============================================
import { ClientStatus, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
export type { ClientStatus, ProjectStatus, TaskStatus, TaskPriority };
