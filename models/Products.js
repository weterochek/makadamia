const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // Добавьте другие поля, если необходимо
});

module.exports = mongoose.model("Products", productSchema);
