import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

import { PineconeStore } from 'langchain/vectorstores/pinecone'
 
const f = createUploadthing();
 

export const ourFileRouter = {
 
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    
    .middleware(async ({ req }) => {
      
      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user || !user.id) throw new Error('Unauthorized')
      return {userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: 'PROCESSING',
        }
      })
      try {
          const rensponse = await fetch (file.url)
          const blob = await rensponse.blob()

          const loader =  new PDFLoader(blob) 

          const pageLevelDocs = await loader.load

          const pagesAmt = pageLevelDocs.length

          
          await db.file.update({
            data: {
              uploadStatus: 'SUCCESS',
            },
            where: {
              id: createdFile.id,
            },
          })

      } catch (err) {
        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        })
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;