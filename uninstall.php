<?php
// Exit if accessed directly or not uninstalling
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Delete plugin options
delete_option( 'init_plugin_suite_fx_engine_keywords' );
delete_option( 'init_plugin_suite_fx_engine_snowfall' );
delete_option( 'init_plugin_suite_fx_engine_grayscale' );
delete_option( 'init_plugin_suite_fx_engine_preloader' );
delete_option( 'init_plugin_suite_fx_engine_inlinefmt' );
