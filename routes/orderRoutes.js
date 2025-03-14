const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // Подключаем модель заказа
const authMiddleware = require("../middleware/authMiddleware");

// Создание заказа
router.post("/order", authMiddleware, async (req, res) => {
    try {
        const { cart, address, additionalInfo } = req.body;
        const userId = req.user.id;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Корзина не может быть пустой" });
        }

        const newOrder = new Order({
            userId,
            items: cart, // ✅ cart передаём как items
            address,
            additionalInfo,
            status: "Оформлен"
        });

        await newOrder.save();
        res.status(201).json({ message: "Заказ успешно оформлен" });
    } catch (error) {
        console.error("Ошибка при создании заказа:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение заказов пользователя
router.get("/orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });
        res.json(orders);
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение всех заказов (например, для админов)
router.get("/all-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error("Ошибка загрузки всех заказов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Обновление статуса заказа
router.put("/order/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: "Статус заказа обновлен" });
    } catch (error) {
        console.error("Ошибка обновления статуса заказа:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
