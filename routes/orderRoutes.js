const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // Подключаем модель заказа
const authMiddleware = require("../middleware/authMiddleware");

// Создание заказа

router.post("/order", authMiddleware, async (req, res) => {
    try {
        console.log("🔍 Полученные данные заказа:", req.body); // Логируем приходящие данные

        const { items, address, additionalInfo } = req.body;

        // Проверка на пустую корзину
        if (!items || items.length === 0) {
            console.error("❌ Корзина пуста");
            return res.status(400).json({ message: "Корзина не может быть пустой" });
        }

        const userId = req.user.id;
        const newOrder = new Order({
            userId,
            items,
            address,
            additionalInfo,
            status: "Оформлен"
        });

        await newOrder.save();
        console.log("✅ Заказ успешно сохранен:", newOrder);
        res.status(201).json({ message: "Заказ успешно оформлен" });
    } catch (error) {
        console.error("❌ Ошибка при сохранении заказа:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});



// Получение заказов пользователя
app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().populate("items.productId", "name price");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при загрузке заказов" });
    }
});

app.get("/user-orders/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ userId }).populate("items.productId", "name price");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при загрузке заказов пользователя" });
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
