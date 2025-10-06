import { z } from 'zod';

// Schema para validação de entrada de busca
export const searchInputSchema = z.string()
  .min(0)
  .max(500)
  .regex(/^[\w\s\-.#@(),:\u00C0-\u017F]*$/u, 'Caracteres especiais não permitidos')
  .transform(input => input.trim());

// Schema para validação de entrada do chatbot
export const chatInputSchema = z.string()
  .min(1, 'Mensagem não pode estar vazia')
  .max(1000, 'Mensagem muito longa')
  .regex(/^[\w\s\-.#@(),:?!\u00C0-\u017F]*$/u, 'Caracteres especiais não permitidos')
  .transform(input => input.trim());

// Schema para validação de filtros
export const filterSchema = z.object({
  currentFilter: z.enum(['all', 'Em Atraso', 'No Prazo', 'Concluído']),
  searchTerm: searchInputSchema,
  sortField: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional()
});

// Schema para validação de dados persistidos
export const persistedStateSchema = z.object({
  scrollPosition: z.number().min(0),
  activeFilters: filterSchema.optional(),
  selectedView: z.string().optional(),
  lastUpdated: z.number()
});

// Função utilitária para sanitizar HTML
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Função para validar e sanitizar entrada
export function validateAndSanitizeInput(input: string, schema: z.ZodSchema): string {
  try {
    const validated = schema.parse(input);
    return sanitizeHtml(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Entrada inválida: ${error.errors[0].message}`);
    }
    throw error;
  }
}

// Tipos derivados dos schemas
export type SearchInput = z.infer<typeof searchInputSchema>;
export type ChatInput = z.infer<typeof chatInputSchema>;
export type FilterState = z.infer<typeof filterSchema>;
export type PersistedState = z.infer<typeof persistedStateSchema>;