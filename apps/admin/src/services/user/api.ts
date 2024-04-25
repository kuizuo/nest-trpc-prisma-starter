import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model'
import { UserDto, UserUpdateDto } from '@server/modules/user/dto/user.dto';

export async function queryUser(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.UserList>>('/api/users/page', {
    method: 'GET',
    params: {
      ...params,
      page: params.current,
      limit: params.pageSize
    },
    ...(options || {}),
  });

  return {
    success: result.ok,
    data: result.data?.items,
    total: result.data?.meta.totalCount,
  }
}

export async function addUser(data: UserDto) {
  return request<IBaseResponse<API.UserItem>>(`/api/users`, {
    method: 'POST',
    data,
  });
}

export async function updateUser(id: string, data: UserUpdateDto) {
  return request<IBaseResponse<API.UserItem>>(`/api/users/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function removeUser(ids: string[]) {
  return request('/api/users', {
    method: 'DELETE',
    data: { ids },
  });
}
