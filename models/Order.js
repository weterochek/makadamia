// Пример модели Order
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    additionalInfo: { type: String, default: '' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  // Замените productName на productId
        quantity: { type: Number, required: true }
    }]
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
