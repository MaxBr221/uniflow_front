import { env } from '@/lib/env.ts'
import { COLOR_PALETTE } from '@/styles/colors.ts'

export interface BrandIdentity {
  readonly name: string
  readonly tagline: string
  readonly description: string
  readonly themeColor: string
  readonly principles: readonly string[]
}

export const BRAND_IDENTITY: BrandIdentity = {
  name: env.appName,
  tagline: 'Vida acadêmica em fluxo',
  description:
    'Plataforma SaaS moderna, leve e organizada para estudantes universitários acompanharem semestres, disciplinas, atividades, prazos e trabalhos.',
  themeColor: COLOR_PALETTE.brand[600],
  principles: [
    'Superfícies claras com alto conforto visual para longas sessões de estudo',
    'Roxo e violeta como cor focal de identidade, ações primárias e marcos acadêmicos',
    'Cards minimalistas com bordas suaves e hierarquia sem ruído visual',
    'Tipografia legível e estados explícitos de carregamento, erro e vazio',
    'Experiência responsiva consistente em desktop, tablet e celular',
  ],
}
