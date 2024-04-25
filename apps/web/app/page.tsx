"use client"

import { Suspense } from "react";
import { auth } from "~/auth";
import { TodoList } from "~/components/todo-list";

export default function Home() {


  return <>
    <Suspense fallback={null}>
      <TodoList></TodoList>
    </Suspense>
  </>
}
