<?php
/**
 * Shortcodes:
 * - [initfxen-fx]         (compat: [init-fx])         Link/nút phát hiệu ứng khi click/hover/xuất hiện.
 * - [initfxen-fx-ambient] (compat: [init-fx-ambient]) Nền hạt chuyển động (tsParticles).
 *
 * Cả hai tự enqueue script cần thiết ngay lúc render → trang nào không dùng thì không tải gì.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

/**
 * HTML tags allowed for the [initfxen-fx] trigger element.
 *
 * Danh sách trắng — tránh shortcode bị lợi dụng để in ra thẻ <script>, <iframe>... (XSS từ tài khoản Contributor).
 *
 * @return array
 */
function init_plugin_suite_fx_engine_trigger_tags() {
	return array( 'a', 'button', 'span', 'div', 'p', 'strong', 'em', 'b', 'i', 'mark', 'small', 'h2', 'h3', 'h4', 'h5', 'h6' );
}

/**
 * Triggers supported by the [initfxen-fx] shortcode.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_trigger_events() {
	return array( 'click', 'hover', 'in-view', 'immediate' );
}

/**
 * FX SHORTCODE (link/button… có effect khi click/hover).
 *
 * @param array|string $atts          Shortcode attributes.
 * @param string|null  $content       Enclosed content (unused).
 * @param string       $shortcode_tag Shortcode tag.
 * @return string
 */
function initfxen_render_fx_shortcode( $atts, $content = null, $shortcode_tag = 'initfxen-fx' ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed -- Signature required by add_shortcode().
	$atts = shortcode_atts(
		array(
			'text'  => '',
			'fx'    => '',
			'emoji' => '',
			'shoot' => 'click',
			'tag'   => 'a',
		),
		$atts,
		$shortcode_tag
	);

	$text   = trim( (string) $atts['text'] );
	$effect = preg_replace( '/[^A-Za-z0-9_]/', '', (string) $atts['fx'] );

	// "immediate" và "in-view" không cần chữ để bấm → cho phép text rỗng.
	$shoot = strtolower( trim( (string) $atts['shoot'] ) );
	$shoot = in_array( $shoot, init_plugin_suite_fx_engine_trigger_events(), true ) ? $shoot : 'click';

	if ( '' === $effect || ( '' === $text && in_array( $shoot, array( 'click', 'hover' ), true ) ) ) {
		return '';
	}

	$tag = strtolower( trim( (string) $atts['tag'] ) );
	$tag = in_array( $tag, init_plugin_suite_fx_engine_trigger_tags(), true ) ? $tag : 'a';

	init_plugin_suite_fx_engine_enqueue_engine();

	$attributes = array(
		'class'        => 'fx-shortcode',
		'data-effect'  => $effect,
		'data-trigger' => $shoot,
	);

	if ( '' !== $atts['emoji'] ) {
		$attributes['data-emoji'] = (string) $atts['emoji'];
	}

	// Truy cập bằng bàn phím: <a> cần href, thẻ khác (không phải button) cần role + tabindex.
	if ( 'click' === $shoot ) {
		if ( 'a' === $tag ) {
			$attributes['href'] = '#';
			$attributes['role'] = 'button';
		} elseif ( 'button' === $tag ) {
			$attributes['type'] = 'button';
		} else {
			$attributes['role']     = 'button';
			$attributes['tabindex'] = '0';
		}
	}

	$html = '';
	foreach ( $attributes as $name => $value ) {
		if ( null === $value ) {
			continue;
		}
		$html .= sprintf( ' %s="%s"', $name, esc_attr( $value ) );
	}

	return sprintf( '<%1$s%2$s>%3$s</%1$s>', $tag, $html, esc_html( $text ) );
}
add_shortcode( 'initfxen-fx', 'initfxen_render_fx_shortcode' ); // Slug mới (chính).
add_shortcode( 'init-fx', 'initfxen_render_fx_shortcode' ); // Slug cũ (compat).

// ============================================================================
// AMBIENT PARTICLES (tsParticles)
// ============================================================================

/**
 * Ambient particle presets.
 *
 * @return array Preset slug => translated label.
 */
function init_plugin_suite_fx_engine_ambient_presets() {
	return array(
		'links'     => __( 'Network links', 'init-fx-engine' ),
		'stars'     => __( 'Twinkling stars', 'init-fx-engine' ),
		'snow'      => __( 'Gentle snow', 'init-fx-engine' ),
		'bubbles'   => __( 'Rising bubbles', 'init-fx-engine' ),
		'fireflies' => __( 'Fireflies', 'init-fx-engine' ),
		'emoji'     => __( 'Floating emoji', 'init-fx-engine' ),
	);
}

/**
 * Register tsParticles + fx-ambient.js (idempotent).
 *
 * @return void
 */
