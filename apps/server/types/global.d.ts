import { Role } from '@server/modules/auth/auth.constant'

declare global {
  interface IAuthUser {
    id: string
    role: Role
    exp?: number
    iat?: number
  }

  export interface IListRespData<T = any> {
    items: T[]
  }
}

export {}
