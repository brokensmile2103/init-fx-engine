<?php
/**
 * Snowfall Effect.
 *
 * Từ 2.0.2 dùng renderer canvas riêng (fx-snowfall.js, không thư viện) thay cho
 * particles.js. 2.0.3 đưa kiểu hạt tròn "Classic" (độ mờ ngẫu nhiên, có chiều sâu)
 * trở lại làm mặc định, thêm màu tuyết, chế độ tiết kiệm pin và tùy chọn tắt trên mobile.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

/**
 * Default snowfall settings.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_snowfall_defaults() {
	return array(
		'enabled'        => false,
		'mode'           => 'auto',
		'custom_start'   => '',
		'custom_end'     => '',
		'homepage_only'  => false,
		'amount'         => 80,
		'size'           => 4,
		'speed'          => 1.2,
		'opacity'        => 0.6,
		'style'          => 'dots',
		'color'          => '#ffffff',
		'wind'           => false,
		'fps'            => 60,
		'hide_mobile'    => false,
		'reduced_motion' => true,
	);
}

/**
 * Snowfall styles: dots = Classic round (mặc định, giống các bản cũ), soft = Soft glow (2.0.2),
 * flakes = Crystal snowflakes, mixed = Classic + crystal.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_snowfall_styles() {
	return array( 'dots', 'soft', 'flakes', 'mixed' );
}

/**
 * Get the saved snowfall settings merged with defaults.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_get_snowfall_settings() {
	$saved = get_option( 'init_plugin_suite_fx_engine_snowfall', array() );

	return wp_parse_args( is_array( $saved ) ? $saved : array(), init_plugin_suite_fx_engine_snowfall_defaults() );
}

/**
 * Whether snowfall should run today according to its schedule.
 *
 * @param array $snowfall Snowfall settings.
 * @return bool
 */
function init_plugin_suite_fx_engine_snowfall_scheduled( $snowfall ) {
	$today = current_time( 'Y-m-d' );

	if ( 'custom' === ( $snowfall['mode'] ?? 'auto' ) ) {
		return init_plugin_suite_fx_engine_today_in_range( $snowfall['custom_start'] ?? '', $snowfall['custom_end'] ?? '', $today );
	}

	$year = substr( $today, 0, 4 );

	return init_plugin_suite_fx_engine_today_in_range( $year . '-12-20', $year . '-12-31', $today );
}

add_action( 'wp_enqueue_scripts', 'init_plugin_suite_fx_engine_enqueue_snowfall' );
/**
 * Enqueue the snowfall renderer when it should run.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_enqueue_snowfall() {
	$snowfall = init_plugin_suite_fx_engine_get_snowfall_settings();

	if ( empty( $snowfall['enabled'] ) ) {
		return;
	}

	// Chỉ chạy ở trang chủ (static front page hoặc blog home — xem includes/seasonal.php).
	if ( ! empty( $snowfall['homepage_only'] ) && ! init_plugin_suite_fx_engine_is_homepage_request() ) {
		return;
	}

	if ( ! init_plugin_suite_fx_engine_snowfall_scheduled( $snowfall ) ) {
		return;
	}

	wp_enqueue_script(
		'init-plugin-suite-fx-snowfall',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-snowfall.js',
		array(),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	wp_add_inline_script(
		'init-plugin-suite-fx-snowfall',
		'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.snowfall = ' . wp_json_encode( init_plugin_suite_fx_engine_snowfall_payload( $snowfall ) ) . ';',
		'before'
	);
}

/**
 * Minimal, clamped config for fx-snowfall.js.
 *
 * @param array $snowfall Snowfall settings.
 * @return array
 */
function init_plugin_suite_fx_engine_snowfall_payload( $snowfall ) {
	return array(
		'amount'        => max( 20, min( 200, (int) $snowfall['amount'] ) ),
		'size'          => max( 1, min( 10, (int) $snowfall['size'] ) ),
		'speed'         => max( 0.3, min( 5, (float) $snowfall['speed'] ) ),
		'opacity'       => max( 0.1, min( 1, (float) $snowfall['opacity'] ) ),
		'style'         => in_array( $snowfall['style'], init_plugin_suite_fx_engine_snowfall_styles(), true ) ? $snowfall['style'] : 'dots',
		'color'         => sanitize_hex_color( $snowfall['color'] ) ? sanitize_hex_color( $snowfall['color'] ) : '#ffffff',
		'wind'          => ! empty( $snowfall['wind'] ),
		'fps'           => 30 === (int) $snowfall['fps'] ? 30 : 60,
		'hideMobile'    => ! empty( $snowfall['hide_mobile'] ),
		'reducedMotion' => ! empty( $snowfall['reduced_motion'] ),
	);
}

/**
 * Sanitize the snowfall settings.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function init_plugin_suite_fx_engine_sanitize_snowfall( $input ) {
	$input    = is_array( $input ) ? $input : array();
	$defaults = init_plugin_suite_fx_engine_snowfall_defaults();
	$mode     = sanitize_key( $input['mode'] ?? 'auto' );
	$style    = sanitize_key( $input['style'] ?? 'dots' );
	$start    = sanitize_text_field( $input['custom_start'] ?? '' );
	$end      = sanitize_text_field( $input['custom_end'] ?? '' );
	$date_rx  = '/^\d{4}-\d{2}-\d{2}$/';
	$color    = sanitize_hex_color( $input['color'] ?? '#ffffff' );

	return array(
		'enabled'        => ! empty( $input['enabled'] ),
		'mode'           => in_array( $mode, array( 'auto', 'custom' ), true ) ? $mode : 'auto',
		'custom_start'   => preg_match( $date_rx, $start ) ? $start : '',
		'custom_end'     => preg_match( $date_rx, $end ) ? $end : '',
		'homepage_only'  => ! empty( $input['homepage_only'] ),
		'amount'         => max( 20, min( 200, intval( $input['amount'] ?? $defaults['amount'] ) ) ),
		'size'           => max( 1, min( 10, intval( $input['size'] ?? $defaults['size'] ) ) ),
		'speed'          => max( 0.3, min( 5, floatval( $input['speed'] ?? $defaults['speed'] ) ) ),
		'opacity'        => max( 0.1, min( 1, floatval( $input['opacity'] ?? $defaults['opacity'] ) ) ),
		'style'          => in_array( $style, init_plugin_suite_fx_engine_snowfall_styles(), true ) ? $style : 'dots',
		'color'          => $color ? $color : '#ffffff',
		'wind'           => ! empty( $input['wind'] ),
		'fps'            => 30 === intval( $input['fps'] ?? 60 ) ? 30 : 60,
		'hide_mobile'    => ! empty( $input['hide_mobile'] ),
		'reduced_motion' => ! empty( $input['reduced_motion'] ),
	);
}
