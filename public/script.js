let productMap = {};// Будет заполнен динамически
let allReviews = [];
let cart = JSON.parse(localStorage.getItem('cart')) || {};
(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const currentURL = window.location.href;

    console.log("User-Agent:", userAgent);
    console.log("Текущий URL:", currentURL);
    console.log("sessionStorage.redirected:", sessionStorage.getItem("redirected"));

    if (sessionStorage.getItem("redirected")) {
        console.log("Редирект уже выполнялся, прерываем.");
        return;
    }

    if (userAgent.includes("mobile") && !currentURL.includes("mobile-site.onrender.com")) {
        console.log("🟢 Должен быть редирект на мобильную версию...");
        sessionStorage.setItem("redirected", "true");
        window.location.href = "https://mobile-site.onrender.com";
    } else if (!userAgent.includes("mobile") && !currentURL.includes("makadamia-e0hb.onrender.com")) {
        console.log("🟢 Должен быть редирект на десктопную версию...");
        sessionStorage.setItem("redirected", "true");
        window.location.href = "https://makadamia-e0hb.onrender.com";
    } else {
        console.log("🔴 Условие редиректа не выполнено.");
    }
})();

(async () => {
    console.log("🔄 Мгновенная проверка и обновление токена...");

    const token = localStorage.getItem("accessToken");

    if (!token) {
        console.log("⏳ Access-токен отсутствует, обновляем немедленно...");
        await refreshAccessToken();
    } else if (isTokenExpired(token)) {
        console.log("⚠️ Access-токен истёк, обновляем...");
        await refreshAccessToken();
    } else {
        console.log("✅ Access-токен активен, обновление не требуется.");
    }
})();

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🔄 Дополнительная проверка токена после загрузки DOM...");

    const token = localStorage.getItem("accessToken");
    if (!token || isTokenExpired(token)) {
        console.log("⏳ Повторная попытка обновления токена...");
        await refreshAccessToken();
    }
});




async function loadProductMap() {
    try {
        const response = await fetch('https://makadamia-e0hb.onrender.com/api/products');
        const products = await response.json();
        products.forEach(product => {
            productMap[product._id] = { name: product.name, price: product.price };
        });
        console.log("✅ Product Map загружен:", productMap);
    } catch (error) {
        console.error("Ошибка загрузки productMap:", error);
    }
}


console.log("Отправка запроса на /refresh");
console.log("Токен перед запросом:", localStorage.getItem("accessToken"));
window.onload = function () {
    // Вызов updateControls для всех товаров в корзине
    for (const productId in cart) {
        updateControls(productId);
    }
    updateCartDisplay();
};
document.addEventListener("DOMContentLoaded", function () {
    const cartItems = document.getElementById("cartItems");
    if (cartItems) {
        cartItems.style.maxHeight = "600px"; // Изменяем высоту для 10 товаров
        cartItems.style.overflowY = "auto"; // Добавляем скролл при необходимости
    }
    
const cartDropdown = document.getElementById("cartDropdown");

if (cartDropdown) {
    cartDropdown.style.display = "none"; // Убираем корзину по умолчанию
    cartDropdown.style.flexDirection = "column";
    cartDropdown.style.maxHeight = "80vh";
}
    
    const cartFooter = document.createElement("div");
    cartFooter.id = "cartFooter";
    cartFooter.style.position = "sticky";
    cartFooter.style.bottom = "0";
    cartFooter.style.background = "white";
    cartFooter.style.padding = "10px";
    cartFooter.style.boxShadow = "0 -2px 5px rgba(0, 0, 0, 0.1)";
    cartFooter.style.display = "flex";
    cartFooter.style.justifyContent = "space-between";
    cartFooter.style.alignItems = "center";
    
    const checkoutButton = document.querySelector("button[onclick='goToCheckoutPage()']");
    const clearCartButton = document.getElementById("clear-cart");
    
    if (checkoutButton && clearCartButton) {
        cartFooter.appendChild(checkoutButton);
        cartFooter.appendChild(clearCartButton);
        cartDropdown.appendChild(cartFooter);
    }
});
document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("accessToken");

    if (!token && !sessionStorage.getItem("authChecked")) {
    sessionStorage.setItem("authChecked", "true");
    await refreshAccessToken();
}

    const cartButton = document.getElementById("cartButton");
    const cartDropdown = document.getElementById("cartDropdown");

    if (cartButton && cartDropdown) {
        cartButton.addEventListener("click", function (event) {
            event.stopPropagation();
            cartDropdown.style.display = cartDropdown.style.display === "block" ? "none" : "block";
        });

        // Закрытие корзины при клике на крестик
        const closeCartButton = document.createElement("span");
        closeCartButton.innerHTML = "✖";
        closeCartButton.style.cursor = "pointer";
        closeCartButton.style.position = "absolute";
        closeCartButton.style.top = "10px";
        closeCartButton.style.right = "10px";
        closeCartButton.style.fontSize = "1.2em";
        closeCartButton.style.color = "black";
        closeCartButton.addEventListener("click", function (event) {
            event.stopPropagation();
            cartDropdown.style.display = "none";
        });

        cartDropdown.prepend(closeCartButton);
    } else {
        console.warn("❌ cartButton или cartDropdown не найдены!");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("cookiesAccepted")) {
        showCookieBanner();
    }
});

