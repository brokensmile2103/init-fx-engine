<?php

defined('ABSPATH') || exit;

add_action('admin_menu', function () {
    $hook = add_options_page(
        __('Init FX Engine Settings', 'init-fx-engine'),
        __('Init FX Engine', 'init-fx-engine'),
        'manage_options',
        INIT_PLUGIN_SUITE_FX_ENGINE_SLUG,
        'init_plugin_suite_fx_engine_settings_page'
    );

    // Chỉ enqueue script khi vào đúng trang settings
    add_action('load-' . $hook, function () {
        add_action('admin_enqueue_scripts', function () {
            wp_enqueue_script(
                'init-plugin-suite-fx-canvas-confetti',
                INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/canvas-confetti.min.js',
                [],
                INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
                true
            );

            wp_enqueue_script(
                'init-plugin-suite-fx-engine',
                INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-engine.js',
                ['init-plugin-suite-fx-canvas-confetti'],
                INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
                true
            );

            wp_enqueue_script(
                'init-plugin-suite-fx-seasonal',
                INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-seasonal.js',
                ['init-plugin-suite-fx-engine'],
                INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
                true
            );

            wp_enqueue_script(
                'init-plugin-suite-fx-engine-admin-preview',
                INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/admin-preview.js',
                ['init-plugin-suite-fx-engine', 'init-plugin-suite-fx-seasonal'],
                INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
                true
            );

            wp_add_inline_script('init-plugin-suite-fx-engine', 'window.initPluginSuiteFxEngine = window.initPluginSuiteFxEngine || {};');

            // Dữ liệu cho nút Preview của Seasonal Effects (không autostart trong admin).
            $today         = current_time('Y-m-d');
            $preview_theme = init_plugin_suite_fx_engine_resolve_seasonal_theme(
                ['theme' => 'auto', 'mode' => 'always'],
                $today
            );
            $preview_themes = [];
            foreach (init_plugin_suite_fx_engine_seasonal_themes() as $slug => $definition) {
                $payload = init_plugin_suite_fx_engine_seasonal_payload(
                    $slug,
                    wp_parse_args(['emojis' => '', 'greeting' => true], init_plugin_suite_fx_engine_seasonal_defaults())
                );
                $preview_themes[$slug] = [
                    'items'    => $payload['items'],
                    'motion'   => $payload['motion'],
                    'glow'     => $payload['glow'],
                    'greeting' => $payload['greeting'],
                ];
            }

            wp_add_inline_script(
                'init-plugin-suite-fx-engine',
                'window.INIT_FX = window.INIT_FX || {};
                 window.INIT_FX.assets = ' . wp_json_encode(init_plugin_suite_fx_engine_lazy_assets()) . ';
                 window.INIT_FX.seasonalThemes = ' . wp_json_encode($preview_themes) . ';
                 window.INIT_FX.seasonalAutoTheme = ' . wp_json_encode($preview_theme) . ';',
                'before'
            );
        });
    });
});

add_action('admin_init', function () {
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_keywords', 'init_plugin_suite_fx_engine_sanitize_keywords');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_snowfall', 'init_plugin_suite_fx_engine_sanitize_snowfall');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_grayscale', 'init_plugin_suite_fx_engine_sanitize_grayscale');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_preloader', 'init_plugin_suite_fx_engine_sanitize_preloader');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_inlinefmt', 'init_plugin_suite_fx_engine_sanitize_inlinefmt');
    register_setting(
        'init_plugin_suite_fx_engine_settings_group',
        'init_plugin_suite_fx_engine_seasonal',
        [
            'type'              => 'array',
            'sanitize_callback' => 'init_plugin_suite_fx_engine_sanitize_seasonal',
            'default'           => init_plugin_suite_fx_engine_seasonal_defaults(),
        ]
    );
});

