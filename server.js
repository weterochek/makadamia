const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const path = require('path');



// Модули для CORS и JSON
app.use(cors());
app.use(express.json());
console.log("MongoDB URI from .env:", process.env.MONGODB_URI); // This should print the MongoDB URI
const URL = process.env.MONGO_URI;

mongoose
  .connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для корневой страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Схема и модель пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Регистрация
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Register Request:', req.body);

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists:', username);
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    console.log('User Registered:', newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login Request:', req.body);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Login Success, Token:', token);
    res.status(200).json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});
