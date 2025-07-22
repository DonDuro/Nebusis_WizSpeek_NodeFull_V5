// Simple translation system for WizSpeek®
export interface Translations {
  [key: string]: string;
}

export const translations = {
  en: {
    // Main navigation
    'messages': 'Messages',
    'stories': 'Stories',
    'contacts': 'Contacts',
    'verification': 'Verification',
    'admin': 'Admin',
    'settings': 'Settings',
    'logout': 'Logout',
    
    // Settings modal
    'wizspeak_settings': 'WizSpeek® Settings',
    'profile': 'Profile',
    'groups': 'Groups',
    'themes': 'Themes',
    'backgrounds': 'Backgrounds',
    'storage': 'Storage',
    'access': 'Access',
    'language': 'Language',
    'help': 'Help',
    
    // Language tab
    'language_region': 'Language & Region',
    'app_language': 'App Language',
    'current_selection': 'Current selection',
    'regional_settings': 'Regional Settings',
    'auto_detect_language': 'Auto-detect Language',
    '24_hour_time_format': '24-hour Time Format',
    'regional_number_format': 'Regional Number Format',
    'translation': 'Translation',
    'auto_translate_messages': 'Auto-translate Messages',
    'translation_suggestions': 'Translation Suggestions',
    
    // Common UI elements
    'new_group': 'New Group',
    'link_device': 'Link Device',
    'direct_message': 'Direct message',
    'group_chat': 'Group chat',
    'select_conversation': 'Select a conversation to start chatting',
    'talk_smart_stay_secure': 'Talk Smart. Stay Secure.',
    'powered_by_nebusis': 'Powered by Nebusis®',
    'search_conversations': 'Search conversations...',
    'chat': 'Chat',
    'compliance': 'Compliance',
    
    // Buttons
    'save_changes': 'Save Changes',
    'cancel': 'Cancel',
    'sign_out': 'Sign Out',
    
    // Toast messages
    'language_selected': 'Language Selected',
    'click_save_to_apply': 'Click Save Changes to apply.',
    'saving_settings': 'Saving Settings',
    'settings_saved_successfully': 'Settings Saved Successfully',
    'language_changed_to': 'Language changed to',
    'all_preferences_saved': 'All preferences saved!',
    
    // Storage tab
    'storage_data_management': 'Storage & Data Management',
    'manage_media': 'Manage Media',
    'clear_cache': 'Clear Cache',
    'sync_data': 'Sync Data',
    
    // Admin Dashboard
    'admin_dashboard': 'Admin Dashboard',
    'manage_users_platform_security': 'Manage users and platform security',
    'admin_features': 'Admin Features',
    'active': 'Active',
    'enabled': 'Enabled',
    'live': 'Live',
    'ready': 'Ready',
    'full_user_management_capabilities': 'Full user management capabilities',
    'user_management': 'User Management',
    'ban_unban_delete_users': 'Ban, unban, and delete users',
    'user_blocking': 'User Blocking',
    'advanced_user_blocking_system': 'Advanced user blocking system',
    'analytics': 'Analytics',
    'user_activity_statistics': 'User activity and statistics',
    'administrative_tools': 'Administrative Tools',
    'manage_users_handle_violations': 'Manage users, handle violations, and maintain platform security',
    'no_users_found': 'No Users Found',
    'unable_to_load_user_list': 'Unable to load user list',
    
    // Verification Center
    'verification_center': 'Verification Center',
    'manage_identity_verification': 'Manage your identity verification and build trust with other users',
    'trust_score': 'Trust Score',
    'verification_overview': 'Verification Overview',
    'verification_status_helps_build_trust': 'Your verification status helps build trust with other users',
    'verified': 'Verified',
    'pending': 'Pending',
    'documents': 'Documents',
    'endorsements': 'Endorsements',
    'document_verification': 'Document Verification',
    'upload_official_documents': 'Upload official documents to verify your identity',
    'contact_verification': 'Contact Verification',
    'verify_identity_trusted_contacts': 'Verify your identity through trusted contacts',
    'peer_endorsements': 'Peer Endorsements',
    'get_endorsed_verified_users': 'Get endorsed by verified users who know you',
    'score': 'Score',
    
    // Contact Management
    'contact_management': 'Contact Management',
    'discover_users': 'Discover Users',
    'invite_new_contact': 'Invite New Contact',
    'qr_codes': 'QR Codes',
    'professional': 'Professional',
    'personal': 'Personal',
    'both': 'Both',
    'remove': 'Remove',
    
    // Stories
    'share_moments_contacts': 'Share moments with your contacts',
    'create_story': 'Create Story',
    'recent_activity': 'Recent Activity',
    'blue_ring_new_content': 'Blue ring indicates new content you haven\'t viewed yet.',
    'no_stories_yet': 'No Stories Yet',
    'be_first_share_story': 'Be the first to share a story! Stories are a great way to share quick updates with your contacts.',
    'stories_feature': 'Stories Feature',
    'view_tracking': 'View Tracking',
    'auto_expire': 'Auto Expire',
    
    // Settings Modal - detailed translations
    'profile_management': 'Profile Management',
    'name_display_settings': 'Name Display Settings',
    'control_name_appears_contacts': 'Control how your name appears to contacts by default. You can customize this for individual contacts below.',
    'default_name_display': 'Default Name Display',
    'privacy_settings': 'Privacy Settings',
    'people_groups_manager': 'People & Groups Manager',
    'group_controls': 'Group Controls',
    'create_securegroup_coming_soon': 'Create SecureGroup™ (Coming Soon)',
    'manage_group_privacy': 'Manage Group Privacy',
    'group_notifications': 'Group Notifications',
    'group_permissions': 'Group Permissions',
    'auto_join_groups': 'Auto-join Groups',
    'admin_message_priority': 'Admin Message Priority',
    'group_media_auto_download': 'Group Media Auto-download',
    'wizspeak_theme_studio': 'WizSpeek® Theme Studio',
    'wizspeak_blue': 'WizSpeek® Blue',
    'midnight_pro': 'Midnight Pro',
    'ocean_depths': 'Ocean Depths',
    'forest_secure': 'Forest Secure',
    'sunset_glow': 'Sunset Glow',
    'royal_purple': 'Royal Purple',
    'theme_options': 'Theme Options',
    'auto_dark_mode': 'Auto Dark Mode',
    'system_theme_sync': 'System Theme Sync',
    'theme_animations': 'Theme Animations',
    'chat_backgrounds': 'Chat Backgrounds',
    'wizspeak_default': 'WizSpeek® Default',
    'linear_gradient': 'Linear gradient',
    'geometric_patterns': 'Geometric Patterns',
    'abstract_shapes': 'Abstract shapes',
    'particle_flow': 'Particle Flow',
    'animated_dots': 'Animated dots',
    'digital_waves': 'Digital Waves',
    'flowing_lines': 'Flowing lines',
    'minimal_clean': 'Minimal Clean',
    'simple_texture': 'Simple texture',
    'cyber_grid': 'Cyber Grid',
    'neon_grid': 'Neon grid',
    'upload_custom': 'Upload Custom',
    'create_gradient': 'Create Gradient',
    'opening_file_picker': 'Opening file picker for custom backgrounds',
    'storage_usage': 'Storage Usage',
    'media_files': 'Media Files',
    'voice_notes': 'Voice Notes',
    'total_used': 'Total Used',
    'auto_backup': 'Auto-backup',
    'data_sync': 'Data Sync',
    'media_auto_download': 'Media Auto-download',
    'accessibility_comfort': 'Accessibility & Comfort',
    'visual_accessibility': 'Visual Accessibility',
    'high_contrast_mode': 'High Contrast Mode',
    'large_text': 'Large Text',
    'screen_reader_support': 'Screen Reader Support',
    'audio_voice': 'Audio & Voice',
    'voice_enhancement': 'Voice Enhancement',
    'audio_descriptions': 'Audio Descriptions',
    'vibration_alerts': 'Vibration Alerts',
    'interaction': 'Interaction',
    'tap_to_speak': 'Tap to Speak',
    'voice_commands': 'Voice Commands',
    'gesture_navigation': 'Gesture Navigation',
    'help_support': 'Help & Support',
    'getting_started': 'Getting Started',
    'wizspeak_tutorial': 'WizSpeek® Tutorial',
    'security_guide': 'Security Guide',
    'group_management': 'Group Management',
    'support': 'Support',
    'contact_support': 'Contact Support',
    'report_issue': 'Report Issue',
    'privacy_policy': 'Privacy Policy',
    'app_information': 'App Information',
    'version': 'Version',
    'build': 'Build',
    'platform': 'Platform',
    'progressive_web_app': 'Progressive Web App',
    'check_updates': 'Check Updates',
    'install_app': 'Install App',
  },
  
  es: {
    // Main navigation
    'messages': 'Mensajes',
    'stories': 'Historias',
    'contacts': 'Contactos',
    'verification': 'Verificación',
    'admin': 'Admin',
    'settings': 'Configuración',
    'logout': 'Cerrar Sesión',
    
    // Settings modal
    'wizspeak_settings': 'Configuración de WizSpeek®',
    'profile': 'Perfil',
    'groups': 'Grupos',
    'themes': 'Temas',
    'backgrounds': 'Fondos',
    'storage': 'Almacenamiento',
    'access': 'Acceso',
    'language': 'Idioma',
    'help': 'Ayuda',
    
    // Language tab
    'language_region': 'Idioma y Región',
    'app_language': 'Idioma de la Aplicación',
    'current_selection': 'Selección actual',
    'regional_settings': 'Configuración Regional',
    'auto_detect_language': 'Detectar Idioma Automáticamente',
    '24_hour_time_format': 'Formato de 24 Horas',
    'regional_number_format': 'Formato Regional de Números',
    'translation': 'Traducción',
    'auto_translate_messages': 'Traducir Mensajes Automáticamente',
    'translation_suggestions': 'Sugerencias de Traducción',
    
    // Common UI elements
    'new_group': 'Nuevo Grupo',
    'link_device': 'Vincular Dispositivo',
    'direct_message': 'Mensaje directo',
    'group_chat': 'Chat grupal',
    'select_conversation': 'Selecciona una conversación para comenzar a chatear',
    'talk_smart_stay_secure': 'Habla Inteligente. Mantente Seguro.',
    'powered_by_nebusis': 'Desarrollado por Nebusis®',
    'search_conversations': 'Buscar conversaciones...',
    'chat': 'Chat',
    'compliance': 'Cumplimiento',
    
    // Buttons
    'save_changes': 'Guardar Cambios',
    'cancel': 'Cancelar',
    'sign_out': 'Cerrar Sesión',
    
    // Toast messages
    'language_selected': 'Idioma Seleccionado',
    'click_save_to_apply': 'Haz clic en Guardar Cambios para aplicar.',
    'saving_settings': 'Guardando Configuración',
    'settings_saved_successfully': 'Configuración Guardada Exitosamente',
    'language_changed_to': 'Idioma cambiado a',
    'all_preferences_saved': '¡Todas las preferencias guardadas!',
    
    // Storage tab
    'storage_data_management': 'Gestión de Almacenamiento y Datos',
    'manage_media': 'Gestionar Medios',
    'clear_cache': 'Limpiar Caché',
    'sync_data': 'Sincronizar Datos',
    
    // Admin Dashboard
    'admin_dashboard': 'Panel de Administración',
    'manage_users_platform_security': 'Gestionar usuarios y seguridad de la plataforma',
    'admin_features': 'Características de Admin',
    'active': 'Activo',
    'enabled': 'Habilitado',
    'live': 'En Vivo',
    'ready': 'Listo',
    'full_user_management_capabilities': 'Capacidades completas de gestión de usuarios',
    'user_management': 'Gestión de Usuarios',
    'ban_unban_delete_users': 'Bloquear, desbloquear y eliminar usuarios',
    'user_blocking': 'Bloqueo de Usuarios',
    'advanced_user_blocking_system': 'Sistema avanzado de bloqueo de usuarios',
    'analytics': 'Análisis',
    'user_activity_statistics': 'Actividad de usuarios y estadísticas',
    'administrative_tools': 'Herramientas Administrativas',
    'manage_users_handle_violations': 'Gestionar usuarios, manejar violaciones y mantener la seguridad de la plataforma',
    'no_users_found': 'No se Encontraron Usuarios',
    'unable_to_load_user_list': 'No se puede cargar la lista de usuarios',
    
    // Verification Center
    'verification_center': 'Centro de Verificación',
    'manage_identity_verification': 'Gestiona tu verificación de identidad y construye confianza con otros usuarios',
    'trust_score': 'Puntuación de Confianza',
    'verification_overview': 'Resumen de Verificación',
    'verification_status_helps_build_trust': 'Tu estado de verificación ayuda a construir confianza con otros usuarios',
    'verified': 'Verificado',
    'pending': 'Pendiente',
    'documents': 'Documentos',
    'endorsements': 'Recomendaciones',
    'document_verification': 'Verificación de Documentos',
    'upload_official_documents': 'Sube documentos oficiales para verificar tu identidad',
    'contact_verification': 'Verificación de Contactos',
    'verify_identity_trusted_contacts': 'Verifica tu identidad a través de contactos confiables',
    'peer_endorsements': 'Recomendaciones de Pares',
    'get_endorsed_verified_users': 'Obtén recomendaciones de usuarios verificados que te conocen',
    'score': 'Puntuación',
    
    // Contact Management
    'contact_management': 'Gestión de Contactos',
    'discover_users': 'Descubrir Usuarios',
    'invite_new_contact': 'Invitar Nuevo Contacto',
    'qr_codes': 'Códigos QR',
    'professional': 'Profesional',
    'personal': 'Personal',
    'both': 'Ambos',
    'remove': 'Eliminar',
    
    // Stories
    'share_moments_contacts': 'Comparte momentos con tus contactos',
    'create_story': 'Crear Historia',
    'recent_activity': 'Actividad Reciente',
    'blue_ring_new_content': 'El anillo azul indica contenido nuevo que no has visto todavía.',
    'no_stories_yet': 'Aún No Hay Historias',
    'be_first_share_story': '¡Sé el primero en compartir una historia! Las historias son una excelente manera de compartir actualizaciones rápidas con tus contactos.',
    'stories_feature': 'Función de Historias',
    'view_tracking': 'Seguimiento de Visualizaciones',
    'auto_expire': 'Expiración Automática',
    
    // Settings Modal - detailed translations
    'profile_management': 'Gestión de Perfil',
    'name_display_settings': 'Configuración de Visualización de Nombre',
    'control_name_appears_contacts': 'Controla cómo aparece tu nombre a los contactos por defecto. Puedes personalizar esto para contactos individuales a continuación.',
    'default_name_display': 'Visualización de Nombre por Defecto',
    'privacy_settings': 'Configuración de Privacidad',
    'people_groups_manager': 'Gestor de Personas y Grupos',
    'group_controls': 'Controles de Grupo',
    'create_securegroup_coming_soon': 'Crear SecureGroup™ (Próximamente)',
    'manage_group_privacy': 'Gestionar Privacidad del Grupo',
    'group_notifications': 'Notificaciones de Grupo',
    'group_permissions': 'Permisos de Grupo',
    'auto_join_groups': 'Auto-unirse a Grupos',
    'admin_message_priority': 'Prioridad de Mensajes de Admin',
    'group_media_auto_download': 'Descarga Automática de Medios del Grupo',
    'wizspeak_theme_studio': 'Estudio de Temas WizSpeek®',
    'wizspeak_blue': 'Azul WizSpeek®',
    'midnight_pro': 'Medianoche Pro',
    'ocean_depths': 'Profundidades del Océano',
    'forest_secure': 'Bosque Seguro',
    'sunset_glow': 'Resplandor del Atardecer',
    'royal_purple': 'Púrpura Real',
    'theme_options': 'Opciones de Tema',
    'auto_dark_mode': 'Modo Oscuro Automático',
    'system_theme_sync': 'Sincronización de Tema del Sistema',
    'theme_animations': 'Animaciones de Tema',
    'chat_backgrounds': 'Fondos de Chat',
    'wizspeak_default': 'Por Defecto WizSpeek®',
    'linear_gradient': 'Gradiente lineal',
    'geometric_patterns': 'Patrones Geométricos',
    'abstract_shapes': 'Formas abstractas',
    'particle_flow': 'Flujo de Partículas',
    'animated_dots': 'Puntos animados',
    'digital_waves': 'Ondas Digitales',
    'flowing_lines': 'Líneas fluidas',
    'minimal_clean': 'Limpio Minimalista',
    'simple_texture': 'Textura simple',
    'cyber_grid': 'Rejilla Cibernética',
    'neon_grid': 'Rejilla de neón',
    'upload_custom': 'Subir Personalizado',
    'create_gradient': 'Crear Gradiente',
    'opening_file_picker': 'Abriendo selector de archivos para fondos personalizados',
    'storage_usage': 'Uso de Almacenamiento',
    'media_files': 'Archivos de Medios',
    'voice_notes': 'Notas de Voz',
    'total_used': 'Total Usado',
    'auto_backup': 'Respaldo Automático',
    'data_sync': 'Sincronización de Datos',
    'media_auto_download': 'Descarga Automática de Medios',
    'accessibility_comfort': 'Accesibilidad y Comodidad',
    'visual_accessibility': 'Accesibilidad Visual',
    'high_contrast_mode': 'Modo de Alto Contraste',
    'large_text': 'Texto Grande',
    'screen_reader_support': 'Soporte de Lector de Pantalla',
    'audio_voice': 'Audio y Voz',
    'voice_enhancement': 'Mejora de Voz',
    'audio_descriptions': 'Descripciones de Audio',
    'vibration_alerts': 'Alertas de Vibración',
    'interaction': 'Interacción',
    'tap_to_speak': 'Tocar para Hablar',
    'voice_commands': 'Comandos de Voz',
    'gesture_navigation': 'Navegación por Gestos',
    'help_support': 'Ayuda y Soporte',
    'getting_started': 'Comenzando',
    'wizspeak_tutorial': 'Tutorial de WizSpeek®',
    'security_guide': 'Guía de Seguridad',
    'group_management': 'Gestión de Grupos',
    'support': 'Soporte',
    'contact_support': 'Contactar Soporte',
    'report_issue': 'Reportar Problema',
    'privacy_policy': 'Política de Privacidad',
    'app_information': 'Información de la Aplicación',
    'version': 'Versión',
    'build': 'Compilación',
    'platform': 'Plataforma',
    'progressive_web_app': 'Aplicación Web Progresiva',
    'check_updates': 'Verificar Actualizaciones',
    'install_app': 'Instalar Aplicación',
  },
  
  fr: {
    // Main navigation
    'messages': 'Messages',
    'stories': 'Histoires',
    'contacts': 'Contacts',
    'verification': 'Vérification',
    'admin': 'Admin',
    'settings': 'Paramètres',
    'logout': 'Se Déconnecter',
    
    // Settings modal
    'wizspeak_settings': 'Paramètres WizSpeek®',
    'profile': 'Profil',
    'groups': 'Groupes',
    'themes': 'Thèmes',
    'backgrounds': 'Arrière-plans',
    'storage': 'Stockage',
    'access': 'Accès',
    'language': 'Langue',
    'help': 'Aide',
    
    // Language tab
    'language_region': 'Langue et Région',
    'app_language': 'Langue de l\'Application',
    'current_selection': 'Sélection actuelle',
    'regional_settings': 'Paramètres Régionaux',
    'auto_detect_language': 'Détecter la Langue Automatiquement',
    '24_hour_time_format': 'Format 24 Heures',
    'regional_number_format': 'Format Régional des Nombres',
    'translation': 'Traduction',
    'auto_translate_messages': 'Traduire Automatiquement les Messages',
    'translation_suggestions': 'Suggestions de Traduction',
    
    // Common UI elements
    'new_group': 'Nouveau Groupe',
    'link_device': 'Lier l\'Appareil',
    'direct_message': 'Message direct',
    'group_chat': 'Chat de groupe',
    'select_conversation': 'Sélectionnez une conversation pour commencer à discuter',
    'talk_smart_stay_secure': 'Parlez Intelligemment. Restez en Sécurité.',
    'powered_by_nebusis': 'Alimenté par Nebusis®',
    'search_conversations': 'Rechercher des conversations...',
    'chat': 'Chat',
    'compliance': 'Conformité',
    
    // Buttons
    'save_changes': 'Enregistrer les Modifications',
    'cancel': 'Annuler',
    'sign_out': 'Se Déconnecter',
    
    // Toast messages
    'language_selected': 'Langue Sélectionnée',
    'click_save_to_apply': 'Cliquez sur Enregistrer pour appliquer.',
    'saving_settings': 'Enregistrement des Paramètres',
    'settings_saved_successfully': 'Paramètres Enregistrés avec Succès',
    'language_changed_to': 'Langue changée en',
    'all_preferences_saved': 'Toutes les préférences enregistrées!',
    
    // Storage tab
    'storage_data_management': 'Gestion du Stockage et des Données',
    'manage_media': 'Gérer les Médias',
    'clear_cache': 'Vider le Cache',
    'sync_data': 'Synchroniser les Données',
  },
  
  pt: {
    // Main navigation
    'messages': 'Mensagens',
    'stories': 'Histórias',
    'contacts': 'Contatos',
    'verification': 'Verificação',
    'admin': 'Admin',
    'settings': 'Configurações',
    'logout': 'Sair',
    
    // Settings modal
    'wizspeak_settings': 'Configurações WizSpeek®',
    'profile': 'Perfil',
    'groups': 'Grupos',
    'themes': 'Temas',
    'backgrounds': 'Fundos',
    'storage': 'Armazenamento',
    'access': 'Acesso',
    'language': 'Idioma',
    'help': 'Ajuda',
    
    // Language tab
    'language_region': 'Idioma e Região',
    'app_language': 'Idioma do Aplicativo',
    'current_selection': 'Seleção atual',
    'regional_settings': 'Configurações Regionais',
    'auto_detect_language': 'Detectar Idioma Automaticamente',
    '24_hour_time_format': 'Formato de 24 Horas',
    'regional_number_format': 'Formato Regional de Números',
    'translation': 'Tradução',
    'auto_translate_messages': 'Traduzir Mensagens Automaticamente',
    'translation_suggestions': 'Sugestões de Tradução',
    
    // Common UI elements
    'new_group': 'Novo Grupo',
    'link_device': 'Vincular Dispositivo',
    'direct_message': 'Mensagem direta',
    'group_chat': 'Chat em grupo',
    'select_conversation': 'Selecione uma conversa para começar a conversar',
    'talk_smart_stay_secure': 'Fale Inteligente. Mantenha-se Seguro.',
    'powered_by_nebusis': 'Desenvolvido pela Nebusis®',
    'search_conversations': 'Pesquisar conversas...',
    'chat': 'Chat',
    'compliance': 'Conformidade',
    
    // Buttons
    'save_changes': 'Salvar Alterações',
    'cancel': 'Cancelar',
    'sign_out': 'Sair',
    
    // Toast messages
    'language_selected': 'Idioma Selecionado',
    'click_save_to_apply': 'Clique em Salvar Alterações para aplicar.',
    'saving_settings': 'Salvando Configurações',
    'settings_saved_successfully': 'Configurações Salvas com Sucesso',
    'language_changed_to': 'Idioma alterado para',
    'all_preferences_saved': 'Todas as preferências salvas!',
    
    // Storage tab
    'storage_data_management': 'Gerenciamento de Armazenamento e Dados',
    'manage_media': 'Gerenciar Mídia',
    'clear_cache': 'Limpar Cache',
    'sync_data': 'Sincronizar Dados',
  },
  
  de: {
    // Main navigation
    'messages': 'Nachrichten',
    'stories': 'Geschichten',
    'contacts': 'Kontakte',
    'verification': 'Verifizierung',
    'admin': 'Admin',
    'settings': 'Einstellungen',
    'logout': 'Abmelden',
    
    // Settings modal
    'wizspeak_settings': 'WizSpeek® Einstellungen',
    'profile': 'Profil',
    'groups': 'Gruppen',
    'themes': 'Themen',
    'backgrounds': 'Hintergründe',
    'storage': 'Speicher',
    'access': 'Zugang',
    'language': 'Sprache',
    'help': 'Hilfe',
    
    // Language tab
    'language_region': 'Sprache und Region',
    'app_language': 'App-Sprache',
    'current_selection': 'Aktuelle Auswahl',
    'regional_settings': 'Regionale Einstellungen',
    'auto_detect_language': 'Sprache automatisch erkennen',
    '24_hour_time_format': '24-Stunden-Format',
    'regional_number_format': 'Regionales Zahlenformat',
    'translation': 'Übersetzung',
    'auto_translate_messages': 'Nachrichten automatisch übersetzen',
    'translation_suggestions': 'Übersetzungsvorschläge',
    
    // Common UI elements
    'new_group': 'Neue Gruppe',
    'link_device': 'Gerät Verknüpfen',
    'direct_message': 'Direktnachricht',
    'group_chat': 'Gruppenchat',
    'select_conversation': 'Wählen Sie eine Unterhaltung zum Chatten',
    'talk_smart_stay_secure': 'Intelligent Sprechen. Sicher Bleiben.',
    'powered_by_nebusis': 'Unterstützt von Nebusis®',
    'search_conversations': 'Unterhaltungen suchen...',
    'chat': 'Chat',
    'compliance': 'Compliance',
    
    // Buttons
    'save_changes': 'Änderungen speichern',
    'cancel': 'Abbrechen',
    'sign_out': 'Abmelden',
    
    // Toast messages
    'language_selected': 'Sprache ausgewählt',
    'click_save_to_apply': 'Klicken Sie auf Änderungen speichern um anzuwenden.',
    'saving_settings': 'Einstellungen speichern',
    'settings_saved_successfully': 'Einstellungen erfolgreich gespeichert',
    'language_changed_to': 'Sprache geändert zu',
    'all_preferences_saved': 'Alle Einstellungen gespeichert!',
    
    // Storage tab
    'storage_data_management': 'Speicher- und Datenverwaltung',
    'manage_media': 'Medien verwalten',
    'clear_cache': 'Cache leeren',
    'sync_data': 'Daten synchronisieren',
  },
  
  zh: {
    // Main navigation
    'messages': '消息',
    'stories': '动态',
    'contacts': '联系人',
    'verification': '验证',
    'admin': '管理员',
    'settings': '设置',
    'logout': '退出登录',
    
    // Settings modal
    'wizspeak_settings': 'WizSpeek® 设置',
    'profile': '个人资料',
    'groups': '群组',
    'themes': '主题',
    'backgrounds': '背景',
    'storage': '存储',
    'access': '访问',
    'language': '语言',
    'help': '帮助',
    
    // Language tab
    'language_region': '语言与地区',
    'app_language': '应用语言',
    'current_selection': '当前选择',
    'regional_settings': '地区设置',
    'auto_detect_language': '自动检测语言',
    '24_hour_time_format': '24小时制',
    'regional_number_format': '地区数字格式',
    'translation': '翻译',
    'auto_translate_messages': '自动翻译消息',
    'translation_suggestions': '翻译建议',
    
    // Common UI elements
    'new_group': '新建群组',
    'link_device': '链接设备',
    'direct_message': '私信',
    'group_chat': '群聊',
    'select_conversation': '选择对话开始聊天',
    'talk_smart_stay_secure': '智能交流，安全保障。',
    'powered_by_nebusis': '由 Nebusis® 提供技术支持',
    'search_conversations': '搜索对话...',
    'chat': '聊天',
    'compliance': '合规',
    
    // Buttons
    'save_changes': '保存更改',
    'cancel': '取消',
    'sign_out': '退出登录',
    
    // Toast messages
    'language_selected': '已选择语言',
    'click_save_to_apply': '点击保存更改以应用。',
    'saving_settings': '正在保存设置',
    'settings_saved_successfully': '设置保存成功',
    'language_changed_to': '语言已更改为',
    'all_preferences_saved': '所有偏好设置已保存！',
    
    // Storage tab
    'storage_data_management': '存储和数据管理',
    'manage_media': '管理媒体',
    'clear_cache': '清除缓存',
    'sync_data': '同步数据',
  },
  
  it: {
    // Main navigation
    'messages': 'Messaggi',
    'stories': 'Storie',
    'contacts': 'Contatti',
    'verification': 'Verifica',
    'admin': 'Admin',
    'settings': 'Impostazioni',
    'logout': 'Disconnetti',
    
    // Settings modal
    'wizspeak_settings': 'Impostazioni WizSpeek®',
    'profile': 'Profilo',
    'groups': 'Gruppi',
    'themes': 'Temi',
    'backgrounds': 'Sfondi',
    'storage': 'Archiviazione',
    'access': 'Accesso',
    'language': 'Lingua',
    'help': 'Aiuto',
    
    // Language tab
    'language_region': 'Lingua e Regione',
    'app_language': 'Lingua dell\'App',
    'current_selection': 'Selezione attuale',
    'regional_settings': 'Impostazioni Regionali',
    'auto_detect_language': 'Rileva Lingua Automaticamente',
    '24_hour_time_format': 'Formato 24 Ore',
    'regional_number_format': 'Formato Numerico Regionale',
    'translation': 'Traduzione',
    'auto_translate_messages': 'Traduci Messaggi Automaticamente',
    'translation_suggestions': 'Suggerimenti di Traduzione',
    
    // Common UI elements
    'new_group': 'Nuovo Gruppo',
    'link_device': 'Collega Dispositivo',
    'direct_message': 'Messaggio diretto',
    'group_chat': 'Chat di gruppo',
    'select_conversation': 'Seleziona una conversazione per iniziare a chattare',
    'talk_smart_stay_secure': 'Parla Intelligente. Rimani Sicuro.',
    'powered_by_nebusis': 'Realizzato da Nebusis®',
    'search_conversations': 'Cerca conversazioni...',
    'chat': 'Chat',
    'compliance': 'Conformità',
    
    // Buttons
    'save_changes': 'Salva Modifiche',
    'cancel': 'Annulla',
    'sign_out': 'Disconnetti',
    
    // Toast messages
    'language_selected': 'Lingua Selezionata',
    'click_save_to_apply': 'Clicca su Salva Modifiche per applicare.',
    'saving_settings': 'Salvataggio Impostazioni',
    'settings_saved_successfully': 'Impostazioni Salvate con Successo',
    'language_changed_to': 'Lingua cambiata in',
    'all_preferences_saved': 'Tutte le preferenze salvate!',
    
    // Storage tab
    'storage_data_management': 'Gestione Archiviazione e Dati',
    'manage_media': 'Gestisci Media',
    'clear_cache': 'Svuota Cache',
    'sync_data': 'Sincronizza Dati',
  },
  
  ru: {
    // Main navigation
    'messages': 'Сообщения',
    'stories': 'Истории',
    'contacts': 'Контакты',
    'verification': 'Проверка',
    'admin': 'Админ',
    'settings': 'Настройки',
    'logout': 'Выйти',
    
    // Settings modal
    'wizspeak_settings': 'Настройки WizSpeek®',
    'profile': 'Профиль',
    'groups': 'Группы',
    'themes': 'Темы',
    'backgrounds': 'Фоны',
    'storage': 'Хранилище',
    'access': 'Доступ',
    'language': 'Язык',
    'help': 'Помощь',
    
    // Language tab
    'language_region': 'Язык и Регион',
    'app_language': 'Язык Приложения',
    'current_selection': 'Текущий выбор',
    'regional_settings': 'Региональные Настройки',
    'auto_detect_language': 'Автоматическое Определение Языка',
    '24_hour_time_format': '24-часовой Формат',
    'regional_number_format': 'Региональный Формат Чисел',
    'translation': 'Перевод',
    'auto_translate_messages': 'Автоматический Перевод Сообщений',
    'translation_suggestions': 'Предложения Переводов',
    
    // Common UI elements
    'new_group': 'Новая Группа',
    'link_device': 'Связать Устройство',
    'direct_message': 'Личное сообщение',
    'group_chat': 'Групповой чат',
    'select_conversation': 'Выберите разговор для начала общения',
    'talk_smart_stay_secure': 'Говорите Умно. Оставайтесь в Безопасности.',
    'powered_by_nebusis': 'При поддержке Nebusis®',
    'search_conversations': 'Поиск разговоров...',
    'chat': 'Чат',
    'compliance': 'Соответствие',
    
    // Buttons
    'save_changes': 'Сохранить Изменения',
    'cancel': 'Отмена',
    'sign_out': 'Выйти',
    
    // Toast messages
    'language_selected': 'Язык Выбран',
    'click_save_to_apply': 'Нажмите Сохранить Изменения для применения.',
    'saving_settings': 'Сохранение Настроек',
    'settings_saved_successfully': 'Настройки Успешно Сохранены',
    'language_changed_to': 'Язык изменен на',
    'all_preferences_saved': 'Все настройки сохранены!',
    
    // Storage tab
    'storage_data_management': 'Управление Хранилищем и Данными',
    'manage_media': 'Управление Медиа',
    'clear_cache': 'Очистить Кэш',
    'sync_data': 'Синхронизировать Данные',
  },
  
  ja: {
    // Main navigation
    'messages': 'メッセージ',
    'stories': 'ストーリー',
    'contacts': '連絡先',
    'verification': '検証',
    'admin': '管理者',
    'settings': '設定',
    'logout': 'ログアウト',
    
    // Settings modal
    'wizspeak_settings': 'WizSpeek® 設定',
    'profile': 'プロフィール',
    'groups': 'グループ',
    'themes': 'テーマ',
    'backgrounds': '背景',
    'storage': 'ストレージ',
    'access': 'アクセス',
    'language': '言語',
    'help': 'ヘルプ',
    
    // Language tab
    'language_region': '言語と地域',
    'app_language': 'アプリの言語',
    'current_selection': '現在の選択',
    'regional_settings': '地域設定',
    'auto_detect_language': '言語を自動検出',
    '24_hour_time_format': '24時間形式',
    'regional_number_format': '地域の数値形式',
    'translation': '翻訳',
    'auto_translate_messages': 'メッセージを自動翻訳',
    'translation_suggestions': '翻訳提案',
    
    // Common UI elements
    'new_group': '新しいグループ',
    'link_device': 'デバイスをリンク',
    'direct_message': 'ダイレクトメッセージ',
    'group_chat': 'グループチャット',
    'select_conversation': 'チャットを開始する会話を選択してください',
    'talk_smart_stay_secure': 'スマートに話し、安全を保つ。',
    'powered_by_nebusis': 'Nebusis® による技術提供',
    'search_conversations': '会話を検索...',
    'chat': 'チャット',
    'compliance': 'コンプライアンス',
    
    // Buttons
    'save_changes': '変更を保存',
    'cancel': 'キャンセル',
    'sign_out': 'サインアウト',
    
    // Toast messages
    'language_selected': '言語が選択されました',
    'click_save_to_apply': '適用するには変更を保存をクリックしてください。',
    'saving_settings': '設定を保存中',
    'settings_saved_successfully': '設定が正常に保存されました',
    'language_changed_to': '言語が次に変更されました',
    'all_preferences_saved': 'すべての設定が保存されました！',
    
    // Storage tab
    'storage_data_management': 'ストレージとデータ管理',
    'manage_media': 'メディア管理',
    'clear_cache': 'キャッシュをクリア',
    'sync_data': 'データを同期',
  },
  
  ko: {
    // Main navigation
    'messages': '메시지',
    'stories': '스토리',
    'contacts': '연락처',
    'verification': '인증',
    'admin': '관리자',
    'settings': '설정',
    'logout': '로그아웃',
    
    // Settings modal
    'wizspeak_settings': 'WizSpeek® 설정',
    'profile': '프로필',
    'groups': '그룹',
    'themes': '테마',
    'backgrounds': '배경',
    'storage': '저장소',
    'access': '접근',
    'language': '언어',
    'help': '도움말',
    
    // Language tab
    'language_region': '언어 및 지역',
    'app_language': '앱 언어',
    'current_selection': '현재 선택',
    'regional_settings': '지역 설정',
    'auto_detect_language': '언어 자동 감지',
    '24_hour_time_format': '24시간 형식',
    'regional_number_format': '지역 숫자 형식',
    'translation': '번역',
    'auto_translate_messages': '메시지 자동 번역',
    'translation_suggestions': '번역 제안',
    
    // Common UI elements
    'new_group': '새 그룹',
    'link_device': '기기 연결',
    'direct_message': '직접 메시지',
    'group_chat': '그룹 채팅',
    'select_conversation': '채팅을 시작할 대화를 선택하세요',
    'talk_smart_stay_secure': '스마트하게 대화하고 안전하게 유지하세요.',
    'powered_by_nebusis': 'Nebusis® 기술 지원',
    'search_conversations': '대화 검색...',
    'chat': '채팅',
    'compliance': '컴플라이언스',
    
    // Buttons
    'save_changes': '변경사항 저장',
    'cancel': '취소',
    'sign_out': '로그아웃',
    
    // Toast messages
    'language_selected': '언어 선택됨',
    'click_save_to_apply': '적용하려면 변경사항 저장을 클릭하세요.',
    'saving_settings': '설정 저장 중',
    'settings_saved_successfully': '설정이 성공적으로 저장되었습니다',
    'language_changed_to': '언어가 다음으로 변경됨',
    'all_preferences_saved': '모든 설정이 저장되었습니다!',
    
    // Storage tab
    'storage_data_management': '저장소 및 데이터 관리',
    'manage_media': '미디어 관리',
    'clear_cache': '캐시 지우기',
    'sync_data': '데이터 동기화',
  },
  
  ar: {
    // Main navigation
    'messages': 'الرسائل',
    'stories': 'القصص',
    'contacts': 'جهات الاتصال',
    'verification': 'التحقق',
    'admin': 'مشرف',
    'settings': 'الإعدادات',
    'logout': 'تسجيل الخروج',
    
    // Settings modal
    'wizspeak_settings': 'إعدادات WizSpeek®',
    'profile': 'الملف الشخصي',
    'groups': 'المجموعات',
    'themes': 'المواضيع',
    'backgrounds': 'الخلفيات',
    'storage': 'التخزين',
    'access': 'الوصول',
    'language': 'اللغة',
    'help': 'المساعدة',
    
    // Language tab
    'language_region': 'اللغة والمنطقة',
    'app_language': 'لغة التطبيق',
    'current_selection': 'الاختيار الحالي',
    'regional_settings': 'الإعدادات الإقليمية',
    'auto_detect_language': 'كشف اللغة تلقائياً',
    '24_hour_time_format': 'تنسيق 24 ساعة',
    'regional_number_format': 'تنسيق الأرقام الإقليمي',
    'translation': 'الترجمة',
    'auto_translate_messages': 'ترجمة الرسائل تلقائياً',
    'translation_suggestions': 'اقتراحات الترجمة',
    
    // Common UI elements
    'new_group': 'مجموعة جديدة',
    'link_device': 'ربط الجهاز',
    'direct_message': 'رسالة مباشرة',
    'group_chat': 'دردشة جماعية',
    'select_conversation': 'اختر محادثة لبدء الدردشة',
    'talk_smart_stay_secure': 'تحدث بذكاء. ابق آمناً.',
    'powered_by_nebusis': 'مدعوم من Nebusis®',
    'search_conversations': 'البحث في المحادثات...',
    'chat': 'دردشة',
    'compliance': 'الامتثال',
    
    // Buttons
    'save_changes': 'حفظ التغييرات',
    'cancel': 'إلغاء',
    'sign_out': 'تسجيل الخروج',
    
    // Toast messages
    'language_selected': 'تم اختيار اللغة',
    'click_save_to_apply': 'انقر على حفظ التغييرات للتطبيق.',
    'saving_settings': 'حفظ الإعدادات',
    'settings_saved_successfully': 'تم حفظ الإعدادات بنجاح',
    'language_changed_to': 'تم تغيير اللغة إلى',
    'all_preferences_saved': 'تم حفظ جميع التفضيلات!',
    
    // Storage tab
    'storage_data_management': 'إدارة التخزين والبيانات',
    'manage_media': 'إدارة الوسائط',
    'clear_cache': 'مسح التخزين المؤقت',
    'sync_data': 'مزامنة البيانات',
  },
  
  hi: {
    // Main navigation
    'messages': 'संदेश',
    'stories': 'कहानियां',
    'contacts': 'संपर्क',
    'verification': 'सत्यापन',
    'admin': 'व्यवस्थापक',
    'settings': 'सेटिंग्स',
    'logout': 'लॉग आउट',
    
    // Settings modal
    'wizspeak_settings': 'WizSpeek® सेटिंग्स',
    'profile': 'प्रोफ़ाइल',
    'groups': 'समूह',
    'themes': 'थीम',
    'backgrounds': 'पृष्ठभूमि',
    'storage': 'भंडारण',
    'access': 'पहुंच',
    'language': 'भाषा',
    'help': 'सहायता',
    
    // Language tab
    'language_region': 'भाषा और क्षेत्र',
    'app_language': 'ऐप की भाषा',
    'current_selection': 'वर्तमान चयन',
    'regional_settings': 'क्षेत्रीय सेटिंग्स',
    'auto_detect_language': 'भाषा स्वचालित रूप से पहचानें',
    '24_hour_time_format': '24 घंटे का प्रारूप',
    'regional_number_format': 'क्षेत्रीय संख्या प्रारूप',
    'translation': 'अनुवाद',
    'auto_translate_messages': 'संदेशों का स्वचालित अनुवाद',
    'translation_suggestions': 'अनुवाद सुझाव',
    
    // Common UI elements
    'new_group': 'नया समूह',
    'link_device': 'डिवाइस लिंक करें',
    'direct_message': 'प्रत्यक्ष संदेश',
    'group_chat': 'समूह चैट',
    'select_conversation': 'चैट शुरू करने के लिए एक बातचीत चुनें',
    'talk_smart_stay_secure': 'स्मार्ट बात करें। सुरक्षित रहें।',
    'powered_by_nebusis': 'Nebusis® द्वारा संचालित',
    'search_conversations': 'बातचीत खोजें...',
    'chat': 'चैट',
    'compliance': 'अनुपालन',
    
    // Buttons
    'save_changes': 'परिवर्तन सहेजें',
    'cancel': 'रद्द करें',
    'sign_out': 'साइन आउट',
    
    // Toast messages
    'language_selected': 'भाषा चुनी गई',
    'click_save_to_apply': 'लागू करने के लिए परिवर्तन सहेजें पर क्लिक करें।',
    'saving_settings': 'सेटिंग्स सहेजी जा रही हैं',
    'settings_saved_successfully': 'सेटिंग्स सफलतापूर्वक सहेजी गईं',
    'language_changed_to': 'भाषा बदलकर की गई',
    'all_preferences_saved': 'सभी प्राथमिकताएं सहेजी गईं!',
    
    // Storage tab
    'storage_data_management': 'भंडारण और डेटा प्रबंधन',
    'manage_media': 'मीडिया प्रबंधित करें',
    'clear_cache': 'कैश साफ़ करें',
    'sync_data': 'डेटा सिंक करें',
  }
};

export function useTranslation(language: string = 'en') {
  const t = (key: string): string => {
    const languageTranslations = translations[language as keyof typeof translations] || translations.en;
    return (languageTranslations as any)[key] || translations.en[key as keyof typeof translations.en] || key;
  };
  
  return { t };
}

export function getCurrentLanguage(): string {
  return localStorage.getItem('wizspeak_language') || 'en';
}