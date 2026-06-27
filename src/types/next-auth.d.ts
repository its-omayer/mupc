import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'member' | 'viewer'
      profilePhotoUrl?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'member' | 'viewer'
    profilePhotoUrl?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'member' | 'viewer'
    profilePhotoUrl?: string
  }
}
