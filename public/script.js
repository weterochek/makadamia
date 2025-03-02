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
console.log("Отправка запроса на /refresh");
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

        if (cart[itemName].quantity === 0) {
            delete cart[itemName]; // ❌ Удаляем товар из объекта cart

            // Удаляем товар из корзины на странице
            const cartItemElement = document.querySelector(`.cart-item[data-name="${itemName}"]`);
            if (cartItemElement) {
                cartItemElement.remove();
            }

            revertControlsToAddButton(itemName); // Возвращаем кнопку "Добавить"
        }

        saveCartToLocalStorage(); // Сохраняем обновлённые данные
        updateCartDisplay(); // Обновляем UI корзины

        // Если корзина пуста, скрываем её
        if (Object.keys(cart).length === 0) {
            document.getElementById("cartDropdown").style.display = "none";
        }
    }
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

    if (!addButton || !removeButton || !addButtonControl || !quantityDisplay) {
        console.warn(`❌ Ошибка: Не найдены элементы для ${itemName}`);
        return;
    }

    addButton.style.display = "none";
    removeButton.style.display = "inline-block";
    addButtonControl.style.display = "inline-block";
    quantityDisplay.style.display = "inline-block";
    quantityDisplay.textContent = cart[itemName].quantity;
}


// Возвращение кнопки "Добавить" вместо контролов, если товара нет в корзине
function revertControlsToAddButton(itemName) {
    const addButton = document.getElementById(`addButton_${itemName}`);
    const removeButton = document.getElementById(`removeBtn_${itemName}`);
    const addButtonControl = document.getElementById(`addBtn_${itemName}`);
    const quantityDisplay = document.getElementById(`quantity_${itemName}`);

    if (!addButton || !removeButton || !addButtonControl || !quantityDisplay) {
        console.warn(`⚠️ Ошибка: Не найдены элементы для товара ${itemName}`);
        return;
    }

    addButton.style.display = "inline-block";
    removeButton.style.display = "none";
    addButtonControl.style.display = "none";
    quantityDisplay.style.display = "none";
}
//ощичение корзины
document.addEventListener('DOMContentLoaded', () => {
    const clearCartButton = document.getElementById('clear-cart');
    const cartTotal = document.getElementById('totalAmount'); // Элемент с итоговой суммой
    const cartItemsContainer = document.getElementById('cartItems'); // Контейнер товаров в корзине

    // Функция обновления отображения корзины
    function updateCartDisplay() {
        // Очищаем корзину на странице
        cartItemsContainer.innerHTML = '';

        // Получаем корзину из localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        let totalAmount = 0;

        // Перебираем все товары в корзине и рассчитываем общую сумму
        for (const item in cart) {
            totalAmount += cart[item].price * cart[item].quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">${item} - ${cart[item].price * cart[item].quantity} ₽</div>
                <div class="cart-buttons">
                    <button onclick="decrementItem('${item}')">-</button>
                    <span class="quantity">${cart[item].quantity}</span>
                    <button onclick="incrementItem('${item}', ${cart[item].price})">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        }

        // Обновляем итоговую сумму
        cartTotal.textContent = `Итого: ${totalAmount} ₽`;
    }

    // Очищение корзины
    if (clearCartButton) {
        clearCartButton.addEventListener('click', () => {
            localStorage.removeItem('cart'); // Удаляем корзину из localStorage
            updateCartDisplay(); // Обновляем отображение корзины
        });
    }

    // Инициализируем корзину при загрузке страницы
    updateCartDisplay();
});

// Обновление отображения корзины и количества товара на карточке
function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = ""; // Очищаем список товаров
    let totalAmount = 0;

    for (const item in cart) {
        const itemTotal = cart[item].price * cart[item].quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.setAttribute("data-name", item); // Добавляем атрибут для поиска
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

    // Если корзина пуста, скрываем её
    if (Object.keys(cart).length === 0) {
        document.getElementById("cartDropdown").style.display = "none";
    }
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
// Загрузка корзины из localStorage при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    const cartModal = document.getElementById("cartModal");
    if (cartModal) cartModal.style.display = "none";
});

