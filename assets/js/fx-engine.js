// === EFFECT REGISTRY ===
// Dùng var (không dùng const/let ở top-level) để file có lỡ bị nạp 2 lần cũng không lỗi redeclare.
var INIT_FX_EFFECTS = window.INIT_FX_EFFECTS = window.INIT_FX_EFFECTS || {};

window.runEffect = function(name, options) {
    const effect = INIT_FX_EFFECTS[name];

    if (typeof effect === 'function') {
        effect(options);
    } else {
        console.warn('Unknown effect:', name);
    }
};

// Public API: FXEngine.trigger('firework'), FXEngine.register('myEffect', fn)
window.FXEngine = window.FXEngine || {};
window.FXEngine.trigger = function(name, options) {
    window.runEffect(name, options);
};
window.FXEngine.register = function(name, fn) {
    if (name && typeof fn === 'function') INIT_FX_EFFECTS[name] = fn;
};
window.FXEngine.effects = function() {
    return Object.keys(INIT_FX_EFFECTS);
};

// === SHAPE CACHE ===
// confetti.shapeFromText/shapeFromPath tạo canvas + bitmap mỗi lần gọi → cache lại để bấm nhiều lần không tốn thêm.
var fxShapeCache = window.__initFxShapeCache = window.__initFxShapeCache || new Map();

function fxTextShape(text, scalar) {
    const key = 't|' + text + '|' + scalar;
    let shape = fxShapeCache.get(key);
    if (!shape) {
        shape = confetti.shapeFromText({ text, scalar });
        fxShapeCache.set(key, shape);
    }
    return shape;
}

function fxRandom(min, max) {
    return Math.random() * (max - min) + min;
}

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
    const shape = fxTextShape(emoji || '😂', scalar);

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
    let heart = fxShapeCache.get('p|heart');
    if (!heart) {
        heart = confetti.shapeFromPath({
            path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
            matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
        });
        fxShapeCache.set('p|heart', heart);
    }

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

// === SEASONAL EFFECTS (v2.0.1) ===

// 🎃 Halloween: bí ngô, ma, dơi nổ tung + confetti cam/tím
function halloweenBurst() {
    const scalar = 2.4;
    const shapes = ['🎃', '👻', '🦇'].map(t => fxTextShape(t, scalar));
    const defaults = {
        spread: 360,
        ticks: 90,
        gravity: 0.45,
        decay: 0.94,
        startVelocity: 26,
        zIndex: 1000
    };

    function shoot() {
        confetti({ ...defaults, particleCount: 14, shapes, scalar, flat: true });
        confetti({
            ...defaults,
            particleCount: 26,
            scalar: 0.9,
            shapes: ['circle', 'square'],
            colors: ['#ff7518', '#6b2fa0', '#1b1b1b', '#ffb347', '#39ff14']
        });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 150);
    setTimeout(shoot, 300);
}

