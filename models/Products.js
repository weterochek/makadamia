const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    // Можно добавить другие поля, если нужно, например, описание
});

module.exports = mongoose.model("Products", productSchema);  // Модель с названием "Products"
