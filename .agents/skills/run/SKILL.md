---
name: run
description: >-
  Immediately executes a specific UniFlow backlog task by ID (e.g. /run FE-022 or /run back-022) without asking for authorization first, performing documentation review, dependency verification, implementation, build/lint/test checks, and backlog updates.
  Use when the user invokes /run <task-id> or asks to run/implement a specific backlog task ID.
---

# Executar Tarefa do Backlog (`/run <ID>`)

Use esta skill sempre que o usuário digitar `/run <ID>` (ex.: `/run FE-007`, `/run back-022`, `/run 022`).

> **Regra de execução imediata:** Digitar `/run <ID>` (com `FE-...`, `back-...` ou apenas o número) **já é a autorização explícita** para implementar a tarefa. **Execute diretamente sem perguntar se o usuário autoriza e sem parar para aprovar plano.**
> Só interrompa se o ID não existir em `docs/BACKLOG.md` ou se houver um bloqueio técnico real que impeça a execução (ex.: contrato de endpoint ausente em `docs/API_CONTRACT.md` numa tarefa de integração com API onde não é permitido inventar rotas/payloads).

## Etapa 1: Resolução do ID e Leitura do Contexto

1. **Normalizar e localizar a tarefa:**
   - Extraia o identificador após `/run` (ex.: `FE-022`, `fe-22`, `back-022`, `022`, `22`).
   - Leia `docs/BACKLOG.md` e resolva variações como `back-022` ou `022` diretamente para o ID correspondente (`FE-022`, com 3 dígitos) sem pedir confirmação.
   - Se o ID não existir em `docs/BACKLOG.md` ou nenhum ID tiver sido informado, informe o erro e pare.

2. **Ler documentação e código existente:**
   - Consulte os arquivos existentes em `docs/` (`PRODUCT_SPEC.md`, `DESIGN_SYSTEM.md`, `FRONTEND_ARCHITECTURE.md`, `API_CONTRACT.md`, `BACKLOG.md`).
   - Analise `package.json` e os arquivos existentes em `src/` relevantes para a tarefa e verifique suas dependências no backlog.
   - Caso um documento complementar (`DESIGN_SYSTEM.md`, `FRONTEND_ARCHITECTURE.md`, `PRODUCT_SPEC.md`) ainda não exista e a tarefa seja de configuração ou base estrutural que possa seguir as diretrizes gerais do projeto sem inventar endpoints de API, **prossiga e execute diretamente** deixando os pontos dependentes do contrato claramente registrados nas pendências.

## Etapa 2: Implementação e Validação Direta

1. Implemente **somente o escopo da tarefa solicitada**, respeitando a arquitetura orientada a features (`app`, `components`, `features`, `hooks`, `services`, `lib`, `types`, `utils`, `styles`) e todas as regras obrigatórias:
   - TypeScript rigoroso, sem `any`
   - Comunicação HTTP centralizada em Axios + TanStack Query para dados remotos
   - React Hook Form + Zod para formulários
   - Sem refresh token em `localStorage`
   - Estados de loading, erro e vazio e responsividade (desktop, tablet e celular)
2. Crie ou atualize testes unitários/de integração quando o ambiente de testes (`Vitest` + `React Testing Library`, tarefa `FE-012`) estiver configurado.
3. Execute após a última edição:
   - `npx tsc -b`
   - `npm run lint`
   - `npm run build`
   - `npm test` (quando o script `test` existir em `package.json`)
4. Valide responsividade quando houver alteração de UI.

## Etapa 3: Atualização do Backlog e Relatório Final

1. Atualize `docs/BACKLOG.md` marcando `- [x]` e atualizando os contadores do resumo quando os critérios de aceite da tarefa executada forem atendidos (ou mantenha `- [ ]` com status exato caso haja pendência real).
2. Apresente o resumo final contendo:
   - Tarefa resolvida e o que foi implementado
   - Arquivos criados e modificados (com links clicáveis)
   - Regras de negócio e padrões técnicos atendidos
   - Comandos e testes executados com seus resultados observados
   - Pendências identificadas
