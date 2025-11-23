(function () {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Prevent duplicate loads
    if (window.__knowrithmWidgetLoaded) return;
    window.__knowrithmWidgetLoaded = true;

    // Wait for DOM to be ready
    function initWidget() {
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
                styleUrl: "https://minio.knowrithm.org/knowrithm-bucket/chat-widget.css"
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
