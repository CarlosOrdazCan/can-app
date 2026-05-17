const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
const SECRET = "can-naucalpan-2026-secure-key";

io.on('connection', (socket) => {
    console.log('Nuev@ conectad@ a Socket.io:', socket.id);
    socket.on('liveStructureChange', (data) => {
        // Retransmitimos a todos los clientes (especialmente cabina de Producción)
        socket.broadcast.emit('liveStructureChange', data);
    });
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.static(path.join(__dirname, "public")));

// CONEXIÓN A BASE DE DATOS
const mongoURI = "mongodb+srv://Admin_Carlos:19494678@clustercan.3swcd.mongodb.net/CAN_Database?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("🔥 C.A.N. Database Conectada"))
    .catch(err => console.error("Error de conexión:", err));

// --- MODELOS DE DATOS ---

const User = mongoose.model("User", new mongoose.Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String,
    instrument: String,
    ministry: { type: String, default: "Principal" },
    techBranch: { type: String, default: "" }, 
    photo: String,
    phone: String,
    bio: String,
    audioChannels: { type: mongoose.Schema.Types.Mixed, default: [] },
    personalMix: { type: [Number], default: [] }
}));

const Song = mongoose.model("Song", new mongoose.Schema({
    name: String, 
    artist: String, 
    key: String, 
    tempo: String, 
    duration: Number, 
    referenceLink: String,
    sections: [{ name: String, chords: [String], lyrics: String }]
}));

const Setlist = mongoose.model("Setlist", new mongoose.Schema({
    name: String, 
    date: String, 
    timeSlots: [String], 
    songs: [{ songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' }, setlistKey: String }],
    team: [{ memberId: String, name: String, role: String, attendance: Object }], 
    prodTeam: [{ 
        memberId: String, 
        name: String, 
        role: String, 
        focus: { type: String, default: "" }, 
        ready: { type: Boolean, default: false },
        attendance: { type: String, default: "Sirve" },
        timeSlot: { type: String, default: "Todas" } 
    }],
    runOfService: [{ time: String, activity: String, cabinaNotes: String, videoNotes: String }], 
    postMortemNotes: { type: String, default: "" }, 
    archived: { type: Boolean, default: false },
    ministry: { type: String, default: "Principal" }
}));

// --- RUTA MÁGICA DE IA (MÉTODO SEGURO CON VARIABLES DE ENTORNO) ---

app.post("/api/parse-song", async (req, res) => {
    try {
        console.log("1. Recibiendo petición a IA...");
        const { rawText } = req.body;
        
        if (!rawText) throw new Error("El texto llegó vacío al servidor.");

        const prompt = `Eres un director musical experto. Analiza el siguiente texto de una canción y conviértelo a un formato JSON estricto.
        Reglas de formato:
        1. Identifica el nombre de la canción, el artista y el tono (key). Si no lo sabes, pon "".
        2. Divide por secciones (INTRO, VERSO, CORO, etc.).
        3. MUY IMPORTANTE: Coloca los acordes entre paréntesis () dentro de la letra, exactamente antes de la sílaba donde cambian. Ejemplo: "(F)Tu gracia mi (C)culpa lavó".
        4. Si una sección es instrumental, coloca los acordes en el campo 'lyrics'.
        5. Responde SOLO con el JSON válido, sin explicaciones ni formato de markdown extra. Estructura esperada:
        { "name": "", "artist": "", "key": "", "sections": [ { "name": "", "chords": [], "lyrics": "" } ] }
        
        Texto a procesar:
        ${rawText}`;

        console.log("2. Enviando texto a Gemini vía API Rest Directa...");
        
        // 🔥 AQUÍ ESTÁ LA MAGIA DE SEGURIDAD 🔥
        // El servidor busca la llave en tus variables de entorno, no en el código.
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            throw new Error("No se encontró la llave GEMINI_API_KEY en las variables de entorno del servidor.");
        }
        
        // EL MODELO GRATUITO OFICIAL (gemini-1.5-flash)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        // PETICIÓN DIRECTA NATIVA
        const geminiRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            throw new Error(data.error?.message || "Google rechazó la conexión.");
        }
        
        console.log("3. Respuesta cruda de Gemini recibida exitosamente.");
        
        // Extraemos el texto
        const text = data.candidates[0].content.parts[0].text;
        
        // Limpiamos el formato markdown
        let jsonString = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const parsedData = JSON.parse(jsonString);
        
        console.log("4. JSON parseado exitosamente. Enviando al frontend.");
        res.json(parsedData);
    } catch (error) {
        console.error("❌ ERROR DETALLADO EN IA:", error);
        res.status(500).json({ 
            error: "Hubo un error en el servidor procesando la canción", 
            detalle: error.message 
        });
    }
});

