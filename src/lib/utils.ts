
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse, isAfter } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDelayStatus(dueDate: string, currentStatus: string, existingDelayStatus?: string): string {
  // Se já está concluído, sempre retorna Concluído
  if (currentStatus === 'Concluído') {
    return 'Concluído';
  }

  try {
    // Converte a data do formato DD/MM/YYYY para objeto Date
    const dueDateObj = parse(dueDate, 'dd/MM/yyyy', new Date());
    const today = new Date();
    
    // Remove horas para comparar apenas as datas
    today.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);
    
    // Se a data atual é depois da data de vencimento e não está concluído
    if (isAfter(today, dueDateObj)) {
      return 'Em Atraso';
    } else {
      return 'No Prazo';
    }
  } catch (error) {
    // Em caso de erro na conversão, considera em atraso se não concluído
    console.warn('Erro ao processar data:', dueDate, error);
    return 'Em Atraso';
  }
}
