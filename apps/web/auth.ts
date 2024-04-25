import NextAuth from "next-auth"
import type { DefaultSession, NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      authToken: string
    } & DefaultSession["user"]
    authToken: string
  }
}

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "user" },
        password: { label: "Password", type: "password", placeholder: "Aa123456" }
      },
      async authorize(credentials, req) {
        const res = await fetch(process.env.NEXT_PUBLIC_APP_BASE_URL + "/api/auth/login", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        })
        const result = await res.json()
        // If no error and we have user data, return it
        if (result.ok && result) {
          const res = await fetch(process.env.NEXT_PUBLIC_APP_BASE_URL + "/api/account/profile", {
            method: 'GET',
            headers: { "Authorization": "Bearer " + result.data.authToken }
          })

          const user = await res.json()

          return {
            name: user.data.username,
            email: user.data.email,
            image: user.data.avatar,
            authToken: result.data.authToken
          }
        }
        // Return null if user data could not be retrieved
        return null
      }
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.authToken = (user as any).authToken
      }
      return token
    },
    async session({ session, token }) {
      session.authToken = token.authToken as string
      return session
    }
  },
  basePath: "/auth",
  session: { strategy: "jwt" },
  secret: 'IOfsM7Upq2m/JaRr96ZwPSoNsxE1aIQDNB5sJWcntZI='
} satisfies NextAuthConfig


export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)


