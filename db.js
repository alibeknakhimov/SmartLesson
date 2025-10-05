const express = require("express")
const path = require("path")
const admin = require("firebase-admin")
const ExcelJS = require("exceljs")
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(serviceAccount);
  } catch (err) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_JSON содержит невалидный JSON");
    process.exit(1);
  }
} else {
  console.error("❌ Переменная окружения FIREBASE_SERVICE_ACCOUNT_JSON не установлена");
  process.exit(1);
}

admin.initializeApp({ credential });

const db = admin.firestore()

const app = express()
const PORT = 3005

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Главная страница формы
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"))
})

// Маршрут для скачивания Excel
app.get("/download", async (req, res) => {
  try {
    const snapshot = await db.collection("volunteers").orderBy("comeIn", "asc").get()
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Волонтеры")
    worksheet.columns = [
      { header: "Имя", key: "name", width: 20 },
      { header: "Фамилия", key: "surname", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Телефон", key: "phone", width: 20 },
      { header: "Время регистраций", key: "comeIn", width: 25 },
      { header: "Время ухода", key: "comeOut", width: 25 }
    ]
    snapshot.forEach(doc => {
      const data = doc.data()
      worksheet.addRow({
        name: data.name || "",
        surname: data.surname || "",
        email: data.email || "",
        phone: data.phone || "",
        comeIn: data.comeIn ? new Date(data.comeIn.toDate()).toLocaleString("ru-RU") : "",
        comeOut: data.comeOut ? new Date(data.comeOut.toDate()).toLocaleString("ru-RU") : "Не ушёл"
      })
    })
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=volunteers-list.xlsx"
    )
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error("Ошибка при генерации Excel:", err)
    res.status(500).send("Ошибка при генерации файла.")
  }
})

// Страница "Спасибо"
app.get("/thankyou", (req, res) => {
  res.sendFile(path.join(__dirname, "views/thankyou.html"))
})

// Обработка формы
app.post("/submit", async (req, res) => {
  const { name, surname, email, phone } = req.body

  try {
    // Добавляем в Firestore
    await db.collection("volunteers").add({
      name,
      surname,
      email,
      phone,
      eventName: "Backstreet Boys Concert 2025",
      status: "new",
      comeIn: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(` Новый волонтер: ${name} ${surname} (${email}, ${phone})`)

    // Перенаправление на thankyou.html со всеми параметрами
    const params = new URLSearchParams({
      name: name,
      surname: surname,
      email: email,
      phone: phone
    })
    res.redirect(`/thankyou?${params.toString()}`)
  } catch (err) {
    console.error(" Ошибка Firestore:", err)
    res.status(500).send("Ошибка при сохранении данных.")
  }
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(` Сервер работает: http://localhost:${PORT}`)
})
