import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import iconv from "iconv-lite"; // npm install iconv-lite

const app = express();
const PORT = process.env.PORT || 3000;

// Разбираем JSON
app.use(bodyParser.json());

// Главная страница
app.get("/", (req, res) => {
  res.send("✅ ScreenApp Webhook is running");
});

// Маршрут для ScreenApp Webhook
app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("📩 Webhook received:", JSON.stringify(data, null, 2));

  // Проверяем наличие transcriptUrl
  const transcriptUrl = data?.file?.transcriptUrl;
  if (!transcriptUrl) {
    console.log("⚠️ transcriptUrl not found.");
    return res.status(200).send({ success: true });
  }

  console.log("🗒️ Downloading transcript...");

  try {
    const response = await fetch(transcriptUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Сначала пытаемся как UTF-8
    let decoded = buffer.toString("utf8");

    // Проверим, содержит ли странные символы — тогда попробуем Windows-1251
    if (decoded.includes("Р") || decoded.includes("С") || decoded.includes("Љ")) {
      decoded = iconv.decode(buffer, "windows-1251");
      console.log("🔁 Detected Windows-1251 encoding, re-decoded to UTF-8");
    }

    const json = JSON.parse(decoded);
    console.log("🗣️ TRANSCRIPT TEXT:\n", json.text);
  } catch (err) {
    console.error("❌ Error processing transcript:", err.message);
  }

  res.status(200).send({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
