export const ROLES = {
    ADMIN: 'admin',
    PASTOR: 'pastor',
    MAESTRO: 'maestro',
    PRODUCCION: 'administracion',
    ADORACION: 'adoracion',
    ESTUDIANTE: 'estudiante'
};

export const MENU_BY_ROLE = {
    admin: [
        { id: 'panel', label: 'Panel & Estadísticas', icon: 'fas fa-chart-line' },
        { id: 'usuarios', label: 'Gestión de Usuarios', icon: 'fas fa-users-cog' },
        { id: 'stems_cloud', label: 'Cargar Canciones & Stems (Playback Cloud)', icon: 'fas fa-cloud-upload-alt' },
        { id: 'respaldos', label: 'Respaldos & Sistema', icon: 'fas fa-database' }
    ],
    pastor: [
        { id: 'alertas', label: 'Visión Global', icon: 'fas fa-chart-pie' },
        { id: 'asistencia', label: 'Expedientes', icon: 'fas fa-id-card' },
        { id: 'colegiaturas', label: 'Colegiaturas & Estatus', icon: 'fas fa-file-invoice-dollar' },
        { id: 'cobertura', label: 'Cuidado Pastoral', icon: 'fas fa-heart' },
        { id: 'docentes', label: 'Docentes', icon: 'fas fa-chalkboard-teacher' },
        { id: 'calendario', label: 'Eventos', icon: 'fas fa-calendar-alt' }
    ],
    maestro: [
        { id: 'dashboard', label: 'Mi Dashboard', icon: 'fas fa-chart-bar' },
        { id: 'perfil', label: 'Mi Perfil', icon: 'fas fa-user-cog' },
        { id: 'ensambles', label: 'Sala de Ensayo (Playback)', icon: 'fas fa-sliders-h' },
        { id: 'classroom', label: 'Tareas & Classroom', icon: 'fas fa-tasks' },
        { id: 'alumnos', label: 'Lista de Alumnos', icon: 'fas fa-user-graduate' },
        { id: 'asistencia', label: 'Tomar Asistencia & Notas', icon: 'fas fa-calendar-check' },
        { id: 'materiales', label: 'Materiales & Práctica', icon: 'fas fa-book' },
        { id: 'anuncios', label: 'Anuncios Staff', icon: 'fas fa-bullhorn' }
    ],
    administracion: [
        { id: 'panel', label: 'Panel Cabina & ProPresenter', icon: 'fas fa-desktop' },
        { id: 'repertorio', label: 'Repertorio de Canciones', icon: 'fas fa-music' },
        { id: 'estatus', label: 'Estatus Clases', icon: 'fas fa-calendar-check' },
        { id: 'anuncios', label: 'Anuncios Staff', icon: 'fas fa-bullhorn' },
        { id: 'colegiaturas', label: 'Control Colegiaturas', icon: 'fas fa-file-invoice-dollar' },
        { id: 'playback', label: 'Sala de Ensayo (Stems)', icon: 'fas fa-sliders-h' }
    ],
    adoracion: [
        { id: 'control', label: 'Plan Ensamble', icon: 'fas fa-calendar-alt' },
        { id: 'repertorio', label: 'Repertorio Musical', icon: 'fas fa-music' }
    ],
    estudiante: [
        { id: 'classroom', label: 'Mi Salón & Tareas', icon: 'fas fa-chalkboard-teacher' },
        { id: 'progreso', label: 'Mi Progreso & Notas', icon: 'fas fa-chart-line' },
        { id: 'ensamble', label: 'Mi Ensamble', icon: 'fas fa-guitar' },
        { id: 'playback', label: 'Multitrack & Metrónomo', icon: 'fas fa-sliders-h' },
        { id: 'recursos', label: 'Anuncios & Recursos', icon: 'fas fa-folder-open' }
    ]
};
