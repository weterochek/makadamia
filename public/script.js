let cart = {};
window.onload = function() {
    const userAgent = navigator.userAgent.toLowerCase();
  
    // Логирование для проверки, что передается в User-Agent
    console.log("User-Agent: ", userAgent);
  
    if (userAgent.includes('mobile')) {
      // Перенаправление на мобильную версию сайта
      
      if (!window.location.href.includes('mobile-site.onrender.com')) {
        window.location.href = "https://mobile-site.onrender.com";
      }
    } else {
      // Перенаправление на десктопную версию сайта
      if (!window.location.href.includes('makadamia.onrender.com')) {
        window.location.href = "https://makadamia.onrender.com";
      }
    }
  };

// Функция для показа/скрытия выпадающего окна корзины под кнопкой "Корзина"
document.addEventListener("DOMContentLoaded", function() {
    const cartButton = document.getElementById('cartButton');
    const cartDropdown = document.getElementById('cartDropdown');

    // Открытие/закрытие корзины при клике на кнопку
    cartButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Остановка распространения события клика
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Закрытие корзины при клике на крестик
    const closeCartButton = document.createElement("span");
    closeCartButton.innerHTML = "✖";
    closeCartButton.style.cursor = "pointer";
    closeCartButton.style.position = "absolute";
    closeCartButton.style.top = "10px";
    closeCartButton.style.right = "10px";
    closeCartButton.style.fontSize = "1.2em";
    closeCartButton.style.color = "black";
    closeCartButton.addEventListener("click", function(event) {
        event.stopPropagation();
        cartDropdown.style.display = 'none';
    });

    cartDropdown.prepend(closeCartButton); // Добавляем крестик в начало содержимого
    checkAuthStatus();
});

// Добавление товара в корзину
function addToCart(itemName, itemPrice) {
    if (cart[itemName]) {
        cart[itemName].quantity += 1;
    } else {
        cart[itemName] = { price: itemPrice, quantity: 1 };
    }
    saveCartToLocalStorage();
    updateCartDisplay();
    replaceAddButtonWithControls(itemName);
}

// Уменьшение количества товара
function decrementItem(itemName) {
    if (cart[itemName]) {
        cart[itemName].quantity -= 1;
        if (cart[itemName].quantity <= 0) {
            delete cart[itemName]; // Удаляем товар из корзины
            revertControlsToAddButton(itemName);
        }
        saveCartToLocalStorage();
        updateCartDisplay();
    }
}

// Проверка состояния авторизации
function checkAuthStatus() {
    const token = localStorage.getItem('token');  // Проверка наличия токена в localStorage
    const authButton = document.getElementById('authButton');
    const logoutButton = document.getElementById('logoutButton');

    if (token) {
        // Если токен существует, показываем кнопку "Выход"
        authButton.style.display = 'none'; 
        logoutButton.style.display = 'inline-block';
        loadCartFromLocalStorage();  // Загружаем корзину
    } else {
        // Если нет токена, показываем кнопку "Вход"
        authButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }
}

// Логика для входа
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html'); // Убедитесь, что файл login.html существует
});

// Логика для выхода
function logout() {
    localStorage.removeItem('token');  // Удаляем токен
    localStorage.removeItem('username');  // Удаляем данные пользователя
    cart = {}; // Очистить корзину
    checkAuthStatus();  // Обновляем интерфейс
    window.location.href = '/';  // Переход на главную страницу
}

// Увеличение количества товара
function incrementItem(itemName, itemPrice) {
    addToCart(itemName, itemPrice);
}

// Преобразование кнопки "Добавить" в контролы "+", "-", и количество
function replaceAddButtonWithControls(itemName) {
    const addButton = document.getElementById(`addButton_${itemName}`);
    const removeButton = document.getElementById(`removeBtn_${itemName}`);
    const addButtonControl = document.getElementById(`addBtn_${itemName}`);
    const quantityDisplay = document.getElementById(`quantity_${itemName}`);

    addButton.style.display = "none";
    removeButton.style.display = "inline-block";
    addButtonControl.style.display = "inline-block";
    quantityDisplay.style.display = "inline-block";
    quantityDisplay.textContent = cart[itemName].quantity; // Устанавливаем начальное количество
}

