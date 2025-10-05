import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("📩 Webhook received:", data.event);

  // Проверяем все systemPromptResponses и ищем promptTitle === "Summary"
  const responses = data.file?.systemPromptResponses || {};
  const entries = Object.entries(responses);

  let summaryFound = false;

  for (const [key, value] of entries) {
    if (value.promptTitle === "Summary" && value.responseText) {
      summaryFound = true;
      console.log("🧠 SUMMARY FOUND:");
      try {
        const summaryData = JSON.parse(value.responseText);
        if (Array.isArray(summaryData.chapters)) {
          for (const ch of summaryData.chapters) {
            console.log(`📍 ${ch.title}`);
            console.log(`🕒 ${ch.start} → ${ch.end}`);
            console.log(`💬 ${ch.notes}\n`);
          }
        } else {
          console.log("🗒️ Raw Summary Text:\n", value.responseText);
        }
      } catch {
        console.log("⚠️ Could not parse Summary JSON:");
        console.log(value.responseText);
      }
    }
  }

  if (!summaryFound) {
    console.log("ℹ️ No 'Summary' promptTitle found in systemPromptResponses.");
  }

  res.status(200).send({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