function showCookieBanner() {
    const banner = document.createElement("div");
    banner.innerHTML = `
        <div id="cookie-banner" style="position: fixed; bottom: 0; width: 100%; background: black; color: white; padding: 10px; text-align: center; z-index: 1000;">
            <p>Мы используем cookies для улучшения работы сайта. Они позволяют оставаться в аккаунте дольше, так как мы передаём данные с помощью них. 
            <button id="acceptCookies" style="margin-left: 10px;">Принять</button></p>
        </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("acceptCookies").addEventListener("click", function () {
        localStorage.setItem("cookiesAccepted", "true");
        banner.remove();
    });
}
document.addEventListener("DOMContentLoaded", async function () {
    const stars = document.querySelectorAll('#ratingStars i');
    const ratingInput = document.getElementById('starRating');

    stars.forEach((star) => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-value'));
            ratingInput.value = rating;

            stars.forEach((s, i) => {
                s.classList.toggle('selected', i < rating);
            });
        });
    });

    const starsFilter = document.getElementById("filterStars");
    const dateFilter = document.getElementById("filterDate");

    if (starsFilter && dateFilter) {
        starsFilter.addEventListener("change", applyFilters);
        dateFilter.addEventListener("change", applyFilters);
    }

    await loadReviews();
});
try {
    const starsFilter = document.getElementById("filterStars");
    const dateFilter = document.getElementById("filterDate");

    if (starsFilter && dateFilter) {
        starsFilter.addEventListener("change", applyFilters);
        dateFilter.addEventListener("change", applyFilters);
    }
} catch (error) {
    console.error('Ошибка при загрузке отзывов:', error);
    const reviewContainer = document.getElementById('reviewContainer');
    if (reviewContainer) {
        reviewContainer.innerHTML = '<div class="error-message">Произошла ошибка при загрузке отзывов. Пожалуйста, попробуйте позже.</div>';
    }
}
function updateReviewSummary() {
    const total = allReviews.length;
    const avg = total > 0 
        ? (allReviews.reduce((sum, r) => sum + parseInt(r.rating || 0), 0) / total).toFixed(1)
        : 0;

    const avgEl = document.getElementById('averageRating');
    const countEl = document.getElementById('totalReviews');

    if (avgEl) avgEl.textContent = ` ${avg} / 5`;
    if (countEl) countEl.textContent = `Отзывы: ${total}`;
}

function applyFilters() {
    const starValue = document.getElementById("filterStars").value;
    const dateValue = document.getElementById("filterDate").value;

    let filtered = [...allReviews];

    if (starValue !== "all") {
        filtered = filtered.filter(r => Number(r.rating) === Number(starValue));
    }

    filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateValue === "newest" ? dateB - dateA : dateA - dateB;
    });

    const reviewsPerPage = 5;
    const totalPages = Math.ceil(filtered.length / reviewsPerPage);
    const currentPage = 1;

    displayReviewsForPage(currentPage, reviewsPerPage, filtered);
    createPaginationButtons(currentPage, totalPages, reviewsPerPage, filtered);
}

function displayFilteredReviews(reviews) {
    const container = document.getElementById("reviewContainer");
    container.innerHTML = '';

    if (reviews.length === 0) {
        container.innerHTML = "<p class='no-reviews'>Нет отзывов по выбранным фильтрам</p>";
        return;
    }

    reviews.forEach(review => {
        const el = document.createElement('div');
        el.className = 'review';

        const rating = parseInt(review.rating) || 0;
        const stars =  repeat(rating) + repeat(5 - rating);
        const date = new Date(review.date).toLocaleDateString('ru-RU');

        const name = review.displayName || review.username || 'Анонимный пользователь';

        el.innerHTML = `
          <div class="review-header">
            <span class="review-author">${name}</span>
            <span class="review-date">${date}</span>
          </div>
          <div class="review-rating">${stars}</div>
          <div class="review-text">${review.comment}</div>
        `;
        container.appendChild(el);
    });
}

    // Автоматическое увеличение высоты поля комментария
    document.getElementById("comment").addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });



// Функция загрузки отзывов
async function loadReviews() {
    try {
        const response = await fetch('/reviews');
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }

        const reviews = await response.json();

        allReviews = reviews;
        updateReviewSummary();
        applyFilters(); // Фильтрация + пагинация

    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        const reviewContainer = document.getElementById('reviewContainer');
        if (reviewContainer) {
            reviewContainer.innerHTML = '<p class="error">Ошибка при загрузке отзывов. Пожалуйста, попробуйте позже.</p>';
        }
    }
}

function displayReviewsForPage(page, reviewsPerPage, filteredReviews) {
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';
    const startIndex = (page - 1) * reviewsPerPage;
    const endIndex = Math.min(startIndex + reviewsPerPage, filteredReviews.length);

    for (let i = startIndex; i < endIndex; i++) {
        const review = filteredReviews[i];
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';

        const nameDisplay = review.displayName 
            ? `${review.displayName} (${review.username})` 
            : review.username || 'Аноним';

        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        reviewElement.innerHTML = `
            <strong>${nameDisplay}</strong>
            <div class="rating">${stars}</div>
            <p>${review.comment}</p>
            <small>${new Date(review.date).toLocaleString()}</small>
        `;
        reviewContainer.appendChild(reviewElement);
    }
}

function createPaginationButtons(currentPage, totalPages, reviewsPerPage, filteredReviews) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayReviewsForPage(currentPage, reviewsPerPage, filteredReviews);
            createPaginationButtons(currentPage, totalPages, reviewsPerPage, filteredReviews);
        }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayReviewsForPage(currentPage, reviewsPerPage, filteredReviews);
            createPaginationButtons(currentPage, totalPages, reviewsPerPage, filteredReviews);
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayReviewsForPage(currentPage, reviewsPerPage, filteredReviews);
            createPaginationButtons(currentPage, totalPages, reviewsPerPage, filteredReviews);
        }
    });
    paginationContainer.appendChild(nextButton);
}

        

let isSubmittingReview = false;

async function submitReview(event) {
    event.preventDefault();
    
    // Если отзыв уже отправляется, игнорируем повторное нажатие
    if (isSubmittingReview) {
        return;
    }
    
    const submitButton = document.getElementById('submitReview');
    const originalButtonText = submitButton.textContent;
    
    try {
        isSubmittingReview = true;
        submitButton.disabled = true;
        submitButton.textContent = 'Отправляем...';
        
        const rating = document.getElementById('starRating').value;
        const displayName = document.getElementById('displayName').value.trim();
        const comment = document.getElementById('comment').value.trim();
        
        if (!rating) {
            throw new Error('Пожалуйста, выберите оценку');
        }
        
        if (!comment) {
            throw new Error('Пожалуйста, введите текст отзыва');
        }
        
        let username = "Аноним";
        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (userData && userData.username) {
                username = userData.username;
            }
        } catch (e) {
            console.error('Error parsing userData:', e);
        }
        
        const token = localStorage.getItem("accessToken");
        
        const response = await fetch('/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                rating: parseInt(rating),
                comment,
                username,
                displayName: displayName || null
            })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при отправке отзыва');
        }
        
        // Очищаем форму
        document.getElementById('starRating').value = '5';
        document.getElementById('displayName').value = '';
        document.getElementById('comment').value = '';
        
        // Перезагружаем отзывы
        await loadReviews();
        
        alert('Спасибо за ваш отзыв!');
        
    } catch (error) {
        console.error('Ошибка при отправке отзыва:', error);
        alert(error.message || 'Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
    } finally {
        // Возвращаем кнопку в исходное состояние
        isSubmittingReview = false;
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// Добавляем стили для отключенной кнопки отправки отзыва
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        #submitReview:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
});

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("cookiesAccepted") === "true") {
        const token = localStorage.getItem("accessToken"); // Получаем токен

        if (!token) {
            console.warn("❌ Нет токена, не запрашиваем /account");
            return;
        }

        fetch("https://makadamia-e0hb.onrender.com/account", {
            method: "GET", // ✅ Добавляем явное указание метода
            credentials: "include", // ✅ Передаем cookies
            headers: {
                "Authorization": `Bearer ${token}` // ✅ Передаем токен
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => console.log("✅ Данные аккаунта:", data))
        .catch(error => console.error("❌ Ошибка загрузки аккаунта:", error));
    } else {
        console.log("⚠️ Пользователь не принял cookies. Запрос не отправлен.");
    }
});
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateControls(productId) {
    const addButton = document.getElementById(`addButton_${productId}`);
    const removeButton = document.getElementById(`removeBtn_${productId}`);
    const quantityDisplay = document.getElementById(`quantity_${productId}`);
    const addButtonControl = document.getElementById(`addBtn_${productId}`);

    if (cart[productId] && cart[productId].quantity > 0) {
        if (addButton) addButton.style.display = "none";
        if (removeButton) removeButton.style.display = "inline-block";
        if (addButtonControl) addButtonControl.style.display = "inline-block";
        if (quantityDisplay) {
            quantityDisplay.style.display = "inline-block";
            quantityDisplay.textContent = cart[productId].quantity;
        }
    } else {
        if (addButton) addButton.style.display = "inline-block";
        if (removeButton) removeButton.style.display = "none";
        if (addButtonControl) addButtonControl.style.display = "none";
        if (quantityDisplay) {
            quantityDisplay.style.display = "none";
        }
    }
}
function displayUserOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    if (!ordersContainer) {
        console.error("Контейнер для заказов не найден");
        return;
    }

    // Очищаем контейнер перед добавлением заказов
    ordersContainer.innerHTML = '';

    if (!orders || orders.length === 0) {
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'block';
        }
        ordersContainer.innerHTML = '<div class="no-orders">У вас еще нет заказов.</div>';
        return;
    }

    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'none';
    }

    // Сортируем заказы от новых к старым
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Отображаем все заказы
    orders.forEach(order => {
        const itemsList = order.items.map(item => {
            if (item.productId && item.productId.name) {
                return `<li>${item.productId.name} — ${item.quantity} шт. (${item.price} ₽)</li>`;
            } else {
                return `<li>Товар не найден</li>`;
            }
        }).join('');

        const orderHTML = `
            <div class="order">
                <h3>Заказ №${order._id.slice(0, 8)}</h3>
                <p>Адрес: ${order.address}</p>
                <p>Дата оформления: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
                <p>Время доставки: ${order.deliveryTime || 'Не указано'}</p>
                <p>Телефон: ${order.phone || 'не указан'}</p>
                <p>Общая сумма: ${order.totalAmount} ₽</p>
                ${order.additionalInfo ? `<p>Дополнительная информация: ${order.additionalInfo}</p>` : ''}
                <ul>${itemsList}</ul>
            </div>
        `;

        ordersContainer.innerHTML += orderHTML;
    });
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = ""; // Очищаем список товаров
    let totalAmount = 0;

    for (const productId in cart) {
        const item = cart[productId]; // item = { name, price, quantity }
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.setAttribute("data-id", productId); // Назовём честно productId
        cartItem.innerHTML = `
            <div class="item-info">${item.name} - ${itemTotal} ₽</div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${productId}')">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="incrementItem('${productId}', ${item.price})">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    }

    document.getElementById("totalAmount").textContent = `Итого: ${totalAmount} ₽`;
}