// --- EXTRAER DURACIÓN YOUTUBE ---
app.post("/api/yt-info", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.json({ duration: null });
        
        const fetchRes = await fetch(url);
        const html = await fetchRes.text();
        const match = html.match(/"approxDurationMs":"(\d+)"/);
        
        if (match && match[1]) {
            const durationMs = parseInt(match[1], 10);
            const minutes = Math.floor(durationMs / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            const durationStr = `${minutes}.${seconds < 10 ? '0' : ''}${seconds}`;
            return res.json({ duration: parseFloat(durationStr) });
        }
        res.json({ duration: null });
    } catch (e) {
        console.error("Error extrañendo YouTube info:", e);
        res.json({ duration: null });
    }
});

// --- RUTAS DE AUTENTICACIÓN ---

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const token = jwt.sign({ 
            id: user._id, 
            role: user.role, 
            ministry: user.ministry, 
            techBranch: user.techBranch 
        }, SECRET);
        res.json({ token, user });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).send("Acceso denegado");
        const decoded = jwt.verify(token, SECRET);
        res.json(await User.findById(decoded.id));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/profile-update", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);
        const { password, ...updateData } = req.body;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(decoded.id, updateData, { new: true });
        res.json(user);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- CRUD DE USUARIOS ---

app.get("/users", async (req, res) => { 
    try { res.json(await User.find()); } catch(e) { res.status(500).json({error:e.message}); } 
});

app.post("/users", async (req, res) => {
    try {
        const { password, ...data } = req.body;
        data.password = await bcrypt.hash(password, 10);
        res.json(await User.create(data));
    } catch(e) { res.status(500).json({error:e.message}); }
});

app.put("/users/:id", async (req, res) => {
    try {
        const { password, ...data } = req.body;
        if(password) data.password = await bcrypt.hash(password, 10);
        res.json(await User.findByIdAndUpdate(req.params.id, data, { new: true }));
    } catch(e) { res.status(500).json({error:e.message}); }
});

app.delete("/users/:id", async (req, res) => { 
    try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch(e) { res.status(500).json({error:e.message}); } 
});

// --- CRUD DE CANCIONES ---

app.get("/songs", async (req, res) => { 
    try { res.json(await Song.find()); } catch(e) { res.status(500).json({error:e.message}); } 
});

app.post("/songs", async (req, res) => { 
    try { res.json(await Song.create(req.body)); } catch(e) { res.status(500).json({error:e.message}); } 
});

app.put("/songs/:id", async (req, res) => { 
    try { res.json(await Song.findByIdAndUpdate(req.params.id, req.body)); } catch(e) { res.status(500).json({error:e.message}); } 
});

app.delete("/songs/:id", async (req, res) => { 
    try { await Song.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch(e) { res.status(500).json({error:e.message}); } 
});

// --- CRUD DE SETLISTS ---

app.get("/setlists", async (req, res) => { 
    try { res.json(await Setlist.find().populate('songs.songId')); } 
    catch(e){ res.status(500).json({error:e.message});} 
});

app.post("/setlists", async (req, res) => { 
    try { res.json(await Setlist.create(req.body)); } 
    catch(e){ res.status(500).json({error:e.message});} 
});

app.put("/setlists/:id", async (req, res) => { 
    try { res.json(await Setlist.findByIdAndUpdate(req.params.id, req.body)); } 
    catch(e){ res.status(500).json({error:e.message});} 
});

app.delete("/setlists/:id", async (req, res) => { 
    try { await Setlist.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch(e) { res.status(500).json({error:e.message}); } 
});

// INICIO DEL SERVIDOR
server.listen(PORT, () => console.log(`🚀 C.A.N. Engine operativo en puerto ${PORT}`));
