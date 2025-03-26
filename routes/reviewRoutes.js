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
    try {
        const { rating, comment, username } = req.body;
        const review = new Review({
            user: req.user._id,
            username,
            rating,
            comment
        });
        await review.save();
        res.status(201).json({ message: "Отзыв добавлен" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при добавлении отзыва" });
    }
});

module.exports = router;
