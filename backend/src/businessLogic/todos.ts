import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'

import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId)
}

export async function createTodo( createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4()

    return await todoAccess.createTodo({
        todoId: todoId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false
    })
}

export async function upDateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoItem> {

    return await todoAccess.updateTodo({
        todoId: todoId,
        userId: userId,
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    })
}

export async function updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<TodoItem> {
    return await todoAccess.updateAttachmentUrl({
        todoId: todoId,
        userId: userId,
        attachmentUrl: attachmentUrl
    })
}


export async function deleteTodo(todoId: string, userId: string): Promise<TodoItem> {

    return await todoAccess.deleteTodo({
        todoId: todoId,
        userId: userId
    })
}