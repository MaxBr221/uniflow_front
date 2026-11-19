---
name: run
description: >-
  Plans and executes a specific UniFlow backlog task by ID (e.g. /run FE-022 or /run back-022), enforcing documentation review, dependency checks, direct execution unless blocked, build/lint/test verification, and backlog updates.
  Use when the user invokes /run <task-id> or asks to run/implement a specific backlog task ID.
---

# Executar Tarefa do Backlog (`/run <ID>`)

Use esta skill quando o usuário digitar `/run <ID>` (ex.: `/run FE-002`, `/run back-022`, `/run 022`) para planejar e executar diretamente uma tarefa do `docs/BACKLOG.md`.

## Etapa 1: Resolução do ID e Leitura do Contexto

1. **Normalizar o ID informado:**
   - Extraia o identificador após `/run` (ex.: `FE-022`, `fe-22`, `back-022`, `022`, `22`).
   - Leia `docs/BACKLOG.md` e localize a tarefa correspondente.
   - Aceite variações de prefixo ou abreviações (como `back-022` ou `022`) resolvendo para o ID oficial no backlog (`FE-022`, com 3 dígitos), informando claramente qual tarefa foi resolvida.
   - Se o ID não existir em `docs/BACKLOG.md`, se houver ambiguidade entre múltiplos prefixos ou se nenhum ID tiver sido informado, informe o usuário e aguarde esclarecimento.

2. **Ler documentação e código existente:**
   - Verifique e leia os documentos disponíveis em `docs/` (`PRODUCT_SPEC.md`, `DESIGN_SYSTEM.md`, `FRONTEND_ARCHITECTURE.md`, `API_CONTRACT.md`, `BACKLOG.md`).
   - Analise `package.json` e os arquivos existentes em `src/` relevantes para a tarefa.
   - Se a tarefa exigir especificações de um arquivo de `docs/` que ainda não existe no repositório (por exemplo `API_CONTRACT.md` para integrações com API ou `DESIGN_SYSTEM.md` para tokens visuais), pare antes de editar código, informe a lacuna e apresente um plano para aprovação.

3. **Verificar dependências:**
   - Cheque se as tarefas predecessoras no `docs/BACKLOG.md` e as bibliotecas necessárias já estão concluídas/instaladas.
   - Se houver dependência obrigatória pendente ou decisão de arquitetura com impacto relevante não coberta pela documentação, apresente o plano e aguarde confirmação antes de prosseguir.

## Etapa 2: Execução Direta e Validação

Quando não houver bloqueios (documentação necessária disponível ou não exigida pela tarefa e dependências atendidas), **execute a tarefa diretamente sem parar para pedir confirmação**:

1. Implemente **apenas o escopo solicitado** da tarefa, respeitando a arquitetura orientada a features (`app`, `components`, `features`, `hooks`, `services`, `lib`, `types`, `utils`, `styles`) e todas as regras obrigatórias (TypeScript estrito sem `any`, TanStack Query, React Hook Form + Zod, Axios centralizado, sem refresh token em `localStorage`, estados de loading/erro/vazio, responsividade).
2. Crie ou atualize testes unitários/de integração quando o ambiente de testes (`Vitest` + `React Testing Library`, tarefa `FE-012`) já estiver configurado.
3. Execute as verificações aplicáveis após a última edição:
   - `npx tsc -b`
   - `npm run lint`
   - `npm run build`
   - `npm test` (quando o script `test` estiver configurado no `package.json`)
4. Valide responsividade para alterações visuais.

## Etapa 3: Atualização do Backlog e Relatório Final

1. Atualize `docs/BACKLOG.md` marcando `- [x]` e ajustando a tabela de resumo apenas se **todos** os critérios de aceite da tarefa tiverem sido atendidos (se faltar algo como suíte de testes pendente de `FE-012`, mantenha `- [ ]` ou registre o status exato com transparência).
2. Apresente o resumo final contendo:
   - O que foi implementado
   - Arquivos criados e modificados (com links clicáveis)
   - Regras de negócio e padrões técnicos atendidos
   - Comandos e testes executados com seus resultados observados
   - Pendências identificadas
