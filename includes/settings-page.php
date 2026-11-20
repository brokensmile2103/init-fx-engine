<?php
/**
 * Settings page: menu, admin assets, registered settings and sanitize callbacks.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

add_action( 'admin_menu', 'init_plugin_suite_fx_engine_admin_menu' );
/**
 * Register the settings page under Settings.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_admin_menu() {
	$hook = add_options_page(
		__( 'Init FX Engine Settings', 'init-fx-engine' ),
		__( 'Init FX Engine', 'init-fx-engine' ),
		'manage_options',
		INIT_PLUGIN_SUITE_FX_ENGINE_SLUG,
		'init_plugin_suite_fx_engine_settings_page'
	);

	if ( $hook ) {
		// Chỉ enqueue script khi vào đúng trang settings.
		add_action( 'load-' . $hook, 'init_plugin_suite_fx_engine_admin_load' );
	}
}

/**
 * Hook the admin assets only on the plugin settings screen.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_admin_load() {
	add_action( 'admin_enqueue_scripts', 'init_plugin_suite_fx_engine_admin_assets' );
}

/**
 * Enqueue the settings page assets (effects + live previews).
 *
 * @return void
 */
function init_plugin_suite_fx_engine_admin_assets() {
	init_plugin_suite_fx_engine_enqueue_engine();
	init_plugin_suite_fx_engine_register_ambient();

	wp_enqueue_script(
		'init-plugin-suite-fx-seasonal',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-seasonal.js',
		array( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE ),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		true
	);

	wp_enqueue_script(
		'init-plugin-suite-fx-snowfall',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-snowfall.js',
		array(),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		true
	);

	wp_enqueue_script(
		'init-plugin-suite-fx-engine-admin-preview',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/admin-preview.js',
		array( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE, 'init-plugin-suite-fx-seasonal', 'init-plugin-suite-fx-snowfall', 'init-plugin-suite-fx-ambient' ),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		true
	);

	// Dữ liệu cho nút Preview của Seasonal Effects (không autostart trong admin).
	$preview_theme  = init_plugin_suite_fx_engine_resolve_seasonal_theme(
		array(
			'theme' => 'auto',
			'mode'  => 'always',
		),
		current_time( 'Y-m-d' )
	);
	$preview_themes = array();
	$preview_base   = wp_parse_args(
		array(
			'emojis'   => '',
			'greeting' => true,
		),
		init_plugin_suite_fx_engine_seasonal_defaults()
	);

	foreach ( array_keys( init_plugin_suite_fx_engine_seasonal_themes() ) as $slug ) {
		$payload                 = init_plugin_suite_fx_engine_seasonal_payload( $slug, $preview_base );
		$preview_themes[ $slug ] = array(
			'items'    => $payload['items'],
			'motion'   => $payload['motion'],
			'glow'     => $payload['glow'],
			'greeting' => $payload['greeting'],
		);
	}

	wp_add_inline_script(
		'init-plugin-suite-fx-engine-admin-preview',
		sprintf(
			'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.seasonalThemes = %1$s; window.INIT_FX.seasonalAutoTheme = %2$s; window.INIT_FX.adminI18n = %3$s;',
			wp_json_encode( $preview_themes ),
			wp_json_encode( $preview_theme ),
			wp_json_encode(
				array(
					'copied' => __( 'Copied!', 'init-fx-engine' ),
				)
			)
		),
		'before'
	);
}

add_action( 'admin_init', 'init_plugin_suite_fx_engine_register_settings' );
/**
 * Register all plugin options.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_register_settings() {
	$group    = 'init_plugin_suite_fx_engine_settings_group';
	$settings = array(
		'init_plugin_suite_fx_engine_keywords'  => 'init_plugin_suite_fx_engine_sanitize_keywords',
		'init_plugin_suite_fx_engine_snowfall'  => 'init_plugin_suite_fx_engine_sanitize_snowfall',
		'init_plugin_suite_fx_engine_grayscale' => 'init_plugin_suite_fx_engine_sanitize_grayscale',
		'init_plugin_suite_fx_engine_preloader' => 'init_plugin_suite_fx_engine_sanitize_preloader',
		'init_plugin_suite_fx_engine_inlinefmt' => 'init_plugin_suite_fx_engine_sanitize_inlinefmt',
		'init_plugin_suite_fx_engine_seasonal'  => 'init_plugin_suite_fx_engine_sanitize_seasonal',
	);

	foreach ( $settings as $option => $callback ) {
		register_setting(
			$group,
			$option,
			array(
				'type'              => 'array',
				'sanitize_callback' => $callback,
			)
		);
	}
}

/**
 * Keyword effects shown on the settings page (effect name => label).
 *
 * @return array
 */
