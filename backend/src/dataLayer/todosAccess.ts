import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'

import { createLogger } from '../utils/logger'

const logger = createLogger('auth')

export class TodoAccess {
    
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
        }

    async getAllTodos(userid: string): Promise<TodoItem[]> {
        logger.info('Get all todo items')
        
        // const result = await this.docClient.scan({
        //     TableName: this.todosTable
        // }).promise()

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userid
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo item')
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(updatedTodo: any): Promise<TodoItem> {
        logger.info('Update todo item')
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: updatedTodo.userId,
                todoId: updatedTodo.todoId
            },
            ExpressionAttributeNames: {"#n": "name"},
            UpdateExpression: "set dueDate = :dueDate,  done = :done, #n = :name",
            ExpressionAttributeValues:{
                ":name":updatedTodo.name,
                ":dueDate":updatedTodo.dueDate,
                ":done":updatedTodo.done
            },
            ReturnValues:"UPDATED_NEW"
        }).promise()

        return updatedTodo
    }

    async updateAttachmentUrl(updatedTodo: any): Promise<TodoItem> {
        logger.info('Update attachment url')
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: updatedTodo.userId,
                todoId: updatedTodo.todoId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues:{
                ":attachmentUrl":updatedTodo.attachmentUrl
            },
            ReturnValues:"UPDATED_NEW"
        }).promise()

        return updatedTodo
    }

    async deleteTodo(deletedTodo: any): Promise<TodoItem> {
        logger.info('Delete todo item')
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: deletedTodo.userId,
                todoId: deletedTodo.todoId
            }
        }).promise()

        return deletedTodo
    }

}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Build new dynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new AWS.DynamoDB.DocumentClient()
}