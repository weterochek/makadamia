// === Переключение между формами ===
function showRegister() {
    document.getElementById("registerForm").classList.add("active");
    document.getElementById("loginForm").classList.remove("active");

    document.getElementById("toggleRegister").classList.add("active");
    document.getElementById("toggleLogin").classList.remove("active");
}

function showLogin() {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("registerForm").classList.remove("active");

    document.getElementById("toggleLogin").classList.add("active");
    document.getElementById("toggleRegister").classList.remove("active");
}

showLogin(); // По умолчанию

// === Регистрация ===
const registerForm = document.querySelector("#registerForm form");
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const email = document.getElementById("registerEmail").value;

    try {
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        const usernameError = document.getElementById("usernameError");
if (!usernameRegex.test(username)) {
    usernameError.textContent = "Имя пользователя может содержать только латинские буквы, цифры и подчёркивание.";
    usernameError.style.display = "block";
    return;
} else {
    usernameError.textContent = "";
    usernameError.style.display = "none";
}
        const response = await fetch("https://makadamia-app-etvs.onrender.com/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("📨 Письмо с подтверждением отправлено на вашу почту. Подтвердите email, прежде чем входить.");
            window.location.href = "/login.html";
            return;
        } else {
            alert(data.message || "Ошибка регистрации.");
        }
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        alert("Произошла ошибка.");
    }
});

// === Вход ===
const loginForm = document.querySelector("#loginForm form");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", username);
            localStorage.removeItem("logoutFlag");
            window.location.href = "/index.html";
        } else {
            alert(data.message || "Ошибка входа.");
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
});


// === Функция обновления accessToken ===


// === Выход ===
function logout() {
    fetch("https://makadamia-e0hb.onrender.com/logout", { method: "POST", credentials: "include" })
        .then(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            sessionStorage.clear();

            document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

            window.location.href = "/login.html";
        })
        .catch((error) => console.error("Ошибка выхода:", error));
}



// === Функция для работы с авторизованными запросами ===
async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        token = await refreshAccessToken();
        if (!token) return null;
    }

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) return response;

        response = await fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
    }

    return response;
}

// === Парсинг exp из токена ===
function getTokenExp(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp;
    } catch (e) {
        return null;
    }
}
