// MOTOR DE BASE DE DATOS Y ESTADO DE WORSHIP SESSIONS
export const defaultDB = {
    usuarios: {
        "admin": { password: "can2026**", rol: "admin", nombre: "Carlos Ordaz (Admin)", area: "Sistemas / Dirección" },
        "produccion": { password: "can2026**", rol: "administracion", nombre: "Equipo Producción & Staff", area: "Producción" },
        "pastor": { password: "can2026**", rol: "pastor", nombre: "Pastor General", area: "Administración" },
        "maestro1": { password: "can2026**", rol: "maestro", nombre: "Juan Carlos (Teclado)", area: "Teclado" },
        "maestro2": { password: "can2026**", rol: "maestro", nombre: "Marcos (Batería)", area: "Batería" },
        "pablo": { password: "can2026**", rol: "adoracion", nombre: "Pablo Ensamble", area: "Ensamble" },
        "alumno1": { password: "can2026**", rol: "estudiante", nombre: "Juan Pérez", area: "Teclado", pagoStatus: "solvente", mesesAdeudo: 0, motivoNoPago: "", observacionesMaestro: "Excelente dedicación en clase de teclado. Muy buen tempo y soltura en arpegios.", edad: "21 Años", anosIglesia: "4 Años en C.A.N.", ciclosWS: "2° Ciclo Escolar", bio: "Apasionado tecladista y servidor activo en el ministerio de jóvenes. Enfocado en la excelencia musical y espiritual." },
        "alumno2": { password: "can2026**", rol: "estudiante", nombre: "Ana Gómez", area: "Batería", pagoStatus: "2_pendientes", mesesAdeudo: 2, motivoNoPago: "Solicita prórroga de 15 días por emergencia familiar.", observacionesMaestro: "Muestra gran avance en paradiddles pero requiere afianzar metrónomo.", edad: "19 Años", anosIglesia: "2 Años en C.A.N.", ciclosWS: "1° Ciclo Escolar", bio: "Entusiasta baterista en formación presencial. Destaca por su disciplina en los ensayos generales." },
        "alumno3": { password: "can2026**", rol: "estudiante", nombre: "Luis Flores", area: "Teclado", pagoStatus: "1_pendiente", mesesAdeudo: 1, motivoNoPago: "Pendiente pago de fin de mes.", observacionesMaestro: "Muy buena técnica de digitación y lectura a primera vista.", edad: "24 Años", anosIglesia: "5 Años en C.A.N.", ciclosWS: "3° Ciclo Escolar", bio: "Músico constante con trayectoria en el ensamble principal de la iglesia." },
        "alumno": { password: "can2026**", rol: "estudiante", nombre: "Alumno de Prueba", area: "Teclado", pagoStatus: "solvente", mesesAdeudo: 0, motivoNoPago: "", observacionesMaestro: "Alumno activo y constante.", edad: "20 Años", anosIglesia: "3 Años en C.A.N.", ciclosWS: "2° Ciclo Escolar", bio: "Estudiante comprometido con el crecimiento integral en la academia." },
        "ilopez": { password: "can2026**", rol: "maestro", nombre: "Ivan Lopez", area: "Bajo" },
        "cordaz": { password: "can2026**", rol: "maestro", nombre: "Carlos Ordaz", area: "Batería" },
        "egonzalezg": { password: "can2026**", rol: "maestro", nombre: "Enoc Gonzalez", area: "Batería" },
        "avazquez": { password: "can2026**", rol: "maestro", nombre: "Asael Vazquez", area: "Batería Junior" },
        "aurdapilleta": { password: "can2026**", rol: "maestro", nombre: "Aaron Urdapilleta", area: "Guitarra" },
        "aaviles": { password: "can2026**", rol: "maestro", nombre: "Andrea Aviles", area: "Canto" },
        "mdiaz": { password: "can2026**", rol: "maestro", nombre: "Manuel Diaz", area: "Piano" },
        "fgonzalez": { password: "can2026**", rol: "maestro", nombre: "Fe Gonzalez", area: "Piano" },
        "egonzalez": { password: "can2026**", rol: "pastor", nombre: "Efrain Gonzalez", area: "Pastoral" },
        "mgonzalez": { password: "can2026**", rol: "pastor", nombre: "Martha Gonzalez", area: "Pastoral" }
    },
    canciones: [
        { 
            id: "1", 
            titulo: "Tumbas a Jardines", 
            tono: "B", 
            bpm: "70 BPM",
            autor: "Elevation Worship", 
            linkAcordes: "https://www.lacuerda.net", 
            linkVideo: "https://www.youtube.com", 
            activo: true,
            letra: `[VERSO 1]
El mundo busqué, no pudo llenar
El vacío en mi corazón
Palabras vacías, tesoros sin fin
Tú lo cambiaste todo.

[CORO]
Oh, no hay nadie como Tú
No hay nadie como Tú
Tú cambias mi lamento en baile
Tú das belleza por cenizas
Tú cambias mi dolor en gozo
Tú eres el único que puede salvar.

[VERSO 2]
Saliste a mi encuentro, me diste perdón
Me vestiste de Tu amor
Tú fuiste la gracia que me rescató
Tu sangre me dio salvación.

[PUENTE]
De las tumbas a jardines
Tú haces cosas nuevas
De las tumbas a jardines
Tú eres el Señor.`
        },
        { 
            id: "2", 
            titulo: "Digno de Alabar", 
            tono: "G", 
            bpm: "74 BPM",
            autor: "Phil Wickham", 
            linkAcordes: "https://www.lacuerda.net", 
            linkVideo: "https://www.youtube.com", 
            activo: true,
            letra: `[VERSO 1]
Grandes cosas has hecho Tú
Tú ganaste la cruz por mí
Con poder venciste a la muerte y dolor
Te entregaste por amor.

[CORO]
Eres digno de alabar
Tu nombre exaltado es
Jesús, mi Rey y Salvador
Tuyo es el reino y el poder.

[VERSO 2]
En el valle Tu luz brillará
En la tormenta Tu paz me sostendrá
Ningún temor me podrá mover
En Tu gracia confiaré.`
        },
        { 
            id: "3", 
            titulo: "Hermoso Nombre", 
            tono: "D", 
            bpm: "68 BPM",
            autor: "Hillsong Worship", 
            linkAcordes: "https://www.lacuerda.net", 
            linkVideo: "https://www.youtube.com", 
            activo: true,
            letra: `[VERSO 1]
Tú eras el verbo en el principio
El Unigénito de Dios
El misterio de Tu gloria
Revelado en Tu amor.

[CORO]
Cuán hermoso es Tu nombre
Cuán hermoso es Tu nombre
El nombre de Jesús mi Rey
Cuán hermoso es Tu nombre
Nada se iguala a Él
Cuán hermoso es Tu nombre
El nombre de Jesús.

[VERSO 2]
No me querías en el cielo
Jesús trajiste el cielo a mí
Tu amor fue más fuerte que el pecado
Nada nos separará.`
        },
        { 
            id: "4", 
            titulo: "A una voz", 
            tono: "E", 
            bpm: "128 BPM",
            autor: "Living", 
            linkAcordes: "https://www.lacuerda.net", 
            linkVideo: "https://www.youtube.com", 
            activo: false,
            letra: `[VERSO 1]
Juntos estamos ante Tu presencia
Declarando Tu majestad
Un solo pueblo, un solo cuerpo
Cantando a una sola voz.

[CORO]
A una voz te adoramos
A una voz te cantamos
Digno es el Cordero
Que resucitó y reinó.`
        }
    ],
    calificaciones: {
        "alumno1": { teoria: 85, tecnica: 90, notas: "Muy buen desempeño en acordes mayores y escalas básicas en octavas." },
        "alumno2": { teoria: 70, tecnica: 75, notas: "Requiere repasar el tempo y la subdivisión de corcheas." },
        "alumno3": { teoria: 92, tecnica: 88, notas: "Excelente lectura a primera vista. Seguir practicando arpegios." }
    },
    asistencia: {
        "alumno1": { "2026-08-01": "presente", "2026-08-08": "ausente", "2026-08-15": "presente" },
        "alumno2": { "2026-08-01": "presente", "2026-08-08": "presente", "2026-08-15": "presente" },
        "alumno3": { "2026-08-01": "ausente", "2026-08-08": "presente", "2026-08-15": "presente" }
    },
    materiales: [
        { id: "1", area: "Teclado", titulo: "Escalas Mayores Dinámicas", descripcion: "Estudiar la escala de Do, Sol y Re mayor en octavas consecutivas. Enfocarse en el paso del pulgar.", enlace: "https://youtube.com", fecha: "2026-08-05" },
        { id: "2", area: "Batería", titulo: "Rudimentos de Caja", descripcion: "Ejercicios prácticos de paradiddle a 80-100 BPM en pad de práctica.", enlace: "https://youtube.com", fecha: "2026-08-06" }
    ],
    anuncios: [
        { id: "1", area: "Teclado", contenido: "Traer partitura del setlist impresa y afinado su instrumento para este sábado.", autor: "Juan Carlos (Teclado)", fecha: "2026-08-07" },
        { id: "2", area: "Batería", contenido: "Practicar los rudimentos de bombo a 90 BPM. Habrá evaluación teórica.", autor: "Marcos (Batería)", fecha: "2026-08-08" }
    ],
    ensambleRoles: {
        teclado: "alumno1",
        bateria: "alumno2",
        guitarra: "maestro1",
        bajo: "alumno3",
        canto: "maestro2"
    },
    estatusClases: {
        estado: "normal",
        mensaje: "✅ Próxima Clase: Sábado de 10:00 AM a 1:00 PM • Asistencia Normal.",
        fechaActualizacion: "2026-08-18",
        publicadoPor: "Equipo Producción & Staff"
    },
    anunciosStaff: [
        {
            id: "s1",
            titulo: "Junta Presencial de Docentes",
            contenido: "Estimados maestros, este jueves a las 7:00 PM tendremos junta de coordinación académica previo al fin de semana.",
            fecha: "2026-08-18",
            autor: "Equipo Producción & Staff"
        }
    ],
    tareas: [
        {
            id: "t1",
            area: "Teclado",
            titulo: "Grabar Escala de Do Mayor a 2 Manos",
            descripcion: "Graba un video de 30 a 60 segundos ejecutando la escala de Do Mayor en 2 octavas a 90 BPM con metrónomo.",
            fechaLimite: "2026-08-25",
            maestro: "Juan Carlos (Teclado)"
        },
        {
            id: "t2",
            area: "Batería",
            titulo: "Rudimento Paradiddle en Pad de Práctica",
            descripcion: "Graba un video ejecutando 1 minuto de paradiddles limpios a 100 BPM en tu pad de práctica.",
            fechaLimite: "2026-08-26",
            maestro: "Marcos (Batería)"
        }
    ],
    entregasTareas: {
        "t1_alumno1": {
            id: "e1",
            tareaId: "t1",
            username: "alumno1",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            fechaEntrega: "2026-08-18",
            estado: "calificado",
            calificacion: 95,
            feedback: "¡Excelente tempo y paso de pulgar impecable!"
        }
    },
    ensambleActivo: false,
    ensambleAsignaciones: {
        "1_alumno1": {
            id: "ens_1_alumno1",
            songId: "1",
            username: "alumno1",
            nivel: "Avanzado",
            tempo: "120 BPM",
            tono: "B (Si)",
            compas: "4/4",
            playthroughUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            notes: "Estudiar la entrada del verso 2 a 120 BPM en octavas limpias.",
            maestro: "Juan Carlos (Teclado)"
        }
    },
    notasPastorales: [],
    cursos: []
};

