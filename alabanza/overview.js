let allSongs = [];
let selectedSong = null;
let currentTransposeSteps = 0;

let currentUserRole = "Viewer";
let isFullAdmin = false;
let canEditSongs = false;
let isProdUser = false;

try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    currentUserRole = storedUser.role || "Viewer";
    const min = localStorage.getItem("activeMinistry") || storedUser.ministry || "";
    const instStr = String(storedUser.instrument || '').toLowerCase();
    const branchStr = String(storedUser.techBranch || '').toLowerCase();
    
    isFullAdmin = (currentUserRole === "Full Administrador" || (storedUser.username && storedUser.username.toLowerCase() === "cordaz"));
    canEditSongs = isFullAdmin || (currentUserRole === "Editor" && min !== "Produccion" && !instStr.includes("audio"));
    
    // Detectar si el usuario activo es de Producción / Video / Cabina
    isProdUser = (min === "Produccion" || instStr.includes("produccion") || instStr.includes("video") || instStr.includes("propresenter") || branchStr.length > 0) && !instStr.includes("audio");
} catch(e) {}

// Si es usuario de producción, por defecto mostramos SOLO LETRAS (SIN ACORDES)
let showChordsMode = !isProdUser;

function setChordsMode(show) {
    showChordsMode = show;
    renderChart();
}

