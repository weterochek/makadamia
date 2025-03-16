const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // связь с пользователем
    name: { type: String, required: true },
    address: { type: String, required: true },
    additionalInfo: { type: String },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

