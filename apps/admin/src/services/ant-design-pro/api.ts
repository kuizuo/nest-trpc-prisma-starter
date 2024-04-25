import { request } from '@umijs/max';
import { LoginResult } from '@server/modules/auth/auth.model';
import { IBaseResponse } from '@server/common/model/response.model';
import { LoginDto } from '@server/modules/auth/auth.dto';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/account/profile', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/account/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/account/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/auth/admin/login/ */
export async function login(body: LoginDto, options?: { [key: string]: any }) {
  return request<IBaseResponse<LoginResult>>('/api/auth/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}
