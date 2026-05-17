async function loadPlayer() {
    const id = localStorage.getItem("selectedSongId");
    const container = document.getElementById("chordsContainer");

    if (!id) {
        window.location.href = "overview.html";
        return;
    }

    try {
        const res = await fetch(`/songs/${id}`);
        const song = await res.json();

        document.getElementById("songTitle").innerText = song.name.toUpperCase();
        document.getElementById("songArtist").innerText = song.artist;
        document.getElementById("songKey").innerText = song.key;

        container.innerHTML = "";

        song.sections.forEach(section => {
            const sectionDiv = document.createElement("div");
            sectionDiv.className = "glass-card animate-up";
            sectionDiv.style = "margin-bottom:30px; border-left:5px solid var(--primary);";

            sectionDiv.innerHTML = `
                <h2 style="color:var(--primary); font-size:14px; letter-spacing:3px; margin-bottom:15px;">${section.name.toUpperCase()}</h2>
                <div style="font-family: 'Courier New', monospace; font-size:24px; color:#fff; word-spacing:20px; line-height:2;">
                    ${section.chords.join(" | ")}
                </div>
            `;
            container.appendChild(sectionDiv);
        });

    } catch (e) {
        container.innerHTML = "<h2 style='text-align:center; color:red;'>Error al cargar la partitura.</h2>";
    }
}

loadPlayer();