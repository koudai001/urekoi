'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 mt-10 text-lg font-bold text-foreground">{children}</h2>
  )
}

/** ドロップダウン選択行（身長・体型など） */
export function SelectRow({
  label,
  value,
  options,
  placeholder = 'タップして選択',
  secondValue,
  secondOptions,
}: {
  label: string
  value?: string
  options: string[]
  placeholder?: string
  secondValue?: string
  secondOptions?: string[]
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <SelectControl
          value={value}
          options={options}
          placeholder={placeholder}
        />
        {secondOptions ? (
          <>
            <span className="text-muted-foreground">−</span>
            <SelectControl
              value={secondValue}
              options={secondOptions}
              placeholder={placeholder}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

function SelectControl({
  value,
  options,
  placeholder,
}: {
  value?: string
  options: string[]
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        defaultValue={value ?? ''}
        className="min-w-28 cursor-pointer appearance-none rounded-lg border border-input bg-card py-2 pl-3 pr-8 text-sm text-foreground outline-none transition-colors hover:border-primary focus:border-primary"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

/** タップして遷移する行（ニックネーム・学校名など） */
export function LinkRow({
  label,
  value,
  placeholder = 'タップして選択',
}: {
  label: string
  value?: string
  placeholder?: string
}) {
  return (
    <button className="flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left transition-colors hover:bg-accent/40">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span
          className={
            value
              ? 'text-sm font-medium text-foreground'
              : 'text-sm text-muted-foreground'
          }
        >
          {value ?? placeholder}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </span>
    </button>
  )
}
