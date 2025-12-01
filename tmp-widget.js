(function () {
    'use strict';
    const script = document.currentScript || (document.scripts ? document.scripts[document.scripts.length - 1] : null);

    const inferDefaultApiUrl = () => {
        if (typeof window === 'undefined' || typeof window.location === 'undefined') {
            return 'https://app.knowrithm.org/api';
        }
        try {
            if (script && script.src) {
                const srcUrl = new URL(script.src, window.location.href);
                // Fix: Don't use the script origin if it's the same as window.location.origin
                // This handles cases where the script is served from a proxy
                if (srcUrl.origin !== window.location.origin) {
                    return `${srcUrl.origin.replace(/\/+$/, '')}/api`;
                }
            }
            // Always fall back to the production API URL instead of using current origin
            return 'https://app.knowrithm.org/api';
        } catch (error) {
            console.warn('Failed to infer API base from script source, defaulting to production API:', error);
            return 'https://app.knowrithm.org/api';
        }
    };

    const DEFAULT_API_URL = inferDefaultApiUrl();
    const KNOWN_MARKETING_DOMAINS = new Set([
        'knowrithm.com',
        'www.knowrithm.com',
        'knowrithm.org',
        'www.knowrithm.org'
    ]);
    const FILE_REFERENCE_HOSTS = new Set([
        'minio.knowrithm.org'
    ]);
    const LINK_REFERENCE_DESCRIPTOR = {
        type: 'link',
        icon: '->',
        color: '#2563eb'
    };

    const resolveFallbackOrigin = () => {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.origin;
        }
        return 'https://app.knowrithm.org';
    };

    const isHostedFileUrl = (candidate) => {
        if (!candidate) {
            return false;
        }
        const fallbackOrigin = resolveFallbackOrigin();
        try {
            const parsed = new URL(candidate, fallbackOrigin);
            const hostname = (parsed.hostname || '').toLowerCase();
            return FILE_REFERENCE_HOSTS.has(hostname);
        } catch (error) {
            return false;
        }
    };

    const ensureValidApiBase = (candidate) => {
        const fallbackOrigin = resolveFallbackOrigin();
        try {
            const parsed = new URL(candidate, fallbackOrigin);
            const hostname = (parsed.hostname || '').toLowerCase();
            const pathname = (parsed.pathname || '/').replace(/\/+$/, '') || '/';
            const isKnownMarketingHost = KNOWN_MARKETING_DOMAINS.has(hostname);
            const pointsToApi = /^\/?api(\/|$)/i.test(pathname);

            if (isKnownMarketingHost && !pointsToApi) {
                console.warn(
                    `AI Agent Widget: "${candidate}" resolves to ${hostname}${pathname}, which is not an API base. ` +
                    `Falling back to the default backend at ${DEFAULT_API_URL}.`
                );
                return DEFAULT_API_URL;
            }
            return parsed.href;
        } catch (error) {
            console.warn(
                'AI Agent Widget: Invalid apiUrl provided, falling back to the default backend.',
                error
            );
            return DEFAULT_API_URL;
        }
    };

    const resolveApiUrl = (base, path = '') => {
        const baseValue = (base || '').toString().trim();
        const pathValue = (path || '').toString().trim();
        const fallbackOrigin = (typeof window !== 'undefined' && window.location) ? window.location.origin : 'http://localhost';

        try {
            const baseUrl = baseValue ? new URL(baseValue, fallbackOrigin) : new URL(fallbackOrigin);
            if (!pathValue) {
                return baseUrl.href.replace(/\/+$/, '');
            }
            if (/^https?:\/\//i.test(pathValue)) {
                return pathValue;
            }
            const sanitizedPath = pathValue.startsWith('/') ? pathValue.substring(1) : pathValue;
            const resolved = new URL(sanitizedPath, `${baseUrl.href.replace(/\/+$/, '')}/`);
            return resolved.href;
        } catch (error) {
            console.warn('Falling back to manual URL resolution:', error);
            const sanitizedBase = (baseValue || fallbackOrigin).replace(/\/+$/, '');
            if (!pathValue) {
                return sanitizedBase;
            }
            if (/^https?:\/\//i.test(pathValue)) {
                return pathValue;
            }
            const [rawPath, query = ''] = pathValue.split('?');
            const normalizedPath = rawPath.replace(/^\/+/, '');
            const querySuffix = query ? `?${query}` : '';
            return `${sanitizedBase}/${normalizedPath}${querySuffix}`;
        }
    };

    const DEFAULT_CONFIG = {
        agentId: null,
        apiUrl: DEFAULT_API_URL,
        primaryColor: '#2563eb',
        color: '#2563eb',
        position: 'bottom-right',
        theme: 'light',
        buttonText: null,
        showBranding: true,
        pollingIntervalMs: 2500,
        autoOpen: false,
        initialOpenDelayMs: 0,
        persistSession: true,
        welcome: 'Hello! How can I help you today?',
        title: 'Chat Support'
    };

    const MESSAGE_ID_CACHE_LIMIT = 500;

    const booleanFrom = (value, fallback) => {
        if (value === undefined || value === null || value === '') {
            return fallback;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        const normalized = String(value).toLowerCase().trim();
        if (['true', '1', 'yes', 'on'].includes(normalized)) {
            return true;
        }
        if (['false', '0', 'no', 'off'].includes(normalized)) {
            return false;
        }
        return fallback;
    };

    const numberFrom = (value, fallback) => {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };

    const normaliseTheme = (value) => {
        const allowed = ['light', 'dark', 'auto'];
        if (!value) {
            return DEFAULT_CONFIG.theme;
        }
        const normalized = String(value).toLowerCase().trim();
        return allowed.includes(normalized) ? normalized : DEFAULT_CONFIG.theme;
    };

    const normalisePosition = (value) => {
        if (!value) {
            return DEFAULT_CONFIG.position;
        }
        const normalized = String(value).toLowerCase().replace(/\s+/g, '-').trim();
        const presets = new Set(['bottom-right', 'bottom-left', 'top-right', 'top-left']);
        if (presets.has(normalized)) {
            return normalized;
        }
        if (normalized === 'right') {
            return 'bottom-right';
        }
        if (normalized === 'left') {
            return 'bottom-left';
        }
        if (normalized === 'top') {
            return 'top-right';
        }
        if (normalized === 'bottom') {
            return 'bottom-right';
        }
        return DEFAULT_CONFIG.position;
    };

    const normaliseApiBase = (value) => {
        if (!value) {
            return DEFAULT_CONFIG.apiUrl;
        }
        let normalized = String(value).trim();
        if (!normalized) {
            return DEFAULT_CONFIG.apiUrl;
        }

        if (normalized.startsWith('//') && typeof window !== 'undefined' && window.location) {
            normalized = `${window.location.protocol}${normalized}`;
        }

        const resolved = resolveApiUrl(normalized, '');
        const ensured = ensureValidApiBase(resolved || normalized || DEFAULT_CONFIG.apiUrl);
        return (ensured || DEFAULT_CONFIG.apiUrl)
            .replace(/\/+$/, '')
            .replace(/\/v\d+$/i, '');
    };

    const readScriptConfig = (tag) => {
        if (!tag) {
            return {};
        }
        const dataset = tag.dataset || {};
        return {
            agentId: tag.getAttribute('data-agent-id') || dataset.agentId,
            apiUrl: tag.getAttribute('data-api-url') || dataset.apiUrl,
            primaryColor: tag.getAttribute('data-primary-color') || tag.getAttribute('data-color') || dataset.primaryColor || dataset.color,
            color: tag.getAttribute('data-color') || dataset.color,
            position: tag.getAttribute('data-position') || dataset.position,
            theme: tag.getAttribute('data-theme') || dataset.theme,
            buttonText: tag.getAttribute('data-button-text') || dataset.buttonText,
            showBranding: tag.getAttribute('data-show-branding') || dataset.showBranding,
            pollingIntervalMs: tag.getAttribute('data-polling-interval') || dataset.pollingInterval || dataset.pollInterval,
            autoOpen: tag.getAttribute('data-auto-open') || dataset.autoOpen,
            initialOpenDelayMs: tag.getAttribute('data-initial-delay') || dataset.initialDelay || dataset.initialDelayMs,
            persistSession: tag.getAttribute('data-persist-session') || dataset.persistSession,
            welcome: tag.getAttribute('data-welcome') || dataset.welcome,
            title: tag.getAttribute('data-title') || dataset.title
        };
    };

    const readGlobalConfig = () => {
        if (typeof window === 'undefined') {
            return {};
        }
        const globalConfig = window.AIChatWidget;
        if (!globalConfig) {
            return {};
        }
        if (typeof globalConfig === 'function') {
            try {
                return globalConfig();
            } catch (error) {
                console.warn('AI Agent Widget: Global config function threw an error:', error);
                return {};
            }
        }
        if (typeof globalConfig === 'object') {
            return globalConfig;
        }
        return {};
    };

    const rawConfig = {
        ...DEFAULT_CONFIG,
        ...readScriptConfig(script),
        ...readGlobalConfig()
    };

    const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

    const normaliseHexColor = (value) => {
        if (!value) {
            return null;
        }
        let hex = String(value).trim();
        if (!hex.startsWith('#')) {
            hex = `#${hex}`;
        }
        if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        if (/^#([0-9a-fA-F]{4})$/.test(hex)) {
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}${hex[4]}${hex[4]}`;
        }
        if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex)) {
            return hex.toLowerCase();
        }
        return null;
    };

    const hexToRgb = (hex) => {
        const normalized = normaliseHexColor(hex);
        if (!normalized) {
            return null;
        }
        const value = normalized.slice(1);
        const hasAlpha = value.length === 8;
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        const a = hasAlpha ? parseInt(value.slice(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    };

    const rgbToHex = ({ r, g, b, a }) => {
        const alpha = a !== undefined && a < 1 ? Math.round(clampValue(a, 0, 1) * 255) : null;
        const hex = [r, g, b].map((channel) => clampValue(Math.round(channel), 0, 255).toString(16).padStart(2, '0')).join('');
        if (alpha !== null) {
            return `#${hex}${alpha.toString(16).padStart(2, '0')}`;
        }
        return `#${hex}`;
    };

    const shadeHexColor = (hex, percent) => {
        const rgb = hexToRgb(hex);
        if (!rgb) {
            return null;
        }
        const factor = clampValue(percent, -1, 1);
        const shade = (channel) => {
            const delta = factor >= 0 ? (255 - channel) * factor : channel * factor;
            return clampValue(channel + delta, 0, 255);
        };
        return rgbToHex({
            r: shade(rgb.r),
            g: shade(rgb.g),
            b: shade(rgb.b),
            a: rgb.a
        });
    };

    const getReadableTextColor = (hex) => {
        const rgb = hexToRgb(hex);
        if (!rgb) {
            return '#ffffff';
        }
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.6 ? '#000000' : '#ffffff';
    };

    const appearance = rawConfig.appearance || {};
    const behavior = rawConfig.behavior || {};

    const config = {
        agentId: rawConfig.agentId || null,
        apiUrl: normaliseApiBase(rawConfig.apiUrl || behavior.apiUrl || DEFAULT_CONFIG.apiUrl),
        primaryColor: normaliseHexColor(rawConfig.primaryColor || rawConfig.color || appearance.primaryColor) || DEFAULT_CONFIG.primaryColor,
        color: normaliseHexColor(rawConfig.primaryColor || rawConfig.color || appearance.primaryColor || DEFAULT_CONFIG.color) || DEFAULT_CONFIG.color,
        position: normalisePosition(rawConfig.position || appearance.position || appearance.placement),
        theme: normaliseTheme(rawConfig.theme || appearance.theme),
        buttonText: rawConfig.buttonText != null
            ? String(rawConfig.buttonText)
            : (appearance.buttonText != null ? String(appearance.buttonText) : DEFAULT_CONFIG.buttonText),
        showBranding: booleanFrom(
            rawConfig.showBranding !== undefined ? rawConfig.showBranding : appearance.showBranding,
            DEFAULT_CONFIG.showBranding
        ),
        pollingIntervalMs: numberFrom(
            rawConfig.pollingIntervalMs || rawConfig.pollingInterval || behavior.pollingInterval,
            DEFAULT_CONFIG.pollingIntervalMs
        ),
        autoOpen: booleanFrom(
            rawConfig.autoOpen !== undefined ? rawConfig.autoOpen : behavior.autoOpen,
            DEFAULT_CONFIG.autoOpen
        ),
        initialOpenDelayMs: numberFrom(
            rawConfig.initialOpenDelayMs || rawConfig.initialDelay || behavior.initialDelay,
            DEFAULT_CONFIG.initialOpenDelayMs
        ),
        persistSession: booleanFrom(
            rawConfig.persistSession !== undefined ? rawConfig.persistSession : behavior.persistSession,
            DEFAULT_CONFIG.persistSession
        ),
        welcome: rawConfig.welcome || DEFAULT_CONFIG.welcome,
        title: rawConfig.title || DEFAULT_CONFIG.title
    };

    if (typeof window !== 'undefined') {
        window.AIChatWidgetConfig = config;
    }

    if (!config.agentId || !config.apiUrl) {
        console.error('AI Agent Widget: Missing required configuration (agent-id or api-url)');
        return;
    }

    class AIAgentWidget {
        constructor(config) {
            this.config = config;
            this.isOpen = false;
            this.conversationId = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.leadData = null;
            this.leadPayload = null;
            this.messages = [];
            this.isLoading = false;
            this.isRegistered = false;
            this.agentData = null;
            this.companyId = null;
            this.handshakeTaskId = null;
            this.apiOrigin = this.getApiOrigin(this.config.apiUrl);
            this.socket = null;
            this.socketAuthToken = null;
            this.socketConnectPromise = null;
            this.socketConnected = false;
            this.joinedConversationId = null;
            this.pendingResponseQueue = [];
            this.socketHandlersRegistered = false;
            this.renderedMessageIds = new Set();
            this.pendingUserMessages = [];
            this.previewModalElements = null;
            this.boundPreviewEscapeHandler = (event) => this.handlePreviewEscape(event);
            this.pollingTimer = null;
            this.pollingActive = false;
            this.pollingIntervalMs = this.config.pollingIntervalMs;
            this.socketEnabled = true;
            this.themeMediaQuery = null;
            this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
            this.socketRetryTimer = null;
            this.restoreSession();

            this.handleSocketConnect = this.handleSocketConnect.bind(this);
            this.handleSocketDisconnect = this.handleSocketDisconnect.bind(this);
            this.handleSocketConnectError = this.handleSocketConnectError.bind(this);
            this.handleChatStatus = this.handleChatStatus.bind(this);
            this.handleChatResponse = this.handleChatResponse.bind(this);
            this.handleConversationJoined = this.handleConversationJoined.bind(this);
            this.handleConversationError = this.handleConversationError.bind(this);

            this.init();
        }

        async init() {
            try {
                await this.registerPageContext();
                // First fetch agent data
                await this.fetchAgentData();
                // Then create the widget with the fetched data
                this.createStyles();
                this.createWidget();
                this.bindEvents();
                await this.resumeSessionIfAvailable();
                if (this.config.autoOpen && !this.isRegistered && typeof window !== 'undefined') {
                    const delay = Math.max(0, this.config.initialOpenDelayMs || 0);
                    window.setTimeout(() => {
                        if (!this.isOpen) {
                            this.openChat();
                        }
                    }, delay);
                }
            } catch (error) {
                console.error('Failed to initialize AI Agent Widget:', error);
            }
        }

        async registerPageContext() {
            try {
                if (!window || !window.location) {
                    return;
                }
                const payload = {
                    agent_id: this.config.agentId,
                    url: window.location.href,
                    title: document.title || '',
                    trigger_crawl: false
                };
                const response = await fetch(resolveApiUrl(this.config.apiUrl, '/v1/website/handshake'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    return;
                }
                const data = await response.json();
                this.handshakeTaskId = data.crawl_task_id || null;
            } catch (error) {
                console.warn('Website handshake failed:', error);
            }
        }

        async fetchAgentData() {
            try {
                const response = await fetch(resolveApiUrl(this.config.apiUrl, `/v1/agent/${this.config.agentId}`), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch agent data: ${response.status}`);
                }

                const data = await response.json();
                this.agentData = data.agent;
                this.companyId = this.agentData.company_id;

                // Update config with agent data
                this.config.welcome = this.getWelcomeMessage();
                this.config.title = this.agentData.name || 'Chat Support';

            } catch (error) {
                console.error('Error fetching agent data:', error);
                throw error;
            }
        }

        getApiOrigin(apiUrl) {
            try {
                if (!apiUrl) {
                    return window.location.origin;
                }
                const url = new URL(apiUrl, window.location.origin);
                return url.origin;
            } catch (error) {
                console.warn('Failed to resolve API origin, falling back to window origin:', error);
                return window.location.origin;
            }
        }

        getWelcomeMessage() {
            // You can customize this logic based on your agent's personality_traits or description
            if (this.agentData.description) {
                return `Hello! I'm ${this.agentData.name}. ${this.agentData.description}`;
            }
            return `Hello! I'm ${this.agentData.name}. How can I help you today?`;
        }

        getAgentInitials() {
            const name = this.agentData && this.agentData.name
                ? String(this.agentData.name)
                : '';
            const trimmed = name.trim();
            if (!trimmed) {
                return 'AI';
            }
            const parts = trimmed.split(/\s+/);
            if (parts.length === 1) {
                return parts[0].slice(0, 2).toUpperCase();
            }
            const first = parts[0].charAt(0);
            const last = parts[parts.length - 1].charAt(0);
            return `${first}${last}`.toUpperCase();
        }

        getStorageKey() {
            return `ai-agent-widget::${this.config.agentId}`;
        }

        restoreSession() {
            if (!this.config.persistSession) {
                return;
            }
            if (typeof window === 'undefined') {
                return;
            }
            try {
                const storage = window.localStorage;
                if (!storage) {
                    return;
                }
                const raw = storage.getItem(this.getStorageKey());
                if (!raw) {
                    return;
                }
                const data = JSON.parse(raw);
                if (!data || data.agentId !== this.config.agentId) {
                    return;
                }
                this.accessToken = data.accessToken || null;
                this.refreshToken = data.refreshToken || null;
                this.leadData = data.leadData || null;
                this.leadPayload = data.leadPayload || null;
                this.conversationId = data.conversationId || null;
                if (this.conversationId && this.accessToken) {
                    this.isRegistered = true;
                }
            } catch (error) {
                console.warn('AI Agent Widget: Failed to restore session.', error);
            }
        }

        persistSession() {
            if (!this.config.persistSession) {
                return;
            }
            if (typeof window === 'undefined') {
                return;
            }
            const payload = {
                agentId: this.config.agentId,
                accessToken: this.accessToken || null,
                refreshToken: this.refreshToken || null,
                leadData: this.leadData || null,
                leadPayload: this.leadPayload || null,
                conversationId: this.conversationId || null,
                updatedAt: Date.now()
            };
            try {
                const storage = window.localStorage;
                if (!storage) {
                    return;
                }
                storage.setItem(this.getStorageKey(), JSON.stringify(payload));
            } catch (error) {
                console.warn('AI Agent Widget: Failed to persist session.', error);
            }
        }

        clearPersistedSession() {
            if (!this.config.persistSession) {
                return;
            }
            if (typeof window === 'undefined') {
                return;
            }
            try {
                const storage = window.localStorage;
                if (!storage) {
                    return;
                }
                storage.removeItem(this.getStorageKey());
            } catch (error) {
                console.warn('AI Agent Widget: Failed to clear session.', error);
            }
            if (this.socketRetryTimer) {
                clearTimeout(this.socketRetryTimer);
                this.socketRetryTimer = null;
            }
        }

        resolveThemePreference() {
            if (this.config.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return this.config.theme;
        }

        getThemePalette() {
            const resolved = this.resolveThemePreference();
            if (resolved === 'dark') {
                return {
                    surface: '#111827',
                    surfaceElevated: '#1f2937',
                    text: '#ffffff', // Pure white for better contrast
                    strongText: '#ffffff',
                    muted: '#9ca3af',
                    border: '#374151',
                    assistantBg: '#1f2937',
                    assistantText: '#ffffff', // Pure white
                    inputBg: '#1f2937',
                    inputBorder: '#4b5563',
                    loadingText: '#d1d5db',
                    errorBg: '#7f1d1d',
                    errorText: '#fecaca',
                    scrollbar: '#4b5563',
                    scrollbarHover: '#6b7280',
                    primaryContrast: getReadableTextColor(this.config.color) || '#ffffff'
                };
            }
            return {
                surface: '#ffffff',
                surfaceElevated: '#ffffff',
                text: '#000000', // Pure black for better contrast
                strongText: '#000000',
                muted: '#4b5563', // Darker gray for muted text
                border: '#e5e7eb',
                assistantBg: '#f3f4f6',
                assistantText: '#000000', // Pure black
                inputBg: '#ffffff',
                inputBorder: '#e5e7eb',
                loadingText: '#4b5563',
                errorBg: '#fee2e2',
                errorText: '#b91c1c',
                scrollbar: '#c1c1c1',
                scrollbarHover: '#a8a8a8',
                primaryContrast: getReadableTextColor(this.config.color) || '#ffffff'
            };
        }

        applyThemeVariables(target = this.widget) {
            if (!target) {
                return;
            }
            const palette = this.getThemePalette();
            const primary = normaliseHexColor(this.config.color) || DEFAULT_CONFIG.primaryColor;
            const primaryHover = shadeHexColor(primary, -0.12) || primary;
            const primaryActive = shadeHexColor(primary, -0.2) || primary;
            const primaryContrast = palette.primaryContrast || getReadableTextColor(primary);
            const userTextColor = getReadableTextColor(primary);

            target.style.setProperty('--ai-color-primary', primary);
            target.style.setProperty('--ai-color-primary-hover', primaryHover);
            target.style.setProperty('--ai-color-primary-active', primaryActive);
            target.style.setProperty('--ai-color-primary-contrast', primaryContrast);
            target.style.setProperty('--ai-color-user-text', userTextColor);
            target.style.setProperty('--ai-color-surface', palette.surface);
            target.style.setProperty('--ai-color-surface-elevated', palette.surfaceElevated);
            target.style.setProperty('--ai-color-text', palette.text);
            target.style.setProperty('--ai-color-strong-text', palette.strongText);
            target.style.setProperty('--ai-color-muted', palette.muted);
            target.style.setProperty('--ai-color-border', palette.border);
            target.style.setProperty('--ai-color-assistant-bg', palette.assistantBg);
            target.style.setProperty('--ai-color-assistant-text', palette.assistantText);
            target.style.setProperty('--ai-color-input-bg', palette.inputBg);
            target.style.setProperty('--ai-color-input-border', palette.inputBorder);
            target.style.setProperty('--ai-color-loading-text', palette.loadingText);
            target.style.setProperty('--ai-color-error-bg', palette.errorBg);
            target.style.setProperty('--ai-color-error-text', palette.errorText);
            target.style.setProperty('--ai-color-scrollbar', palette.scrollbar || '#c1c1c1');
            target.style.setProperty('--ai-color-scrollbar-hover', palette.scrollbarHover || '#a8a8a8');
            target.dataset.resolvedTheme = this.resolveThemePreference();
        }

        setupThemeWatcher() {
            if (this.config.theme !== 'auto' || typeof window === 'undefined' || !window.matchMedia) {
                return;
            }
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            this.themeMediaQuery = media;
            if (media.addEventListener) {
                media.addEventListener('change', this.handleSystemThemeChange);
            } else if (media.addListener) { // Safari legacy
                media.addListener(this.handleSystemThemeChange);
            }
        }

        handleSystemThemeChange() {
            this.applyThemeVariables(this.widget);
        }

        async resumeSessionIfAvailable() {
            if (!this.config.persistSession) {
                return;
            }
            if (!this.conversationId || !this.accessToken) {
                return;
            }

            this.isRegistered = true;

            if (this.registrationSection) {
                this.registrationSection.classList.add('hidden');
            }
            if (this.messagesContainer) {
                this.messagesContainer.classList.remove('hidden');
            }
            if (this.inputContainer) {
                this.inputContainer.classList.remove('hidden');
            }

            try {
                await this.loadConversationHistory({ initial: true });
                await this.startRealtimeUpdates();
            } catch (error) {
                console.warn('AI Agent Widget: Failed to resume previous session.', error);
                this.isRegistered = false;
                this.conversationId = null;
                this.accessToken = null;
                this.refreshToken = null;
                this.clearPersistedSession();
            }
        }

        createStyles() {
            const palette = this.getThemePalette();
            const primaryColor = normaliseHexColor(this.config.color) || DEFAULT_CONFIG.primaryColor;
            const primaryHover = shadeHexColor(primaryColor, -0.12) || primaryColor;
            const primaryActive = shadeHexColor(primaryColor, -0.2) || primaryColor;
            const primaryContrast = palette.primaryContrast || getReadableTextColor(primaryColor);
            const userTextColor = getReadableTextColor(primaryColor);
            const scrollbarColor = palette.scrollbar || '#c1c1c1';
            const scrollbarHoverColor = palette.scrollbarHover || '#a8a8a8';

            const style = document.createElement('style');
            style.textContent = `

                /* Modern Reset & Fonts */
                .ai-chat-widget * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                .ai-chat-widget {
                    position: fixed;
                    z-index: 10000;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: calc(100vw - 32px);
                    color: var(--ai-color-text);
                    
                    /* CSS Variables */
                    --ai-color-primary: ${primaryColor};
                    --ai-color-primary-hover: ${primaryHover};
                    --ai-color-primary-active: ${primaryActive};
                    --ai-color-primary-contrast: ${primaryContrast};
                    --ai-color-user-text: ${userTextColor};
                    --ai-color-surface: ${palette.surface};
                    --ai-color-surface-elevated: ${palette.surfaceElevated};
                    --ai-color-text: ${palette.text};
                    --ai-color-strong-text: ${palette.strongText};
                    --ai-color-muted: ${palette.muted};
                    --ai-color-border: ${palette.border};
                    --ai-color-assistant-bg: ${palette.assistantBg};
                    --ai-color-assistant-text: ${palette.assistantText};
                    --ai-color-input-bg: ${palette.inputBg};
                    --ai-color-input-border: ${palette.inputBorder};
                    --ai-color-loading-text: ${palette.loadingText};
                    --ai-color-error-bg: ${palette.errorBg};
                    --ai-color-error-text: ${palette.errorText};
                    --ai-color-scrollbar: ${scrollbarColor};
                    --ai-color-scrollbar-hover: ${scrollbarHoverColor};
                    
                    /* Modern Design Tokens */
                    --ai-shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
                    --ai-shadow-md: 0 8px 24px rgba(0,0,0,0.12);
                    --ai-shadow-lg: 0 16px 48px rgba(0,0,0,0.18);
                    --ai-radius-lg: 20px;
                    --ai-radius-md: 12px;
                    --ai-radius-sm: 8px;
                    --ai-transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }

                /* Position Utilities */
                .ai-chat-position-bottom-right { bottom: 24px; right: 24px; }
                .ai-chat-position-bottom-left { bottom: 24px; left: 24px; }
                .ai-chat-position-top-right { top: 24px; right: 24px; }
                .ai-chat-position-top-left { top: 24px; left: 24px; }
                
                /* Toggle Button */
                .ai-chat-button {
                    min-width: 64px;
                    height: 64px;
                    border-radius: 32px;
                    background: linear-gradient(135deg, var(--ai-color-primary), var(--ai-color-primary-active));
                    color: var(--ai-color-primary-contrast);
                    border: none;
                    cursor: pointer;
                    box-shadow: var(--ai-shadow-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 0;
                    transition: var(--ai-transition);
                    position: relative;
                    overflow: hidden;
                    z-index: 10001;
                }
                
                .ai-chat-button::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .ai-chat-button:not(:disabled):hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: var(--ai-shadow-lg);
                }
                
                .ai-chat-button:not(:disabled):hover::after {
                    opacity: 1;
                }

                .ai-chat-button:active {
                    transform: translateY(0) scale(0.98);
                }

                .ai-chat-button--with-text {
                    padding: 0 28px 0 8px;
                    width: auto;
                }

                .ai-chat-button-text {
                    display: none;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    color: var(--ai-color-primary-contrast);
                    margin-right: 4px;
                }

                .ai-chat-button--with-text .ai-chat-button-text {
                    display: inline-block;
                }

                .ai-chat-button-visual {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                    background: rgba(255, 255, 255, 0.15);
                    flex-shrink: 0;
                    backdrop-filter: blur(4px);
                }

                .ai-chat-button-icon-wrapper {
                    display: inline-flex;
                    width: 24px;
                    height: 24px;
                    fill: currentColor;
                }

                .ai-chat-button-avatar-img {
                    display: none;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .ai-chat-button-visual--has-image .ai-chat-button-avatar-img {
                    display: block;
                }

                .ai-chat-button-visual--has-image .ai-chat-button-icon-wrapper {
                    display: none;
                }

                /* Chat Window */
                .ai-chat-window {
                    position: absolute;
                    right: 0;
                    width: min(380px, calc(100vw - 40px));
                    height: min(650px, calc(100vh - 140px));
                    background: var(--ai-color-surface);
                    border-radius: var(--ai-radius-lg);
                    box-shadow: var(--ai-shadow-lg);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: var(--ai-transition);
                    transform-origin: bottom right;
                }

                /* Dark mode adjustments for window */
                [data-theme="dark"] .ai-chat-window {
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                }

                .ai-chat-position-bottom-right .ai-chat-window,
                .ai-chat-position-bottom-left .ai-chat-window {
                    bottom: 90px;
                    top: auto;
                }

                .ai-chat-position-bottom-left .ai-chat-window {
                    left: 0;
                    right: auto;
                    transform-origin: bottom left;
                }

                .ai-chat-position-top-right .ai-chat-window,
                .ai-chat-position-top-left .ai-chat-window {
                    top: 90px;
                    bottom: auto;
                    transform-origin: top right;
                }

                .ai-chat-position-top-left .ai-chat-window {
                    left: 0;
                    right: auto;
                    transform-origin: top left;
                }
                
                .ai-chat-window.open {
                    display: flex;
                    animation: aiSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                @keyframes aiSlideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                /* Header */
                .ai-chat-header {
                    background: var(--ai-color-surface);
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--ai-color-border);
                    position: relative;
                    z-index: 10;
                }
                
                .ai-chat-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--ai-color-strong-text);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    letter-spacing: -0.01em;
                }
                
                .ai-chat-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--ai-color-primary), var(--ai-color-primary-active));
                    color: var(--ai-color-primary-contrast);
                    font-size: 14px;
                    font-weight: 700;
                    box-shadow: var(--ai-shadow-sm);
                    text-transform: uppercase;
                }

                .ai-chat-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .ai-chat-avatar--fallback {
                    background: linear-gradient(135deg, var(--ai-color-primary), var(--ai-color-primary-active));
                }
                
                .ai-chat-close {
                    background: transparent;
                    border: none;
                    color: var(--ai-color-muted);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 24px;
                    line-height: 1;
                }
                
                .ai-chat-close:hover {
                    background: rgba(0,0,0,0.05);
                    color: var(--ai-color-text);
                }
                
                /* Content Area */
                .ai-chat-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    background: var(--ai-color-surface);
                }
                
                /* Registration Form */
                .ai-chat-registration {
                    padding: 32px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    justify-content: flex-start;
                    height: 100%;
                    overflow-y: auto;
                }
                
                .ai-chat-registration h3 {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--ai-color-strong-text);
                    margin-bottom: 8px;
                    text-align: center;
                }
                
                .ai-chat-registration p {
                    color: var(--ai-color-muted);
                    font-size: 15px;
                    text-align: center;
                    margin-bottom: 24px;
                    line-height: 1.5;
                }
                
                .ai-chat-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .ai-chat-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .ai-chat-form label {
                    font-size: 13px;
                    color: var(--ai-color-strong-text);
                    font-weight: 600;
                }
                
                .ai-chat-form input {
                    padding: 14px;
                    border-radius: 12px;
                    border: 1px solid var(--ai-color-border);
                    background: var(--ai-color-input-bg);
                    font-size: 15px;
                    outline: none;
                    color: var(--ai-color-text);
                    transition: all 0.2s;
                }
                
                .ai-chat-form input:focus {
                    border-color: var(--ai-color-primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                
                .ai-chat-form input.error {
                    border-color: var(--ai-color-error-text);
                    background: rgba(254, 226, 226, 0.1);
                }
                
                .ai-chat-form-error {
                    color: var(--ai-color-error-text);
                    font-size: 12px;
                    margin-top: 4px;
                }
                
                .ai-chat-register-btn {
                    height: 48px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    background: linear-gradient(135deg, var(--ai-color-primary), var(--ai-color-primary-active));
                    color: var(--ai-color-primary-contrast);
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: var(--ai-shadow-sm);
                    margin-top: 12px;
                }
                
                .ai-chat-register-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--ai-shadow-md);
                }

                .ai-chat-register-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .ai-chat-register-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                /* Messages Area */
                .ai-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    scroll-behavior: smooth;
                }

                .ai-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }
                
                .ai-chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .ai-chat-messages::-webkit-scrollbar-thumb {
                    background: var(--ai-color-scrollbar);
                    border-radius: 3px;
                }
                
                .ai-chat-messages::-webkit-scrollbar-thumb:hover {
                    background: var(--ai-color-scrollbar-hover);
                }
                
                .ai-chat-message {
                    max-width: 85%;
                    padding: 14px 18px;
                    font-size: 15px;
                    line-height: 1.6;
                    position: relative;
                    word-break: break-word;
                    animation: aiMessageFade 0.3s ease-out forwards;
                }
                
                @keyframes aiMessageFade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .ai-chat-message.user {
                    background: linear-gradient(135deg, var(--ai-color-primary), var(--ai-color-primary-active));
                    color: var(--ai-color-user-text);
                    align-self: flex-end;
                    border-radius: 20px 20px 4px 20px;
                    box-shadow: var(--ai-shadow-sm);
                }

                .ai-chat-message.assistant {
                    background: var(--ai-color-assistant-bg);
                    color: var(--ai-color-assistant-text);
                    align-self: flex-start;
                    border-radius: 20px 20px 20px 4px;
                }

                .ai-chat-message.assistant strong {
                    font-weight: 600;
                    color: var(--ai-color-strong-text);
                }

                .ai-chat-message.assistant em {
                    font-style: italic;
                    color: var(--ai-color-muted);
                }

                .ai-chat-message.assistant ul {
                    margin-top: 8px;
                    margin-left: 20px;
                    list-style-type: disc;
                }

                .ai-chat-message.assistant a {
                    color: var(--ai-color-primary);
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                
                /* Input Area */
                .ai-chat-input-container {
                    padding: 20px;
                    background: var(--ai-color-surface);
                    border-top: 1px solid var(--ai-color-border);
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                
                .ai-chat-input {
                    flex: 1;
                    padding: 14px 18px;
                    border: 1px solid var(--ai-color-input-border);
                    border-radius: 24px;
                    font-size: 15px;
                    outline: none;
                    resize: none;
                    min-height: 50px;
                    max-height: 120px;
                    background: var(--ai-color-input-bg);
                    color: var(--ai-color-text);
                    transition: border-color 0.2s, box-shadow 0.2s;
                    line-height: 1.5;
                }
                
                .ai-chat-input:focus {
                    border-color: var(--ai-color-primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                
                .ai-chat-send {
                    background: var(--ai-color-primary);
                    color: var(--ai-color-primary-contrast);
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.2s;
                    box-shadow: var(--ai-shadow-sm);
                }
                
                .ai-chat-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: var(--ai-color-muted);
                }

                .ai-chat-send:not(:disabled):hover {
                    transform: scale(1.05);
                    background: var(--ai-color-primary-hover);
                    box-shadow: var(--ai-shadow-md);
                }

                .ai-chat-send:not(:disabled):active {
                    transform: scale(0.95);
                }

                .ai-chat-send-icon {
                    display: inline-flex;
                    width: 20px;
                    height: 20px;
                    fill: currentColor;
                    margin-left: 2px; /* Visual balance */
                }
                
                /* Loading & Error States */
                .ai-chat-loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    color: var(--ai-color-loading-text);
                    font-size: 13px;
                    font-weight: 500;
                    opacity: 0.8;
                }
                
                .ai-chat-loading-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .ai-chat-loading-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--ai-color-primary);
                    border-radius: 50%;
                    animation: loading 1.4s infinite ease-in-out;
                }
                
                .ai-chat-loading-dot:nth-child(1) { animation-delay: -0.32s; }
                .ai-chat-loading-dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes loading {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1.1); }
                }
                
                .ai-chat-error {
                    background: var(--ai-color-error-bg);
                    color: var(--ai-color-error-text);
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 13px;
                    text-align: center;
                    margin: 8px 0;
                    border: 1px solid rgba(220, 38, 38, 0.1);
                }

                /* Branding */
                .ai-chat-branding {
                    padding: 12px;
                    font-size: 11px;
                    text-align: center;
                    color: var(--ai-color-muted);
                    opacity: 0.8;
                }
                
                .hidden {
                    display: none !important;
                }

                /* Content Styling */
                .ai-chat-widget .ai-response-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .ai-chat-widget .ai-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .ai-chat-widget .ai-paragraph {
                    margin: 0;
                    line-height: 1.7;
                    color: var(--ai-color-assistant-text);
                    font-size: 15px;
                }

                .ai-chat-widget .citation-marker {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 4px;
                    padding: 2px 8px;
                    background: rgba(37, 99, 235, 0.1);
                    color: var(--ai-color-primary);
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    vertical-align: super;
                    line-height: 1;
                    border: 1px solid rgba(37, 99, 235, 0.2);
                }

                .ai-chat-widget .citation-marker:hover {
                    background: var(--ai-color-primary);
                    color: var(--ai-color-primary-contrast);
                    transform: translateY(-1px);
                }

                /* References Section */
                /* References Section */
                .ai-chat-widget .references-section {
                    margin-top: 1.5rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid var(--ai-color-border);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .ai-chat-widget .references-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .ai-chat-widget .references-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--ai-color-strong-text);
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ai-chat-widget .references-count {
                    background: var(--ai-color-surface-elevated);
                    color: var(--ai-color-muted);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                    border: 1px solid var(--ai-color-border);
                }

                .ai-chat-widget .references-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 12px;
                }

                .ai-chat-widget .reference-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    border: 1px solid var(--ai-color-border);
                    border-radius: 12px;
                    background: var(--ai-color-surface);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .ai-chat-widget .reference-item:hover {
                    background: var(--ai-color-surface-elevated);
                    border-color: var(--ai-color-primary);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transform: translateY(-1px);
                }

                .ai-chat-widget .reference-item--highlight {
                    border-color: var(--ai-color-primary);
                    background: rgba(37, 99, 235, 0.04);
                    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.1);
                }

                .ai-chat-widget .reference-item--disabled {
                    opacity: 0.7;
                    background: var(--ai-color-surface-elevated);
                    cursor: not-allowed;
                }

                .ai-chat-widget .reference-number {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    border-radius: 6px;
                    background: var(--ai-color-primary);
                    color: var(--ai-color-primary-contrast);
                    font-size: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                }

                .ai-chat-widget .reference-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    min-width: 0;
                }

                .ai-chat-widget .reference-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                }

                .ai-chat-widget .file-type-icon {
                    font-size: 14px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                }

                .ai-chat-widget .reference-name-link {
                    background: none;
                    border: none;
                    padding: 0;
                    margin: 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--ai-color-text);
                    text-align: left;
                    cursor: pointer;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    flex: 1;
                    transition: color 0.2s;
                    line-height: 1.4;
                    word-break: normal; /* Prevent vertical text */
                }

                /* Toggle button visibility is handled by media queries */
                
                .ai-chat-widget .reference-name-link:hover:not(:disabled) {
                    color: var(--ai-color-primary);
                }

                .ai-chat-widget .reference-name-link:disabled {
                    cursor: default;
                    color: var(--ai-color-text);
                }

                .ai-chat-widget .file-extension {
                    font-size: 9px;
                    font-weight: 700;
                    color: var(--ai-color-muted);
                    background: var(--ai-color-surface-elevated);
                    border: 1px solid var(--ai-color-border);
                    padding: 1px 5px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    flex-shrink: 0;
                }

                .ai-chat-widget .reference-actions {
                    display: flex;
                    width: 100%;
                    margin-top: 2px;
                }

                .ai-chat-widget .btn-preview {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 8px;
                    border: 1px solid var(--ai-color-border);
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: var(--ai-color-surface);
                    color: var(--ai-color-text);
                }

                .ai-chat-widget .btn-preview:not(:disabled):hover {
                    background: var(--ai-color-surface-elevated);
                    border-color: var(--ai-color-primary);
                    color: var(--ai-color-primary);
                }

                .ai-chat-widget .btn-preview:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .ai-chat-widget .btn-preview .icon {
                    width: 14px;
                    height: 14px;
                }

                /* Modal Overlay */
                .ai-chat-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2147483647;
                    backdrop-filter: blur(8px);
                    animation: aiFadeIn 0.3s ease-out;
                }
                
                @keyframes aiFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .ai-chat-modal-container {
                    background: var(--ai-color-surface);
                    border-radius: 24px;
                    width: min(95vw, 1100px);
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: aiSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid var(--ai-color-border);
                    overflow: hidden;
                }
                
                @keyframes aiSlideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .ai-chat-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--ai-color-border);
                    background: var(--ai-color-surface);
                }

                .ai-chat-modal-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--ai-color-strong-text);
                }

                .ai-chat-modal-subtitle {
                    font-size: 13px;
                    color: var(--ai-color-muted);
                    margin-top: 2px;
                }

                .ai-chat-modal-btn-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    border: none;
                    background: var(--ai-color-surface-elevated);
                    color: var(--ai-color-text);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ai-chat-modal-btn-icon:hover {
                    background: var(--ai-color-border);
                    transform: scale(1.05);
                }

                .ai-chat-modal-body {
                    padding: 24px;
                    overflow: auto;
                    background: var(--ai-color-surface-elevated);
                }

                .ai-chat-modal-content {
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Preview Types */
                .ai-chat-text-preview {
                    background: var(--ai-color-surface);
                    border: 1px solid var(--ai-color-border);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: var(--ai-shadow-sm);
                }

                .ai-chat-text-content {
                    font-family: 'JetBrains Mono', 'Menlo', 'Monaco', monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    color: var(--ai-color-text);
                    line-height: 1.6;
                }
                
                .ai-chat-image-preview {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: var(--ai-color-surface);
                    border-radius: 16px;
                    border: 1px solid var(--ai-color-border);
                }
                
                .ai-chat-preview-image {
                    max-width: 100%;
                    max-height: 70vh;
                    border-radius: 8px;
                    box-shadow: var(--ai-shadow-md);
                }
                
                .ai-chat-pdf-preview {
                    height: 70vh;
                    background: var(--ai-color-surface);
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid var(--ai-color-border);
                }
                
                .ai-chat-pdf-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .ai-chat-generic-preview,
                .ai-chat-preview-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--ai-color-surface);
                    border-radius: 16px;
                    border: 1px solid var(--ai-color-border);
                }
                
                .ai-chat-preview-icon {
                    font-size: 64px;
                    margin-bottom: 8px;
                }
                
                .ai-chat-btn-primary {
                    border: none;
                    border-radius: 12px;
                    background: var(--ai-color-primary);
                    color: var(--ai-color-primary-contrast);
                    font-weight: 600;
                    padding: 12px 24px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: var(--ai-shadow-sm);
                }
                
                .ai-chat-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--ai-shadow-md);
                    background: var(--ai-color-primary-hover);
                }
                
                .ai-chat-csv-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    font-size: 13px;
                    background: var(--ai-color-surface);
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--ai-color-border);
                }
                
                .ai-chat-csv-table th,
                .ai-chat-csv-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--ai-color-border);
                    text-align: left;
                }
                
                .ai-chat-csv-table th {
                    background: var(--ai-color-surface-elevated);
                    font-weight: 600;
                    color: var(--ai-color-strong-text);
                }
                
                .ai-chat-csv-table tr:last-child td {
                    border-bottom: none;
                }

                /* Responsive - Tablets */
                @media (max-width: 768px) and (min-width: 481px) {
                    .ai-chat-window {
                        width: min(420px, calc(100vw - 32px)) !important;
                        height: min(700px, calc(100vh - 100px)) !important;
                    }
                }

                /* Responsive - Mobile & Tablets */
                @media (max-width: 768px) {
                    .ai-chat-window {
                        position: fixed !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        max-height: 100vh !important;
                        min-height: 100vh !important;
                        border-radius: 0 !important;
                        bottom: 0 !important;
                        right: 0 !important;
                        left: 0 !important;
                        top: 0 !important;
                        border: none !important;
                        transform: none !important;
                        margin: 0 !important;
                        z-index: 10002 !important; /* Ensure it's above everything */
                    }
                    
                    .ai-chat-button {
                        bottom: 20px !important;
                        right: 20px !important;
                        z-index: 10001 !important;
                    }
                    
                    .ai-chat-header {
                        padding: 16px;
                    }
                    
                    .ai-chat-messages {
                        padding: 16px;
                    }
                    
                    .ai-chat-input-container {
                        padding: 16px;
                    }

                    .ai-chat-modal-container {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        height: 100vh !important;
                        max-height: 100vh !important;
                        border-radius: 0 !important;
                    }

                    /* Mobile References */
                    .ai-chat-widget .references-list {
                        grid-template-columns: 1fr !important;
                        gap: 8px !important;
                    }

                    .ai-chat-widget .reference-item {
                        padding: 10px !important;
                    }

                    .ai-chat-widget .reference-name-link {
                        font-size: 14px !important;
                    }

                    /* Hide toggle button on mobile when open */
                    .ai-chat-widget.ai-chat-open .ai-chat-button,
                    .ai-chat-widget.ai-chat-open .ai-chat-widget-button,
                    .ai-chat-button.ai-chat-hidden {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        createWidget() {
            const widget = document.createElement('div');
            const positionClass = `ai-chat-position-${this.config.position}`;
            const themeClass = `ai-chat-theme-${this.config.theme}`;
            widget.className = `ai-chat-widget ${positionClass} ${themeClass}`.trim();
            widget.dataset.position = this.config.position;
            widget.dataset.theme = this.config.theme;

            const buttonLabel = this.config.buttonText && String(this.config.buttonText).trim()
                ? String(this.config.buttonText).trim()
                : `Open chat${this.config.title ? ` with ${this.config.title}` : ''}`;
            const buttonLabelEscaped = buttonLabel.replace(/"/g, '&quot;');

            const agentName = this.agentData && this.agentData.name
                ? String(this.agentData.name).trim()
                : 'Agent';
            const avatarAltText = `${agentName} avatar`;
            const avatarAltEscaped = avatarAltText.replace(/"/g, '&quot;');
            const headerAvatar = this.agentData && this.agentData.avatar_url
                ? `<div class="ai-chat-avatar"><img src="${this.agentData.avatar_url}" alt="${avatarAltEscaped}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>`
                : `<div class="ai-chat-avatar ai-chat-avatar--fallback" aria-hidden="true">${this.getAgentInitials()}</div>`;

            const brandingMarkup = this.config.showBranding
                ? `
            <div class="ai-chat-branding" id="ai-chat-branding" style="font-size: 12px; text-align: center; margin-top: 8px; color: #6b7280; font-family: Inter, sans-serif;">
                Powered by 
                <a href="https://www.knowrithm.org" target="_blank" rel="noopener noreferrer"
                style="
                    text-decoration: none;
                    background: linear-gradient(90deg, #00c6ff, #0072ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 600;
                    margin-left: 4px;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.filter='brightness(1.3)'"
                onmouseout="this.style.filter='brightness(1)'"
                >Knowrithm</a>
            </div>
            `
                : '';

            widget.innerHTML = `
                <button class="ai-chat-button" id="ai-chat-toggle" type="button" aria-label="${buttonLabelEscaped}">
                    <span class="ai-chat-button-visual" aria-hidden="true"></span>
                    <span class="ai-chat-button-text"></span>
                </button>
                
                <div class="ai-chat-window" id="ai-chat-window">
                    <div class="ai-chat-header">
                        <div class="ai-chat-title">
                            ${headerAvatar}
                            ${this.config.title}
                        </div>
                        <button class="ai-chat-close" id="ai-chat-close" type="button" aria-label="Close chat">&times;</button>
                    </div>
                    
                    <div class="ai-chat-content" id="ai-chat-content">
                        <!-- Registration Form -->
                        <div class="ai-chat-registration" id="ai-chat-registration">
                            <h3>Start Chat</h3>
                            <p>Please provide your details to begin the conversation</p>
                            
                            <form class="ai-chat-form" id="ai-registration-form">
                                <div class="ai-chat-form-group">
                                    <label for="first-name">First Name *</label>
                                    <input type="text" id="first-name" name="first_name" required>
                                    <div class="ai-chat-form-error" id="first-name-error"></div>
                                </div>
                                
                                <div class="ai-chat-form-group">
                                    <label for="last-name">Last Name *</label>
                                    <input type="text" id="last-name" name="last_name" required>
                                    <div class="ai-chat-form-error" id="last-name-error"></div>
                                </div>
                                
                                <div class="ai-chat-form-group">
                                    <label for="email">Email *</label>
                                    <input type="email" id="email" name="email" required>
                                    <div class="ai-chat-form-error" id="email-error"></div>
                                </div>
                                
                                <div class="ai-chat-form-group">
                                    <label for="phone">Phone</label>
                                    <input type="tel" id="phone" name="phone">
                                    <div class="ai-chat-form-error" id="phone-error"></div>
                                </div>
                                
                                <button type="submit" class="ai-chat-register-btn" id="register-btn">
                                    Start Chat
                                </button>
                            </form>
                        </div>
                        
                        <!-- Chat Interface -->
                        <div class="ai-chat-messages hidden" id="ai-chat-messages">
                            <div class="ai-chat-message assistant">${this.config.welcome}</div>
                        </div>
                    </div>
                    
                    <div class="ai-chat-input-container hidden" id="ai-chat-input-container">
                        <textarea class="ai-chat-input" id="ai-chat-input" 
                                placeholder="Type your message..." rows="1"></textarea>
                        <button class="ai-chat-send" id="ai-chat-send" type="button" aria-label="Send message">
                            <svg class="ai-chat-send-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                                <path d="M2 21l21-9-21-9v7l15 2-15 2v7z"></path>
                            </svg>
                        </button>
                    </div>
                    ${brandingMarkup}
                </div>
            `;

            document.body.appendChild(widget);

            // Store references
            this.widget = widget;
            this.toggleBtn = widget.querySelector('#ai-chat-toggle');
            this.window = widget.querySelector('#ai-chat-window');
            this.registrationSection = widget.querySelector('#ai-chat-registration');
            this.messagesContainer = widget.querySelector('#ai-chat-messages');
            this.inputContainer = widget.querySelector('#ai-chat-input-container');
            this.input = widget.querySelector('#ai-chat-input');
            this.sendBtn = widget.querySelector('#ai-chat-send');
            this.closeBtn = widget.querySelector('#ai-chat-close');
            this.registrationForm = widget.querySelector('#ai-registration-form');
            this.registerBtn = widget.querySelector('#register-btn');

            this.setupToggleButton();
            this.applyThemeVariables(this.widget);
            this.setupThemeWatcher();
        }

        setupToggleButton() {
            if (!this.toggleBtn) {
                return;
            }

            const button = this.toggleBtn;
            const buttonTextRaw = this.config.buttonText && String(this.config.buttonText).trim();
            const accessibleLabel = buttonTextRaw
                ? buttonTextRaw
                : `Open chat${this.config.title ? ` with ${this.config.title}` : ''}`;
            button.setAttribute('aria-label', accessibleLabel);
            button.setAttribute('title', accessibleLabel);

            const visual = document.createElement('span');
            visual.className = 'ai-chat-button-visual';

            const iconWrapper = document.createElement('span');
            iconWrapper.className = 'ai-chat-button-icon-wrapper';
            iconWrapper.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
                    <path d="M4 3h16a1 1 0 0 1 1 1v14.59l-4.29-4.3a1 1 0 0 0-.71-.29H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v9h11.59L19 15.41V5zM6 18h7v2H6a1 1 0 0 1 0-2z"></path>
                </svg>`;
            visual.appendChild(iconWrapper);

            if (this.agentData && this.agentData.avatar_url) {
                const img = new Image();
                img.className = 'ai-chat-button-avatar-img';
                img.alt = this.agentData.name ? `${this.agentData.name} avatar` : 'Agent avatar';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.referrerPolicy = 'no-referrer';
                img.addEventListener('load', () => {
                    visual.classList.add('ai-chat-button-visual--has-image');
                });
                img.addEventListener('error', () => {
                    console.warn('AI Agent Widget: Avatar failed to load, using fallback icon.');
                });
                img.src = this.agentData.avatar_url;
                visual.appendChild(img);
            }

            const buttonText = buttonTextRaw;
            button.innerHTML = '';
            button.appendChild(visual);

            if (buttonText) {
                const textSpan = document.createElement('span');
                textSpan.className = 'ai-chat-button-text';
                textSpan.textContent = buttonText;
                button.appendChild(textSpan);
                button.classList.add('ai-chat-button--with-text');
            } else {
                button.classList.remove('ai-chat-button--with-text');
            }
        }

        bindEvents() {
            this.toggleBtn.addEventListener('click', () => this.toggleChat());
            this.closeBtn.addEventListener('click', () => this.closeChat());
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.registrationForm.addEventListener('submit', (e) => this.handleRegistration(e));

            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            this.input.addEventListener('input', () => {
                this.adjustTextareaHeight();
            });

            // Clear form errors on input
            ['first-name', 'last-name', 'email', 'phone'].forEach(fieldId => {
                const input = this.widget.querySelector(`#${fieldId}`);
                const errorDiv = this.widget.querySelector(`#${fieldId}-error`);
                if (input && errorDiv) {
                    input.addEventListener('input', () => {
                        input.classList.remove('error');
                        errorDiv.textContent = '';
                    });
                }
            });
        }

        adjustTextareaHeight() {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
        }

        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            this.isOpen = true;
            this.window.classList.add('open');
            this.widget.classList.add('ai-chat-open'); // Add class to container

            // Only hide button on mobile
            if (window.innerWidth <= 768) {
                this.toggleBtn.classList.add('ai-chat-hidden'); // Hide button class
                this.toggleBtn.style.display = 'none'; // Imperative hide
            }
            if (this.conversationId) {
                if (!this.socketEnabled) {
                    this.startMessagePolling();
                }
                this.loadConversationHistory().catch((error) => {
                    console.warn('Failed to refresh conversation on open:', error);
                });
            }

            if (!this.isRegistered) {
                this.widget.querySelector('#first-name').focus();
            } else {
                this.input.focus();
            }

            // Dispatch open event
            this.dispatchWidgetEvent('open');
        }

        closeChat() {
            this.isOpen = false;
            this.window.classList.remove('open');
            this.widget.classList.remove('ai-chat-open'); // Remove class from container
            this.toggleBtn.classList.remove('ai-chat-hidden'); // Show button
            this.stopMessagePolling();

            // Dispatch close event
            this.dispatchWidgetEvent('close');

            // Restore button visibility
            this.toggleBtn.style.display = '';
        }

        async submitLeadRegistration(leadPayload, options = {}) {
            const { silent = false } = options;
            try {
                const response = await fetch(resolveApiUrl(this.config.apiUrl, '/v1/lead/register'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(leadPayload)
                });

                let data = null;
                try {
                    data = await response.json();
                } catch (parseError) {
                    if (!response.ok) {
                        throw new Error('Registration failed');
                    }
                    data = { success: true };
                }

                if (!response.ok || data?.success === false) {
                    const message = data?.message || data?.error || 'Registration failed';
                    throw new Error(message);
                }

                return data;
            } catch (error) {
                if (!silent) {
                    throw error;
                }
                console.warn('Silent lead registration error:', error);
                throw error;
            }
        }

        async handleRegistration(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this.registrationForm);
            const leadData = {
                first_name: formData.get('first_name').trim(),
                last_name: formData.get('last_name').trim(),
                email: formData.get('email').trim(),
                phone: formData.get('phone').trim(),
                agent_id: this.config.agentId
            };

            this.leadPayload = { ...leadData };

            // Validate form
            if (!this.validateForm(leadData)) {
                return;
            }

            // Set loading state
            this.setRegistrationLoading(true);

            try {
                const data = await this.submitLeadRegistration(leadData);
                this.setAuthSession(data);

                if (!this.accessToken) {
                    throw new Error('Authentication token was not provided. Please try again.');
                }

                this.isRegistered = true;

                const conversationReady = await this.createConversation();
                if (!conversationReady) {
                    this.isRegistered = false;
                    return;
                }

                await this.loadConversationHistory({ initial: true });

                // Switch to chat interface only after conversation is ready
                this.switchToChatInterface();
                await this.startRealtimeUpdates();

            } catch (error) {
                console.error('Registration failed:', error);
                this.showRegistrationError(error.message);
            } finally {
                this.setRegistrationLoading(false);
            }
        }

        validateForm(data) {
            let isValid = true;

            // Validate first name
            if (!data.first_name) {
                this.showFieldError('first-name', 'First name is required');
                isValid = false;
            }

            // Validate last name
            if (!data.last_name) {
                this.showFieldError('last-name', 'Last name is required');
                isValid = false;
            }

            // Validate email
            if (!data.email) {
                this.showFieldError('email', 'Email is required');
                isValid = false;
            } else if (!this.isValidEmail(data.email)) {
                this.showFieldError('email', 'Please enter a valid email');
                isValid = false;
            }

            return isValid;
        }

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        showFieldError(fieldId, message) {
            const input = this.widget.querySelector(`#${fieldId}`);
            const errorDiv = this.widget.querySelector(`#${fieldId}-error`);
            if (input && errorDiv) {
                input.classList.add('error');
                errorDiv.textContent = message;
            }
        }

        showRegistrationError(message) {
            // Create or update error message
            let errorDiv = this.widget.querySelector('#registration-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'registration-error';
                errorDiv.className = 'ai-chat-error';
                this.registrationSection.appendChild(errorDiv);
            }
            errorDiv.textContent = message;

            // Remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }

        setRegistrationLoading(loading) {
            this.registerBtn.disabled = loading;
            this.registerBtn.textContent = loading ? 'Please wait...' : 'Start Chat';
        }

        switchToChatInterface() {
            this.registrationSection.classList.add('hidden');
            this.messagesContainer.classList.remove('hidden');
            this.inputContainer.classList.remove('hidden');
            this.input.focus();
        }

        getSocketScriptUrl() {
            const base = (this.apiOrigin || window.location.origin).replace(/\/+$/, '');
            return `${base}/socket.io/socket.io.js`;
        }

        injectSocketScript(url) {
            return new Promise((resolve, reject) => {
                if (!url) {
                    reject(new Error('Socket.IO script URL is missing'));
                    return;
                }

                let resolvedUrl = url;
                try {
                    resolvedUrl = new URL(url, window.location.href).href;
                } catch (error) {
                    console.warn('Failed to resolve socket script URL, using raw value:', url, error);
                }

                const existingScripts = Array.from(document.querySelectorAll('script[data-ai-agent-socket]'));
                const existing = existingScripts.find((script) => script.src === resolvedUrl);

                if (existing && existing.dataset.loaded === 'true') {
                    resolve(true);
                    return;
                }

                const script = existing || document.createElement('script');
                script.src = resolvedUrl;
                script.async = true;
                script.dataset.aiAgentSocket = 'true';

                const cleanup = () => {
                    script.removeEventListener('load', handleLoad);
                    script.removeEventListener('error', handleError);
                };

                const handleLoad = () => {
                    cleanup();
                    script.dataset.loaded = 'true';
                    resolve(true);
                };

                const handleError = () => {
                    cleanup();
                    if (!existing && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    reject(new Error(`Failed to load Socket.IO client library from ${resolvedUrl}`));
                };

                script.addEventListener('load', handleLoad);
                script.addEventListener('error', handleError);

                if (!existing) {
                    document.head.appendChild(script);
                }
            });
        }

        async loadSocketLibrary() {
            if (window.io && typeof window.io === 'function') {
                return true;
            }

            if (!AIAgentWidget.socketLibraryPromise) {
                const cdnSources = Array.isArray(AIAgentWidget.SOCKET_CDN_SOURCES)
                    ? AIAgentWidget.SOCKET_CDN_SOURCES
                    : [AIAgentWidget.SOCKET_CDN_SOURCES].filter(Boolean);
                const sources = [
                    this.getSocketScriptUrl(),
                    ...cdnSources
                ].filter(Boolean);
                const uniqueSources = Array.from(new Set(sources));

                AIAgentWidget.socketLibraryPromise = (async () => {
                    let lastError = null;
                    for (const source of uniqueSources) {
                        try {
                            await this.injectSocketScript(source);
                            if (window.io && typeof window.io === 'function') {
                                return true;
                            }
                        } catch (error) {
                            lastError = error;
                            console.warn('Socket.IO script load failed:', error);
                        }
                    }
                    throw lastError || new Error('Socket.IO client initialization failed');
                })();
            }

            try {
                await AIAgentWidget.socketLibraryPromise;
            } catch (error) {
                AIAgentWidget.socketLibraryPromise = null;
                throw error;
            }

            if (!window.io || typeof window.io !== 'function') {
                AIAgentWidget.socketLibraryPromise = null;
                throw new Error('Socket.IO client initialization failed');
            }

            return true;
        }

        registerSocketHandlers() {
            if (!this.socket || this.socketHandlersRegistered) {
                return;
            }

            this.socket.on('connect', this.handleSocketConnect);
            this.socket.on('disconnect', this.handleSocketDisconnect);
            this.socket.on('connect_error', this.handleSocketConnectError);
            this.socket.on('chat_status', this.handleChatStatus);
            this.socket.on('chat_response', this.handleChatResponse);
            this.socket.on('conversation_joined', this.handleConversationJoined);
            this.socket.on('conversation_error', this.handleConversationError);

            this.socketHandlersRegistered = true;
        }

        async ensureSocketConnected() {
            await this.loadSocketLibrary();

            if (this.socket && this.socket.connected) {
                console.log('✅ Socket already connected');
                this.socketConnected = true;
                return true;
            }

            if (this.socketConnectPromise) {
                console.log('⏳ Socket connection in progress...');
                return this.socketConnectPromise;
            }

            const connect = async () => {
                console.log('🔌 Initiating socket connection to:', this.apiOrigin);

                if (!this.socket) {
                    this.socket = window.io(this.apiOrigin || undefined, {
                        path: '/socket.io',
                        transports: ['websocket', 'polling'],
                        withCredentials: true,
                        auth: this.accessToken ? { token: this.accessToken } : undefined
                    });

                    console.log('📡 Socket created with auth:', !!this.accessToken);

                    this.socketAuthToken = this.accessToken || null;
                    this.socketHandlersRegistered = false;
                    this.registerSocketHandlers();
                } else {
                    if (this.accessToken && this.socketAuthToken !== this.accessToken) {
                        console.log('🔄 Updating socket auth token');
                        this.socket.auth = { token: this.accessToken };
                        this.socketAuthToken = this.accessToken;
                        if (this.socket.connected) {
                            this.socket.disconnect();
                        }
                    }
                    this.socket.connect();
                }

                await new Promise((resolve, reject) => {
                    const handleConnect = () => {
                        console.log('✅ Socket connected successfully');
                        this.socket.off('connect_error', handleError);
                        this.socketConnected = true;
                        resolve(true);
                    };
                    const handleError = (error) => {
                        console.error('❌ Socket connection error:', error);
                        this.socket.off('connect', handleConnect);
                        reject(error);
                    };
                    this.socket.once('connect', handleConnect);
                    this.socket.once('connect_error', handleError);
                });

                return true;
            };

            this.socketConnectPromise = connect();

            try {
                return await this.socketConnectPromise;
            } finally {
                this.socketConnectPromise = null;
            }
        }

        async ensureSocketReady() {
            try {
                await this.ensureSocketConnected();
                if (this.socket && this.socket.connected && this.conversationId) {
                    this.joinConversationRoom();
                }
                return true;
            } catch (error) {
                console.error('Socket readiness check failed:', error);
                return false;
            }
        }

        joinConversationRoom() {
            if (!this.socket || !this.socket.connected || !this.conversationId) {
                return;
            }

            if (this.joinedConversationId === this.conversationId) {
                return;
            }

            this.socket.emit('join_conversation', {
                conversation_id: this.conversationId
            });
        }

        leaveConversationRoom() {
            if (!this.socket || !this.joinedConversationId) {
                return;
            }

            this.socket.emit('leave_conversation', {
                conversation_id: this.joinedConversationId
            });
            this.joinedConversationId = null;
        }

        handleSocketConnect() {
            this.socketConnected = true;
            this.socketEnabled = true;
            if (this.socketRetryTimer) {
                clearTimeout(this.socketRetryTimer);
                this.socketRetryTimer = null;
            }

            // Keep polling active while we still have messages waiting for a response.
            if (this.pendingResponseQueue.length === 0) {
                this.stopMessagePolling();
            } else {
                this.startMessagePolling();
            }

            if (this.conversationId) {
                this.joinConversationRoom();
            }
        }

        handleSocketDisconnect() {
            this.socketConnected = false;
            this.joinedConversationId = null;
            this.startMessagePolling();
        }

        handleSocketConnectError(error) {
            console.error('Socket connection error:', error);
            console.error('Error type:', error?.type, 'Message:', error?.message);

            this.socketEnabled = false;
            this.startMessagePolling();
            this.scheduleSocketRetry();
        }

        handleConversationJoined(payload) {
            if (!payload || payload.conversation_id !== this.conversationId) {
                return;
            }
            this.joinedConversationId = payload.conversation_id;
        }

        handleConversationError(payload) {
            console.warn('Conversation socket error:', payload);
            if (payload && payload.error) {
                this.showError(payload.error);
            }
        }

        handleChatStatus(payload) {
            if (!payload || payload.conversation_id !== this.conversationId) {
                return;
            }

            if (!payload.message_id) {
                return;
            }

            const pendingEntry = this.pendingResponseQueue.find((entry) => !entry.messageId);
            if (pendingEntry) {
                pendingEntry.messageId = payload.message_id;
                pendingEntry.status = payload.status || 'queued';
            }
        }

        handleChatResponse(payload) {
            console.log('📨 Chat response received:', payload); // ADD THIS DEBUG LOG

            if (!payload || payload.conversation_id !== this.conversationId) {
                return;
            }

            const message = payload.message || {};
            const enrichedContent = this.enrichContentWithSources(message);
            message.content = enrichedContent;
            message.__sourcesEnriched = true;
            const content = message.content || '';
            const status = payload.status || 'completed';
            const rawRole = (message.role || '').toLowerCase();
            const role = rawRole === 'user' ? 'user' : 'assistant';

            // Get pending entry but DON'T remove it yet
            const pendingEntry = this.pendingResponseQueue.length ? this.pendingResponseQueue[0] : null;

            if (pendingEntry && pendingEntry.messageEntry && message.id) {
                this.markMessageEntryAsConfirmed(pendingEntry.messageEntry, message.id);
            }

            if (status === 'completed') {
                console.log('✅ Rendering completed message:', message.id); // ADD THIS
                const handled = this.upsertServerMessage(message);
                if (!handled && content) {
                    this.addMessage(message, role);
                }

                // ONLY remove pending entry AFTER successfully rendering
                if (pendingEntry) {
                    this.removePendingEntry(pendingEntry);
                }

                if (!this.socketEnabled) {
                    this.startMessagePolling();
                }
            } else if (status === 'failed') {
                console.error('❌ Message failed:', payload.error); // ADD THIS
                const handled = this.upsertServerMessage(message);
                if (!handled && content) {
                    this.addMessage(message, role);
                } else {
                    this.showError('The assistant could not respond. Please try again.');
                }

                if (pendingEntry) {
                    this.removePendingEntry(pendingEntry);
                }

                if (!this.socketEnabled) {
                    this.startMessagePolling();
                }
            }

            if (this.socketConnected && this.pendingResponseQueue.length === 0) {
                this.stopMessagePolling();
            }
        }

        removePendingEntry(entry) {
            if (!entry) {
                return;
            }
            if (entry.timeoutId) {
                clearTimeout(entry.timeoutId);
            }
            const index = this.pendingResponseQueue.indexOf(entry);
            if (index !== -1) {
                this.pendingResponseQueue.splice(index, 1);
            }
            if (entry.loadingElement) {
                this.hideLoading(entry.loadingElement);
            }

            if (this.socketConnected && this.pendingResponseQueue.length === 0) {
                this.stopMessagePolling();
            }
        }

        setAuthSession(sessionData) {
            if (!sessionData || typeof sessionData !== 'object') {
                return;
            }

            const tokens = sessionData.tokens || sessionData;
            const accessToken = tokens.access_token || tokens.accessToken;
            const refreshToken = tokens.refresh_token || tokens.refreshToken;

            if (accessToken) {
                this.accessToken = accessToken;
            }

            if (refreshToken) {
                this.refreshToken = refreshToken;
            }

            if (sessionData.lead) {
                this.leadData = sessionData.lead;
            }

            this.persistSession();
        }

        buildHeaders(baseHeaders = {}, includeAuth = true) {
            const headers = baseHeaders instanceof Headers
                ? new Headers(baseHeaders)
                : { ...baseHeaders };

            if (!(headers instanceof Headers) && !headers['Content-Type'] && !headers['content-type']) {
                headers['Content-Type'] = 'application/json';
            }

            if (includeAuth && this.accessToken) {
                if (headers instanceof Headers) {
                    headers.set('Authorization', `Bearer ${this.accessToken}`);
                } else {
                    headers.Authorization = `Bearer ${this.accessToken}`;
                }
            }

            return headers;
        }

        async authenticatedFetch(path, options = {}, config = {}) {
            const { retryOnUnauthorized = true } = config;
            const requestOptions = { ...options };
            const headers = this.buildHeaders(requestOptions.headers, true);
            requestOptions.headers = headers;

            const url = resolveApiUrl(this.config.apiUrl, path);
            const response = await fetch(url, requestOptions);

            if (response.status === 401 && retryOnUnauthorized) {
                const renewed = await this.renewLeadSession();
                if (renewed) {
                    return this.authenticatedFetch(path, options, { retryOnUnauthorized: false });
                }
            }

            return response;
        }

        async renewLeadSession() {
            if (!this.leadPayload) {
                return false;
            }

            try {
                const data = await this.submitLeadRegistration(this.leadPayload, { silent: true });
                this.setAuthSession(data);
                return Boolean(this.accessToken);
            } catch (error) {
                console.warn('Lead session renewal failed:', error);
                return false;
            }
        }

        async createConversation() {
            if (!this.accessToken) {
                console.warn('Attempted to create conversation without an access token.');
                this.showError('Authentication missing. Please submit your details again.');
                return false;
            }

            try {
                const response = await this.authenticatedFetch('/v1/conversation', {
                    method: 'POST',
                    body: JSON.stringify({
                        agent_id: this.config.agentId,
                        title: 'Website Chat'
                    })
                });

                let data = null;
                try {
                    data = await response.json();
                } catch (parseError) {
                    // Ignore parse errors for empty responses
                }

                if (!response.ok || !data?.conversation?.id) {
                    const message = data?.error || data?.message || 'Failed to create conversation';
                    throw new Error(message);
                }

                this.conversationId = data.conversation.id;
                this.persistSession();
                return true;
            } catch (error) {
                console.error('Failed to create conversation:', error);
                const message = error.message || 'Failed to start conversation. Please refresh and try again.';
                this.showError(message);
                if (this.registrationSection && !this.registrationSection.classList.contains('hidden')) {
                    this.showRegistrationError(message);
                }
                this.clearPersistedSession();
                return false;
            }
        }

        formatMessage(content) {
            if (typeof content !== 'string') {
                return '';
            }
            let processed = content;

            processed = processed.replace(/\s*\u2022\s*/g, '\n- ');
            processed = processed.replace(/([^\n])\s-\s+/g, (match, prefix) => `${prefix}\n- `);

            return processed
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
                .replace(/(?:^|\n)\s*[-*]\s+(.*)/gm, '<li>$1</li>') // Lists
                .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')        // Wrap list items
                .replace(/\n/g, '<br>');                            // Line breaks
        }

        normaliseMessagePayload(payload) {
            if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                if (typeof payload.content !== 'string') {
                    payload.content = '';
                }
                return payload;
            }
            return {
                content: typeof payload === 'string' ? payload : ''
            };
        }

        splitContentAndReferences(text) {
            if (typeof text !== 'string') {
                return { mainText: '', referencesText: '' };
            }
            const keywordRegex = /(\*\*)?\b(references|sources|citations|bibliography)\b(\*\*)?\s*:/i;
            const match = text.match(keywordRegex);
            if (!match) {
                return { mainText: text.trim(), referencesText: '' };
            }
            const startIndex = match.index;
            const endIndex = startIndex + match[0].length;
            return {
                mainText: text.slice(0, startIndex).trim(),
                referencesText: text.slice(endIndex).trim()
            };
        }

        stripReferenceBlock(text) {
            const sections = this.splitContentAndReferences(text || '');
            return sections.mainText || '';
        }

        resolveStructuredReferences(message, rawContent) {
            if (message && Array.isArray(message.__structuredReferences) && message.__structuredReferences.length) {
                return message.__structuredReferences;
            }
            return this.extractReferencesFromLegacyText(rawContent);
        }

        buildAssistantMessageView(message) {
            if (!message) {
                return null;
            }
            const rawContent = typeof message.content === 'string' ? message.content : '';
            const baseContent = typeof message.__contentSansReferences === 'string'
                ? message.__contentSansReferences
                : this.stripReferenceBlock(rawContent);
            const references = this.resolveStructuredReferences(message, rawContent);
            const contentSource = baseContent || rawContent;
            const bodyHtml = this.buildAssistantParagraphs(contentSource, references)
                || `<div class="ai-paragraph">${this.formatMessage(contentSource)}</div>`;

            let html = `
                <div class="ai-response-container">
                    <div class="ai-content">
                        ${bodyHtml}
                    </div>
            `;

            if (references.length) {
                html += this.buildReferencesHtml(references);
            }

            html += '</div>';

            return {
                html,
                references,
                hasReferences: references.length > 0
            };
        }

        buildAssistantParagraphs(content, references) {
            if (typeof content !== 'string') {
                return '';
            }
            const normalisedContent = content.replace(/\r\n/g, '\n');
            const trimmed = normalisedContent.trim();
            if (!trimmed) {
                return '';
            }
            const paragraphs = trimmed.split(/\n{2,}/).map((segment) => segment.trim()).filter(Boolean);
            if (!paragraphs.length) {
                const fallback = this.formatMessage(trimmed);
                return `<div class="ai-paragraph">${this.decorateLooseSuperscripts(fallback, references)}</div>`;
            }
            const blockPattern = /^(<ul|<ol|<table|<blockquote|<div)/i;
            return paragraphs.map((paragraph) => {
                const formatted = this.decorateLooseSuperscripts(this.formatMessage(paragraph), references);
                if (blockPattern.test(formatted.trim())) {
                    return `<div class="ai-paragraph">${formatted}</div>`;
                }
                return `<p class="ai-paragraph">${formatted}</p>`;
            }).join('');
        }

        decorateLooseSuperscripts(html, references) {
            if (!html || !Array.isArray(references) || !references.length) {
                return html;
            }
            const referenceIds = new Set(references.map((ref) => String(ref.index)));
            const wrapSup = (match, content) => {
                const normalized = this.normaliseSuperscriptSequence(content);
                if (!normalized) {
                    return match;
                }
                const tokens = normalized.split(',').map((value) => value.trim()).filter(Boolean);
                if (!tokens.length) {
                    return match;
                }
                const hasMatch = tokens.some((token) => referenceIds.has(token));
                if (!hasMatch) {
                    return match;
                }
                const dataValue = this.escapeHtml(tokens.join(','));
                return `<sup class="citation-marker" data-citation="${dataValue}" title="View source">${content}</sup>`;
            };

            const updatedSup = html.replace(/<sup(?![^>]*citation-marker)[^>]*>(.*?)<\/sup>/gi, wrapSup);
            return updatedSup.replace(/([¹²³⁴⁵⁶⁷⁸⁹⁰]+)/g, (match) => {
                const normalized = this.normaliseSuperscriptSequence(match);
                if (!normalized || !referenceIds.has(normalized)) {
                    return match;
                }
                const dataValue = this.escapeHtml(normalized);
                return `<sup class="citation-marker" data-citation="${dataValue}" title="View source">${match}</sup>`;
            });
        }

        normaliseSuperscriptSequence(value) {
            if (typeof value !== 'string') {
                return '';
            }
            const map = {
                '\u2070': '0',
                '\u00b9': '1',
                '\u00b2': '2',
                '\u00b3': '3',
                '\u2074': '4',
                '\u2075': '5',
                '\u2076': '6',
                '\u2077': '7',
                '\u2078': '8',
                '\u2079': '9'
            };
            let buffer = '';
            for (const char of value) {
                if (map[char] !== undefined) {
                    buffer += map[char];
                } else if (char === '\'' || char === ',' || /\s/.test(char)) {
                    if (!buffer.endsWith(',')) {
                        buffer += ',';
                    }
                } else if (char === '\u2013' || char === '-') {
                    buffer += '-';
                }
            }
            return buffer.replace(/^,|,$/g, '');
        }

        extractReferencesFromLegacyText(text) {
            if (typeof text !== 'string') {
                return [];
            }
            const { referencesText } = this.splitContentAndReferences(text);
            if (!referencesText) {
                return [];
            }
            const lines = referencesText
                .split(/\n+/)
                .map((line) => line.replace(/^[\-\d.]+\s*/, '').trim())
                .filter(Boolean);
            const results = [];
            lines.forEach((line) => {
                const superscriptMatch = line.match(/^([¹²³⁴⁵⁶⁷⁸⁹⁰]+)\s*(.*)$/);
                if (superscriptMatch) {
                    const normalized = this.normaliseSuperscriptSequence(superscriptMatch[1]);
                    if (!normalized) {
                        return;
                    }
                    const [firstToken] = normalized.split(',');
                    const index = parseInt(firstToken, 10);
                    if (!Number.isFinite(index)) {
                        return;
                    }
                    if (results.some((entry) => entry.index === index || (url && entry.url === url))) {
                        return;
                    }
                    let remainder = superscriptMatch[2].trim();
                    let url = null;
                    const urlMatch = remainder.match(/\((https?:\/\/[^)]+)\)/i);
                    if (urlMatch) {
                        url = this.sanitiseUrl(urlMatch[1]);
                        remainder = remainder.replace(urlMatch[0], '').trim();
                    } else {
                        const anchorMatch = remainder.match(/href="([^"]+)"/i);
                        if (anchorMatch) {
                            url = this.sanitiseUrl(anchorMatch[1]);
                            remainder = remainder.replace(/<[^>]+>/g, '').trim();
                        }
                    }
                    remainder = remainder.replace(/^Source\s*\d+:?\s*/i, '').trim();
                    const fileMeta = this.resolveReferenceFileMetadata(remainder, url);
                    results.push({
                        index,
                        superscript: this.toSuperscript(index),
                        name: fileMeta.name,
                        url,
                        filename: fileMeta.filename,
                        extension: fileMeta.extension,
                        fileType: fileMeta.fileType,
                        isFile: fileMeta.isFile
                    });
                    return;
                }

                const sourceMatch = line.match(/^(?:Document\s+)?Source\s*(\d+)\s*[:\-]?\s*(.*)$/i);
                if (!sourceMatch) {
                    return;
                }
                const index = parseInt(sourceMatch[1], 10);
                if (!Number.isFinite(index) || results.some((entry) => entry.index === index)) {
                    return;
                }
                let remainder = sourceMatch[2].trim();
                let url = null;
                const inlineLinkMatch = remainder.match(/\((https?:\/\/[^)]+)\)/i);
                if (inlineLinkMatch) {
                    url = this.sanitiseUrl(inlineLinkMatch[1]);
                    remainder = remainder.replace(inlineLinkMatch[0], '').trim();
                } else {
                    const anchorMatch = remainder.match(/href="([^"]+)"/i);
                    if (anchorMatch) {
                        url = this.sanitiseUrl(anchorMatch[1]);
                        remainder = remainder.replace(/<[^>]+>/g, '').trim();
                    }
                }
                const fileMeta = this.resolveReferenceFileMetadata(remainder, url);
                results.push({
                    index,
                    superscript: this.toSuperscript(index),
                    name: fileMeta.name,
                    url,
                    filename: fileMeta.filename,
                    extension: fileMeta.extension,
                    fileType: fileMeta.fileType,
                    isFile: fileMeta.isFile
                });
            });
            return results;
        }

        isFileReference(reference) {
            if (!reference || !reference.url) {
                return false;
            }
            if (typeof reference.isFile === 'boolean') {
                return reference.isFile;
            }
            return isHostedFileUrl(reference.url);
        }

        openReferenceLink(url) {
            if (!url || typeof window === 'undefined') {
                return;
            }
            try {
                const opened = window.open(url, '_blank', 'noopener,noreferrer');
                if (opened === null) {
                    window.location.href = url;
                }
            } catch (error) {
                window.location.href = url;
            }
        }

        buildReferencesHtml(references) {
            if (!Array.isArray(references) || !references.length) {
                return '';
            }

            // Deduplicate references by URL
            const seenUrls = new Set();
            const uniqueReferences = [];

            for (const ref of references) {
                if (ref.url) {
                    if (seenUrls.has(ref.url)) continue;
                    seenUrls.add(ref.url);
                }
                uniqueReferences.push(ref);
                if (uniqueReferences.length >= 4) break;
            }
            const countLabel = `${uniqueReferences.length} source${uniqueReferences.length > 1 ? 's' : ''}`;
            const items = uniqueReferences.map((ref) => {
                const hasUrl = Boolean(ref.url);
                const isFileReference = this.isFileReference(ref);
                const fileType = ref.fileType
                    || (isFileReference ? this.getFileTypeDescriptor(ref.extension) : LINK_REFERENCE_DESCRIPTOR);
                const baseName = ref.filename || ref.name || `Document ${ref.index}`;
                const displayName = this.shortenDisplayName(baseName);
                const safeName = this.escapeHtml(displayName);
                const titleAttr = this.escapeHtml(ref.name || ref.filename || `Document ${ref.index}`);
                const safeExtension = (isFileReference && ref.extension) ? `.${this.escapeHtml(ref.extension)}` : '';
                const iconColor = this.escapeHtml(fileType.color);
                const iconSymbol = this.escapeHtml(fileType.icon);
                const actionType = hasUrl ? (isFileReference ? 'preview' : 'open-link') : '';
                const actionDisabledAttr = hasUrl ? '' : 'disabled';
                const actionTitle = hasUrl
                    ? (isFileReference ? 'Preview file' : 'Open link in a new tab')
                    : 'Preview unavailable';
                const actionLabel = hasUrl
                    ? (isFileReference ? 'Preview' : 'Open link')
                    : 'Preview';
                const itemClasses = [
                    'reference-item',
                    hasUrl ? '' : 'reference-item--disabled',
                    (!isFileReference && hasUrl) ? 'reference-item--link' : ''
                ].filter(Boolean).join(' ').trim();
                const nameClasses = [
                    'reference-name-link',
                    (!isFileReference && hasUrl) ? 'reference-name-link--external' : ''
                ].filter(Boolean).join(' ').trim();
                return `
                    <div class="${itemClasses}" data-reference-index="${ref.index}">
                        <span class="reference-number">${this.toSuperscript(ref.index)}</span>
                        <div class="reference-content">
                            <div class="reference-info">
                                <span class="file-type-icon" style="color: ${iconColor}">${iconSymbol}</span>
                                <button type="button"
                                    class="${nameClasses}"
                                    data-reference-action="${actionType}"
                                    data-reference-index="${hasUrl ? ref.index : ''}"
                                    ${hasUrl ? '' : 'disabled'}
                                    title="${titleAttr}"
                                >
                                    ${safeName}
                                </button>
                                ${safeExtension ? `<span class="file-extension">${safeExtension}</span>` : ''}
                            </div>
                            <div class="reference-actions">
                                <button type="button"
                                    class="btn-preview"
                                    data-reference-action="${actionType}"
                                    data-reference-index="${hasUrl ? ref.index : ''}"
                                    title="${actionTitle}"
                                    ${actionDisabledAttr}
                                >
                                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    ${actionLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="references-section">
                    <div class="references-header">
                        <h3 class="references-title">📚 References</h3>
                        <span class="references-count">${countLabel}</span>
                    </div>
                    <div class="references-list">
                        ${items}
                    </div>
                </div>
            `;
        }

        bindAssistantMessageInteractions(container, references = []) {
            if (!container) {
                return;
            }
            const citationMarkers = container.querySelectorAll('.citation-marker');
            citationMarkers.forEach((marker) => {
                marker.addEventListener('click', () => {
                    const citationData = marker.getAttribute('data-citation');
                    if (!citationData) {
                        return;
                    }
                    const [firstIndex] = citationData.split(',').map((value) => value.trim()).filter(Boolean);
                    if (!firstIndex) {
                        return;
                    }
                    this.highlightReference(container, firstIndex);
                });
            });

            container.addEventListener('click', (event) => {
                const actionTarget = event.target.closest('[data-reference-action]');
                if (!actionTarget) {
                    return;
                }
                const action = actionTarget.getAttribute('data-reference-action');
                const referenceIndex = actionTarget.getAttribute('data-reference-index');
                if (!action || !referenceIndex) {
                    return;
                }
                const reference = references.find((ref) => String(ref.index) === String(referenceIndex));
                if (!reference || !reference.url) {
                    return;
                }
                event.preventDefault();
                if (action === 'preview') {
                    if (!this.isFileReference(reference)) {
                        this.openReferenceLink(reference.url);
                        return;
                    }
                    this.openFilePreview(
                        reference.url,
                        reference.filename || reference.name || `source-${reference.index}`,
                        reference.fileType?.type || 'file'
                    );
                    return;
                }
                if (action === 'open-link') {
                    this.openReferenceLink(reference.url);
                }
            });
        }

        highlightReference(container, referenceIndex) {
            if (!container) {
                return;
            }
            const referenceElement = container.querySelector(`.reference-item[data-reference-index="${referenceIndex}"]`);
            if (!referenceElement) {
                return;
            }
            referenceElement.classList.add('reference-item--highlight');
            referenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            window.setTimeout(() => {
                referenceElement.classList.remove('reference-item--highlight');
            }, 2000);
        }

        resolveReferenceFileMetadata(name, url) {
            const trimmedName = (name || '').trim();
            const fallbackFilename = this.extractFilenameFromUrl(url);
            const effectiveName = trimmedName || fallbackFilename || 'Reference';
            const filename = fallbackFilename || effectiveName;
            const extension = filename && filename.includes('.')
                ? filename.split('.').pop().toLowerCase()
                : '';
            const isFile = isHostedFileUrl(url);
            const normalizedExtension = isFile ? extension : '';
            const descriptor = isFile ? this.getFileTypeDescriptor(normalizedExtension) : LINK_REFERENCE_DESCRIPTOR;
            return {
                name: effectiveName,
                filename,
                extension: normalizedExtension,
                fileType: descriptor,
                isFile
            };
        }

        extractFilenameFromUrl(url) {
            if (!url) {
                return '';
            }
            try {
                const parsed = new URL(url, resolveFallbackOrigin());
                const pathname = parsed.pathname || '';
                const segments = pathname.split('/').filter(Boolean);
                if (!segments.length) {
                    return '';
                }
                let filename = segments[segments.length - 1];
                filename = this.safeDecodeURIComponent(filename);
                filename = filename.replace(/(\.[a-z0-9]+)\1+$/i, '$1');
                return filename;
            } catch (error) {
                return '';
            }
        }

        getFileTypeDescriptor(extension) {
            const map = {
                txt: { type: 'text', icon: '📄', color: '#6B7280' },
                pdf: { type: 'document', icon: '📕', color: '#DC2626' },
                doc: { type: 'document', icon: '📘', color: '#2563EB' },
                docx: { type: 'document', icon: '📘', color: '#2563EB' },
                xls: { type: 'spreadsheet', icon: '📗', color: '#059669' },
                xlsx: { type: 'spreadsheet', icon: '📗', color: '#059669' },
                xml: { type: 'data', icon: '📊', color: '#7C3AED' },
                json: { type: 'data', icon: '📊', color: '#7C3AED' },
                csv: { type: 'data', icon: '📊', color: '#059669' },
                jpg: { type: 'image', icon: '🖼️', color: '#EC4899' },
                jpeg: { type: 'image', icon: '🖼️', color: '#EC4899' },
                png: { type: 'image', icon: '🖼️', color: '#EC4899' },
                gif: { type: 'image', icon: '🖼️', color: '#EC4899' }
            };
            const fallback = { type: 'file', icon: '📎', color: '#6B7280' };
            if (!extension) {
                return fallback;
            }
            return map[extension.toLowerCase()] || fallback;
        }

        openFilePreview(url, filename, fileType = 'file') {
            const safeUrl = this.sanitiseUrl(url);
            if (!safeUrl) {
                return;
            }
            const safeFilename = filename || 'reference';
            this.showPreviewModal(safeFilename, fileType);
            this.setModalLoading(true);
            const headers = {};
            if (this.accessToken) {
                headers.Authorization = `Bearer ${this.accessToken}`;
            }
            fetch(safeUrl, {
                headers,
                credentials: 'include'
            })
                .then((response) => {
                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            throw new Error('File preview requires authentication. Click download to save the file.');
                        }
                        throw new Error('Failed to load file preview');
                    }
                    return response.blob();
                })
                .then((blob) => {
                    this.renderFilePreview(blob, safeFilename, fileType, safeUrl);
                })
                .catch((error) => {
                    this.showPreviewError(error.message || 'Unable to load file preview.');
                });
        }

        showPreviewModal(filename, fileType) {
            this.closePreviewModal();
            const overlay = document.createElement('div');
            overlay.className = 'ai-chat-modal-overlay';
            overlay.id = 'ai-chat-file-preview-modal';
            overlay.innerHTML = `
                <div class="ai-chat-modal-container">
                    <div class="ai-chat-modal-header">
                        <div class="ai-chat-modal-title-section">
                            <h2 class="ai-chat-modal-title">${this.escapeHtml(filename || 'Preview')}</h2>
                            <span class="ai-chat-modal-subtitle">${this.escapeHtml(fileType || 'file')}</span>
                        </div>
                        <div class="ai-chat-modal-actions">
                            <button class="ai-chat-modal-btn-icon" data-preview-action="close" title="Close preview">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="ai-chat-modal-body">
                        <div class="ai-chat-modal-content"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    this.closePreviewModal();
                    return;
                }
                const actionButton = event.target.closest('[data-preview-action]');
                if (!actionButton) {
                    return;
                }
                const action = actionButton.getAttribute('data-preview-action');
                if (action === 'close') {
                    this.closePreviewModal();
                    return;
                }
                if (action === 'download') {
                    const lastUrl = this.previewModalElements?.sourceUrl;
                    const lastFilename = this.previewModalElements?.filename || filename;
                    if (lastUrl) {
                        this.downloadFile(lastUrl, lastFilename);
                    }
                }
            });
            document.addEventListener('keydown', this.boundPreviewEscapeHandler);
            const contentEl = overlay.querySelector('.ai-chat-modal-content');
            const titleEl = overlay.querySelector('.ai-chat-modal-title');
            const subtitleEl = overlay.querySelector('.ai-chat-modal-subtitle');
            this.previewModalElements = {
                overlay,
                contentEl,
                titleEl,
                subtitleEl,
                filename,
                sourceUrl: null,
                activeObjectUrl: null
            };
        }

        setModalLoading(isLoading) {
            if (!this.previewModalElements || !this.previewModalElements.contentEl) {
                return;
            }
            if (isLoading) {
                this.previewModalElements.contentEl.innerHTML = `
                    <div class="ai-chat-loading-spinner">
                        <div class="ai-chat-spinner"></div>
                        <p>Loading file preview...</p>
                    </div>
                `;
            }
        }

        renderFilePreview(blob, filename, fileType, url) {
            if (!this.previewModalElements) {
                return;
            }
            this.previewModalElements.sourceUrl = url;
            if (this.previewModalElements.titleEl) {
                this.previewModalElements.titleEl.textContent = filename;
            }
            if (this.previewModalElements.subtitleEl) {
                this.previewModalElements.subtitleEl.textContent = `${fileType} • ${this.formatFileSize(blob.size)}`;
            }
            const type = (fileType || '').toLowerCase();
            if (['text', 'data'].includes(type) || /text|json|csv|xml/i.test(blob.type)) {
                this.renderTextPreview(blob);
                return;
            }
            if (type === 'image' || blob.type.startsWith('image/')) {
                this.renderImagePreview(blob);
                return;
            }
            if (type === 'document' || blob.type === 'application/pdf') {
                this.renderDocumentPreview(blob, filename, url);
                return;
            }
            if (type === 'spreadsheet' || blob.type === 'text/csv') {
                this.renderSpreadsheetPreview(blob);
                return;
            }
            this.renderGenericPreview(filename, blob.size, url);
        }

        renderTextPreview(blob) {
            if (!this.previewModalElements) {
                return;
            }
            blob.text().then((text) => {
                this.previewModalElements.contentEl.innerHTML = `
                    <div class="ai-chat-text-preview">
                        <pre class="ai-chat-text-content">${this.escapeHtml(text)}</pre>
                    </div>
                `;
            });
        }

        renderImagePreview(blob) {
            if (!this.previewModalElements) {
                return;
            }
            this.clearActivePreviewObjectUrl();
            const objectUrl = URL.createObjectURL(blob);
            this.previewModalElements.activeObjectUrl = objectUrl;
            this.previewModalElements.contentEl.innerHTML = `
                <div class="ai-chat-image-preview">
                    <img src="${objectUrl}" alt="File preview" class="ai-chat-preview-image" />
                </div>
            `;
        }

        renderDocumentPreview(blob, filename, url) {
            if (!this.previewModalElements) {
                return;
            }
            const extension = (filename || '').split('.').pop()?.toLowerCase();
            if (extension === 'pdf' || blob.type === 'application/pdf') {
                this.clearActivePreviewObjectUrl();
                const objectUrl = URL.createObjectURL(blob);
                this.previewModalElements.activeObjectUrl = objectUrl;
                this.previewModalElements.contentEl.innerHTML = `
                    <div class="ai-chat-pdf-preview">
                        <iframe src="${objectUrl}" class="ai-chat-pdf-iframe"></iframe>
                    </div>
                `;
                return;
            }
            this.previewModalElements.contentEl.innerHTML = `
                <div class="ai-chat-generic-preview">
                    <div class="ai-chat-preview-icon">📄</div>
                    <h3>Preview not available</h3>
                    <p>This document type cannot be previewed in the browser.</p>
                    <button type="button" class="ai-chat-btn-primary" data-preview-action="download">
                        Download to View
                    </button>
                </div>
            `;
        }

        renderSpreadsheetPreview(blob) {
            if (!this.previewModalElements) {
                return;
            }
            blob.text().then((text) => {
                const rows = text.split('\n').slice(0, 50);
                const table = this.generateCsvPreviewTable(rows);
                this.previewModalElements.contentEl.innerHTML = `
                    <div class="ai-chat-spreadsheet-preview">
                        <div class="ai-chat-preview-notice">Showing first 50 rows</div>
                        ${table}
                    </div>
                `;
            });
        }

        generateCsvPreviewTable(rows) {
            if (!rows.length) {
                return '<p>No data available.</p>';
            }
            const headers = rows[0].split(',');
            let html = '<table class="ai-chat-csv-table"><thead><tr>';
            headers.forEach((header) => {
                html += `<th>${this.escapeHtml(header.trim())}</th>`;
            });
            html += '</tr></thead><tbody>';
            for (let i = 1; i < rows.length; i += 1) {
                if (!rows[i]) {
                    continue;
                }
                const cells = rows[i].split(',');
                html += '<tr>';
                cells.forEach((cell) => {
                    html += `<td>${this.escapeHtml(cell.trim())}</td>`;
                });
                html += '</tr>';
            }
            html += '</tbody></table>';
            return html;
        }

        renderGenericPreview(filename, fileSize, url) {
            if (!this.previewModalElements) {
                return;
            }
            this.previewModalElements.contentEl.innerHTML = `
                <div class="ai-chat-generic-preview">
                    <div class="ai-chat-preview-icon">📎</div>
                    <h3>${this.escapeHtml(filename)}</h3>
                    <p class="ai-chat-file-details">${this.formatFileSize(fileSize)}</p>
                    <p>Preview not available for this file type.</p>
                    <button type="button" class="ai-chat-btn-primary" data-preview-action="download">
                        Download File
                    </button>
                </div>
            `;
        }

        showPreviewError(message) {
            if (!this.previewModalElements) {
                return;
            }
            this.previewModalElements.contentEl.innerHTML = `
                <div class="ai-chat-preview-error">
                    <div class="ai-chat-error-icon">⚠️</div>
                    <h3>Failed to load preview</h3>
                    <p>${this.escapeHtml(message || 'Something went wrong.')}</p>
                    <button type="button" class="ai-chat-btn-primary" data-preview-action="close">
                        Close
                    </button>
                </div>
            `;
        }

        closePreviewModal() {
            if (!this.previewModalElements) {
                return;
            }
            this.clearActivePreviewObjectUrl();
            if (this.previewModalElements.overlay) {
                this.previewModalElements.overlay.remove();
            }
            document.removeEventListener('keydown', this.boundPreviewEscapeHandler);
            this.previewModalElements = null;
        }

        handlePreviewEscape(event) {
            if (event.key === 'Escape') {
                this.closePreviewModal();
            }
        }

        clearActivePreviewObjectUrl() {
            if (this.previewModalElements && this.previewModalElements.activeObjectUrl) {
                URL.revokeObjectURL(this.previewModalElements.activeObjectUrl);
                this.previewModalElements.activeObjectUrl = null;
            }
        }

        downloadFile(url, filename) {
            const safeUrl = this.sanitiseUrl(url);
            if (!safeUrl) {
                return;
            }
            const headers = {};
            if (this.accessToken) {
                headers.Authorization = `Bearer ${this.accessToken}`;
            }
            fetch(safeUrl, {
                headers,
                credentials: 'include'
            })
                .then((response) => {
                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            window.open(safeUrl, '_blank');
                            return Promise.reject('Opening in new tab instead');
                        }
                        throw new Error('Failed to download file');
                    }
                    return response.blob();
                })
                .then((blob) => {
                    const downloadUrl = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = downloadUrl;
                    anchor.download = filename || 'download';
                    document.body.appendChild(anchor);
                    anchor.click();
                    document.body.removeChild(anchor);
                    URL.revokeObjectURL(downloadUrl);
                })
                .catch((error) => {
                    if (error !== 'Opening in new tab instead') {
                        console.warn('Download failed:', error);
                        const anchor = document.createElement('a');
                        anchor.href = safeUrl;
                        anchor.target = '_blank';
                        anchor.download = filename || 'download';
                        document.body.appendChild(anchor);
                        anchor.click();
                        document.body.removeChild(anchor);
                    }
                });
        }

        formatFileSize(bytes) {
            if (!Number.isFinite(bytes) || bytes <= 0) {
                return '0 Bytes';
            }
            const units = ['Bytes', 'KB', 'MB', 'GB'];
            const index = Math.floor(Math.log(bytes) / Math.log(1024));
            const value = bytes / (1024 ** index);
            return `${value.toFixed(2)} ${units[index]}`;
        }

        enrichContentWithSources(message) {
            try {
                const originalContent = typeof message?.content === 'string' ? message.content : '';
                if (!originalContent) {
                    return originalContent;
                }

                const sourceMap = this.buildSourceMapFromMessage(message);
                const citationPattern = /\[(?:Source\s+)?\d+(?:,\s*(?:Source\s+)?\d+)*\]/gi;
                const hasCitations = /\[(?:Source\s+)?\d+(?:,\s*(?:Source\s+)?\d+)*\]/i.test(originalContent);

                const footnoteState = {
                    nextIndex: 1,
                    keyMap: new Map(),
                    entries: [],
                    lastEntry: null,
                    sourceMap,
                    placeholderQueue: this.buildPlaceholderQueue(sourceMap)
                };

                let result = originalContent;

                if (hasCitations && sourceMap.size) {
                    result = result
                        .split('\n')
                        .map((line) => {
                            const isBullet = /^\s*(?:[-*]|\d+\.)\s+/.test(line);
                            return line.replace(/\[(?:Source\s+)?\d+(?:,\s*(?:Source\s+)?\d+)*\]/gi, (match, offset) => this.formatCitationReplacement(match, {
                                isBullet,
                                sourceMap,
                                footnoteState,
                                line,
                                offset
                            }));
                        })
                        .join('\n');
                } else if (hasCitations) {
                    result = result.replace(citationPattern, '');
                }

                result = this.enhanceListFormatting(result);
                result = this.replaceViewSourcePlaceholders(result, footnoteState);
                result = this.removeRawUrls(result, footnoteState);

                message.__contentSansReferences = result;
                const structuredReferences = this.buildStructuredReferencesFromState(footnoteState);
                if (structuredReferences.length) {
                    message.__structuredReferences = structuredReferences;
                } else {
                    const footnoteSection = this.buildFootnoteSection(footnoteState);
                    if (footnoteSection) {
                        result = `${result}\n\n${footnoteSection}`;
                    }
                }
                return result;
            } catch (error) {
                console.warn('Citation enrichment failed:', error);
                return typeof message?.content === 'string' ? message.content : '';
            }
        }

        buildSourceMapFromMessage(message) {
            const map = new Map();
            const append = (number, data = {}) => {
                const numeric = Number.parseInt(number, 10);
                if (!Number.isFinite(numeric)) {
                    return;
                }
                const key = String(numeric);
                const existing = map.get(key) || {};
                const merged = { ...existing };
                if (data.url) {
                    const safeUrl = this.sanitiseUrl(data.url);
                    if (safeUrl) {
                        merged.url = safeUrl;
                    }
                }
                if (data.name) {
                    merged.name = data.name.trim();
                }
                map.set(key, merged);
            };

            const ingestDescriptor = (descriptor, meta = {}) => {
                if (!descriptor && !meta.fallbackUrl && !meta.fallbackName && meta.fallbackNumber == null) {
                    return;
                }
                const parsed = this.parseSourceDescriptor(descriptor, meta);
                if (!parsed) {
                    return;
                }
                const resolvedNumber = Number.isFinite(parsed.number)
                    ? parsed.number
                    : Number.isFinite(meta.fallbackNumber)
                        ? meta.fallbackNumber
                        : null;
                if (!Number.isFinite(resolvedNumber)) {
                    return;
                }
                append(resolvedNumber, {
                    url: parsed.url || meta.fallbackUrl || null,
                    name: parsed.name || meta.fallbackName || null
                });
            };

            if (Array.isArray(message?.sources)) {
                message.sources.forEach((source) => {
                    if (!source) {
                        return;
                    }
                    const fallbackNumber = Number.isFinite(source.source_number)
                        ? source.source_number
                        : Number.isFinite(source.number)
                            ? source.number
                            : null;
                    const fallbackName = typeof source.document_name === 'string'
                        ? source.document_name
                        : typeof source.name === 'string'
                            ? source.name
                            : '';
                    ingestDescriptor(source, {
                        fallbackNumber,
                        fallbackUrl: source.url || source.link || null,
                        fallbackName
                    });
                });
            }

            const allSources = Array.isArray(message?.metadata?.all_sources)
                ? message.metadata.all_sources
                : [];
            allSources.forEach((entry) => {
                ingestDescriptor(entry, {
                    fallbackName: typeof entry === 'string' ? entry : ''
                });
            });

            const filtered = new Map();
            map.forEach((value, key) => {
                const safeUrl = value.url ? this.sanitiseUrl(value.url) : null;
                const safeName = value.name ? value.name.trim() : '';
                if (safeUrl || safeName) {
                    filtered.set(key, {
                        url: safeUrl,
                        name: safeName
                    });
                }
            });
            return filtered;
        }

        parseSourceDescriptor(descriptor, options = {}) {
            const {
                fallbackNumber = null,
                fallbackUrl = null,
                fallbackName = ''
            } = options || {};
            let number = Number.isFinite(fallbackNumber) ? fallbackNumber : null;
            let url = this.sanitiseUrl(fallbackUrl);
            let raw = '';

            if (typeof descriptor === 'string') {
                raw = descriptor.trim();
            } else if (descriptor && typeof descriptor === 'object') {
                if (typeof descriptor.document_name === 'string') {
                    raw = descriptor.document_name.trim();
                } else if (typeof descriptor.name === 'string') {
                    raw = descriptor.name.trim();
                } else if (typeof descriptor.label === 'string') {
                    raw = descriptor.label.trim();
                }
            }

            if (!raw && typeof fallbackName === 'string') {
                raw = fallbackName.trim();
            }

            if (!raw && !url && !Number.isFinite(number)) {
                return null;
            }

            let working = raw;

            const numberMatch = working.match(/(?:Document\s+)?Source\s+(\d+)/i);
            if (numberMatch) {
                number = Number.parseInt(numberMatch[1], 10);
                working = `${working.slice(0, numberMatch.index)}${working.slice(numberMatch.index + numberMatch[0].length)}`.trim();
            } else if (!Number.isFinite(number)) {
                const fallbackMatch = working.match(/^\s*(\d+)[\s:.-]/);
                if (fallbackMatch) {
                    number = Number.parseInt(fallbackMatch[1], 10);
                    working = working.slice(fallbackMatch[0].length).trim();
                }
            }

            const urlMatch = working.match(/\((https?:\/\/[^)]+)\)/i);
            if (urlMatch) {
                const extractedUrl = this.sanitiseUrl(urlMatch[1]);
                if (extractedUrl) {
                    url = url || extractedUrl;
                }
                working = working.replace(urlMatch[0], '').trim();
            }

            working = working
                .replace(/^[:\-\u2013\u2014\s]+/, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (!working && url) {
                working = this.extractFilenameFromUrl(url);
                working = working.replace(/\.txt\.txt$/, '.txt');
            }

            if (!working && typeof fallbackName === 'string') {
                working = fallbackName.trim();
            }

            return {
                number: Number.isFinite(number) ? number : null,
                url: url || null,
                name: working
            };
        }

        buildPlaceholderQueue(sourceMap) {
            if (!sourceMap || typeof sourceMap.forEach !== 'function') {
                return [];
            }

            const queue = [];
            sourceMap.forEach((info, key) => {
                const number = Number.parseInt(key, 10);
                queue.push({
                    number: Number.isNaN(number) ? null : number,
                    url: info.url || null,
                    name: info.name || null
                });
            });

            return queue
                .filter((entry) => entry.url)
                .sort((a, b) => {
                    if (a.number === null && b.number === null) {
                        return 0;
                    }
                    if (a.number === null) {
                        return 1;
                    }
                    if (b.number === null) {
                        return -1;
                    }
                    return a.number - b.number;
                });
        }

        sanitiseUrl(url) {
            if (typeof url !== 'string') {
                return null;
            }
            const trimmed = url.trim();
            if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
                return null;
            }
            try {
                const parsed = new URL(trimmed);
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                    return null;
                }
                return parsed.href;
            } catch (error) {
                return null;
            }
        }

        normaliseCandidateUrl(url) {
            if (typeof url !== 'string') {
                return null;
            }
            let candidate = url.trim();
            if (!candidate) {
                return null;
            }
            const maxAttempts = 3;
            for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
                const safe = this.sanitiseUrl(candidate);
                if (safe) {
                    return safe;
                }
                const trimmed = candidate.replace(/[.,;:]+$/, '');
                if (trimmed === candidate) {
                    break;
                }
                candidate = trimmed;
            }
            return this.sanitiseUrl(candidate);
        }

        escapeHtml(value) {
            if (typeof value !== 'string') {
                return '';
            }
            return value.replace(/[&<>"']/g, (char) => {
                switch (char) {
                    case '&':
                        return '&amp;';
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '"':
                        return '&quot;';
                    case '\'':
                        return '&#39;';
                    default:
                        return char;
                }
            });
        }

        safeDecodeURIComponent(value) {
            if (typeof value !== 'string') {
                return value;
            }
            try {
                return decodeURIComponent(value);
            } catch (error) {
                return value;
            }
        }

        createAnchor(url, text, title) {
            const safeUrl = this.sanitiseUrl(url);
            if (!safeUrl) {
                return null;
            }
            const safeText = this.escapeHtml(text || safeUrl);
            const safeTitle = title ? this.escapeHtml(title) : '';
            const titleAttr = safeTitle ? ` title="${safeTitle}"` : '';
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer"${titleAttr}>${safeText}</a>`;
        }

        formatCitationReplacement(match, context) {
            const { isBullet, sourceMap, footnoteState } = context;
            const numbers = this.extractSourceNumbers(match);
            if (!numbers.length) {
                return '';
            }

            const infoList = numbers
                .map((number) => {
                    const info = sourceMap.get(String(number));
                    if (!info) {
                        return null;
                    }
                    return {
                        number,
                        url: info.url || null,
                        name: info.name || null
                    };
                })
                .filter(Boolean);

            if (!infoList.length) {
                return '';
            }

            const uniqueUrls = new Set(infoList.filter((item) => item.url).map((item) => item.url));

            if (isBullet) {
                return this.formatBulletCitation(infoList, uniqueUrls);
            }

            if (infoList.length === 1) {
                const footnote = this.ensureFootnoteEntry(infoList[0], footnoteState);
                const superscript = this.toSuperscript(footnote.index);
                const dataValue = this.escapeHtml(String(footnote.index));
                return `<sup class="citation-marker" data-citation="${dataValue}" title="View source">${superscript}</sup>`;
            }

            const footnotes = infoList.map((info) => this.ensureFootnoteEntry(info, footnoteState));
            const indices = footnotes.map((entry) => entry.index);
            const dataValue = this.escapeHtml(indices.join(','));
            const superscripts = indices.map((idx) => this.toSuperscript(idx)).join(',');
            return `<sup class="citation-marker" data-citation="${dataValue}" title="View source">${superscripts}</sup>`;
        }

        extractSourceNumbers(citation) {
            if (typeof citation !== 'string') {
                return [];
            }

            const inner = citation.replace(/^\[/, '').replace(/\]$/, '').replace(/Source/gi, '');
            if (!/\d+/.test(inner)) {
                return [];
            }

            const parts = inner.split(',');
            const numbers = [];
            const seen = new Set();

            parts.forEach((part) => {
                if (typeof part !== 'string') {
                    return;
                }
                const match = part.match(/(\d+)/);
                if (!match) {
                    return;
                }
                const number = parseInt(match[1], 10);
                if (Number.isNaN(number) || seen.has(number)) {
                    return;
                }
                numbers.push(number);
                seen.add(number);
            });

            return numbers;
        }

        formatBulletCitation(infoList, uniqueUrls) {
            if (infoList.length === 0) {
                return '';
            }

            const allUrlsPresent = infoList.every((item) => item.url);
            if (allUrlsPresent && uniqueUrls.size === 1) {
                const primary = infoList[0];
                const label = primary.name
                    ? `${primary.name} \u2192`
                    : 'Learn more \u2192';
                const anchor = this.createAnchor(primary.url, label, primary.name);
                return anchor ? ` ${anchor}` : ` ${this.escapeHtml(label)}`;
            }

            const linkParts = infoList.map((item, index) => {
                const label = item.name
                    ? `${item.name} \u2192`
                    : infoList.length > 1
                        ? `Learn more ${index + 1} \u2192`
                        : 'Learn more \u2192';
                if (item.url) {
                    const anchor = this.createAnchor(item.url, label, item.name);
                    return anchor || this.escapeHtml(label);
                }
                return this.escapeHtml(label);
            });

            return ` ${linkParts.join(' | ')}`;
        }

        ensureFootnoteEntry(info, state) {
            const key = Number.isFinite(info.number)
                ? `number:${info.number}`
                : `url:${info.url || info.name || Math.random().toString(36).slice(2)}`;
            if (state.keyMap.has(key)) {
                const existing = state.keyMap.get(key);
                if (Number.isFinite(info.number) && !existing.numbers.includes(info.number)) {
                    existing.numbers.push(info.number);
                }
                if (!existing.url && info.url) {
                    existing.url = info.url;
                }
                if (!existing.name && info.name) {
                    existing.name = info.name;
                }
                state.lastEntry = existing;
                return existing;
            }

            const entry = {
                key,
                index: state.nextIndex++,
                numbers: Number.isFinite(info.number) ? [info.number] : [],
                url: info.url || null,
                name: info.name || null
            };
            state.keyMap.set(key, entry);
            state.entries.push(entry);
            state.lastEntry = entry;
            return entry;
        }

        renderSuperscriptGroup(indices) {
            const uniqueIndices = Array.from(new Set(indices.filter((index) => Number.isFinite(index))));
            if (!uniqueIndices.length) {
                return '';
            }

            const sorted = [...uniqueIndices].sort((a, b) => a - b);

            const dataValue = this.escapeHtml(sorted.join(','));
            let label = '';
            if (sorted.length >= 4 && this.isContiguousRange(sorted)) {
                const start = this.toSuperscript(sorted[0]);
                const end = this.toSuperscript(sorted[sorted.length - 1]);
                label = `${start}&ndash;${end}`;
                return `<sup class="citation-marker" data-citation="${dataValue}" title="View source">${label}</sup>`;
            }

            const parts = sorted.map((index) => this.toSuperscript(index));
            const separator = sorted.length > 1 ? "'" : '';
            label = parts.join(separator);
            return `<sup class="citation-marker" data-citation="${dataValue}" title="View source">${label}</sup>`;
        }

        isContiguousRange(numbers) {
            for (let i = 1; i < numbers.length; i += 1) {
                if (numbers[i] !== numbers[i - 1] + 1) {
                    return false;
                }
            }
            return true;
        }

        toSuperscript(value) {
            const map = {
                '0': '\u2070',
                '1': '\u00b9',
                '2': '\u00b2',
                '3': '\u00b3',
                '4': '\u2074',
                '5': '\u2075',
                '6': '\u2076',
                '7': '\u2077',
                '8': '\u2078',
                '9': '\u2079'
            };
            return String(value).split('').map((char) => map[char] || char).join('');
        }

        buildFootnoteSection(state) {
            if (!state.entries.length) {
                return '';
            }

            const lines = state.entries
                .filter((entry) => entry.url || entry.name)
                .map((entry) => {
                    const symbol = this.toSuperscript(entry.index);
                    if (entry.url) {
                        const anchor = this.createAnchor(entry.url, this.shortenUrl(entry.url), entry.name);
                        if (anchor) {
                            return `${symbol} ${anchor}`;
                        }
                        return `${symbol} ${this.escapeHtml(this.shortenUrl(entry.url))}`;
                    }
                    return `${symbol} ${this.escapeHtml(entry.name || 'Source')}`;
                });

            if (!lines.length) {
                return '';
            }

            return ['**References:**', ...lines].join('\n');
        }

        buildStructuredReferencesFromState(state) {
            if (!state || !Array.isArray(state.entries)) {
                return [];
            }
            return state.entries
                .filter((entry) => entry && (entry.url || entry.name))
                .map((entry) => {
                    const safeUrl = this.sanitiseUrl(entry.url);
                    const fileMeta = this.resolveReferenceFileMetadata(entry.name, safeUrl);
                    return {
                        index: entry.index,
                        superscript: this.toSuperscript(entry.index),
                        name: fileMeta.name,
                        url: safeUrl || null,
                        filename: fileMeta.filename,
                        extension: fileMeta.extension,
                        fileType: fileMeta.fileType,
                        isFile: fileMeta.isFile
                    };
                });
        }

        shortenUrl(url) {
            if (typeof url !== 'string') {
                return '';
            }
            let clean = url.replace(/^https?:\/\//i, '');
            clean = clean.replace(/^www\./i, '');
            return clean.replace(/\/$/, '');
        }

        shortenDisplayName(name) {
            if (typeof name !== 'string') {
                return '';
            }

            let cleaned = name.trim();
            cleaned = cleaned.replace(/^Source\s+\d+:\s*/i, '');
            cleaned = cleaned.replace(/\s*\(https?:\/\/[^)]+\)\s*/gi, '');

            if (/^https?:\/\//i.test(cleaned)) {
                const urlParts = cleaned.split('/');
                cleaned = urlParts[urlParts.length - 1] || cleaned;
                cleaned = this.safeDecodeURIComponent(cleaned);
            }

            cleaned = cleaned.replace(/(\.[a-z0-9]+)\1+$/i, '$1');
            const displayName = cleaned.replace(/\.txt$/, '');

            const maxLength = 35;
            if (displayName.length > maxLength) {
                return `${displayName.slice(0, maxLength - 3)}...`;
            }

            return displayName;
        }

        getSuperscriptForUrl(url, state) {
            if (!url) {
                return '';
            }
            const safeUrl = this.normaliseCandidateUrl(url);
            if (!safeUrl) {
                return '';
            }
            const entry = this.ensureFootnoteEntry({ number: null, url: safeUrl }, state);
            return this.renderSuperscriptGroup([entry.index]);
        }

        removeRawUrls(text, state) {
            if (!text) {
                return text;
            }

            const patterns = [
                {
                    regex: /\((https?:\/\/[^)]+)\)/g,
                    replacer: (match, url) => this.getSuperscriptForUrl(url, state)
                },
                {
                    regex: /(^|[\s>(])(https?:\/\/[^\s)]+)/g,
                    replacer: (match, prefix, url) => {
                        let trailing = '';
                        let coreUrl = url;
                        const punctuationMatch = coreUrl.match(/[.,;:]+$/);
                        if (punctuationMatch) {
                            trailing = punctuationMatch[0];
                            coreUrl = coreUrl.slice(0, -trailing.length);
                        }
                        const superscript = this.getSuperscriptForUrl(coreUrl, state);
                        if (!superscript) {
                            return `${prefix}${url}`;
                        }
                        return `${prefix}${superscript}${trailing}`;
                    }
                },
                {
                    regex: /\[(https?:\/\/[^\]]+)\]\(\1\)/g,
                    replacer: (match, url) => this.getSuperscriptForUrl(url, state)
                }
            ];

            let output = text;
            patterns.forEach(({ regex, replacer }) => {
                output = output.replace(regex, replacer);
            });
            return output;
        }

        replaceViewSourcePlaceholders(text, state) {
            if (!text) {
                return text;
            }

            const placeholderRegex = /(\s*-\s*|\s+)?View Source\b/gi;
            return text.replace(placeholderRegex, (match, leading = '', offset, full) => {
                const entry = this.resolvePlaceholderEntry(state);
                if (!entry || !entry.url) {
                    return '';
                }

                const anchor = this.createAnchor(entry.url, 'Learn more \u2192', entry.name);
                if (!anchor) {
                    return '';
                }

                const precedingContent = full.slice(0, offset);
                const needsSpace = precedingContent.length && !/\s$/.test(precedingContent);
                const spacer = needsSpace ? ' ' : '';
                return `${spacer}${anchor}`;
            });
        }

        resolvePlaceholderEntry(state) {
            if (!state) {
                return null;
            }

            if (state.lastEntry && state.lastEntry.url) {
                return state.lastEntry;
            }

            const existing = Array.isArray(state.entries)
                ? state.entries.find((entry) => entry && entry.url)
                : null;
            if (existing) {
                state.lastEntry = existing;
                return existing;
            }

            if (Array.isArray(state.placeholderQueue) && state.placeholderQueue.length) {
                while (state.placeholderQueue.length) {
                    const candidate = state.placeholderQueue.shift();
                    if (!candidate) {
                        continue;
                    }
                    const entry = this.ensureFootnoteEntry(candidate, state);
                    if (entry && entry.url) {
                        return entry;
                    }
                }
            }

            return null;
        }

        enhanceListFormatting(text) {
            if (!text) {
                return text;
            }
            return text.replace(/(^|\n)(\s*[*-]\s+)([^:\n]+):/g, (match, prefix, bullet, label) => {
                const trimmedLabel = label.trim();
                if (!trimmedLabel) {
                    return match;
                }
                if (/^\*\*.*\*\*$/.test(trimmedLabel)) {
                    return match;
                }
                return `${prefix}${bullet}**${trimmedLabel}**:`;
            });
        }

        async sendMessage() {
            const message = this.input.value.trim();
            if (!message || this.isLoading) return;

            if (!this.conversationId) {
                this.showError('Conversation not ready. Please wait and try again.');
                return;
            }

            if (!this.accessToken) {
                this.showError('Session expired. Please restart the chat.');
                return;
            }

            this.setLoading(true);

            const normalisedMessage = message.trim();
            let pendingEntry = null;
            let loadingElement = null;
            let messageEntry = null;

            try {
                if (this.socketEnabled) {
                    try {
                        await this.ensureSocketReady();
                    } catch (socketError) {
                        this.socketEnabled = false;
                        console.warn('Socket not available, continuing with polling only.', socketError);
                    }
                }

                // Clear input and resize textarea
                this.input.value = '';
                this.adjustTextareaHeight();

                // Add user message to UI and track as pending
                messageEntry = this.addMessage(normalisedMessage, 'user', { isTemporary: true });
                if (messageEntry) {
                    this.pendingUserMessages.push({
                        content: normalisedMessage,
                        element: messageEntry.element,
                        messageId: null,
                        resolved: false
                    });
                }

                // Show loading indicator and create pending tracker
                loadingElement = this.showLoading();
                pendingEntry = {
                    loadingElement,
                    createdAt: Date.now(),
                    messageId: null,
                    taskId: null,
                    timeoutId: null,
                    messageEntry
                };
                pendingEntry.timeoutId = setTimeout(() => {
                    // Only timeout if we haven't received ANY response
                    if (this.pendingResponseQueue.includes(pendingEntry)) {
                        this.removePendingEntry(pendingEntry);
                        this.showError('Response timed out. Please try again.');
                    }
                }, 90000);
                this.pendingResponseQueue.push(pendingEntry);

                const response = await this.authenticatedFetch(`/v1/conversation/${this.conversationId}/chat`, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: message
                    })
                });

                let data = null;
                try {
                    data = await response.json();
                } catch (parseError) {
                    // Ignore parse errors for non-JSON responses
                }

                if (!response.ok) {
                    // 202 is OK for async processing
                    if (response.status === 202) {
                        // This is expected - continue processing
                        console.log('✓ Message accepted for async processing');
                    } else {
                        const errorMessage = data?.error || data?.message || 'Failed to send message';
                        throw new Error(errorMessage);
                    }
                }

                if (pendingEntry && data) {
                    pendingEntry.messageId = data?.message_id || null;
                    pendingEntry.taskId = data?.task_id || null;

                    // IMPORTANT: Update the pending user message with the confirmed ID
                    if (data.message_id && messageEntry) {
                        // Mark the temporary message with the confirmed ID
                        messageEntry.element.dataset.messageId = data.message_id;
                        messageEntry.id = data.message_id;
                        this.registerRenderedMessageId(data.message_id);

                        // Update pending user messages array
                        const pendingUserMsg = this.pendingUserMessages.find(p => p.element === messageEntry.element);
                        if (pendingUserMsg) {
                            pendingUserMsg.messageId = data.message_id;
                        }
                    }
                }

                console.log('✓ Message sent, ID:', data?.message_id, 'Task:', data?.task_id);
                this.startMessagePolling();

                this.startMessagePolling();

            } catch (error) {
                console.error('Failed to send message:', error);
                if (pendingEntry) {
                    this.removePendingEntry(pendingEntry);
                } else if (loadingElement) {
                    this.hideLoading(loadingElement);
                }
                if (messageEntry) {
                    this.removeMessageEntry(messageEntry);
                }
                const messageText = error && error.message
                    ? error.message
                    : 'Failed to send message. Please try again.';
                this.showError(messageText);
            } finally {
                this.setLoading(false);
            }
        }




        registerRenderedMessageId(messageId) {
            if (!messageId) {
                return;
            }
            this.renderedMessageIds.add(messageId);
            if (this.renderedMessageIds.size > MESSAGE_ID_CACHE_LIMIT) {
                const latestIds = [];
                for (let i = this.messages.length - 1; i >= 0 && latestIds.length < MESSAGE_ID_CACHE_LIMIT; i -= 1) {
                    const entry = this.messages[i];
                    if (entry && entry.id) {
                        latestIds.push(entry.id);
                    }
                }
                this.renderedMessageIds = new Set(latestIds.reverse());
            }
        }


        addMessage(payload, role, options = {}) {
            const normalizedPayload = this.normaliseMessagePayload(payload);
            const content = typeof normalizedPayload.content === 'string' ? normalizedPayload.content : '';
            console.log('addMessage called:', {
                role,
                messageId: options.messageId,
                isTemporary: options.isTemporary,
                contentLength: content.length
            });
            const {
                messageId = null,
                createdAt = null,
                isTemporary = false
            } = options || {};

            if (messageId && this.renderedMessageIds.has(messageId)) {
                return null;
            }

            const messageElement = document.createElement('div');
            messageElement.className = `ai-chat-message ${role}`;
            let assistantView = null;

            if (role === 'assistant') {
                assistantView = this.buildAssistantMessageView(normalizedPayload);
            }

            if (role === 'assistant' && assistantView && assistantView.html) {
                messageElement.innerHTML = assistantView.html;
            } else {
                messageElement.innerHTML = this.formatMessage(content);
            }

            if (role === 'assistant' && assistantView) {
                this.bindAssistantMessageInteractions(messageElement, assistantView.references);
            }

            if (messageId) {
                messageElement.dataset.messageId = messageId;
                this.registerRenderedMessageId(messageId);
            }

            if (isTemporary) {
                messageElement.dataset.temporary = 'true';
            }

            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();

            const entry = {
                id: messageId || null,
                role,
                content,
                element: messageElement,
                createdAt: createdAt || null,
                temporary: isTemporary,
                metadata: normalizedPayload
            };
            this.messages.push(entry);

            return entry;
        }

        resetConversationView() {
            this.messages = [];
            this.renderedMessageIds.clear();
            this.pendingUserMessages = [];
            if (this.messagesContainer) {
                this.messagesContainer.innerHTML = '';
            }
        }

        async startRealtimeUpdates() {
            if (!this.conversationId) {
                return;
            }
            if (this.socketEnabled) {
                try {
                    const socketReady = await this.ensureSocketReady();
                    if (socketReady) {
                        this.stopMessagePolling();
                        return;
                    }
                    this.socketEnabled = false;
                    this.scheduleSocketRetry();
                } catch (error) {
                    this.socketEnabled = false;
                    console.warn('Socket unavailable, continuing with polling only.', error);
                    this.scheduleSocketRetry();
                }
            }
            this.startMessagePolling();
        }

        startMessagePolling() {
            if (this.pollingActive) {
                return;
            }
            this.pollingActive = true;

            const poll = async () => {
                if (!this.pollingActive) {
                    return;
                }
                await this.pollConversationOnce();
                if (this.pollingActive) {
                    // Use faster polling (1 second) when waiting for a response
                    // Use normal polling (2.5 seconds) otherwise
                    const interval = this.pendingResponseQueue.length > 0 ? 1000 : this.pollingIntervalMs;
                    this.pollingTimer = setTimeout(poll, interval);
                }
            };

            poll();
        }

        stopMessagePolling() {
            this.pollingActive = false;
            if (this.pollingTimer) {
                clearTimeout(this.pollingTimer);
                this.pollingTimer = null;
            }
        }

        scheduleSocketRetry(delay = 30000) {
            if (typeof window === 'undefined') {
                return;
            }
            if (this.socketRetryTimer) {
                return;
            }
            this.socketRetryTimer = window.setTimeout(async () => {
                this.socketRetryTimer = null;
                this.socketEnabled = true;
                if (this.conversationId) {
                    await this.startRealtimeUpdates();
                }
            }, delay);
        }

        async pollConversationOnce() {
            if (!this.conversationId) {
                return;
            }
            try {
                await this.loadConversationHistory();
            } catch (error) {
                console.warn('Conversation polling failed:', error);
            }
        }

        async loadConversationHistory(options = {}) {
            if (!this.conversationId) {
                return;
            }

            const { initial = false } = options;

            if (initial) {
                this.resetConversationView();
            }

            try {
                const params = new URLSearchParams({
                    page: '1',
                    per_page: '100'
                });

                const response = await this.authenticatedFetch(`/v1/conversation/${this.conversationId}/messages?${params.toString()}`, {
                    method: 'GET'
                });

                if (!response.ok) {
                    throw new Error(`Failed to load conversation messages (${response.status})`);
                }

                const data = await response.json();
                const messages = Array.isArray(data?.messages) ? data.messages : [];

                if (messages.length > 0 && this.pendingResponseQueue.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    const pendingEntry = this.pendingResponseQueue[0];

                    if (lastMessage.role === 'user' && lastMessage.id === pendingEntry.messageId) {
                        // We're waiting for a response that hasn't arrived yet
                        // Check if it's been too long
                        const waitTime = Date.now() - pendingEntry.createdAt;

                        if (waitTime > 45000) { // 45 seconds
                            console.warn('Response taking longer than expected, continuing to wait...');
                            // Optionally update the loading indicator
                            if (pendingEntry.loadingElement) {
                                const span = pendingEntry.loadingElement.querySelector('span');
                                if (span) {
                                    span.textContent = 'Still processing...';
                                }
                            }
                        }
                    }
                }

                if (messages.length === 0 && initial && this.config.welcome) {
                    this.addMessage(this.config.welcome, 'assistant');
                    return;
                }

                messages.forEach((message) => this.upsertServerMessage(message));
                if (this.pendingResponseQueue.length > 0) {
                    const pendingEntry = this.pendingResponseQueue[0];

                    if (messages.length > 0 && pendingEntry.messageId) {
                        // Find the user message and check for assistant response after it
                        const userMessageIndex = messages.findIndex(m => m.id === pendingEntry.messageId);

                        if (userMessageIndex !== -1) {
                            console.log('✓ Found user message in conversation');

                            // Check if there's an assistant message after the user message
                            const messagesAfterUser = messages.slice(userMessageIndex + 1);
                            const assistantResponse = messagesAfterUser.find(m => m.role === 'assistant');

                            if (assistantResponse) {
                                console.log('✓ Found assistant response:', assistantResponse.id);
                                // Remove pending entry - response is here
                                this.removePendingEntry(pendingEntry);
                            } else {
                                // Still waiting for response
                                const waitTime = Date.now() - pendingEntry.createdAt;
                                const waitSeconds = Math.round(waitTime / 1000);

                                if (waitSeconds % 5 === 0) { // Log every 5 seconds
                                    console.log(`⏳ Waiting for assistant response... ${waitSeconds}s`);
                                }

                                // Timeout after 90 seconds (backend can take time)
                                if (waitTime > 90000) {
                                    console.warn('⚠ Response timeout after 90 seconds');
                                    this.removePendingEntry(pendingEntry);
                                    this.showError('Response timed out. Please try again.');
                                }
                            }
                        } else {
                            // User message not in conversation yet - might be a timing issue
                            const waitTime = Date.now() - pendingEntry.createdAt;
                            if (waitTime > 5000) {
                                console.warn('⚠ User message not found in conversation after 5s');
                            }
                        }
                    } else if (!pendingEntry.messageId) {
                        // No message ID yet from backend response
                        const waitTime = Date.now() - pendingEntry.createdAt;
                        if (waitTime > 10000) {
                            console.warn('⚠ No message ID received after 10s');
                            this.removePendingEntry(pendingEntry);
                            this.showError('Failed to send message. Please try again.');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load conversation messages:', error);
            }
        }

        upsertServerMessage(message) {
            console.log('upsertServerMessage called:', {
                messageId: message?.id,
                role: message?.role,
                inCache: this.renderedMessageIds.has(message?.id),
                messagesInDom: this.messages.length,
                pendingQueue: this.pendingResponseQueue.length
            });
            if (!message || !message.id) {
                return false;
            }

            if (!message.__sourcesEnriched) {
                const enriched = this.enrichContentWithSources(message);
                if (typeof enriched === 'string') {
                    message.content = enriched;
                }
                message.__sourcesEnriched = true;
            }

            if (this.renderedMessageIds.has(message.id)) {
                const existsInDom = this.messages.find(m =>
                    m.id === message.id &&
                    m.element &&
                    m.element.parentNode === this.messagesContainer
                );

                if (existsInDom) {
                    console.log('Message already rendered:', message.id);
                    return true;
                }

                // In cache but not in DOM - clear from cache and re-render
                console.warn('Message in cache but not in DOM, re-rendering:', message.id);
                this.renderedMessageIds.delete(message.id);
            }

            const existingElement = this.messagesContainer.querySelector(`[data-message-id="${message.id}"]`);
            if (existingElement && existingElement.dataset.temporary !== 'true') {
                return true;
            }

            const rawRole = (message.role || '').toLowerCase();
            const role = rawRole === 'user' ? 'user' : 'assistant';
            const content = typeof message.content === 'string' ? message.content : '';

            if (role === 'user' && this.resolvePendingUserMessage(message)) {
                return true;
            }

            if (role === 'assistant' && this.pendingResponseQueue.length > 0) {
                const pendingEntry = this.pendingResponseQueue[0];

                // Check if this assistant message comes after the pending user message
                const allMessages = Array.isArray(this.messages) ? this.messages : [];
                const lastUserMessage = allMessages.reverse().find(m => m.role === 'user');

                if (lastUserMessage && message.created_at >= lastUserMessage.createdAt) {
                    // This is likely the response to our pending message
                    this.removePendingEntry(pendingEntry);
                }
            }

            const entry = this.addMessage(message, role, {
                messageId: message.id,
                createdAt: message.created_at || null,
                isTemporary: false
            });

            if (role === 'assistant' && this.pendingResponseQueue.length) {
                const pendingEntry = this.pendingResponseQueue[0];
                this.removePendingEntry(pendingEntry);
            }

            return Boolean(entry);
        }

        resolvePendingUserMessage(serverMessage) {
            if (!serverMessage || !serverMessage.id) {
                return false;
            }

            const normalisedContent = (serverMessage.content || '').trim();

            const matchingIndex = this.pendingUserMessages.findIndex((pending) => {
                if (!pending || pending.resolved) {
                    return false;
                }
                if (pending.messageId && pending.messageId === serverMessage.id) {
                    return true;
                }
                return pending.content === normalisedContent;
            });

            if (matchingIndex === -1) {
                return false;
            }

            // const pending = this.pendingUserMessages.splice(matchingIndex, 1)[0];
            // if (pending.element) {
            //     pending.element.dataset.messageId = serverMessage.id;
            //     pending.element.dataset.temporary = 'false';
            // }
            const pending = this.pendingUserMessages[matchingIndex];
            if (pending.element) {
                // Update the element immediately
                pending.element.dataset.messageId = serverMessage.id;
                delete pending.element.dataset.temporary; // Remove temporary flag
                this.registerRenderedMessageId(serverMessage.id);
            }
            this.registerRenderedMessageId(serverMessage.id);

            const stored = this.messages.find((entry) => entry.element === pending.element);
            if (stored) {
                stored.id = serverMessage.id;
                stored.temporary = false;
            }

            return true;
        }

        markMessageEntryAsConfirmed(entry, messageId) {
            if (!entry || !entry.element || !messageId) {
                return;
            }

            entry.element.dataset.messageId = messageId;
            entry.element.dataset.temporary = 'false';
            this.registerRenderedMessageId(messageId);

            entry.id = messageId;
            entry.temporary = false;

            const stored = this.messages.find((msg) => msg.element === entry.element);
            if (stored) {
                stored.id = messageId;
                stored.temporary = false;
            }

            const pendingIndex = this.pendingUserMessages.findIndex((pending) => pending && pending.element === entry.element);
            if (pendingIndex !== -1) {
                this.pendingUserMessages.splice(pendingIndex, 1);
            }
        }

        removeMessageEntry(entry) {
            if (!entry || !entry.element) {
                return;
            }

            if (entry.id) {
                this.renderedMessageIds.delete(entry.id);
            }

            const pendingIndex = this.pendingUserMessages.findIndex((pending) => pending && pending.element === entry.element);
            if (pendingIndex !== -1) {
                this.pendingUserMessages.splice(pendingIndex, 1);
            }

            if (entry.element.parentNode) {
                entry.element.parentNode.removeChild(entry.element);
            }

            const index = this.messages.indexOf(entry);
            if (index !== -1) {
                this.messages.splice(index, 1);
            }
        }

        showLoading() {
            const loadingElement = document.createElement('div');
            loadingElement.className = 'ai-chat-loading';
            loadingElement.innerHTML = `
                <span>AI is typing</span>
                <div class="ai-chat-loading-dots">
                    <div class="ai-chat-loading-dot"></div>
                    <div class="ai-chat-loading-dot"></div>
                    <div class="ai-chat-loading-dot"></div>
                </div>
            `;

            this.messagesContainer.appendChild(loadingElement);
            this.scrollToBottom();

            return loadingElement;
        }

        hideLoading(loadingElement) {
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
        }

        showError(message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'ai-chat-error';
            errorElement.textContent = message;

            this.messagesContainer.appendChild(errorElement);
            this.scrollToBottom();

            // Remove error after 5 seconds
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, 5000);
        }

        setLoading(loading) {
            this.isLoading = loading;
            this.sendBtn.disabled = loading;
            this.input.disabled = loading;
        }

        scrollToBottom() {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    AIAgentWidget.socketLibraryPromise = null;
    AIAgentWidget.SOCKET_CDN_SOURCES = [
        // Flask-SocketIO 5.4.x requires Socket.IO client 4.x
        'https://cdn.socket.io/4.7.5/socket.io.min.js',
        'https://cdn.socket.io/4.5.4/socket.io.min.js'  // Fallback to earlier 4.x
    ];

    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new AIAgentWidget(config);
        });
    } else {
        new AIAgentWidget(config);
    }

})();
