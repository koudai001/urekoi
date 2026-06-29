'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border pb-2 focus-within:border-primary',
        className,
      )}
    >
      <Input
        type={visible ? 'text' : 'password'}
        className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-lg focus-visible:border-0 focus-visible:ring-0"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'パスワードを隠す' : 'パスワードを表示'}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>
    </div>
  )
}

export { PasswordInput }
