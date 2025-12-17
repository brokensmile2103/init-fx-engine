document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('particles-snow-js')) {
        const snowDiv = document.createElement('div');
        snowDiv.id = 'particles-snow-js';
        Object.assign(snowDiv.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: '999',
            pointerEvents: 'none'
        });
        document.body.appendChild(snowDiv);
    }

    if (typeof particlesJS === 'function') {
        notedStartSnowfall();
    } else {
        console.warn('[Init FX Engine] particlesJS not found.');
    }
});

function fxClamp(n, min, max) {
    n = Number(n);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
}

function notedStartSnowfall() {
    const cfg = (window.INIT_FX && window.INIT_FX.snowfall) ? window.INIT_FX.snowfall : {};

    // Defaults vừa phải
    const amount  = fxClamp(cfg.amount,  20, 200) || 80;
    const size    = fxClamp(cfg.size,     1,  10) || 4;
    const speed   = fxClamp(cfg.speed,  0.3,   5) || 1.2;
    const opacity = fxClamp(cfg.opacity, 0.1,   1) || 0.6;

    // Density: tăng area theo amount để tránh quá dày khi user kéo amount lên
    const valueArea = fxClamp(800 + (200 - amount) * 4, 800, 1600);

    particlesJS('particles-snow-js', {
        particles: {
            number: { value: amount, density: { enable: true, value_area: valueArea } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: opacity, random: true },
            size: { value: size, random: true },
            move: {
                enable: true,
                speed: speed,
                direction: 'bottom',
                out_mode: 'out'
            },
            line_linked: { enable: false }
        },
        retina_detect: true
    });
}
