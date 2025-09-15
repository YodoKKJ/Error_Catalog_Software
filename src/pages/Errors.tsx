import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ErrorCard } from '@/components/ErrorCard';
import { ErrorForm } from '@/components/ErrorForm';
import { useErrors } from '@/hooks/useErrors';
import { SystemError, ErrorSeverity, ErrorStatus } from '@/types/error';

export default function Errors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'occurrences'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedError, setSelectedError] = useState<SystemError | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [errorToDelete, setErrorToDelete] = useState<string | null>(null);

  const { errors, loading, createError, updateError, deleteError } = useErrors();

  // Filter and sort errors - now searches in title AND description
  const filteredErrors = errors
    .filter(error => {
      const matchesSearch = error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           error.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           error.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           error.errorCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           error.resolution?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || error.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || error.status === statusFilter;
      
      return matchesSearch && matchesSeverity && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'occurrences':
          comparison = a.occurrences - b.occurrences;
          break;
        case 'timestamp':
        default:
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const severityOptions = [
    { value: 'all', label: 'Todas as Severidades' },
    { value: 'critical', label: 'Crítico' },
    { value: 'high', label: 'Alto' },
    { value: 'medium', label: 'Médio' },
    { value: 'low', label: 'Baixo' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'open', label: 'Aberto' },
    { value: 'investigating', label: 'Investigando' },
    { value: 'resolved', label: 'Resolvido' },
    { value: 'closed', label: 'Fechado' },
  ];

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleCreateError = async (data: any) => {
    const tagsArray = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    await createError({
      title: data.title,
      description: data.description,
      resolution: data.resolution,
      severity: data.severity,
      status: data.status,
      system: data.system,
      errorCode: data.errorCode,
      stackTrace: data.stackTrace,
      imageUrl: data.imageUrl,
      assignedTo: data.assignedTo,
      tags: tagsArray,
    });
    setIsFormOpen(false);
  };

  const handleUpdateError = async (data: any) => {
    if (!selectedError) return;
    const tagsArray = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    await updateError(selectedError.id, {
      title: data.title,
      description: data.description,
      resolution: data.resolution,
      severity: data.severity,
      status: data.status,
      system: data.system,
      errorCode: data.errorCode,
      stackTrace: data.stackTrace,
      imageUrl: data.imageUrl,
      assignedTo: data.assignedTo,
      tags: tagsArray,
    });
    setSelectedError(null);
    setIsFormOpen(false);
  };

  const handleDeleteError = async () => {
    if (!errorToDelete) return;
    await deleteError(errorToDelete);
    setErrorToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditForm = (error: SystemError) => {
    setSelectedError(error);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedError(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (errorId: string) => {
    setErrorToDelete(errorId);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando erros...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sistema de Monitoramento de Erros</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore erros do sistema em tempo real
          </p>
        </div>
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Erro
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título, descrição, resolução, sistema ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Data</SelectItem>
                <SelectItem value="severity">Severidade</SelectItem>
                <SelectItem value="occurrences">Ocorrências</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              className="shrink-0"
            >
              {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredErrors.length} de {errors.length} erros
        </p>
      </div>

      {/* Errors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredErrors.map((error) => (
          <div key={error.id} className="relative">
            <ErrorCard error={error} />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditForm(error)}
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => confirmDelete(error.id)}
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredErrors.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum erro encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}

      {/* Dialog para criar/editar erro */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <ErrorForm
            error={selectedError || undefined}
            onSubmit={selectedError ? handleUpdateError : handleCreateError}
            onCancel={() => setIsFormOpen(false)}
            submitLabel={selectedError ? 'Atualizar' : 'Criar'}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para deletar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este erro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteError} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}