import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackHeader } from '@/components/ui/back-header'
import { GoogleSignInButton } from './google-signin-button'

export function SignupLanding({
  onSelectEmail,
}: {
  onSelectEmail: () => void
}) {
  return (
    <main>
      <BackHeader href="/welcome" title="熟恋に新規登録" />

      <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-8 pt-6">
        <Button
          type="button"
          onClick={onSelectEmail}
          variant="outline"
          className="h-12 w-full gap-2 rounded-lg"
        >
          <Mail className="size-5" />
          メールアドレスで新規登録
        </Button>
        <GoogleSignInButton text="signup_with" />
      </div>
    </main>
  )
}
