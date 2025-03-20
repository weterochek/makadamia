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
function renderCheckoutCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalAmountElement = document.getElementById("totalAmount");
    cartItemsContainer.innerHTML = "";
    let totalAmount = 0;

    // ✅ Безопасно парсим корзину:
    let cart = [];
    const cartRaw = localStorage.getItem('cartItems');
    try {
        if (cartRaw && cartRaw !== 'undefined') {
            cart = JSON.parse(cartRaw);
        }
    } catch (e) {
        console.error("❌ Ошибка парсинга cartItems в renderCheckoutCart:", e);
        cart = [];
    }

    cart.forEach(item => {
        const product = productMap[item.productId];
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>${product.name} - ${item.quantity} шт. - ${itemTotal} ₽</div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    totalAmountElement.textContent = `Итого: ${totalAmount} ₽`;
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
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary) return;
    orderSummary.innerHTML = '';

    let totalAmount = 0;

    // ✅ Безопасно парсим корзину:
    let cart = [];
    const cartRaw = localStorage.getItem('cartItems');
    try {
        if (cartRaw && cartRaw !== 'undefined') {
            cart = JSON.parse(cartRaw);
        }
    } catch (e) {
        console.error("❌ Ошибка парсинга cartItems в loadCartFromLocalStorage:", e);
        cart = [];
    }

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


