const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Admin_Carlos:19494678@clustercan.3swcd.mongodb.net/CAN_Database?retryWrites=true&w=majority";
const JWT_SECRET = process.env.JWT_SECRET || "can_worship_secret_2026";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to convert string to ObjectId safely
function toObjectId(id) {
    try {
        if (id && ObjectId.isValid(id) && String(new ObjectId(id)) === String(id)) {
            return new ObjectId(id);
        }
    } catch(e) {}
    return id;
}

let db;
async function connectDB() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db("CAN_Database");
    console.log("MongoDB conectado exitosamente a CAN_Database");
}

function getUserFromToken(req) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
        try {
            return jwt.verify(auth.slice(7), JWT_SECRET);
        } catch (e) {}
    }
    return null;
}

// Helper to populate songId objects inside setlist.songs
function populateSetlistSongs(setlist, songMap) {
    if (!setlist) return setlist;
    if (Array.isArray(setlist.songs)) {
        setlist.songs = setlist.songs.map(item => {
            if (!item) return item;
            if (item.songId && typeof item.songId === "object" && item.songId.name) {
                return item;
            }
            const songRefId = item.songId ? String(item.songId) : null;
            const songObj = songRefId ? songMap.get(songRefId) : null;
            return {
                ...item,
                songId: songObj || (item.songId ? { _id: item.songId, name: "Sin tÃ­tulo" } : null)
            };
        });
    }
    return setlist;
}

// ==================== AUTH & LOGIN ====================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Usuario y contraseÃ±a requeridos" });
        }
        
        const cleanUser = username.trim();
        const user = await db.collection("users").findOne({ 
            username: { $regex: new RegExp(`^${cleanUser}$`, "i") } 
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const token = jwt.sign(
            { id: String(user._id), username: user.username, role: user.role, ministry: user.ministry },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                ministry: user.ministry,
                instrument: user.instrument,
                techBranch: user.techBranch,
                photo: user.photo || null
            }
        });
    } catch (err) {
        console.error("Error en /login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ==================== PROFILE ====================
app.get("/profile", async (req, res) => {
    try {
        const tokenUser = getUserFromToken(req);
        const username = tokenUser ? tokenUser.username : req.query.username;
        if (!username) return res.status(401).json({ error: "No autorizado" });

        const user = await db.collection("users").findOne(
            { username: { $regex: new RegExp(`^${username.trim()}$`, "i") } },
            { projection: { password: 0 } }
        );
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener perfil" });
    }
});

app.post("/profile-update", async (req, res) => {
    try {
        const tokenUser = getUserFromToken(req);
        const username = tokenUser ? tokenUser.username : (req.body.username || req.body.user);
        if (!username) return res.status(401).json({ error: "No autorizado" });

        const updateData = {};
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.instrument !== undefined) updateData.instrument = req.body.instrument;
        if (req.body.photo !== undefined) updateData.photo = req.body.photo;
        if (req.body.password !== undefined && req.body.password.trim() !== "") {
            updateData.password = req.body.password.trim();
        }

        await db.collection("users").updateOne(
            { username: { $regex: new RegExp(`^${username.trim()}$`, "i") } },
            { $set: updateData }
        );

        res.json({ ok: true, message: "Perfil actualizado correctamente" });
    } catch (err) {
        console.error("Error en /profile-update:", err);
        res.status(500).json({ error: "Error al actualizar perfil" });
    }
});

// ==================== USERS (GESTIÃ“N DE USUARIOS) ====================
app.get("/users", async (req, res) => {
    try {
        const users = await db.collection("users").find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error("Error en GET /users:", err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

app.post("/users", async (req, res) => {
    try {
        const newUser = {
            ...req.body,
            username: req.body.username ? req.body.username.trim() : "",
            password: req.body.password ? req.body.password : "can2026**",
            createdAt: new Date()
        };
        const result = await db.collection("users").insertOne(newUser);
        res.json({ _id: result.insertedId, ok: true });
    } catch (err) {
        console.error("Error en POST /users:", err);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const user = await db.collection("users").findOne({ 
            $or: [{ _id: queryId }, { username: req.params.id }] 
        });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

const handleUserUpdate = async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const updateData = { ...req.body };
        delete updateData._id;

        await db.collection("users").updateOne(
            { $or: [{ _id: queryId }, { username: req.params.id }] },
            { $set: updateData }
        );
        res.json({ ok: true });
    } catch (err) {
        console.error("Error actualizando usuario:", err);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
};
app.put("/users/:id", handleUserUpdate);
app.patch("/users/:id", handleUserUpdate);

app.delete("/users/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        await db.collection("users").deleteOne({
            $or: [{ _id: queryId }, { username: req.params.id }]
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

// ==================== SETLISTS (SERVICIOS PROGRAMADOS) ====================
app.get("/setlists", async (req, res) => {
    try {
        const filter = {};
        if (req.query.ministry) {
            filter.ministry = req.query.ministry;
        }
        const setlists = await db.collection("setlists").find(filter).sort({ date: 1, createdAt: -1 }).toArray();
        const songs = await db.collection("songs").find({}).toArray();
        const songMap = new Map();
        songs.forEach(s => songMap.set(String(s._id), s));

        const populated = setlists.map(s => populateSetlistSongs(s, songMap));
        res.json(populated);
    } catch (err) {
        console.error("Error en GET /setlists:", err);
        res.status(500).json({ error: "Error al obtener setlists" });
    }
});

app.get("/setlists/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const setlist = await db.collection("setlists").findOne({ _id: queryId });
        if (!setlist) return res.status(404).json({ error: "Setlist no encontrado" });

        const songs = await db.collection("songs").find({}).toArray();
        const songMap = new Map();
        songs.forEach(s => songMap.set(String(s._id), s));

        const populated = populateSetlistSongs(setlist, songMap);
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener setlist" });
    }
});

async function createNotification({ type, title, message, setlistId, songId, creatorUsername }) {
    try {
        if (!db) return;
        const newNotif = {
            type: type || "setlist_created",
            title: title || "Notificación de CAN Alabanza",
            message: message || "",
            createdAt: new Date(),
            setlistId: setlistId ? String(setlistId) : null,
            songId: songId ? String(songId) : null,
            readBy: creatorUsername ? [creatorUsername] : []
        };
        await db.collection("notifications").insertOne(newNotif);
    } catch (e) {
        console.error("Error al crear notificación:", e);
    }
}

app.post("/setlists", async (req, res) => {
    try {
        const newSetlist = {
            ...req.body,
            createdAt: new Date()
        };
        const result = await db.collection("setlists").insertOne(newSetlist);

        const tokenUser = getUserFromToken(req);
        const creatorUsername = tokenUser ? tokenUser.username : "";
        const title = newSetlist.title || newSetlist.name || newSetlist.date || "Nuevo Servicio Programado";
        const meetingType = newSetlist.meetingType || "Servicio";

        await createNotification({
            type: "setlist_created",
            title: `📅 Nuevo Setlist Publicado`,
            message: `Se ha publicado el setlist "${title}" (${meetingType}). Revisa tus turnos de asistencia.`,
            setlistId: result.insertedId,
            creatorUsername
        });

        res.json({ _id: result.insertedId, ok: true });
    } catch (err) {
        console.error("Error en POST /setlists:", err);
        res.status(500).json({ error: "Error al crear setlist" });
    }
});

const handleSetlistUpdate = async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const updateData = { ...req.body };
        delete updateData._id;

        await db.collection("setlists").updateOne(
            { _id: queryId },
            { $set: updateData }
        );

        const tokenUser = getUserFromToken(req);
        const creatorUsername = tokenUser ? tokenUser.username : "";
        const title = updateData.title || updateData.name || updateData.date || "Servicio Programado";

        await createNotification({
            type: "setlist_created",
            title: `📅 Setlist Actualizado`,
            message: `Se han actualizado las canciones o los turnos del setlist "${title}".`,
            setlistId: queryId,
            creatorUsername
        });

        res.json({ ok: true });
    } catch (err) {
        console.error("Error en PUT/PATCH /setlists/:id:", err);
        res.status(500).json({ error: "Error al actualizar setlist" });
    }
};
app.put("/setlists/:id", handleSetlistUpdate);
app.patch("/setlists/:id", handleSetlistUpdate);

app.delete("/setlists/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        await db.collection("setlists").deleteOne({ _id: queryId });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar setlist" });
    }
});

