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

async function addToCart(productName, price) {
    const response = await fetch(`/products/${encodeURIComponent(productName)}`);  // Запрос на сервер для получения товара по его названию

    if (!response.ok) {
        console.error('Ошибка при получении товара');
        return;
    }

    const product = await response.json();  // Получаем товар из базы данных

    // Добавляем товар в корзину
    if (cart[product.name]) {
        cart[product.name].quantity += 1;  // Если товар уже есть, увеличиваем количество
    } else {
        cart[product.name] = { 
            name: product.name, 
            price: product.price, 
            quantity: 1 
        };  // Если товара нет, добавляем его
    }

    // Сохраняем корзину в localStorage
    saveCartToLocalStorage();
    updateCartDisplay();
    replaceAddButtonWithControls(product.name);  // Обновляем кнопку на карточке товара
}

function updateQuantityDisplay(productName) {
    const quantityElement = document.getElementById(`quantity_${productName}`);
    if (quantityElement) {
        quantityElement.textContent = cart[productName].quantity; // Обновляем количество
        quantityElement.style.display = "inline-block"; // Показываем количество
    }
}
function checkForEmptyCart(productName) {
    const quantity = cart[productName] ? cart[productName].quantity : 0;
    const addButton = document.getElementById(`addButton_${productName}`);
    const controls = document.getElementById(`controls_${productName}`);

    // Если количество товара равно нулю, показываем кнопку "Добавить"
    if (quantity === 0) {
        if (addButton) addButton.style.display = 'inline-block';  // Показываем кнопку "Добавить"
        if (controls) controls.style.display = 'none';  // Скрываем кнопки "+" и "-"
    }
}

// Уменьшение количества товара
function decrementItem(productName) {
    if (cart[productName]) {
        cart[productName].quantity -= 1;

        const quantityDisplay = document.getElementById(`quantity_${productName}`);
        const addButton = document.getElementById(`addButton_${productName}`);
        const removeButton = document.getElementById(`removeBtn_${productName}`);
        const addButtonControl = document.getElementById(`addBtn_${productName}`);

        if (cart[productName].quantity === 0) {
            // Удаляем товар из корзины
            delete cart[productName];

            // Показываем кнопку "Добавить", скрываем контролы и количество
            addButton.style.display = "inline-block";
            removeButton.style.display = "none";
            addButtonControl.style.display = "none";
            quantityDisplay.style.display = "none";
        } else {
            // Обновляем количество товара на карточке
            if (quantityDisplay) {
                quantityDisplay.textContent = cart[productName].quantity;
                quantityDisplay.style.display = "inline-block";
            }
        }

        saveCartToLocalStorage();
        updateCartDisplay();
        replaceAddButtonWithControls(productName);  // исправлено
    }
}
// Увеличение количества товара
function incrementItem(productName, price) {
    if (cart[productName]) {
        cart[productName].quantity += 1;
    } else {
        cart[productName] = { name: productName, price: price, quantity: 1 };
    }

    saveCartToLocalStorage();
    updateCartDisplay();
    updateQuantityDisplay(productName);
    checkForEmptyCart(productName);  // Проверка, если товар в корзине не равен 0
}
function updateQuantityDisplay(productName) {
    const quantityElement = document.getElementById(`quantity_${productName}`);
    if (quantityElement) {
        quantityElement.textContent = cart[productName].quantity;
    }
}
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}
// Преобразование кнопки "Добавить" в контролы "+", "-", и количество
function replaceAddButtonWithControls(productName) {
    const addButton = document.getElementById(`addButton_${productName}`);
    const removeButton = document.getElementById(`removeBtn_${productName}`);
    const addButtonControl = document.getElementById(`addBtn_${productName}`);
    const quantityDisplay = document.getElementById(`quantity_${productName}`);

    if (!addButton || !removeButton || !addButtonControl || !quantityDisplay) {
        console.warn(`❌ Ошибка: Не найдены элементы для ${productName}`);
        return;
    }

    if (cart[productName] && cart[productName].quantity > 0) {
        addButton.style.display = "none"; // Скрываем кнопку "Добавить"
        removeButton.style.display = "inline-block"; // Показываем кнопку "-"
        addButtonControl.style.display = "inline-block"; // Показываем кнопку "+"
        quantityDisplay.style.display = "inline-block"; // Показываем количество
        quantityDisplay.textContent = cart[productName].quantity; // Отображаем количество товара
    } else {
        addButton.style.display = "inline-block"; // Показываем кнопку "Добавить"
        removeButton.style.display = "none"; // Скрываем кнопку "-"
        addButtonControl.style.display = "none"; // Скрываем кнопку "+"
        quantityDisplay.style.display = "none"; // Скрываем количество
    }
}
function revertControlsToAddButton(productName) {
    const addButton = document.getElementById(`addButton_${productName}`);
    const removeButton = document.getElementById(`removeBtn_${productName}`);
    const addButtonControl = document.getElementById(`addBtn_${productName}`);
    const quantityDisplay = document.getElementById(`quantity_${productName}`);

    if (!addButton || !removeButton || !addButtonControl || !quantityDisplay) {
        console.warn(`❌ Ошибка: Не найдены элементы для товара ${productName}`);
        return;
    }

    // Если количество товара 0, показываем кнопку "Добавить" и скрываем кнопки управления количеством
    addButton.style.display = "inline-block";  // Показываем кнопку "Добавить"
    removeButton.style.display = "none";  // Скрываем кнопку "-"
    addButtonControl.style.display = "none";  // Скрываем кнопку "+"
    quantityDisplay.style.display = "none";  // Скрываем количество
}
//ощичение корзины
document.addEventListener('DOMContentLoaded', () => {
    const clearCartButton = document.getElementById('clear-cart');
    const cartTotal = document.getElementById('totalAmount'); // Элемент с итоговой суммой
    const cartItemsContainer = document.getElementById('cartItems'); // Контейнер товаров в корзине

    if (clearCartButton) {  // Проверка, что кнопка очистки корзины существует
        clearCartButton.addEventListener('click', () => {
            cart = {};  // Очистка корзины
            localStorage.removeItem('cart');  // Удаляем корзину из localStorage
            updateCartDisplay();  // Обновляем отображение корзины
            cartTotal.textContent = 'Итого: 0 ₽'; // Обновляем сумму

            // Скрываем кнопки на карточках товаров
            const productCards = document.querySelectorAll(".card-dish");  // Получаем все карточки товаров
            productCards.forEach(card => {
                const addButton = card.querySelector(".add-button-size");
                const removeButton = card.querySelector(".quantity-control");
                const addButtonControl = card.querySelector(".quantity-size-button");
                const quantityDisplay = card.querySelector(".quantity");

                if (addButton) {
                    addButton.style.display = "inline-block";  // Показываем кнопку "Добавить"
                }
                if (removeButton) {
                    removeButton.style.display = "none";  // Скрываем кнопку "-"
                }
                if (addButtonControl) {
                    addButtonControl.style.display = "none";  // Скрываем кнопку "+"
                }
                if (quantityDisplay) {
                    quantityDisplay.style.display = "none";  // Скрываем количество
                }
            });
        });
    }
});


