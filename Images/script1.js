let cart = {};

// Функция для добавления товара в корзину
function addToCart(itemName, itemPrice) {
    if (cart[itemName]) {
        cart[itemName].quantity += 1;
    } else {
        cart[itemName] = { price: itemPrice, quantity: 1 };
    }
    updateAddToCartButton(itemName);
    saveCartToLocalStorage();
}

// Функция для удаления товара из корзины
function removeFromCart(itemName) {
    if (cart[itemName]) {
        cart[itemName].quantity -= 1;
        if (cart[itemName].quantity === 0) {
            delete cart[itemName];
        }
        updateAddToCartButton(itemName);
        saveCartToLocalStorage();
    }
}

// Функция для обновления кнопки "В корзину"
function updateAddToCartButton(itemName) {
    const buttonContainer = document.getElementById(`addToCartButton-${itemName}`);
    if (!buttonContainer) return;

    // Проверяем, есть ли товар в корзине и обновляем кнопки
    if (cart[itemName] && cart[itemName].quantity > 0) {
        buttonContainer.innerHTML = `
            <button onclick="removeFromCart('${itemName}')">-</button>
            <span class="quantity">${cart[itemName].quantity}</span>
            <button onclick="addToCart('${itemName}', ${cart[itemName].price})">+</button>
        `;
    } else {
        buttonContainer.innerHTML = `<button onclick="addToCart('${itemName}', ${cart[itemName]?.price})">В корзину</button>`;
    }
}
// Показ/скрытие выпадающего окна корзины под кнопкой корзины
function toggleCart() {
    const cartModal = document.getElementById("cartModal");

    if (cartModal) {
        cartModal.remove(); // Закрыть корзину, если она уже открыта
    } else {
        createCartModal(); // Создать корзину, если она не существует
        updateCartDisplay();
    }
}

// Создание модального окна корзины
function createCartModal() {
    const cartButton = document.getElementById("cartButton");
    const rect = cartButton.getBoundingClientRect();

    const cartModal = document.createElement("div");
    cartModal.id = "cartModal";
    cartModal.className = "cart-dropdown";
    cartModal.style.top = `${rect.bottom}px`;
    cartModal.style.left = `${rect.left}px`;
    cartModal.innerHTML = `
        <h3>Корзина <span onclick="toggleCart()" style="cursor: pointer; float: right;">✖</span></h3>
        <div id="cartItems"></div>
        <p id="totalAmount">Итого: 0 ₽</p>
        <button onclick="checkout()">Оформить заказ</button>
    `;
    document.body.appendChild(cartModal);
}

// Обновление отображения корзины
function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = "";
    let totalAmount = 0;

    for (const item in cart) {
        const itemTotal = cart[item].price * cart[item].quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="item-info">${item} - ${itemTotal} ₽</div>
            <div class="cart-buttons">
                <button onclick="removeFromCart('${item}')">-</button>
                <span class="quantity">${cart[item].quantity}</span>
                <button onclick="addToCart('${item}', ${cart[item].price})">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    }

    document.getElementById("totalAmount").textContent = `Итого: ${totalAmount} ₽`;
}
// Сохранение корзины в localStorage с привязкой к пользователю
function saveCartToLocalStorage() {
    const username = localStorage.getItem("username");
    if (username) {
        localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    }
}

// Загрузка корзины из localStorage для текущего пользователя
function loadCartFromLocalStorage() {
    const username = localStorage.getItem("username");
    if (username) {
        const storedCart = JSON.parse(localStorage.getItem(`cart_${username}`));
        if (storedCart) {
            cart = storedCart;
        } else {
            cart = {};
        }
        updateCartDisplay();
    }
}

// Оформление заказа
function checkout() {
    alert("Ваш заказ оформлен!");
    cart = {};
    updateCartDisplay();
    toggleCart();
    saveCartToLocalStorage();
}

// Обработка кнопки авторизации
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();

    const authButton = document.getElementById("authButton");
    const username = localStorage.getItem("username");

    if (username) {
        authButton.textContent = "Личный кабинет";
        authButton.removeAttribute("onclick");
        authButton.addEventListener("click", () => openCabinet(username));
    } else {
        authButton.textContent = "Вход";
        authButton.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }

    loadCartFromLocalStorage();
});

