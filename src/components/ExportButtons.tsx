import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { SystemError } from '@/types/error';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportButtonsProps {
  errors: SystemError[];
  filteredErrors: SystemError[];
}

export function ExportButtons({ errors, filteredErrors }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = (data: SystemError[], filename: string) => {
    const headers = [
      'ID',
      'Título',
      'Descrição',
      'Severidade',
      'Status',
      'Sistema',
      'Código do Erro',
      'Responsável',
      'Tags',
      'Ocorrências',
      'Criado em',
      'Última Ocorrência',
      'Resolvido em'
    ];

    const csvData = data.map(error => [
      error.id,
      error.title,
      error.description,
      error.severity,
      error.status,
      error.system,
      error.errorCode || '',
      error.assignedTo || '',
      error.tags.join('; '),
      error.occurrences,
      error.timestamp.toLocaleDateString('pt-BR'),
      error.lastOccurrence.toLocaleDateString('pt-BR'),
      error.resolvedAt?.toLocaleDateString('pt-BR') || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: SystemError[], filename: string) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Erros - ErrorTracker', 20, 20);
    
    // Data de geração
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    doc.text(`Total de erros: ${data.length}`, 20, 40);

    // Estatísticas
    const stats = {
      critical: data.filter(e => e.severity === 'critical').length,
      high: data.filter(e => e.severity === 'high').length,
      medium: data.filter(e => e.severity === 'medium').length,
      low: data.filter(e => e.severity === 'low').length,
      open: data.filter(e => e.status === 'open').length,
      resolved: data.filter(e => e.status === 'resolved').length,
    };

    doc.text(`Críticos: ${stats.critical} | Altos: ${stats.high} | Médios: ${stats.medium} | Baixos: ${stats.low}`, 20, 50);
    doc.text(`Abertos: ${stats.open} | Resolvidos: ${stats.resolved}`, 20, 60);

    // Tabela
    const tableData = data.map(error => [
      error.title.length > 30 ? error.title.substring(0, 27) + '...' : error.title,
      error.severity,
      error.status,
      error.system,
      error.occurrences,
      error.timestamp.toLocaleDateString('pt-BR'),
    ]);

    (doc as any).autoTable({
      head: [['Título', 'Severidade', 'Status', 'Sistema', 'Ocorrências', 'Criado em']],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
      },
    });

    doc.save(filename);
  };

  const handleExport = async (format: 'csv' | 'pdf', dataType: 'all' | 'filtered') => {
    setIsExporting(true);
    
    try {
      const dataToExport = dataType === 'all' ? errors : filteredErrors;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `erros-${dataType === 'all' ? 'todos' : 'filtrados'}-${timestamp}.${format}`;

      if (format === 'csv') {
        exportToCSV(dataToExport, filename);
      } else {
        exportToPDF(dataToExport, filename);
      }

      toast({
        title: "Exportação concluída!",
        description: `Arquivo ${format.toUpperCase()} baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport('csv', 'filtered')}>
          <File className="mr-2 h-4 w-4" />
          CSV - Erros Filtrados ({filteredErrors.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv', 'all')}>
          <File className="mr-2 h-4 w-4" />
          CSV - Todos os Erros ({errors.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf', 'filtered')}>
          <FileText className="mr-2 h-4 w-4" />
          PDF - Erros Filtrados ({filteredErrors.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf', 'all')}>
          <FileText className="mr-2 h-4 w-4" />
          PDF - Todos os Erros ({errors.length})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}