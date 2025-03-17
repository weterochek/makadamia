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
const orderRoutes = require("./routes/orderRoutes");
const Products = require("./models/Products");  // Подключаем модель "Products"

// Настройка CORS
const allowedOrigins = [
  'https://makadamia.onrender.com', // Первый сайт
  'https://mobile-site.onrender.com', // Второй сайт
  'http://localhost:3000' // Для локальной разработки
];

console.log("Отправка запроса на /refresh");

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            "https://makadamia.onrender.com",
            "https://mobile-site.onrender.com",
            "http://localhost:3000"
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Обязательно для передачи s!
};
app.use(express.json());
app.use(cors(corsOptions));
// Используем CORS с настройками
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api", orderRoutes);
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


// Получение заказов пользователя
app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().populate("items.productId", "name price");
        res.status(200).json(orders);
    } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        res.status(500).json({ error: "Ошибка при загрузке заказов" });
    }
});


app.get("/user-orders", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Получаем userId из токена
        const orders = await Order.find({ userId }).populate("items.productId", "name price");
        res.status(200).json(orders);
    } catch (error) {
        console.error("Ошибка при получении заказов пользователя:", error);
        res.status(500).json({ error: "Ошибка при загрузке заказов пользователя" });
    }
});


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
// Получение товара по ID
// Маршрут для получения товара по ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id); // Используется Products, так как это ваша модель
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);  // Отправляем товар
  } catch (error) {
    console.error("Ошибка при получении товара:", error);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
});

// Мидлвар для проверки токена

function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://makadamia.onrender.com", iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }  // ⏳ Access-токен на 30 минут
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://makadamia.onrender.com", iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }  // 🔄 Refresh-токен на 7 дней
    );

    return { accessToken, refreshToken };
}

const Order = require("./models/Order"); // Подключаем модель заказа

app.post("/api/order", authMiddleware, async (req, res) => {
    try {
        console.log("🔍 Полученные данные заказа:", JSON.stringify(req.body, null, 2));
        const { items, address, additionalInfo, userId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Корзина не может быть пустой" });
        }

        const itemsDetails = [];

        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Товар с ID ${item.productId} не найден` });
            }

            itemsDetails.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        const newOrder = new Order({
            userId,
            items: itemsDetails,
            address,
            additionalInfo,
            status: "Оформлен"
        });

        await newOrder.save();
        res.status(201).json({ message: "Заказ успешно оформлен", order: newOrder });
    } catch (error) {
        console.error("❌ Ошибка при создании заказа:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});


// Регистрация пользователя
app.post('/register', async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = req.body;

  try {
    console.log("Регистрация пользователя:", username);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    console.log(`Пользователь "${username}" успешно зарегистрирован.`);
    return res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return res.status(500).json({ message: 'Ошибка регистрации пользователя', error: err.message });
  }
});
// Авторизация пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Неверные данные' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshTokenDesktop", refreshToken, { 
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000  // Устанавливаем refreshToken на 30 дней
    });

    res.json({ accessToken, userId: user._id });
});


// Обработка запроса на обновление токена для ПК-версии
app.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshTokenDesktop;  // Используем refreshTokenDesktop для ПК-версии

    if (!refreshToken) {
        console.error("❌ Refresh-токен отсутствует в cookies");
        return res.status(401).json({ message: "Не авторизован" });
    }
  
    console.log("🔍 Полученный refreshToken:", refreshToken);
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decodedUser) => {
        if (err) {
            console.error("❌ Ошибка проверки refresh-токена:", err.message);
            return res.status(403).json({ message: "Недействительный refresh-токен" });
        }

        if (!decodedUser || decodedUser.site !== "https://makadamia.onrender.com") {
            console.error("❌ Токен не соответствует сайту:", decodedUser);
            return res.status(403).json({ message: "Недействительный refresh-токен" });
        }

        const user = await User.findById(decodedUser.id);
        if (!user) {
            console.error("❌ Пользователь не найден по ID:", decodedUser.id);
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        res.cookie("refreshTokenDesktop", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000  // Обновляем refreshToken на 30 дней
        });

        console.log("✅ Refresh-токен обновлен успешно");
        res.json({ accessToken });
    });
});


async function refreshAccessToken() {
    try {
        console.log("🔄 Отправляем запрос на обновление токена...");
        const response = await fetch(`${window.location.origin}/refresh`, { // ✅ Автоматически берёт URL
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            console.warn("❌ Ошибка обновления токена:", response.status);
            return null;
        }

        const data = await response.json(); // ✅ Получаем новый accessToken
        console.log("✅ Новый accessToken:", data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
    } catch (error) {  // ✅ Добавили catch
        console.error("Ошибка при обновлении токена:", error);
        return null;
    }
}
app.post('/logout', authMiddleware, (req, res) => {
    res.clearCookie("refreshTokenDesktop", {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: "/",
        domain: "makadamia.onrender.com"
    });

    res.json({ message: 'Вы вышли из системы' });
});


// Обновление токена
app.post('/-token', (req, res) => {
  const { token: Token } = req.body;

  if (!Token) {
    return res.status(403).json({ message: 'Токен обновления не предоставлен' });
  }

  try {
    const user = jwt.verify(Token, JWT_SECRET);
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
    } catch (error) {  // ✅ Добавляем обработку ошибки
        console.error("Ошибка при загрузке аккаунта:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
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

