<?php
/**
 * Block Editor integration.
 *
 * - FX Trigger (init-fx-engine/fx-trigger): tương ứng shortcode [initfxen-fx]. render.php
 *   gọi lại đúng hàm shortcode gốc → output luôn giống hệt shortcode.
 * - FX Ambient Section (init-fx-engine/fx-ambient) — mới ở 2.0.2: một section chứa block
 *   bất kỳ bên trong, nền là hiệu ứng hạt tsParticles (sao lấp lánh, tuyết, bong bóng,
 *   đom đóm, mạng lưới, emoji). Dùng chung logic cấu hình với [initfxen-fx-ambient].
 *
 * Plugin này không có tính năng đọc/ghi dữ liệu nào (thuần hiệu ứng JS thị giác),
 * nên KHÔNG có Abilities API.
 *
 * Phần JS (assets/js/blocks-editor.js) là vanilla JS thuần, không build step.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'block_categories_all', 'init_plugin_suite_fx_engine_block_category', 10, 2 );
/**
 * Thêm 1 category riêng trong block inserter cho gọn, thay vì rơi vào "Widgets".
 *
 * @param array                   $categories     Danh sách category hiện có.
 * @param WP_Block_Editor_Context $editor_context Context hiện tại của editor (không dùng tới).
 * @return array
 */
function init_plugin_suite_fx_engine_block_category( $categories, $editor_context ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- Signature required by the filter.
	foreach ( $categories as $category ) {
		if ( isset( $category['slug'] ) && 'init-fx-engine' === $category['slug'] ) {
			return $categories;
		}
	}

	return array_merge(
		array(
			array(
				'slug'  => 'init-fx-engine',
				'title' => __( 'Init FX Engine', 'init-fx-engine' ),
				'icon'  => 'star-filled',
			),
		),
		$categories
	);
}

add_action( 'init', 'init_plugin_suite_fx_engine_register_blocks', 10 );
/**
 * Register the Block Editor script and the block types.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_register_blocks() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	// fx-ambient.js (+ tsParticles) cũng dùng để xem trước nền hạt ngay trong editor.
	init_plugin_suite_fx_engine_register_ambient();

	wp_register_script(
		'init-fx-engine-blocks-editor',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/blocks-editor.js',
		array(
			'wp-blocks',
			'wp-element',
			'wp-block-editor',
			'wp-components',
			'wp-i18n',
			'wp-server-side-render',
			'init-plugin-suite-fx-ambient',
		),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		true
	);

	wp_set_script_translations(
		'init-fx-engine-blocks-editor',
		'init-fx-engine',
		INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'languages'
	);

	register_block_type( INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'blocks/fx-trigger' );
	register_block_type( INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'blocks/fx-ambient' );
}

add_action( 'enqueue_block_assets', 'init_plugin_suite_fx_engine_editor_iframe_assets' );
/**
 * Load tsParticles + fx-ambient.js inside the (iframed) editor canvas, so the
 * FX Ambient Section preview draws in the right document.
 *
 * Hook này chạy cả ở frontend → chỉ enqueue trong admin (Block Editor).
 *
 * @return void
 */
function init_plugin_suite_fx_engine_editor_iframe_assets() {
	if ( ! is_admin() ) {
		return;
	}

	init_plugin_suite_fx_engine_register_ambient();
	wp_enqueue_script( 'init-plugin-suite-fx-ambient' );
}
