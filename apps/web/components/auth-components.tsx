import { signIn, signOut } from "~/auth"

export function SignIn({
  provider,
  ...props
}: { provider?: string }) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider)
      }}
    >
      <button {...props}>Sign In</button>
    </form>
  )
}

export function SignOut(props: any) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
      className="w-full"
    >
      <button variant="ghost" className="w-full p-0" {...props}>
        Sign Out
      </button>
    </form>
  )
}