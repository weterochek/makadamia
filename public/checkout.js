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
        console.log("✅ Продукты загружены");
    } catch (error) {
        console.error("Ошибка загрузки списка продуктов:", error);
    }
}


// Загрузка корзины из localStorage

// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    localStorage.setItem('cartItems', JSON.stringify(cart));
}


// Отображение корзины
async function renderCheckoutCart() {
    const cartRaw = localStorage.getItem('cartItems');
    const cart = cartRaw ? JSON.parse(cartRaw) : [];
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

        // ✅ Сохраняем данные локально
        localStorage.setItem("userData", JSON.stringify({ name: userData.name, address: userData.city }));

        // ✅ Подставляем в поля checkout
        document.getElementById("customerName").value = userData.name || "";
        document.getElementById("customerAddress").value = userData.city || "";
    } catch (error) {
        console.error("Ошибка загрузки данных профиля:", error);
        alert("Не удалось загрузить данные профиля.");
    }
}

// Обработчик кнопки оформления заказа
document.addEventListener("DOMContentLoaded", async () => {
    await loadProductMap(); // Загружаем продукты
    renderCheckoutCart();   // Рендерим корзину
    loadCartFromLocalStorage(); // Заполняем orderSummary
    loadUserData(); // Загружаем данные пользователя

    const backToShoppingButton = document.getElementById("backToShopping");
    if (backToShoppingButton) {
        backToShoppingButton.addEventListener("click", () => {
            saveCartToLocalStorage();
            window.location.href = "index.html";
        });
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
                localStorage.removeItem('cartItems');
                window.location.href = "index.html";
            } catch (error) {
                console.error("❌ Ошибка сети или сервера:", error);
                alert("Ошибка при оформлении заказа. Проверьте соединение.");
            }
        });
    }
}); //
function loadCartFromLocalStorage() {
    const cartRaw = localStorage.getItem('cartItems');
    const cart = cartRaw ? JSON.parse(cartRaw) : [];
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
            // Загружаем корзину


