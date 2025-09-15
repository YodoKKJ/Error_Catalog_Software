import { Badge } from '@/components/ui/badge';
import { ErrorSeverity } from '@/types/error';
import { cn } from '@/lib/utils';

interface ErrorSeverityBadgeProps {
  severity: ErrorSeverity;
  className?: string;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    className: 'bg-critical/10 text-critical border-critical/20 shadow-glow-critical',
  },
  high: {
    label: 'High',
    className: 'bg-high/10 text-high border-high/20 shadow-glow-high',
  },
  medium: {
    label: 'Medium',
    className: 'bg-medium/10 text-medium border-medium/20 shadow-glow-medium',
  },
  low: {
    label: 'Low',
    className: 'bg-low/10 text-low border-low/20 shadow-glow-low',
  },
};

export function ErrorSeverityBadge({ severity, className }: ErrorSeverityBadgeProps) {
  const config = severityConfig[severity];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, 'font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}