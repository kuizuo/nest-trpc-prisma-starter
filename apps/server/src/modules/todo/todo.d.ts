export type TodoItem = Awaited<
  ReturnType<import('./todo.service').TodoService['findOne']>
>

export type TodoList = Awaited<
  ReturnType<import('./todo.service').TodoService['paginate']>
>
