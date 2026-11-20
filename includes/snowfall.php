<?php
/**
 * Snowfall Effect.
 *
 * Từ 2.0.2 dùng renderer canvas riêng (fx-snowfall.js, ~4KB, không thư viện),
 * thay cho particles.js: sprite dựng sẵn, tự giảm hạt trên màn hình nhỏ, dừng khi
 * ẩn tab, khởi động sau khi trang tải xong. Giữ nguyên toàn bộ tùy chọn cũ.
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
		'wind'           => true,
		'reduced_motion' => true,
	);
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
		'style'         => in_array( $snowfall['style'], array( 'dots', 'flakes', 'mixed' ), true ) ? $snowfall['style'] : 'dots',
		'wind'          => ! empty( $snowfall['wind'] ),
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
		'style'          => in_array( $style, array( 'dots', 'flakes', 'mixed' ), true ) ? $style : 'dots',
		'wind'           => ! empty( $input['wind'] ),
		'reduced_motion' => ! empty( $input['reduced_motion'] ),
	);
}
