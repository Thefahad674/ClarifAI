import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import fetch from "node-fetch";

const PORT = process.env.PORT || 8000;

// === Environment variables ===
// Public/Local Ollama URL
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
// Qdrant URL/API key
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || "";
// Redis Upstash connection
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// === BullMQ Queue ===
const queue = new Queue("file-upload-queue", {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    tls: {}, // needed for Upstash Redis
  },
});

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// === Express app ===
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ status: "All Good!" }));

// === PDF upload ===
app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await queue.add("file-ready", {
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    });

    res.json({ message: "File uploaded and queued successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to enqueue file" });
  }
});

// === Chat endpoint ===
app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;
  if (!userQuery) {
    return res.status(400).json({ error: "Missing query message" });
  }

  try {
    // Ollama embeddings
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text:v1.5",
      baseUrl: OLLAMA_URL,
    });

    // Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: QDRANT_URL,
        apiKey: QDRANT_API_KEY,
        collectionName: "langchainjs-testing",
      }
    );

    const retriever = vectorStore.asRetriever({ k: 3 });
    const docs = await retriever.invoke(userQuery);

    const contextText = docs
      .map((d, i) => `Doc ${i + 1}:\n${d.pageContent}`)
      .join("\n\n");

    const SYSTEM_PROMPT = `
You are a helpful AI Assistant.
Answer the user query based on the context from PDF files.

Context:
${contextText}
    `;

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userQuery },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      message: data.message?.content || "No response from Ollama",
      docs,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to process chat", details: err.message });
  }
});

// === Start server ===
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
