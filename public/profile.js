const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

async function loadProfile() {
    const res = await fetch("/profile", { headers: { "Authorization": `Bearer ${token}` } });
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }
    
    const user = await res.json();
    
    document.getElementById("display-name").innerText = (user.name || "Usuario").toUpperCase();
    document.getElementById("display-role").innerText = user.instrument || user.role;
    
    // Afiliación (Si es híbrido, lo muestra explícito)
    const affil = user.ministry === "Hibrido" ? "PRINCIPAL / KIDS" : (user.ministry || "Principal");
    document.getElementById("display-affiliation").innerText = affil.toUpperCase();

    // Rellenar inputs
    document.getElementById("userName").value = user.name || "";
    document.getElementById("userPhone").value = user.phone || "";
    document.getElementById("userBio").value = user.bio || "";
    
    document.getElementById("avatarPreview").src = user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`;
}

// Previsualización de la foto seleccionada
document.getElementById("photoInput").addEventListener("change", function(event) {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { document.getElementById("avatarPreview").src = e.target.result; };
        reader.readAsDataURL(event.target.files[0]);
    }
});

async function saveChanges() {
    const photoFile = document.getElementById("photoInput").files[0];
    const updateData = {
        name: document.getElementById("userName").value,
        phone: document.getElementById("userPhone").value,
        bio: document.getElementById("userBio").value
    };

    const pass = document.getElementById("userPass").value;
    if (pass) updateData.password = pass;

    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = async function() {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                
                const MAX_WIDTH = 400;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                updateData.photo = canvas.toDataURL("image/jpeg", 0.8);
                
                await sendUpdateToServer(updateData);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(photoFile);
    } else {
        await sendUpdateToServer(updateData);
    }
}

async function sendUpdateToServer(data) {
    const res = await fetch("/profile-update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("¡Datos actualizados permanentemente!");
        location.reload();
    } else {
        alert("Error al actualizar el perfil.");
    }
}

// Inicializar
loadProfile();
