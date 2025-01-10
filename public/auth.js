// Переключение между формами
function showRegister() {
    // Переключаем видимость форм
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("loginForm").classList.add("hidden");

    // Переключаем активные кнопки
    document.getElementById("toggleRegister").classList.add("active");
    document.getElementById("toggleLogin").classList.remove("active");
}

function showLogin() {
    // Переключаем видимость форм
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");

    // Переключаем активные кнопки
    document.getElementById("toggleLogin").classList.add("active");
    document.getElementById("toggleRegister").classList.remove("active");
}

// Устанавливаем начальный вид (форма входа по умолчанию)
document.addEventListener("DOMContentLoaded", () => {
    showLogin();
});


// Обработчик регистрации
const registerForm = document.querySelector("#registerForm form");
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Останавливаем отправку формы по умолчанию

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("https://makadamia.onrender.com/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Регистрация прошла успешно! Вы можете войти.");
            showLogin(); // Переключаемся на форму входа
        } else {
            alert(data.message || "Ошибка регистрации.");
        }
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
});

// Обработчик входа
const loginForm = document.querySelector("#loginForm form");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Останавливаем отправку формы по умолчанию

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("https://makadamia.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Сохраняем токен и имя пользователя в localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);

            alert("Вы успешно вошли в систему!");
            window.location.href = "/index.html"; // Переход на главную страницу
        } else {
            alert(data.message || "Ошибка входа.");
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
});
