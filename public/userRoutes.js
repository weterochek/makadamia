// routes/userRoutes.js
const express = require('express');
const User = require('../public/User');
const router = express.Router();

// Получение данных пользователя по email
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении данных пользователя', error });
  }
});

// Обновление данных пользователя
router.post('/:email', async (req, res) => {
  const { fullName, phone, city } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      { fullName, phone, city },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении данных пользователя', error });
  }
});

module.exports = router;
