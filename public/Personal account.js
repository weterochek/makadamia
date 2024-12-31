// public/scripts/account.js
document.addEventListener('DOMContentLoaded', () => {
  const email = 'user@example.com'; // Это можно получить динамически, например, из сессии
  const accountForm = document.getElementById('accountForm');
  const saveBtn = document.getElementById('saveBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Получаем данные пользователя при загрузке страницы
  fetch(`/api/user/${email}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('fullName').value = data.fullName;
      document.getElementById('email').value = data.email;
      document.getElementById('phone').value = data.phone;
      document.getElementById('city').value = data.city;
    })
    .catch(err => alert('Ошибка при получении данных пользователя'));

  // Обработчик для сохранения данных
  saveBtn.addEventListener('click', () => {
    const updatedData = {
      fullName: document.getElementById('fullName').value,
      phone: document.getElementById('phone').value,
      city: document.getElementById('city').value
    };

    fetch(`/api/user/${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    })
      .then(response => response.json())
      .then(data => alert('Данные сохранены'))
      .catch(err => alert('Ошибка при сохранении данных'));
  });

  // Обработчик для выхода из аккаунта
  logoutBtn.addEventListener('click', () => {
    alert('Вы вышли из аккаунта');
    // Реализуйте логику выхода (например, удаление токена из сессии или куки)
  });
});
// public/scripts/account.js
document.addEventListener('DOMContentLoaded', () => {
    const email = 'user@example.com'; // Это можно получить динамически, например, из сессии
    const accountForm = document.getElementById('accountForm');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');
  
    // Получаем данные пользователя при загрузке страницы
    fetch(`/api/user/${email}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('fullName').value = data.fullName;
        document.getElementById('email').value = data.email;
        document.getElementById('phone').value = data.phone;
        document.getElementById('city').value = data.city;
      })
      .catch(err => alert('Ошибка при получении данных пользователя'));
  
    // Обработчик для сохранения данных
    saveBtn.addEventListener('click', () => {
      const updatedData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        city: document.getElementById('city').value
      };
  
      fetch(`/api/user/${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })
        .then(response => response.json())
        .then(data => alert('Данные сохранены'))
        .catch(err => alert('Ошибка при сохранении данных'));
    });
  
    // Обработчик для выхода из аккаунта
    logoutBtn.addEventListener('click', () => {
      alert('Вы вышли из аккаунта');
      // Реализуйте логику выхода (например, удаление токена из сессии или куки)
    });
  });
  