// Открытие личного кабинета
function openCabinet(username) {
    closeCabinet(); // Закрыть, если уже открыто
    const authButton = document.getElementById("authButton");
    const rect = authButton.getBoundingClientRect();

    const cabinetContent = `
        <div class="cabinet-dropdown" id="cabinetDropdown" style="top: ${rect.bottom}px; left: ${rect.left}px;">
            <h2>Личный кабинет</h2>
            <p>Пользователь: ${username}</p>
            <h3>Баланс:</h3>
            <p id="balanceAmount">${calculateBalance()} ₽</p>
            <button onclick="logout()">Выйти</button>
            <button onclick="closeCabinet()">Закрыть</button>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", cabinetContent);

    // Закрытие окна при клике вне его
    document.addEventListener("click", closeCabinetOnOutsideClick);
}

// Функция выхода из аккаунта
function logout() {
    saveCartToLocalStorage(); // Сохраняем корзину текущего пользователя перед выходом
    localStorage.removeItem("username"); // Удаляем данные пользователя
    alert("Вы вышли из аккаунта.");
    closeCabinet(); // Закрываем личный кабинет
    const authButton = document.getElementById("authButton");
    authButton.textContent = "Вход"; // Меняем текст кнопки на "Вход"
    authButton.onclick = () => { window.location.href = "login.html"; };
}

// Закрытие личного кабинета
function closeCabinet() {
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    if (cabinetDropdown) {
        cabinetDropdown.remove();
    }
    document.removeEventListener("click", closeCabinetOnOutsideClick);
}

// Закрытие при клике вне окна
function closeCabinetOnOutsideClick(event) {
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    if (cabinetDropdown && !cabinetDropdown.contains(event.target) && !event.target.closest("#authButton")) {
        closeCabinet();
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

// Сохранение корзины в localStorage с привязкой к пользователю
function saveCartToLocalStorage() {
    const username = localStorage.getItem("username");
    if (username) {
        localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    }
}

// Загрузка корзины из localStorage для текущего пользователя
function loadCartFromLocalStorage() {
    const username = localStorage.getItem("username");
    if (username) {
        const storedCart = JSON.parse(localStorage.getItem(`cart_${username}`));
        if (storedCart) {
            cart = storedCart;
        } else {
            cart = {};
        }
        updateCartDisplay();
    }
}

// Оформление заказа
function checkout() {
    alert("Ваш заказ оформлен!");
    cart = {};
    updateCartDisplay();
    toggleCart();
    saveCartToLocalStorage();
}

// Обработка кнопки авторизации
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();

    const authButton = document.getElementById("authButton");
    const username = localStorage.getItem("username");

    if (username) {
        authButton.textContent = "Личный кабинет";
        authButton.removeAttribute("onclick");
        authButton.addEventListener("click", () => openCabinet(username));
    } else {
        authButton.textContent = "Вход";
        authButton.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }

    loadCartFromLocalStorage();
});

// Открытие личного кабинета
function openCabinet(username) {
    closeCabinet(); // Закрыть, если уже открыто
    const authButton = document.getElementById("authButton");
    const rect = authButton.getBoundingClientRect();

    const cabinetContent = `
        <div class="cabinet-dropdown" id="cabinetDropdown" style="top: ${rect.bottom}px; left: ${rect.left}px;">
            <h2 style="display: flex; justify-content: space-between; align-items: center;">
                Личный кабинет 
                <span onclick="closeCabinet()" style="cursor: pointer; font-size: 0.85em; color: black; padding: 0 5px;">✖</span>
            </h2>
            <p>Пользователь: ${username}</p>
            <h3>Баланс:</h3>
            <p id="balanceAmount">${calculateBalance()} ₽</p>
            <button onclick="logout()">Выйти</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML("beforeend", cabinetContent);

    // Проверка на выход за границы окна
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    const cabinetRect = cabinetDropdown.getBoundingClientRect();

    if (cabinetRect.right > window.innerWidth) {
        cabinetDropdown.style.left = `${window.innerWidth - cabinetRect.width}px`;
    }

    // Закрытие окна при клике вне его
    document.addEventListener("click", closeCabinetOnOutsideClick);
}
// Функция выхода из аккаунта
function logout() {
    saveCartToLocalStorage(); // Сохраняем корзину текущего пользователя перед выходом
    localStorage.removeItem("username"); // Удаляем данные пользователя
    alert("Вы вышли из аккаунта.");
    closeCabinet(); // Закрываем личный кабинет
    const authButton = document.getElementById("authButton");
    authButton.textContent = "Вход"; // Меняем текст кнопки на "Вход"
    authButton.onclick = () => { window.location.href = "login.html"; };
}

// Закрытие личного кабинета
function closeCabinet() {
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    if (cabinetDropdown) {
        cabinetDropdown.remove();
    }
    document.removeEventListener("click", closeCabinetOnOutsideClick);
}

// Закрытие при клике вне окна
function closeCabinetOnOutsideClick(event) {
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    if (cabinetDropdown && !cabinetDropdown.contains(event.target) && !event.target.closest("#authButton")) {
        closeCabinet();
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
// Добавление в корзину и обновление кнопки
function addToCart(itemName, itemPrice) {
    if (cart[itemName]) {
        cart[itemName].quantity += 1;
    } else {
        cart[itemName] = { price: itemPrice, quantity: 1 };
    }
    saveCartToLocalStorage();
    updateCartDisplay();
    updateAddToCartButton(itemName);
}

// Удаление из корзины и обновление кнопки
function removeFromCart(itemName) {
    if (cart[itemName]) {
        cart[itemName].quantity -= 1;
        if (cart[itemName].quantity === 0) {
            delete cart[itemName];
        }
        saveCartToLocalStorage();
        updateCartDisplay();
        updateAddToCartButton(itemName);
    }
}