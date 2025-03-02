async function loadOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы! Пожалуйста, войдите в аккаунт.");
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
        displayOrders(orders);
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
        alert("Не удалось загрузить заказы.");
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById("ordersContainer");
    ordersContainer.innerHTML = ""; // Очищаем контейнер

    orders.forEach(order => {
        const orderElement = document.createElement("div");
        orderElement.className = "order";
        const orderTime = new Date(order.timestamp).toLocaleString();  // Форматируем время

        orderElement.innerHTML = `
            <p>Заказ №${order.id}</p>
            <p>Время: ${orderTime}</p>
            <p>Сумма: ${order.totalAmount} ₽</p>
            <p>Адрес доставки: ${order.address}</p>
            <p>Дополнительная информация: ${order.additionalInfo}</p>
        `;
        ordersContainer.appendChild(orderElement);
    });
}

document.addEventListener("DOMContentLoaded", loadOrders);
