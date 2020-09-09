//KD 200905
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'
import { updateAttachmentUrl } from '../../businessLogic/todos'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.TODO_IMAGES_S3_BUCKET
// const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const imageId = uuid.v4()
  const url = getUploadUrl(imageId)

  const attachmentUrl = `https://${bucketName}.s3.us-east-2.amazonaws.com/${imageId}`

  const item = await updateAttachmentUrl(todoId, userId, attachmentUrl)

  logger.info('Add attachment url for item: ', item)

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId, 
    Expires: 300
  })
}
