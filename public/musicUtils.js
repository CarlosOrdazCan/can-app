/* =========================================================
   C.A.N. ENGINE - UTILIDADES MUSICALES (BEMOLES COMPATIBLE)
   ========================================================= */

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatToSharp = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#", "Cb": "B", "Fb": "E" };

/**
 * Transporta un acorde individual
 * @param {string} chord - El acorde original (ej: Bb, G#m7)
 * @param {number} steps - Cantidad de semitonos a mover
 */
function transposeChord(chord, steps) {
    if (!chord || steps === 0) return chord;
    
    // 1. Normalizar bemoles a sostenidos para la lógica interna
    let normalized = chord.replace(/[A-G]b/g, match => flatToSharp[match] || match);

    // 2. Encontrar la nota base y transportarla
    return normalized.replace(/[A-G]#?/g, (match) => {
        const i = notes.indexOf(match);
        if (i === -1) return match;
        let newIndex = (i + steps) % 12;
        if (newIndex < 0) newIndex += 12; // Evitar índices negativos
        return notes[newIndex];
    });
}

/**
 * Calcula los semitonos de distancia entre dos tonos
 * @param {string} from - Tono original de la canción
 * @param {string} to - Tono deseado para el setlist
 */
function getStepsBetween(from, to) {
    if (!from || !to) return 0;
    
    // Extraer solo la raíz (ignorar m, 7, sus4, etc)
    const pureFrom = from.match(/^[A-G][b#]?/)?.[0] || from;
    const pureTo = to.match(/^[A-G][b#]?/)?.[0] || to;

    // Convertir bemoles a sostenidos para comparar en la escala
    const normFrom = flatToSharp[pureFrom] || pureFrom;
    const normTo = flatToSharp[pureTo] || pureTo;
    
    const iFrom = notes.indexOf(normFrom);
    const iTo = notes.indexOf(normTo);
    
    if (iFrom === -1 || iTo === -1) return 0;
    
    let steps = iTo - iFrom;
    if (steps < 0) steps += 12; // Siempre hacia arriba
    return steps;
}
