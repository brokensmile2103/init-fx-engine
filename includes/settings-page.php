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
                'init-plugin-suite-fx-engine-admin-preview',
                INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/admin-preview.js',
                ['init-plugin-suite-fx-engine'],
                INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
                true
            );

            wp_add_inline_script('init-plugin-suite-fx-engine', 'window.initPluginSuiteFxEngine = window.initPluginSuiteFxEngine || {};');
        });
    });
});

add_action('admin_init', function () {
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_keywords', 'init_plugin_suite_fx_engine_sanitize_keywords');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_snowfall', 'init_plugin_suite_fx_engine_sanitize_snowfall');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_grayscale', 'init_plugin_suite_fx_engine_sanitize_grayscale');
    register_setting('init_plugin_suite_fx_engine_settings_group', 'init_plugin_suite_fx_engine_preloader', 'init_plugin_suite_fx_engine_sanitize_preloader');
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
        'celebrationBurst' => 'hoan hô'
    ]);

    $snowfall = get_option('init_plugin_suite_fx_engine_snowfall', [
        'enabled'      => false,
        'mode'         => 'auto',
        'custom_start' => '',
        'custom_end'   => ''
    ]);

    $grayscale = get_option('init_plugin_suite_fx_engine_grayscale', [
        'enabled'      => false,
        'mode'         => 'off',
        'custom_start' => '',
        'custom_end'   => ''
    ]);

    $preloader = get_option('init_plugin_suite_fx_engine_preloader', [
        'enabled' => false,
        'style'   => 'dot',
        'bg'      => ''
    ]);

    include INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'settings-form.php';
}

function init_plugin_suite_fx_engine_sanitize_keywords($input) {
    $output = [];
    foreach ($input as $key => $value) {
        $output[$key] = trim(wp_kses_post($value));
    }
    return $output;
}

function init_plugin_suite_fx_engine_sanitize_snowfall($input) {
    return [
        'enabled'      => !empty($input['enabled']),
        'mode'         => in_array($input['mode'] ?? 'auto', ['auto', 'custom']) ? $input['mode'] : 'auto',
        'custom_start' => sanitize_text_field($input['custom_start'] ?? ''),
        'custom_end'   => sanitize_text_field($input['custom_end'] ?? '')
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
        'enabled' => !empty($input['enabled']),
        'style'   => in_array($input['style'] ?? 'dot', ['dot', 'bar', 'logo', 'flower', 'spinner', 'emoji']) ? $input['style'] : 'dot',
        'bg'      => sanitize_text_field($input['bg'] ?? '')
    ];
}
