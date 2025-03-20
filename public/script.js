let cart = {};
let productMap = {}; // Будет заполнен динамически
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
async function loadProductMap() {
    try {
        const response = await fetch("/api/products");
        const products = await response.json();

        products.forEach(product => {
            productMap[product._id] = { name: product.name, price: product.price };
        });

        console.log("✅ Product Map загружен:", productMap);
    } catch (error) {
        console.error("Ошибка загрузки продуктов:", error);
    }
}


console.log("Отправка запроса на /refresh");
console.log("Токен перед запросом:", localStorage.getItem("accessToken"));



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



function updateAddToCartButton(productId) {
    const addToCartButton = document.querySelector(`.add-to-cart-button[data-id="${productId}"]`);
    if (addToCartButton) {
        addToCartButton.textContent = "В корзине";
        addToCartButton.disabled = true;
    }
}
async function handleCheckoutFormSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    const cart = loadCartFromLocalStorage();
    const items = Object.keys(cart).map(productId => ({
        productId: productId,
        quantity: cart[productId].quantity
    }));

    const nameInput = document.getElementById('customerName');
    const addressInput = document.getElementById('customerAddress');
    const additionalInfoInput = document.getElementById('additionalInfo');
    const userId = localStorage.getItem("userId");

    const orderData = {
        userId: userId,
        name: nameInput.value,
        address: addressInput.value,
        additionalInfo: additionalInfoInput.value,
        items: items
    };

    console.log("📡 Отправка данных заказа:", orderData);

    try {
        const response = await fetch("https://makadamia.onrender.com/api/order", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        console.log("📥 Ответ от сервера:", response);

        if (!response.ok) {
            console.error(`❌ Ошибка ${response.status}:`, response.statusText);
            alert("Ошибка при оформлении заказа.");
            return;
        }

        const responseData = await response.json();
        console.log("✅ Заказ успешно оформлен:", responseData);

        alert("🎉 Заказ успешно оформлен!");
        saveCartToLocalStorage({});
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Ошибка сети или сервера:", error);
        alert("Ошибка при оформлении заказа. Проверьте соединение.");
    }
}

const backToShoppingButton = document.getElementById("backToShopping");
if (backToShoppingButton) {
    backToShoppingButton.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckoutFormSubmit);
}

async function loadUserOrders() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const response = await fetch(`https://makadamia.onrender.com/user-orders/${userId}`);
        const orders = await response.json();

        // Проверка, что orders - это массив
        if (Array.isArray(orders)) {
            orders.forEach(order => {
                // Обработка заказов
            });
        } else {
            console.error("Данные о заказах не в правильном формате");
        }
    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
    }
}

function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-button");  // Находим все кнопки "Добавить в корзину"
    addToCartButtons.forEach(button => {
        const productId = button.getAttribute("data-id");  // Получаем ID товара
        const productName = button.getAttribute("data-name");
        const productPrice = parseFloat(button.getAttribute("data-price"));

        button.addEventListener("click", () => {
            addToCart(productId, productName, productPrice);  // Обрабатываем добавление товара в корзину
        });

        // Проверяем, есть ли товар в корзине, чтобы обновить состояние кнопки
        const cart = loadCartFromLocalStorage();
        if (cart[productId]) {
            updateAddToCartButton(productId);  // Если товар есть в корзине, обновляем кнопку
        }
    });
}
function getCartItems() {
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
}

function updateProductControls(productName, price) {
    document.getElementById(`addButton_${productName}`).style.display = 'none';
    document.getElementById(`removeBtn_${productName}`).style.display = 'inline-block';
    document.getElementById(`quantity_${productName}`).style.display = 'inline-block';
    document.getElementById(`addBtn_${productName}_inc`).style.display = 'inline-block';

    const item = cartItems.find(item => item.productName === productName);
    if (item) {
        document.getElementById(`quantity_${productName}`).innerText = item.quantity;
    }
}

function addToCart(productId, productName, productPrice) {
    let cartItems = loadCartFromLocalStorage();  // Загружаем корзину
    const existingItem = cartItems.find(item => item.productId === productId);  // Ищем товар в корзине

    if (existingItem) {
        existingItem.quantity += 1;  // Если товар уже есть, увеличиваем его количество
    } else {
        cartItems.push({ productId, quantity: 1 });  // Если товара нет, добавляем его с количеством 1
    }

    saveCartToLocalStorage(cartItems);  // Сохраняем обновленную корзину
    renderCart();  // Перерисовываем корзину
    updateAddToCartButton(productId);  // Обновляем кнопку "Добавить" на "В корзине"
    replaceAddButtonWithControls(productId);  // Обновляем кнопку на элементы управления количеством
}


