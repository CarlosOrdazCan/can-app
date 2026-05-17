const API = "http://localhost:3000"; // Reemplaza con tu URL real si usas la nube
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

function addSection() {
  const container = document.getElementById("sections");
  const div = document.createElement("div");
  div.className = "glass-card section-block";
  div.style.marginBottom = "15px";
  
  div.innerHTML = `
    <div style="display:flex; gap:10px; margin-bottom:10px">
      <select class="section-type" style="width:30%">
        <option>Intro</option><option>Verso</option><option>Coro</option>
        <option>Puente</option><option>Outro</option>
      </select>
      <input class="chords" placeholder="Acordes (Ej: G D Em C)" style="flex-grow:1">
      <button onclick="this.parentElement.parentElement.remove()" class="secondary">✕</button>
    </div>
  `;
  container.appendChild(div);
}

async function saveSong() {
  const sectionBlocks = document.querySelectorAll(".section-block");
  const sections = Array.from(sectionBlocks).map(block => ({
    type: block.querySelector(".section-type").value,
    // Convertimos el string a Array para que el player pueda transportarlos
    chords: block.querySelector(".chords").value.split(" ").filter(c => c.trim() !== "")
  }));

  const songData = {
    name: document.getElementById("name").value,
    artist: document.getElementById("artist").value,
    key: document.getElementById("key").value,
    tempo: document.getElementById("tempo").value,
    sections: sections
  };

  const res = await fetch(`${API}/songs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(songData)
  });

  if (res.ok) {
    window.location.href = "overview.html";
  } else {
    alert("Error al guardar. Revisa que todos los campos estén llenos.");
  }
}