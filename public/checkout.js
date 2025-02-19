let cart = {};

// Загрузка корзины из localStorage
function loadCartFromLocalStorage() {
    const username = localStorage.getItem("username") || "guest"; // Используем имя пользователя или guest
    const storedCart = localStorage.getItem(`cart_${username}`);
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Отображение корзины
function renderCheckoutCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalAmountElement = document.getElementById("totalAmount");

    if (!cartItemsContainer || !totalAmountElement) return;

    cartItemsContainer.innerHTML = ""; // Очищаем список
    let totalAmount = 0;

    for (const item in cart) {
        const itemTotal = cart[item].price * cart[item].quantity;
        totalAmount += itemTotal;

        // Генерация HTML для каждого товара
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="item-info">
                ${item} - ${cart[item].quantity} шт. - ${itemTotal} ₽
            </div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${item}')">-</button>
                <span class="quantity">${cart[item].quantity}</span>
                <button onclick="incrementItem('${item}', ${cart[item].price})">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    }

    // Итоговая сумма
    totalAmountElement.textContent = `Итого: ${totalAmount} ₽`;
}

// Уменьшение количества товара
function decrementItem(itemName) {
    if (cart[itemName]) {
        cart[itemName].quantity -= 1;
        if (cart[itemName].quantity === 0) {
            delete cart[itemName];
        }
        saveCartToLocalStorage();
        renderCheckoutCart();
    }
}

// Увеличение количества товара
function incrementItem(itemName, price) {
    if (!cart[itemName]) {
        cart[itemName] = { price, quantity: 0 };
    }
    cart[itemName].quantity += 1;
    saveCartToLocalStorage();
    renderCheckoutCart();
}

// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    const username = localStorage.getItem("username") || "guest"; // Используем имя пользователя или guest
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
}

// Функция для оформления заказа
async function checkoutOrder() {
    const username = localStorage.getItem('username');
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const additionalInfo = document.getElementById('additionalInfo').value;

    // Получаем токен из localStorage
    const token = localStorage.getItem("token");

    const orderData = {
        username,
        customerName,
        customerAddress,
        additionalInfo,
        cart
    };

    try {
        const response = await fetch("/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        if (data.success) {
            alert("Заказ оформлен успешно!");
        } else {
            alert(`Ошибка при оформлении заказа: ${data.message}`);
        }
    } catch (error) {
        alert("Произошла ошибка при оформлении заказа.");
    }
}
