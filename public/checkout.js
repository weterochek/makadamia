let cart = {};

// Загрузка корзины из localStorage
function loadCartFromLocalStorage() {
    const username = localStorage.getItem("username") || "guest";
    const storedCart = localStorage.getItem(`cart_${username}`);
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

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

    for (const item in cart) {
        const itemTotal = cart[item].price * cart[item].quantity;
        totalAmount += itemTotal;

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

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const token = localStorage.getItem("accessToken");

            if (!token) {
                alert("Вы не авторизованы!");
                return;
            }

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
                cart = {};
                saveCartToLocalStorage();
                localStorage.removeItem(`cart_${localStorage.getItem("username")}`);
                window.location.href = "index.html";
            } catch (error) {
                console.error("❌ Ошибка сети или сервера:", error);
                alert("Ошибка при оформлении заказа. Проверьте соединение.");
            }
        });
    }
});
