import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, BarChart3, Tag, AlertTriangle, Code, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ErrorSeverityBadge } from '@/components/ErrorSeverityBadge';
import { ErrorStatusBadge } from '@/components/ErrorStatusBadge';
import { useErrors } from '@/hooks/useErrors';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ErrorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { errors, loading } = useErrors();
  
  const error = errors.find(e => e.id === id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando detalhes do erro...</div>
      </div>
    );
  }

  if (!error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Erro não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O erro solicitado não foi encontrado ou pode ter sido removido.
          </p>
          <Button onClick={() => navigate('/')}>Voltar para a lista</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header com botão de voltar */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4 -ml-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a lista
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{error.title}</h1>
            <p className="text-muted-foreground">Detalhes completos do erro</p>
          </div>
          <div className="flex gap-2">
            <ErrorSeverityBadge severity={error.severity} />
            <ErrorStatusBadge status={error.status} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informações básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">Título</h4>
              <p className="text-muted-foreground">{error.title}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium text-foreground mb-1">Descrição</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{error.description}</p>
            </div>
            {error.resolution && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Resolução</h4>
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                      {error.resolution}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Informações técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Informações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Sistema</h4>
                <Badge variant="secondary">{error.system}</Badge>
              </div>
              {error.errorCode && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Código do Erro</h4>
                  <Badge variant="outline" className="font-mono">{error.errorCode}</Badge>
                </div>
              )}
            </div>
            
            {error.stackTrace && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Stack Trace</h4>
                  <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                      {error.stackTrace}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline e Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline e Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Primeiro Ocorrência</h4>
                <p className="text-muted-foreground">
                  {format(error.timestamp, 'PPpp', { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(error.timestamp, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Última Ocorrência</h4>
                <p className="text-muted-foreground">
                  {format(error.lastOccurrence, 'PPpp', { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(error.lastOccurrence, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{error.occurrences}</strong> ocorrências
                </span>
              </div>
              
              {error.resolvedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Resolvido em: <strong className="text-foreground">
                      {format(error.resolvedAt, 'PPpp', { locale: ptBR })}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {error.assignedTo && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Atribuído a: <strong className="text-foreground">{error.assignedTo}</strong>
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tags e Imagem */}
        {(error.tags.length > 0 || error.imageUrl) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Detalhes Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {error.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {error.imageUrl && (
                <>
                  {error.tags.length > 0 && <Separator />}
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imagem do Erro
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={error.imageUrl}
                        alt="Screenshot do erro"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}