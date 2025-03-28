const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Review = require("../models/Review");

const router = express.Router();

// Получить все отзывы
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Добавить отзыв (только авторизованные пользователи)
router.post("/", protect, async (req, res) => {
    const { rating, comment, username } = req.body;
    const user = req.user; // Авторизованный пользователь

    // Проверяем, если имя не указано, используем username пользователя
    let displayName = username ? `${username} (${user.username})` : user.username;

    try {
        const review = new Review({
            user: user._id,
            username: displayName, // сохраняем username + имя
            rating,
            comment,
        });

        await review.save();
        res.json({ message: "Отзыв добавлен!", review });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при сохранении отзыва" });
    }
});

module.exports = router;