// Функция загрузки корзины
async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("token");
    console.log("📡 Запрос с авторизацией:", url);

    let response = await fetch(url, {
        ...options,
        credentials: "include", // 🔹 ОБЯЗАТЕЛЬНО!
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        console.warn("🔄 Токен недействителен, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return response;

        return await fetch(url, {
            ...options,
            credentials: "include",
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
    }

    return response;
}


function getTokenExp(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp;
    } catch (e) {
        return null;
    }
}


function startTokenRefresh() {
    setInterval(async () => {
        const token = localStorage.getItem("token");
        if (!token || isTokenExpired(token)) {
            console.log("🔄 Токен устарел, обновляем...");
            await refreshAccessToken();
        }
    }, 5 * 60 * 1000); // Проверка каждые 5 минут
}
startTokenRefresh();


async function refreshAccessToken() {
    console.log("🔄 Попытка обновления токена..."); // 👈 Проверяем, вызывается ли функция

    try {
        const response = await fetch("https://makadamia.onrender.com/refresh", {
            method: "POST",
            credentials: "include", // 🔹 Передаёт куки!
        });

        if (!response.ok) {
            console.warn("❌ Ошибка обновления токена, требуется повторный вход.");
            logout();
            return null;
        }

        const data = await response.json();
        console.log("✅ Новый accessToken:", data.accessToken); // 👈 Проверяем, получаем ли токен

        if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
            return data.accessToken;
        } else {
            console.error("❌ Сервер не вернул accessToken!");
            logout();
            return null;
        }
    } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        logout();
        return null;
    }
}




function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Декодируем токен
        return (Date.now() / 1000) >= payload.exp; // Проверяем срок действия
    } catch (e) {
        return true; // Если ошибка — считаем токен недействительным
    }
}


// Запускаем проверку токена раз в минуту
setInterval(() => {
    if (isTokenExpired()) {
        console.log("⏳ Проверяем обновление токена...");
        console.log("🔄 Токен истёк, обновляем...");
        refreshAccessToken().then(newToken => {
            console.log("✅ Новый токен после автообновления:", newToken);
        }).catch(err => console.error("❌ Ошибка обновления:", err));
    }
}, 60000); // 1 раз в минуту


function editField(field) {
    const input = document.getElementById(field + "Input");
    console.log("Редактируем поле:", field, "Значение:", input.value);

    if (input.disabled) {
        input.disabled = false;
        input.focus();
    } else {
        fetch("https://makadamia.onrender.com/account", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ [field]: input.value }) // Отправляем данные на сервер
        })
        .then(response => response.json())
        .then(data => {
            console.log("Ответ сервера:", data);
            input.disabled = true;
        })
        .catch(error => console.log("Ошибка обновления профиля:", error));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("https://makadamia.onrender.com/account", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.name) document.getElementById("nameInput").value = data.name;
        if (data.city) document.getElementById("cityInput").value = data.city;
    })
    .catch(() => console.log("Ошибка загрузки профиля"));
});
document.addEventListener("DOMContentLoaded", () => {
    console.log("Страница загружена");

    const editNameBtn = document.getElementById("editName");
    const editCityBtn = document.getElementById("editCity");

    if (editNameBtn) {
        editNameBtn.addEventListener("click", () => editField("name"));
    } else {
        console.warn("Кнопка editName не найдена!");
    }

    if (editCityBtn) {
        editCityBtn.addEventListener("click", () => editField("city"));
    } else {
        console.warn("Кнопка editCity не найдена!");
    }
});
// Проверка состояния авторизации
function checkAuthStatus() {
    const token = localStorage.getItem('token'); // Проверяем наличие токена
    const username = localStorage.getItem('username'); // Получаем имя пользователя
    const authButton = document.getElementById('authButton'); // Кнопка "Вход"
    const cabinetButton = document.getElementById('cabinetButton'); // Кнопка "Личный кабинет"
    const logoutButton = document.getElementById('logoutButton'); // Кнопка "Выход"

    if (token && username) {
        // Если токен и имя пользователя существуют
        authButton.style.display = 'none'; // Скрываем кнопку "Вход"
        cabinetButton.style.display = 'inline-block'; // Показываем "Личный кабинет"

        // Логика для отображения кнопки "Выход" только на странице кабинета
        if (window.location.pathname === '/account.html' && logoutButton) {
            logoutButton.style.display = 'inline-block';
        }
    } else {
        // Если токена или имени пользователя нет
        authButton.style.display = 'inline-block'; // Показываем кнопку "Вход"
        cabinetButton.style.display = 'none'; // Скрываем "Личный кабинет"

        if (logoutButton) {
            logoutButton.style.display = 'none'; // Скрываем кнопку "Выход"
        }
    }
}

