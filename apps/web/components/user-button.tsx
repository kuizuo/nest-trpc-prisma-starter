import { auth } from "~/auth"

import { SignIn, SignOut } from "./auth-components"

export default async function UserButton() {
  const session = await auth()
  if (!session?.user) return <SignIn />

  return (
    <div className="flex gap-2 items-center">
      <span className="hidden text-sm sm:inline-flex">
        {session.user.email}
      </span>
      <SignOut />
    </div>
  )
}