function updateAddToCartButton(productId) {
    const addToCartButton = document.querySelector(`.add-to-cart-button[data-id="${productId}"]`);
    if (addToCartButton) {
        addToCartButton.textContent = "В корзине";
        addToCartButton.disabled = true;
    }
}
async function handleCheckoutFormSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || {};
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
        const response = await fetch("https://makadamia-e0hb.onrender.com/api/order", {
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
        saveCart();
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Ошибка сети или сервера:", error);
        alert("Ошибка при оформлении заказа. Проверьте соединение.");
    }
}
document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutCart();
    loadUserData();
    initializeAddToCartButtons();

    const backToShoppingButton = document.getElementById("backToShopping");
    if (backToShoppingButton) {
        backToShoppingButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleCheckoutFormSubmit);
    }
});
function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
    addToCartButtons.forEach(button => {
        const productId = button.getAttribute("data-id");
        const productName = button.getAttribute("data-name");
        const productPrice = parseFloat(button.getAttribute("data-price"));

        button.addEventListener("click", () => {
            addToCart(productId, productName, productPrice);
        });

        // Проверяем, есть ли товар в корзине, чтобы обновить состояние кнопки
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        if (cart[productId]) {
            updateAddToCartButton(productId);
        }
    });
}


function displayOrder(order, container) {
    // Проверяем, существует ли контейнер
    if (!container) {
        console.error("Контейнер для отображения заказа не найден");
        return;
    }
    
    const itemsList = order.items.map(item => {
        if (item.productId && item.productId.name) {
            return `<li>${item.productId.name} — ${item.quantity} шт. (${item.price} ₽)</li>`;
        } else {
            return `<li>Товар не найден</li>`;
        }
    }).join('');

    let orderHTML = `
        <div class="order">
            <h3>Заказ №${order._id.slice(0, 8)}</h3>
            <p>Адрес: ${order.address}</p>
            <p>Дата оформления: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
            <p>Время доставки: ${order.deliveryTime || 'Не указано'}</p>
            <p>Телефон: ${order.phone || 'не указан'}</p>
            <p>Общая сумма: ${order.totalAmount} ₽</p>
    `;

    if (order.additionalInfo) {
        orderHTML += `<p>Дополнительная информация: ${order.additionalInfo}</p>`;
    }

    orderHTML += `<ul>${itemsList}</ul></div><hr>`;

    container.innerHTML += orderHTML;
}