// Carga Inicial del Catálogo
async function loadSongs() {
    const btnNewSong = document.getElementById("btnNewSong");
    if (btnNewSong) {
        btnNewSong.style.display = canEditSongs ? "inline-block" : "none";
    }

    const list = document.getElementById("songsList");
    list.innerHTML = `<div class="empty-state" style="padding:40px 20px;"><span style="font-size:24px;">⏳</span><p style="margin-top:8px; font-size:12px;">Cargando repertorio...</p></div>`;
    try {
        const res = await fetch("/songs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        allSongs = Array.isArray(data) ? data : [];
        renderList(allSongs);
    } catch (e) {
        list.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <p style="color:var(--status-red); font-size:13px; font-weight:700; margin-bottom:12px;">⚠️ Error al conectar con el servidor.</p>
                <p style="color:var(--text-muted); font-size:11px; margin-bottom:16px;">${e.message}</p>
                <button class="secondary" onclick="loadSongs()" style="padding:8px 16px; font-size:11px; font-weight:800;">🔄 REINTENTAR</button>
            </div>`;
    }
}

// Renderizar Lista Lateral (Planning Center Style)
function renderList(songs) {
    const list = document.getElementById("songsList");
    list.innerHTML = "";
    if (songs.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); text-align:center; margin-top:20px; font-size:13px;">Sin canciones coincidentes.</p>`;
        return;
    }

    songs.forEach(song => {
        const item = document.createElement("div");
        item.className = "song-item animate-fade";
        if (selectedSong && selectedSong._id === song._id) {
            item.classList.add('active');
        }
        item.onclick = () => {
            document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            viewChart(song._id);
        };
        
        const displayName = (song.name || 'Sin título').toUpperCase();
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 10px;">
                    <h3 style="font-family:var(--font-title); font-size:15px; font-weight:800; margin:0 0 4px 0; color:var(--text-main);">${displayName}</h3>
                    <p style="margin:0; font-size:12px; color:var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${song.artist || 'Desconocido'}</p>
                </div>
                <div class="status-pill confirmed" style="font-size:10px; font-weight:800; padding:4px 10px; border-radius:8px; border-color:var(--border-red); background:rgba(255, 42, 75, 0.05); color:var(--accent-red); flex-shrink: 0;">${song.key || '-'}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

function filterSongs() {
    const query = document.getElementById("search").value.toLowerCase();
    const filtered = allSongs.filter(s => s.name.toLowerCase().includes(query) || (s.artist && s.artist.toLowerCase().includes(query)));
    renderList(filtered);
}

// Visor Principal de Chart (ChartBuilder Style)
async function viewChart(id) {
    const panel = document.getElementById("viewerPanel");
    panel.innerHTML = `<div class="empty-state">Cargando canción...</div>`;
    currentTransposeSteps = 0;
    
    try {
        const song = allSongs.find(s => s._id === id);
        if (song) {
            selectedSong = song;
        } else {
            const res = await fetch(`/songs/${id}`);
            selectedSong = await res.json();
        }
        renderChart();
    } catch (e) {
        panel.innerHTML = `<div class="empty-state" style="color:var(--status-red);">Error al cargar la canción seleccionada.</div>`;
    }
}

function renderSectionBody(sec, steps, showChords) {
    const chordSheetRaw = sec.chordSheet || sec.lyrics || "";
    const lines = chordSheetRaw.split('\n');

    const chordTokenRegex = /^[A-Ga-g][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]|M?[0-9]*(?:-[0-9]+)?)*(?:\/[A-Ga-g][#b]?)?$/;
    const chordInlineRegex = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]|M?[0-9]*(?:-[0-9]+)?)*(?:\/[A-G][#b]?)?)\b/g;

    function isLineChords(line) {
        const tokens = line.trim().replace(/[\/\-\|\(\)]/g, ' ').split(/\s+/).filter(t => t.length > 0);
        if (tokens.length === 0) return false;
        let chordCount = 0;
        tokens.forEach(t => {
            if (chordTokenRegex.test(t)) chordCount++;
        });
        return (chordCount / tokens.length) >= 0.55;
    }

    if (!showChords) {
        // MODO PRODUCCIÓN: PURA LETRA SIN ACORDES
        const lyricsLines = lines.filter(l => !isLineChords(l) && l.trim() !== "");
        if (lyricsLines.length > 0) {
            const rendered = lyricsLines.map(line => 
                `<div class="cb-lyrics-line" style="font-size:18px; line-height:1.6; color:#ffffff; font-weight:700; margin-bottom:8px; font-family:var(--font-title);">${line}</div>`
            ).join('');
            return `<div style="padding:4px 0;">${rendered}</div>`;
        } else if (sec.lyrics && sec.lyrics.trim() !== "" && !isLineChords(sec.lyrics)) {
            return `<div class="cb-lyrics-line" style="font-size:18px; line-height:1.6; color:#ffffff; font-weight:700; font-family:var(--font-title);">${sec.lyrics.replace(/\n/g, '<br>')}</div>`;
        } else {
            return `<div style="color:var(--text-muted); font-style:italic; font-size:13px; padding:6px 0;">[Sección Instrumental]</div>`;
        }
    }

    // MODO BANDA: CIFRADO CON ACORDES
    const hasChordLines = lines.some(l => isLineChords(l));

    if (hasChordLines) {
        let rendered = lines.map(line => {
            if (isLineChords(line)) {
                const transposed = line.replace(chordInlineRegex, match => transposeChord(match, steps));
                return `<div class="cb-chords-line" style="font-size:16px; margin:0; line-height:1.4; color:var(--accent-blue); font-weight:800;">${transposed}</div>`;
            } else {
                return `<div class="cb-lyrics-line" style="font-family:var(--font-chords); font-size:15px; margin:0 0 8px 0; line-height:1.4; color:white;">${line}</div>`;
            }
        }).join('');
        return `<div style="font-family:var(--font-chords); white-space:pre; overflow-x:auto;">${rendered}</div>`;
    } else {
        let transposedChords = [];
        if (sec.chords && Array.isArray(sec.chords)) {
            transposedChords = sec.chords.map(chord => transposeChord(chord, steps));
        }
        const chordsLine = transposedChords.join('   ');
        return `
            <div class="cb-chords-line" style="font-size:16px; color:var(--accent-blue); font-weight:800;">${chordsLine || 'Instrumental'}</div>
            ${sec.lyrics ? `<div class="cb-lyrics-line" style="font-size:15px; color:white;">${sec.lyrics.replace(/\n/g, '<br>')}</div>` : ''}
        `;
    }
}

// Renderizar la vista de la canción
function renderChart() {
    if (!selectedSong) return;
    const panel = document.getElementById("viewerPanel");
    
    let currentKey = selectedSong.key || "C";
    if (currentTransposeSteps !== 0) {
        currentKey = transposeChord(currentKey, currentTransposeSteps);
    }

    const songTitle = (selectedSong.name || 'Sin título').toUpperCase();
    const songArtist = selectedSong.artist || 'Artista Desconocido';

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--border-color); padding-bottom:20px; margin-bottom:20px; flex-wrap: wrap; gap: 20px;">
            <div>
                <h1 style="font-size:36px; font-family:var(--font-title); font-weight:900; margin:0 0 6px 0; letter-spacing:-0.5px; text-shadow: 0 0 15px rgba(255,255,255,0.1); color:white;">${songTitle}</h1>
                <p style="font-size:15px; font-weight:700; color:var(--accent-blue); margin:0 0 12px 0;">${songArtist}</p>
                
                <!-- SELECTOR MODO PRODUCCIÓN (PURA LETRA) VS MODO BANDA (CON ACORDES) -->
                <div style="display:flex; gap:8px; align-items:center;">
                    <button 
                        type="button"
                        onclick="setChordsMode(false)"
                        style="padding:7px 14px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; border:1px solid var(--accent-purple); background:${!showChordsMode ? 'var(--accent-purple)' : 'rgba(255,255,255,0.04)'}; color:${!showChordsMode ? '#000000' : '#ffffff'}; transition:all 0.2s ease;"
                    >
                        📄 PURA LETRA (PRODUCCIÓN)
                    </button>
                    <button 
                        type="button"
                        onclick="setChordsMode(true)"
                        style="padding:7px 14px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; border:1px solid var(--border-color); background:${showChordsMode ? 'var(--accent-blue)' : 'rgba(255,255,255,0.04)'}; color:${showChordsMode ? '#000000' : '#ffffff'}; transition:all 0.2s ease;"
                    >
                        🎸 CON ACORDES (BANDA)
                    </button>
                </div>
            </div>

            <div style="text-align:right;">
                <div style="display:flex; gap:10px; margin-bottom:12px; justify-content:flex-end; flex-wrap:wrap;">
                    <span class="status-pill pending" style="border-radius:10px; font-weight:800; padding:6px 12px;">BPM: ${selectedSong.tempo || '--'}</span>
                    <span class="status-pill confirmed" style="border-radius:10px; font-weight:800; padding:6px 12px; background:rgba(255, 42, 75, 0.08); color:var(--accent-red); border-color:var(--border-red);">TONO ORIGINAL: ${selectedSong.key || '--'}</span>
                    ${selectedSong.duration ? `<span class="status-pill" style="border-radius:10px; font-weight:800; padding:6px 12px;">⏱️ ${selectedSong.duration} MIN</span>` : ''}
                </div>
                <div style="display:flex; gap:10px; justify-content:flex-end;">
                    ${canEditSongs ? `<button class="secondary" onclick="location.href='add-song.html?id=${selectedSong._id}'" style="padding:10px 16px; font-size:11px; font-weight:800; border-radius:10px;">✏️ EDITAR</button>` : ''}
                    ${isFullAdmin ? `<button class="danger" onclick="deleteSong('${selectedSong._id}')" style="padding:10px 16px; font-size:11px; font-weight:800; border-radius:10px;">🗑️ ELIMINAR</button>` : ''}
                </div>
            </div>
        </div>

        ${showChordsMode ? `
        <!-- Módulo Soundboard Mixer (Consola de Transposición - Solo Visible en Modo Banda) -->
        <div class="mixer-controls animate-fade">
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="background:var(--accent-red-trans); width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px;">🎛️</div>
                <div>
                    <h4 style="font-size:13px; font-family:var(--font-title); font-weight:800; color:var(--text-main); margin:0; text-transform:uppercase; letter-spacing:0.5px;">Consola de Cifrado</h4>
                    <p style="font-size:11px; color:var(--text-muted); margin:2px 0 0 0;">Transporta acordes en tiempo real para la banda.</p>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px; background:rgba(0,0,0,0.3); padding:8px 16px; border-radius:12px; border:1px solid var(--border-color);">
                <button class="secondary" onclick="shiftTranspose(-1)" style="padding:8px 14px; font-size:14px; font-weight:900; border-radius:8px; border:none; background:rgba(255,255,255,0.03); min-width:36px; height:36px;">−</button>
                <div style="text-align:center; min-width:130px;">
                    <span style="font-size:9px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:800; letter-spacing:0.5px; margin-bottom:2px;">Tono en Vivo</span>
                    <strong style="font-size:18px; color:var(--accent-blue); font-family:var(--font-title); font-weight:900; text-shadow:0 0 8px rgba(56,189,248,0.3);">${currentKey}</strong>
                    ${currentTransposeSteps !== 0 ? `<span style="font-size:10px; color:var(--accent-red); font-weight:bold; margin-left:4px;">(${currentTransposeSteps > 0 ? '+' : ''}${currentTransposeSteps})</span>` : ''}
                </div>
                <button class="secondary" onclick="shiftTranspose(1)" style="padding:8px 14px; font-size:14px; font-weight:900; border-radius:8px; border:none; background:rgba(255,255,255,0.03); min-width:36px; height:36px;">+</button>
                ${currentTransposeSteps !== 0 ? `<button class="danger" onclick="resetTranspose()" style="padding:8px 12px; font-size:10px; border-radius:8px; height:36px; margin-left:5px;">RESTABLECER</button>` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="chords-render-zone">
    `;

    const sections = Array.isArray(selectedSong.sections) ? selectedSong.sections : [];

    if (sections.length > 0) {
        sections.forEach(sec => {
            if (!sec || typeof sec !== 'object') return;
            html += `
                <div class="cb-section-block animate-fade" style="margin-bottom:18px;">
                    <div class="cb-section-header" style="font-size:13px; font-weight:900; letter-spacing:1px;">${sec.name || 'Sección'}</div>
                    ${renderSectionBody(sec, currentTransposeSteps, showChordsMode)}
                </div>
            `;
        });
    } else {
        html += `<p style="color:var(--text-muted); text-align:center; padding:40px;">Esta canción no tiene contenido cargado aún.<br><small style="font-size:11px;">Usa el editor para agregar secciones y letra.</small></p>`;
    }

    html += `</div>`;
    panel.innerHTML = html;
}

function shiftTranspose(semitones) {
    currentTransposeSteps += semitones;
    if (currentTransposeSteps > 11) currentTransposeSteps = 11;
    if (currentTransposeSteps < -11) currentTransposeSteps = -11;
    renderChart();
}

function resetTranspose() {
    currentTransposeSteps = 0;
    renderChart();
}

async function deleteSong(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta canción?")) return;
    try {
        const res = await fetch(`/songs/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        if (res.ok) {
            selectedSong = null;
            loadSongs();
            document.getElementById("viewerPanel").innerHTML = `
                <div class="empty-state">
                    <span style="font-size:48px; margin-bottom:16px;">🗑️</span>
                    <p style="font-weight:800; font-size:18px; color:white;">CANCIÓN ELIMINADA</p>
                </div>`;
        } else {
            alert("No se pudo eliminar la canción.");
        }
    } catch (e) {
        alert("Error de conexión al eliminar.");
    }
}

loadSongs();
