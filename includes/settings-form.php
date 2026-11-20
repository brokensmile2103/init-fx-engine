<?php
/**
 * Settings page template — chia thành từng mục (h2 + mô tả + form-table).
 *
 * Được include bên trong init_plugin_suite_fx_engine_settings_page(), nên các
 * biến ở đây ($keywords, $snowfall, $grayscale, $preloader, $inlinefmt, $seasonal)
 * là biến cục bộ của hàm đó. Tên field giữ nguyên như các bản trước để không ảnh
 * hưởng dữ liệu đã lưu.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Template included inside init_plugin_suite_fx_engine_settings_page(), variables are function-local.

$fields = init_plugin_suite_fx_engine_keyword_effects();

$placeholders = array(
	'firework'         => __( 'e.g. congratulations, well done', 'init-fx-engine' ),
	'starlightBurst'   => __( 'e.g. superstar', 'init-fx-engine' ),
	'schoolPride'      => __( 'e.g. go team', 'init-fx-engine' ),
	'emojiRain'        => __( 'e.g. hahaha:😂, xoxo:💋', 'init-fx-engine' ),
	'heartRain'        => __( 'e.g. love you', 'init-fx-engine' ),
	'cannonBlast'      => __( 'e.g. happy birthday', 'init-fx-engine' ),
	'halloweenBurst'   => __( 'e.g. trick or treat', 'init-fx-engine' ),
	'luckyMoney'       => __( 'e.g. lucky money', 'init-fx-engine' ),
	'blossomRain'      => __( 'e.g. happy lunar new year', 'init-fx-engine' ),
	'fireworksShow'    => __( 'e.g. happy new year', 'init-fx-engine' ),
	'snowBurst'        => __( 'e.g. merry christmas', 'init-fx-engine' ),
	'lanternRise'      => __( 'e.g. mid-autumn', 'init-fx-engine' ),
	'celebrationBurst' => __( 'e.g. hooray', 'init-fx-engine' ),
);

$preloader_styles = array( 'dot', 'bar', 'logo', 'flower', 'spinner', 'emoji' );

$sections = array(
	'init-fx-preloader' => __( 'Preloader', 'init-fx-engine' ),
	'init-fx-keywords'  => __( 'Keyword Effects', 'init-fx-engine' ),
	'init-fx-snowfall'  => __( 'Snowfall', 'init-fx-engine' ),
	'init-fx-seasonal'  => __( 'Seasonal Effects', 'init-fx-engine' ),
	'init-fx-ambient'   => __( 'Particle Backgrounds', 'init-fx-engine' ),
	'init-fx-grayscale' => __( 'Grayscale', 'init-fx-engine' ),
	'init-fx-inlinefmt' => __( 'Inline Formatting', 'init-fx-engine' ),
);
?>

<div class="wrap init-fx-settings">
	<h1><?php esc_html_e( 'Init FX Engine Settings', 'init-fx-engine' ); ?></h1>

	<p class="init-fx-nav">
		<?php
		$init_fx_links = array();
		foreach ( $sections as $anchor => $section_title ) {
			$init_fx_links[] = sprintf( '<a href="#%s">%s</a>', esc_attr( $anchor ), esc_html( $section_title ) );
		}
		echo wp_kses_post( implode( ' | ', $init_fx_links ) );
		?>
	</p>

	<form method="post" action="options.php">
		<?php settings_fields( 'init_plugin_suite_fx_engine_settings_group' ); ?>

		<?php // ===== PRELOADER ===== ?>
		<h2 id="init-fx-preloader"><?php esc_html_e( 'Preloader (Loading screen)', 'init-fx-engine' ); ?></h2>
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
						<input type="checkbox" name="init_plugin_suite_fx_engine_preloader[enabled]" id="init_fx_preloader_enabled" value="1" <?php checked( ! empty( $preloader['enabled'] ) ); ?>>
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
							<option value="<?php echo esc_attr( $preloader_style ); ?>" <?php selected( $preloader['style'], $preloader_style ); ?>>
								<?php echo esc_html( ucwords( $preloader_style ) ); ?>
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
						value="<?php echo esc_attr( $preloader['bg'] ); ?>"
						placeholder="#ffffff, #ffe4ec">
					<p class="description"><?php esc_html_e( 'Use a single color or comma-separated values for gradient.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_preloader_session_once"><?php esc_html_e( 'Once per session', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="init_plugin_suite_fx_engine_preloader[session_once]" id="init_fx_preloader_session_once" value="1" <?php checked( ! empty( $preloader['session_once'] ) ); ?>>
						<?php esc_html_e( 'Only show on first visit in a session', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
		</table>

		<?php // ===== KEYWORD EFFECTS ===== ?>
		<h2 id="init-fx-keywords"><?php esc_html_e( 'Keyword Effects', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Comma-separated keywords that turn into clickable effect triggers inside your content and comments. Use the Preview button to try each effect.', 'init-fx-engine' ); ?>
			<br>
			<?php esc_html_e( 'The effect scripts are only loaded when at least one keyword is set, or on pages that contain an FX shortcode or block.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<?php foreach ( $fields as $key => $label ) : ?>
				<tr>
					<th scope="row">
						<label for="fx_engine_keywords_<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label>
						<?php if ( 'emojiRain' === $key ) : ?>
							<br><small><?php esc_html_e( 'Format: keyword:emoji, keyword:emoji', 'init-fx-engine' ); ?></small>
						<?php endif; ?>
					</th>
					<td>
						<input type="text" class="regular-text fx-keyword-input"
							id="fx_engine_keywords_<?php echo esc_attr( $key ); ?>"
							name="init_plugin_suite_fx_engine_keywords[<?php echo esc_attr( $key ); ?>]"
							value="<?php echo esc_attr( $keywords[ $key ] ?? '' ); ?>"
							placeholder="<?php echo esc_attr( $placeholders[ $key ] ?? '' ); ?>">
						<button type="button" class="button fx-preview-btn" data-effect="<?php echo esc_attr( $key ); ?>">
							<?php esc_html_e( 'Preview', 'init-fx-engine' ); ?>
						</button>
					</td>
				</tr>
			<?php endforeach; ?>
		</table>

		<?php // ===== SNOWFALL ===== ?>
		<div class="fx-snowfall-settings">
			<h2 id="init-fx-snowfall"><?php esc_html_e( 'Snowfall Effect', 'init-fx-engine' ); ?></h2>
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
							<input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[enabled]" id="init_fx_snowfall_enabled" value="1" <?php checked( ! empty( $snowfall['enabled'] ) ); ?>>
							<?php esc_html_e( 'Enable snowfall effect on site', 'init-fx-engine' ); ?>
						</label>
						<button type="button" class="button fx-snowfall-preview-btn"><?php esc_html_e( 'Preview', 'init-fx-engine' ); ?></button>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Schedule', 'init-fx-engine' ); ?></th>
					<td>
						<fieldset>
							<label>
								<input type="radio" name="init_plugin_suite_fx_engine_snowfall[mode]" value="auto" <?php checked( $snowfall['mode'], 'auto' ); ?>>
								<?php esc_html_e( 'Auto schedule (Dec 20 – Dec 31)', 'init-fx-engine' ); ?>
							</label>
							<br>
							<label>
								<input type="radio" name="init_plugin_suite_fx_engine_snowfall[mode]" value="custom" <?php checked( $snowfall['mode'], 'custom' ); ?>>
								<?php esc_html_e( 'Custom schedule', 'init-fx-engine' ); ?>
							</label>
						</fieldset>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Custom dates', 'init-fx-engine' ); ?></th>
					<td>
						<label><?php esc_html_e( 'Start Date', 'init-fx-engine' ); ?>:
							<input type="date" name="init_plugin_suite_fx_engine_snowfall[custom_start]" value="<?php echo esc_attr( $snowfall['custom_start'] ); ?>">
						</label>
						&nbsp;
						<label><?php esc_html_e( 'End Date', 'init-fx-engine' ); ?>:
							<input type="date" name="init_plugin_suite_fx_engine_snowfall[custom_end]" value="<?php echo esc_attr( $snowfall['custom_end'] ); ?>">
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
							<input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[homepage_only]" id="init_fx_snowfall_homepage_only" value="1" <?php checked( ! empty( $snowfall['homepage_only'] ) ); ?>>
							<?php esc_html_e( 'Show snowfall effect on homepage only', 'init-fx-engine' ); ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_style"><?php esc_html_e( 'Snow style', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<select name="init_plugin_suite_fx_engine_snowfall[style]" id="init_fx_snowfall_style" class="fx-snowfall-style">
							<option value="dots" <?php selected( $snowfall['style'], 'dots' ); ?>><?php esc_html_e( 'Soft dots (classic)', 'init-fx-engine' ); ?></option>
							<option value="flakes" <?php selected( $snowfall['style'], 'flakes' ); ?>><?php esc_html_e( 'Crystal snowflakes', 'init-fx-engine' ); ?></option>
							<option value="mixed" <?php selected( $snowfall['style'], 'mixed' ); ?>><?php esc_html_e( 'Mixed', 'init-fx-engine' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_amount"><?php esc_html_e( 'Snow amount', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<input type="number" name="init_plugin_suite_fx_engine_snowfall[amount]" id="init_fx_snowfall_amount" class="fx-snowfall-amount"
							value="<?php echo esc_attr( $snowfall['amount'] ); ?>"
							min="20" max="200" step="10">
						<p class="description"><?php esc_html_e( 'Recommended: 60–100', 'init-fx-engine' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_size"><?php esc_html_e( 'Snow size', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<input type="number" name="init_plugin_suite_fx_engine_snowfall[size]" id="init_fx_snowfall_size" class="fx-snowfall-size"
							value="<?php echo esc_attr( $snowfall['size'] ); ?>"
							min="1" max="10">
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_speed"><?php esc_html_e( 'Fall speed', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<input type="number" name="init_plugin_suite_fx_engine_snowfall[speed]" id="init_fx_snowfall_speed" class="fx-snowfall-speed"
							value="<?php echo esc_attr( $snowfall['speed'] ); ?>"
							min="0.3" max="5" step="0.1">
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_opacity"><?php esc_html_e( 'Opacity', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<input type="number" name="init_plugin_suite_fx_engine_snowfall[opacity]" id="init_fx_snowfall_opacity" class="fx-snowfall-opacity"
							value="<?php echo esc_attr( $snowfall['opacity'] ); ?>"
							min="0.1" max="1" step="0.1">
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_wind"><?php esc_html_e( 'Wind', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<label>
							<input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[wind]" id="init_fx_snowfall_wind" class="fx-snowfall-wind" value="1" <?php checked( ! empty( $snowfall['wind'] ) ); ?>>
							<?php esc_html_e( 'Gentle wind gusts that slowly change direction', 'init-fx-engine' ); ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="init_fx_snowfall_reduced_motion"><?php esc_html_e( 'Accessibility', 'init-fx-engine' ); ?></label>
					</th>
					<td>
						<label>
							<input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[reduced_motion]" id="init_fx_snowfall_reduced_motion" value="1" <?php checked( ! empty( $snowfall['reduced_motion'] ) ); ?>>
							<?php esc_html_e( 'Respect the visitor\'s "reduce motion" system setting', 'init-fx-engine' ); ?>
						</label>
					</td>
				</tr>
			</table>
		</div>

		<?php // ===== SEASONAL EFFECTS ===== ?>
		<?php init_plugin_suite_fx_engine_render_seasonal_settings( $seasonal ); ?>

		<?php // ===== PARTICLE BACKGROUNDS (shortcode generator, không lưu option) ===== ?>
		<div class="fx-ambient-settings">
			<h2 id="init-fx-ambient"><?php esc_html_e( 'Particle Backgrounds', 'init-fx-engine' ); ?></h2>
			<p class="description">
				<?php esc_html_e( 'Animated particle backgrounds powered by tsParticles. Add the "FX Ambient Section" block in the Block Editor, or build a shortcode below and paste it inside any section. Nothing here is saved — it is a live generator.', 'init-fx-engine' ); ?>
			</p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="init_fx_ambient_preset"><?php esc_html_e( 'Preset', 'init-fx-engine' ); ?></label></th>
					<td>
						<select id="init_fx_ambient_preset" class="fx-ambient-field" data-key="ambient">
							<?php foreach ( init_plugin_suite_fx_engine_ambient_presets() as $preset_slug => $preset_label ) : ?>
								<option value="<?php echo esc_attr( $preset_slug ); ?>"><?php echo esc_html( $preset_label ); ?></option>
							<?php endforeach; ?>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_color"><?php esc_html_e( 'Color', 'init-fx-engine' ); ?></label></th>
					<td>
						<input type="text" id="init_fx_ambient_color" class="fx-ambient-field" data-key="color" placeholder="#ffffff">
						<p class="description"><?php esc_html_e( 'Leave empty to use the preset color.', 'init-fx-engine' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_amount"><?php esc_html_e( 'Amount', 'init-fx-engine' ); ?></label></th>
					<td><input type="number" id="init_fx_ambient_amount" class="fx-ambient-field small-text" data-key="amount" min="5" max="300" placeholder="auto"></td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_speed"><?php esc_html_e( 'Speed', 'init-fx-engine' ); ?></label></th>
					<td><input type="number" id="init_fx_ambient_speed" class="fx-ambient-field small-text" data-key="speed" min="0.1" max="20" step="0.1" placeholder="auto"></td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_emoji"><?php esc_html_e( 'Emojis', 'init-fx-engine' ); ?></label></th>
					<td>
						<input type="text" id="init_fx_ambient_emoji" class="fx-ambient-field regular-text" data-key="emoji" placeholder="✨, 🎈, 💖">
						<p class="description"><?php esc_html_e( 'Only for the "Floating emoji" preset.', 'init-fx-engine' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_hover"><?php esc_html_e( 'On hover', 'init-fx-engine' ); ?></label></th>
					<td>
						<select id="init_fx_ambient_hover" class="fx-ambient-field" data-key="hover">
							<option value=""><?php esc_html_e( 'Preset default', 'init-fx-engine' ); ?></option>
							<option value="none"><?php esc_html_e( 'Nothing', 'init-fx-engine' ); ?></option>
							<option value="repulse"><?php esc_html_e( 'Repulse', 'init-fx-engine' ); ?></option>
							<option value="grab"><?php esc_html_e( 'Grab', 'init-fx-engine' ); ?></option>
							<option value="bubble"><?php esc_html_e( 'Bubble', 'init-fx-engine' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_click"><?php esc_html_e( 'On click', 'init-fx-engine' ); ?></label></th>
					<td>
						<select id="init_fx_ambient_click" class="fx-ambient-field" data-key="click">
							<option value=""><?php esc_html_e( 'Preset default', 'init-fx-engine' ); ?></option>
							<option value="none"><?php esc_html_e( 'Nothing', 'init-fx-engine' ); ?></option>
							<option value="push"><?php esc_html_e( 'Add particles', 'init-fx-engine' ); ?></option>
							<option value="remove"><?php esc_html_e( 'Remove particles', 'init-fx-engine' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Live preview', 'init-fx-engine' ); ?></th>
					<td>
						<div class="fx-ambient-preview" style="position:relative;max-width:640px;height:220px;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#0f172a,#1e3a5f);"></div>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="init_fx_ambient_code"><?php esc_html_e( 'Shortcode', 'init-fx-engine' ); ?></label></th>
					<td>
						<input type="text" id="init_fx_ambient_code" class="regular-text code fx-ambient-code" readonly value="[initfxen-fx-ambient ambient=&quot;links&quot;]">
						<button type="button" class="button fx-ambient-copy"><?php esc_html_e( 'Copy', 'init-fx-engine' ); ?></button>
						<p class="description"><?php esc_html_e( 'The parent element should have position: relative so the particles stay inside it.', 'init-fx-engine' ); ?></p>
					</td>
				</tr>
			</table>
		</div>

		<?php // ===== GRAYSCALE ===== ?>
		<h2 id="init-fx-grayscale"><?php esc_html_e( 'Grayscale (Turn off full page color)', 'init-fx-engine' ); ?></h2>
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
						<input type="checkbox" name="init_plugin_suite_fx_engine_grayscale[enabled]" id="init_fx_grayscale_enabled" value="1" <?php checked( ! empty( $grayscale['enabled'] ) ); ?>>
						<?php esc_html_e( 'Enable grayscale effect on site', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Schedule', 'init-fx-engine' ); ?></th>
				<td>
					<fieldset>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="always" <?php checked( $grayscale['mode'], 'always' ); ?>>
							<?php esc_html_e( 'Always on', 'init-fx-engine' ); ?>
						</label>
						<br>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="custom" <?php checked( $grayscale['mode'], 'custom' ); ?>>
							<?php esc_html_e( 'Custom schedule', 'init-fx-engine' ); ?>
						</label>
						<br>
						<label>
							<input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="off" <?php checked( $grayscale['mode'], 'off' ); ?>>
							<?php esc_html_e( 'Paused (keep settings, do not apply)', 'init-fx-engine' ); ?>
						</label>
					</fieldset>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Custom dates', 'init-fx-engine' ); ?></th>
				<td>
					<label><?php esc_html_e( 'Start Date', 'init-fx-engine' ); ?>:
						<input type="date" name="init_plugin_suite_fx_engine_grayscale[custom_start]" value="<?php echo esc_attr( $grayscale['custom_start'] ); ?>">
					</label>
					&nbsp;
					<label><?php esc_html_e( 'End Date', 'init-fx-engine' ); ?>:
						<input type="date" name="init_plugin_suite_fx_engine_grayscale[custom_end]" value="<?php echo esc_attr( $grayscale['custom_end'] ); ?>">
					</label>
					<p class="description"><?php esc_html_e( 'Only used with the custom schedule.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
		</table>

		<?php // ===== INLINE FORMATTING ===== ?>
		<h2 id="init-fx-inlinefmt"><?php esc_html_e( 'Inline Formatting', 'init-fx-engine' ); ?></h2>
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
						<input type="checkbox" name="init_plugin_suite_fx_engine_inlinefmt[enabled]" id="init_fx_inlinefmt_enabled" value="1" <?php checked( ! empty( $inlinefmt['enabled'] ) ); ?>>
						<?php esc_html_e( 'Apply inline formatting in text', 'init-fx-engine' ); ?>
					</label>
					<p class="description">
						<?php esc_html_e( 'Supported: *bold*, `italic`, ~strike~, ^mark^, _highlight_, ||spoiler||', 'init-fx-engine' ); ?>
					</p>
					<p class="description">
						<?php esc_html_e( 'Spoilers are blurred until clicked. Short spoilers hide the "Tap to reveal" label automatically.', 'init-fx-engine' ); ?>
					</p>
				</td>
			</tr>
		</table>

		<?php submit_button(); ?>
	</form>
</div>