// Возвращение кнопки "Добавить" вместо контролов, если товара нет в корзине
function revertControlsToAddButton(itemName) {
    const addButton = document.getElementById(`addButton_${itemName}`);
    const removeButton = document.getElementById(`removeBtn_${itemName}`);
    const addButtonControl = document.getElementById(`addBtn_${itemName}`);
    const quantityDisplay = document.getElementById(`quantity_${itemName}`);

    addButton.style.display = "inline-block";
    removeButton.style.display = "none";
    addButtonControl.style.display = "none";
    quantityDisplay.style.display = "none";
}

// Обновление отображения корзины и количества товара на карточке
function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = "";
    let totalAmount = 0;

    for (const item in cart) {
        const itemTotal = cart[item].price * cart[item].quantity;
        totalAmount += itemTotal;

        const quantityDisplay = document.getElementById(`quantity_${item}`);
        if (quantityDisplay) {
            quantityDisplay.textContent = cart[item].quantity;
        }

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="item-info">${item} - ${itemTotal} ₽</div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${item}')">-</button>
                <span class="quantity">${cart[item].quantity}</span>
                <button onclick="incrementItem('${item}', ${cart[item].price})">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    }

    document.getElementById("totalAmount").textContent = `Итого: ${totalAmount} ₽`;
}

// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    const username = localStorage.getItem("username");
    if (username) {
        localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    }
}

// Оформление заказа
function checkout() {
    alert("Ваш заказ оформлен!");
    cart = {};
    updateCartDisplay();
    resetAddToCartButtons();
    saveCartToLocalStorage();
    toggleCart();
}

// Сброс всех кнопок на исходное состояние "Добавить"
function resetAddToCartButtons() {
    for (const itemName in cart) {
        revertControlsToAddButton(itemName);
    }
}

// Загрузка корзины из localStorage при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    const cartModal = document.getElementById("cartModal");
    if (cartModal) cartModal.style.display = "none";
});

// Функция загрузки корзины
function loadCartFromLocalStorage() {
    const username = localStorage.getItem("username");
    if (username) {
        const storedCart = JSON.parse(localStorage.getItem(`cart_${username}`));
        if (storedCart) {
            cart = storedCart;
        }
        updateCartDisplay();
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');  // Проверка наличия токена в localStorage
    const authButton = document.getElementById('authButton');
    const logoutButton = document.getElementById('logoutButton');

    if (token) {
        // Если токен существует, показываем кнопку "Выход"
        authButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        loadCartFromLocalStorage();  // Загружаем корзину
    } else {
        // Если нет токена, показываем кнопку "Вход"
        authButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }
}

// Логика для входа
function handleAuthClick() {
    window.location.href = '/login.html';  // Переход на login.html
}

// Логика для выхода
function logout() {
    localStorage.removeItem('token');  // Удаляем токен
    localStorage.removeItem('username');  // Удаляем данные пользователя
    cart = {}; // Очистить корзину
    checkAuthStatus();  // Обновляем интерфейс
    window.location.href = '/';  // Переход на главную страницу
}

// Переход на страницу личного кабинета
function openCabinet() {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!token || !username) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        window.location.href = "/login";
    } else {
        // Перенаправляем на страницу личного кабинета
        window.location.href = "/account.html";
    }
}

// Расчет баланса на основе корзины
function calculateBalance() {
    let balance = 0;
    for (const item in cart) {
        balance += cart[item].price * cart[item].quantity;
    }
    return balance;
}

// Переход на страницу оформления заказа
function goToCheckoutPage() {
    saveCartToLocalStorage();
    window.location.href = "checkout.html";
}
