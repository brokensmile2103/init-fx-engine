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
});
