const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "секретный_ключ";

// Middleware для проверки авторизации
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Токен не предоставлен" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Ошибка проверки токена:", err.message);
        return res.status(403).json({ message: "Недействительный токен" });
    }
};

module.exports = { protect }; // ✅ Оставляем только этот экспорт
