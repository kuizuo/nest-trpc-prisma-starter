export enum ErrorCodeEnum {
  Default = 1,
  ServerError = 500,

  JWTInvalid = 1103,
  AuthFail = 1000,
  NoPermission = 1001,
  ResourceNotFound = 1102,

  RequestTooFast = 1200,

  UserNotFound = 2001,
  UserExist = 2002,
  PasswordMismatch = 2003,

  VerificationCodeError = 3000,
  VerificationCodeSendFail = 3001,
  MaximumFiveVerificationCodesPerDay = 3002,

  NoteNotFound = 4001,
  CommentNotFound = 4002,

  NoUserFollowing = 5001,
}

export const ErrorCode: Record<ErrorCodeEnum, string> = {
  [ErrorCodeEnum.Default]: '未知错误',
  [ErrorCodeEnum.ServerError]: '服务器错误, 请稍后再试',

  [ErrorCodeEnum.JWTInvalid]: 'JWT无效',
  [ErrorCodeEnum.AuthFail]: '认证失败',
  [ErrorCodeEnum.NoPermission]: '没有权限',
  [ErrorCodeEnum.ResourceNotFound]: '资源不存在',
  [ErrorCodeEnum.RequestTooFast]: '请求过于频繁',

  [ErrorCodeEnum.UserNotFound]: '用户不存在',
  [ErrorCodeEnum.UserExist]: '用户已存在',
  [ErrorCodeEnum.PasswordMismatch]: '密码错误',

  [ErrorCodeEnum.VerificationCodeError]: '验证码无效',
  [ErrorCodeEnum.VerificationCodeSendFail]: '验证码发送失败',
  [ErrorCodeEnum.MaximumFiveVerificationCodesPerDay]: '一天最多发送5个验证码',

  [ErrorCodeEnum.NoteNotFound]: '笔记不存在',
  [ErrorCodeEnum.CommentNotFound]: '评论不存在',
  [ErrorCodeEnum.NoUserFollowing]: '您还未关注任何用户',
}
