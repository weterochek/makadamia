function toggleForms(showRegister) {
    document.getElementById("registerForm").classList.toggle("active", showRegister);
    document.getElementById("loginForm").classList.toggle("active", !showRegister);
    document.getElementById("toggleRegister").classList.toggle("active", showRegister);
    document.getElementById("toggleLogin").classList.toggle("active", !showRegister);
}

toggleForms(false); // Показ формы авторизации по умолчанию

async function handleAuth(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
        });
        return await response.json();
    } catch (error) {
        console.error("Ошибка запроса:", error);
        return { error: "Произошла ошибка. Попробуйте снова." };
    }
}

async function refreshAccessToken() {
    const data = await handleAuth("https://makadamia.onrender.com/refresh", {});
    if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        return data.accessToken;
    }
    logout();
}

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("token");
    let response = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
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

function logout() {
    handleAuth("https://makadamia.onrender.com/logout", {}).then(() => {
        localStorage.clear();
        window.location.href = "/login.html";
    });
}

// Обработчики форм
function setupAuthHandlers() {
    document.querySelector("#registerForm form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;
        const data = await handleAuth("https://makadamia.onrender.com/register", { username, password });
        if (data.error) alert(data.error);
        else {
            alert("Регистрация прошла успешно! Вы можете войти.");
            toggleForms(false);
        }
    });

    document.querySelector("#loginForm form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        const data = await handleAuth("https://makadamia.onrender.com/login", { username, password });
        if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("username", username);
            alert("Вы успешно вошли в систему!");
            window.location.href = "/index.html";
        } else {
            alert(data.message || "Ошибка входа.");
        }
    });
}

setupAuthHandlers();
