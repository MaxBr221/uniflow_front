import type { HTMLAttributes, ReactNode } from 'react'
import { SPACING_CLASSES } from '@/styles/spacing.ts'
import { cn } from '@/utils/cn.ts'

export type ResponsiveContainerAs = 'div' | 'main' | 'section'
export type ResponsiveContainerSize =
  'narrow' | 'compact' | 'default' | 'wide' | 'full'
export type ResponsiveContainerPadding = 'none' | 'compact' | 'default'

const CONTAINER_SIZE_CLASSES: Record<ResponsiveContainerSize, string> = {
  narrow: 'max-w-md',
  compact: 'max-w-3xl',
  default: 'max-w-content',
  wide: 'max-w-7xl',
  full: 'max-w-full',
}

const CONTAINER_PADDING_CLASSES: Record<ResponsiveContainerPadding, string> = {
  none: '',
  compact: 'px-inset-sm py-inset-md sm:px-inset-md lg:px-inset-lg',
  default: 'px-inset-md py-inset-lg sm:px-inset-lg lg:px-inset-xl',
}

export interface ResponsiveContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ResponsiveContainerAs
  size?: ResponsiveContainerSize
  padding?: ResponsiveContainerPadding
  centered?: boolean
  children: ReactNode
}

export function ResponsiveContainer({
  as: Component = 'div',
  size = 'default',
  padding = 'default',
  centered = false,
  className,
  children,
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        CONTAINER_SIZE_CLASSES[size],
        CONTAINER_PADDING_CLASSES[padding],
        centered && 'flex min-h-svh flex-col justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export type PageHeaderTitleAs = 'h1' | 'h2'

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  title: ReactNode
  titleAs?: PageHeaderTitleAs
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  divided?: boolean
}

export function PageHeader({
  title,
  titleAs: Title = 'h1',
  description,
  eyebrow,
  actions,
  divided = false,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'gap-stack-md flex flex-col sm:flex-row sm:items-start sm:justify-between',
        divided && 'border-border-subtle pb-inset-md sm:pb-inset-lg border-b',
        className,
      )}
      {...props}
    >
      <div className="space-y-stack-xs min-w-0 flex-1">
        {eyebrow ? <div>{eyebrow}</div> : null}
        <Title className="font-display text-heading-md sm:text-heading-lg text-ink-primary font-semibold">
          {title}
        </Title>
        {description ? (
          <p className="text-body-sm sm:text-body text-ink-secondary max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="gap-stack-sm flex w-full shrink-0 flex-col sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export type ResponsiveGridAs = 'div' | 'section' | 'ul'
export type ResponsiveGridColumns = 1 | 2 | 3 | 4
export type ResponsiveGridGap = 'sm' | 'md' | 'lg'

const GRID_COLUMN_CLASSES: Record<ResponsiveGridColumns, string> = {
  1: 'grid grid-cols-1',
  2: 'grid grid-cols-1 sm:grid-cols-2',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const GRID_GAP_CLASSES: Record<ResponsiveGridGap, string> = {
  sm: 'gap-stack-sm sm:gap-stack-md',
  md: 'gap-stack-md lg:gap-stack-lg',
  lg: 'gap-stack-lg xl:gap-stack-xl',
}

export interface ResponsiveGridProps extends HTMLAttributes<HTMLElement> {
  as?: ResponsiveGridAs
  columns?: ResponsiveGridColumns
  gap?: ResponsiveGridGap
  children: ReactNode
}

export function ResponsiveGrid({
  as: Component = 'div',
  columns = 3,
  gap = 'md',
  className,
  children,
  ...props
}: ResponsiveGridProps) {
  return (
    <Component
      className={cn(
        columns === 3 && gap === 'md'
          ? SPACING_CLASSES.cardGrid
          : cn(GRID_COLUMN_CLASSES[columns], GRID_GAP_CLASSES[gap]),
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export type ResponsiveStackBreakpoint = 'sm' | 'md' | 'lg'
export type ResponsiveStackGap = 'xs' | 'sm' | 'md' | 'lg'
export type ResponsiveStackAlign = 'start' | 'center' | 'end' | 'stretch'
export type ResponsiveStackJustify = 'start' | 'center' | 'end' | 'between'

const STACK_BREAKPOINT_CLASSES: Record<ResponsiveStackBreakpoint, string> = {
  sm: 'flex flex-col sm:flex-row',
  md: 'flex flex-col md:flex-row',
  lg: 'flex flex-col lg:flex-row',
}

const STACK_GAP_CLASSES: Record<ResponsiveStackGap, string> = {
  xs: 'gap-stack-xs',
  sm: 'gap-stack-sm',
  md: 'gap-stack-md',
  lg: 'gap-stack-lg',
}

const STACK_ALIGN_CLASSES: Record<
  ResponsiveStackBreakpoint,
  Record<ResponsiveStackAlign, string>
> = {
  sm: {
    start: 'sm:items-start',
    center: 'sm:items-center',
    end: 'sm:items-end',
    stretch: 'items-stretch',
  },
  md: {
    start: 'md:items-start',
    center: 'md:items-center',
    end: 'md:items-end',
    stretch: 'items-stretch',
  },
  lg: {
    start: 'lg:items-start',
    center: 'lg:items-center',
    end: 'lg:items-end',
    stretch: 'items-stretch',
  },
}

const STACK_JUSTIFY_CLASSES: Record<ResponsiveStackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export interface ResponsiveStackProps extends HTMLAttributes<HTMLDivElement> {
  breakpoint?: ResponsiveStackBreakpoint
  gap?: ResponsiveStackGap
  align?: ResponsiveStackAlign
  justify?: ResponsiveStackJustify
  wrap?: boolean
  children: ReactNode
}

export function ResponsiveStack({
  breakpoint = 'sm',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...props
}: ResponsiveStackProps) {
  return (
    <div
      className={cn(
        STACK_BREAKPOINT_CLASSES[breakpoint],
        STACK_GAP_CLASSES[gap],
        STACK_ALIGN_CLASSES[breakpoint][align],
        STACK_JUSTIFY_CLASSES[justify],
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
