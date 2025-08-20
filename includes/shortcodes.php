<?php
defined('ABSPATH') || exit;

/**
 * FX SHORTCODE (link/button… có effect khi click/hover)
 * - Slug mới:  initfxen-fx
 * - Slug cũ:  init-fx (compat)
 */
function initfxen_render_fx_shortcode( $atts, $content = null, $shortcode_tag = 'initfxen-fx' ) {
    $atts = shortcode_atts([
        'text'   => '',
        'fx'     => '',
        'emoji'  => '',
        'shoot'  => 'click',
        'tag'    => 'a',
    ], $atts, $shortcode_tag);

    if ( empty($atts['text']) || empty($atts['fx']) ) {
        return '';
    }

    $tag   = tag_escape( $atts['tag'] );
    $text  = esc_html( $atts['text'] );
    $attrs = sprintf(
        'class="fx-shortcode" data-effect="%s" data-trigger="%s"%s',
        esc_attr( $atts['fx'] ),
        esc_attr( $atts['shoot'] ),
        $atts['emoji'] ? ' data-emoji="' . esc_attr( $atts['emoji'] ) . '"' : ''
    );

    return sprintf( '<%1$s %2$s>%3$s</%1$s>', $tag, $attrs, $text );
}
add_shortcode( 'initfxen-fx', 'initfxen_render_fx_shortcode' ); // slug mới (chính)
add_shortcode( 'init-fx',     'initfxen_render_fx_shortcode' ); // slug cũ (compat)

/**
 * AMBIENT PARTICLES SHORTCODE (hậu cảnh hạt bay)
 * - Slug mới:  initfxen-fx-ambient
 * - Slug cũ:  init-fx-ambient (compat)
 * - Không in <script> trực tiếp; dùng wp_add_inline_script.
 */
function initfxen_render_ambient_shortcode( $atts, $content = null, $shortcode_tag = 'initfxen-fx-ambient' ) {
    // Đảm bảo script nền đã enqueue
    wp_enqueue_script(
        'init-plugin-suite-fx-particles',
        INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/particles.min.js',
        [],
        INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
        true
    );

    $atts = shortcode_atts([
        'ambient'         => '',
        'color'           => '#ffffff',
        'lines'           => 'true',
        'speed'           => '3',
        'hover'           => 'repulse',
        'click'           => 'push',
        'container_style' => 'position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; width: 100%; height: 100%;',
        'container_class' => '',
    ], $atts, $shortcode_tag);

    if ( empty($atts['ambient']) ) {
        return '';
    }

    $container_id = 'particles-ambient-' . wp_rand();

    // Tạo container HTML (không nhúng <script> ở đây)
    $style_attr = $atts['container_class'] ? '' : esc_attr( $atts['container_style'] );
    $class_attr = $atts['container_class'] ? esc_attr( $atts['container_class'] ) : '';

    $html  = '<div id="' . esc_attr($container_id) . '"';
    $html .= $style_attr ? ' style="' . esc_attr($style_attr) . '"' : '';
    $html .= $class_attr ? ' class="' . esc_attr($class_attr) . '"' : '';
    $html .= '></div>';

    // Build init config dưới dạng inline JS gắn vào handle 'init-plugin-suite-fx-particles'
    $color   = esc_js( $atts['color'] );
    $lines   = ($atts['lines'] === 'true') ? 'true' : 'false';
    $speed   = floatval( $atts['speed'] );
    $hover   = esc_js( $atts['hover'] );
    $click   = esc_js( $atts['click'] );
    $cid     = esc_js( $container_id );

    $inline = "
document.addEventListener('DOMContentLoaded', function () {
    if (typeof particlesJS !== 'function') return;
    particlesJS('{$cid}', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '{$color}' },
            shape: { type: 'circle' },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: {
                enable: {$lines},
                distance: 150,
                color: '{$color}',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: {$speed},
                direction: 'none',
                out_mode: 'out'
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: " . ($atts['hover'] !== 'none' ? 'true' : 'false') . ", mode: '{$hover}' },
                onclick: { enable: " . ($atts['click'] !== 'none' ? 'true' : 'false') . ", mode: '{$click}' },
                resize: true
            },
            modes: {
                grab: { distance: 400, line_linked: { opacity: 1 } },
                bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                repulse: { distance: 200, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
            }
        },
        retina_detect: true
    });
});";

    // Thêm inline script gắn với handle particles (sẽ in ở footer, sau file .js)
    wp_add_inline_script( 'init-plugin-suite-fx-particles', $inline );

    return $html;
}
add_shortcode( 'initfxen-fx-ambient', 'initfxen_render_ambient_shortcode' ); // slug mới (chính)
add_shortcode( 'init-fx-ambient',     'initfxen_render_ambient_shortcode' ); // slug cũ (compat)
