(function waitForConfig(retry = 0) {
    if (window.INIT_FX?.preloader?.enabled) {
        initPreloader();
    } else if (retry < 10) {
        setTimeout(() => waitForConfig(retry + 1), 30);
    }

    function initPreloader() {
        const styleId = 'init-fx-preloader-style';
        const styleEl = document.createElement('style');
        styleEl.id = styleId;

        const config = window.INIT_FX.preloader || {};
        const style = config.style || 'dot';
        const bg = config.bg || '#ffffff';

        const isDark = (color) => {
            const dummy = document.createElement('div');
            dummy.style.color = color;
            document.body.appendChild(dummy);
            const computed = getComputedStyle(dummy).color;
            document.body.removeChild(dummy);

            const rgb = computed.match(/\d+/g);
            if (!rgb) return false;

            const [r, g, b] = rgb.map(Number);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        };

        const color = isDark(bg) ? '#ffffff' : '#000000';

        const cssMap = {
            dot: `
#init-fx-preloader {
    position: fixed;
    inset: 0;
    background: ${bg.includes(',') ? `linear-gradient(to right, ${bg})` : bg};
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.6s ease;
}
body.fx-loaded #init-fx-preloader {
    opacity: 0;
}
.fade-out-complete {
    display: none !important;
}
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
#init-fx-preloader {
    position: fixed;
    inset: 0;
    background: ${bg.includes(',') ? `linear-gradient(to right, ${bg})` : bg};
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.6s ease;
}
body.fx-loaded #init-fx-preloader {
    opacity: 0;
}
.fade-out-complete {
    display: none !important;
}
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
#init-fx-preloader {
    position: fixed;
    inset: 0;
    background: ${bg.includes(',') ? `linear-gradient(to right, ${bg})` : bg};
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.6s ease;
}
body.fx-loaded #init-fx-preloader {
    opacity: 0;
}
.fade-out-complete {
    display: none !important;
}
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
#init-fx-preloader {
    position: fixed;
    inset: 0;
    background: ${bg.includes(',') ? `linear-gradient(to right, ${bg})` : bg};
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.6s ease;
}
body.fx-loaded #init-fx-preloader { opacity: 0; }
.fade-out-complete { display: none !important; }
#init-fx-preloader .flower {
    width: 24px;
    height: 24px;
    background: ${color};
    border-radius: 50%;
    animation: flower-bloom 1.4s ease-in-out infinite;
}
@keyframes flower-bloom {
    0%, 100% { transform: scale(0.6); opacity: 0.4; }
    50%      { transform: scale(1.4); opacity: 1; }
}
            `,
            spinner: `
#init-fx-preloader {
    position: fixed;
    inset: 0;
    background: ${bg.includes(',') ? `linear-gradient(to right, ${bg})` : bg};
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.6s ease;
}
body.fx-loaded #init-fx-preloader { opacity: 0; }
.fade-out-complete { display: none !important; }
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
#init-fx-preloader {
    position: fixed;
    inset: 0;
    background: ${bg.includes(',') ? `linear-gradient(to right, ${bg})` : bg};
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.6s ease;
}
body.fx-loaded #init-fx-preloader { opacity: 0; }
.fade-out-complete { display: none !important; }
#init-fx-preloader .emoji {
    font-size: 2.5rem;
    animation: bounce 1.2s ease-in-out infinite;
}
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
}
            `,
        };

        styleEl.textContent = cssMap[style] || '';
        document.head.appendChild(styleEl);

        function run() {
            const startTime = performance.now();
            let preloadDiv = document.getElementById('init-fx-preloader');

            // Nếu chưa có thì mới tạo
            const isNew = !preloadDiv;
            if (isNew) {
                preloadDiv = document.createElement('div');
                preloadDiv.id = 'init-fx-preloader';
                document.body.appendChild(preloadDiv);
            }

            // Clear nội dung cũ nếu có
            preloadDiv.innerHTML = '';

            // Append loader content
            if (style === 'dot') {
                for (let i = 0; i < 3; i++) {
                    preloadDiv.appendChild(document.createElement('span'));
                }
            } else if (style === 'bar') {
                const bar = document.createElement('div');
                bar.className = 'bar';
                preloadDiv.appendChild(bar);
            } else if (style === 'logo') {
                const favicon =
                    document.querySelector('link[rel="apple-touch-icon"]')?.href ||
                    document.querySelector('link[rel="icon"][sizes="192x192"]')?.href ||
                    document.querySelector('link[rel="icon"]')?.href || '';
                if (favicon) {
                    const img = document.createElement('img');
                    img.src = favicon;
                    img.alt = 'Logo';
                    preloadDiv.appendChild(img);
                }
            } else if (style === 'flower') {
                const el = document.createElement('div');
                el.className = 'flower';
                preloadDiv.appendChild(el);
            } else if (style === 'spinner') {
                const el = document.createElement('div');
                el.className = 'spinner';
                preloadDiv.appendChild(el);
            } else if (style === 'emoji') {
                const el = document.createElement('div');
                el.className = 'emoji';
                const emojis = ['😎', '🚀', '🌸', '✨', '💫'];
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                preloadDiv.appendChild(el);
            }

            // Ẩn preloader
            function hidePreloader() {
                const MIN_SHOW_TIME = 600;
                const FADE_OUT_TIME = 600;
                const DELAY_BEFORE_FADE = 500;

                const now = performance.now();
                const elapsed = now - startTime;
                const remainingVisibleTime = Math.max(0, MIN_SHOW_TIME - elapsed);

                setTimeout(() => {
                    document.body.classList.add('fx-loaded');

                    setTimeout(() => {
                        preloadDiv.classList.add('fade-out-complete');
                        preloadDiv.remove();
                        styleEl.remove();
                        document.body.classList.remove('fx-loaded');
                    }, FADE_OUT_TIME);
                }, Math.max(DELAY_BEFORE_FADE, remainingVisibleTime));
            }

            if (document.readyState === 'complete') {
                hidePreloader();
            } else {
                window.addEventListener('load', hidePreloader);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }
})();
