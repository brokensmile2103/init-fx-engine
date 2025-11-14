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

    function ensureInlineAndSpoilerCSS(rootEl) {
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
        // spoiler only if '||' present or wrapper exists
        if ((rootEl.innerHTML.includes('||') || rootEl.querySelector('.fx-spoiler')) && !document.getElementById('fx-spoiler-style')) {
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

        // 2) Inline rules sau (để không “ăn” vào phần đã wrap)
        const treeWalker2 = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
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
    }

    ensureInlineAndSpoilerCSS(root);
    walkAndApply(root, SPOILER_LABEL);

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

document.addEventListener('DOMContentLoaded', () => {
    replaceFXKeywordsInDOM();

    const inlinefmtEnabled = !(window.INIT_FX && window.INIT_FX.inlinefmt && window.INIT_FX.inlinefmt.enabled === false);
    if (inlinefmtEnabled) {
        enhanceInlineFormatting();
        injectHighlightStyleIfNeeded();
    }

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
