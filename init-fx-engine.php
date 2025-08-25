<?php
/**
 * Plugin Name: Init FX Engine
 * Description: Add interactive visual effects like fireworks, emoji rain, and snowfall — triggered by comments, keywords, or holidays. Make your WordPress site come alive!
 * Plugin URI: https://inithtml.com/plugin/init-fx-engine/
 * Version: 1.2
 * Author: Init HTML
 * Author URI: https://inithtml.com/
 * Text Domain: init-fx-engine
 * Domain Path: /languages
 * Requires at least: 5.5
 * Tested up to: 6.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

defined( 'ABSPATH' ) || exit;

// === DEFINE CONSTANTS ===

define( 'INIT_PLUGIN_SUITE_FX_ENGINE_VERSION',        '1.2' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_SLUG',           'init-fx-engine' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_OPTION',         'init_plugin_suite_fx_engine_settings' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_URL',            plugin_dir_url( __FILE__ ) );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_PATH',           plugin_dir_path( __FILE__ ) );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL',     INIT_PLUGIN_SUITE_FX_ENGINE_URL . 'assets/' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_PATH',    INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'assets/' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH',  INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'includes/' );

// === LOAD SHORTCODES ===

require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'shortcodes.php';
require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'settings-page.php';

// === ENQUEUE JS ENGINE ===

add_action( 'wp_enqueue_scripts', 'init_plugin_suite_fx_engine_enqueue_scripts' );
function init_plugin_suite_fx_engine_enqueue_scripts() {
    wp_enqueue_script(
        'init-plugin-suite-fx-confetti',
        INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/canvas-confetti.min.js',
        [],
        INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
        true
    );

    wp_enqueue_script(
        'init-plugin-suite-fx-engine',
        INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-engine.js',
        [],
        INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
        true
    );

    $raw_keywords = get_option('init_plugin_suite_fx_engine_keywords', []);
    $mapped = [];

    foreach ($raw_keywords as $effect => $raw) {
        if (empty($raw)) continue;

        if ($effect === 'emojiRain') {
            $entries = array_map('trim', explode(',', $raw));
            foreach ($entries as $entry) {
                [$kw, $emoji] = array_pad(explode(':', $entry, 2), 2, null);
                if ($kw) {
                    $mapped[$effect][] = ['keyword' => $kw, 'emoji' => $emoji];
                }
            }
        } else {
            $words = array_map('trim', explode(',', $raw));
            foreach ($words as $kw) {
                if ($kw) {
                    $mapped[$effect][] = ['keyword' => $kw];
                }
            }
        }
    }

    // OK dùng localize cho data
    wp_localize_script('init-plugin-suite-fx-engine', 'FX_KEYWORDS', $mapped);
}

/**
 * PRELOADER - Anti-flash solution
 * - Che content ngay từ đầu bằng CSS critical
 * - Preloader show immediately, content hidden cho đến khi ready
 */

add_action('wp_head', function () {
    $preloader = get_option('init_plugin_suite_fx_engine_preloader', [
        'enabled' => false,
        'style'   => 'dot',
        'bg'      => '#ffffff'
    ]);

    if (empty($preloader['enabled'])) {
        return;
    }

    $bg = esc_attr($preloader['bg']);
    $bgCSS = strpos($bg, ',') !== false ? "linear-gradient(to right, {$bg})" : $bg;
    
    // Critical CSS để che content ngay lập tức
    ?>
    <style id="init-fx-critical-preloader">
        html.init-fx-preloading {
            overflow: hidden !important;
        }
        html.init-fx-preloading body {
            overflow: hidden !important;
            visibility: hidden !important; /* Ẩn tất cả content */
        }
        
        html.init-fx-preloading #init-fx-preloader {
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        #init-fx-preloader {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: <?php echo esc_attr($bgCSS); ?> !important;
            z-index: 2147483647 !important; /* Max z-index */
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.6s ease !important;
        }
        
        #init-fx-preloader.fade-out {
            opacity: 0 !important;
            pointer-events: none !important;
        }
    </style>
    
    <script>
        (function() {
            document.documentElement.classList.add('init-fx-preloading');
            
            window.INIT_FX = window.INIT_FX || {};
            window.INIT_FX.preloader = <?php echo wp_json_encode($preloader); ?>;
            
            function createPreloader() {
                if (document.body) {
                    var existing = document.getElementById('init-fx-preloader');
                    if (!existing) {
                        var preloader = document.createElement('div');
                        preloader.id = 'init-fx-preloader';
                        preloader.setAttribute('data-style', '<?php echo esc_js($preloader['style']); ?>');
                        document.body.appendChild(preloader);
                    }
                } else {
                    setTimeout(createPreloader, 5);
                }
            }
            
            createPreloader();
        })();
    </script>
    <?php
}, 0); // Priority 0 để chạy đầu tiên