function handleAuthClick() {
    window.location.href = '/login.html'; // Переход на страницу входа
}


// Логика для выхода
async function logout() {
    try {
        // Отправляем запрос на сервер для удаления refreshToken
        const response = await fetch("/logout", {
            method: "POST",
            credentials: "include" // Передаёт куки
        });

        if (!response.ok) {
            console.error("❌ Ошибка при выходе с сервера");
        }

        // Очищаем данные из localStorage и sessionStorage
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("cart_guest"); // Очищаем корзину гостя
        sessionStorage.clear();

        // Очищаем куки вручную (если сервер не удалил)
        document.cookie = "refreshTokenDesktop=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "refreshTokenMobile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        checkAuthStatus(); // Обновляем UI

        window.location.href = "/"; // Перенаправляем на главную страницу
    } catch (error) {
        console.error("Ошибка при выходе:", error);
    }
}

// Переход на страницу личного кабинета
function openCabinet() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
        // Если токен отсутствует, перенаправляем на страницу входа
        window.location.href = "/login.html";
    } else {
        // Переход на страницу личного кабинета
        window.location.href = "/account.html";
    }
}

// Инициализация авторизации и кнопок при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
    checkAuthStatus();

    // Убеждаемся, что кнопка "Выход" отображается только в личном кабинете
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton && window.location.pathname !== '/account.html') {
        logoutButton.style.display = 'none';
    }
});

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


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token'); // Получаем токен из localStorage
    if (!token) {
        document.getElementById('usernameDisplay').innerText = "Гость";
        return;
    }
    fetch('/account', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.username) {
            document.getElementById('usernameDisplay').innerText = data.username;
            document.getElementById('authButton').style.display = 'none'; // Скрываем "Вход"
            document.getElementById('cabinetButton').style.display = 'inline-block'; // Показываем "Личный кабинет"
        } else {
            document.getElementById('usernameDisplay').innerText = "Ошибка загрузки";
        }
    })
    .catch(() => {
        document.getElementById('usernameDisplay').innerText = "Ошибка загрузки";
    });
});
async function updateAccount(newUsername, newPassword) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("https://makadamia.onrender.com/account", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Без этого сервер отклонит запрос
    },
    body: JSON.stringify({ username: newUsername, password: newPassword }),
  });

  const data = await response.json();
  console.log("Ответ от сервера:", data);
}
function logout() {
    localStorage.removeItem('token'); // Удаляем токен
    window.location.href = 'index.html'; // Перенаправляем на главную
}
function handleAuthClick() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'account.html'; // Если пользователь авторизован, переходим в личный кабинет
    } else {
        window.location.href = 'login.html'; // Если нет, перенаправляем на страницу входа
    }
}
window.addEventListener("storage", (event) => {
    if (event.key === "sharedAccessTokenUpdate") {
        const newToken = localStorage.getItem("sharedAccessToken");
        if (newToken) {
            localStorage.setItem("token", newToken);
            console.log("Токен обновлён через localStorage:", newToken);
        }
    }
});
