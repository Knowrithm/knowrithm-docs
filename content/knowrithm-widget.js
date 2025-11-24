(function () {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Prevent duplicate loads
    if (window.__knowrithmWidgetLoaded) return;
    window.__knowrithmWidgetLoaded = true;

    console.log('[Knowrithm] Widget script loaded');

    var WIDGET_STYLE_ID = 'knowrithm-widget-style';
    var WIDGET_STYLE_HREF = '/styles/chat-widget-custom.css';

    function ensureWidgetOverridesLoaded() {
        if (typeof document === 'undefined') {
            return;
        }
        if (document.getElementById(WIDGET_STYLE_ID)) {
            return;
        }

        var link = document.createElement('link');
        link.id = WIDGET_STYLE_ID;
        link.rel = 'stylesheet';
        link.href = WIDGET_STYLE_HREF;
        link.type = 'text/css';
        link.media = 'all';
        link.onerror = function (error) {
            console.error('Failed to load Knowrithm widget override styles:', error);
        };

        (document.head || document.body).appendChild(link);
    }

    var NAV_GUARD_TARGETS = [
        { selector: '#navbar', minWidth: 0, display: 'block', zIndex: 120 },
        { selector: '#sidebar', minWidth: 1024, display: 'block', zIndex: 80 },
        { selector: '#content-side-layout', minWidth: 1280, display: 'flex', zIndex: 70 },
        { selector: '#table-of-contents-layout', minWidth: 1280, display: 'flex', zIndex: 70 },
        { selector: '#table-of-contents', minWidth: 1280, display: 'block', zIndex: 70 },
        { selector: '#navbar .relative.hidden.lg\\:flex.items-center.flex-1.justify-center', minWidth: 1024, display: 'flex', zIndex: 110 },
        { selector: '#navbar .flex-1.relative.hidden.lg\\:flex.items-center.ml-auto.justify-end', minWidth: 1024, display: 'flex', zIndex: 110 },
        { selector: '#navbar .hidden.lg\\:flex.px-12.h-12', minWidth: 1024, display: 'flex', zIndex: 110 },
        { selector: '#topbar-cta-button.hidden.lg\\:flex', minWidth: 1024, display: 'flex', zIndex: 110 }
    ];
    var navGuardAttached = false;
    var navMutationObserver = null;
    var pendingNavFrame = null;

    function matchesMinWidth(rule) {
        if (!rule.minWidth) {
            return true;
        }
        if (typeof window === 'undefined') {
            return false;
        }
        if (typeof window.matchMedia === 'function') {
            return window.matchMedia('(min-width: ' + rule.minWidth + 'px)').matches;
        }
        return window.innerWidth >= rule.minWidth;
    }

    function applyNavGuardRule(rule) {
        if (typeof document === 'undefined') {
            return;
        }
        var element = document.querySelector(rule.selector);
        if (!element) {
            return;
        }

        if (!matchesMinWidth(rule)) {
            ['display', 'visibility', 'opacity', 'pointer-events', 'z-index'].forEach(function (prop) {
                element.style.removeProperty(prop);
            });
            return;
        }

        if (rule.display) {
            element.style.setProperty('display', rule.display, 'important');
        }
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('pointer-events', 'auto', 'important');
        if (typeof rule.zIndex === 'number') {
            element.style.setProperty('z-index', String(rule.zIndex), 'important');
        }
        if (element.hasAttribute('hidden')) {
            element.removeAttribute('hidden');
        }
    }

    function enforceNavigationGuards() {
        NAV_GUARD_TARGETS.forEach(applyNavGuardRule);
    }

    function scheduleNavigationGuard() {
        if (pendingNavFrame || typeof window === 'undefined') {
            return;
        }
        pendingNavFrame = window.requestAnimationFrame(function () {
            pendingNavFrame = null;
            enforceNavigationGuards();
        });
    }

    function attachNavigationGuards() {
        if (navGuardAttached || typeof document === 'undefined') {
            return;
        }
        navGuardAttached = true;
        enforceNavigationGuards();

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', scheduleNavigationGuard, { passive: true });
        }

        if (typeof MutationObserver !== 'undefined' && document.body) {
            navMutationObserver = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var target = mutations[i].target;
                    for (var j = 0; j < NAV_GUARD_TARGETS.length; j++) {
                        var rule = NAV_GUARD_TARGETS[j];
                        var element = document.querySelector(rule.selector);
                        if (element && (target === element || element.contains(target))) {
                            scheduleNavigationGuard();
                            return;
                        }
                    }
                }
            });
            navMutationObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ['style', 'hidden', 'class'],
                subtree: true
            });
        }
    }

    // Fix form autofill issues
    var processedElements = new WeakSet();

    function fixFormAutofillIssues() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        var idCounter = Date.now(); // Use timestamp for more unique IDs
        var usedIds = {};
        var fixedCount = 0;

        // Find all input, select, and textarea elements
        var formElements = document.querySelectorAll('input, select, textarea');

        formElements.forEach(function (element) {
            // Skip if already processed
            if (processedElements.has(element)) {
                return;
            }

            // Skip if element is hidden or has type="hidden"
            if (element.type === 'hidden' || element.style.display === 'none') {
                return;
            }

            var elementType = element.tagName.toLowerCase();
            var inputType = element.type || 'text';
            var needsFix = false;

            // Fix 1: Add id and name if missing
            if (!element.id && !element.name) {
                var baseId = elementType + '-' + inputType + '-' + (++idCounter);
                element.id = baseId;
                element.name = baseId;
                needsFix = true;
            } else if (!element.id) {
                element.id = element.name || (elementType + '-' + inputType + '-' + (++idCounter));
                needsFix = true;
            } else if (!element.name) {
                element.name = element.id;
                needsFix = true;
            }

            // Fix 2: Handle duplicate IDs
            if (element.id && usedIds[element.id]) {
                var newId = element.id + '-' + (++idCounter);
                element.id = newId;
                if (element.name === usedIds[element.id]) {
                    element.name = newId;
                }
                needsFix = true;
            }
            if (element.id) {
                usedIds[element.id] = true;
            }

            // Fix 3: Add autocomplete attribute if missing
            if (!element.hasAttribute('autocomplete')) {
                var autocompleteValue = 'off'; // Default to off for safety

                // Determine appropriate autocomplete value based on input type and context
                if (inputType === 'search' || element.getAttribute('role') === 'search') {
                    autocompleteValue = 'off';
                } else if (inputType === 'email') {
                    autocompleteValue = 'email';
                } else if (inputType === 'tel') {
                    autocompleteValue = 'tel';
                } else if (inputType === 'url') {
                    autocompleteValue = 'url';
                } else if (inputType === 'text') {
                    // Check for common name patterns
                    var nameAttr = (element.name || element.id || '').toLowerCase();
                    if (nameAttr.includes('name')) {
                        autocompleteValue = 'name';
                    } else if (nameAttr.includes('email')) {
                        autocompleteValue = 'email';
                    } else if (nameAttr.includes('search') || nameAttr.includes('query')) {
                        autocompleteValue = 'off';
                    } else {
                        autocompleteValue = 'off';
                    }
                }

                element.setAttribute('autocomplete', autocompleteValue);
                needsFix = true;
            }

            if (needsFix) {
                fixedCount++;
                processedElements.add(element);
            }
        });

        if (fixedCount > 0) {
            console.log('[Knowrithm] Fixed ' + fixedCount + ' form field(s) for autofill compatibility');
        }
    }

    // Wait for DOM to be ready
    function initWidget() {
        ensureWidgetOverridesLoaded();
        attachNavigationGuards();

        // Fix form autofill issues on initial load
        fixFormAutofillIssues();

        // Run again after a short delay to catch elements created by other scripts
        setTimeout(function () {
            fixFormAutofillIssues();
        }, 500);

        // Run again after a longer delay for late-loading elements
        setTimeout(function () {
            fixFormAutofillIssues();
        }, 2000);

        // Periodic check for the first 10 seconds to catch all dynamic elements
        var checkCount = 0;
        var periodicCheck = setInterval(function () {
            fixFormAutofillIssues();
            checkCount++;
            if (checkCount >= 5) { // Run 5 times over 10 seconds
                clearInterval(periodicCheck);
            }
        }, 2000);

        // Set up observer to fix dynamically added form elements
        if (typeof MutationObserver !== 'undefined') {
            var formObserver = new MutationObserver(function (mutations) {
                var shouldFix = false;
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function (node) {
                            if (node.nodeType === 1) { // Element node
                                var tagName = node.tagName ? node.tagName.toLowerCase() : '';
                                if (tagName === 'input' || tagName === 'select' || tagName === 'textarea' || tagName === 'form') {
                                    shouldFix = true;
                                } else if (node.querySelector && node.querySelector('input, select, textarea')) {
                                    shouldFix = true;
                                }
                            }
                        });
                    }
                });
                if (shouldFix) {
                    // Debounce the fix to avoid excessive calls
                    setTimeout(function () {
                        fixFormAutofillIssues();
                    }, 100);
                }
            });

            if (document.body) {
                formObserver.observe(document.body, { childList: true, subtree: true });
            }
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

        script.onload = ensureWidgetOverridesLoaded;
        script.onerror = function (error) {
            console.error('Failed to load Knowrithm widget script:', error);
            ensureWidgetOverridesLoaded();
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
