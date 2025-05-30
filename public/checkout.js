let cart = {};
let isSubmitting = false;

function getToken() {
    return localStorage.getItem("accessToken");
}

document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById("cartItems");
    const totalAmountElement = document.getElementById("totalAmount");
    const checkoutForm = document.getElementById("checkoutForm");
    const backToShoppingButton = document.getElementById("backToShopping");

    // Загружаем корзину из localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || {};

    // Отображаем товары в корзине
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let totalAmount = 0;

        for (const productId in cart) {
            const item = cart[productId];
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price} ₽</span>
                </div>
                <div class="quantity-controls">
                    <button class="decrease-quantity" data-id="${productId}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="increase-quantity" data-id="${productId}" ${item.quantity >= 100 ? 'disabled' : ''}>+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            totalAmount += item.price * item.quantity;
        }

        totalAmountElement.textContent = `Итого: ${totalAmount} ₽`;
    }

    // Обработчики для изменения количества товаров
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.getAttribute('data-id');

        if (target.classList.contains('increase-quantity') && !target.disabled) {
            cart[productId].quantity++;
        } else if (target.classList.contains('decrease-quantity')) {
            cart[productId].quantity--;
            if (cart[productId].quantity === 0) {
                delete cart[productId];
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    });

    // Загрузка данных пользователя
    async function loadUserData() {
        const token = getToken();
        if (!token) {
            alert("Вы не авторизованы! Пожалуйста, войдите в аккаунт.");
            window.location.href = "login.html";
            return;
        }
        try {
            const response = await fetch("https://makadamia-e0hb.onrender.com/account", {
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

    // Оформление заказа
    if (checkoutForm) {
        // Обработчик кнопки "Оформить заказ"
        checkoutForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Если форма уже отправляется, игнорируем повторное нажатие
            if (isSubmitting) {
                return;
            }

            try {
                isSubmitting = true;
                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Оформляем заказ...';
                
                const token = getToken();
                if (!token) {
                    alert("Вы не авторизованы!");
                    return;
                }

                // Формируем данные заказа
                const orderData = {
                    address: document.getElementById("customerAddress").value,
                    additionalInfo: document.getElementById("additionalInfo").value,
                    deliveryTime: document.getElementById("deliveryTime").value,
                    items: Object.keys(cart).map(productId => ({
                        productId: productId,
                        quantity: cart[productId].quantity
                    }))
                };

                const response = await fetch("https://makadamia-e0hb.onrender.com/api/order", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderData)
                });

                if (!response.ok) {
                    console.error(`Ошибка ${response.status}:`, response.statusText);
                    alert("Ошибка при оформлении заказа.");
                    return;
                }

                const responseData = await response.json();
                alert("🎉 Заказ успешно оформлен!");

                // Очистка корзины после успешного оформления
                cart = {};  // Очищаем корзину
                localStorage.removeItem('cart');  // Удаляем корзину из localStorage
                renderCartItems();  // Обновляем отображение корзины
                window.location.href = "account.html";  // Перенаправление на страницу спасибо
            } catch (error) {
                console.error("Ошибка при оформлении заказа:", error);
                alert("Ошибка при оформлении заказа.");
            } finally {
                // Возвращаем кнопку в исходное состояние в случае ошибки
                isSubmitting = false;
                const submitButton = e.target.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Кнопка "Вернуться к покупкам"
    if (backToShoppingButton) {
        backToShoppingButton.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    // Инициализация
    renderCartItems();
    loadUserData();
});

// Добавляем стили для отключенной кнопки
const style = document.createElement('style');
style.textContent = `
    button[type="submit"]:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        opacity: 0.7;
    }
`;
document.head.appendChild(style);
