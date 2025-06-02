import envConfig from '@/config/env.config'
import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
@Injectable()
export class S3Service {
  private s3: S3
  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY
      }
    })
  }

  uploadFile({
    fileName,
    filePath,
    contentType
  }: {
    fileName: string
    filePath: string
    contentType: string
  }) {
    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: fileName,
        Body: readFileSync(filePath),
        ContentType: contentType
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false
    })

    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log(progress)
    })

    return parallelUploads3.done()
  }
}

// const s3Instantce = new S3Service()
// s3Instantce
//   .uploadFile({
//     fileName: 'images/test.jpg',
//     filePath: `D:/Class/EXE201/Project/QOS-BE/upload/1f1e5aa1-d1db-4364-b5c1-e3b1848202cc.png`,
//     contentType: 'image/jpeg'
//   })
//   .then(console.log)
//   .catch(console.error)
