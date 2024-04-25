"use client"

import { AppRouter } from "@server/shared/trpc/trpc.instance"
import { inferProcedureInput } from "@trpc/server"
import { trpc } from "~/trpc/react"

export function TodoList() {
  const utils = trpc.useUtils()

  const [todos, { refetch }] = trpc.todo.list.useSuspenseQuery({})

  const addTodo = trpc.todo.create.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.todo.list.invalidate()
    },
  })

  const deleteTodo = trpc.todo.delete.useMutation({
    async onSuccess() {
      await utils.todo.list.invalidate()
    }
  })

  const updateTodo = trpc.todo.update.useMutation({
    async onSuccess() {
      await utils.todo.list.invalidate()
    }
  })

  return (
    <div className="max-w-80 mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="mb-4">
        <form
          className="py-2 w-4/6"
          onSubmit={async (e) => {
            /**
             * In a real app you probably don't want to use this manually
             * Checkout React Hook Form - it works great with tRPC
             * @link https://react-hook-form.com/
             * @link https://kitchen-sink.trpc.io/react-hook-form
             */
            e.preventDefault()
            const $form = e.currentTarget
            const values = Object.fromEntries(new FormData($form))
            type Input = inferProcedureInput<AppRouter['todo']['create']>
            //    ^?
            const input: Input = {
              value: values.value as string,
            }
            try {
              await addTodo.mutateAsync(input)

              $form.reset()
            } catch (cause) {
              console.error({ cause }, 'Failed to add todo')
            }
          }}
        >
          <div className="inline-flex flex-row gap-y-4 font-semibold">
            <input
              className="border outline-2 outline-gray-700 rounded-xl px-4 py-3"
              id="title"
              name="value"
              type="text"
              placeholder="Todo"
              disabled={addTodo.isLoading}
            />

            <input
              className="cursor-pointer p-2 rounded-md px-4"
              type="submit"
              disabled={addTodo.isLoading}
            />
            {addTodo.error && (
              <p style={{ color: 'red' }}>{addTodo.error.message}</p>
            )}
          </div>
        </form>
      </div>
      <ul className="grid grid-cols-1 gap-4">
        {todos.items.map((item) => (
          <li key={item.id} className={`shadow-md p-4 rounded-lg inline-flex justify-between items-center`}>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={item.status}
                onChange={async () => {
                  await updateTodo.mutateAsync({
                    id: item.id,
                    status: !item.status,
                  });
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-lg">{item.value}</span>
            </label>
            <button
              onClick={async () =>
                deleteTodo.mutateAsync({ id: item.id })
              }
              className="inline-flex bg-red-500 text-white px-2 py-1 rounded-md">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}