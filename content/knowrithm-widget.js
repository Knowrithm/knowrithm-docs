(function () {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Prevent duplicate loads
    if (window.__knowrithmWidgetLoaded) return;
    window.__knowrithmWidgetLoaded = true;

    var WIDGET_STYLE_ID = 'knowrithm-widget-style';
    var WIDGET_STYLE_HREF = '/styles/chat-widget-custom.css';
    var NAV_ELEMENTS = [
        { id: 'navbar', minWidth: 0, display: 'block', zIndex: 90 },
        { id: 'sidebar', minWidth: 1024, display: 'block', zIndex: 80 },
        { id: 'content-side-layout', minWidth: 1280, display: 'flex', zIndex: 70 },
        { id: 'table-of-contents-layout', minWidth: 1280, display: 'flex', zIndex: 70 },
        { id: 'table-of-contents', minWidth: 1280, display: 'block', zIndex: 70 }
    ];
    var navVisibilityGuardAttached = false;
    var navMutationObserver = null;
    var navElementObservers = {};

    function observeNavElement(ruleId, element) {
        if (typeof MutationObserver === 'undefined' || !element) {
            return;
        }

        var existing = navElementObservers[ruleId];
        if (existing && existing.element === element) {
            return;
        }

        if (existing && existing.observer) {
            existing.observer.disconnect();
        }

        var observer = new MutationObserver(function () {
            applyAllNavigationRules();
        });

        observer.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
        navElementObservers[ruleId] = { observer: observer, element: element };
    }

    function applyNavigationRule(rule) {
        var element = document.getElementById(rule.id);
        if (!element) return;

        var meetsBreakpoint = true;
        if (rule.minWidth) {
            if (typeof window.matchMedia === 'function') {
                meetsBreakpoint = window.matchMedia('(min-width: ' + rule.minWidth + 'px)').matches;
            } else {
                meetsBreakpoint = window.innerWidth >= rule.minWidth;
            }
        }

        if (meetsBreakpoint) {
            var displayValue = rule.display || 'block';
            element.style.setProperty('display', displayValue, 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('opacity', '1', 'important');
            element.style.setProperty('pointer-events', 'auto', 'important');
            if (typeof rule.zIndex === 'number') {
                element.style.setProperty('z-index', String(rule.zIndex), 'important');
            }
            if (element.hasAttribute('hidden')) {
                element.removeAttribute('hidden');
            }
        } else {
            ['display', 'visibility', 'opacity', 'pointer-events', 'z-index'].forEach(function (prop) {
                element.style.removeProperty(prop);
            });
        }

        observeNavElement(rule.id, element);
    }

    function applyAllNavigationRules() {
        NAV_ELEMENTS.forEach(applyNavigationRule);
    }

    function maintainNavigationVisibility() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        applyAllNavigationRules();

        if (navVisibilityGuardAttached) {
            return;
        }
        navVisibilityGuardAttached = true;

        var queries = NAV_ELEMENTS
            .filter(function (rule) { return rule.minWidth; })
            .map(function (rule) { return '(min-width: ' + rule.minWidth + 'px)'; })
            .filter(function (query, index, self) { return self.indexOf(query) === index; });

        function handleViewportChange() {
            applyAllNavigationRules();
        }

        if (queries.length && typeof window.matchMedia === 'function') {
            queries.forEach(function (query) {
                var mediaQuery = window.matchMedia(query);
                if (typeof mediaQuery.addEventListener === 'function') {
                    mediaQuery.addEventListener('change', handleViewportChange);
                } else if (typeof mediaQuery.addListener === 'function') {
                    mediaQuery.addListener(handleViewportChange);
                }
            });
        } else {
            window.addEventListener('resize', handleViewportChange, { passive: true });
        }

        if (typeof MutationObserver !== 'undefined') {
            NAV_ELEMENTS.forEach(function (rule) {
                var target = document.getElementById(rule.id);
                if (target) {
                    var observer = new MutationObserver(handleViewportChange);
                    observer.observe(target, { attributes: true, attributeFilter: ['class', 'style'] });
                }
            });

            if (!navMutationObserver) {
                navMutationObserver = new MutationObserver(function () {
                    applyAllNavigationRules();
                });

                if (document.body) {
                    navMutationObserver.observe(document.body, { childList: true, subtree: true });
                } else {
                    document.addEventListener('DOMContentLoaded', function () {
                        if (!navMutationObserver) return;
                        navMutationObserver.observe(document.body, { childList: true, subtree: true });
                    });
                }
            }
        }
    }

    // Wait for DOM to be ready
    function initWidget() {
        maintainNavigationVisibility();

        // Ensure the scoped widget stylesheet is loaded once
        if (!document.getElementById(WIDGET_STYLE_ID)) {
            var link = document.createElement('link');
            link.id = WIDGET_STYLE_ID;
            link.rel = 'stylesheet';
            link.href = WIDGET_STYLE_HREF;
            link.type = 'text/css';
            link.media = 'all';
            link.onerror = function (error) {
                console.error('Failed to load Knowrithm widget styles:', error);
            };

            (document.head || document.body).appendChild(link);
        }

        // Configure the widget BEFORE loading the script
        window.AIChatWidget = {
            agentId: "2b041b45-a585-47e9-abaf-ebaad766bce9",
            apiUrl: "https://app.knowrithm.org/api/v1",
            color: "#0972A3",
            position: "right",
            appearance: {
                theme: "light",
                primaryColor: "#0972A3",
                placement: "bottom-right",
                buttonText: "Chat with us",
                showBranding: true
            },
            behavior: {
                autoOpen: false,
                initialDelay: 0,
                persistSession: true,
                pollingInterval: 10000,
                enableSounds: false
            },
            callbacks: {
                onLoad: function () {
                    console.log('Knowrithm widget initialized');
                },
                onError: function (error) {
                    console.error('Knowrithm widget error:', error);
                },
                onMessage: null,
                onClose: null
            },
            assets: {
                scriptUrl: "https://app.knowrithm.org/api/widget.js",
                styleUrl: WIDGET_STYLE_HREF
            }
        };

        // Load ONLY the widget script - let it handle its own CSS
        var script = document.createElement('script');
        script.src = 'https://app.knowrithm.org/api/widget.js';
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true; // Defer to avoid blocking page load

        script.onerror = function (error) {
            console.error('Failed to load Knowrithm widget script:', error);
        };

        // Append to body instead of head to avoid interfering with page initialization
        if (document.body) {
            document.body.appendChild(script);
        } else {
            document.head.appendChild(script);
        }
    }

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        // DOM already loaded, run immediately
        initWidget();
    }
})();
