let cart = {};

window.onload = function () {
    const userAgent = navigator.userAgent.toLowerCase();
    const currentURL = window.location.href;

    if (sessionStorage.getItem("redirected")) return; // ✅ Проверка на зацикливание редиректа

    if (userAgent.includes("mobile") && !currentURL.includes("mobile-site.onrender.com")) {
        sessionStorage.setItem("redirected", "true"); 
        window.location.href = "https://mobile-site.onrender.com";
    } else if (!userAgent.includes("mobile") && !currentURL.includes("makadamia.onrender.com")) {
        sessionStorage.setItem("redirected", "true"); 
        window.location.href = "https://makadamia.onrender.com";
    }
};

console.log("Отправка запроса на /refresh");
console.log("Токен перед запросом:", localStorage.getItem("token"));

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token && !sessionStorage.getItem("authChecked")) {
    sessionStorage.setItem("authChecked", "true");
    await refreshAccessToken();
}

    const cartButton = document.getElementById("cartButton");
    const cartDropdown = document.getElementById("cartDropdown");

    if (cartButton && cartDropdown) {
        cartButton.addEventListener("click", function (event) {
            event.stopPropagation();
            cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
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
        closeCartButton.addEventListener("click", function (event) {
            event.stopPropagation();
            cartDropdown.style.display = "none";
        });

        cartDropdown.prepend(closeCartButton);
    } else {
        console.warn("❌ cartButton или cartDropdown не найдены!");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("cookiesAccepted")) {
        showCookieBanner();
    }
});

