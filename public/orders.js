// orders.js

// Загрузка заказов пользователя
async function loadOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch("https://makadamia.onrender.com/orders", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Ошибка при загрузке заказов");
        }

        const orders = await response.json();
        displayOrders(orders); // Вызываем функцию для отображения заказов

    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        alert("Ошибка при загрузке заказов");
    }
}
// Получаем токен из localStorage
const token = localStorage.getItem("token");

if (!token) {
    console.error("Ошибка: Токен не найден!");
    return; // Если токен не найден, выходим из функции
}

fetch('/orders', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`  // Отправляем токен в заголовках запроса
    }
})
.then(response => response.json())
.then(orders => {
    displayOrders(orders);  // Отображаем заказы
})
.catch(error => console.error("Ошибка при загрузке заказов:", error));

function displayOrders(orders) {
    const ordersContainer = document.getElementById("ordersContainer");
    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>У вас нет заказов.</p>";
    } else {
        orders.forEach(order => {
            const orderElement = document.createElement("div");
            orderElement.innerHTML = `
                <h3>Заказ №${order._id}</h3>
                <p>Адрес: ${order.address}</p>
                <p>Статус: ${order.status}</p>
                <ul>
                    ${order.items.map(item => `<li>${item.name} - ${item.quantity} шт. по ${item.price} ₽</li>`).join('')}
                </ul>
            `;
            ordersContainer.appendChild(orderElement);
        });
    }
}

// Отображение заказов на странице
function displayOrders(orders) {
    const ordersContainer = document.getElementById("ordersContainer");
    if (!ordersContainer) {
        console.error("❌ Контейнер для заказов не найден");
        return;
    }

    ordersContainer.innerHTML = ""; // Очищаем контейнер

    orders.forEach(order => {
        const orderElement = document.createElement("div");
        orderElement.classList.add("order");
        orderElement.innerHTML = `
            <h3>Заказ №${order._id}</h3>
            <p>Адрес: ${order.address}</p>
            <p>Доп. информация: ${order.additionalInfo || "Нет"}</p>
            <p>Статус: ${order.status}</p>
            <p>Дата: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <ul>
                ${order.items.map(item => `<li>${item.productId} - ${item.quantity} шт.</li>`).join("")}
            </ul>
        `;
        ordersContainer.appendChild(orderElement);
    });
}

// Загрузка заказов при загрузке страницы
document.addEventListener("DOMContentLoaded", loadOrders);
