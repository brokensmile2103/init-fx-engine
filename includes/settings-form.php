<?php
/**
 * Settings page template — chia thành từng mục (h2 + mô tả + form-table).
 *
 * Được include bên trong init_plugin_suite_fx_engine_settings_page(), nên các
 * biến ở đây là biến cục bộ của hàm đó. Tên field giữ nguyên như các bản trước
 * để không ảnh hưởng dữ liệu đã lưu.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Template included inside init_plugin_suite_fx_engine_settings_page(), variables are function-local.

$keywords  = get_option( 'init_plugin_suite_fx_engine_keywords', array() );
$snowfall  = get_option( 'init_plugin_suite_fx_engine_snowfall', array() );
$grayscale = get_option( 'init_plugin_suite_fx_engine_grayscale', array() );
$preloader = get_option( 'init_plugin_suite_fx_engine_preloader', array() );

$fields = array(
	'firework'         => __( 'Firework', 'init-fx-engine' ),
	'starlightBurst'   => __( 'Starlight Burst', 'init-fx-engine' ),
	'emojiRain'        => __( 'Emoji Rain', 'init-fx-engine' ) . '<br><small>' . __( 'Format: keyword:emoji, keyword:emoji', 'init-fx-engine' ) . '</small>',
	'cannonBlast'      => __( 'Cannon Blast', 'init-fx-engine' ),
	'heartRain'        => __( 'Heart Rain', 'init-fx-engine' ),
	'schoolPride'      => __( 'School Pride', 'init-fx-engine' ),
	'celebrationBurst' => __( 'Celebration Burst', 'init-fx-engine' ),
	'halloweenBurst'   => __( 'Halloween Burst', 'init-fx-engine' ),
	'luckyMoney'       => __( 'Lucky Money (Tết)', 'init-fx-engine' ),
	'fireworksShow'    => __( 'Fireworks Show', 'init-fx-engine' ),
	'snowBurst'        => __( 'Snow Burst', 'init-fx-engine' ),
	'lanternRise'      => __( 'Lantern Rise', 'init-fx-engine' ),
);

$preloader_styles = array( 'dot', 'bar', 'logo', 'flower', 'spinner', 'emoji' );
?>

<div class="wrap">
	<h1><?php esc_html_e( 'Init FX Engine Settings', 'init-fx-engine' ); ?></h1>
	<form method="post" action="options.php">
		<?php settings_fields( 'init_plugin_suite_fx_engine_settings_group' ); ?>

		<?php // ===== PRELOADER ===== ?>
		<h2><?php esc_html_e( 'Preloader (Loading screen)', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Show an animated loading screen until the page has fully loaded.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">
					<label for="init_fx_preloader_enabled"><?php esc_html_e( 'Enable', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_preloader[enabled]" id="init_fx_preloader_enabled" value="1" <?php checked( $preloader['enabled'] ?? false ); ?>>
						<?php esc_html_e( 'Enable loading screen before page fully loads', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_preloader_style"><?php esc_html_e( 'Style', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<select name="init_plugin_suite_fx_engine_preloader[style]" id="init_fx_preloader_style">
						<?php foreach ( $preloader_styles as $preloader_style ) : ?>
							<option value="<?php echo esc_attr( $preloader_style ); ?>" <?php selected( $preloader['style'] ?? '', $preloader_style ); ?>>
								<?php echo esc_html( ucwords( str_replace( array( '_', '-' ), ' ', $preloader_style ) ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_preloader_bg"><?php esc_html_e( 'Background Color', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="text" name="init_plugin_suite_fx_engine_preloader[bg]" id="init_fx_preloader_bg" class="regular-text"
						value="<?php echo esc_attr( $preloader['bg'] ?? '' ); ?>"
						placeholder="#ffffff or red, blue">
					<p class="description"><?php esc_html_e( 'Use a single color or comma-separated values for gradient.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_preloader_session_once"><?php esc_html_e( 'Once per session', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_preloader[session_once]" id="init_fx_preloader_session_once" value="1" <?php checked( $preloader['session_once'] ?? false ); ?>>
						<?php esc_html_e( 'Only show on first visit in a session', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
		</table>

		<?php // ===== KEYWORD EFFECTS ===== ?>
		<h2><?php esc_html_e( 'Keyword Effects', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Comma-separated keywords that turn into clickable effect triggers inside your content and comments. Use the Preview button to try each effect.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<?php foreach ( $fields as $key => $label ) : ?>
				<tr>
					<th scope="row">
						<label for="fx_engine_keywords_<?php echo esc_attr( $key ); ?>">
							<?php echo wp_kses_post( $label ); ?>
						</label>
					</th>
					<td>
						<input type="text" class="regular-text fx-keyword-input"
							id="fx_engine_keywords_<?php echo esc_attr( $key ); ?>"
							name="init_plugin_suite_fx_engine_keywords[<?php echo esc_attr( $key ); ?>]"
							value="<?php echo esc_attr( $keywords[ $key ] ?? '' ); ?>">
						<button type="button" class="button fx-preview-btn" data-effect="<?php echo esc_attr( $key ); ?>">
							<?php esc_html_e( 'Preview', 'init-fx-engine' ); ?>
						</button>
					</td>
				</tr>
			<?php endforeach; ?>
		</table>

		<?php // ===== SNOWFALL ===== ?>
		<h2><?php esc_html_e( 'Snowfall Effect', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Gentle falling snow over the whole site, on an automatic or custom schedule.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">
					<label for="init_fx_snowfall_enabled"><?php esc_html_e( 'Enable', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[enabled]" id="init_fx_snowfall_enabled" value="1" <?php checked( $snowfall['enabled'] ?? false ); ?>>
						<?php esc_html_e( 'Enable snowfall effect on site', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Schedule', 'init-fx-engine' ); ?></th>
				<td>
					<fieldset>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_snowfall[mode]" value="auto" <?php checked( $snowfall['mode'] ?? 'auto', 'auto' ); ?>>
							<?php esc_html_e( 'Auto schedule (Dec 20 – Dec 31)', 'init-fx-engine' ); ?>
						</label>
						<br>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_snowfall[mode]" value="custom" <?php checked( $snowfall['mode'] ?? 'auto', 'custom' ); ?>>
							<?php esc_html_e( 'Custom schedule', 'init-fx-engine' ); ?>
						</label>
					</fieldset>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Custom dates', 'init-fx-engine' ); ?></th>
				<td>
					<label><?php esc_html_e( 'Start Date', 'init-fx-engine' ); ?>:
						<input type="date" name="init_plugin_suite_fx_engine_snowfall[custom_start]" value="<?php echo esc_attr( $snowfall['custom_start'] ?? '' ); ?>">
					</label>
					&nbsp;
					<label><?php esc_html_e( 'End Date', 'init-fx-engine' ); ?>:
						<input type="date" name="init_plugin_suite_fx_engine_snowfall[custom_end]" value="<?php echo esc_attr( $snowfall['custom_end'] ?? '' ); ?>">
					</label>
					<p class="description"><?php esc_html_e( 'Only used with the custom schedule.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_snowfall_homepage_only"><?php esc_html_e( 'Homepage only', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[homepage_only]" id="init_fx_snowfall_homepage_only" value="1" <?php checked( $snowfall['homepage_only'] ?? false ); ?>>
						<?php esc_html_e( 'Show snowfall effect on homepage only', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_snowfall_amount"><?php esc_html_e( 'Snow amount', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" name="init_plugin_suite_fx_engine_snowfall[amount]" id="init_fx_snowfall_amount"
						value="<?php echo esc_attr( $snowfall['amount'] ?? 80 ); ?>"
						min="20" max="200" step="10">
					<p class="description"><?php esc_html_e( 'Recommended: 60–100', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_snowfall_size"><?php esc_html_e( 'Snow size', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" name="init_plugin_suite_fx_engine_snowfall[size]" id="init_fx_snowfall_size"
						value="<?php echo esc_attr( $snowfall['size'] ?? 4 ); ?>"
						min="1" max="10">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_snowfall_speed"><?php esc_html_e( 'Fall speed', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" name="init_plugin_suite_fx_engine_snowfall[speed]" id="init_fx_snowfall_speed"
						value="<?php echo esc_attr( $snowfall['speed'] ?? 1.2 ); ?>"
						min="0.3" max="5" step="0.1">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_snowfall_opacity"><?php esc_html_e( 'Opacity', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" name="init_plugin_suite_fx_engine_snowfall[opacity]" id="init_fx_snowfall_opacity"
						value="<?php echo esc_attr( $snowfall['opacity'] ?? 0.6 ); ?>"
						min="0.1" max="1" step="0.1">
				</td>
			</tr>
		</table>

		<?php // ===== SEASONAL EFFECTS ===== ?>
		<?php init_plugin_suite_fx_engine_render_seasonal_settings( $seasonal ); ?>

		<?php // ===== GRAYSCALE ===== ?>
		<h2><?php esc_html_e( 'Grayscale (Turn off full page color)', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Turn the whole site black and white, for solemn occasions or national mourning.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">
					<label for="init_fx_grayscale_enabled"><?php esc_html_e( 'Enable', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_grayscale[enabled]" id="init_fx_grayscale_enabled" value="1" <?php checked( $grayscale['enabled'] ?? false ); ?>>
						<?php esc_html_e( 'Enable grayscale effect on site', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Schedule', 'init-fx-engine' ); ?></th>
				<td>
					<fieldset>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="always" <?php checked( $grayscale['mode'] ?? 'always', 'always' ); ?>>
							<?php esc_html_e( 'Always on', 'init-fx-engine' ); ?>
						</label>
						<br>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="custom" <?php checked( $grayscale['mode'] ?? 'off', 'custom' ); ?>>
							<?php esc_html_e( 'Custom schedule', 'init-fx-engine' ); ?>
						</label>
					</fieldset>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Custom dates', 'init-fx-engine' ); ?></th>
				<td>
					<label><?php esc_html_e( 'Start Date', 'init-fx-engine' ); ?>:
						<input type="date" name="init_plugin_suite_fx_engine_grayscale[custom_start]" value="<?php echo esc_attr( $grayscale['custom_start'] ?? '' ); ?>">
					</label>
					&nbsp;
					<label><?php esc_html_e( 'End Date', 'init-fx-engine' ); ?>:
						<input type="date" name="init_plugin_suite_fx_engine_grayscale[custom_end]" value="<?php echo esc_attr( $grayscale['custom_end'] ?? '' ); ?>">
					</label>
					<p class="description"><?php esc_html_e( 'Only used with the custom schedule.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
		</table>

		<?php // ===== INLINE FORMATTING ===== ?>
		<h2><?php esc_html_e( 'Inline Formatting', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'When enabled, the engine will parse simple inline markup in outputs.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">
					<label for="init_fx_inlinefmt_enabled"><?php esc_html_e( 'Enable', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_inlinefmt[enabled]" id="init_fx_inlinefmt_enabled" value="1" <?php checked( $inlinefmt['enabled'] ?? true ); ?>>
						<?php esc_html_e( 'Apply inline formatting in text', 'init-fx-engine' ); ?>
					</label>
					<p class="description">
						<?php esc_html_e( 'Supported: *bold*, `italic`, ~strike~, ^mark^, _highlight_, ||spoiler||', 'init-fx-engine' ); ?>
					</p>
				</td>
			</tr>
		</table>

		<?php submit_button(); ?>
	</form>
</div>