function init_plugin_suite_fx_engine_register_ambient() {
	if ( wp_script_is( 'init-plugin-suite-fx-ambient', 'registered' ) ) {
		return;
	}

	wp_register_script(
		'init-plugin-suite-fx-tsparticles',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/tsparticles.slim.bundle.min.js',
		array(),
		'4.6.0',
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	wp_register_script(
		'init-plugin-suite-fx-ambient',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-ambient.js',
		array( 'init-plugin-suite-fx-tsparticles' ),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);
}

/**
 * Normalize ambient attributes (shared by the shortcode and the FX Ambient block).
 *
 * @param array $atts Raw attributes.
 * @return array Clean config for fx-ambient.js.
 */
function init_plugin_suite_fx_engine_ambient_config( $atts ) {
	$presets = init_plugin_suite_fx_engine_ambient_presets();
	$preset  = sanitize_key( (string) ( $atts['ambient'] ?? '' ) );

	// Các bản cũ chỉ có 1 kiểu (mạng lưới) và chấp nhận mọi giá trị khác rỗng → giữ tương thích.
	$preset = isset( $presets[ $preset ] ) ? $preset : 'links';

	$hover = sanitize_key( (string) ( $atts['hover'] ?? '' ) );
	$click = sanitize_key( (string) ( $atts['click'] ?? '' ) );
	$lines = strtolower( trim( (string) ( $atts['lines'] ?? 'true' ) ) );

	$config = array(
		'preset' => $preset,
		'color'  => init_plugin_suite_fx_engine_sanitize_css_color( $atts['color'] ?? '' ),
		'lines'  => ! in_array( $lines, array( 'false', '0', 'no', 'off' ), true ),
		'hover'  => in_array( $hover, array( 'none', 'repulse', 'grab', 'bubble' ), true ) ? $hover : '',
		'click'  => in_array( $click, array( 'none', 'push', 'remove' ), true ) ? $click : '',
		'emoji'  => implode( ',', init_plugin_suite_fx_engine_parse_emoji_list( sanitize_text_field( (string) ( $atts['emoji'] ?? '' ) ) ) ),
	);

	if ( isset( $atts['speed'] ) && '' !== (string) $atts['speed'] ) {
		$config['speed'] = max( 0.1, min( 20, (float) $atts['speed'] ) );
	}

	if ( isset( $atts['amount'] ) && (int) $atts['amount'] > 0 ) {
		$config['amount'] = max( 5, min( 300, (int) $atts['amount'] ) );
	}

	/**
	 * Filter the ambient particles config sent to fx-ambient.js.
	 *
	 * @param array $config Clean config.
	 * @param array $atts   Raw attributes.
	 */
	return apply_filters( 'init_plugin_suite_fx_engine_ambient_config', $config, $atts );
}

/**
 * Build the ambient particles layer markup and enqueue its scripts.
 *
 * @param array  $config  Config from init_plugin_suite_fx_engine_ambient_config().
 * @param string $classes Extra CSS classes.
 * @param string $style   Inline style.
 * @return string
 */
function init_plugin_suite_fx_engine_ambient_layer( $config, $classes = '', $style = '' ) {
	init_plugin_suite_fx_engine_register_ambient();
	wp_enqueue_script( 'init-plugin-suite-fx-ambient' );

	$classes = trim( 'init-fx-ambient ' . $classes );

	return sprintf(
		'<div id="%1$s" class="%2$s"%3$s data-fx-ambient="%4$s" aria-hidden="true"></div>',
		esc_attr( wp_unique_id( 'init-fx-ambient-' ) ),
		esc_attr( $classes ),
		'' !== $style ? ' style="' . esc_attr( $style ) . '"' : '',
		esc_attr( wp_json_encode( $config ) )
	);
}

/**
 * AMBIENT PARTICLES SHORTCODE (hậu cảnh hạt bay).
 *
 * @param array|string $atts          Shortcode attributes.
 * @param string|null  $content       Enclosed content (unused).
 * @param string       $shortcode_tag Shortcode tag.
 * @return string
 */
function initfxen_render_ambient_shortcode( $atts, $content = null, $shortcode_tag = 'initfxen-fx-ambient' ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed -- Signature required by add_shortcode().
	$atts = shortcode_atts(
		array(
			'ambient'         => '',
			'color'           => '',
			'lines'           => 'true',
			'speed'           => '',
			'amount'          => '',
			'emoji'           => '',
			'hover'           => '',
			'click'           => '',
			'container_style' => 'position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; width: 100%; height: 100%;',
			'container_class' => '',
		),
		$atts,
		$shortcode_tag
	);

	if ( '' === trim( (string) $atts['ambient'] ) ) {
		return '';
	}

	$class = '';
	$style = '';

	// Giữ hành vi cũ: có container_class thì không in style mặc định (để class tự định vị).
	if ( '' !== trim( (string) $atts['container_class'] ) ) {
		$class = implode( ' ', array_map( 'sanitize_html_class', preg_split( '/\s+/', trim( (string) $atts['container_class'] ) ) ) );
	} else {
		$style = (string) $atts['container_style'];
	}

	return init_plugin_suite_fx_engine_ambient_layer( init_plugin_suite_fx_engine_ambient_config( $atts ), $class, $style );
}
add_shortcode( 'initfxen-fx-ambient', 'initfxen_render_ambient_shortcode' ); // Slug mới (chính).
add_shortcode( 'init-fx-ambient', 'initfxen_render_ambient_shortcode' ); // Slug cũ (compat).