// Registrar ausencias
const handleAbsence = async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const tokenUser = getUserFromToken(req);
        const username = (tokenUser && tokenUser.username) ? tokenUser.username : req.body.username;
        const memberName = (tokenUser && tokenUser.name) ? tokenUser.name : (req.body.name || req.body.nombre || username || "Un miembro");
        const reason = req.body.reason || req.body.motivo || req.body.absenceReason || "Sin motivo especificado";
        
        if (username) {
            await db.collection("setlists").updateOne(
                { _id: queryId },
                { $set: { [`absences.${username}`]: req.body } }
            );
        } else {
            await db.collection("setlists").updateOne(
                { _id: queryId },
                { $set: req.body }
            );
        }

        await createNotification({
            type: "absence_reported",
            title: `⚠️ Aviso de Inasistencia`,
            message: `${memberName} ha notificado inasistencia: "${reason}".`,
            setlistId: queryId,
            creatorUsername: username
        });

        res.json({ ok: true });
    } catch (err) {
        console.error("Error en /setlists/:id/absence:", err);
        res.status(500).json({ error: "Error al registrar ausencia" });
    }
};
app.post("/setlists/:id/absence", handleAbsence);
app.patch("/setlists/:id/absence", handleAbsence);
app.put("/setlists/:id/absence", handleAbsence);

