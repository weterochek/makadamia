let cart = {};

// Загрузка корзины из localStorage
function loadCartFromLocalStorage() {
    const username = localStorage.getItem("username") || "guest"; // Используем имя пользователя или guest
    const storedCart = localStorage.getItem(`cart_${username}`);
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}
async function submitOrder() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    const orderData = {
        name: document.getElementById("customerName").value,
        address: document.getElementById("customerAddress").value,
        additionalInfo: document.getElementById("additionalInfo").value,
        items: Object.values(cart).map(item => ({
    productId: item.productId,
    quantity: item.quantity
}))
    };

    try {
        const response = await fetch("https://makadamia.onrender.com/api/order", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error("Ошибка при оформлении заказа");
        }

        alert("🎉 Заказ успешно оформлен!");
        cart = {}; // Очищаем корзину
        saveCartToLocalStorage();
        window.location.href = "thankyou.html";
    } catch (error) {
        console.error("Ошибка сети или сервера:", error);
        alert("Ошибка при оформлении заказа. Проверьте соединение.");
    }
}

// Обработчик кнопки оформления заказа
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    document.getElementById("checkoutForm").addEventListener("submit", function (e) {
        e.preventDefault();
        submitOrder();
    });
});
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
        renderCart();
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
    renderCart();
}

// Сохранение корзины в localStorage
function saveCartToLocalStorage() {
    const username = localStorage.getItem("username") || "guest";
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
}

// Загрузка данных пользователя
async function loadUserData() {
    const token = localStorage.getItem("token");
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

document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    renderCheckoutCart();
    loadUserData();

    // Кнопка "Вернуться к покупкам"
    const backToShoppingButton = document.getElementById("backToShopping");
    if (backToShoppingButton) {
        backToShoppingButton.addEventListener("click", function () {
            saveCartToLocalStorage();
            window.location.href = "index.html";
        });
    }

    // Кнопка "Оформить заказ"
   document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Вы не авторизованы!");
                return;
            }

            // Формируем данные заказа
            const orderData = {
               ame: document.getElementById("customerName").value,
               address: document.getElementById("customerAddress").value,
               additionalInfo: document.getElementById("additionalInfo").value,
               timestamp: document.getElementById("orderTime").value || new Date().toISOString(), // Если время не выбрано — используем текущее время
               cart: cart // ✅ Добавляем корзину в заказ
            };

            console.log("📡 Отправка данных заказа:", orderData);

            try {
                const response = await fetch("https://makadamia.onrender.com/order", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderData)
                });

                console.log("📥 Ответ от сервера:", response);

                // ✅ Проверяем код ответа
                if (!response.ok) {
                    console.error(`❌ Ошибка ${response.status}:`, response.statusText);
                    if (response.status === 404) {
                        alert("Ошибка 404: Сервер не нашел страницу оформления заказа.");
                    } else {
                        const errorData = await response.json();
                        console.error("❌ Ошибка от сервера:", errorData);
                        alert("Ошибка при оформлении заказа: " + (errorData.message || "Неизвестная ошибка"));
                    }
                    return;
                }

                const responseData = await response.json();
                console.log("✅ Заказ успешно оформлен:", responseData);

                alert("🎉 Заказ успешно оформлен!");
                cart = {}; // Очищаем корзину
                saveCartToLocalStorage();
                window.location.href = "thankyou.html";
            } catch (error) {
                console.error("❌ Ошибка сети или сервера:", error);
                alert("Ошибка при оформлении заказа. Проверьте соединение.");
            }
        });
    }
});

    const additionalInfoField = document.getElementById("additionalInfo");
    additionalInfoField.addEventListener("input", function () {
        if (!this.value.trim()) {
            this.placeholder = "(необязательно)";
        }
    });
    additionalInfoField.addEventListener("focus", function () {
        if (this.placeholder === "(необязательно)") {
            this.placeholder = "";
        }
    });
    additionalInfoField.addEventListener("blur", function () {
        if (!this.value.trim()) {
            this.placeholder = "(необязательно)";
        }
    });
});
