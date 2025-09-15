import { Badge } from '@/components/ui/badge';
import { ErrorStatus } from '@/types/error';
import { cn } from '@/lib/utils';

interface ErrorStatusBadgeProps {
  status: ErrorStatus;
  className?: string;
}

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-critical/10 text-critical border-critical/20',
  },
  investigating: {
    label: 'Investigating',
    className: 'bg-high/10 text-high border-high/20',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-low/10 text-low border-low/20',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted/10 text-muted-foreground border-muted/20',
  },
};

export function ErrorStatusBadge({ status, className }: ErrorStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, 'font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}