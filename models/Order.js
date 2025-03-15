const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: String, required: true },  // Изменено на String
      quantity: { type: Number, required: true },
    }
  ],
  address: { type: String, required: true },
  additionalInfo: { type: String },
  status: { type: String, enum: ["Оформлен", "Отправлен", "Доставлен"], default: "Оформлен" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Orders", OrderSchema);

