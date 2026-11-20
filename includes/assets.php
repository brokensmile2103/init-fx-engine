<?php
/**
 * Frontend assets: smart (conditional) loading of the FX engine, inline
 * formatting, preloader and grayscale mode.
 *
 * Nguyên tắc từ 2.0.2: KHÔNG enqueue gì nếu trang không dùng tới.
 * - canvas-confetti + fx-engine.js: chỉ tải khi có từ khóa hiệu ứng được cấu hình,
 *   khi trang có shortcode / block FX Trigger, khi lời chào theo mùa cần chạy,
 *   hoặc khi developer bật qua filter.
 * - fx-inline.js (định dạng nội tuyến + spoiler): file riêng, không cần confetti.
 * - Preloader / Grayscale: chỉ in ra khi được bật và đúng lịch.
 * - Từ 2.0.4: trang chưa nạp engine có một stub nhỏ cho runEffect() / FXEngine.trigger();
 *   lần gọi đầu tiên mới tải canvas-confetti + fx-engine.js rồi chạy hiệu ứng đang chờ.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

/**
 * Script handles used by the plugin.
 */
const INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_CONFETTI = 'init-plugin-suite-fx-confetti';
const INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE   = 'init-plugin-suite-fx-engine';
const INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_INLINE   = 'init-plugin-suite-fx-inline';

/**
 * Lazy-loaded libraries: fx-engine.js injects these <script> tags only when an effect needs them.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_lazy_assets() {
	return array(
		'fireworks' => add_query_arg( 'ver', INIT_PLUGIN_SUITE_FX_ENGINE_VERSION, INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fireworks.min.js' ),
	);
}

/**
 * Parse the saved keyword option into the structure used by fx-engine.js.
 *
 * @return array Effect name => list of array( 'keyword' => string, 'emoji' => string|null ).
 */
function init_plugin_suite_fx_engine_get_keyword_map() {
	static $mapped = null;

	if ( null !== $mapped ) {
		return $mapped;
	}

	$mapped       = array();
	$raw_keywords = get_option( 'init_plugin_suite_fx_engine_keywords', array() );
	$raw_keywords = is_array( $raw_keywords ) ? $raw_keywords : array();

	foreach ( $raw_keywords as $effect => $raw ) {
		$effect = (string) $effect;

		if ( '' === trim( (string) $raw ) || ! preg_match( '/^[A-Za-z0-9_]+$/', $effect ) ) {
			continue;
		}

		foreach ( array_map( 'trim', explode( ',', (string) $raw ) ) as $entry ) {
			if ( '' === $entry ) {
				continue;
			}

			if ( 'emojiRain' === $effect ) {
				list( $keyword, $emoji ) = array_pad( explode( ':', $entry, 2 ), 2, null );

				$keyword = trim( (string) $keyword );
				if ( '' !== $keyword ) {
					$mapped[ $effect ][] = array(
						'keyword' => $keyword,
						'emoji'   => null !== $emoji ? trim( $emoji ) : null,
					);
				}
				continue;
			}

			$mapped[ $effect ][] = array( 'keyword' => $entry );
		}
	}

	return $mapped;
}

/**
 * Register canvas-confetti + fx-engine.js (idempotent, safe to call many times).
 *
 * Gắn sẵn dữ liệu (i18n, từ khóa, URL thư viện lazy) vào handle khi đăng ký,
 * nên dù script được enqueue muộn (trong lúc render shortcode / block) thì dữ liệu vẫn đi kèm.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_register_engine() {
	if ( wp_script_is( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE, 'registered' ) ) {
		return;
	}

	wp_register_script(
		INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_CONFETTI,
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/canvas-confetti.min.js',
		array(),
		'1.9.4',
		true
	);

	wp_register_script(
		INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE,
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-engine.js',
		array( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_CONFETTI ),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		true
	);

	wp_add_inline_script(
		INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE,
		sprintf(
			'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.assets = %1$s; window.FX_KEYWORDS = %2$s;',
			wp_json_encode( init_plugin_suite_fx_engine_lazy_assets() ),
			wp_json_encode( (object) init_plugin_suite_fx_engine_get_keyword_map() )
		),
		'before'
	);
}

/**
 * Enqueue the FX engine (canvas-confetti + fx-engine.js).
 *
 * Gọi từ shortcode, block, lời chào theo mùa... — có thể gọi muộn trong lúc render nội dung,
 * script sẽ được in ở footer.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_enqueue_engine() {
	init_plugin_suite_fx_engine_register_engine();
	wp_enqueue_script( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE );
}

/**
 * Build the public URL of a registered script, as WordPress would print it.
 *
 * Giữ đúng ?ver= và bộ lọc script_loader_src (CDN, plugin tối ưu) cho script được tải động.
 *
 * @param string $handle Registered script handle.
 * @return string Empty string when the handle is not registered.
 */
