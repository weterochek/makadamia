require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const app = express();

app.use((req, res, next) => {
    console.log(`Получен запрос: ${req.method} ${req.url}`);
    next();
});
// Настройка CORS
const allowedOrigins = [
  'https://makadamia.onrender.com',
  'http://localhost:3000', // Для локальной разработки
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Используем CORS с настройками
app.use(cors(corsOptions));

// Подключение к MongoDB
const JWT_SECRET = process.env.JWT_SECRET || "ai3ohPh3Aiy9eeThoh8caaM9voh5Aezaenai0Fae2Pahsh2Iexu7Qu/";
const mongoURI = process.env.MONGO_URI || "mongodb://11_ifelephant:ee590bdf579c7404d12fd8cf0990314242d56e62@axs-h.h.filess.io:27018/11_ifelephant";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false, // Включено SSL
})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware для обработки JSON
app.use(express.json());

// Перенаправление HTTP на HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Указание папки со статическими файлами
app.use(express.static(path.join(__dirname, "public")));
// Мидлвар для проверки токена
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

try {
      const decoded = jwt.verify(token, 'SECRET_KEY'); // Укажите ваш секретный ключ
      res.json({ username: decoded.username }); // Отправляем имя пользователя
  } catch (error) {
      res.status(401).json({ message: 'Неверный токен' });
  }
};
// Схема и модель пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: ""},
  city: { type: String, default: ""}
});

const User = mongoose.model("User", userSchema);
app.get('/account', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("username name city");
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json({ username: user.username, name: user.name, city: user.city });
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

app.put('/account', authMiddleware, async (req, res) => {
  try {
    const { name, city } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, city }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Ошибка обновления профиля" });
  }
});
// Регистрация пользователя
app.post('/register', async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = req.body;

  try {
    console.log("Регистрация пользователя:", req.body);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Увеличено количество раундов
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: 'Ошибка регистрации пользователя', error: err.message });
  }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("Попытка входа пользователя:", { username });

    // Находим пользователя в базе данных
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'Неверные имя пользователя или пароль' });
    }

    // Проверяем зашифрованный пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Неверные имя пользователя или пароль' });
    }  
    // Генерируем токен
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});
// Обновление токена
app.post('/refresh-token', (req, res) => {
  const { token: refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Токен обновления не предоставлен' });
  }

  try {
    const user = jwt.verify(refreshToken, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Недействительный токен обновления' });
  }
});

// Приватный маршрут
app.get('/private-route', authMiddleware, (req, res) => {
  res.json({ message: `Добро пожаловать, пользователь ${req.user.id}` });
});

// Обработка корневого маршрута
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!', error: err.message });
});

// Обработка 404 ошибок
app.use((req, res) => {
  res.status(404).json({ message: "Ресурс не найден" });
});

// Порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
