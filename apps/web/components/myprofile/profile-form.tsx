'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 mt-10 text-lg font-bold text-swipe-foreground">
      {children}
    </h2>
  )
}

/** テキスト入力行(ニックネームなど) */
export function InputRow({
  label,
  value,
  onChange,
  placeholder = '入力してください',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-swipe-border py-4">
      <span className="text-sm font-medium text-swipe-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-36 shrink-0 rounded-lg border border-swipe-border bg-swipe-surface px-3 text-left text-sm text-swipe-foreground outline-none transition-colors hover:border-swipe-accent focus:border-swipe-accent"
      />
    </div>
  )
}

/** ドロップダウン選択行（身長・体型など） */
export function SelectRow({
  label,
  value,
  options,
  onChange,
  placeholder = 'タップして選択',
  secondValue,
  secondOptions,
}: {
  label: string
  value?: string
  options: string[]
  onChange?: (value: string) => void
  placeholder?: string
  secondValue?: string
  secondOptions?: string[]
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-swipe-border py-4">
      <span className="text-sm font-medium text-swipe-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <SelectControl
          value={value}
          options={options}
          placeholder={placeholder}
          onChange={onChange}
        />
        {secondOptions ? (
          <>
            <span className="text-swipe-muted-foreground">−</span>
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
  onChange,
}: {
  value?: string
  options: string[]
  placeholder: string
  onChange?: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-8 w-36 shrink-0 cursor-pointer appearance-none rounded-lg border border-swipe-border bg-swipe-surface px-3 pr-8 text-sm text-swipe-foreground outline-none transition-colors hover:border-swipe-accent focus:border-swipe-accent"
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
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-swipe-muted-foreground" />
    </div>
  )
}

/** タップして遷移する行（学校名など） */
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
    <button className="flex w-full items-center justify-between gap-4 border-b border-swipe-border py-4 text-left transition-colors hover:bg-swipe-surface">
      <span className="text-sm font-medium text-swipe-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span
          className={
            value
              ? 'text-sm font-medium text-swipe-foreground'
              : 'text-sm text-swipe-muted-foreground'
          }
        >
          {value ?? placeholder}
        </span>
        <ChevronRight className="h-4 w-4 text-swipe-muted-foreground" />
      </span>
    </button>
  )
}