function init_plugin_suite_fx_engine_script_url( $handle ) {
	$scripts = wp_scripts();

	if ( empty( $scripts->registered[ $handle ] ) || empty( $scripts->registered[ $handle ]->src ) ) {
		return '';
	}

	$script = $scripts->registered[ $handle ];
	$src    = $script->src;

	if ( $script->ver ) {
		$src = add_query_arg( 'ver', $script->ver, $src );
	}

	/** This filter is documented in wp-includes/class-wp-scripts.php */
	return (string) apply_filters( 'script_loader_src', $src, $handle ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WordPress core filter.
}

add_action( 'wp_footer', 'init_plugin_suite_fx_engine_print_lazy_stub', 25 );
/**
 * Print a tiny runEffect() / FXEngine.trigger() stub on pages that did not load the engine.
 *
 * Smart loading (2.0.2) bỏ engine trên trang không có từ khóa / shortcode / block, nên code bên
 * ngoài gọi runEffect() (vd. Init User Engine khi điểm danh, nhận quà, lên cấp) không chạy được.
 * Stub xếp hàng các lần gọi, tải canvas-confetti + fx-engine.js ở lần gọi đầu tiên rồi chạy lại.
 * fx-engine.js ghi đè runEffect / FXEngine khi nạp xong. Chạy sau khi script footer đã in (20).
 *
 * @return void
 */
function init_plugin_suite_fx_engine_print_lazy_stub() {
	if ( wp_script_is( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE, 'done' ) || wp_script_is( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE, 'enqueued' ) ) {
		return;
	}

	/**
	 * Filter whether the on-demand runEffect() stub is printed on pages without the FX engine.
	 *
	 * @since 2.0.4
	 *
	 * @param bool $print Whether to print the stub. Default true.
	 */
	if ( ! apply_filters( 'init_plugin_suite_fx_engine_lazy_stub', true ) ) {
		return;
	}

	init_plugin_suite_fx_engine_register_engine();

	$config = array(
		'confetti' => init_plugin_suite_fx_engine_script_url( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_CONFETTI ),
		'engine'   => init_plugin_suite_fx_engine_script_url( INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_ENGINE ),
		'assets'   => init_plugin_suite_fx_engine_lazy_assets(),
		'keywords' => (object) init_plugin_suite_fx_engine_get_keyword_map(),
	);

	if ( '' === $config['confetti'] || '' === $config['engine'] ) {
		return;
	}

	$stub = '(function(w,d,c){'
		. 'if(typeof w.runEffect==="function"){return;}'
		. 'var q=[],state=0,fx=w.FXEngine=w.FXEngine||{},fx_effects=w.INIT_FX_EFFECTS=w.INIT_FX_EFFECTS||{};'
		. 'function add(src,done){var s=d.createElement("script");s.src=src;s.async=false;s.onload=done;s.onerror=function(){state=0;q.length=0;};(d.body||d.head).appendChild(s);}'
		. 'function flush(){state=2;if(w.runEffect===stub){q.length=0;return;}while(q.length){w.runEffect.apply(w,q.shift());}}'
		. 'function load(){if(state){return;}state=1;w.INIT_FX=w.INIT_FX||{};w.INIT_FX.assets=w.INIT_FX.assets||c.assets;w.FX_KEYWORDS=w.FX_KEYWORDS||c.keywords;'
		. 'var go=function(){add(c.engine,flush);};if(typeof w.confetti==="function"){go();}else{add(c.confetti,go);}}'
		. 'function stub(){if(state===2){return;}q.push([].slice.call(arguments));load();}'
		. 'w.runEffect=stub;fx.trigger=stub;'
		. 'fx.register=fx.register||function(n,f){if(n&&typeof f==="function"){fx_effects[n]=f;}};'
		. 'fx.effects=fx.effects||function(){return Object.keys(fx_effects);};'
		. '})(window,document,' . wp_json_encode( $config ) . ');';

	wp_print_inline_script_tag( $stub, array( 'id' => 'init-fx-engine-lazy-stub' ) );
}

/**
 * Get the inline formatting settings.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_get_inlinefmt_settings() {
	$saved = get_option( 'init_plugin_suite_fx_engine_inlinefmt', array() );

	return wp_parse_args( is_array( $saved ) ? $saved : array(), array( 'enabled' => true ) );
}

add_action( 'wp_enqueue_scripts', 'init_plugin_suite_fx_engine_enqueue_frontend_assets', 5 );
/**
 * Decide which site-wide assets are needed on the current request.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_enqueue_frontend_assets() {
	init_plugin_suite_fx_engine_register_engine();

	$load_engine = ! empty( init_plugin_suite_fx_engine_get_keyword_map() );

	/**
	 * Filter whether the FX engine (canvas-confetti + fx-engine.js) is loaded on the current page.
	 *
	 * By default it only loads when keyword effects are configured, or when the page
	 * contains an FX shortcode / block (those enqueue it on their own). Return true to
	 * always load it — e.g. if your theme calls FXEngine.trigger() directly.
	 *
	 * @param bool $load_engine Whether to load the engine site-wide on this request.
	 */
	if ( apply_filters( 'init_plugin_suite_fx_engine_load_engine', $load_engine ) ) {
		init_plugin_suite_fx_engine_enqueue_engine();
	}

	$inlinefmt = init_plugin_suite_fx_engine_get_inlinefmt_settings();

	if ( ! empty( $inlinefmt['enabled'] ) ) {
		wp_enqueue_script(
			INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_INLINE,
			INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-inline.js',
			array(),
			INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);

		wp_add_inline_script(
			INIT_PLUGIN_SUITE_FX_ENGINE_HANDLE_INLINE,
			'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.i18n = ' . wp_json_encode(
				array(
					'tap_to_reveal' => __( 'Tap to reveal', 'init-fx-engine' ),
				)
			) . ';',
			'before'
		);
	}
}

