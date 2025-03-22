// Получаем токен из localStorage
async function loadUserOrders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Ошибка при загрузке заказов");
        }

        const orders = await response.json();
        displayOrders(orders);  // Передаем заказы в функцию отображения

    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        alert("Не удалось загрузить заказы.");
    }
}

// Отображение заказов
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    if (orders.length === 0) {
        noOrdersMessage.style.display = 'block';  // Показываем сообщение о пустых заказах
    } else {
        noOrdersMessage.style.display = 'none';  // Скрываем сообщение о пустых заказах
    }

    ordersContainer.innerHTML = '';  // Очищаем контейнер

    orders.forEach(order => {
        let orderHTML = `
            <div class="order">
                <h3>Заказ №${order._id.slice(0, 8)}</h3> <!-- Сделаем № заказа короче -->
                <p>Адрес: ${order.address}</p>
                <p>Дата: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p> <!-- Дата и время -->
                <p>Общая сумма: ${order.totalAmount} ₽</p>`;

        if (order.additionalInfo) {
            orderHTML += `<p>Дополнительная информация: ${order.additionalInfo}</p>`;
        }

        // Выводим товары в заказе
        order.items.forEach(item => {
            orderHTML += `
                <p>${item.productId.name} — ${item.quantity} шт. (${item.price} ₽ за шт.)</p>
            `;
        });

        orderHTML += `</div><hr>`;
        ordersContainer.innerHTML += orderHTML;
    });
}

// Загрузка заказов при загрузке страницы
document.addEventListener("DOMContentLoaded", loadUserOrders);