function init_plugin_suite_fx_engine_settings_page() {
    if (!current_user_can('manage_options')) return;

    $keywords = get_option('init_plugin_suite_fx_engine_keywords', [
        'firework'         => 'chúc mừng',
        'starlightBurst'   => 'ngôi sao',
        'emojiRain'        => 'hahaha:😂,xoxo:💋',
        'cannonBlast'      => 'happy birthday',
        'heartRain'        => 'yêu quá',
        'schoolPride'      => 'tuyệt vời',
        'celebrationBurst' => 'hoan hô',
        'halloweenBurst'   => 'halloween',
        'luckyMoney'       => 'lì xì',
        'fireworksShow'    => 'năm mới',
        'snowBurst'        => 'giáng sinh',
        'lanternRise'      => 'trung thu'
    ]);

    $snowfall = get_option('init_plugin_suite_fx_engine_snowfall', [
        'enabled'      => false,
        'mode'         => 'auto',
        'custom_start' => '',
        'custom_end'   => '',
        'homepage_only' => false,
        // ❄ Snow settings (NEW)
        'amount'         => 80,    // số lượng tuyết – vừa phải
        'size'           => 4,     // kích thước trung bình
        'speed'          => 1.2,   // tốc độ rơi chill
        'opacity'        => 0.6,   // độ trong suốt
    ]);

    $grayscale = get_option('init_plugin_suite_fx_engine_grayscale', [
        'enabled'      => false,
        'mode'         => 'off',
        'custom_start' => '',
        'custom_end'   => ''
    ]);

    $preloader = get_option('init_plugin_suite_fx_engine_preloader', [
        'enabled'      => false,
        'style'        => 'dot',
        'bg'           => '',
        'session_once' => false
    ]);

    $inlinefmt = get_option('init_plugin_suite_fx_engine_inlinefmt', [
        'enabled' => true,
    ]);

    $seasonal = init_plugin_suite_fx_engine_get_seasonal_settings();

    include INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'settings-form.php';
}

function init_plugin_suite_fx_engine_sanitize_keywords($input) {
    $output = [];
    if (!is_array($input)) {
        return $output;
    }
    foreach ($input as $key => $value) {
        $output[$key] = trim(wp_kses_post($value));
    }
    return $output;
}

function init_plugin_suite_fx_engine_sanitize_snowfall($input) {
    return [
        'enabled'        => !empty($input['enabled']),
        'mode'           => in_array($input['mode'] ?? 'auto', ['auto', 'custom']) ? $input['mode'] : 'auto',
        'custom_start'   => sanitize_text_field($input['custom_start'] ?? ''),
        'custom_end'     => sanitize_text_field($input['custom_end'] ?? ''),
        'homepage_only'  => !empty($input['homepage_only']),
        'amount'         => max(20, min(200, intval($input['amount'] ?? 80))),
        'size'           => max(1, min(10, intval($input['size'] ?? 4))),
        'speed'          => max(0.3, min(5, floatval($input['speed'] ?? 1.2))),
        'opacity'        => max(0.1, min(1, floatval($input['opacity'] ?? 0.6))),
    ];
}

function init_plugin_suite_fx_engine_sanitize_grayscale($input) {
    return [
        'enabled'      => !empty($input['enabled']),
        'mode'         => in_array($input['mode'] ?? 'off', ['off', 'always', 'custom']) ? $input['mode'] : 'off',
        'custom_start' => sanitize_text_field($input['custom_start'] ?? ''),
        'custom_end'   => sanitize_text_field($input['custom_end'] ?? '')
    ];
}

function init_plugin_suite_fx_engine_sanitize_preloader($input) {
    return [
        'enabled'      => !empty($input['enabled']),
        'style'        => in_array($input['style'] ?? 'dot', ['dot', 'bar', 'logo', 'flower', 'spinner', 'emoji']) ? $input['style'] : 'dot',
        'bg'           => sanitize_text_field($input['bg'] ?? ''),
        'session_once' => !empty($input['session_once'])
    ];
}

function init_plugin_suite_fx_engine_sanitize_inlinefmt($input) {
    return [
        'enabled' => !empty($input['enabled']),
    ];
}
