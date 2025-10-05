import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("📩 Webhook received:", data.event);

  // Проверяем наличие блока CHAPTERS в systemPromptResponses
  const chaptersJson = data.file?.systemPromptResponses?.CHAPTERS?.responseText;
  if (chaptersJson) {
    try {
      const chapters = JSON.parse(chaptersJson);
      console.log("🧠 SUMMARY:");
      for (const ch of chapters.chapters) {
        console.log(`📍 ${ch.title}`);
        console.log(`🕒 ${ch.start} → ${ch.end}`);
        console.log(`💬 ${ch.notes}\n`);
      }
    } catch (err) {
      console.log("⚠️ Could not parse CHAPTERS JSON:", chaptersJson);
    }
  } else {
    console.log("ℹ️ CHAPTERS not found yet.");
  }

  res.status(200).send({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
