import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Config = {
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}

const bucket = process.env.AWS_S3_BUCKET!

export const s3Client = new S3Client(s3Config)

export async function listMedia() {
  const command = new ListObjectsV2Command({ Bucket: bucket })
  const response = await s3Client.send(command)
  
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
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  return url
}

export async function deleteMedia(key: string) {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key })
  await s3Client.send(command)
}

export function getPublicUrl(key: string) {
  return `https://${bucket}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${key}`
}