// Добавление товара
function addToCart(productId, productName, productPrice) {
    if (!cart[productId]) {
        cart[productId] = {
            name: productName,
            price: productPrice,
            quantity: 1
        };
    } else {
        cart[productId].quantity++;
    }

    localStorage.setItem('cart', JSON.stringify(cart));  // Сохраняем корзину
    updateControls(productId);  // Обновляем кнопки и количество
    updateCartDisplay();  // Обновляем отображение корзины
}



function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = ""; 
    let totalAmount = 0;

    for (const productId in cart) {
        const item = cart[productId]; // item = { name, price, quantity }
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.setAttribute("data-id", productId); // Назовём честно productId
        cartItem.innerHTML = `
            <div class="item-info">${item.name} - ${itemTotal} ₽</div>  <!-- Используем item.name для отображения названия товара -->
            <div class="cart-buttons">
                <button onclick="decrementItem('${productId}')">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="incrementItem('${productId}', ${item.price})">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    }

    document.getElementById("totalAmount").textContent = `Итого: ${totalAmount} ₽`;
}


function updateQuantityDisplay(productName) {
    const quantityElement = document.getElementById(`quantity_${productName}`);
    if (quantityElement) {
        quantityElement.textContent = cart[productName].quantity;
    }
}
function checkForEmptyCart(productName) {
    const quantity = cart[productName] ? cart[productName].quantity : 0;
    const addButton = document.getElementById(`addButton_${productName}`);
    const controls = document.getElementById(`controls_${productName}`);

    // Если количество товара равно нулю, показываем кнопку "Добавить"
    if (quantity === 0) {
        if (addButton) addButton.style.display = 'inline-block';  // Показываем кнопку "Добавить"
        if (controls) controls.style.display = 'none';  // Скрываем кнопки "+" и "-"
    }
}


// Увеличение количества товара
function incrementItem(productId, price) {
    if (cart[productId]) {
        if (cart[productId].quantity >= 100) {
            alert('Максимальное количество одного товара - 100 штук');
            return;
        }
        cart[productId].quantity += 1;
        saveCart();
        updateControls(productId);
        updateCartDisplay();
    }
}

function decrementItem(productId) {
    if (cart[productId]) {
        cart[productId].quantity -= 1;
        if (cart[productId].quantity <= 0) {
            delete cart[productId]; // Удаляем товар из корзины
        }
        saveCart();
        updateControls(productId); // Обновляем кнопки
        updateCartDisplay(); // Обновляем корзину
    }
}


function updateQuantityDisplay(productName) {
    const quantityElement = document.getElementById(`quantity_${productName}`);
    if (quantityElement) {
        quantityElement.textContent = cart[productName].quantity;
    }
}
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}


//ощичение корзины
document.addEventListener('DOMContentLoaded', () => {
    const clearCartButton = document.getElementById('clear-cart');
    const cartTotal = document.getElementById('totalAmount');

    if (clearCartButton) {
        clearCartButton.addEventListener('click', () => {
            cart = {};  // Очищаем корзину
            localStorage.removeItem('cart'); // Удаляем корзину
            updateCartDisplay();  // Обновляем отображение корзины
            if (cartTotal) {
                cartTotal.textContent = 'Итого: 0 ₽';
            }

            const productCards = document.querySelectorAll(".card-dish");
            productCards.forEach(card => {
                const addButton = card.querySelector(".add-button-size");
                const removeButton = card.querySelector(".quantity-control");
                const addButtonControl = card.querySelector(".quantity-size-button");
                const quantityDisplay = card.querySelector(".quantity-display");

                // Скрываем кнопки и количество
                if (addButton) addButton.style.display = "inline-block";
                if (removeButton) removeButton.style.display = "none";
                if (addButtonControl) addButtonControl.style.display = "none";
                if (quantityDisplay) {
                    quantityDisplay.textContent = "";
                    quantityDisplay.style.display = "none";
                }
            });
        });
    }
});


document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        console.log("Пользователь не авторизован");
        return;
    }

    // Загружаем заказы при загрузке страницы
    try {
        const response = await fetch("https://makadamia-e0hb.onrender.com/api/user-orders", {
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
        
        // Находим контейнер для заказов
    const container = document.getElementById("ordersContainer");
        const noOrdersMessage = document.getElementById("noOrdersMessage");
        
        if (!container) {
            console.log("Контейнер для заказов не найден на этой странице");
            return;
        }

    if (orders.length === 0) {
            if (noOrdersMessage) noOrdersMessage.style.display = 'block';
        return;
    }

        if (noOrdersMessage) noOrdersMessage.style.display = 'none';

        // Сортируем заказы от новых к старым
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Показываем последний заказ
        container.innerHTML = ''; // Очищаем контейнер
    displayOrder(orders[0], container);

        // Обработчик кнопки переключения истории
    const toggleBtn = document.getElementById('toggleHistoryBtn');
    const ordersHistory = document.getElementById('ordersHistory');

        if (toggleBtn && ordersHistory) {
    toggleBtn.addEventListener('click', async () => {
                const isHidden = ordersHistory.style.display === 'none';
                
                if (isHidden) {
                    // Проверяем и обновляем токен перед загрузкой заказов
                    const token = localStorage.getItem("accessToken");
                    if (!token || isTokenExpired(token)) {
                        console.log("Обновляем токен...");
                        await refreshAccessToken();
                    }
                    
                    ordersHistory.style.display = 'block';
                    toggleBtn.textContent = 'Скрыть историю заказов';
                    
                    try {
                        await loadOrders();
                    } catch (error) {
                        console.error("Ошибка при загрузке заказов:", error);
                        ordersHistory.innerHTML = '<div class="no-orders">Ошибка при загрузке заказов. Попробуйте позже.</div>';
                    }
                } else {
                    ordersHistory.style.display = 'none';
                    toggleBtn.textContent = 'Показать историю заказов';
                }
            });
        }

    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
    }
});

    // Добавление отзыва
    document.getElementById("submitReview").addEventListener("click", function () {
        let name = reviewName.value.trim();
        if (name === "") {
            name = getUserName(); // Получаем имя из личного кабинета
        }
        const comment = reviewComment.value.trim();
        const stars = Math.floor(Math.random() * 5) + 1; // Заглушка рейтинга

        if (comment === "") {
            alert("Введите комментарий!");
            return;
        }

        const review = {
            name,
            comment,
            stars,
            date: new Date()
        };

        reviews.push(review);
        displayReviews();

        // Очистка полей
        reviewComment.value = "";
        reviewComment.style.height = "40px";
    });

    // Фильтрация отзывов
filterStars.addEventListener("change", applyFilters);
filterDate.addEventListener("change", applyFilters);


    // Функция получения имени пользователя (заглушка)
    function getUserName() {
        return "Пользователь"; // Здесь можно вставить логику получения имени из личного кабинета
    }

// Обновление отображения корзины после очистки
function updateCartDisplay() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = "";  // Очищаем список товаров
    let totalAmount = 0;

    for (const productId in cart) {
        const item = cart[productId];  // item = { name, price, quantity }
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.setAttribute("data-id", productId); // Назовём честно productId, а не name
        cartItem.innerHTML = `
            <div class="item-info">${item.name} - ${itemTotal} ₽</div>
            <div class="cart-buttons">
                <button onclick="decrementItem('${productId}')">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="incrementItem('${productId}', ${item.price})">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    }

    document.getElementById("totalAmount").textContent = `Итого: ${totalAmount} ₽`;

    // Если корзина пуста, скрываем её
    if (Object.keys(cart).length === 0) {
        document.getElementById("cartDropdown").style.display = "none";
    }
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}
function renderCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalPrice = document.getElementById("cartTotalPrice");

    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

    for (const productId in cart) {
        const item = cart[productId];
        const itemTotalPrice = item.price * item.quantity;
        totalPrice += itemTotalPrice;

        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cart-item";
        cartItemElement.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">${item.quantity} шт.</span>
            <span class="item-price">${itemTotalPrice.toFixed(2)} ₽</span>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    }

    cartTotalPrice.textContent = totalPrice.toFixed(2) + " ₽";
}
function updateTotal() {
    const cartItems = getCartItems();
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = document.getElementById('totalAmount');
    if (totalAmount) {
        totalAmount.textContent = `Итого: ${total} ₽`;
    }
}
function getCartItems() {
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
}
// Оформление заказа
function checkout() {
    alert("Ваш заказ оформлен!");
    cart = {};
    updateCartDisplay();
    resetAddToCartButtons();
    saveCart();
    toggleCart();
}

