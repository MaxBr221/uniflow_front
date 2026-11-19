---
name: tarefas
description: >-
  Lists and filters all UniFlow backlog tasks from docs/BACKLOG.md.
  Use when the user invokes /tarefas or asks to list, inspect, or filter backlog tasks.
---

# Listar Tarefas do Backlog (`/tarefas`)

Use esta skill sempre que o usuário digitar `/tarefas` (com ou sem filtros) ou pedir para visualizar as tarefas do backlog do UniFlow.

## Passos obrigatórios

1. **Ler o backlog oficial:**
   - Leia o arquivo `docs/BACKLOG.md` completo antes de responder.
   - Nunca liste tarefas de memória; reflita exatamente os IDs, descrições, prioridades e checkboxes presentes em `docs/BACKLOG.md`.
   - Se `docs/BACKLOG.md` não existir, informe o bloqueio ao usuário e pare.

2. **Aplicar filtros (se informados pelo usuário):**
   - `/tarefas` (sem argumentos): exiba o resumo de progresso e **todas** as tarefas agrupadas por Épico.
   - `/tarefas pendentes`: exiba apenas os itens marcados com `[ ]`.
   - `/tarefas concluidas` (ou `concluídas`): exiba apenas os itens marcados com `[x]`.
   - `/tarefas alta` / `media` / `baixa`: filtre pela prioridade correspondente.
   - `/tarefas epico <N>` (ou `épico <N>`): exiba apenas as tarefas do Épico `N`.
   - `/tarefas <termo ou ID>`: filtre por ID (ex.: `FE-022`) ou palavra-chave na descrição.

3. **Formato da resposta:**
   - Inclua um resumo no topo: total de tarefas, concluídas (`[x]`), pendentes (`[ ]`) e link clicável para [BACKLOG.md](docs/BACKLOG.md).
   - Liste as tarefas organizadas por Épico, mostrando **ID**, **Status** (`[x]` ou `[ ]`), **Prioridade** e **Descrição**.
   - Ao final, destaque as **próximas tarefas recomendadas** em ordem de dependência e lembre o usuário de que ele pode iniciar qualquer uma com `/run <ID>` (ex.: `/run FE-002`).
