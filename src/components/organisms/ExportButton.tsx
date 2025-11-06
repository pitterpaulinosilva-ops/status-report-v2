import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Sheet } from 'lucide-react';
import { ActionItem } from '@/data/actionData';
import { FilteredActionWithTasks } from '@/lib/filterUtils';
import { TaskStorage } from '@/lib/taskStorage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: FilteredActionWithTasks[];
  searchTerm: string;
  currentFilter: string;
}

const ExportButton = ({ data, searchTerm, currentFilter }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        console.warn("No data to export for PDF.");
        return;
      }
      const doc = new jsPDF();
      
      // Título do documento
      doc.setFontSize(20);
      doc.text('Status Report FIEA - Relatório de Acompanhamento', 20, 20);
      
      // Informações do filtro
      doc.setFontSize(12);
      const filterInfo = `Filtro: ${currentFilter} | Total de ações: ${data.length}`;
      doc.text(filterInfo, 20, 35);
      
      if (searchTerm) {
        doc.text(`Busca: "${searchTerm}"`, 20, 45);
      }
      
      // Data de geração
      const today = new Date().toLocaleDateString('pt-BR');
      doc.text(`Gerado em: ${today}`, 20, searchTerm ? 55 : 45);
      
      // Preparar dados para a tabela incluindo tarefas
      const tableData: any[] = [];
      
      data.forEach(action => {
        // Adicionar ação
        tableData.push([
          action.id.toString(),
          action.action.length > 50 ? action.action.substring(0, 50) + '...' : action.action,
          action.responsible,
          action.sector,
          action.dueDate,
          action.delayStatus
        ]);
        
        // Adicionar tarefas da ação (com indentação)
        const actionTasks = TaskStorage.getTasksByActionId(action.id);
        actionTasks.forEach(task => {
          tableData.push([
            `  └ ${task.id.substring(0, 8)}`,
            `    ${task.title.length > 45 ? task.title.substring(0, 45) + '...' : task.title}`,
            task.responsible,
            task.sector,
            task.dueDate,
            task.delayStatus
          ]);
        });
      });
      
      // Criar tabela
      autoTable(doc, {
        head: [['ID', 'Ação', 'Responsável', 'Setor', 'Prazo', 'Status']],
        body: tableData,
        startY: searchTerm ? 65 : 55,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Azul
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 15 }, // ID
          1: { cellWidth: 60 }, // Ação
          2: { cellWidth: 35 }, // Responsável
          3: { cellWidth: 25 }, // Setor
          4: { cellWidth: 25 }, // Prazo
          5: { cellWidth: 25 }  // Status
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const status = data.cell.text[0];
            if (status === 'Em Atraso') {
              data.cell.styles.fillColor = [239, 68, 68]; // Vermelho
              data.cell.styles.textColor = 255;
            } else if (status === 'Concluído') {
              data.cell.styles.fillColor = [16, 185, 129]; // Verde
              data.cell.styles.textColor = 255;
            } else if (status === 'No Prazo') {
              data.cell.styles.fillColor = [14, 165, 233]; // Azul claro
              data.cell.styles.textColor = 255;
            }
          }
        }
      });
      
      // Salvar o PDF
      const fileName = `status-report-fiea-${currentFilter.toLowerCase().replace(' ', '-')}-${today.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        console.warn("No data to export for Excel.");
        return;
      }
      // Preparar dados para Excel incluindo tarefas
      const excelData: any[] = [];
      let totalTasks = 0;
      
      data.forEach(action => {
        // Adicionar ação
        excelData.push({
          'Tipo': 'Ação',
          'ID': action.id,
          'Título/Ação': action.action,
          'Acompanhamento': action.followUp,
          'Responsável': action.responsible,
          'Setor': action.sector,
          'Prazo': action.dueDate,
          'Status Original': action.status,
          'Status Atual': action.delayStatus,
          'ID Ação Pai': ''
        });
        
        // Adicionar tarefas da ação
        const actionTasks = TaskStorage.getTasksByActionId(action.id);
        totalTasks += actionTasks.length;
        
        actionTasks.forEach(task => {
          excelData.push({
            'Tipo': 'Tarefa',
            'ID': task.id,
            'Título/Ação': task.title,
            'Acompanhamento': task.description,
            'Responsável': task.responsible,
            'Setor': task.sector,
            'Prazo': task.dueDate,
            'Status Original': task.status,
            'Status Atual': task.delayStatus,
            'ID Ação Pai': action.id
          });
        });
      });
      
      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Definir larguras das colunas
      const colWidths = [
        { wch: 10 }, // Tipo
        { wch: 35 }, // ID
        { wch: 50 }, // Título/Ação
        { wch: 50 }, // Acompanhamento
        { wch: 25 }, // Responsável
        { wch: 15 }, // Setor
        { wch: 12 }, // Prazo
        { wch: 15 }, // Status Original
        { wch: 15 }, // Status Atual
        { wch: 10 }  // ID Ação Pai
      ];
      ws['!cols'] = colWidths;
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Ações');
      
      // Criar uma segunda aba com estatísticas
      const allTasks = TaskStorage.getTasks();
      const stats = {
        'Total de Ações': data.length,
        'Total de Tarefas': totalTasks,
        'Ações Em Atraso': data.filter(a => a.delayStatus === 'Em Atraso').length,
        'Ações No Prazo': data.filter(a => a.delayStatus === 'No Prazo').length,
        'Ações Concluídas': data.filter(a => a.delayStatus === 'Concluído').length,
        'Tarefas Em Atraso': allTasks.filter(t => t.delayStatus === 'Em Atraso').length,
        'Tarefas No Prazo': allTasks.filter(t => t.delayStatus === 'No Prazo').length,
        'Tarefas Concluídas': allTasks.filter(t => t.delayStatus === 'Concluído').length,
        'Filtro Aplicado': currentFilter,
        'Termo de Busca': searchTerm || 'Nenhum',
        'Data de Geração': new Date().toLocaleDateString('pt-BR')
      };
      
      const statsData = Object.entries(stats || {}).map(([key, value]) => ({ 'Métrica': key, 'Valor': value }));
      const wsStats = XLSX.utils.json_to_sheet(statsData);
      wsStats['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas');
      
      // Salvar o arquivo
      const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const fileName = `status-report-fiea-${currentFilter.toLowerCase().replace(' ', '-')}-${today}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar Excel. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting || data.length === 0}
          className="bg-white/70 dark:bg-slate-700/70 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 backdrop-blur-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} disabled={isExporting}>
          <Sheet className="w-4 h-4 mr-2" />
          Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;