// Сброс всех кнопок на исходное состояние "Добавить"
function resetAddToCartButtons() {
    for (const itemName in cart) {
        revertControlsToAddButton(itemName);
    }
}

// Загрузка корзины из localStorage при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    const cartModal = document.getElementById("cartModal");
    if (cartModal) cartModal.style.display = "none";
});

// Функция загрузки корзины
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        console.warn("❌ Нет accessToken, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return null;
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`  // Добавляем токен в заголовки
        }
    });

    if (res.status === 401) {
        console.warn("🔄 Токен истёк, пробуем обновить...");
        token = await refreshAccessToken();
        if (!token) return res;

        return fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
    }

    return res;
}
document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');  // Получаем токен из localStorage

    if (accessToken) {
        document.getElementById('authButton').textContent = 'Личный кабинет';  // Изменяем кнопку
        await loadUserData(accessToken);  // Загружаем данные пользователя
    } else {
        document.getElementById('authButton').textContent = 'Вход';  // Если токен отсутствует, отображаем "Вход"
    }
});


function getTokenExp(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp;
    } catch (e) {
        return null;
    }
}


async function refreshAccessToken() {
    console.log("🔄 Запрос на обновление access-токена...");

    try {
        const response = await fetch("https://makadamia-e0hb.onrender.com/refresh", {
            method: "POST",
            credentials: "include"  // Отправляем cookies
        });

        if (!response.ok) {
            const data = await response.json();
            console.warn("❌ Ошибка обновления токена:", data.message);

            if (data.message.includes("Refresh-токен истек") || data.message.includes("Недействителен")) {
                console.error("⏳ Refresh-токен окончательно истек. Требуется повторный вход!");
                logout();
            }
            
            return null;
        }

        const data = await response.json();
        console.log("✅ Новый accessToken:", data.accessToken);

        localStorage.setItem("accessToken", data.accessToken);  // ✅ Сохраняем access-токен!
        return data.accessToken;
    } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        return null;
    }
}



function generateTokens(user, site) {
    const issuedAt = Math.floor(Date.now() / 1000);
    
    const accessToken = jwt.sign(
        { id: user._id, username: user.username, iat: issuedAt },
        JWT_SECRET,
        { expiresIn: "30m" }  // ⏳ Access-токен на 30 минут
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, site, iat: issuedAt },
        REFRESH_SECRET,
        { expiresIn: "7d" }  // 🔄 Refresh-токен на 7 дней
    );

    return { accessToken, refreshToken };
}


function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return (Date.now() / 1000) >= payload.exp;
    } catch (e) {
        console.error("Ошибка декодирования токена:", e);
        return true;
    }
}



// Запускаем проверку токена раз в минуту
setInterval(async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        console.warn("⚠️ Нет accessToken, попробуем обновить...");
        await refreshAccessToken();
        return;
    }

    const exp = getTokenExp(token); // Получаем время истечения
    const now = Math.floor(Date.now() / 1000);

    if (!exp || (exp - now) < 300) { // Если токен просрочен или скоро истечёт
        console.log("⏳ Access-токен истекает, обновляем...");
        await refreshAccessToken();
    }
}, 30000); // Проверяем каждые 30 секунд

function editField(field) {
    const input = document.getElementById(field + "Input");
    console.log("Редактируем поле:", field, "Значение:", input.value);

    if (input.disabled) {
        input.disabled = false;
        input.focus();
    } else {
        fetch("https://makadamia-e0hb.onrender.com/account", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify({ [field]: input.value }) // Отправляем данные на сервер
        })
        .then(response => response.json())
        .then(data => {
            console.log("Ответ сервера:", data);
            input.disabled = true;
        })
        .catch(error => console.log("Ошибка обновления профиля:", error));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        console.warn("❌ Нет токена");
        document.getElementById('usernameDisplay').innerText = "Гость";
        return;
    }

    fetch("https://makadamia-e0hb.onrender.com/account", {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status}`);
        return res.json();
    })
    .then(data => {
        console.log("✅ Ответ сервера:", data);

        const usernameEl = document.getElementById("usernameDisplay");
        const nameInput = document.getElementById("nameInput");
        const cityInput = document.getElementById("cityInput");

        if (usernameEl) usernameEl.innerText = data.username || "Ошибка";
        if (nameInput) nameInput.value = data.name || "";
        if (cityInput) cityInput.value = data.city || "";
    })
    .catch(err => {
        console.error("❌ Ошибка загрузки аккаунта:", err);
        const usernameEl = document.getElementById("usernameDisplay");
        if (usernameEl) usernameEl.innerText = "Ошибка загрузки";
    });
});
async function updateAccountField(data) {
    const token = localStorage.getItem("accessToken");

    try {
        const response = await fetch("https://makadamia-e0hb.onrender.com/account", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Без этого сервер отклонит запрос
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Ошибка при обновлении данных");
        }

        const result = await response.json();
        console.log("✅ Данные успешно обновлены:", result);
    } catch (error) {
        console.error("❌ Ошибка обновления данных:", error);
    }
}