// Tech Ready
const handleTechReady = async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        await db.collection("setlists").updateOne(
            { _id: queryId },
            { $set: { techReady: req.body.techReady !== undefined ? req.body.techReady : true } }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar techReady" });
    }
};
app.post("/setlists/:id/tech-ready", handleTechReady);
app.patch("/setlists/:id/tech-ready", handleTechReady);
app.put("/setlists/:id/tech-ready", handleTechReady);

// ==================== SONGS ====================
app.get("/songs", async (req, res) => {
    try {
        const songs = await db.collection("songs").find({}).sort({ name: 1, title: 1 }).toArray();
        res.json(songs);
    } catch (err) {
        console.error("Error en GET /songs:", err);
        res.status(500).json({ error: "Error al obtener canciones" });
    }
});

app.get("/songs/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const song = await db.collection("songs").findOne({ _id: queryId });
        if (!song) return res.status(404).json({ error: "CanciÃ³n no encontrada" });
        res.json(song);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener canciÃ³n" });
    }
});

app.post("/songs", async (req, res) => {
    try {
        const newSong = { ...req.body, createdAt: new Date() };
        const result = await db.collection("songs").insertOne(newSong);

        const tokenUser = getUserFromToken(req);
        const creatorUsername = tokenUser ? tokenUser.username : "";
        const songName = newSong.name || "Nueva Canción";
        const artist = newSong.artist || "Artista";

        await createNotification({
            type: "song_created",
            title: `🎵 Nueva Canción Agregada`,
            message: `Se agregó "${songName}" (${artist}) al repertorio del equipo.`,
            songId: result.insertedId,
            creatorUsername
        });

        res.json({ _id: result.insertedId, ok: true });
    } catch (err) {
        console.error("Error en POST /songs:", err);
        res.status(500).json({ error: "Error al guardar canción" });
    }
});

const handleSongUpdate = async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const updateData = { ...req.body };
        delete updateData._id;

        await db.collection("songs").updateOne({ _id: queryId }, { $set: updateData });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar canciÃ³n" });
    }
};
app.put("/songs/:id", handleSongUpdate);
app.patch("/songs/:id", handleSongUpdate);

app.delete("/songs/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        await db.collection("songs").deleteOne({ _id: queryId });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar canciÃ³n" });
    }
});

// ==================== REQUISITIONS ====================
app.get("/requisitions", async (req, res) => {
    try {
        const reqs = await db.collection("requisitions").find({}).sort({ createdAt: -1 }).toArray();
        res.json(reqs);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener requisiciones" });
    }
});

app.get("/requisitions/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const reqItem = await db.collection("requisitions").findOne({ _id: queryId });
        if (!reqItem) return res.status(404).json({ error: "RequisiciÃ³n no encontrada" });
        res.json(reqItem);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener requisiciÃ³n" });
    }
});

app.post("/requisitions", async (req, res) => {
    try {
        const newReq = { ...req.body, createdAt: new Date() };
        const result = await db.collection("requisitions").insertOne(newReq);
        res.json({ _id: result.insertedId, ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al crear requisiciÃ³n" });
    }
});

const handleReqUpdate = async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        const updateData = { ...req.body };
        delete updateData._id;

        await db.collection("requisitions").updateOne({ _id: queryId }, { $set: updateData });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar requisiciÃ³n" });
    }
};
app.put("/requisitions/:id", handleReqUpdate);
app.patch("/requisitions/:id", handleReqUpdate);

app.delete("/requisitions/:id", async (req, res) => {
    try {
        const queryId = toObjectId(req.params.id);
        await db.collection("requisitions").deleteOne({ _id: queryId });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar requisiciÃ³n" });
    }
});

// ==================== NOTIFICATIONS ====================
app.get("/notifications", async (req, res) => {
    try {
        const notifs = await db.collection("notifications").find({}).sort({ createdAt: -1 }).toArray();
        res.json(notifs || []);
    } catch (err) {
        res.json([]);
    }
});

app.post("/notifications/read-all", async (req, res) => {
    try {
        await db.collection("notifications").updateMany({}, { $set: { read: true } });
        res.json({ ok: true });
    } catch (err) {
        res.json({ ok: true });
    }
});

// Static files with no-cache headers for HTML files
app.use("/alabanza", express.static(path.join(__dirname, "alabanza"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));
app.use(express.static(path.join(__dirname, "dist"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));
app.use(express.static(path.join(__dirname)));

// SPA Fallback for unknown routes
app.get("*", (req, res) => {
    if (req.path.startsWith("/alabanza")) {
        res.sendFile(path.join(__dirname, "alabanza", "index.html"));
    } else {
        const distIndex = path.join(__dirname, "dist", "index.html");
        if (require("fs").existsSync(distIndex)) {
            res.sendFile(distIndex);
        } else {
            res.sendFile(path.join(__dirname, "index.html"));
        }
    }
});

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`Servidor CAN corriendo en puerto ${PORT}`));
    })
    .catch(err => {
        console.error("Error al conectar a MongoDB:", err);
        process.exit(1);
    });