const DB_KEY = 'worship_sessions_db';

export function normalizeRol(rol) {
    if (!rol) return 'estudiante';
    const r = String(rol).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (['alumno', 'alumnos', 'estudiante', 'estudiantes', 'student'].includes(r)) return 'estudiante';
    if (['maestro', 'profesor', 'docente', 'teacher'].includes(r)) return 'maestro';
    if (['pastor', 'pastoral'].includes(r)) return 'pastor';
    if (['produccion', 'staff', 'administracion', 'admin_staff'].includes(r)) return 'administracion';
    if (['adoracion', 'ensamble'].includes(r)) return 'adoracion';
    if (['admin', 'administrador'].includes(r)) return 'admin';
    return r;
}

export function initDB() {
    let db = null;
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) db = JSON.parse(stored);
    } catch (e) {
        console.error("Error reading localStorage DB:", e);
    }

    if (!db || !db.usuarios) {
        db = { ...defaultDB };
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } else {
        let mod = false;
        if (!db.estatusClases) { db.estatusClases = defaultDB.estatusClases; mod = true; }
        if (!db.anunciosStaff) { db.anunciosStaff = defaultDB.anunciosStaff; mod = true; }
        if (!db.tareas) { db.tareas = defaultDB.tareas; mod = true; }
        if (!db.entregasTareas) { db.entregasTareas = defaultDB.entregasTareas; mod = true; }
        if (db.ensambleActivo === undefined) { db.ensambleActivo = false; mod = true; }
        if (!db.ensambleAsignaciones) { db.ensambleAsignaciones = defaultDB.ensambleAsignaciones; mod = true; }
        if (!db.notasPastorales) { db.notasPastorales = []; mod = true; }
        if (!db.canciones || db.canciones.length === 0) { 
            db.canciones = defaultDB.canciones; 
            mod = true; 
        } else {
            db.canciones = db.canciones.map(c => {
                const def = defaultDB.canciones.find(d => d.id === c.id || d.titulo.toLowerCase() === c.titulo?.toLowerCase());
                if (def && (!c.letra || !c.bpm)) {
                    mod = true;
                    return {
                        ...c,
                        bpm: c.bpm || def.bpm,
                        letra: c.letra || def.letra
                    };
                }
                return c;
            });
        }
        
        Object.keys(db.usuarios).forEach(k => {
            const u = db.usuarios[k];
            if (u && u.rol) {
                const norm = normalizeRol(u.rol);
                if (u.rol !== norm) { u.rol = norm; mod = true; }
            }
            if (u && normalizeRol(u.rol) === 'estudiante') {
                if (u.mesesAdeudo === undefined) {
                    u.mesesAdeudo = (u.pagoStatus === '1_pendiente') ? 1 : (u.pagoStatus === '2_pendientes' ? 2 : 0);
                    mod = true;
                }
                if (u.motivoNoPago === undefined) { u.motivoNoPago = ""; mod = true; }
                if (u.desbloqueadoManual === undefined) { u.desbloqueadoManual = false; mod = true; }
                if (u.observacionesMaestro === undefined) { u.observacionesMaestro = "Alumno constante y activo en clase."; mod = true; }
            }
        });

        if (mod) localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return db;
}

export function getDB() {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return initDB();
}

export function saveDB(db) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return true;
    } catch (e) {
        console.error("Error saving DB:", e);
        return false;
    }
}

export function exportDB() {
    const data = JSON.stringify(getDB(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worship_sessions_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function calcularEstadoPago(usuario) {
    if (!usuario) return { status: 'solvente', label: 'Solvente', clase: 'badge-solvente', adeudo: 0 };
    const adeudo = usuario.mesesAdeudo || 0;
    if (adeudo >= 2) return { status: '2_pendientes', label: '2 Meses de Adeudo', clase: 'badge-danger', adeudo };
    if (adeudo === 1) return { status: '1_pendiente', label: '1 Mes Pendiente', clase: 'badge-warning', adeudo };
    return { status: 'solvente', label: 'Solvente', clase: 'badge-solvente', adeudo: 0 };
}
