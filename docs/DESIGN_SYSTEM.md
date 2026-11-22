# DESIGN SYSTEM — UniFlow (`uniflow-frontend`)

Este documento centraliza os padrões visuais, tokens e componentes reutilizáveis do **UniFlow**, evoluindo incrementalmente conforme o **Épico 2** do [BACKLOG.md](./BACKLOG.md).

---

## 1. Identidade Visual (`FE-013`)

### Posicionamento e Personalidade
- **Nome:** UniFlow
- **Tagline:** *Vida acadêmica em fluxo*
- **Propósito:** Organizar semestres, disciplinas, aulas, atividades, prazos e trabalhos universitários em um ambiente calmo, previsível e produtivo.
- **Personalidade:** Moderna, profissional, minimalista, acolhedora e objetiva (sem copiar interfaces de concorrentes).

### Princípios Visuais
1. **Fundo claro e confortável:** superfícies leves para reduzir fadiga visual durante o planejamento acadêmico diário.
2. **Roxo e violeta como assinatura:** usados para identificar a marca, ações primárias, foco de teclado e marcos de progresso (tom focal padrão `#7c3aed` em `meta[name="theme-color"]` e gradiente `#8b5cf6` → `#6d28d9` no emblema).
3. **Cards com bordas suaves:** separação visual limpa entre blocos de informação, sem excesso de sombras ou poluição decorativa.
4. **Tipografia legível e hierarquia clara:** títulos diretos, textos de apoio discretos e contraste acessível.
5. **Estados explícitos:** toda tela ou fluxo deve contemplar carregamento, erro e estado vazio.
6. **Responsividade nativa:** layout fluido e adaptado para desktop, tablet e celular.

### Marca e Aplicação
- **Emblema (`public/favicon.svg` e `BrandLogoMark`):** monograma geométrico em "U" com arco de fluxo ascendente sobre container arredondado em gradiente violeta.
- **Uso no código:**
  - Metadados centrais em `src/lib/brand.ts` (`BRAND_IDENTITY`)
  - Componente reutilizável `BrandLogo` e `BrandLogoMark` em `src/components/BrandLogo.tsx`:
    - `variant="full"` para Sidebar expandida, páginas de autenticação e cabeçalhos
    - `variant="mark"` para Sidebar recolhida, cabeçalhos móveis compactos e favicons
    - `size`: `'sm' | 'md' | 'lg'`
    - `showTagline`: exibe o subtítulo institucional quando há espaço vertical adequado

---

## 2. Paleta de Cores (`FE-014`)

Todos os tokens de cor estão centralizados via `@theme` no Tailwind CSS em `src/styles/index.css` e espelhados para uso programático em `src/styles/colors.ts` (`COLOR_PALETTE`).

### Marca (Roxo / Violeta)
| Token | Hex | Uso principal |
| --- | --- | --- |
| `brand-50` | `#f5f3ff` | Fundos sutis de destaque ativo |
| `brand-100` | `#ede9fe` | Badges institucionais e seleção de texto |
| `brand-200` | `#ddd6fe` | Contornos leves e elementos de destaque suave |
| `brand-300` | `#c4b5fd` | Estados intermediários |
| `brand-400` | `#a78bfa` | Detalhes gráficos e acentos secundários |
| `brand-500` | `#8b5cf6` | Gradiente superior da marca e realces |
| `brand-600` | `#7c3aed` | Cor primária focal, botões primários, foco de teclado |
| `brand-700` | `#6d28d9` | Hover de ações primárias e texto sobre `brand-100` |
| `brand-800` | `#5b21b6` | Estados pressionados (`active`) |
| `brand-900` | `#4c1d95` | Textos de alto contraste sobre `brand-100` |
| `brand-950` | `#2e1065` | Contrastes profundos da marca |

### Superfícies (Fundo claro)
| Token | Hex | Uso principal |
| --- | --- | --- |
| `surface-canvas` | `#f8f7fc` | Fundo principal da aplicação |
| `surface-card` | `#ffffff` | Cards, modais, sidebar e cabeçalhos |
| `surface-subtle` | `#f3f1fb` | Hover em linhas/itens e fundos suaves |
| `surface-muted` | `#ebe7f7` | Estados desabilitados e placeholders de carregamento |

### Bordas Suaves
| Token | Hex | Uso principal |
| --- | --- | --- |
| `border-subtle` | `#e5e0f5` | Bordas de cards e divisores |
| `border-default` | `#d4cce9` | Contorno de inputs e controles em repouso |
| `border-strong` | `#b9add8` | Hover em campos e bordas destacadas |
| `border-focus` | `#7c3aed` | Anel e borda de foco acessível (`focus-visible`) |

