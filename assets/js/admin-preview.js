document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.fx-preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.dataset.effect;
            const input = btn.closest('td').querySelector('input');
            let emoji = undefined;

            if (effect === 'emojiRain' && input?.value) {
                const firstPair = input.value.split(',').map(s => s.trim()).find(pair => pair.includes(':'));
                if (firstPair) {
                    const parts = firstPair.split(':');
                    if (parts.length === 2) {
                        emoji = parts[1].trim();
                    }
                }
            }

            if (typeof runEffect === 'function') runEffect(effect, emoji);
        });
    });

    // Seasonal Effects preview — dùng giá trị đang nhập trong form (chưa cần lưu).
    const seasonalBtn = document.querySelector('.fx-seasonal-preview-btn');
    if (seasonalBtn) {
        seasonalBtn.addEventListener('click', () => {
            const box = seasonalBtn.closest('td');
            const fx = window.INIT_FX || {};
            const themes = fx.seasonalThemes || {};
            const value = (selector) => {
                const input = box.querySelector(selector);
                return input ? input.value : '';
            };

            let theme = value('.fx-seasonal-theme') || 'auto';
            if (theme === 'auto') theme = fx.seasonalAutoTheme || Object.keys(themes)[0];

            const definition = themes[theme];
            if (!definition || !window.initFxSeasonal) return;

            const custom = value('.fx-seasonal-emojis').split(',').map(s => s.trim()).filter(Boolean).slice(0, 12);

            window.initFxSeasonal.preview({
                theme: theme,
                items: custom.length ? custom : definition.items,
                motion: definition.motion,
                glow: definition.glow,
                greeting: definition.greeting,
                amount: value('.fx-seasonal-amount'),
                size: value('.fx-seasonal-size'),
                speed: value('.fx-seasonal-speed'),
                opacity: value('.fx-seasonal-opacity')
            }, 8000);
        });
    }
});
