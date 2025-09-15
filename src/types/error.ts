export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ErrorStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface SystemError {
  id: string;
  title: string;
  description: string;
  resolution?: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  system: string;
  errorCode?: string;
  stackTrace?: string;
  imageUrl?: string;
  timestamp: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  tags: string[];
  occurrences: number;
  lastOccurrence: Date;
  userId?: string;
  createdBy?: string;
}

export interface ErrorStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
  open: number;
}