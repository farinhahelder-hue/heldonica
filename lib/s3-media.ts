import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Lazy configuration - only init if AWS env vars are present
const getS3Config = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const bucket = process.env.AWS_S3_BUCKET

  if (!accessKeyId || !secretAccessKey || !bucket) {
    return null
  }

  return {
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: { accessKeyId, secretAccessKey },
    bucket,
  }
}

// Lazy client singleton
let _client: S3Client | null = null
const getClient = () => {
  if (_client) return _client
  const config = getS3Config()
  if (!config) return null
  _client = new S3Client({ region: config.region, credentials: config.credentials })
  return _client
}

export async function listMedia() {
  const config = getS3Config()
  if (!config) {
    return []
  }
  
  const client = getClient()
  if (!client) {
    return []
  }

  const command = new ListObjectsV2Command({ Bucket: config.bucket })
  const response = await client.send(command)
  
  return (response.Contents || [])
    .filter((obj) => obj.Key && obj.Size && obj.Size > 0)
    .map((obj) => ({
      key: obj.Key!,
      size: obj.Size || 0,
      lastModified: obj.LastModified?.toISOString() || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
}

export async function getUploadUrl(key: string, contentType: string) {
  const config = getS3Config()
  if (!config) {
    throw new Error('S3 not configured')
  }
  
  const client = getClient()
  if (!client) {
    throw new Error('S3 not configured')
  }

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(client, command, { expiresIn: 300 })
  return url
}

export async function deleteMedia(key: string) {
  const config = getS3Config()
  if (!config) {
    throw new Error('S3 not configured')
  }
  
  const client = getClient()
  if (!client) {
    throw new Error('S3 not configured')
  }

  const command = new DeleteObjectCommand({ Bucket: config.bucket, Key: key })
  await client.send(command)
}

export function getPublicUrl(key: string) {
  const config = getS3Config()
  if (!config) {
    return ''
  }
  return `https://${config.bucket}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${key}`
}
