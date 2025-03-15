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

        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        } else {
            console.error("Ошибка при загрузке заказов:", response.statusText);
        }
    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
    }
}

// Отображение заказов
function displayOrders(orders) {
    const ordersContainer = document.getElementById("ordersContainer");
    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>У вас нет заказов.</p>";
    } else {
        orders.forEach(order => {
            const orderElement = document.createElement("div");

            // Форматируем дату заказа
            const orderDate = new Date(order.createdAt).toLocaleString();

            orderElement.innerHTML = `
                <h3>Заказ №${order._id}</h3>
                <p>Адрес: ${order.address}</p>
                <p>Статус: ${order.status}</p>
                <p>Время заказа: ${orderDate}</p>
                <ul>
                    ${order.items.map(item => 
                        `<li>${item.productId.name} - ${item.quantity} шт. по ${item.productId.price} ₽</li>`
                    ).join('')}
                </ul>
            `;
            ordersContainer.appendChild(orderElement);
        });
    }
}



// Загрузка заказов при загрузке страницы
document.addEventListener("DOMContentLoaded", loadUserOrders);
