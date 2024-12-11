const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const path = require('path');

// Модули для CORS и JSON
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || "ai3ohPh3Aiy9eeThoh8caaM9voh5Aezaenai0Fae2Pahsh2Iexu7Qu/";
console.log("MongoDB URI from .env:", process.env.MONGO_URI); // This should print the MongoDB URI
const URL = process.env.MONGO_URI;

mongoose
  .connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Схема и модель пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Регистрация
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
  return res.status(409).json({ message: 'Пользователь уже существует' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
  res.status(500).json({ message: 'Ошибка регистрации пользователя', error: err.message });
  }
  });

// Авторизация
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
  const user = await User.findOne({ username });
  
  if (!user) {
  return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
  return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
  }
  
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ token });
  } catch (err) {
  res.status(500).json({ message: 'Ошибка входа', error: err.message });
  }
  });
  // Обработка корневого маршрута
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});
