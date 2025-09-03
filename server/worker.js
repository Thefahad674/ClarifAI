import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { VectorStore } from "@langchain/core/vectorstores";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log(`Job:`, job.data);
    const data = JSON.parse(job.data);
    /*
       Path: data.path,
       read the pdf from path,
       chunk the pdf,
       call the openai embediing model for every chunk,
       store the chunk in qdrant db
       */

    // Load the pdf
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
 
    const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        apiKey: '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'
    })

    const vectorStore = new QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: "http://localhost:6333",
            collectionName: "langchainjs_testing"
        }
    )
    await vectorStore.addDocuments(docs)
    console.log(`All docs are added to vector store `);
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: '6379',
    },
  }
);


