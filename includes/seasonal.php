<?php
/**
 * Seasonal Effects — ambient holiday scenes (Halloween, Christmas, New Year,
 * Lunar New Year / Tết, Valentine, Mid-Autumn).
 *
 * Phần PHP chỉ lo 3 việc:
 * - Lưu & chuẩn hóa cấu hình (option riêng, không đụng option Snowfall cũ).
 * - Quyết định hôm nay có chạy không + chạy theme nào (theo lịch lễ dựng sẵn,
 *   lịch tùy chỉnh, hoặc luôn bật).
 * - Enqueue 1 file JS nhỏ (fx-seasonal.js) kèm payload tối thiểu cho frontend.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

/**
 * Default settings for the Seasonal Effects module.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_seasonal_defaults() {
	return array(
		'enabled'        => false,
		'theme'          => 'auto',
		'mode'           => 'auto',
		'custom_start'   => '',
		'custom_end'     => '',
		'homepage_only'  => false,
		'emojis'         => '',
		'amount'         => 28,
		'size'           => 26,
		'speed'          => 1,
		'opacity'        => 0.9,
		'greeting'       => true,
		'reduced_motion' => true,
	);
}

/**
 * Get the saved Seasonal Effects settings merged with defaults.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_get_seasonal_settings() {
	$saved = get_option( 'init_plugin_suite_fx_engine_seasonal', array() );

	if ( ! is_array( $saved ) ) {
		$saved = array();
	}

	return wp_parse_args( $saved, init_plugin_suite_fx_engine_seasonal_defaults() );
}

/**
 * Built-in seasonal themes.
 *
 * Mỗi theme gồm:
 * - label:    tên hiển thị (đã dịch).
 * - items:    danh sách emoji sẽ bay trên màn hình.
 * - motion:   kiểu chuyển động — fall (rơi), rise (bay lên), flutter (bay ngang).
 * - glow:     màu phát sáng quanh emoji (rỗng = không phát sáng).
 * - greeting: hiệu ứng chào mừng chạy 1 lần mỗi phiên truy cập.
 *
 * @return array
 */
function init_plugin_suite_fx_engine_seasonal_themes() {
	$themes = array(
		'halloween' => array(
			'label'    => __( 'Halloween', 'init-fx-engine' ),
			'items'    => array( '🎃', '👻', '🦇', '🕸️', '🍬' ),
			'motion'   => 'flutter',
			'glow'     => '',
			'greeting' => 'halloweenBurst',
		),
		'christmas' => array(
			'label'    => __( 'Christmas', 'init-fx-engine' ),
			'items'    => array( '❄️', '🎁', '🎄', '⛄', '🔔' ),
			'motion'   => 'fall',
			'glow'     => '',
			'greeting' => 'snowBurst',
		),
		'newyear'   => array(
			'label'    => __( 'New Year', 'init-fx-engine' ),
			'items'    => array( '✨', '🎉', '🎊', '🥂', '⭐' ),
			'motion'   => 'fall',
			'glow'     => 'rgba(255, 215, 0, 0.75)',
			'greeting' => 'fireworksShow',
		),
		'tet'       => array(
			'label'    => __( 'Lunar New Year (Tết)', 'init-fx-engine' ),
			'items'    => array( '🌸', '🌼', '🧧', '🌸', '🏮' ),
			'motion'   => 'fall',
			'glow'     => '',
			'greeting' => 'luckyMoney',
		),
		'valentine' => array(
			'label'    => __( 'Valentine', 'init-fx-engine' ),
			'items'    => array( '💖', '💘', '💕', '🌹' ),
			'motion'   => 'fall',
			'glow'     => '',
			'greeting' => 'heartRain',
		),
		'midautumn' => array(
			'label'    => __( 'Mid-Autumn Festival', 'init-fx-engine' ),
			'items'    => array( '🏮', '🏮', '🥮', '🏮', '⭐' ),
			'motion'   => 'rise',
			'glow'     => 'rgba(255, 160, 40, 0.85)',
			'greeting' => 'lanternRise',
		),
	);

	/**
	 * Filter the built-in seasonal themes (add, remove or tweak a theme).
	 *
	 * @param array $themes Theme definitions keyed by theme slug.
	 */
	$themes = apply_filters( 'init_plugin_suite_fx_engine_seasonal_themes', $themes );

	return is_array( $themes ) ? $themes : array();
}

