import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorSeverityBadge } from './ErrorSeverityBadge';
import { ErrorStatusBadge } from './ErrorStatusBadge';
import { SystemError } from '@/types/error';
import { Clock, User, BarChart3, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ErrorCardProps {
  error: SystemError;
}

export function ErrorCard({ error }: ErrorCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/error/${error.id}`);
  };
  return (
    <Card 
      className="bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg cursor-pointer group"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {error.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {error.description}
            </p>
            
            {error.resolution && (
              <div className="mt-2">
                <h4 className="text-xs font-medium text-foreground mb-1">Resolução:</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {error.resolution}
                </p>
              </div>
            )}

            {error.imageUrl && (
              <div className="mt-2">
                <img
                  src={error.imageUrl}
                  alt="Erro"
                  className="w-full h-20 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end flex-shrink-0">
            <ErrorSeverityBadge severity={error.severity} />
            <ErrorStatusBadge status={error.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(error.timestamp, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{error.occurrences} times</span>
            </div>
          </div>
          
          {error.assignedTo && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Assigned to {error.assignedTo}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {error.system}
            </Badge>
            {error.errorCode && (
              <Badge variant="outline" className="text-xs font-mono">
                {error.errorCode}
              </Badge>
            )}
          </div>
          
          {error.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {error.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {error.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{error.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}