document.getElementById('editName').addEventListener('click', () => {
    document.getElementById('nameInput').disabled = false;
    document.getElementById('saveName').style.display = 'inline-block';
});

document.getElementById('saveName').addEventListener('click', async () => {
    const newName = document.getElementById('nameInput').value;
    await updateAccountField({ name: newName });
    document.getElementById('nameInput').disabled = true;
    document.getElementById('saveName').style.display = 'none';
});

// Аккаунт: редактировать город
document.getElementById('editCity').addEventListener('click', () => {
    document.getElementById('cityInput').disabled = false;
    document.getElementById('saveCity').style.display = 'inline-block';
});

document.getElementById('saveCity').addEventListener('click', async () => {
    const newCity = document.getElementById('cityInput').value;
    await updateAccountField({ city: newCity });
    document.getElementById('cityInput').disabled = true;
    document.getElementById('saveCity').style.display = 'none';
});
// Проверка состояния авторизации
function checkAuthStatus() {
    const token = localStorage.getItem("accessToken"); // Должно быть accessToken
    const username = localStorage.getItem("username");
    const authButton = document.getElementById("authButton");
    const cabinetButton = document.getElementById("cabinetButton");

    if (!authButton || !cabinetButton) {
        console.warn("❌ Не найдены кнопки 'Вход' или 'Личный кабинет'!");
        return;
    }

    if (token && username && !isTokenExpired(token)) { 
        console.log("✅ Пользователь авторизован");
        authButton.style.display = "none";
        cabinetButton.style.display = "inline-block";
    } else {
        console.log("⚠️ Пользователь не авторизован");
        authButton.style.display = "inline-block";
        cabinetButton.style.display = "none";
        sessionStorage.removeItem("authChecked");
    }
}

