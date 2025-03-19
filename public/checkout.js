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
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    localStorage.setItem('cartItems', JSON.stringify(cart));
}


// Отображение корзины
async function renderCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const productListContainer = document.querySelector('.checkout__list');
    const checkoutTotal = document.querySelector('.checkout__total-price span');

    productListContainer.innerHTML = "";
    let totalPrice = 0;

    for (const item of cart) {
        const product = productMap[item.productId];
        if (!product) continue;

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.classList.add('checkout__item');
        itemElement.innerHTML = `
            <div class="checkout__item-info">
                <p>${product.name}</p>
                <p>Количество: ${item.quantity}</p>
                <p>Цена: ${item.price} ₽</p>
            </div>
        `;
        productListContainer.appendChild(itemElement);
    }

    checkoutTotal.textContent = totalPrice + ' ₽';
}



// Уменьшение количества товара
function incrementItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity += 1;
    }
    localStorage.setItem('cartItems', JSON.stringify(cart));
    renderCart();
}

function decrementItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const index = cart.findIndex(item => item.productId === productId);
    if (index !== -1) {
        cart[index].quantity -= 1;
        if (cart[index].quantity === 0) {
            cart.splice(index, 1);
        }
    }
    localStorage.setItem('cartItems', JSON.stringify(cart));
    renderCart();
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
document.addEventListener("DOMContentLoaded", async () => {
    await loadProductMap();
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
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary) return;
    orderSummary.innerHTML = '';

    let totalAmount = 0;

    cart.forEach(item => {
        const product = productMap[item.productId];
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        const orderItem = document.createElement('div');
        orderItem.innerHTML = `${product.name} - ${item.quantity} шт. - ${itemTotal} ₽`;
        orderSummary.appendChild(orderItem);
    });

    const totalOrderAmount = document.getElementById('totalOrderAmount');
    if (totalOrderAmount) {
        totalOrderAmount.textContent = totalAmount + ' ₽';
    }
}


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
const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
const items = storedCart.map(item => ({
    productId: item.productId,
    quantity: item.quantity
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
const backToShoppingButton = document.getElementById("backToShopping");
if (backToShoppingButton) {
    backToShoppingButton.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}
