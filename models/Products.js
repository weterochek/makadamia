const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    // Добавьте другие поля, если необходимо
});

const Product = mongoose.model('Products', productSchema); // Убедитесь, что модель называется 'Products'

module.exports = Product;
