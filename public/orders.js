// orders.js


// Получаем токен из localStorage
async function loadUserOrders() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Ошибка: Токен не найден!");
        return; // Если токен не найден, выходим из функции
    }

    try {
        const response = await fetch("/orders", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // Отправляем токен в заголовках запроса
            }
        });

        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadUserOrders); // Загружаем заказы при загрузке страницы

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
            
            // Format the createdAt date to a readable format
            const orderDate = new Date(order.createdAt).toLocaleString(); // You can customize this format based on your needs
            
            orderElement.innerHTML = `
                <h3>Заказ №${order._id}</h3>
                <p>Адрес: ${order.address}</p>
                <p>Статус: ${order.status}</p>
                <p>Время заказа: ${orderDate}</p>  <!-- Added the order time -->
                <ul>
                    ${order.items.map(item => `<li>${item.name} - ${item.quantity} шт. по ${item.price} ₽</li>`).join('')}
                </ul>
            `;
            ordersContainer.appendChild(orderElement);
        });
    }
}

// Загрузка заказов при загрузке страницы
document.addEventListener("DOMContentLoaded", loadOrders);
