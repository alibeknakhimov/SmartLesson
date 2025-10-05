import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Разбираем JSON
app.use(bodyParser.json());

// Главная страница
app.get("/", (req, res) => {
  res.send("✅ ScreenApp Webhook is running");
});

// Маршрут для ScreenApp Webhook
app.post("/webhook", (req, res) => {
  const data = req.body;
  console.log("📩 Webhook received:", JSON.stringify(data, null, 2));

  // Сохраняем в файл result.json
  fs.writeFileSync("result.json", JSON.stringify(data, null, 2));

  // Извлекаем summary, если есть
  if (data.file && data.file.summary) {
    console.log("🧠 Summary:", data.file.summary);
  } else if (data.summary) {
    console.log("🧠 Summary:", data.summary);
  } else {
    console.log("ℹ️ No summary found in payload.");
  }

  res.status(200).send({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
