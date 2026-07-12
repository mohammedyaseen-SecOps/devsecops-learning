import { Request, Response, NextFunction } from 'express';
import { sequelize } from '@/models';
import { logger } from '@/utils/logger';
import { AuditAction, EntityType } from '@/types';

/**
 * Audit Log Entry Model
 * Stored in audit schema in database
 */
async function createAuditLog(data: {
  tenantId: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}): Promise<void> {
  try {
    await sequelize.query(
      `INSERT INTO audit.audit_logs 
       (tenant_id, user_id, action, entity_type, entity_id, entity_name, changes, ip_address, user_agent, status, error_message)
       VALUES (:tenantId, :userId, :action, :entityType, :entityId, :entityName, :changes, :ipAddress, :userAgent, :status, :errorMessage)`,
      {
        replacements: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityName: data.entityName,
          changes: data.changes ? JSON.stringify(data.changes) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status,
          errorMessage: data.errorMessage,
        },
        raw: true,
      }
    );
  } catch (error) {
    logger.error('Failed to create audit log', { error });
    // Don't throw - audit logging should not block the main operation
  }
}

/**
 * Audit logging middleware
 * Logs CREATE, UPDATE, DELETE operations
 */
export const auditLog = (
  action: AuditAction,
  entityType: EntityType,
  getEntityId: (req: Request) => string = req => req.params.id,
  getEntityName: (req: Request) => string = req => req.body?.name || req.params.id
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const user = req.user;

    // Store original send method
    const originalSend = res.send;

    res.send = function (data) {
      // Log after response is sent
      const entityId = getEntityId(req);
      const entityName = getEntityName(req);
      const status = res.statusCode < 400 ? 'success' : 'failure';

      // Get changes if available
      let changes = undefined;
      if ([AuditAction.UPDATE, AuditAction.CREATE].includes(action)) {
        changes = {
          user: user.email,
          timestamp: new Date().toISOString(),
          ...req.body,
        };
      }

      createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        action,
        entityType,
        entityId,
        entityName,
        changes,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status,
        errorMessage: status === 'failure' ? (data as any)?.error?.message : undefined,
      }).catch(error => {
        logger.error('Audit log creation failed', { error });
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Manual audit log creation
 */
export async function logAuditEvent(data: {
  tenantId: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failure';
  errorMessage?: string;
}): Promise<void> {
  return createAuditLog({
    ...data,
    status: data.status || 'success',
  });
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  tenantId: string;
  userId?: string;
  entityType?: EntityType;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    let query = `SELECT * FROM audit.audit_logs WHERE tenant_id = :tenantId`;
    const replacements: Record<string, any> = { tenantId: filters.tenantId };

    if (filters.userId) {
      query += ` AND user_id = :userId`;
      replacements.userId = filters.userId;
    }

    if (filters.entityType) {
      query += ` AND entity_type = :entityType`;
      replacements.entityType = filters.entityType;
    }

    if (filters.action) {
      query += ` AND action = :action`;
      replacements.action = filters.action;
    }

    if (filters.startDate) {
      query += ` AND created_at >= :startDate`;
      replacements.startDate = filters.startDate;
    }

    if (filters.endDate) {
      query += ` AND created_at <= :endDate`;
      replacements.endDate = filters.endDate;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT :limit`;
      replacements.limit = filters.limit;
    }

    if (filters.offset) {
      query += ` OFFSET :offset`;
      replacements.offset = filters.offset;
    }

    const result = await sequelize.query(query, {
      replacements,
      raw: true,
    });

    return result[0] as any[];
  } catch (error) {
    logger.error('Failed to get audit logs', { error });
    throw error;
  }
}

/**
 * Export audit logs (for compliance)
 */
export async function exportAuditLogs(
  tenantId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  try {
    const logs = await getAuditLogs({ tenantId, limit: 10000 });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'Tenant ID',
        'User ID',
        'Action',
        'Entity Type',
        'Entity ID',
        'Status',
        'Created At',
      ];

      const rows = logs.map(log => [
        log.id,
        log.tenant_id,
        log.user_id,
        log.action,
        log.entity_type,
        log.entity_id,
        log.status,
        log.created_at,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    }

    throw new Error('Unsupported export format');
  } catch (error) {
    logger.error('Failed to export audit logs', { error });
    throw error;
  }
}

/**
 * Cleanup old audit logs (retention policy: 7 years by default)
 */
export async function cleanupOldAuditLogs(retentionDays: number = 365 * 7): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    await sequelize.query(
      `DELETE FROM audit.audit_logs WHERE created_at < :cutoffDate`,
      {
        replacements: { cutoffDate },
        raw: true,
      }
    );

    logger.info(`✓ Cleaned up audit logs older than ${retentionDays} days`);
  } catch (error) {
    logger.error('Failed to cleanup audit logs', { error });
    throw error;
  }
}

export default {
  auditLog,
  logAuditEvent,
  getAuditLogs,
  exportAuditLogs,
  cleanupOldAuditLogs,
};
