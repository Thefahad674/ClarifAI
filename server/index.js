import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import path from "path";

const queue = new Queue('file-upload-queue', {
    connection: {
        host: 'localhost', port: 6379
    }
}) 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
await  queue.add('file-ready', JSON.stringify({
    filename: req.file.originalname,
    source: req.file.destination,
    path: req.file.path
  }))
  return res.json({ message: "PDF received successfully" });
});

app.listen(8000, () => {
  console.log(`Server is started on PORT:8000`);
});
