import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

// 🚀 Worker
const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log(`📌 Job:`, job.data);
    const data = job.data; // ✅ FIXED

    // 1. Load PDF
    console.log("📥 Loading PDF...");
    const loader = new PDFLoader(data.path);
    const rawDocs = await loader.load();
    console.log("✅ PDF loaded:", rawDocs.length, "docs");

    // 2. Split into chunks
    console.log("✂️ Splitting PDF...");
    const splitter = new CharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);
    console.log("✅ PDF split into", docs.length, "chunks");

    // 3. Create embeddings with Ollama
    console.log("🧠 Creating embeddings (Ollama)...");
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text", // use the model you pulled
      baseUrl: "http://127.0.0.1:11434", // Ollama server
    });
    console.log("✅ Embeddings client ready");

    // Optional: test embeddings
    try {
      const testVector = await embeddings.embedQuery("Hello world");
      console.log("Embedding test vector length:", testVector.length);
    } catch (err) {
      console.error("❌ Embedding test failed:", err);
      return; // stop if embeddings fail
    }

    // 4. Store in Qdrant
    console.log("💾 Storing in Qdrant...");
    try {
      await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: "http://localhost:6333", // Qdrant
        collectionName: "langchainjs-testing",
      });
      console.log("🎉 All docs are added to Qdrant!");
    } catch (err) {
      console.error("❌ Qdrant insert failed:", err);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