function showCookieBanner() {
    const banner = document.createElement("div");
    banner.innerHTML = `
        <div id="cookie-banner" style="position: fixed; bottom: 0; width: 100%; background: black; color: white; padding: 10px; text-align: center; z-index: 1000;">
            <p>Мы используем cookies для улучшения работы сайта. Они позволяют оставаться в аккаунте дольше, так как мы передаём данные с помощью них. 
            <button id="acceptCookies" style="margin-left: 10px;">Принять</button></p>
        </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("acceptCookies").addEventListener("click", function () {
        localStorage.setItem("cookiesAccepted", "true");
        banner.remove();
    });
}


document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("cookiesAccepted") === "true") {
        const token = localStorage.getItem("token"); // Получаем токен

        if (!token) {
            console.warn("❌ Нет токена, не запрашиваем /account");
            return;
        }

        fetch("https://makadamia.onrender.com/account", {
            method: "GET", // ✅ Добавляем явное указание метода
            credentials: "include", // ✅ Передаем cookies
            headers: {
                "Authorization": `Bearer ${token}` // ✅ Передаем токен
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => console.log("✅ Данные аккаунта:", data))
        .catch(error => console.error("❌ Ошибка загрузки аккаунта:", error));
    } else {
        console.log("⚠️ Пользователь не принял cookies. Запрос не отправлен.");
    }
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
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
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
        const username = localStorage.getItem("username");
        if (username) {
            localStorage.removeItem(`cart_${username}`); // Удаляем корзину для текущего пользователя
        }
        localStorage.removeItem('cart'); // Если корзина также хранится под этим ключом
        updateCartDisplay(); // Обновляем корзину на странице
        cartTotal.textContent = 'Итого: 0 ₽';
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
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("accessToken");
    console.log("🔍 Текущий accessToken:", token);  // ✅ Дебаг

    if (!token) {
        console.warn("❌ Нет accessToken, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return null;
    }

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        console.warn("🔄 Токен истёк, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return response;

        return fetch(url, {
            ...options,
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


async function refreshAccessToken() {
    console.log("🔄 Запрос на обновление токена...");

    const isMobile = window.location.href.includes("makadamia.onrender.com");
    const refreshUrl = isMobile 
        ? "https://mobile-site.onrender.com/refresh"  // 📌 Если мобильная версия, отправляем запрос на мобильный сервер
        : "https://makadamia.onrender.com/refresh";   // 📌 Если ПК-версия, отправляем на десктопный сервер

    try {
        const response = await fetch(refreshUrl, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            console.warn(`❌ Ошибка обновления токена (${response.status})`);
            return null;
        }

        const data = await response.json();
        console.log("✅ Новый токен получен:", data.accessToken);

        if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
        }

        return data.accessToken;
    } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        return null;
    }
}


function isTokenExpired(token) {
    if (!token) return true; // Если токена нет, он считается истекшим

    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"); // Исправляем base64
        const payload = JSON.parse(atob(base64)); // Декодируем payload
        return (Date.now() / 1000) >= payload.exp; // Проверяем срок действия
    } catch (e) {
        console.error("❌ Ошибка декодирования токена:", e);
        return true;
    }
}


// Запускаем проверку токена раз в минуту
setInterval(async () => { 
    let token = localStorage.getItem("token"); 
    if (!token) return;

    const exp = getTokenExp(token);
    const now = Math.floor(Date.now() / 1000);

    if (exp && (exp - now) < 300) { 
        console.log("🔄 Токен скоро истечёт, обновляем...");
        token = await refreshAccessToken();

        if (!token) {
            console.warn("❌ Ошибка при обновлении токена. Останавливаем обновления.");
            clearInterval(this);
        }
    }
}, 60000);

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
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("❌ Нет токена, не запрашиваем /account");
        return;
    }

    fetch("https://makadamia.onrender.com/account", {
        method: "GET", // ✅ Добавляем явное указание метода
        headers: { 
            "Authorization": `Bearer ${token}` // ✅ Передаем токен
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Ошибка HTTP: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        const nameInput = document.getElementById("nameInput");
        const cityInput = document.getElementById("cityInput");

        if (nameInput) nameInput.value = data.name || "";
        if (cityInput) cityInput.value = data.city || "";
    })
    .catch(error => console.error("❌ Ошибка загрузки профиля:", error));
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
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");
    const authButton = document.getElementById("authButton");
    const cabinetButton = document.getElementById("cabinetButton");

    if (!authButton || !cabinetButton) {
        console.warn("❌ Не найдены кнопки 'Вход' или 'Личный кабинет'!");
        return;
    }

    if (token && username && !isTokenExpired(token)) { 
    console.log("✅ Пользователь авторизован");
    authButton.style.display = "none";
    cabinetButton.style.display = "inline-block";
} else {
    console.log("⚠️ Пользователь не авторизован");
    authButton.style.display = "inline-block";
    cabinetButton.style.display = "none";
    sessionStorage.removeItem("authChecked"); // Чтобы снова попытаться обновить токен
}
}



// Логика для выхода
async function logout() { 
    try { 
        await fetch("https://makadamia.onrender.com/logout", { 
            method: "POST", 
            credentials: "include" 
        });

        // Удаляем токены
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "refreshTokenDesktop=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "refreshTokenMobile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        
        // Очищаем локальное хранилище
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        localStorage.removeItem("username");

        // Перенаправление на страницу входа
        window.location.href = "/index.html";
    } catch (error) { 
        console.error("Ошибка выхода:", error); 
    }
}
// Переход на страницу личного кабинета
function openCabinet() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

   if (!token && !sessionStorage.getItem("authFailed")) {
    alert("Вы не авторизованы. Перенаправление...");
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

    fetch("https://makadamia.onrender.com/account", {
        method: "GET",
        credentials: "include", // ✅ Добавляем передачу cookies
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Ошибка HTTP: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.username) {
            document.getElementById('usernameDisplay').innerText = data.username;
            document.getElementById('authButton').style.display = 'none'; // Скрываем "Вход"
            document.getElementById('cabinetButton').style.display = 'inline-block'; // Показываем "Личный кабинет"
        } else {
            document.getElementById('usernameDisplay').innerText = "Ошибка загрузки";
        }
    })
    .catch(error => {
        console.error("Ошибка загрузки аккаунта:", error);
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

function handleAuthClick() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'account.html'; // Если пользователь авторизован, переходим в личный кабинет
    } else {
        window.location.href = 'login.html'; // Если нет, перенаправляем на страницу входа
    }
}

// Убедитесь, что этот код в `script.js` загружен перед его вызовом в HTML
document.addEventListener("DOMContentLoaded", function () {
    const authButton = document.getElementById("authButton");
    if (authButton) {
        authButton.onclick = handleAuthClick;
    }
});