async function logout() {
    try {
        const response = await fetch("https://makadamia-e0hb.onrender.com/logout", { 
            method: "POST", 
            credentials: "include"
        });

        if (!response.ok) {
            console.error("❌ Ошибка выхода:", response.status);
        }

        console.log("✅ Выход выполнен успешно!");
    } catch (error) {
        console.error("❌ Ошибка при выходе:", error);
    }

    // Очистка локального хранилища
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    sessionStorage.clear();

    // Удаление куков
    document.cookie = "refreshTokenDesktop=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    window.location.href = "/login.html";
}


function handleAuthClick() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        window.location.href = 'account.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Переход на страницу личного кабинета
function openCabinet() {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');

   if (!token && !sessionStorage.getItem("authFailed")) {
    alert("Вы не авторизованы. Перенаправление...");
    window.location.href = "/login.html";
    } else {
        // Переход на страницу личного кабинета
        window.location.href = "/account.html";
    }
}

// Инициализация авторизации и кнопок при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
    checkAuthStatus();

    // Убеждаемся, что кнопка "Выход" отображается только в личном кабинете
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton && window.location.pathname !== '/account.html') {
        logoutButton.style.display = 'none';
    }
});

// Расчет баланса на основе корзины
function calculateBalance() {
    let balance = 0;
    for (const item in cart) {
        balance += cart[item].price * cart[item].quantity;
    }
    return balance;
}
// Переход на страницу оформления заказа
function goToCheckoutPage() {
    saveCart();
    window.location.href = "checkout.html";
}


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('accessToken'); // Получаем токен из localStorage
    if (!token) {
        document.getElementById('usernameDisplay').innerText = "Гость";
        return;
    }

    fetch("https://makadamia-e0hb.onrender.com/account", {
        method: "GET",
        credentials: "include", // ✅ Добавляем передачу cookies
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Ошибка HTTP: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.username) {
            document.getElementById('usernameDisplay').innerText = data.username;
            document.getElementById('authButton').style.display = 'none'; // Скрываем "Вход"
            document.getElementById('cabinetButton').style.display = 'inline-block'; // Показываем "Личный кабинет"
        } else {
            document.getElementById('usernameDisplay').innerText = "Ошибка загрузки";
        }
    })
    .catch(error => {
        console.error("Ошибка загрузки аккаунта:", error);
        document.getElementById('usernameDisplay').innerText = "Ошибка загрузки";
    });
});
async function updateAccount(newUsername, newPassword) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("https://makadamia-e0hb.onrender.com/account", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Без этого сервер отклонит запрос
    },
    body: JSON.stringify({ username: newUsername, password: newPassword }),
  });

  const data = await response.json();
  console.log("Ответ от сервера:", data);
}

