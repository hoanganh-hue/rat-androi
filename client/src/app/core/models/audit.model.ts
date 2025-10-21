// Audit trail model and interfaces

export interface AuditTrail {
  id: string;
  user_id: string;
  action: string;
  target_id?: string;
  target_type?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export interface AuditQuery {
  user_id?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