### Textos (`ink`)
| Token | Hex | Uso principal |
| --- | --- | --- |
| `ink-primary` | `#17153b` | Títulos, rótulos e conteúdo principal |
| `ink-secondary` | `#474469` | Textos de apoio e descrições |
| `ink-muted` | `#6c688a` | Placeholders, metadados e legendas |
| `ink-inverse` | `#ffffff` | Texto sobre fundos escuros ou `brand-600`/`700` |

### Estados Semânticos
- **Sucesso (`success-*`):** `#ecfdf5` (`50`), `#d1fae5` (`100`), `#a7f3d0` (`200`), `#059669` (`600`), `#047857` (`700`) — atividades concluídas, confirmações.
- **Alerta (`warning-*`):** `#fffbeb` (`50`), `#fef3c7` (`100`), `#fde68a` (`200`), `#d97706` (`600`), `#b45309` (`700`) — prazos próximos, avisos.
- **Erro / Atraso (`danger-*`):** `#fff1f2` (`50`), `#ffe4e6` (`100`), `#fecdd3` (`200`), `#e11d48` (`600`), `#be123c` (`700`) — atividades atrasadas, erros de formulário/API, ações destrutivas.
- **Informativo (`info-*`):** `#eff6ff` (`50`), `#dbeafe` (`100`), `#bfdbfe` (`200`), `#2563eb` (`600`), `#1d4ed8` (`700`) — aulas, lembretes e avisos informativos.

## 3. Tipografia (`FE-015`)

O UniFlow utiliza duas fontes variáveis auto-hospedadas via `@fontsource-variable` (carregadas localmente em `src/main.tsx`), configuradas no `@theme` em `src/styles/index.css` e espelhadas em `src/styles/typography.ts`.

### Famílias Tipográficas
| Token | Fonte principal | Fallbacks | Uso |
| --- | --- | --- | --- |
| `font-display` | `Plus Jakarta Sans Variable` | `Inter Variable`, `system-ui`, `sans-serif` | Títulos (`h1`–`h4`), logotipo e métricas de destaque |
| `font-sans` | `Inter Variable` | `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif` | Corpo de texto, formulários, navegação e tabelas |
| `font-mono` | `ui-monospace` | `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace` | Códigos de disciplina, trechos técnicos e atalhos |

### Escala Semântica
| Token / Classe | Tamanho | Line-height | Tracking | Uso recomendado |
| --- | --- | --- | --- | --- |
| `text-display` | `2rem` (`32px`) | `1.2` | `-0.025em` | Títulos de destaque / hero |
| `text-heading-lg` | `1.5rem` (`24px`) | `1.25` | `-0.02em` | Títulos principais de página (`h1`) |
| `text-heading-md` | `1.25rem` (`20px`) | `1.3` | `-0.015em` | Subtítulos de seção / títulos de modal (`h2`) |
| `text-heading-sm` | `1.0625rem` (`17px`) | `1.4` | `0em` | Títulos de card e blocos (`h3`) |
| `text-body` | `0.9375rem` (`15px`) | `1.6` | `0em` | Texto corrido padrão (`body`) |
| `text-body-sm` | `0.875rem` (`14px`) | `1.5` | `0em` | Rótulos de formulário, itens de lista e controles |
| `text-caption` | `0.75rem` (`12px`) | `1.4` | `0.01em` | Metadados, timestamps, mensagens auxiliares e badges |

### Presets TypeScript (`TYPOGRAPHY_CLASSES`)
Para evitar repetição de combinações utilitárias nos componentes e features, use `TYPOGRAPHY_CLASSES` (`display`, `headingLg`, `headingMd`, `headingSm`, `body`, `bodySm`, `caption`, `label`, `metric`) importado de `@/styles`. Note que `metric` inclui `tabular-nums` para alinhamento numérico em contadores de dashboard.

## 4. Sistema de Espaçamentos (`FE-016`)

O sistema de espaçamentos segue uma **grade base de `4px` (`0.25rem`)**, com tokens semânticos definidos no `@theme` em `src/styles/index.css` e espelhados com presets responsivos em `src/styles/spacing.ts` (`SPACING_TOKENS` e `SPACING_CLASSES`).

