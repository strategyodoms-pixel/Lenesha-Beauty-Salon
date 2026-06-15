import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('[uploadthing] Upload complete:', file.ufsUrl)
    }),

  bioPhotoUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('[uploadthing] Bio photo uploaded:', file.ufsUrl)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