/**
 * Lunar calendar dates (Vietnam, UTC+7) for Tết and the Mid-Autumn Festival.
 *
 * Tính sẵn theo thuật toán âm lịch Việt Nam (múi giờ +7) — lưu ý Tết Việt
 * có năm lệch với Tết Trung Quốc (ví dụ 2030). Có thể bổ sung năm mới qua filter.
 *
 * @return array Year => array( 'tet' => 'Y-m-d', 'midautumn' => 'Y-m-d' ).
 */
function init_plugin_suite_fx_engine_lunar_dates() {
	$dates = array(
		2025 => array(
			'tet'       => '2025-01-29',
			'midautumn' => '2025-10-06',
		),
		2026 => array(
			'tet'       => '2026-02-17',
			'midautumn' => '2026-09-25',
		),
		2027 => array(
			'tet'       => '2027-02-06',
			'midautumn' => '2027-09-15',
		),
		2028 => array(
			'tet'       => '2028-01-26',
			'midautumn' => '2028-10-03',
		),
		2029 => array(
			'tet'       => '2029-02-13',
			'midautumn' => '2029-09-22',
		),
		2030 => array(
			'tet'       => '2030-02-02',
			'midautumn' => '2030-09-12',
		),
		2031 => array(
			'tet'       => '2031-01-23',
			'midautumn' => '2031-10-01',
		),
		2032 => array(
			'tet'       => '2032-02-11',
			'midautumn' => '2032-09-19',
		),
		2033 => array(
			'tet'       => '2033-01-31',
			'midautumn' => '2033-09-08',
		),
		2034 => array(
			'tet'       => '2034-02-19',
			'midautumn' => '2034-09-26',
		),
		2035 => array(
			'tet'       => '2035-02-08',
			'midautumn' => '2035-09-16',
		),
		2036 => array(
			'tet'       => '2036-01-28',
			'midautumn' => '2036-10-04',
		),
		2037 => array(
			'tet'       => '2037-02-15',
			'midautumn' => '2037-09-24',
		),
		2038 => array(
			'tet'       => '2038-02-04',
			'midautumn' => '2038-09-13',
		),
		2039 => array(
			'tet'       => '2039-01-24',
			'midautumn' => '2039-10-02',
		),
		2040 => array(
			'tet'       => '2040-02-12',
			'midautumn' => '2040-09-20',
		),
	);

	/**
	 * Filter the lunar calendar dates used by the Tết and Mid-Autumn themes.
	 *
	 * @param array $dates Year => array( 'tet' => 'Y-m-d', 'midautumn' => 'Y-m-d' ).
	 */
	$dates = apply_filters( 'init_plugin_suite_fx_engine_lunar_dates', $dates );

	return is_array( $dates ) ? $dates : array();
}

/**
 * Shift a Y-m-d date by a number of days.
 *
 * @param string $date Date in Y-m-d format.
 * @param int    $days Number of days (can be negative).
 * @return string Shifted date in Y-m-d format, or empty string on invalid input.
 */
function init_plugin_suite_fx_engine_shift_date( $date, $days ) {
	$dt = DateTimeImmutable::createFromFormat( '!Y-m-d', (string) $date, new DateTimeZone( 'UTC' ) );

	if ( ! $dt ) {
		return '';
	}

	return $dt->modify( sprintf( '%+d days', (int) $days ) )->format( 'Y-m-d' );
}

/**
 * Built-in schedule window of a theme for a given year.
 *
 * @param string $theme Theme slug.
 * @param int    $year  Gregorian year.
 * @return array|null array( 'start' => 'Y-m-d', 'end' => 'Y-m-d' ) or null if unknown.
 */
