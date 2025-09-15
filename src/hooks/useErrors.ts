import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemError, ErrorStats } from '@/types/error';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useErrors() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    open: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('errors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar os erros');
        console.error('Error fetching errors:', error);
        return;
      }

      const transformedErrors: SystemError[] = data.map(error => ({
        id: error.id,
        title: error.title,
        description: error.description,
        resolution: error.resolution,
        severity: error.severity,
        status: error.status,
        system: error.system,
        errorCode: error.error_code,
        stackTrace: error.stack_trace,
        imageUrl: error.image_url,
        timestamp: new Date(error.timestamp),
        resolvedAt: error.resolved_at ? new Date(error.resolved_at) : undefined,
        assignedTo: error.assigned_to,
        tags: error.tags || [],
        occurrences: error.occurrences,
        lastOccurrence: new Date(error.last_occurrence),
        userId: error.user_id,
        createdBy: undefined, // Will fetch separately later
      }));

      setErrors(transformedErrors);

      // Calculate stats
      const newStats: ErrorStats = {
        total: transformedErrors.length,
        critical: transformedErrors.filter(e => e.severity === 'critical').length,
        high: transformedErrors.filter(e => e.severity === 'high').length,
        medium: transformedErrors.filter(e => e.severity === 'medium').length,
        low: transformedErrors.filter(e => e.severity === 'low').length,
        resolved: transformedErrors.filter(e => e.status === 'resolved').length,
        open: transformedErrors.filter(e => e.status === 'open').length,
      };
      setStats(newStats);
    } catch (error) {
      toast.error('Erro ao carregar os erros');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createError = async (errorData: Omit<SystemError, 'id' | 'timestamp' | 'lastOccurrence' | 'occurrences' | 'userId' | 'createdBy'>) => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('errors')
        .insert({
          title: errorData.title,
          description: errorData.description,
          resolution: errorData.resolution,
          severity: errorData.severity,
          status: errorData.status,
          system: errorData.system,
          error_code: errorData.errorCode,
          stack_trace: errorData.stackTrace,
          image_url: errorData.imageUrl,
          resolved_at: errorData.resolvedAt?.toISOString(),
          assigned_to: errorData.assignedTo,
          tags: errorData.tags,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar o erro');
        console.error('Error creating error:', error);
        return null;
      }

      toast.success('Erro criado com sucesso');
      await fetchErrors();
      return data;
    } catch (error) {
      toast.error('Erro ao criar o erro');
      console.error('Error:', error);
      return null;
    }
  };

  const updateError = async (id: string, errorData: Partial<SystemError>) => {
    try {
      const { data, error } = await supabase
        .from('errors')
        .update({
          title: errorData.title,
          description: errorData.description,
          resolution: errorData.resolution,
          severity: errorData.severity,
          status: errorData.status,
          system: errorData.system,
          error_code: errorData.errorCode,
          stack_trace: errorData.stackTrace,
          image_url: errorData.imageUrl,
          resolved_at: errorData.resolvedAt?.toISOString(),
          assigned_to: errorData.assignedTo,
          tags: errorData.tags,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar o erro');
        console.error('Error updating error:', error);
        return null;
      }

      toast.success('Erro atualizado com sucesso');
      await fetchErrors();
      return data;
    } catch (error) {
      toast.error('Erro ao atualizar o erro');
      console.error('Error:', error);
      return null;
    }
  };

  const deleteError = async (id: string) => {
    try {
      const { error } = await supabase
        .from('errors')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao deletar o erro');
        console.error('Error deleting error:', error);
        return false;
      }

      toast.success('Erro deletado com sucesso');
      await fetchErrors();
      return true;
    } catch (error) {
      toast.error('Erro ao deletar o erro');
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  return {
    errors,
    stats,
    loading,
    fetchErrors,
    createError,
    updateError,
    deleteError,
  };
}