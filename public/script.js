let cart = {};
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
        if (cart[itemName].quantity === 0) {
            delete cart[itemName];
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
function handleAuthClick() {
    window.location.href = '/login';  // Переход на страницу логина (если у вас такая страница есть)
}

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
document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus();
});
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

// Дополнительные функции, такие как авторизация, остаются без изменений


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

    loadCartFromLocalStorage(); // Загрузка корзины при загрузке страницы
});

// Открытие личного кабинета
let cabinetIsOpen = false; // Флаг, указывающий, открыт ли кабинет

function openCabinet(username) {
    if (cabinetIsOpen) {
        closeCabinet(); // Закрыть, если уже открыто
        return;
    }

    const authButton = document.getElementById("authButton");
    const rect = authButton.getBoundingClientRect();

    const cabinetContent = `
        <div class="cabinet-dropdown" id="cabinetDropdown" style="top: ${rect.bottom}px; left: ${rect.left}px;">
            <h2 style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2em;">
                Личный кабинет 
                <span onclick="closeCabinet()" style="cursor: pointer; font-size: 0.75em; color: black; padding: 0 5px;">✖</span>
            </h2>
            <button onclick="logout()">Выйти</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML("beforeend", cabinetContent);
    cabinetIsOpen = true; // Устанавливаем флаг, что кабинет открыт

    // Проверка на выход за границы окна
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    const cabinetRect = cabinetDropdown.getBoundingClientRect();

    if (cabinetRect.right > window.innerWidth) {
        cabinetDropdown.style.left = `${window.innerWidth - cabinetRect.width}px`;
    }

    // Закрытие окна при клике вне его
    document.addEventListener("click", closeCabinetOnOutsideClick);
}

function closeCabinet() {
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    if (cabinetDropdown) {
        cabinetDropdown.remove();
        cabinetIsOpen = false; // Устанавливаем флаг, что кабинет закрыт
        document.removeEventListener("click", closeCabinetOnOutsideClick);
    }
}

function closeCabinetOnOutsideClick(event) {
    const cabinetDropdown = document.getElementById("cabinetDropdown");
    if (cabinetDropdown && !cabinetDropdown.contains(event.target)) {
        closeCabinet();
    }
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
// Переход на страницу оформления заказа
function goToCheckoutPage() {
    saveCartToLocalStorage();
    window.location.href = "checkout.html";
}