function init_plugin_suite_fx_engine_seasonal_window( $theme, $year ) {
	$year   = (int) $year;
	$window = null;

	switch ( $theme ) {
		case 'halloween':
			$window = array(
				'start' => sprintf( '%04d-10-24', $year ),
				'end'   => sprintf( '%04d-10-31', $year ),
			);
			break;

		case 'christmas':
			$window = array(
				'start' => sprintf( '%04d-12-20', $year ),
				'end'   => sprintf( '%04d-12-26', $year ),
			);
			break;

		case 'newyear':
			$window = array(
				'start' => sprintf( '%04d-12-30', $year ),
				'end'   => sprintf( '%04d-01-02', $year + 1 ),
			);
			break;

		case 'valentine':
			$window = array(
				'start' => sprintf( '%04d-02-10', $year ),
				'end'   => sprintf( '%04d-02-14', $year ),
			);
			break;

		case 'tet':
		case 'midautumn':
			$lunar = init_plugin_suite_fx_engine_lunar_dates();
			if ( ! empty( $lunar[ $year ][ $theme ] ) ) {
				// Tết: từ 23 tháng Chạp (ông Công ông Táo) tới mùng 7.
				// Trung Thu: 1 tuần trước rằm tháng 8 tới hết ngày 16.
				$after  = ( 'tet' === $theme ) ? 6 : 1;
				$window = array(
					'start' => init_plugin_suite_fx_engine_shift_date( $lunar[ $year ][ $theme ], -7 ),
					'end'   => init_plugin_suite_fx_engine_shift_date( $lunar[ $year ][ $theme ], $after ),
				);
			}
			break;
	}

	/**
	 * Filter the built-in schedule window of a seasonal theme.
	 *
	 * @param array|null $window array( 'start' => 'Y-m-d', 'end' => 'Y-m-d' ) or null.
	 * @param string     $theme  Theme slug.
	 * @param int        $year   Gregorian year.
	 */
	$window = apply_filters( 'init_plugin_suite_fx_engine_seasonal_window', $window, $theme, $year );

	if ( ! is_array( $window ) || empty( $window['start'] ) || empty( $window['end'] ) ) {
		return null;
	}

	return $window;
}

/**
 * Upcoming (or currently running) holiday windows, sorted by start date.
 *
 * Thứ tự ưu tiên khi trùng ngày: theo thứ tự khai báo theme (Tết đứng trước
 * Valentine nếu 2 dịp trùng nhau).
 *
 * @param string $today Date in Y-m-d format.
 * @return array List of array( 'theme', 'start', 'end' ).
 */
function init_plugin_suite_fx_engine_seasonal_upcoming( $today ) {
	$year     = (int) substr( $today, 0, 4 );
	$priority = array( 'tet', 'valentine', 'midautumn', 'halloween', 'christmas', 'newyear' );
	$themes   = array_keys( init_plugin_suite_fx_engine_seasonal_themes() );
	$ordered  = array_values( array_unique( array_merge( array_intersect( $priority, $themes ), $themes ) ) );
	$list     = array();

	foreach ( $ordered as $index => $theme ) {
		for ( $y = $year - 1; $y <= $year + 1; $y++ ) {
			$window = init_plugin_suite_fx_engine_seasonal_window( $theme, $y );

			if ( ! $window || $window['end'] < $today ) {
				continue;
			}

			$list[] = array(
				'theme' => $theme,
				'start' => $window['start'],
				'end'   => $window['end'],
				'order' => $index,
			);
		}
	}

	usort(
		$list,
		function ( $a, $b ) {
			if ( $a['start'] === $b['start'] ) {
				return $a['order'] - $b['order'];
			}
			return strcmp( $a['start'], $b['start'] );
		}
	);

	return $list;
}

/**
 * Detect which holiday theme is running on a given date.
 *
 * @param string $today Date in Y-m-d format.
 * @return string Theme slug, or empty string when no holiday is active.
 */
function init_plugin_suite_fx_engine_detect_seasonal_theme( $today ) {
	$active = array();

	foreach ( init_plugin_suite_fx_engine_seasonal_upcoming( $today ) as $window ) {
		if ( $window['start'] <= $today ) {
			$active[] = $window;
		}
	}

	if ( empty( $active ) ) {
		return '';
	}

	// Nhiều dịp cùng lúc → ưu tiên theo thứ tự theme.
	usort(
		$active,
		function ( $a, $b ) {
			return $a['order'] - $b['order'];
		}
	);

	return $active[0]['theme'];
}

/**
 * Resolve the theme that should run today based on the saved settings.
 *
 * @param array  $settings Seasonal settings.
 * @param string $today    Date in Y-m-d format.
 * @return string Theme slug, or empty string when nothing should run.
 */
