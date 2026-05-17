async function loadSongs() {
    const grid = document.getElementById("songsGrid");
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/songs", {
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (!res.ok) throw new Error("Error en la respuesta");
        
        const songs = await res.json();
        grid.innerHTML = ""; // Limpiamos el cargando

        if (songs.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">
                <p style="color:var(--text-dim)">No hay canciones en el repertorio aún.</p>
            </div>`;
            return;
        }

        songs.forEach(song => {
            const card = document.createElement("div");
            card.className = "glass-card animate-zoom";
            card.style = "display:flex; flex-direction:column; justify-content:space-between;";
            
            card.innerHTML = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                        <span class="song-key">${song.key || 'N/A'}</span>
                        <span style="font-size:12px; color:var(--text-dim)">${song.tempo || '--'} BPM</span>
                    </div>
                    <h3 style="margin:0 0 5px 0; color:var(--text);">${song.name}</h3>
                    <p style="margin:0; color:var(--primary); font-size:14px; font-weight:600;">${song.artist || 'Artista desconocido'}</p>
                </div>
                <button style="margin-top:20px; width:100%; font-size:12px;" onclick="openSong('${song._id}')">ABRIR ACORDES</button>
            `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        grid.innerHTML = `<p style="color:var(--primary); text-align:center; grid-column:1/-1;">Error al cargar las canciones. Revisa la conexión con el servidor.</p>`;
    }
}

function openSong(id) {
    // Guardamos el ID en memoria y vamos al player
    localStorage.setItem("selectedSongId", id);
    window.location.href = "player.html";
}

function filterSongs() {
    const query = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll("#songsGrid .glass-card");
    
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? "flex" : "none";
    });
}
async function changeRootKey(songId, newKey) {
    const res = await fetch(`/songs/${songId}/key`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ key: newKey })
    });
    if(res.ok) {
        alert("Nota raíz actualizada correctamente.");
        loadSongs(); // Recarga la lista
    }
}
// Iniciar carga
loadSongs();