/**
 * Check whether today is inside a Y-m-d date range (inclusive).
 *
 * @param string $start Start date (Y-m-d).
 * @param string $end   End date (Y-m-d).
 * @param string $today Today (Y-m-d). Defaults to the site's current date.
 * @return bool
 */
function init_plugin_suite_fx_engine_today_in_range( $start, $end, $today = '' ) {
	$date_rx = '/^\d{4}-\d{2}-\d{2}$/';
	$today   = $today ? $today : current_time( 'Y-m-d' );

	if ( ! preg_match( $date_rx, (string) $start ) || ! preg_match( $date_rx, (string) $end ) ) {
		return false;
	}

	return $today >= $start && $today <= $end;
}

/**
 * Keep only characters that are safe inside a CSS color / gradient value.
 *
 * Cho phép: #hex, tên màu, rgb()/rgba()/hsl(), dấu phẩy (gradient), %, khoảng trắng.
 * Loại bỏ ; { } : < > " ' \ → không thể chèn thêm CSS.
 *
 * @param string $value Raw color value.
 * @return string
 */
function init_plugin_suite_fx_engine_sanitize_css_color( $value ) {
	$value = preg_replace( '/[^#a-zA-Z0-9(),.%\s-]/', '', (string) $value );

	return trim( preg_replace( '/\s+/', ' ', $value ) );
}

// ============================================================================
// PRELOADER — anti-flash: CSS critical che nội dung ngay từ <head>.
// ============================================================================

/**
 * Get the preloader settings.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_get_preloader_settings() {
	$saved = get_option( 'init_plugin_suite_fx_engine_preloader', array() );

	$preloader = wp_parse_args(
		is_array( $saved ) ? $saved : array(),
		array(
			'enabled'      => false,
			'style'        => 'dot',
			'bg'           => '#ffffff',
			'session_once' => false,
		)
	);

	$preloader['style'] = in_array( $preloader['style'], array( 'dot', 'bar', 'logo', 'flower', 'spinner', 'emoji' ), true ) ? $preloader['style'] : 'dot';
	$preloader['bg']    = init_plugin_suite_fx_engine_sanitize_css_color( $preloader['bg'] );
	$preloader['bg']    = '' !== $preloader['bg'] ? $preloader['bg'] : '#ffffff';

	return $preloader;
}

add_action( 'wp_enqueue_scripts', 'init_plugin_suite_fx_engine_enqueue_preloader' );
/**
 * Enqueue the preloader critical CSS and script (in <head>).
 *
 * @return void
 */
