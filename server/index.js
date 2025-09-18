import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import fetch from "node-fetch"; // npm install node-fetch

const PORT = process.env.PORT || 8000;

// BullMQ Queue
const queue = new Queue("file-upload-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    tls: {},
  },
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ status: "All Good!" }));

// PDF upload
app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    await queue.add("file-ready", {
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    });
    res.json({ message: "File uploaded and queued successfully" });
  } catch (err) {
    console.error(" Upload error:", err);
    res.status(500).json({ error: "Failed to enqueue file" });
  }
});

// Chat endpoint
app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;
  if (!userQuery)
    return res.status(400).json({ error: "Missing query message" });

  try {
    // Ollama embeddings
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text:v1.5",
      baseUrl: "http://127.0.0.1:11434",
    });

   const vectorStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
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

    const response = await fetch("http://127.0.0.1:11434/api/chat", {
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

    const data = await response.json();

    res.json({
      message: data.message?.content || "No response from Ollama",
      docs,
    });
  } catch (err) {
    console.error(" Chat error:", err);
    res
      .status(500)
      .json({ error: "Failed to process chat", details: err.message });
  }
});

app.listen(PORT, () => console.log(" Server started on PORT 8000"));
