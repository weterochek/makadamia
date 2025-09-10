require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const app = express();
const orderRoutes = require("./routes/orderRoutes");
const { protect } = require('./middleware/authMiddleware');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require("./models/Products");  
const fs = require('fs');
const reviewsFile = 'reviews.json';
const Review = require('./models/Review');
const Joi = require("joi");
const sendEmail = require("./utils/sendEmail");

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
            "https://makadamia-e0hb.onrender.com",
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
app.use('/api', orderRoutes);
// Подключение к MongoDB
const JWT_SECRET = process.env.JWT_SECRET || "ai3ohPh3Aiy9eeThoh8caaM9voh5Aezaenai0Fae2Pahsh2Iexu7Qu/";
const mongoURI = process.env.MONGO_URI || "mongodb://11_whatslide:0a53b4a821bb53479e0982d4f721befc9b406376@odl9-t.h.filess.io:61004/11_whatslide";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "J8$GzP1d&KxT^m4YvNcR";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false, // Включено SSL
})
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware для обработки JSON

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
app.post('/cart/add', protect, async (req, res) => {
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
app.get('/user-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении заказов" });
  }
});
// Маршрут для получения товара по ID
app.get('/s/:id', async (req, res) => {
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

app.get('/api/products', async (req, res) => {
    try {
        const products = await Products.find();  // Используется Products, так как это ваша модель
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Ошибка получения списка продуктов" });
    }
});

// Получение всех заказов
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.productId');
        res.json(orders);
    } catch (err) {
        console.error("❌ Ошибка получения заказов:", err);
        res.status(500).json({ message: "Ошибка получения заказов" });
    }
});
app.post("/api/order", protect, async (req, res) => {
    try {
        const { items, address, additionalInfo, createdAt } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Корзина не может быть пустой" });
        }

        const newOrder = new Order({
            userId: req.user.id,
            address,
            additionalInfo,
            items,
            createdAt,
        });

        await newOrder.save();

        res.status(201).json({ message: "Заказ успешно оформлен", order: newOrder });
    } catch (error) {
        console.error("Ошибка при создании заказа:", error);
        res.status(500).json({ message: "Ошибка при создании заказа", error: error.message });
    }
});
app.get("/verify-email", async (req, res) => {
  const { token, email } = req.query;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
    $or: [{ email }, { pendingEmail: email }]
  });

  if (!user) return res.status(400).send("❌ Ссылка устарела или неверна");

  user.emailVerified = true;
  if (user.pendingEmail === email) {
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.send("✅ Email успешно подтверждён. Можете закрыть страницу.");
});


app.post("/resend-verification", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });
  if (user.emailVerified) return res.status(400).json({ message: "Почта уже подтверждена" });

  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const verifyUrl = `https://makadamia-app-etvs.onrender.com/verify-email?token=${token}&email=${user.email}`;

  await transporter.sendMail({
    from: '"Makadamia" <seryojabaulin25@gmail.com>',
    to: user.email,
    subject: "Подтверждение почты",
    html: `
      <h2>Подтвердите вашу почту</h2>
      <p>Нажмите <a href="${verifyUrl}">сюда</a>, чтобы подтвердить email.</p>
      <p><small>Срок действия — 24 часа.</small></p>
    `
  });

  res.json({ message: "Письмо повторно отправлено на почту." });
});
const transporter = nodemailer.createTransport({
  service: "gmail", // или 'yandex', 'mail.ru', 'smtp.yourhost.com'
  auth: {
    user: "seryojabaulin25@gmail.com",     // ← ТВОЙ EMAIL
    pass: "exwtwuflxjzonrpa"         // ← Пароль или App Password
  }
});
// Запрос на сброс пароля
app.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetLink = `https://makadamia-e0hb.onrender.com/reset.html?token=${resetToken}`;

  await sendEmail(user.email, "Восстановление пароля", `
    <h3>Здравствуйте, ${user.username}!</h3>
    <p>Вы запросили восстановление пароля на сайте Makadamia.</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p><small>Ссылка активна в течение 15 минут.</small></p>
  `);

  res.json({ message: "📨 Письмо отправлено" });
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Ссылка устарела или недействительна" });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  res.json({ message: "Пароль успешно обновлён" });
});
// Получение заказов пользователя
app.get('/user-orders/:userId', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).populate("items.productId", "name price");
        res.json(orders);
    } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        res.status(500).json({ message: "Ошибка при получении заказов" });
    }
});
app.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        res.status(500).json({ message: 'Ошибка при получении отзывов' });
    }
});