function init_plugin_suite_fx_engine_keyword_effects() {
	return array(
		'firework'         => __( 'Firework', 'init-fx-engine' ),
		'starlightBurst'   => __( 'Starlight Burst', 'init-fx-engine' ),
		'emojiRain'        => __( 'Emoji Rain', 'init-fx-engine' ),
		'cannonBlast'      => __( 'Cannon Blast', 'init-fx-engine' ),
		'heartRain'        => __( 'Heart Rain', 'init-fx-engine' ),
		'schoolPride'      => __( 'School Pride', 'init-fx-engine' ),
		'celebrationBurst' => __( 'Celebration Burst', 'init-fx-engine' ),
		'halloweenBurst'   => __( 'Halloween Burst', 'init-fx-engine' ),
		'luckyMoney'       => __( 'Lucky Money (Tết)', 'init-fx-engine' ),
		'blossomRain'      => __( 'Blossom Rain (Tết)', 'init-fx-engine' ),
		'fireworksShow'    => __( 'Fireworks Show', 'init-fx-engine' ),
		'snowBurst'        => __( 'Snow Burst', 'init-fx-engine' ),
		'lanternRise'      => __( 'Lantern Rise', 'init-fx-engine' ),
	);
}

/**
 * Render the settings page.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$keywords = get_option( 'init_plugin_suite_fx_engine_keywords', array() );
	$keywords = is_array( $keywords ) ? $keywords : array();

	$grayscale = get_option( 'init_plugin_suite_fx_engine_grayscale', array() );
	$grayscale = wp_parse_args(
		is_array( $grayscale ) ? $grayscale : array(),
		array(
			'enabled'      => false,
			'mode'         => 'always',
			'custom_start' => '',
			'custom_end'   => '',
		)
	);

	$preloader = get_option( 'init_plugin_suite_fx_engine_preloader', array() );
	$preloader = wp_parse_args(
		is_array( $preloader ) ? $preloader : array(),
		array(
			'enabled'      => false,
			'style'        => 'dot',
			'bg'           => '',
			'session_once' => false,
		)
	);

	$snowfall  = init_plugin_suite_fx_engine_get_snowfall_settings();
	$inlinefmt = init_plugin_suite_fx_engine_get_inlinefmt_settings();
	$seasonal  = init_plugin_suite_fx_engine_get_seasonal_settings();

	include INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'settings-form.php';
}

/**
 * Sanitize keyword effects.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function init_plugin_suite_fx_engine_sanitize_keywords( $input ) {
	$output = array();

	if ( ! is_array( $input ) ) {
		return $output;
	}

	foreach ( $input as $key => $value ) {
		$key = (string) $key;

		// Tên hiệu ứng là camelCase → không dùng sanitize_key() (sẽ bị lowercase).
		if ( ! preg_match( '/^[A-Za-z0-9_]+$/', $key ) ) {
			continue;
		}

		$output[ $key ] = trim( sanitize_text_field( (string) $value ) );
	}

	return $output;
}

/**
 * Sanitize grayscale settings.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function init_plugin_suite_fx_engine_sanitize_grayscale( $input ) {
	$input   = is_array( $input ) ? $input : array();
	$mode    = sanitize_key( $input['mode'] ?? 'always' );
	$start   = sanitize_text_field( $input['custom_start'] ?? '' );
	$end     = sanitize_text_field( $input['custom_end'] ?? '' );
	$date_rx = '/^\d{4}-\d{2}-\d{2}$/';

	return array(
		'enabled'      => ! empty( $input['enabled'] ),
		'mode'         => in_array( $mode, array( 'off', 'always', 'custom' ), true ) ? $mode : 'always',
		'custom_start' => preg_match( $date_rx, $start ) ? $start : '',
		'custom_end'   => preg_match( $date_rx, $end ) ? $end : '',
	);
}

/**
 * Sanitize preloader settings.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function init_plugin_suite_fx_engine_sanitize_preloader( $input ) {
	$input = is_array( $input ) ? $input : array();
	$style = sanitize_key( $input['style'] ?? 'dot' );

	return array(
		'enabled'      => ! empty( $input['enabled'] ),
		'style'        => in_array( $style, array( 'dot', 'bar', 'logo', 'flower', 'spinner', 'emoji' ), true ) ? $style : 'dot',
		'bg'           => init_plugin_suite_fx_engine_sanitize_css_color( sanitize_text_field( $input['bg'] ?? '' ) ),
		'session_once' => ! empty( $input['session_once'] ),
	);
}

/**
 * Sanitize inline formatting settings.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function init_plugin_suite_fx_engine_sanitize_inlinefmt( $input ) {
	return array(
		'enabled' => is_array( $input ) && ! empty( $input['enabled'] ),
	);
}
