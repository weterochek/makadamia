require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Joi = require("joi");
const app = express();

// Настройка CORS
const allowedOrigins = [
  'https://makadamia.onrender.com', // Первый сайт
  'https://mobile-site.onrender.com', // Второй сайт
  'http://localhost:3000' // Для локальной разработки
];

console.log("Отправка запроса на /refresh");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) { // Разрешаем запросы без origin
      callback(null, true);
    } else {
      console.warn(`❌ Недопустимый источник запроса: ${origin}`);
      callback(new Error("Недопустимый источник запроса"));
    }
  },
  credentials: true,
};

// Используем CORS с настройками
app.use(cors(corsOptions));
app.use(cookieParser());
// Подключение к MongoDB
const JWT_SECRET = process.env.JWT_SECRET || "ai3ohPh3Aiy9eeThoh8caaM9voh5Aezaenai0Fae2Pahsh2Iexu7Qu/";
const mongoURI = process.env.MONGO_URI || "mongodb://11_ifelephant:ee590bdf579c7404d12fd8cf0990314242d56e62@axs-h.h.filess.io:27018/11_ifelephant";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "J8$GzP1d&KxT^m4YvNcR";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false, // Включено SSL
})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware для обработки JSON
app.use(express.json());
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.warn("Ошибка 401: Токен отсутствует");
        return res.status(401).json({ message: "Токен не предоставлен" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        console.warn("Ошибка 401: Некорректный формат заголовка Authorization");
        return res.status(401).json({ message: "Некорректный формат токена" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.warn("Ошибка 401: Недействительный токен", err.message);
        return res.status(401).json({ message: "Недействительный токен" });
    }
};

// Сохранение заказа с выбранным временем
app.post('/order', authMiddleware, async (req, res) => {
    const { name, address, additionalInfo, items, totalAmount, timestamp } = req.body;
    const user = req.user;

    const order = new Order({
        userId: user._id,
        items,
        totalAmount,
        address,
        additionalInfo,
        timestamp: timestamp ? new Date(timestamp) : new Date(),  // Используем переданное время
    });

    await order.save();
    res.status(201).json(order);
});

// Получение заказов пользователя
app.get('/orders', authMiddleware, async (req, res) => {
    const user = req.user;
    const orders = await Order.find({ userId: user._id });

    // Форматируем время заказов перед отправкой клиенту
    orders.forEach(order => {
        order.timestampFormatted = order.timestamp.toLocaleString();  // Преобразуем время в строку
    });

    res.json(orders);
});


async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken || isTokenExpired(accessToken)) {
        console.log("Токен устарел, обновляем...");
        accessToken = await refreshAccessToken();
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (res.status === 401) {
        console.log("Ошибка 401: Токен недействителен, пробуем обновить...");
        accessToken = await refreshAccessToken();

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    return res;
}

// Функция проверки срока жизни токена
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Декодируем токен
        return payload.exp * 1000 < Date.now(); // Если exp в прошлом — токен истёк
    } catch (e) {
        return true; // Если ошибка — токен недействителен
    }
}


// Перенаправление HTTP на HTTPS
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        console.log("Проверка протокола:", req.headers["x-forwarded-proto"]);
        if (req.headers["x-forwarded-proto"] !== "https") {
            console.log("🔄 Перенаправление на HTTPS...");
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
    }
    next();
});

const Cart = require("./models/Cart"); // Подключаем модель

app.post('/cart/add', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Авторизуйтесь, чтобы добавить товар в корзину' });
    }

    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: "Товар добавлен в корзину", cart });

  } catch (error) {
    console.error("Ошибка добавления в корзину:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Указание папки со статическими файлами
app.use(express.static(path.join(__dirname, "public")));

// Схема и модель пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  city: { type: String, default: "" }
});
const User = mongoose.model("User", userSchema);

// Мидлвар для проверки токена

