import { Prisma } from '@prisma/client';

// ============================================
// Client Types
// ============================================
export type Client = Prisma.ClientGetPayload<{}>;

export type ClientWithProjects = Prisma.ClientGetPayload<{
  include: { projects: true };
}>;

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
export type ClientStatus = Prisma.ClientStatus;
export type ProjectStatus = Prisma.ProjectStatus;
export type TaskStatus = Prisma.TaskStatus;
export type TaskPriority = Prisma.TaskPriority;
