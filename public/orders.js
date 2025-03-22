async function loadUserOrders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch('/api/orders', {  // Путь для получения заказов
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,  // Передача токена в заголовке
            }
        });

        if (!response.ok) {
            throw new Error("Ошибка при загрузке заказов");
        }

        const orders = await response.json();
        displayOrders(orders);  // Отображаем заказы на странице

    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        alert("Не удалось загрузить заказы.");
    }
}
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    if (!noOrdersMessage) {
        console.error("Элемент noOrdersMessage не найден!");
        return;  // Прерываем выполнение функции, если элемента нет
    }

    if (orders.length === 0) {
        noOrdersMessage.style.display = 'block';  // Показываем сообщение о пустых заказах
        ordersContainer.style.display = 'none';
    } else {
        noOrdersMessage.style.display = 'none';
        ordersContainer.style.display = 'block';
    }

    ordersContainer.innerHTML = '';  // Очищаем контейнер

    orders.forEach(order => {
        let orderHTML = `
            <div class="order">
                <h3>Заказ №${order._id.slice(0, 8)}</h3>
                <p>Адрес: ${order.address}</p>
                <p>Дата: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
                <p>Общая сумма: ${order.totalAmount} ₽</p>`;

        if (order.additionalInfo) {
            orderHTML += `<p>Дополнительная информация: ${order.additionalInfo}</p>`;
        }

        order.items.forEach(item => {
            orderHTML += `
                <p>${item.productId.name} — ${item.quantity} шт. (${item.price} ₽ за шт.)</p>
            `;
        });

        orderHTML += `</div><hr>`;
        ordersContainer.innerHTML += orderHTML;
    });
}



// Загружаем заказы при загрузке страницы
window.onload = loadUserOrders;

// Загрузка заказов при загрузке страницы
document.addEventListener("DOMContentLoaded", loadUserOrders);
