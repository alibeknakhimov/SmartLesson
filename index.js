import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("📩 Webhook received:", JSON.stringify(data, null, 2));

  // если есть ссылка на транскрипт — скачиваем и выводим текст
  if (data.file?.transcriptUrl) {
    console.log("🗒️ Downloading transcript...");
    const response = await fetch(data.file.transcriptUrl);
    const transcript = await response.json();

    // извлекаем поле text
    let rawText = transcript.text || "";
    // исправляем кракозябры (если есть)
    const fixedText = Buffer.from(rawText, "binary").toString("utf8");

    console.log("🗣️ TRANSCRIPT:\n", fixedText);
  }

  // если пришёл summary
  if (data.file?.summary) {
    console.log("🧠 SUMMARY:", data.file.summary);
  } else {
    console.log("ℹ️ No summary yet.");
  }

  res.status(200).send({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
