<?php
/**
 * Plugin Name: Init FX Engine
 * Description: Add interactive visual effects like fireworks, emoji rain, snowfall, particle backgrounds and seasonal holiday scenes — triggered by comments, keywords, blocks or holidays. Scripts only load on pages that actually use them. Make your WordPress site come alive!
 * Plugin URI: https://inithtml.com/plugin/init-fx-engine/
 * Version: 2.0.3
 * Author: Init HTML
 * Author URI: https://inithtml.com/
 * Text Domain: init-fx-engine
 * Domain Path: /languages
 * Requires at least: 6.9
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

// === DEFINE CONSTANTS ===

define( 'INIT_PLUGIN_SUITE_FX_ENGINE_VERSION', '2.0.3' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_SLUG', 'init-fx-engine' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_OPTION', 'init_plugin_suite_fx_engine_settings' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_URL', plugin_dir_url( __FILE__ ) );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_PATH', plugin_dir_path( __FILE__ ) );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL', INIT_PLUGIN_SUITE_FX_ENGINE_URL . 'assets/' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_PATH', INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'assets/' );
define( 'INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH', INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'includes/' );

// === LOAD MODULES ===

require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'assets.php';
require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'shortcodes.php';
require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'snowfall.php';
require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'seasonal.php';
require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'blocks.php';

if ( is_admin() ) {
	require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'settings-page.php';
	require_once INIT_PLUGIN_SUITE_FX_ENGINE_INCLUDES_PATH . 'settings-seasonal.php';
}

// ==========================
// Settings link
// ==========================

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'init_plugin_suite_fx_engine_add_settings_link' );
/**
 * Add a "Settings" link to the plugin row in the Plugins admin screen.
 *
 * @param array $links Existing action links.
 * @return array
 */
function init_plugin_suite_fx_engine_add_settings_link( $links ) {
	$settings_link = sprintf(
		'<a href="%s">%s</a>',
		esc_url( admin_url( 'options-general.php?page=' . INIT_PLUGIN_SUITE_FX_ENGINE_SLUG ) ),
		esc_html__( 'Settings', 'init-fx-engine' )
	);

	array_unshift( $links, $settings_link );

	return $links;
}
