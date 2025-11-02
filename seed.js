const mongoose = require('mongoose');
const Product = require('./models/Products');
const Review = require('./models/Review');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const productsData = require('./models/products.json'); // если есть JSON

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://makadamia:tAboLWufOqunAY09@cluster0.3v6ie.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const seed = async () => {
  try {
    // 1. Очистка коллекций (опционально)
    await Product.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    // 2. Создание стартовых данных
    const users = await User.insertMany([
      { name: 'Admin', email: 'admin@test.com', password: '123456' },
      { name: 'User', email: 'user@test.com', password: '123456' },
    ]);

    const products = await Product.insertMany(productsData);

    const reviews = await Review.insertMany([
      { text: 'Отлично!', rating: 5, user: users[1]._id },
    ]);

    console.log('Seed done');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

