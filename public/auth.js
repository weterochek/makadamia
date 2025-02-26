async function refreshAccessToken() {
    try {
        const response = await fetch("https://makadamia.onrender.com/refresh", {
            method: "POST",
            credentials: "include",
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.accessToken);
            return data.accessToken;
        } else {
            logout();
        }
    } catch (error) {
        console.error("Ошибка обновления токена:", error);
        logout();
    }
}

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("token");

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

function logout() {
    fetch("https://makadamia.onrender.com/logout", { method: "POST", credentials: "include" })
        .then(() => {
            localStorage.clear();
            window.location.href = "/login.html";
        })
        .catch((error) => console.error("Ошибка выхода:", error));
}

// Обновлённый обработчик входа
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("https://makadamia.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include", // Включаем куки
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("username", username);

            alert("Вы успешно вошли в систему!");
            window.location.href = "/index.html";
        } else {
            alert(data.message || "Ошибка входа.");
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
});
