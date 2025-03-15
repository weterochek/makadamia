const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("./models/Products");  // Подключаем модель товара

// Подключение к MongoDB с использованием переменной окружения или указанного URI
const mongoURI = process.env.MONGO_URI || "mongodb://11_ifelephant:ee590bdf579c7404d12fd8cf0990314242d56e62@axs-h.h.filess.io:27018/11_ifelephant";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB подключен!");
}).catch(err => {
    console.error("Ошибка подключения к MongoDB:", err);
});

// Читаем JSON файл с товарами
fs.readFile("products.json", "utf8", (err, data) => {
    if (err) {
        console.error("Ошибка при чтении файла:", err);
        return;
    }
    
    const products = JSON.parse(data); // Парсим JSON

    // Добавляем товары в базу данных
    Product.insertMany(products)
        .then(() => {
            console.log("Товары успешно добавлены в базу данных");
            mongoose.connection.close(); // Закрываем соединение с БД после добавления
        })
        .catch(err => {
            console.error("Ошибка при добавлении товаров:", err);
            mongoose.connection.close();
        });
});