function init_plugin_suite_fx_engine_resolve_seasonal_theme( $settings, $today ) {
	$themes = init_plugin_suite_fx_engine_seasonal_themes();
	$theme  = isset( $settings['theme'] ) ? (string) $settings['theme'] : 'auto';
	$mode   = isset( $settings['mode'] ) ? (string) $settings['mode'] : 'auto';

	if ( 'auto' !== $theme && ! isset( $themes[ $theme ] ) ) {
		$theme = 'auto';
	}

	if ( 'auto' === $mode ) {
		if ( 'auto' === $theme ) {
			return init_plugin_suite_fx_engine_detect_seasonal_theme( $today );
		}

		foreach ( init_plugin_suite_fx_engine_seasonal_upcoming( $today ) as $window ) {
			if ( $window['theme'] === $theme && $window['start'] <= $today ) {
				return $theme;
			}
		}

		return '';
	}

	if ( 'custom' === $mode ) {
		$start = sanitize_text_field( $settings['custom_start'] ?? '' );
		$end   = sanitize_text_field( $settings['custom_end'] ?? '' );

		if ( ! $start || ! $end || $today < $start || $today > $end ) {
			return '';
		}
	} elseif ( 'always' !== $mode ) {
		return '';
	}

	if ( 'auto' !== $theme ) {
		return $theme;
	}

	// Theme "auto" + lịch tùy chỉnh / luôn bật → dịp lễ đang diễn ra, nếu không có thì lấy dịp gần nhất.
	$detected = init_plugin_suite_fx_engine_detect_seasonal_theme( $today );

	if ( $detected ) {
		return $detected;
	}

	$upcoming = init_plugin_suite_fx_engine_seasonal_upcoming( $today );

	return ! empty( $upcoming ) ? $upcoming[0]['theme'] : '';
}

/**
 * Parse the "custom emojis" setting into a clean list.
 *
 * @param string $raw Comma-separated emoji list.
 * @return array
 */
function init_plugin_suite_fx_engine_parse_emoji_list( $raw ) {
	$items = array();

	foreach ( explode( ',', (string) $raw ) as $item ) {
		$item = trim( $item );

		if ( '' === $item ) {
			continue;
		}

		$items[] = function_exists( 'mb_substr' ) ? mb_substr( $item, 0, 16 ) : substr( $item, 0, 64 );

		if ( count( $items ) >= 12 ) {
			break;
		}
	}

	return $items;
}

/**
 * Build the minimal frontend payload for a theme.
 *
 * @param string $theme    Theme slug.
 * @param array  $settings Seasonal settings.
 * @return array
 */
function init_plugin_suite_fx_engine_seasonal_payload( $theme, $settings ) {
	$themes     = init_plugin_suite_fx_engine_seasonal_themes();
	$definition = isset( $themes[ $theme ] ) ? $themes[ $theme ] : array();
	$custom     = init_plugin_suite_fx_engine_parse_emoji_list( $settings['emojis'] ?? '' );
	$items      = ! empty( $custom ) ? $custom : ( $definition['items'] ?? array() );
	$motion     = $definition['motion'] ?? 'fall';
	$greeting   = (string) ( $definition['greeting'] ?? '' );

	$payload = array(
		'theme'         => $theme,
		'items'         => array_values( array_map( 'strval', (array) $items ) ),
		'motion'        => in_array( $motion, array( 'fall', 'rise', 'flutter' ), true ) ? $motion : 'fall',
		'glow'          => sanitize_text_field( $definition['glow'] ?? '' ),
		// Tên hiệu ứng là camelCase (vd: halloweenBurst) nên không dùng sanitize_key() (sẽ bị lowercase).
		'greeting'      => ( ! empty( $settings['greeting'] ) && preg_match( '/^[A-Za-z0-9_]+$/', $greeting ) ) ? $greeting : '',
		'amount'        => max( 5, min( 100, (int) $settings['amount'] ) ),
		'size'          => max( 12, min( 64, (int) $settings['size'] ) ),
		'speed'         => max( 0.3, min( 3, (float) $settings['speed'] ) ),
		'opacity'       => max( 0.2, min( 1, (float) $settings['opacity'] ) ),
		'reducedMotion' => ! empty( $settings['reduced_motion'] ),
	);

	/**
	 * Filter the Seasonal Effects payload sent to the frontend.
	 *
	 * @param array  $payload  Frontend config.
	 * @param string $theme    Theme slug.
	 * @param array  $settings Saved settings.
	 */
	return apply_filters( 'init_plugin_suite_fx_engine_seasonal_config', $payload, $theme, $settings );
}