// Обновление отображения корзины
function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = ""; // Очищаем список товаров
    let totalAmount = 0;

    for (const productName in cart) {
        const item = cart[productName];
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="item-info">${productName} - ${itemTotal} ₽</div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${productName}')">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="incrementItem('${productName}', ${item.price})">+</button>
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

    // Очищение корзины
   document.addEventListener('DOMContentLoaded', () => {
    const clearCartButton = document.getElementById('clear-cart');
    const cartTotal = document.getElementById('totalAmount'); // Элемент с итоговой суммой
    const cartItemsContainer = document.getElementById('cartItems'); // Контейнер товаров в корзине

    if (clearCartButton) {  // Проверка, что кнопка очистки корзины существует
        clearCartButton.addEventListener('click', () => {
            cart = {};  // Очистка корзины
            localStorage.removeItem('cart');  // Удаляем корзину из localStorage
            updateCartDisplay();  // Обновляем отображение корзины
            cartTotal.textContent = 'Итого: 0 ₽'; // Обновляем сумму

            // Скрываем кнопки на карточках товаров
            const productCards = document.querySelectorAll(".card-dish");  // Получаем все карточки товаров
            productCards.forEach(card => {
                const addButton = card.querySelector(".add-button-size");
                const removeButton = card.querySelector(".quantity-control");
                const addButtonControl = card.querySelector(".quantity-size-button");
                const quantityDisplay = card.querySelector(".quantity");

                if (addButton) {
                    addButton.style.display = "inline-block";  // Показываем кнопку "Добавить"
                }
                if (removeButton) {
                    removeButton.style.display = "none";  // Скрываем кнопку "-"
                }
                if (addButtonControl) {
                    addButtonControl.style.display = "none";  // Скрываем кнопку "+"
                }
                if (quantityDisplay) {
                    quantityDisplay.style.display = "none";  // Скрываем количество
                }
            });
        });
    } // Закрытие if для clearCartButton
}); // Закрытие document.addEventListener


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
        localStorage.setItem(`cart_${username}`, JSON.stringify(cart)); // Сохраняем с уникальным ключом
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
        const storedCart = JSON.parse(localStorage.getItem(`cart_${username}`)); // Загружаем корзину с уникальным ключом
        if (storedCart) {
            cart = storedCart;
        }
        updateCartDisplay(); // Обновляем отображение корзины
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

    if (!token) {
        console.warn("❌ Нет accessToken, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return null;
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`  // Добавляем токен в заголовки
        }
    });

    if (res.status === 401) {
        console.warn("🔄 Токен истёк, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return res;

        return fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
    }

    return res;
}
document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');  // Получаем токен из localStorage

    if (accessToken) {
        document.getElementById('authButton').textContent = 'Личный кабинет';  // Изменяем кнопку
        await loadUserData(accessToken);  // Загружаем данные пользователя
    } else {
        document.getElementById('authButton').textContent = 'Вход';  // Если токен отсутствует, отображаем "Вход"
    }
});


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

    const token = localStorage.getItem("token"); // Проверка наличия токена
    if (!token) {
        console.warn("❌ Нет токена, пропускаем обновление");
        return null; // Если токена нет, не отправляем запрос на обновление
    }

    try {
        const response = await fetch("https://makadamia.onrender.com/refresh", {
            method: "POST",
            credentials: 'include'
        });

        if (!response.ok) {
            console.warn(`❌ Ошибка обновления токена (${response.status})`);
            return null;
        }

        const data = await response.json();
        console.log("✅ Новый токен получен:", data.accessToken);
        localStorage.setItem("token", data.accessToken);  // Сохраняем новый токен
        return data.accessToken;
    } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        return null;
    }
}


async function loadUserData(token) {
    const response = await fetch("/account", {
        headers: {
            "Authorization": `Bearer ${token}`  // Передаем токен в заголовке
        }
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById("username").textContent = data.username;  // Отображаем данные пользователя
    } else {
        localStorage.removeItem('accessToken');  // Если токен недействителен, удаляем его
    }
}



function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }  // ⏳ Access-токен на 30 минут
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site, iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }  // 🔄 Refresh-токен на 7 дней
    );

    return { accessToken, refreshToken };
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
    const token = localStorage.getItem("token");
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
        sessionStorage.removeItem("authChecked"); // Убедитесь, что снова проверите авторизацию
    }
}


async function logout() {
    const token = localStorage.getItem("token"); // Получаем токен

    try {
        const response = await fetch("https://makadamia.onrender.com/logout", {
            method: "POST",
            credentials: 'include', // Обязательно передаем cookies
            headers: {
                "Authorization": `Bearer ${token}`  // Отправка токена для выхода
            }
        });

        if (response.ok) {
            // Очистка токенов и cookies
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            
            window.location.href = "/index.html"; // Перенаправление на страницу входа
        } else {
            console.error("❌ Ошибка при выходе:", response.status);
        }
    } catch (error) {
        console.error("❌ Ошибка при выходе:", error);
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
document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');
    const authButton = document.getElementById('authButton');  // Кнопка Вход/Личный кабинет

    if (accessToken) {
        authButton.textContent = 'Личный кабинет';
        await loadUserData(accessToken);  // Загрузить данные аккаунта
    } else {
        authButton.textContent = 'Вход';
    }
});

async function loadUserData(token) {
    const response = await fetch('/account', {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) {
        const userData = await response.json();
        document.getElementById('username').textContent = userData.username;
    } else {
        localStorage.removeItem('accessToken');
    }
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
async function loadOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch("https://makadamia.onrender.com/orders", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Ошибка при загрузке заказов");
        }

        const orders = await response.json();
        displayOrders(orders); // Вызываем функцию для отображения заказов

    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        alert("Ошибка при загрузке заказов");
    }
}

// Отображение заказов на странице
function displayOrders(orders) {
    const ordersContainer = document.getElementById("ordersContainer");
    const noOrdersMessage = document.getElementById("noOrdersMessage");

    // Если заказов нет, показываем сообщение
    if (orders.length === 0) {
        noOrdersMessage.style.display = 'block';
        return;
    } else {
        noOrdersMessage.style.display = 'none';
    }

    ordersContainer.innerHTML = ""; // Очищаем контейнер

    orders.forEach(order => {
        const orderElement = document.createElement("div");
        orderElement.classList.add("order");

        orderElement.innerHTML = `
            <h3>Заказ №${order._id}</h3>
            <p>Адрес: ${order.address}</p>
            <p>Доп. информация: ${order.additionalInfo || "Нет"}</p>
            <p>Статус: <strong>${order.status}</strong></p>
            <p>Дата: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <ul>
                ${order.items.map(item => `
                    <li>${item.productId} - ${item.quantity} шт.</li>
                `).join("")}
            </ul>
        `;
        ordersContainer.appendChild(orderElement);
    });
}
