import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

type ActivityType = 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'COMMENTED'

interface LogActivityParams {
  type: ActivityType
  entityType: 'client' | 'project' | 'task' | 'note'
  entityId: string
  entityName: string
  description: string
  metadata?: Record<string, any>
  userId?: string
  userName?: string
}

/**
 * Zentrale Funktion zum Loggen von Aktivitäten im System
 */
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activity.create({
      data: {
        type: params.type,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        userId: params.userId || null,
        userName: params.userName || 'System',
      },
    })
  } catch (error) {
    // Silent fail - Activity-Logging sollte niemals die Haupt-Operation blockieren
    console.error('Failed to log activity:', error)
  }
}

/**
 * Hilfsfunktion für CREATED Events
 */
export async function logCreated(
  entityType: 'client' | 'project' | 'task' | 'note',
  entityId: string,
  entityName: string,
  userId?: string,
  userName?: string
) {
  await logActivity({
    type: 'CREATED',
    entityType,
    entityId,
    entityName,
    description: `${entityType === 'client' ? 'Kunde' : entityType === 'project' ? 'Projekt' : entityType === 'task' ? 'Aufgabe' : 'Notiz'} "${entityName}" wurde erstellt`,
    userId,
    userName,
  })
}

/**
 * Hilfsfunktion für UPDATED Events
 */
export async function logUpdated(
  entityType: 'client' | 'project' | 'task' | 'note',
  entityId: string,
  entityName: string,
  changes?: string[],
  userId?: string,
  userName?: string
) {
  const changesText = changes && changes.length > 0 
    ? ` (${changes.join(', ')})` 
    : ''
  
  await logActivity({
    type: 'UPDATED',
    entityType,
    entityId,
    entityName,
    description: `${entityType === 'client' ? 'Kunde' : entityType === 'project' ? 'Projekt' : entityType === 'task' ? 'Aufgabe' : 'Notiz'} "${entityName}" wurde aktualisiert${changesText}`,
    metadata: changes ? { changes } : undefined,
    userId,
    userName,
  })
}

/**
 * Hilfsfunktion für DELETED Events
 */
export async function logDeleted(
  entityType: 'client' | 'project' | 'task' | 'note',
  entityId: string,
  entityName: string,
  userId?: string,
  userName?: string
) {
  await logActivity({
    type: 'DELETED',
    entityType,
    entityId,
    entityName,
    description: `${entityType === 'client' ? 'Kunde' : entityType === 'project' ? 'Projekt' : entityType === 'task' ? 'Aufgabe' : 'Notiz'} "${entityName}" wurde gelöscht`,
    userId,
    userName,
  })
}

/**
 * Hilfsfunktion für STATUS_CHANGED Events
 */
export async function logStatusChanged(
  entityType: 'client' | 'project' | 'task',
  entityId: string,
  entityName: string,
  oldStatus: string,
  newStatus: string,
  userId?: string,
  userName?: string
) {
  await logActivity({
    type: 'STATUS_CHANGED',
    entityType,
    entityId,
    entityName,
    description: `Status von "${entityName}" geändert: ${oldStatus} → ${newStatus}`,
    metadata: { oldStatus, newStatus },
    userId,
    userName,
  })
}