### Espaçamento Interno (`inset`)
| Token | Valor | Uso principal |
| --- | --- | --- |
| `inset-xs` | `0.5rem` (`8px`) | Chips, badges maiores e controles compactos |
| `inset-sm` | `0.75rem` (`12px`) | Padding interno de inputs, selects e itens de menu |
| `inset-md` | `1rem` (`16px`) | Padding lateral em mobile e cards compactos |
| `inset-lg` | `1.5rem` (`24px`) | Padding padrão de cards e painéis |
| `inset-xl` | `2rem` (`32px`) | Containers amplos, modais e telas de autenticação no desktop |

### Ritmo Vertical e Entre Elementos (`stack`)
| Token | Valor | Uso principal |
| --- | --- | --- |
| `stack-xs` | `0.25rem` (`4px`) | Distância entre label, campo e mensagem de erro/ajuda |
| `stack-sm` | `0.5rem` (`8px`) | Gap entre ícone e texto, botões em linha |
| `stack-md` | `1rem` (`16px`) | Distância entre campos de formulário e cards em grade |
| `stack-lg` | `1.5rem` (`24px`) | Separação entre blocos e seções internas |
| `stack-xl` | `2rem` (`32px`) | Separação entre seções principais da página |

### Dimensões de Layout
- **`sidebar`:** `16rem` (`256px`) — largura da navegação lateral em desktop
- **`header`:** `4rem` (`64px`) — altura padrão do cabeçalho superior
- **`content`:** `75rem` (`1200px`) — largura máxima da área de conteúdo principal

### Presets TypeScript (`SPACING_CLASSES`)
Exportados via `@/styles`: `pageContainer`, `centeredShell`, `cardPadding`, `cardPaddingCompact`, `sectionStack`, `formStack`, `fieldStack`, `inlineGroup` e `cardGrid` — garantindo adaptação fluida entre celular, tablet e desktop.

## 5. Biblioteca de Componentes (`FE-017`–`FE-029`)

### `Button` e `ButtonLink` (`FE-017`)
Implementados em `src/components/Button.tsx` (reexportados em `@/components`):
- **Variantes (`variant`):** `primary` (padrão, destaque `brand-600`), `secondary` (`brand-50` com borda `brand-200`), `outline` (`surface-card` com borda suave), `ghost` e `danger`.
- **Tamanhos (`size`):** `sm` (`36px`), `md` (`40px`, padrão), `lg` (`44px`, ideal para toque móvel/CTAs principais) e `icon` (`40x40px`).
- **Estados e props:** `type` padrão `'button'`, `fullWidth`, `isLoading` + `loadingText` (aplica `disabled` e `aria-busy="true"` com spinner `Loader2`), `leftIcon` e `rightIcon` via `AppIcon`.
- **`ButtonLink`:** compartilha os mesmos estilos visuais sobre `<Link>` do React Router para navegação sem duplicação de classes.

### `FormField` e `Input` (`FE-018`)
Implementados em `src/components/FormField.tsx`, `src/components/formControlStyles.ts` e `src/components/Input.tsx` (reexportados em `@/components`):
- **`FormField`:** wrapper acessível compartilhado entre controles de formulário, gerando IDs únicos (`useId`), rótulo com marcador obrigatório, texto auxiliar e erro (`role="alert"` + `aria-describedby`).
- **`Input`:** campo de texto compatível com React Hook Form (`ref` direto), tamanhos (`sm`, `md`, `lg`), `leftIcon`, `rightIcon`, `rightSlot`, `passwordToggle` (botão acessível para exibir/ocultar senha) e estados `error` (`aria-invalid="true"`) e `disabled`.

### `Select` (`FE-019`)
Implementado em `src/components/Select.tsx` (reexportado em `@/components`):
- Reutiliza `FormField` e `getFormControlClassName`, garantindo consistência visual e acessibilidade (`label`, `helperText`, `error`, `aria-invalid`, `aria-describedby`).
- Suporta `options` tipadas (`SelectOption`) ou `children` customizados (`<option>`, `<optgroup>`), `placeholder`, `leftIcon`, tamanhos (`sm`, `md`, `lg`) e integração direta com React Hook Form (`ref`).

### `Textarea` (`FE-020`)
Implementado em `src/components/Textarea.tsx` (reexportado em `@/components`):
- Reutiliza `FormField` e `getFormControlClassName(..., { multiline: true })` com altura mínima adaptada por tamanho (`sm`, `md`, `lg`) e controle de redimensionamento (`resize`: `none`, `vertical`, `both`).
- Suporte opcional a `showCount` (`tabular-nums` no rodapé do campo, compatível tanto com estado controlado quanto com `register()` do React Hook Form).
