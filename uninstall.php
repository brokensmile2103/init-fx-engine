<?php
/**
 * Uninstall: remove all plugin options.
 *
 * @package Init_FX_Engine
 */

// Exit if accessed directly or not uninstalling.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'init_plugin_suite_fx_engine_keywords' );
delete_option( 'init_plugin_suite_fx_engine_snowfall' );
delete_option( 'init_plugin_suite_fx_engine_grayscale' );
delete_option( 'init_plugin_suite_fx_engine_preloader' );
delete_option( 'init_plugin_suite_fx_engine_inlinefmt' );
delete_option( 'init_plugin_suite_fx_engine_seasonal' );
