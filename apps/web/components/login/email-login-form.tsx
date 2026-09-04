'use client'

import { startTransition, useActionState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { type LoginFormValues, loginSchema } from './schema'

export function EmailLoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)

    startTransition(() => {
      formAction(formData)
    })
  })

  return (
    <form className="mt-20 flex flex-col gap-8" onSubmit={onSubmit}>
      <div>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="メールアドレス"
          {...register('email')}
          className="h-14 rounded-none border-0 border-b border-border bg-transparent px-0 text-lg placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          required
          minLength={8}
          placeholder="パスワード"
          {...register('password')}
          className="h-14 rounded-none border-0 border-b border-border px-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:text-lg [&_input]:placeholder:text-muted-foreground"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {state?.success === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={isPending || !isValid}
        className="mt-8 h-16 w-full rounded-xl bg-primary text-lg font-bold text-white"
      >
        {isPending ? 'ログイン中...' : 'ログインする'}
      </Button>
    </form>
  )
}
