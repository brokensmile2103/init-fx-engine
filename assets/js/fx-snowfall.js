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
        startSnowfall();
    } else {
        console.warn('[Init FX Engine] particlesJS not found.');
    }
});

function startSnowfall() {
    particlesJS('particles-snow-js', {
        particles: {
            number: { value: 200, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 6, random: true },
            move: {
                enable: true,
                speed: 2,
                direction: 'bottom',
                out_mode: 'out'
            },
            line_linked: { enable: false }
        },
        retina_detect: true
    });
}