function loadUserData() {
    const customerNameInput = document.getElementById("customerName");
    const customerAddressInput = document.getElementById("customerAddress");
    const additionalInfoInput = document.getElementById("additionalInfo");

    const userData = JSON.parse(localStorage.getItem("userData")) || {};

    if (customerNameInput) customerNameInput.value = userData.name || "";
    if (customerAddressInput) customerAddressInput.value = userData.address || "";
    if (additionalInfoInput) additionalInfoInput.value = userData.additionalInfo || "";
}


// Убедитесь, что этот код в `script.js` загружен перед его вызовом в HTML
document.addEventListener("DOMContentLoaded", function () {
    const authButton = document.getElementById("authButton");
    if (authButton) {
        authButton.onclick = handleAuthClick;
    }
});
async function loadOrders() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.log("Токен отсутствует");
        return;
    }

    try {
        const response = await fetch("https://makadamia-e0hb.onrender.com/api/user-orders", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const orders = await response.json();
        displayUserOrders(orders); // Используем правильное имя функции

    } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
    }
}

// Отображение заказов на странице
function displayOrder(order, container) {
    // Проверяем, существует ли контейнер
    if (!container) {
        console.error("Контейнер для отображения заказа не найден");
        return;
    }
    
    const itemsList = order.items.map(item => {
        if (item.productId && item.productId.name) {
            return `<li>${item.productId.name} — ${item.quantity} шт. (${item.price} ₽)</li>`;
        } else {
            return `<li>Товар не найден</li>`;
        }
    }).join('');

    let orderHTML = `
        <div class="order">
            <h3>Заказ №${order._id.slice(0, 8)}</h3>
            <p>Адрес: ${order.address}</p>
            <p>Дата оформления: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
            <p>Время доставки: ${order.deliveryTime || 'Не указано'}</p>
            <p>Общая сумма: ${order.totalAmount} ₽</p>
    `;

    if (order.additionalInfo) {
        orderHTML += `<p>Дополнительная информация: ${order.additionalInfo}</p>`;
    }

    orderHTML += `<ul>${itemsList}</ul></div><hr>`;

    container.innerHTML += orderHTML;
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("userId", data.userId);
            // Сохраняем данные пользователя
            localStorage.setItem("userData", JSON.stringify({ username: username }));
            
            updateAuthUI();
            window.location.href = "index.html";
        } else {
            alert(data.message || "Ошибка входа");
        }
    } catch (error) {
        console.error("Ошибка при входе:", error);
        alert("Произошла ошибка при входе");
    }
}
