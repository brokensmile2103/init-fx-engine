// fx-preloader.js - Minimal fix - chỉ sửa z-index issue + session_once
(function initPreloader() {
    // Không cần wait config nữa vì đã pass sớm từ PHP
    const config = window.INIT_FX?.preloader;
    if (!config?.enabled) {
        // Nếu không enable thì remove preloading state
        document.documentElement.classList.remove('init-fx-preloading');
        return;
    }

    // === ONLY ONCE PER SESSION ===
    const SEEN_KEY = 'init_fx_preloader_seen';
    if (config.session_once) {
        try {
            if (sessionStorage.getItem(SEEN_KEY) === '1') {
                // Đã hiển thị trong session này → bỏ qua, dọn dẹp ngay
                document.documentElement.classList.remove('init-fx-preloading');
                var pre = document.getElementById('init-fx-preloader');
                if (pre && pre.parentNode) pre.remove();
                var critical = document.getElementById('init-fx-critical-preloader');
                if (critical && critical.parentNode) critical.remove();
                return;
            }
            // Đánh dấu đã hiển thị cho session hiện tại
            sessionStorage.setItem(SEEN_KEY, '1');
        } catch (e) {
            // Nếu sessionStorage bị chặn, tiếp tục hiển thị như bình thường
        }
    }
    // === END ONLY ONCE PER SESSION ===

    const style = config.style || 'dot';
    const bg = config.bg || '#ffffff';
    
    // Utility để detect màu dark/light - Safe version
    const isDark = (color) => {
        // Fallback nếu document.body chưa ready
        if (!document.body) {
            // Simple heuristic cho common colors
            if (color.includes('#')) {
                const hex = color.replace('#', '');
                if (hex.length === 6) {
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return luminance < 0.5;
                }
            }
            return false; // Default to light
        }

        try {
            const dummy = document.createElement('div');
            dummy.style.color = color;
            dummy.style.position = 'absolute';
            dummy.style.visibility = 'hidden';
            document.body.appendChild(dummy);
            
            const computed = getComputedStyle(dummy).color;
            document.body.removeChild(dummy);

            const rgb = computed.match(/\d+/g);
            if (!rgb) return false;

            const [r, g, b] = rgb.map(Number);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        } catch (e) {
            console.warn('isDark function failed:', e);
            return false; // Fallback to light
        }
    };

    const color = isDark(bg) ? '#ffffff' : '#000000';

    // Style definitions cho từng loại preloader - ORIGINAL STYLES
    const styleDefinitions = {
        dot: `
            #init-fx-preloader span {
                width: 10px;
                height: 10px;
                margin: 5px;
                background: ${color};
                border-radius: 50%;
                animation: dot-flash 1.2s infinite ease-in-out;
            }
            #init-fx-preloader span:nth-child(2) { animation-delay: 0.2s; }
            #init-fx-preloader span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes dot-flash {
                0%, 80%, 100% { opacity: 0.3; transform: scale(0.9); }
                40% { opacity: 1; transform: scale(1.2); }
            }
        `,
        bar: `
            #init-fx-preloader .bar {
                width: 60%;
                height: 4px;
                background: rgba(${color === '#000000' ? '0,0,0' : '255,255,255'}, 0.2);
                position: relative;
                overflow: hidden;
                border-radius: 2px;
            }
            #init-fx-preloader .bar::after {
                content: "";
                position: absolute;
                left: -40%;
                width: 40%;
                height: 100%;
                background: ${color};
                animation: loading-bar 1.2s linear infinite;
            }
            @keyframes loading-bar {
                0% { left: -40%; }
                100% { left: 100%; }
            }
        `,
        logo: `
            #init-fx-preloader img {
                width: 100px;
                height: 100px;
                animation: pulse 1.5s infinite ease-in-out;
                filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.6; }
            }
        `,
        flower: `
            #init-fx-preloader .flower {
                width: 24px;
                height: 24px;
                background: ${color};
                border-radius: 50%;
                animation: flower-bloom 1.4s ease-in-out infinite;
            }
            @keyframes flower-bloom {
                0%, 100% { transform: scale(0.6); opacity: 0.4; }
                50% { transform: scale(1.4); opacity: 1; }
            }
        `,
        spinner: `
            #init-fx-preloader .spinner {
                width: 32px;
                height: 32px;
                border: 4px solid ${color};
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `,
        emoji: `
            #init-fx-preloader .emoji {
                font-size: 2.5rem;
                animation: bounce 1.2s ease-in-out infinite;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-12px); }
            }
        `
    };

    // Inject thêm CSS cho animation
    const additionalCSS = document.createElement('style');
    additionalCSS.id = 'init-fx-preloader-animations';
    additionalCSS.textContent = styleDefinitions[style] || '';
    document.head.appendChild(additionalCSS);

    function setupPreloader() {
        let preloader = document.getElementById('init-fx-preloader');
        
        // Nếu preloader chưa có (fallback)
        if (!preloader) {
            preloader = document.createElement('div');
            preloader.id = 'init-fx-preloader';
            
            // ONLY FIX Z-INDEX - add inline style để ensure z-index
            preloader.style.zIndex = '999999999';
            
            // Safe append - check if body exists
            if (document.body) {
                document.body.appendChild(preloader);
            } else {
                // Fallback: append to documentElement if body not ready
                document.documentElement.appendChild(preloader);
            }
        } else {
            // Ensure existing preloader has correct z-index
            preloader.style.zIndex = '999999999';
        }

        // Clear và setup content - ORIGINAL LOGIC
        preloader.innerHTML = '';

        // Add content theo style
        if (style === 'dot') {
            for (let i = 0; i < 3; i++) {
                preloader.appendChild(document.createElement('span'));
            }
        } else if (style === 'bar') {
            const bar = document.createElement('div');
            bar.className = 'bar';
            preloader.appendChild(bar);
        } else if (style === 'logo') {
            const favicon =
                document.querySelector('link[rel="apple-touch-icon"]')?.href ||
                document.querySelector('link[rel="icon"][sizes="192x192"]')?.href ||
                document.querySelector('link[rel="icon"]')?.href;
            if (favicon) {
                const img = document.createElement('img');
                img.src = favicon;
                img.alt = 'Loading...';
                preloader.appendChild(img);
            }
        } else if (style === 'flower') {
            const flower = document.createElement('div');
            flower.className = 'flower';
            preloader.appendChild(flower);
        } else if (style === 'spinner') {
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            preloader.appendChild(spinner);
        } else if (style === 'emoji') {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            const emojis = ['😎', '🚀', '🌸', '✨', '💫'];
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            preloader.appendChild(emoji);
        }

        return preloader;
    }

    function hidePreloader() {
        const preloader = document.getElementById('init-fx-preloader');
        const animations = document.getElementById('init-fx-preloader-animations');
        const criticalCSS = document.getElementById('init-fx-critical-preloader');

        if (!preloader) return;

        // MANUAL FADE OUT WITH JAVASCRIPT - NO CSS ANIMATION
        preloader.style.pointerEvents = 'none';
        preloader.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0.0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        // Start fade immediately
        requestAnimationFrame(() => {
            preloader.style.opacity = '0';
            preloader.style.transform = 'scale(1.02)';
        });
        
        // Show content với gentle transition
        setTimeout(() => {
            document.documentElement.classList.remove('init-fx-preloading');
        }, 400);

        // Complete cleanup sau khi transition done
        setTimeout(() => {
            if (preloader && preloader.parentNode) {
                preloader.style.visibility = 'hidden';
                preloader.remove();
            }
            if (animations && animations.parentNode) {
                animations.remove();
            }
            if (criticalCSS && criticalCSS.parentNode) {
                criticalCSS.remove();
            }
        }, 1300);
    }

    // Main execution với proper timing - ORIGINAL LOGIC
    function run() {
        // Đảm bảo body đã ready trước khi setup
        if (!document.body) {
            // Nếu body chưa ready, wait một chút
            setTimeout(run, 10);
            return;
        }

        const startTime = performance.now();
        const MIN_SHOW_TIME = 800; // Minimum time để user nhìn thấy preloader

        setupPreloader();

        const handleLoadComplete = () => {
            const elapsed = performance.now() - startTime;
            const remainingTime = Math.max(500, MIN_SHOW_TIME - elapsed); // Đảm bảo user thấy preloader
            
            setTimeout(hidePreloader, remainingTime);
        };

        if (document.readyState === 'complete') {
            handleLoadComplete();
        } else {
            window.addEventListener('load', handleLoadComplete, { once: true });
        }
    }

    // Execute với better timing handling - ORIGINAL LOGIC
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        // Nếu DOM đã ready nhưng body chưa có, wait
        if (document.body) {
            run();
        } else {
            setTimeout(run, 10);
        }
    }
})();