/**
 * Whether the current request is the site homepage.
 *
 * Giữ nguyên logic "homepage only" của Snowfall (static front page hoặc blog home).
 *
 * @return bool
 */
function init_plugin_suite_fx_engine_is_homepage_request() {
	$front_page_id = (int) get_option( 'page_on_front' );

	if ( $front_page_id > 0 ) {
		return (int) get_queried_object_id() === $front_page_id;
	}

	return is_home();
}

add_action( 'wp_enqueue_scripts', 'init_plugin_suite_fx_engine_enqueue_seasonal' );
/**
 * Enqueue the Seasonal Effects script when a holiday theme should run today.
 *
 * @return void
 */
function init_plugin_suite_fx_engine_enqueue_seasonal() {
	$settings = init_plugin_suite_fx_engine_get_seasonal_settings();

	if ( empty( $settings['enabled'] ) ) {
		return;
	}

	if ( ! empty( $settings['homepage_only'] ) && ! init_plugin_suite_fx_engine_is_homepage_request() ) {
		return;
	}

	$theme = init_plugin_suite_fx_engine_resolve_seasonal_theme( $settings, current_time( 'Y-m-d' ) );

	if ( '' === $theme ) {
		return;
	}

	$payload              = init_plugin_suite_fx_engine_seasonal_payload( $theme, $settings );
	$payload['autostart'] = true;

	wp_enqueue_script(
		'init-plugin-suite-fx-seasonal',
		INIT_PLUGIN_SUITE_FX_ENGINE_ASSETS_URL . 'js/fx-seasonal.js',
		array( 'init-plugin-suite-fx-engine' ),
		INIT_PLUGIN_SUITE_FX_ENGINE_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	wp_add_inline_script(
		'init-plugin-suite-fx-seasonal',
		'window.INIT_FX = window.INIT_FX || {}; window.INIT_FX.seasonal = ' . wp_json_encode( $payload ) . ';',
		'before'
	);
}

/**
 * Sanitize the Seasonal Effects settings.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function init_plugin_suite_fx_engine_sanitize_seasonal( $input ) {
	$input    = is_array( $input ) ? $input : array();
	$defaults = init_plugin_suite_fx_engine_seasonal_defaults();
	$themes   = array_keys( init_plugin_suite_fx_engine_seasonal_themes() );
	$theme    = sanitize_key( $input['theme'] ?? 'auto' );
	$mode     = sanitize_key( $input['mode'] ?? 'auto' );
	$date_rx  = '/^\d{4}-\d{2}-\d{2}$/';
	$start    = sanitize_text_field( $input['custom_start'] ?? '' );
	$end      = sanitize_text_field( $input['custom_end'] ?? '' );

	// Theme slug có thể là camelCase nếu được thêm qua filter → so khớp không phân biệt hoa thường.
	$theme_match = 'auto';
	foreach ( $themes as $slug ) {
		if ( strtolower( $slug ) === $theme ) {
			$theme_match = $slug;
			break;
		}
	}

	return array(
		'enabled'        => ! empty( $input['enabled'] ),
		'theme'          => $theme_match,
		'mode'           => in_array( $mode, array( 'auto', 'custom', 'always' ), true ) ? $mode : 'auto',
		'custom_start'   => preg_match( $date_rx, $start ) ? $start : '',
		'custom_end'     => preg_match( $date_rx, $end ) ? $end : '',
		'homepage_only'  => ! empty( $input['homepage_only'] ),
		'emojis'         => implode( ', ', init_plugin_suite_fx_engine_parse_emoji_list( sanitize_text_field( $input['emojis'] ?? '' ) ) ),
		'amount'         => max( 5, min( 100, intval( $input['amount'] ?? $defaults['amount'] ) ) ),
		'size'           => max( 12, min( 64, intval( $input['size'] ?? $defaults['size'] ) ) ),
		'speed'          => max( 0.3, min( 3, floatval( $input['speed'] ?? $defaults['speed'] ) ) ),
		'opacity'        => max( 0.2, min( 1, floatval( $input['opacity'] ?? $defaults['opacity'] ) ) ),
		'greeting'       => ! empty( $input['greeting'] ),
		'reduced_motion' => ! empty( $input['reduced_motion'] ),
	);
}