app.post('/reviews', protect, async (req, res) => {
    try {
        const { rating, comment, displayName } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const review = new Review({
            rating,
            comment,
            username: user.username,
            displayName: displayName || null,
            userId: user._id
        });

        await review.save();

        // Также сохраняем в файл для обратной совместимости
        const reviews = readReviews();
        reviews.push({
            id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            username: review.username,
            displayName: review.displayName,
            date: review.date
        });
        saveReviews(reviews);

        res.status(201).json(review);
    } catch (error) {
        console.error('Ошибка при сохранении отзыва:', error);
        res.status(500).json({ message: 'Ошибка при сохранении отзыва' });
    }
});



// Функция чтения отзывов из файла
function readReviews() {
    if (!fs.existsSync(reviewsFile)) {
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
    } catch (error) {
        console.error("Ошибка чтения отзывов:", error);
        return [];
    }
}

// Функция сохранения отзывов в файл
function saveReviews(reviews) {
    try {
        fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), 'utf8');
    } catch (error) {
        console.error("Ошибка сохранения отзывов:", error);
    }
}

function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://makadamia-e0hb.onrender.com", iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }  // ⏳ Access-токен на 30 минут
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site: "https://makadamia-e0hb.onrender.com", iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }  // 🔄 Refresh-токен на 7 дней
    );

    return { accessToken, refreshToken };
}




// Регистрация пользователя
app.post('/register', async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password, email } = req.body;

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: "Имя пользователя может содержать только латинские буквы, цифры и подчёркивания" });
  }

  try {
    console.log("Регистрация пользователя:", username);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, password: hashedPassword, email });

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
    res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
    res.cookie("refreshTokenPC", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: "makadamia-e0hb.onrender.com", // 💡 строго ограничиваем домен
    maxAge: 30 * 24 * 60 * 60 * 1000
});
    res.json({ accessToken, userId: user._id });
});


// Обработка запроса на обновление токена для ПК-версии
app.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshTokenPC;

    if (!refreshToken) {
        console.error("❌ Refresh-токен отсутствует в cookies");
        return res.status(401).json({ message: "Не авторизован" });
    }

    console.log("🔍 Полученный refreshToken:", refreshToken);
    
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            console.error("❌ Ошибка проверки refresh-токена:", err.message);
            
res.clearCookie("refreshTokenPC", {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: "/",
  domain: "makadamia-e0hb.onrender.com"
});

            return res.status(403).json({ message: "Refresh-токен недействителен или истёк" });
        }

        if (!decoded.exp || (decoded.exp * 1000 < Date.now())) {
            console.error("❌ Refresh-токен окончательно истёк!");
            res.clearCookie("refreshTokenPC", { path: "/" });
            return res.status(403).json({ message: "Refresh-токен истёк" });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                console.error("❌ Пользователь не найден по ID:", decoded.id);
                return res.status(404).json({ message: "Пользователь не найден" });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
            res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
            res.cookie("refreshTokenDesktop", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000  // 30 дней
            });

            console.log("✅ Refresh-токен обновлён успешно");

            // 🚀 Отключаем кеширование
            res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.json({ accessToken });

        } catch (error) {
            console.error("❌ Ошибка при поиске пользователя:", error);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    });
});