// Enqueue JS để xử lý preloader animation
add_action('wp_enqueue_scripts', function () {
    $preloader = get_option('init_plugin_suite_fx_engine_preloader', [
        'enabled' => false
    ]);

    if (empty($preloader['enabled'])) {
        return;
    }

    wp_enqueue_script(
        'init-plugin-suite-fx-preloader',
        INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-preloader.js',
        [],
        INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
        false // Load sớm ở header
    );
});

// Fallback nếu JS fail - auto remove preloader sau 3.5s
add_action('wp_footer', function () {
    $preloader = get_option('init_plugin_suite_fx_engine_preloader', [
        'enabled' => false
    ]);

    if (empty($preloader['enabled'])) {
        return;
    }
    
    ?>
    <script>
        setTimeout(function() {
            document.documentElement.classList.remove('init-fx-preloading');
            var preloader = document.getElementById('init-fx-preloader');
            var criticalCSS = document.getElementById('init-fx-critical-preloader');
            
            if (preloader) preloader.remove();
            if (criticalCSS) criticalCSS.remove();
        }, 3500);
    </script>
    <?php
}, 999);

/**
 * SNOWFALL
 */
add_action('wp_enqueue_scripts', function () {
    $snowfall = get_option('init_plugin_suite_fx_engine_snowfall', [
        'enabled'      => false,
        'mode'         => 'auto',
        'custom_start' => '',
        'custom_end'   => ''
    ]);

    if (empty($snowfall['enabled'])) {
        return;
    }

    $should_run = false;
    $today = current_time('Y-m-d');

    if (($snowfall['mode'] ?? 'auto') === 'auto') {
        $year       = current_time('Y');
        $start      = "$year-12-20";
        $end        = "$year-12-31";
        $should_run = ($today >= $start && $today <= $end);
    } elseif (($snowfall['mode'] ?? 'auto') === 'custom') {
        $start = sanitize_text_field($snowfall['custom_start'] ?? '');
        $end   = sanitize_text_field($snowfall['custom_end'] ?? '');
        if ($start && $end) {
            $should_run = ($today >= $start && $today <= $end);
        }
    }

    if (!$should_run) {
        return;
    }

    wp_enqueue_script(
        'init-plugin-suite-fx-particles',
        INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/particles.min.js',
        [],
        INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
        true
    );

    wp_enqueue_script(
        'init-plugin-suite-fx-snowfall',
        INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-snowfall.js',
        ['init-plugin-suite-fx-particles'],
        INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
        true
    );

    wp_add_inline_script(
        'init-plugin-suite-fx-snowfall',
        'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.snowfall = ' . wp_json_encode($snowfall) . ';'
    );
});

/**
 * GRAYSCALE
 * - Chuyển sang enqueue thay vì in thẳng <style>/<script> ở footer
 */
add_action('wp_enqueue_scripts', function () {
    $grayscale = get_option('init_plugin_suite_fx_engine_grayscale', [
        'enabled'      => false,
        'mode'         => 'off',
        'custom_start' => '',
        'custom_end'   => ''
    ]);

    if (empty($grayscale['enabled'])) {
        return;
    }

    $today = current_time('Y-m-d');
    $mode  = $grayscale['mode'] ?? 'off';
    $should_run = false;

    if ($mode === 'always') {
        $should_run = true;
    } elseif ($mode === 'custom') {
        $start = sanitize_text_field($grayscale['custom_start'] ?? '');
        $end   = sanitize_text_field($grayscale['custom_end'] ?? '');
        if ($start && $end) {
            $should_run = ($today >= $start && $today <= $end);
        }
    }

    if (!$should_run) {
        return;
    }

    // Tạo handle “ảo” để gắn inline CSS/JS
    $handle = 'init-plugin-suite-fx-grayscale';

    wp_register_style($handle, false, [], INIT_PLUGIN_SUITE_FX_ENGINE_VERSION);
    wp_enqueue_style($handle);
    wp_add_inline_style(
        $handle,
        'body.init-fx-grayscale{filter:grayscale(100%) !important;-webkit-filter:grayscale(100%) !important;}'
    );

    wp_register_script($handle, false, [], INIT_PLUGIN_SUITE_FX_ENGINE_VERSION, true);
    wp_enqueue_script($handle);
    wp_add_inline_script(
        $handle,
        'document.addEventListener("DOMContentLoaded",function(){document.body.classList.add("init-fx-grayscale");});'
    );
});
