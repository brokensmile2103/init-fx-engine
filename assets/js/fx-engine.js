window.runEffect = function(name, options) {
    const effects = {
        firework,
        starlightBurst,
        emojiRain,
        schoolPride,
        celebrationBurst,
        heartRain,
        cannonBlast
    };

    if (effects[name]) {
        effects[name](options);
    } else {
        console.warn('Unknown effect:', name);
    }
};

// === EFFECT DEFINITIONS ===

function firework() {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.1, 0.3),
                y: Math.random() - 0.2
            }
        });

        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.7, 0.9),
                y: Math.random() - 0.2
            }
        });
    }, 250);
}

function starlightBurst() {
    const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
    };

    function shoot() {
        confetti({
            ...defaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ['star']
        });

        confetti({
            ...defaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ['circle']
        });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
}

function emojiRain(emoji = '😂') {
    const scalar = 2;
    const shape = confetti.shapeFromText({ text: emoji, scalar });

    const defaults = {
        spread: 360,
        ticks: 60,
        gravity: 0,
        decay: 0.96,
        startVelocity: 20,
        shapes: [shape],
        scalar
    };

    function shoot() {
        confetti({ ...defaults, particleCount: 30 });
        confetti({ ...defaults, particleCount: 5, flat: true });
        confetti({ ...defaults, particleCount: 15, scalar: scalar / 2, shapes: ['circle'] });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
}

function schoolPride() {
    const end = Date.now() + 5000;
    const colors = ['#bb0000', '#ffffff'];

    (function frame() {
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

function celebrationBurst() {
    const end = Date.now() + 5000;

    (function frame() {
        confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

function heartRain() {
    const heart = confetti.shapeFromPath({
        path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
    });

    const duration = 4000;
    const end = Date.now() + duration;
    const defaults = {
        scalar: 2,
        spread: 180,
        particleCount: 3,
        origin: { y: -0.1 },
        startVelocity: -35,
        shapes: [heart],
        colors: ['#f93963', '#a10864', '#ee0b93']
    };

    (function frame() {
        confetti({ ...defaults });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

function cannonBlast() {
    confetti({
        particleCount: 120,
        spread: 90,
        startVelocity: 40,
        gravity: 0.7,
        scalar: 1.2,
        origin: { y: 0.6 }
    });
}

function replaceFXKeywordsInDOM(root = document.body) {
    if (typeof FX_KEYWORDS !== 'object') return;

    Object.entries(FX_KEYWORDS).forEach(([effect, entries]) => {
        entries.forEach(entry => {
            const keyword = entry.keyword;
            const emoji = entry.emoji || null;
            const regex = new RegExp(`\\b(${escapeRegExp(keyword)})\\b`, 'gi');

            root.querySelectorAll('*:not(script):not(style)').forEach(node => {
                node.childNodes.forEach(child => {
                    if (child.nodeType === 3 && regex.test(child.textContent)) {
                        const frag = document.createDocumentFragment();
                        const parts = child.textContent.split(regex);

                        parts.forEach(part => {
                            if (part.toLowerCase() === keyword.toLowerCase()) {
                                const link = document.createElement('a');
                                link.href = '#';
                                link.className = 'fx-keyword';
                                link.dataset.effect = effect;
                                if (emoji) link.dataset.emoji = emoji;
                                link.textContent = keyword;
                                link.addEventListener('click', e => {
                                    e.preventDefault();
                                    runEffect(effect, emoji);
                                });
                                frag.appendChild(link);
                            } else {
                                frag.appendChild(document.createTextNode(part));
                            }
                        });

                        node.replaceChild(frag, child);
                    }
                });
            });
        });
    });
}

function enhanceInlineFormatting(root = document.body) {
    const rules = [
        { 
            // *text* - bold (chỉ cần 1 trong 2 đầu có khoảng trắng, không có space liền sau/trước dấu)
            regex: /((?<=^|\s)\*([^\s*][^*]*?[^\s*]|\S)\*)|(\*([^\s*][^*]*?[^\s*]|\S)\*(?=\s|$))/g, 
            tag: 'strong',
            captureGroup: [2, 4] // Group 2 hoặc 4 chứa content
        },
        { 
            // `code` - code formatting (em tag thay vì code để tương thích)
            regex: /((?<=^|\s)`([^\s`][^`]*?[^\s`]|\S)`)|(`([^\s`][^`]*?[^\s`]|\S)`(?=\s|$))/g, 
            tag: 'em',
            captureGroup: [2, 4]
        },
        { 
            // ~text~ - strikethrough
            regex: /((?<=^|\s)~([^\s~][^~]*?[^\s~]|\S)~)|(~([^\s~][^~]*?[^\s~]|\S)~(?=\s|$))/g, 
            tag: 'del',
            captureGroup: [2, 4]
        },
        { 
            // ^text^ - highlight
            regex: /((?<=^|\s)\^([^\s^][^^]*?[^\s^]|\S)\^)|(\^([^\s^][^^]*?[^\s^]|\S)\^(?=\s|$))/g, 
            tag: 'mark',
            captureGroup: [2, 4]
        },
        { 
            // _text_ - custom highlight
            regex: /((?<=^|\s)_([^\s_][^_]*?[^\s_]|\S)_)|(_([^\s_][^_]*?[^\s_]|\S)_(?=\s|$))/g, 
            tag: 'span', 
            className: 'init-fx-highlight-text',
            captureGroup: [2, 4]
        }
    ];

    root.querySelectorAll('*:not(script):not(style):not(pre):not(a)').forEach(node => {
        node.childNodes.forEach(child => {
            if (child.nodeType !== 3) return;

            let text = child.textContent;
            let changed = false;
            let frag = document.createDocumentFragment();
            let cursor = 0;

            while (cursor < text.length) {
                let earliest = null;
                let matchedRule = null;

                for (const rule of rules) {
                    rule.regex.lastIndex = cursor;
                    const match = rule.regex.exec(text);
                    if (match && (!earliest || match.index < earliest.index)) {
                        earliest = match;
                        matchedRule = rule;
                    }
                }

                if (!earliest) {
                    frag.appendChild(document.createTextNode(text.slice(cursor)));
                    break;
                }

                // Thêm text trước match
                if (earliest.index > cursor) {
                    frag.appendChild(document.createTextNode(text.slice(cursor, earliest.index)));
                }

                // Xử lý capture group cho các rule mới
                let content;
                if (matchedRule.captureGroup) {
                    // Tìm group nào có content (group 2 hoặc 4)
                    content = earliest[matchedRule.captureGroup[0]] || earliest[matchedRule.captureGroup[1]];
                } else {
                    content = earliest[1];
                }

                const el = document.createElement(matchedRule.tag);
                if (matchedRule.className) el.className = matchedRule.className;
                el.textContent = content;
                frag.appendChild(el);

                cursor = earliest.index + earliest[0].length;
                changed = true;
            }

            if (changed) {
                node.replaceChild(frag, child);
            }
        });
    });
}

function injectHighlightStyleIfNeeded() {
    if (document.querySelector('.init-fx-highlight-text') && !document.getElementById('fx-highlight-style')) {
        const style = document.createElement('style');
        style.id = 'fx-highlight-style';
        style.textContent = `
            .init-fx-highlight-text {
                background-image: linear-gradient(120deg, rgba(156, 255, 0, 0.7) 0, rgba(156, 255, 0, 0.7) 100%);
                background-repeat: no-repeat;
                background-size: 100% 0.5em;
                background-position: 0 100%;
            }
        `;
        document.head.appendChild(style);
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

document.addEventListener('DOMContentLoaded', () => {
    replaceFXKeywordsInDOM();
    enhanceInlineFormatting();
    injectHighlightStyleIfNeeded();

    document.querySelectorAll('.fx-shortcode').forEach(el => {
        const fx = el.dataset.effect;
        const emoji = el.dataset.emoji;
        const trigger = el.dataset.trigger || 'click';

        if (trigger === 'immediate') runEffect(fx, emoji);

        if (trigger === 'click') {
            el.addEventListener('click', e => {
                e.preventDefault();
                runEffect(fx, emoji);
            });
        }

        if (trigger === 'hover') {
            el.addEventListener('mouseenter', () => {
                runEffect(fx, emoji);
            });
        }

        if (trigger === 'in-view') {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    runEffect(fx, emoji);
                    observer.disconnect();
                }
            });
            observer.observe(el);
        }
    });
});
