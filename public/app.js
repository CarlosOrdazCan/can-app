// ===== CONFIG =====
const API = "http://localhost:3000";
const token = localStorage.getItem("token");

// ===== VALIDAR LOGIN =====
if (!token) {
  window.location = "login.html";
}

// ===== ESPERAR A QUE CARGUE =====
window.onload = () => {

  document.getElementById("btnAdd").addEventListener("click", addSection);

};

// ===== AGREGAR SECCION =====
function addSection() {

  console.log("🔥 SECCION OK");

  const container = document.getElementById("sections");

  const div = document.createElement("div");
  div.className = "section-block";

  div.innerHTML = `
    <select class="section-type">
      <option>Intro</option>
      <option>Verso</option>
      <option>Coro</option>
      <option>Puente</option>
      <option>Tag</option>
      <option>Outro</option>
      <option>Personalizado</option>
    </select>

    <input class="custom-name" placeholder="Nombre personalizado" style="display:none">

    <input class="chords" placeholder="Ej: C-D-Em-G">

    <hr>
  `;

  const select = div.querySelector(".section-type");
  const custom = div.querySelector(".custom-name");

  select.addEventListener("change", () => {
    if (select.value === "Personalizado") {
      custom.style.display = "block";
    } else {
      custom.style.display = "none";
    }
  });

  container.appendChild(div);
}

// ===== GUARDAR =====
async function saveSong() {

  const name = document.getElementById("name").value;
  const artist = document.getElementById("artist").value;
  const key = document.getElementById("key").value;
  const tempo = document.getElementById("tempo").value;

  const sectionsDOM = document.querySelectorAll(".section-block");

  const sections = [];

  sectionsDOM.forEach(sec => {

    const type = sec.querySelector(".section-type").value;
    const custom = sec.querySelector(".custom-name").value;
    const chords = sec.querySelector(".chords").value;

    sections.push({
      type: type === "Personalizado" ? custom : type,
      chords: [chords]
    });
  });

  const song = { name, artist, key, tempo, sections };

  try {

    const res = await fetch(`${API}/songs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(song)
    });

    if (res.status === 401) {
      alert("Sesión expirada");
      localStorage.clear();
      window.location = "login.html";
      return;
    }

    if (!res.ok) {
      const txt = await res.text();
      alert(txt);
      return;
    }

    alert("Canción guardada 🔥");
    window.location = "overview.html";

  } catch (err) {
    console.error(err);
  }
}