function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalAmountElement = document.getElementById('totalAmount');

    if (!cartItemsContainer || !totalAmountElement) return;

    cartItemsContainer.innerHTML = "";
    let totalAmount = 0;
    const cartItems = loadCartFromLocalStorage();

    cartItems.forEach(item => {
        const product = productMap[item.productId];
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>${product.name} - ${item.quantity} шт. - ${itemTotal} ₽</div>
            <div>
                <button onclick="decrementItem('${item.productId}')">-</button>
                <span>${item.quantity}</span>
                <button onclick="incrementItem('${item.productId}')">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    totalAmountElement.textContent = `Итого: ${totalAmount} ₽`;
}


function updateQuantityDisplay(productName) {
    const quantityElement = document.getElementById(`quantity_${productName}`);
    if (quantityElement) {
        quantityElement.textContent = cart[productName].quantity;
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
function replaceAddButtonWithControls(productId) {
    const addButton = document.getElementById(`addButton_${productId}`); // Кнопка "Добавить"
    const removeButton = document.getElementById(`removeBtn_${productId}`); // Кнопка "-"
    const addButtonControl = document.getElementById(`addBtn_${productId}`); // Кнопка "+"
    const quantityDisplay = document.getElementById(`quantity_${productId}`); // Отображение количества товара

    let cartItems = loadCartFromLocalStorage();  // Загружаем корзину
    const item = cartItems.find(item => item.productId === productId);  // Ищем товар в корзине

    if (item) {
        addButton.style.display = "none";  // Скрываем кнопку "Добавить"
        removeButton.style.display = "inline-block";  // Показываем кнопку "-"
        addButtonControl.style.display = "inline-block";  // Показываем кнопку "+"
        quantityDisplay.style.display = "inline-block";  // Показываем количество товара
        quantityDisplay.textContent = item.quantity;  // Обновляем количество товара
    } else {
        addButton.style.display = "inline-block";  // Показываем кнопку "Добавить"
        removeButton.style.display = "none";  // Скрываем кнопку "-"
        addButtonControl.style.display = "none";  // Скрываем кнопку "+"
        quantityDisplay.style.display = "none";  // Скрываем количество товара
    }
}


function revertControlsToAddButton(productId) {
    const addButton = document.getElementById(`addButton_${productId}`);
    const removeButton = document.getElementById(`removeBtn_${productId}`);
    const addButtonControl = document.getElementById(`addBtn_${productId}`);
    const quantityDisplay = document.getElementById(`quantity_${productId}`);

    if (!addButton || !removeButton || !addButtonControl || !quantityDisplay) {
        console.warn(`❌ Ошибка: Не найдены элементы для товара ${productId}`);
        return;
    }

    // Если количество товара 0, показываем кнопку "Добавить" и скрываем кнопки управления количеством
    addButton.style.display = "inline-block";  // Показываем кнопку "Добавить"
    removeButton.style.display = "none";  // Скрываем кнопку "-"
    addButtonControl.style.display = "none";  // Скрываем кнопку "+"
    quantityDisplay.style.display = "none";  // Скрываем количество
}


// Функция увеличения количества товара
function incrementItem(productId) {
    let cartItems = loadCartFromLocalStorage();  // Загружаем корзину
    const item = cartItems.find(item => item.productId === productId);  // Ищем товар в корзине

    if (item) {
        item.quantity += 1;  // Увеличиваем количество товара
    } else {
        cartItems.push({ productId, quantity: 1 });  // Если товара нет в корзине, добавляем его с количеством 1
    }

    saveCartToLocalStorage(cartItems);  // Сохраняем обновленную корзину
    renderCart();  // Перерисовываем корзину
    replaceAddButtonWithControls(productId);  // Обновляем кнопку "Добавить" на элементы управления количеством
}

// Функция уменьшения количества товара
function decrementItem(productId) {
    let cartItems = loadCartFromLocalStorage();  // Загружаем корзину
    const itemIndex = cartItems.findIndex(item => item.productId === productId);  // Ищем товар в корзине

    if (itemIndex !== -1) {
        cartItems[itemIndex].quantity -= 1;  // Уменьшаем количество товара
        if (cartItems[itemIndex].quantity === 0) {
            cartItems.splice(itemIndex, 1);  // Если количество товара 0, удаляем его из корзины
            revertControlsToAddButton(productId);  // Возвращаем кнопку "Добавить" (если товар удален)
        }
    }

    saveCartToLocalStorage(cartItems);  // Сохраняем обновленную корзину
    renderCart();  // Перерисовываем корзину
    replaceAddButtonWithControls(productId);  // Обновляем кнопку "Добавить" на элементы управления количеством
}


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
function saveCartToLocalStorage(cartItems) {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}
// Отображение корзины на странице оформления заказа
function renderCheckoutCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalAmountElement = document.getElementById("totalAmount");

    if (!cartItemsContainer || !totalAmountElement) return;

    cartItemsContainer.innerHTML = "";  // Очищаем контейнер корзины
    let totalAmount = 0;

    // Пробегаем по всем товарам в корзине
    for (const item in cart) {
        const itemTotal = cart[item].price * cart[item].quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="item-info">${item} - ${cart[item].quantity} шт. - ${itemTotal} ₽</div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${item}')">-</button>
                <span class="quantity">${cart[item].quantity}</span>
                <button onclick="incrementItem('${item}', ${cart[item].price})">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    }

    totalAmountElement.textContent = `Итого: ${totalAmount} ₽`;  // Обновляем сумму
}

function updateTotal() {
    const cartItems = getCartItems();
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = document.getElementById('totalAmount');
    if (totalAmount) {
        totalAmount.textContent = `Итого: ${total} ₽`;
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
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
}
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

    const token = localStorage.getItem("accessToken"); // Проверка наличия токена
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
        localStorage.setItem("accessToken", data.accessToken);  // Сохраняем новый токен
        return data.accessToken;
    } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        return null;
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
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
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


// Проверка состояния авторизации
function checkAuthStatus() {
    const token = localStorage.getItem("accessToken"); // Должно быть accessToken
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
        sessionStorage.removeItem("authChecked");
    }
}

async function logout() {
    const token = localStorage.getItem("accessToken"); // Получаем токен

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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
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


function handleAuthClick() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        window.location.href = 'account.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Переход на страницу личного кабинета
function openCabinet() {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');

   if (!token && !sessionStorage.getItem("authFailed")) {
    alert("Вы не авторизованы. Перенаправление...");
    window.location.href = "/login.html";
    } else {
        // Переход на страницу личного кабинета
        window.location.href = "/account.html";
    }
}



    // Убеждаемся, что кнопка "Выход" отображается только в личном кабинете
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton && window.location.pathname !== '/account.html') {
        logoutButton.style.display = 'none';
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

async function loadUserData() {
    const userId = localStorage.getItem("userId");  // Получаем userId из localStorage
    if (!userId) {
        alert("Вы не авторизованы! Пожалуйста, войдите в аккаунт.");
        window.location.href = "login.html";  // Перенаправление на страницу входа, если userId не найден
        return;
    }

    try {
        const response = await fetch(`https://makadamia.onrender.com/account`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById("customerName").value = data.name || "";
        document.getElementById("customerAddress").value = data.city || "";
    } catch (error) {
        console.error("Ошибка загрузки данных профиля:", error);
        alert("Не удалось загрузить данные профиля.");
    }
}
function setupAuthButtons() {
    const authButton = document.getElementById("authButton");
    const cabinetButton = document.getElementById("cabinetButton");

    // Логика для отображения кнопок входа и кабинета
    if (localStorage.getItem("accessToken")) {
        authButton.style.display = "none";
        cabinetButton.style.display = "inline-block";
    } else {
        authButton.style.display = "inline-block";
        cabinetButton.style.display = "none";
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    await loadProductMap(); 
    loadUserData();
    loadCartFromLocalStorage();  // Загружаем корзину из localStorage
    renderCart();  // Отображаем корзину
    checkAuthStatus(); // Проверяем авторизацию
     // Загружаем данные пользователя, если есть
    initializeAddToCartButtons(); // Настраиваем кнопки "Добавить в корзину"
    setupAuthButtons(); // Настраиваем кнопки авторизации (если есть)
    loadOrders(); // Загружаем заказы для личного кабинета (если есть)
    loadUserOrders();
});



async function loadOrders() {
    const token = localStorage.getItem("accessToken");
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
