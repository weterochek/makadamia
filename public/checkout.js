let cart = {};
let productMap = {};

async function loadProductMap() {
    try {
        const response = await fetch('https://makadamia.onrender.com/api/products');
        const products = await response.json();
        productMap = products.reduce((map, product) => {
            map[product._id] = { name: product.name, price: product.price };
            return map;
        }, {});
        renderCheckoutCart();
    } catch (error) {
        console.error("Ошибка загрузки списка продуктов:", error);
    }
}

// Загрузка корзины из localStorage
document.addEventListener('DOMContentLoaded', function() {
    const productListContainer = document.querySelector('.checkout__list');
    const checkoutTotal = document.querySelector('.checkout__total-price span');

    let totalPrice = 0;

    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
        try {
            const items = JSON.parse(cartItems);

            if (items.length === 0) {
                productListContainer.innerHTML = '<p>Ваша корзина пуста</p>';
            } else {
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('checkout__item');

                    itemElement.innerHTML = `
                        <div class="checkout__item-info">
                            <p>${item.productName}</p>
                            <p>Количество: ${item.quantity}</p>
                            <p>Цена: ${item.price} ₽</p>
                        </div>
                    `;
                    productListContainer.appendChild(itemElement);

                    totalPrice += item.price * item.quantity;
                });

                checkoutTotal.textContent = totalPrice + ' ₽';
            }
        } catch (e) {
            console.error('Ошибка при разборе данных корзины:', e);
            productListContainer.innerHTML = '<p>Ошибка загрузки корзины</p>';
        }
    } else {
        productListContainer.innerHTML = '<p>Ваша корзина пуста</p>';
    }
});


// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    const username = localStorage.getItem("username") || "guest";
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
}

// Отображение корзины
function renderCheckoutCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalAmountElement = document.getElementById("totalAmount");

    if (!cartItemsContainer || !totalAmountElement) return;

    cartItemsContainer.innerHTML = "";
    let totalAmount = 0;

    const storedCart = JSON.parse(localStorage.getItem(`cart_${localStorage.getItem("username")}`)) || {};

    for (const productId in storedCart) {
        const product = productMap[productId];
        if (!product) continue; // если нет такого продукта в базе, пропускаем

        const itemTotal = product.price * storedCart[productId].quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div class="item-info">
                ${product.name} - ${storedCart[productId].quantity} шт. - ${itemTotal} ₽
            </div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${productId}')">-</button>
                <span class="quantity">${storedCart[productId].quantity}</span>
                <button onclick="incrementItem('${productId}', ${product.price})">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    }

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
function incrementItem(itemName, itemPrice) {
    if (cart[itemName]) {
        cart[itemName].quantity += 1;
    } else {
        cart[itemName] = { price: itemPrice, quantity: 1 };
    }
    saveCartToLocalStorage();
    renderCheckoutCart();
}

// Загрузка данных пользователя
async function loadUserData() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Вы не авторизованы! Пожалуйста, войдите в аккаунт.");
        window.location.href = "login.html";
        return;
    }
    try {
        const response = await fetch("https://makadamia.onrender.com/account", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("Ошибка при загрузке данных профиля");
        }
        const userData = await response.json();
        document.getElementById("customerName").value = userData.name || "";
        document.getElementById("customerAddress").value = userData.city || "";
    } catch (error) {
        console.error("Ошибка загрузки данных профиля:", error);
        alert("Не удалось загрузить данные профиля.");
    }
}

// Обработчик кнопки оформления заказа
document.addEventListener("DOMContentLoaded", () => {
    loadProductMap();
    loadCartFromLocalStorage();
    renderCheckoutCart();
    loadUserData();

    const backToShoppingButton = document.getElementById("backToShopping");
    if (backToShoppingButton) {
        backToShoppingButton.addEventListener("click", function () {
            saveCartToLocalStorage();
            window.location.href = "index.html";
        });
    }
function loadCartFromLocalStorage() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '';

    let totalAmount = 0;

    for (const productId in cart) {
        const item = cart[productId];
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const orderItem = document.createElement('div');
        orderItem.innerHTML = `${item.name} - ${item.quantity} шт. - ${itemTotal} ₽`;
        orderSummary.appendChild(orderItem);
    }

    document.getElementById('totalOrderAmount').textContent = totalAmount + ' ₽';
}

document.addEventListener('DOMContentLoaded', loadCartFromLocalStorage);

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const token = localStorage.getItem("accessToken");

            if (!token) {
                alert("Вы не авторизованы!");
                return;
            }

            // Загружаем корзину
            const storedCart = JSON.parse(localStorage.getItem(`cart_${localStorage.getItem("username")}`)) || {};
            const items = Object.keys(storedCart).map(productId => ({
                productId: productId,
                quantity: storedCart[productId].quantity
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

            console.log("\ud83d\udce1 Отправка данных заказа:", orderData);

            try {
                const response = await fetch("https://makadamia.onrender.com/api/order", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderData)
                });

                console.log("\ud83d\udce5 Ответ от сервера:", response);

                if (!response.ok) {
                    console.error(`\u274c Ошибка ${response.status}:`, response.statusText);
                    alert("Ошибка при оформлении заказа.");
                    return;
                }

                const responseData = await response.json();
                console.log("\u2705 Заказ успешно оформлен:", responseData);

                alert("\ud83c\udf89 Заказ успешно оформлен!");
                cart = {}; // Очищаем корзину
                saveCartToLocalStorage();
                window.location.href = "index.html";
            } catch (error) {
                console.error("\u274c Ошибка сети или сервера:", error);
                alert("Ошибка при оформлении заказа. Проверьте соединение.");
            }
        });
    }
});