function init_plugin_suite_fx_engine_enqueue_preloader() {
	$preloader = init_plugin_suite_fx_engine_get_preloader_settings();

	if ( empty( $preloader['enabled'] ) ) {
		return;
	}

	$bg     = $preloader['bg'];
	$bg_css = false !== strpos( $bg, ',' ) && false === strpos( $bg, '(' ) ? 'linear-gradient(to right, ' . $bg . ')' : $bg;

	$critical_css = 'html.init-fx-preloading,html.init-fx-preloading body{overflow:hidden!important}'
		. 'html.init-fx-preloading body{visibility:hidden!important}'
		. 'html.init-fx-preloading #init-fx-preloader{visibility:visible!important;opacity:1!important}'
		. 'html.init-fx-preloading #wpadminbar{visibility:hidden!important;opacity:0!important;pointer-events:none!important}'
		. '#init-fx-preloader{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;background:' . $bg_css . '!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;visibility:hidden;opacity:1}';

	wp_register_style( 'init-plugin-suite-fx-preloader', false, array(), INIT_PLUGIN_SUITE_FX_ENGINE_VERSION );
	wp_enqueue_style( 'init-plugin-suite-fx-preloader' );
	wp_add_inline_style( 'init-plugin-suite-fx-preloader', $critical_css );

	wp_enqueue_script(
		'init-plugin-suite-fx-preloader',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-preloader.js',
		array(),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		false // Load sớm ở header.
	);

	wp_add_inline_script(
		'init-plugin-suite-fx-preloader',
		'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.preloader = ' . wp_json_encode( $preloader ) . ';',
		'before'
	);
}

add_action( 'wp_head', 'init_plugin_suite_fx_engine_preloader_head_script', 0 );
/**
 * Add the "preloading" class as early as possible to avoid a flash of content.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_preloader_head_script() {
	$preloader = init_plugin_suite_fx_engine_get_preloader_settings();

	if ( empty( $preloader['enabled'] ) ) {
		return;
	}

	// Tạo luôn khung preloader (gắn vào <html> vì <body> chưa tồn tại) để không bị "trắng trang" trước DOMContentLoaded.
	wp_print_inline_script_tag(
		'(function(d){var h=d.documentElement;h.classList.add("init-fx-preloading");if(!d.getElementById("init-fx-preloader")){var p=d.createElement("div");p.id="init-fx-preloader";p.setAttribute("aria-hidden","true");(d.body||h).appendChild(p);}})(document);',
		array( 'id' => 'init-fx-preloader-early' )
	);
}

add_action( 'wp_footer', 'init_plugin_suite_fx_engine_preloader_fallback', 999 );
/**
 * Fallback if the preloader script fails: remove the preloader after 3.5s.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_preloader_fallback() {
	$preloader = init_plugin_suite_fx_engine_get_preloader_settings();

	if ( empty( $preloader['enabled'] ) ) {
		return;
	}

	wp_print_inline_script_tag(
		'setTimeout(function(){document.documentElement.classList.remove("init-fx-preloading");var p=document.getElementById("init-fx-preloader");if(p){p.remove();}},3500);',
		array( 'id' => 'init-fx-preloader-fallback' )
	);
}

// ============================================================================
// GRAYSCALE — chỉ CSS, áp lên <html> (không dùng JS → không nháy màu,
// và không làm hỏng position:fixed của header/menu/hiệu ứng như khi áp lên <body>).
// ============================================================================

add_action( 'wp_enqueue_scripts', 'init_plugin_suite_fx_engine_enqueue_grayscale' );
/**
 * Print the grayscale CSS when it should run today.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_enqueue_grayscale() {
	$grayscale = get_option( 'init_plugin_suite_fx_engine_grayscale', array() );
	$grayscale = is_array( $grayscale ) ? $grayscale : array();

	if ( empty( $grayscale['enabled'] ) ) {
		return;
	}

	$mode = $grayscale['mode'] ?? 'off';

	if ( 'always' === $mode ) {
		$should_run = true;
	} elseif ( 'custom' === $mode ) {
		$should_run = init_plugin_suite_fx_engine_today_in_range( $grayscale['custom_start'] ?? '', $grayscale['custom_end'] ?? '' );
	} else {
		$should_run = false;
	}

	if ( ! $should_run ) {
		return;
	}

	wp_register_style( 'init-plugin-suite-fx-grayscale', false, array(), INIT_PLUGIN_SUITE_FX_ENGINE_VERSION );
	wp_enqueue_style( 'init-plugin-suite-fx-grayscale' );
	wp_add_inline_style( 'init-plugin-suite-fx-grayscale', 'html{-webkit-filter:grayscale(100%);filter:grayscale(100%)}' );
}
