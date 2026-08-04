<?php
defined( 'ABSPATH' ) || exit;

// ============================================================================
// Block Editor integration
// ----------------------------------------------------------------------------
// 1 block tương ứng với shortcode [initfxen-fx] (slug mới, "chính"). Block
// này dùng "render" trong block.json (PHP, từ WP 6.1+) trỏ tới file
// render.php — file này chỉ gọi lại đúng hàm shortcode gốc (đã là hàm có tên
// sẵn trong includes/shortcodes.php), nên KHÔNG có logic hiển thị nào bị lặp
// lại/lệch so với shortcode.
//
// Không có block cho [initfxen-fx-ambient] — hành vi hiển thị particle nền
// không ổn định đủ để đưa vào Block Editor trong bản 2.0.0 này, shortcode
// gốc vẫn hoạt động bình thường và không bị ảnh hưởng gì.
//
// Plugin này không có tính năng đọc/ghi dữ liệu nào (thuần hiệu ứng JS thị
// giác), nên KHÔNG có Abilities API — không có "dữ liệu" nào để AI agent
// truy vấn ở đây, khác với các plugin Init Suite khác.
//
// Phần JS (assets/js/blocks-editor.js) là vanilla JS thuần, không build step,
// dùng ServerSideRender để preview ngay trong Block Editor.
//
// Kiến trúc này đồng bộ với các plugin Init Suite khác đã lên 2.0.0
// (block.json + render.php + 1 file JS chung cho toàn bộ block).
// ============================================================================

add_filter( 'block_categories_all', 'init_plugin_suite_fx_engine_block_category', 10, 2 );
/**
 * Thêm 1 category riêng trong block inserter cho gọn, thay vì rơi vào "Widgets".
 *
 * @param array                   $categories     Danh sách category hiện có.
 * @param WP_Block_Editor_Context $editor_context Context hiện tại của editor (không dùng tới,
 *                                                nhưng bắt buộc phải khai báo theo đúng chữ ký
 *                                                mà hook 'block_categories_all' truyền vào).
 * @return array
 */
// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
function init_plugin_suite_fx_engine_block_category( $categories, $editor_context ) {
	return array_merge(
		[
			[
				'slug'  => 'init-fx-engine',
				'title' => __( 'Init FX Engine', 'init-fx-engine' ),
				'icon'  => 'star-filled',
			],
		],
		$categories
	);
}

add_action( 'init', 'init_plugin_suite_fx_engine_register_blocks', 10 );
/**
 * Đăng ký script cho Block Editor và block type FX Trigger.
 *
 * Không có style handle nào cần đăng ký ở đây — plugin không có CSS riêng,
 * và JS engine cần thiết (fx-engine.js) đã tự enqueue toàn site không điều
 * kiện, y hệt hành vi shortcode gốc.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_register_blocks() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	wp_register_script(
		'init-fx-engine-blocks-editor',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/blocks-editor.js',
		[
			'wp-blocks',
			'wp-element',
			'wp-block-editor',
			'wp-components',
			'wp-i18n',
			'wp-server-side-render',
		],
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		true
	);

	if ( function_exists( 'wp_set_script_translations' ) ) {
		wp_set_script_translations(
			'init-fx-engine-blocks-editor',
			'init-fx-engine',
			INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'languages'
		);
	}

	register_block_type( INIT_PLUGIN_SUITE_FX_ENGINE_PATH . 'blocks/fx-trigger' );
}
