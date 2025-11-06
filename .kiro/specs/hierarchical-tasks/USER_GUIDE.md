# Guia do Usuário - Sistema Hierárquico de Tarefas

## 📋 Visão Geral

O Sistema Hierárquico de Tarefas permite que você organize e gerencie atividades detalhadas dentro de cada ação do Plano de Ação ONA. Cada ação pode conter múltiplas tarefas com os mesmos campos e funcionalidades.

## 🚀 Como Usar

### Visualizar Tarefas

1. No **Plano de Ação**, localize o card da ação desejada
2. Se a ação tiver tarefas, você verá um indicador com o número de tarefas
3. Clique no indicador para expandir e visualizar as tarefas
4. Uma barra de progresso mostrará o status geral das tarefas

### Adicionar Nova Tarefa

1. Expanda a lista de tarefas de uma ação
2. Clique no botão **"Adicionar"**
3. Preencha o formulário:
   - **Título** (obrigatório): Nome da tarefa
   - **Descrição** (opcional): Detalhes da tarefa
   - **Responsável** (obrigatório): Pessoa responsável
   - **Setor** (obrigatório): Setor responsável
   - **Data de Vencimento** (obrigatório): Formato DD/MM/AAAA
   - **Status** (obrigatório): Planejado, Em Andamento ou Concluído
4. Clique em **"Criar Tarefa"**

### Editar Tarefa

1. Expanda a lista de tarefas
2. Clique na tarefa que deseja editar
3. Modifique os campos necessários
4. Clique em **"Atualizar"**

### Excluir Tarefa

1. Abra a tarefa para edição
2. *(Funcionalidade de exclusão será adicionada em breve)*

### Acompanhar Progresso

A barra de progresso mostra:
- **Percentual de conclusão**: Baseado em tarefas concluídas
- **Tarefas concluídas**: Número de tarefas finalizadas
- **Tarefas no prazo**: Tarefas ainda dentro do prazo
- **Tarefas em atraso**: Tarefas que passaram da data de vencimento

## 📊 Indicadores Visuais

### Status das Tarefas

- 🟢 **Concluído**: Tarefa finalizada
- 🔵 **No Prazo**: Tarefa em andamento dentro do prazo
- 🔴 **Em Atraso**: Tarefa passou da data de vencimento

### Alertas

- Badge vermelho: Indica número de tarefas em atraso
- Ícone de alerta: Aparece quando há tarefas críticas

## ⚙️ Funcionalidades Técnicas

### Armazenamento

- Todas as tarefas são salvas localmente no navegador
- Os dados são criptografados para segurança
- Persistem mesmo após fechar o navegador

### Validações

- **Título**: Mínimo 3 caracteres, máximo 200
- **Descrição**: Máximo 1000 caracteres
- **Data**: Formato DD/MM/AAAA obrigatório
- **Limite**: Máximo 50 tarefas por ação

### Cálculo Automático

- Status de atraso calculado automaticamente
- Progresso atualizado em tempo real
- Estatísticas recalculadas a cada mudança

## 🎯 Melhores Práticas

1. **Seja Específico**: Use títulos claros e descritivos
2. **Defina Prazos Realistas**: Considere a complexidade da tarefa
3. **Atualize Regularmente**: Mantenha o status das tarefas atualizado
4. **Use Descrições**: Adicione detalhes importantes na descrição
5. **Monitore Alertas**: Preste atenção em tarefas em atraso

## 🔧 Solução de Problemas

### Tarefas não aparecem
- Verifique se você está na ação correta
- Tente recarregar a página
- Limpe o cache do navegador se necessário

### Erro ao salvar
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme o formato da data (DD/MM/AAAA)
- Verifique se não atingiu o limite de 50 tarefas

### Dados perdidos
- Os dados são salvos localmente no navegador
- Limpar dados do navegador apagará as tarefas
- Faça backup exportando o plano de ação regularmente

## 📱 Responsividade

O sistema funciona em:
- 💻 Desktop (1920x1080, 1366x768)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667, 414x896)

## 🔐 Segurança

- Dados criptografados no localStorage
- Validação de inputs contra XSS
- Sanitização automática de dados

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique a documentação técnica
3. Entre em contato com o suporte técnico

---

**Versão**: 1.0.0  
**Última Atualização**: Novembro 2025
