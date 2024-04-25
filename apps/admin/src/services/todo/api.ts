import { request } from '@umijs/max';

import { IBaseResponse } from '@server/common/model/response.model'
import { TodoDto, TodoUpdateDto } from '@server/modules/todo/todo.dto';

/** 获取待办事项列表 GET /api/todos */
export async function queryTodo(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const result = await request<IBaseResponse<API.TodoList>>('/api/todos/page', {
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

/** 新建待办事项 POST /api/todos */
export async function addTodo(data: TodoDto) {
  return request<IBaseResponse<API.TodoItem>>(`/api/todos`, {
    method: 'POST',
    data,
  });
}

/** 更新待办事项 PUT /api/todos */
export async function updateTodo(id: string, data: TodoUpdateDto) {
  return request<IBaseResponse<API.TodoItem>>(`/api/todos/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除待办事项 DELETE /api/todos */
export async function removeTodo(ids: string[]) {
  return request('/api/todos', {
    method: 'DELETE',
    data: { ids },
  });
}
