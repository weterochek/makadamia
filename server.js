const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
1
app.use(cors());
app.use(express.json());

require('dotenv').config();

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    setTimeout(connectToDatabase, 5000); // Повтор через 5 секунд
  }
}

connectToDatabase();


// Проверка соединения с сервером
app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

// Схема и модель пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Регистрация
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send("Пользователь успешно зарегистрирован!");
  } catch (error) {
    res.status(400).send("Ошибка при регистрации: " + error.message);
  }
});

// Авторизация
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Пользователь не найден");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Неверные учетные данные");

    res.status(200).send("Авторизация успешна!");
  } catch (error) {
    res.status(500).send("Ошибка на сервере");
  }
});

const PORT = 3000;

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});
