import React, { useState } from 'react';
import { useWorship } from '../../../services/WorshipContext';
import { calcularEstadoPago, normalizeRol } from '../../../services/worshipDb';
import PlaybackStudioApp from '../../common/PlaybackStudioApp';

export default function ProduccionView() {
    const { db, updateDb, activeSubview, setActiveSubview, showToast } = useWorship();
    const currentSub = activeSubview || 'panel';

    // ESTADO PARA BÚSQUEDA Y SELECCIÓN DE REPERTORIO DE CANCIONES
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSongLyrics, setSelectedSongLyrics] = useState(null);
    const [lyricsFontSize, setLyricsFontSize] = useState(1.1); // rem font scale
    const [editingSong, setEditingSong] = useState(null);
    const [editForm, setEditForm] = useState({ titulo: '', autor: '', tono: '', bpm: '', letra: '' });

    // ESTADO PLANTILLAS DE ESTATUS DE CLASES
    const [estatusEstado, setEstatusEstado] = useState(db.estatusClases?.estado || 'normal');
    const [estatusMensaje, setEstatusMensaje] = useState(db.estatusClases?.mensaje || '✅ Próxima Clase: Sábado de 10:00 AM a 1:00 PM • Asistencia Normal.');
    const [nuevoAnuncio, setNuevoAnuncio] = useState({ titulo: '', contenido: '' });

    // ESTADO DE CONTROLES DE CABINA PROPRESENTER
    const [proState, setProState] = useState({
        outputActive: true,
        stageDisplay: true,
        currentPreset: 'Alabanza & Ensamble',
        liveMessage: '',
        messageActive: false
    });

    const plantillasEstatus = [
        { label: '✅ Confirmar Clases Presenciales', estado: 'normal', msg: '✅ Próxima Clase: Sábado de 10:00 AM a 1:00 PM • Asistencia Normal.' },
        { label: '❌ Cancelar por Feriado / Festividad', estado: 'suspendida', msg: '❌ Clases Suspendidas por asueto/festivo oficial. Nos reincorporamos el siguiente sábado.' },
        { label: '⚠️ Cambio de Horario o Aula', estado: 'alerta', msg: '⚠️ Atención Alumnos: La clase del sábado se traslada al Auditorio Principal a las 11:00 AM.' },
        { label: '📊 Evaluación Especial de Ciclo', estado: 'alerta', msg: '📊 Evaluación General: Traer instrumento afinado y partituras para examen de fin de ciclo.' }
    ];

    const aplicarPlantilla = (p) => {
        setEstatusEstado(p.estado);
        setEstatusMensaje(p.msg);
        showToast('Plantilla aplicada. Presiona Publicar para confirmar.', 'info');
    };

    const students = Object.entries(db.usuarios || {})
        .filter(([_, u]) => normalizeRol(u.rol) === 'estudiante')
        .map(([k, u]) => ({ key: k, ...u }));

    const canciones = db.canciones || [];
    const filteredSongs = canciones.filter(c => {
        const query = searchTerm.toLowerCase();
        return c.titulo?.toLowerCase().includes(query) || c.autor?.toLowerCase().includes(query) || c.tono?.toLowerCase().includes(query);
    });

    const handleActualizarEstatus = (e) => {
        e.preventDefault();
        updateDb(prev => ({
            ...prev,
            estatusClases: {
                estado: estatusEstado,
                mensaje: estatusMensaje,
                fechaActualizacion: new Date().toISOString().slice(0, 10),
                publicadoPor: 'Equipo Producción & Staff'
            }
        }));
        showToast('Estatus de clases publicado exitosamente', 'success');
    };

    const handlePublicarAnuncio = (e) => {
        e.preventDefault();
        if (!nuevoAnuncio.titulo || !nuevoAnuncio.contenido) return;

        const an = {
            id: 's_' + Date.now(),
            ...nuevoAnuncio,
            fecha: new Date().toISOString().slice(0, 10),
            autor: 'Equipo Producción & Staff'
        };

        updateDb(prev => ({
            ...prev,
            anunciosStaff: [an, ...(prev.anunciosStaff || [])]
        }));

        setNuevoAnuncio({ titulo: '', contenido: '' });
        showToast('Anuncio publicado al equipo', 'success');
    };

    const handleCambiarAdeudo = (username, meses) => {
        updateDb(prev => ({
            ...prev,
            usuarios: {
                ...prev.usuarios,
                [username]: {
                    ...prev.usuarios[username],
                    mesesAdeudo: meses
                }
            }
        }));
        showToast(`Adeudo de @${username} actualizado`, 'info');
    };

    const handleSaveSongLyrics = (e) => {
        e.preventDefault();
        if (!editForm.titulo) return;

        updateDb(prev => {
            const list = [...(prev.canciones || [])];
            if (editingSong) {
                const idx = list.findIndex(c => c.id === editingSong.id);
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...editForm };
                }
            } else {
                list.push({
                    id: 'song_' + Date.now(),
                    ...editForm,
                    activo: true
                });
            }
            return { ...prev, canciones: list };
        });

        showToast(editingSong ? 'Letra de canción actualizada' : 'Nueva canción agregada al repertorio', 'success');
        setEditingSong(null);
        setEditForm({ titulo: '', autor: '', tono: '', bpm: '', letra: '' });
    };

    const handleCopyLyrics = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        showToast('Letra copiada al portapapeles para ProPresenter', 'success');
    };

    return (
        <div id="view-produccion" className="app-view animate-fade-in">
            {/* SUB-NAVEGACIÓN SUPERIOR DE PRODUCCIÓN & CABINA */}
            <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
                background: 'rgba(18, 20, 32, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '8px 12px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {[
                    { id: 'panel', label: 'Panel Cabina & ProPresenter', icon: 'fas fa-desktop' },
                    { id: 'repertorio', label: 'Repertorio de Canciones', icon: 'fas fa-music' },
                    { id: 'estatus', label: 'Estatus Clases', icon: 'fas fa-calendar-check' },
                    { id: 'anuncios', label: 'Anuncios Staff', icon: 'fas fa-bullhorn' },
                    { id: 'colegiaturas', label: 'Control Colegiaturas', icon: 'fas fa-file-invoice-dollar' },
                    { id: 'playback', label: 'Sala de Ensayo (Stems)', icon: 'fas fa-sliders-h' }
                ].map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSubview(item.id)}
                        style={{
                            background: currentSub === item.id ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.04)',
                            color: '#ffffff',
                            border: currentSub === item.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.06)',
                            padding: '9px 16px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: currentSub === item.id ? '0 4px 14px rgba(59, 130, 246, 0.4)' : 'none'
                        }}
                    >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* SUBVIEW 1: PANEL DE CONTROL DE CABINA & PROPRESENTER */}
            {currentSub === 'panel' && (
                <div className="produccion-subview animate-fade-in">
                    {/* BANNER DE ESTATUS DE CABINA */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '16px',
                        marginBottom: '1.5rem'
                    }}>
                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #10b981' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                <i className="fas fa-desktop"></i>
                            </div>
                            <div>
                                <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>Servidor ProPresenter</small>
                                <strong style={{ color: '#fff', fontSize: '1.05rem' }}>ONLINE • Conectado</strong>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #3b82f6' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                <i className="fas fa-tv"></i>
                            </div>
                            <div>
                                <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>Stage Display / Músicos</small>
                                <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Sincronizado (HDMI 2)</strong>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #8b5cf6' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                <i className="fas fa-sliders-h"></i>
                            </div>
                            <div>
                                <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>Consola Audio & Streams</small>
                                <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Dante Main Net OK</strong>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN DE CONTROLES RÁPIDOS DE PROPRESENTER & SERVICIO */}
                    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                        <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
                            <h3 style={{ margin: 0 }}>
                                <i className="fas fa-sliders-h" style={{ color: '#3b82f6', marginRight: '8px' }}></i> 
                                Control Central ProPresenter & Pantallas del Auditorio
                            </h3>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => setActiveSubview('repertorio')}
                            >
                                <i className="fas fa-music" style={{ marginRight: '6px' }}></i> Ir al Repertorio de Canciones
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                            {/* SALIDAS PANTALLAS */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#60a5fa' }}>
                                    <i className="fas fa-tv" style={{ marginRight: '8px' }}></i> Estado de Salidas ProPresenter
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.88rem' }}>Proyección Pantalla Principal:</span>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${proState.outputActive ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => {
                                                setProState(p => ({ ...p, outputActive: !p.outputActive }));
                                                showToast(`Proyección principal ${!proState.outputActive ? 'ACTIVADA' : 'DESACTIVADA'}`, 'info');
                                            }}
                                        >
                                            {proState.outputActive ? '● EN VIVO' : '○ LIMPIA / OFF'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.88rem' }}>Monitor de Confianza (Stage Display):</span>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${proState.stageDisplay ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => {
                                                setProState(p => ({ ...p, stageDisplay: !p.stageDisplay }));
                                                showToast(`Stage display ${!proState.stageDisplay ? 'ACTIVADO' : 'DESACTIVADO'}`, 'info');
                                            }}
                                        >
                                            {proState.stageDisplay ? '● ACTIVO' : '○ PAUSADO'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* PRESETS DE ILUMINACIÓN Y MEDIOS */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#10b981' }}>
                                    <i className="fas fa-lightbulb" style={{ marginRight: '8px' }}></i> Presets de Servicio / Iluminación
                                </h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {['Alabanza & Ensamble', 'Predicación', 'Llamado / Ministración', 'Ofrenda & Avisos'].map(preset => (
                                        <button
                                            key={preset}
                                            type="button"
                                            className={`btn btn-sm ${proState.currentPreset === preset ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => {
                                                setProState(p => ({ ...p, currentPreset: preset }));
                                                showToast(`Preset de escena cambiado a: ${preset}`, 'success');
                                            }}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AVISO EN PANTALLA EN VIVO */}
                        <div style={{ marginTop: '1.2rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#fbbf24', marginBottom: '8px' }}>
                                <i className="fas fa-comment-alt-dots" style={{ marginRight: '6px' }}></i> Mensaje en Pantalla Auditorio (Ticker / Alerta Rápidas):
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej. Autos mal estacionados en fila 2... o Salón de niños listo."
                                    value={proState.liveMessage}
                                    onChange={(e) => setProState({ ...proState, liveMessage: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (!proState.liveMessage) return;
                                        setProState(p => ({ ...p, messageActive: true }));
                                        showToast(`Mensaje enviado a pantalla: "${proState.liveMessage}"`, 'success');
                                    }}
                                >
                                    Lanzar Alerta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBVIEW 2: REPERTORIO DE CANCIONES (SIN ACORDES - PURA LISTA Y VER LETRAS) */}
            {currentSub === 'repertorio' && (
                <div className="produccion-subview animate-fade-in">
                    <div className="glass-panel">
                        <div className="panel-header" style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>
                                    <i className="fas fa-music" style={{ color: '#3b82f6', marginRight: '8px' }}></i> 
                                    Repertorio de Canciones (Letras de Producción)
                                </h3>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                    Lista de canciones sin acordes. Haz clic en cualquier canción para abrir su letra completa.
                                </span>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setEditingSong(null);
                                    setEditForm({ titulo: '', autor: '', tono: 'C', bpm: '70 BPM', letra: '' });
                                }}
                            >
                                <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Nueva Canción
                            </button>
                        </div>

                        {/* BARRA DE BÚSQUEDA */}
                        <div style={{ marginBottom: '1.2rem', position: 'relative' }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por título, autor o tono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '46px' }}
                            />
                        </div>

                        {/* FORMULARIO EDITAR / NUEVA CANCIÓN */}
                        {(editingSong !== null || editForm.titulo !== '') && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.2rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                <h4 style={{ margin: '0 0 1rem', color: '#60a5fa' }}>
                                    {editingSong ? `Editar Letra: ${editingSong.titulo}` : 'Agregar Nueva Canción al Repertorio'}
                                </h4>
                                <form onSubmit={handleSaveSongLyrics} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Título de la Canción:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.titulo}
                                            onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Autor / Grupo:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.autor}
                                            onChange={(e) => setEditForm({ ...editForm, autor: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tono / Key:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.tono}
                                            onChange={(e) => setEditForm({ ...editForm, tono: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tempo / BPM:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ej. 72 BPM"
                                            value={editForm.bpm}
                                            onChange={(e) => setEditForm({ ...editForm, bpm: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Letra Completa (Sin Acordes):</label>
                                        <textarea
                                            className="form-control"
                                            rows="8"
                                            placeholder="Pega aquí la letra completa de la canción organizada por versos, coros y puentes..."
                                            value={editForm.letra}
                                            onChange={(e) => setEditForm({ ...editForm, letra: e.target.value })}
                                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-save" style={{ marginRight: '6px' }}></i> Guardar Canción
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditingSong(null);
                                                setEditForm({ titulo: '', autor: '', tono: '', bpm: '', letra: '' });
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* LISTA LIMPIA DE CANCIONES (SIN ACORDES) */}
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table className="table-custom" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px' }}>Título de Canción</th>
                                        <th style={{ padding: '12px 16px' }}>Autor / Artista</th>
                                        <th style={{ padding: '12px 16px' }}>Tono (Key)</th>
                                        <th style={{ padding: '12px 16px' }}>Tempo</th>
                                        <th style={{ padding: '12px 16px' }}>Letra</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSongs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                                                No se encontraron canciones en el repertorio.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSongs.map(song => (
                                            <tr
                                                key={song.id}
                                                style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s ease'
                                                }}
                                                className="table-row-hover"
                                                onClick={() => setSelectedSongLyrics(song)}
                                            >
                                                <td style={{ padding: '14px 16px' }}>
                                                    <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{song.titulo}</strong>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{song.autor}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span className="badge badge-solvente" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                                        {song.tono}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.88rem' }}>
                                                    {song.bpm || '70 BPM'}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ color: song.letra ? '#10b981' : '#94a3b8', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <i className={song.letra ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
                                                        {song.letra ? 'Letra cargada' : 'Sin letra'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => setSelectedSongLyrics(song)}
                                                            title="Ver Letra Completa"
                                                        >
                                                            <i className="fas fa-align-left" style={{ marginRight: '6px' }}></i> Ver Letra
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => {
                                                                setEditingSong(song);
                                                                setEditForm({
                                                                    titulo: song.titulo || '',
                                                                    autor: song.autor || '',
                                                                    tono: song.tono || '',
                                                                    bpm: song.bpm || '',
                                                                    letra: song.letra || ''
                                                                });
                                                            }}
                                                            title="Editar Datos"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL VISOR DE LETRAS DE CANCIONES (TIPO PROPRESENTER / CABINA) */}
                    {selectedSongLyrics && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem'
                        }}>
                            <div style={{
                                background: '#121420',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                borderRadius: '24px',
                                width: '100%',
                                maxWidth: '720px',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                                overflow: 'hidden'
                            }}>
                                {/* CABECERA DE LA LETRA */}
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, #1e2436, #121420)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    justify: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#ffffff' }}>
                                            {selectedSongLyrics.titulo}
                                        </h2>
                                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            {selectedSongLyrics.autor} • Tono: <strong style={{ color: '#3b82f6' }}>{selectedSongLyrics.tono}</strong> • Tempo: <strong>{selectedSongLyrics.bpm || '70 BPM'}</strong>
                                        </p>
                                    </div>

                                    {/* CONTROLES DE LECTURA */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setLyricsFontSize(prev => Math.max(0.8, prev - 0.15))}
                                            title="Disminuir Tamaño Texto"
                                        >
                                            A-
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => setLyricsFontSize(prev => Math.min(2.0, prev + 0.15))}
                                            title="Aumentar Tamaño Texto"
                                        >
                                            A+
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleCopyLyrics(selectedSongLyrics.letra)}
                                            title="Copiar Letra para ProPresenter"
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSongLyrics(null)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: 'none',
                                                color: '#fff',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* CUERPO DE LA LETRA */}
                                <div style={{
                                    padding: '2rem',
                                    overflowY: 'auto',
                                    fontSize: `${lyricsFontSize}rem`,
                                    lineHeight: '1.7',
                                    color: '#f1f5f9',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'Inter, system-ui, sans-serif'
                                }}>
                                    {selectedSongLyrics.letra ? (
                                        selectedSongLyrics.letra
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 1rem' }}>
                                            <i className="fas fa-file-alt" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}></i>
                                            <p style={{ margin: 0 }}>No hay letra cargada para esta canción.</p>
                                            <button
                                                className="btn btn-primary"
                                                style={{ marginTop: '1rem' }}
                                                onClick={() => {
                                                    const song = selectedSongLyrics;
                                                    setSelectedSongLyrics(null);
                                                    setEditingSong(song);
                                                    setEditForm({
                                                        titulo: song.titulo || '',
                                                        autor: song.autor || '',
                                                        tono: song.tono || '',
                                                        bpm: song.bpm || '',
                                                        letra: ''
                                                    });
                                                }}
                                            >
                                                Agregar Letra Ahora
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* PIE DE MODAL */}
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    justify: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        Vista de Cabina • Formato limpio listo para ProPresenter
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedSongLyrics(null)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SUBVIEW 3: ESTATUS DE CLASES & PLANTILLAS RÁPIDAS */}
            {currentSub === 'estatus' && (
                <div className="produccion-subview animate-fade-in">
                    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                        <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
                            <h3 style={{ margin: 0 }}><i className="fas fa-bullhorn" style={{ color: '#dc2626', marginRight: '8px' }}></i> Configuración de Estatus de Clases & Plantillas Rápidas</h3>
                        </div>

                        {/* PLANTILLAS RÁPIDAS */}
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '14px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', marginBottom: '8px' }}>Plantillas de Estatus Predefinidas:</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {plantillasEstatus.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => aplicarPlantilla(p)}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleActualizarEstatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600 }}>Condición:</label>
                                <select className="form-control" value={estatusEstado} onChange={(e) => setEstatusEstado(e.target.value)}>
                                    <option value="normal">✅ Clases Normales (Confirmadas)</option>
                                    <option value="alerta">⚠️ Aviso Importante (Cambio de Aula o Horario)</option>
                                    <option value="suspendida">❌ Clases Suspendidas</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600 }}>Mensaje Visible para Alumnos:</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={estatusMensaje}
                                    onChange={(e) => setEstatusMensaje(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', borderRadius: '10px', padding: '10px 22px' }}>
                                <i className="fas fa-save" style={{ marginRight: '8px' }}></i> Publicar Estatus General
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SUBVIEW 4: ANUNCIOS STAFF */}
            {currentSub === 'anuncios' && (
                <div className="produccion-subview animate-fade-in">
                    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                        <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
                            <h3 style={{ margin: 0 }}><i className="fas fa-plus" style={{ color: '#3b82f6', marginRight: '8px' }}></i> Publicar Comunicado para el Staff</h3>
                        </div>
                        <form onSubmit={handlePublicarAnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600 }}>Título del Comunicado:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej. Junta de Coordinación de Graduaciones"
                                    value={nuevoAnuncio.titulo}
                                    onChange={(e) => setNuevoAnuncio({ ...nuevoAnuncio, titulo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 600 }}>Mensaje:</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={nuevoAnuncio.contenido}
                                    onChange={(e) => setNuevoAnuncio({ ...nuevoAnuncio, contenido: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', borderRadius: '10px', padding: '10px 22px' }}>
                                <i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Enviar Comunicado
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SUBVIEW 5: COLEGIATURAS */}
            {currentSub === 'colegiaturas' && (
                <div className="produccion-subview animate-fade-in">
                    <div className="glass-panel">
                        <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
                            <h3 style={{ margin: 0 }}><i className="fas fa-money-check-alt" style={{ color: '#10b981', marginRight: '8px' }}></i> Control Administrativo de Colegiaturas</h3>
                        </div>
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table className="table-custom" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '12px' }}>Alumno</th>
                                        <th style={{ padding: '12px' }}>Instrumento</th>
                                        <th style={{ padding: '12px' }}>Adeudo</th>
                                        <th style={{ padding: '12px' }}>Estatus</th>
                                        <th style={{ padding: '12px' }}>Acción Rápida</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => {
                                        const p = calcularEstadoPago(s);
                                        return (
                                            <tr key={s.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px' }}><strong>{s.nombre || s.key}</strong></td>
                                                <td style={{ padding: '12px' }}>{s.area || s.instrument || 'Música'}</td>
                                                <td style={{ padding: '12px' }}>{s.mesesAdeudo || 0} meses</td>
                                                <td style={{ padding: '12px' }}><span className={`badge ${p.clase}`}>{p.label}</span></td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => handleCambiarAdeudo(s.key, 0)}>
                                                            <i className="fas fa-check"></i> Solvente
                                                        </button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => handleCambiarAdeudo(s.key, 1)}>
                                                            +1 Mes
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleCambiarAdeudo(s.key, 2)}>
                                                            Mora 2m
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBVIEW 6: SALA DE ENSAYO PLAYBACK STEMS */}
            {currentSub === 'playback' && (
                <div className="produccion-subview animate-fade-in">
                    <PlaybackStudioApp />
                </div>
            )}
        </div>
    );
}