// 🧧 Tết: lì xì + hoa đào, hoa mai rơi từ trên xuống, kèm kim tuyến đỏ/vàng
function luckyMoney() {
    const scalar = 2.2;
    const shapes = ['🧧', '🌸', '🌼'].map(t => fxTextShape(t, scalar));
    const colors = ['#d4141c', '#ffcc00', '#ff4d4d', '#ffd700', '#fff1a8'];
    const end = Date.now() + 3500;
    let tick = 0;

    (function frame() {
        // Phát hạt mỗi 3 frame thay vì mọi frame → vẫn dày nhưng nhẹ CPU hơn.
        if (tick++ % 3 === 0) {
            confetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: 320,
                gravity: 0.55,
                drift: fxRandom(-0.4, 0.4),
                origin: { x: Math.random(), y: -0.05 },
                shapes,
                scalar,
                flat: true,
                zIndex: 1000
            });
            confetti({
                particleCount: 3,
                startVelocity: 0,
                ticks: 260,
                gravity: 0.7,
                origin: { x: Math.random(), y: -0.05 },
                colors,
                shapes: ['square', 'circle'],
                scalar: 0.9,
                zIndex: 1000
            });
        }
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

// ❄️ Giáng sinh: bông tuyết bung ra từ giữa màn hình
function snowBurst() {
    const scalar = 2;
    const flake = fxTextShape('❄️', scalar);
    const defaults = {
        spread: 360,
        ticks: 120,
        gravity: 0.3,
        decay: 0.93,
        startVelocity: 24,
        origin: { y: 0.4 },
        zIndex: 1000
    };

    function shoot() {
        confetti({ ...defaults, particleCount: 16, shapes: [flake], scalar, flat: true });
        confetti({ ...defaults, particleCount: 30, shapes: ['circle'], colors: ['#ffffff', '#dff4ff', '#b3e5ff'], scalar: 0.8 });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 180);
}

// 🏮 Trung Thu: đèn lồng bay lên từ dưới đáy màn hình
function lanternRise() {
    const scalar = 2.4;
    const shapes = ['🏮', '🏮', '🥮'].map(t => fxTextShape(t, scalar));
    const end = Date.now() + 2500;
    let tick = 0;

    (function frame() {
        if (tick++ % 6 === 0) {
            confetti({
                particleCount: 1,
                angle: 90,
                spread: 30,
                startVelocity: fxRandom(14, 22),
                decay: 0.97,
                gravity: -0.12,
                ticks: 360,
                drift: fxRandom(-0.3, 0.3),
                origin: { x: fxRandom(0.05, 0.95), y: 1.05 },
                shapes,
                scalar,
                flat: true,
                zIndex: 1000
            });
        }
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

// 🎆 Pháo hoa thật (fireworks-js, MIT) — chỉ tải thư viện khi thực sự cần (lazy load ~10KB).
var fxFireworksLoader = null;
var fxFireworksShow = null;
var fxFireworksTimer = 0;

function loadFireworksLib() {
    const getCtor = () => window.Fireworks && (window.Fireworks.Fireworks || window.Fireworks.default);

    if (getCtor()) return Promise.resolve(getCtor());
    if (fxFireworksLoader) return fxFireworksLoader;

    const src = window.INIT_FX && window.INIT_FX.assets && window.INIT_FX.assets.fireworks;
    if (!src) return Promise.reject(new Error('fireworks-js URL missing'));

    fxFireworksLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => (getCtor() ? resolve(getCtor()) : reject(new Error('fireworks-js not available')));
        script.onerror = () => reject(new Error('fireworks-js failed to load'));
        document.head.appendChild(script);
    }).catch(err => {
        fxFireworksLoader = null; // cho phép thử lại lần sau
        throw err;
    });

    return fxFireworksLoader;
}

function fireworksShow(options) {
    const duration = Math.max(2000, Math.min(20000, Number(options) || 6000));

    loadFireworksLib().then(Fireworks => {
        const scheduleEnd = (show, holder) => {
            clearTimeout(fxFireworksTimer);
            fxFireworksTimer = setTimeout(() => {
                // Gọi lại trong lúc đang tắt dần → tạo show mới thay vì dùng show sắp đóng.
                if (fxFireworksShow && fxFireworksShow.show === show) fxFireworksShow = null;
                holder.style.opacity = '0';
                show.waitStop(true).then(() => {
                    if (holder.parentNode) holder.parentNode.removeChild(holder);
                });
            }, duration);
        };

        // Đang bắn rồi → kéo dài show thay vì tạo thêm canvas mới.
        // (Không dùng show.launch(): hàm này tự gọi waitStop() và sẽ kết thúc show sớm.)
        if (fxFireworksShow) {
            scheduleEnd(fxFireworksShow.show, fxFireworksShow.holder);
            return;
        }

        const holder = document.createElement('div');
        holder.className = 'init-fx-fireworks';
        holder.setAttribute('aria-hidden', 'true');
        // Nền "bầu trời đêm" mờ dần vào/ra → pháo hoa vẫn rực rỡ trên các theme nền trắng.
        holder.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;pointer-events:none;overflow:hidden;background:rgba(6,10,32,0.6);opacity:0;transition:opacity .6s ease;';
        document.body.appendChild(holder);
        requestAnimationFrame(() => { holder.style.opacity = '1'; });

        const show = new Fireworks(holder, {
            autoresize: true,
            opacity: 0.5,
            acceleration: 1.05,
            friction: 0.97,
            gravity: 1.5,
            particles: 60,
            traceLength: 3,
            traceSpeed: 10,
            explosion: 6,
            intensity: 30,
            flickering: 50,
            lineStyle: 'round',
            hue: { min: 0, max: 360 },
            delay: { min: 25, max: 50 },
            rocketsPoint: { min: 20, max: 80 },
            lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
            brightness: { min: 50, max: 80 },
            decay: { min: 0.015, max: 0.03 },
            mouse: { click: false, move: false, max: 1 },
            sound: { enabled: false }
        });

        fxFireworksShow = { show, holder };
        show.start();
        scheduleEnd(show, holder);
    }).catch(() => {
        // Không tải được thư viện → dùng pháo hoa confetti sẵn có.
        firework();
    });
}

Object.assign(INIT_FX_EFFECTS, {
    firework,
    starlightBurst,
    emojiRain,
    schoolPride,
    celebrationBurst,
    heartRain,
    cannonBlast,
    halloweenBurst,
    luckyMoney,
    snowBurst,
    lanternRise,
    fireworksShow
});

function replaceFXKeywordsInDOM(root = document.body) {
    if (typeof FX_KEYWORDS !== 'object' || !root) return;

    const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE','SVG','MATH','INPUT']);
    const PROCESSED_ATTR = 'data-fx-keyword-processed';

    // Gộp & chuẩn hóa từ khóa
    const all = [];
    for (const [effect, entries] of Object.entries(FX_KEYWORDS)) {
        (entries || []).forEach(({ keyword, emoji }) => {
            if (!keyword) return;
            all.push({ kw: String(keyword), kwLower: String(keyword).toLowerCase(), effect, emoji: emoji || null });
        });
    }
    if (!all.length) return;

    // Dedup (ưu tiên chuỗi dài hơn), sort dài→ngắn để tránh match bán phần
    const byKey = new Map();
    for (const item of all) {
        const prev = byKey.get(item.kwLower);
        if (!prev || item.kw.length > prev.kw.length) byKey.set(item.kwLower, item);
    }
    const list = Array.from(byKey.values()).sort((a, b) => b.kw.length - a.kw.length);

    const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `(?<![\\p{L}\\p{N}_])(${list.map(i => escapeRx(i.kw)).join('|')})(?![\\p{L}\\p{N}_])`;
    const regex = new RegExp(pattern, 'giu'); // global + ignoreCase + unicode
    const lookup = new Map(list.map(i => [i.kwLower, i]));

    // Delegation: chỉ 1 listener cho cả root
    if (!root.__fxKwDelegated) {
        root.addEventListener('click', (e) => {
            const a = e.target && e.target.closest ? e.target.closest('a.fx-keyword') : null;
            if (!a) return;
            e.preventDefault();
            const name = a.dataset.effect || '';
            const opt = a.dataset.emoji || null;
            if (typeof window.runEffect === 'function') window.runEffect(name, opt);
        }, { passive: false });
        root.__fxKwDelegated = true;
    }

    // Duyệt text nodes 1 lần bằng TreeWalker
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
            const p = node.parentElement;
            if (!p || SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
            if (p.closest && p.closest('a.fx-keyword')) return NodeFilter.FILTER_REJECT;
            if (p.hasAttribute(PROCESSED_ATTR)) return NodeFilter.FILTER_REJECT;
            regex.lastIndex = 0;
            return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    const toMark = new Set();

    for (let textNode; (textNode = walker.nextNode()); ) {
        const text = textNode.nodeValue;
        const frag = document.createDocumentFragment();
        let last = 0;

        regex.lastIndex = 0;
        let m;
        while ((m = regex.exec(text))) {
            const start = m.index;
            const end = regex.lastIndex;

            if (start > last) {
                frag.appendChild(document.createTextNode(text.slice(last, start)));
            }

            const matched = m[0];
            const meta = lookup.get(matched.toLowerCase());

            const a = document.createElement('a');
            a.href = '#';
            a.className = 'fx-keyword';
            a.dataset.effect = meta ? meta.effect : '';
            if (meta && meta.emoji) a.dataset.emoji = meta.emoji;
            a.textContent = matched; // giữ nguyên hoa/thường như trong nội dung

            frag.appendChild(a);
            last = end;
        }

        if (last < text.length) {
            frag.appendChild(document.createTextNode(text.slice(last)));
        }

        const parent = textNode.parentNode;
        parent.replaceChild(frag, textNode);
        if (parent.nodeType === 1) toMark.add(parent);
    }

    // Đánh dấu để không quét lại cùng vùng
    toMark.forEach(el => el.setAttribute(PROCESSED_ATTR, '1'));
}

// enhanceInlineFormatting — range-based spoiler wrapping + smart CSS + i18n
function enhanceInlineFormatting(root = document.body) {
    const I18N = (window.INIT_FX && window.INIT_FX.i18n) || {};
    const SPOILER_LABEL = I18N.tap_to_reveal || 'Tap to reveal';

    function ensureInlineAndSpoilerCSS(rootEl, hasSpoiler) {
        // highlight only if exists
        if (rootEl.querySelector('.init-fx-highlight-text') && !document.getElementById('fx-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'fx-highlight-style';
            style.textContent = `
                .init-fx-highlight-text {
                    background-image: linear-gradient(120deg, rgba(156,255,0,.7) 0, rgba(156,255,0,.7) 100%);
                    background-repeat: no-repeat;
                    background-size: 100% .5em;
                    background-position: 0 100%;
                }
            `;
            document.head.appendChild(style);
        }
        // spoiler only if a wrapper was created/exists (không serialize innerHTML cả trang nữa → nhanh hơn nhiều)
        if ((hasSpoiler || rootEl.querySelector('.fx-spoiler')) && !document.getElementById('fx-spoiler-style')) {
            const style = document.createElement('style');
            style.id = 'fx-spoiler-style';
            const label = JSON.stringify(SPOILER_LABEL);
            style.textContent = `
                .fx-spoiler {
                    position: relative;
                    display: inline-block;
                    cursor: pointer;
                }
                .fx-spoiler .fx-spoiler-content {
                    transition: filter .25s ease, opacity .25s ease;
                }
                .fx-spoiler.is-hidden .fx-spoiler-content {
                    filter: blur(6px) saturate(.7);
                    opacity: .9;
                }
                .fx-spoiler.is-hidden::after {
                    content: ${label};
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,.35);
                    color: #fff;
                    font-size: 12px;
                    letter-spacing: .2px;
                    border-radius: 4px;
                    pointer-events: none;
                    text-shadow: 0 1px 1px rgba(0,0,0,.3);
                    user-select: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    const inlineRules = [
        { regex: /((?<=^|\s)\*([^\s*][^*]*?[^\s*]|\S)\*)|(\*([^\s*][^*]*?[^\s*]|\S)\*(?=\s|$))/g, tag: 'strong', captureGroup: [2, 4] },
        { regex: /((?<=^|\s)`([^\s`][^`]*?[^\s`]|\S)`)|(`([^\s`][^`]*?[^\s`]|\S)`(?=\s|$))/g, tag: 'em',     captureGroup: [2, 4] },
        { regex: /((?<=^|\s)~([^\s~][^~]*?[^\s~]|\S)~)|(~([^\s~][^~]*?[^\s~]|\S)~(?=\s|$))/g,               tag: 'del',    captureGroup: [2, 4] },
        { regex: /((?<=^|\s)\^([^\s^][^^]*?[^\s^]|\S)\^)|(\^([^\s^][^^]*?[^\s^]|\S)\^(?=\s|$))/g,           tag: 'mark',   captureGroup: [2, 4] },
        { regex: /((?<=^|\s)_([^\s_][^_]*?[^\s_]|\S)_)|(_([^\s_][^_]*?[^\s_]|\S)_(?=\s|$))/g,               tag: 'span',   className: 'init-fx-highlight-text', captureGroup: [2, 4] }
    ];

    const isSkippable = (el) => el.matches('script,style,pre,code');

    // Lọc nhanh: text node không chứa ký tự đánh dấu nào thì bỏ qua, khỏi chạy 5 regex.
    const MARKER_RX = /[*`~^_]/;

    function applyInlineRulesToTextNode(textNode) {
        let text = textNode.nodeValue;
        let changed = false;
        const frag = document.createDocumentFragment();
        let cursor = 0;

        while (cursor < text.length) {
            let earliest = null;
            let matchedRule = null;
            for (const rule of inlineRules) {
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
            if (earliest.index > cursor) {
                frag.appendChild(document.createTextNode(text.slice(cursor, earliest.index)));
            }
            let content = matchedRule.captureGroup
                ? (earliest[matchedRule.captureGroup[0]] || earliest[matchedRule.captureGroup[1]])
                : earliest[1];
            const el = document.createElement(matchedRule.tag);
            if (matchedRule.className) el.className = matchedRule.className;
            el.textContent = content;
            frag.appendChild(el);
            cursor = earliest.index + earliest[0].length;
            changed = true;
        }

        if (changed) {
            textNode.parentNode.replaceChild(frag, textNode);
        }
    }

    // --- Spoiler helpers: replace ||...|| theo từng text node ---
    function processSpoilersInTextNode(textNode, SPOILER_LABEL) {
        const s = textNode.nodeValue;
        if (!s || s.indexOf('||') === -1) return;

        const frag = document.createDocumentFragment();
        let pos = 0;

        while (pos < s.length) {
            const start = s.indexOf('||', pos);
            if (start === -1) {
                // còn lại là plain text
                frag.appendChild(document.createTextNode(s.slice(pos)));
                break;
            }
            // thêm phần trước token mở
            if (start > pos) {
                frag.appendChild(document.createTextNode(s.slice(pos, start)));
            }

            const end = s.indexOf('||', start + 2);
            if (end === -1) {
                // không có cặp đóng: giữ nguyên từ '||' còn lại
                frag.appendChild(document.createTextNode(s.slice(start)));
                break;
            }

            // tạo wrapper cho phần giữa 2 token
            const wrapper = document.createElement('span');
            wrapper.className = 'fx-spoiler is-hidden';
            wrapper.setAttribute('role', 'button');
            wrapper.setAttribute('tabindex', '0');
            wrapper.setAttribute('aria-label', SPOILER_LABEL);

            const inner = document.createElement('span');
            inner.className = 'fx-spoiler-content';
            inner.textContent = s.slice(start + 2, end);

            wrapper.appendChild(inner);
            frag.appendChild(wrapper);

            pos = end + 2; // nhảy qua token đóng
        }

        textNode.parentNode.replaceChild(frag, textNode);
    }

    function walkAndApply(container, SPOILER_LABEL) {
        // 1) Spoilers trước
        const treeWalker1 = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const p = node.parentNode;
                    if (!p || p.nodeType !== 1) return NodeFilter.FILTER_REJECT;
                    if (p.closest('.fx-spoiler')) return NodeFilter.FILTER_REJECT;
                    if (p.matches && p.matches('script,style,pre,code')) return NodeFilter.FILTER_REJECT;
                    return node.nodeValue && node.nodeValue.indexOf('||') !== -1
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                }
            }
        );
        const spoilerNodes = [];
        for (let n; (n = treeWalker1.nextNode()); ) spoilerNodes.push(n);
        spoilerNodes.forEach(n => processSpoilersInTextNode(n, SPOILER_LABEL));
        const hasSpoiler = spoilerNodes.length > 0;

        // 2) Inline rules sau (để không “ăn” vào phần đã wrap)
        const treeWalker2 = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (!node.nodeValue || !MARKER_RX.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                    const p = node.parentNode;
                    if (!p || p.nodeType !== 1) return NodeFilter.FILTER_REJECT;
                    if (p.closest('.fx-spoiler')) return NodeFilter.FILTER_REJECT;
                    if (p.matches && p.matches('script,style,pre,code')) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        const textNodes = [];
        for (let m; (m = treeWalker2.nextNode()); ) textNodes.push(m);
        textNodes.forEach(applyInlineRulesToTextNode);

        return hasSpoiler;
    }

    // Biến đổi DOM trước rồi mới chèn CSS (cùng 1 task, trước khi trình duyệt vẽ → không nháy).
    const hasSpoiler = walkAndApply(root, SPOILER_LABEL);
    ensureInlineAndSpoilerCSS(root, hasSpoiler);

    if (!root.__fxSpoilerBound) {
        root.addEventListener('click', (e) => {
            const target = e.target.closest('.fx-spoiler.is-hidden');
            if (!target) return;
            target.classList.remove('is-hidden');
        });
        root.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('fx-spoiler')) {
                e.preventDefault();
                e.target.classList.remove('is-hidden');
            }
        });
        root.__fxSpoilerBound = true;
    }
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
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function initFxEngineBoot() {
    replaceFXKeywordsInDOM();

    const inlinefmtEnabled = !(window.INIT_FX && window.INIT_FX.inlinefmt && window.INIT_FX.inlinefmt.enabled === false);
    if (inlinefmtEnabled) {
        enhanceInlineFormatting();
        injectHighlightStyleIfNeeded();
    }

    // 1 IntersectionObserver dùng chung cho mọi shortcode "in-view" (thay vì mỗi phần tử 1 observer).
    let inViewObserver = null;

    document.querySelectorAll('.fx-shortcode').forEach(el => {
        if (el.__fxBound) return;
        el.__fxBound = true;

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

        if (trigger === 'in-view' && 'IntersectionObserver' in window) {
            if (!inViewObserver) {
                inViewObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        inViewObserver.unobserve(entry.target);
                        runEffect(entry.target.dataset.effect, entry.target.dataset.emoji);
                    });
                });
            }
            inViewObserver.observe(el);
        }
    });
}

// Chạy được cả khi script bị trì hoãn (defer/async/delay JS của plugin cache) sau DOMContentLoaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFxEngineBoot);
} else {
    initFxEngineBoot();
}
