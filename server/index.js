 import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '', // Add your OpenAI API key if using OpenAI for chat
});

const queue = new Queue('file-upload-queue', {
  connection: { host: 'localhost', port: 6379 },
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => res.json({ status: 'All Good!' }));

// ✅ PDF upload
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  try {
    await queue.add(
      'file-ready',
      JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,
      })
    );
    return res.json({ message: 'File uploaded and queued successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to enqueue file' });
  }
});

// ✅ Chat endpoint
app.get('/chat', async (req, res) => {
  const userQuery = req.query.message;
  if (!userQuery) return res.status(400).json({ error: 'Missing query message' });

  try {
    // Ollama embeddings
    const embeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text:v1.5', // match installed embedding model
      baseUrl: 'http://127.0.0.1:11434',
    });

    // Load existing Qdrant collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: 'http://localhost:6333',
      collectionName: 'langchainjs-testing',
    });

    // Retrieve top 2 relevant documents
    const retriever = vectorStore.asRetriever({ k: 2 });
    const docs = await retriever.invoke(userQuery);

    // System prompt with context
    const SYSTEM_PROMPT = `
      You are a helpful AI Assistant who answers user queries based on the context from PDF files.
      Context:
      ${JSON.stringify(docs)}
    `;

    // OpenAI chat completion
    const chatResult = await client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userQuery },
      ],
    });

    return res.json({
      message: chatResult.choices[0].message.content,
      docs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to process chat' });
  }
});

app.listen(8000, () => console.log('Server started on PORT 8000'));
