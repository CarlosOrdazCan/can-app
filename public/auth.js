const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
} else {
    // Verificamos si el token es válido decodificándolo
    try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            localStorage.clear();
            window.location.href = "login.html";
        }
    } catch (e) {
        localStorage.clear();
        window.location.href = "login.html";
    }
}