app.post('/logout', (req, res) => {
    console.log("🔄 Выход из аккаунта...");
    
res.clearCookie("refreshTokenPC", {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: "/",
    domain: "makadamia-e0hb.onrender.com"
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
app.get("/confirm-email-change/:token", async (req, res) => {
  try {
    const user = await User.findOne({ emailVerificationToken: req.params.token });
    if (!user) return res.status(400).send("Неверная или устаревшая ссылка");

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerified = true;
    await user.save();

    return res.send("✅ Почта успешно подтверждена. Можете закрыть вкладку.");
  } catch (err) {
    console.error("Ошибка подтверждения email:", err);
    return res.status(500).send("Ошибка сервера");
  }
});
app.post("/account/resend-verification", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.pendingEmail) {
    return res.status(400).json({ message: "Нет нового email для подтверждения" });
  }

  const now = Date.now();

  if (now - (user.emailVerificationLastSent || 0) < 60 * 1000) {
    return res.status(429).json({ message: "⏱ Повторная отправка доступна через минуту" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = token;
  user.emailVerificationExpires = now + 24 * 60 * 60 * 1000;
  user.emailVerificationLastSent = now;
  await user.save();

  const verifyUrl = `https://makadamia-e0hb.onrender.com/verify-email?token=${token}&email=${user.pendingEmail}`;

  await sendEmail(user.pendingEmail, "Подтверждение нового email", `
    <h2>Подтвердите новую почту</h2>
    <p>Нажмите <a href="${verifyUrl}">сюда</a>, чтобы подтвердить email: <b>${user.pendingEmail}</b>.</p>
    <p><small>Срок действия — 24 часа.</small></p>
  `);

  res.json({ message: "📨 Письмо повторно отправлено" });
});


app.post("/account/email-change", protect, async (req, res) => {
  const { email } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  const now = Date.now();

  if (now - (user.emailVerificationLastSent || 0) < 60 * 1000) {
    return res.status(429).json({ message: "⏱ Повторная отправка доступна через минуту" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.pendingEmail = email;
  user.emailVerificationToken = token;
  user.emailVerificationExpires = now + 24 * 60 * 60 * 1000;
  user.emailVerificationLastSent = now;
  await user.save();

  const verifyUrl = `https://makadamia-e0hb.onrender.com/verify-email?token=${token}&email=${email}`;

  await sendEmail(email, "Подтверждение нового email", `
    <h2>Подтвердите новую почту</h2>
    <p>Нажмите <a href="${verifyUrl}">сюда</a>, чтобы подтвердить email: <b>${email}</b>.</p>
    <p><small>Срок действия — 24 часа.</small></p>
  `);

  res.json({ email: user.email });
});


// Приватный маршрут
app.get('/private-route', protect, (req, res) => {
  res.json({ message: `Добро пожаловать, пользователь ${req.user.id}` });
});
app.get('/account', protect, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const user = await User.findById(req.user.id).select("username name city email");
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
              // 🚀 Отключаем кеширование
        res.setHeader("Access-Control-Allow-Credentials", "true"); // ✅ Добавили заголовок
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

res.json({
  username: user.username,
  name: user.name,
  city: user.city,
  email: user.email,
  emailVerified: user.emailVerified // ⬅️ добавлено
});
    } catch (error) {  // ✅ Добавляем обработку ошибки
        console.error("Ошибка при загрузке аккаунта:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
app.put('/account', protect, async (req, res) => {
    const { name, city, username, password, email } = req.body; // Получаем данные из запроса

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (name) user.name = name;  // Обновляем имя
        if (city) user.city = city;  // Обновляем город
        if (username) user.username = username;  // Обновляем username
        if (password) user.password = await bcrypt.hash(password, 12);  // Обновляем пароль
        if (email && email !== user.email) {
    user.pendingEmail = email;

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 3600000; // 1 час

    const verifyLink = `${user.site || "https://makadamia-e0hb.onrender.com"}/verify-email?token=${token}&email=${email}`;
    await transporter.sendMail({
      to: email,
      subject: "Подтверждение нового email",
      html: `<p>Вы запросили изменение email. Подтвердите его по ссылке:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`
    });
}

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