function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site, iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

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
    const origin = req.headers.origin;

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Неверные данные' });
    }

    let Name;
    if (origin === "https://makadamia.onrender.com") {
        cookieName = "refreshTokenDesktop";
    } else if (origin === "https://mobile-site.onrender.com") {
        cookieName = "refreshTokenMobile";
    } else {
        return res.status(403).json({ message: "Недопустимый источник запроса" });
    }

    const { accessToken, refreshToken } = generateTokens(user, origin);

    res.cookie(cookieName, refreshToken, {
    httpOnly: true,  // Не доступно через JavaScript
    secure: true,    // Требует HTTPS (на `onrender.com` обязательно)
    sameSite: "None", // Позволяет передавать куки между разными доменами
    domain: ".onrender.com", // Домен, на который распространяются куки
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // Срок действия 30 дней
});
  res.json({ accessToken });
  res.setHeader("Set-LocalStorage", JSON.stringify({ token: accessToken }));
});


app.post('/refresh', async (req, res) => {
  console.log("🔄 Запрос на обновление токена:", req.cookies);
const refreshTokenDesktop = req.cookies.refreshTokenDesktop || null;
const refreshTokenMobile = req.cookies.refreshTokenMobile || null;
    const origin = req.headers.origin;

    let refreshToken;
    let cookieName;

    if (origin === "https://makadamia.onrender.com") {
        refreshToken = refreshTokenDesktop;
        cookieName = "refreshTokenDesktop";
    } else if (origin === "https://mobile-site.onrender.com") {
        refreshToken = refreshTokenMobile;
        cookieName = "refreshTokenMobile";
    } else {
        return res.status(403).json({ message: "Недопустимый источник запроса" });
    }

    if (!refreshToken) {
        console.warn("❌ Нет refresh-токена, отправляем 401.");
        return res.status(401).json({ message: "Не авторизован" });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decodedUser) => {
        if (err || decodedUser.site !== origin) {
            console.warn("❌ Недействительный refresh-токен, отправляем 403.");
            return res.status(403).json({ message: "Недействительный refresh-токен" });
        }

        const user = await User.findById(decodedUser.id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        console.log("✅ Refresh-токен действителен, создаём новый access-токен.");
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, origin);

        console.log(`🔄 Новый ${cookieName}:`, newRefreshToken);

        res.cookie(cookieName, newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            domain: ".onrender.com",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken });
    });
});

async function refreshAccessToken() {
    try {
        const response = await fetch("https://makadamia.onrender.com/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            console.warn("❌ Ошибка обновления токена:", response.status);
            return null;
        }

        const data = await response.json();
        console.log("✅ Новый accessToken получен:", data.accessToken);

        if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
        }

        return data.accessToken;
    } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        return null;
    }
}

app.post('/logout', authMiddleware, (req, res) => {
    const origin = req.headers.origin;

    let cookieName;
    if (origin === "https://makadamia.onrender.com") {
        cookieName = "refreshTokenDesktop";
    } else if (origin === "https://mobile-site.onrender.com") {
        cookieName = "refreshTokenMobile";
    } else {
        return res.status(403).json({ message: "Недопустимый источник запроса" });
    }

    res.clearCookie(cookieName, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        domain: ".onrender.com",
        path: "/",
    });

    res.json({ message: 'Вы вышли из системы' });
});
async function logout() {
    await fetch("https://makadamia.onrender.com/logout", {
        method: "POST",
        credentials: "include"
    });

    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("cart");

    window.location.href = "/index.html";
}



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
app.get('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Нет refreshToken" });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const newAccessToken = jwt.sign({ id: payload.id, username: payload.username }, JWT_SECRET, { expiresIn: '2h' });

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: "RefreshToken недействителен" });
    }
});
app.get('/account', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const user = await User.findById(req.user.id).select("username name city");
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json({ username: user.username, name: user.name, city: user.city });
    } catch (error) {
        console.error("❌ Ошибка загрузки аккаунта:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
app.put('/account', authMiddleware, async (req, res) => {
    const { name, city, username, password } = req.body; // Получаем данные из запроса

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (name) user.name = name;  // Обновляем имя
        if (city) user.city = city;  // Обновляем город
        if (username) user.username = username;  // Обновляем username
        if (password) user.password = await bcrypt.hash(password, 12);  // Обновляем пароль

        await user.save(); // Сохраняем обновлённые данные
        res.json({ message: 'Аккаунт обновлён', user });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении аккаунта', error: error.message });
    }
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

