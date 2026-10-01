<?php
/**
 * Settings UI for the Seasonal Effects module.
 *
 * Tách riêng thành hàm để mọi biến đều là biến cục bộ (không rò ra global scope).
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render the "Seasonal Effects" section of the settings page (h2 + description + form table).
 *
 * @param array $seasonal Saved Seasonal settings (merged with defaults).
 * @return void
 */
function init_plugin_suite_fx_engine_render_seasonal_settings( $seasonal ) {
	$seasonal    = wp_parse_args( is_array( $seasonal ) ? $seasonal : array(), init_plugin_suite_fx_engine_seasonal_defaults() );
	$themes      = init_plugin_suite_fx_engine_seasonal_themes();
	$today       = current_time( 'Y-m-d' );
	$upcoming    = array_slice( init_plugin_suite_fx_engine_seasonal_upcoming( $today ), 0, 6 );
	$running     = ! empty( $seasonal['enabled'] ) ? init_plugin_suite_fx_engine_resolve_seasonal_theme( $seasonal, $today ) : '';
	$date_format = get_option( 'date_format' );
	$utc         = new DateTimeZone( 'UTC' );
	$field       = 'init_plugin_suite_fx_engine_seasonal';
	?>
	<div id="init-fx-seasonal" class="fx-seasonal-settings">
		<h2><?php esc_html_e( 'Seasonal Effects', 'init-fx-engine' ); ?></h2>
		<p class="description">
			<?php esc_html_e( 'Holiday scenes floating over your site: Halloween bats, Tết blossoms and lucky money, Mid-Autumn lanterns, New Year fireworks and more.', 'init-fx-engine' ); ?>
		</p>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_enabled"><?php esc_html_e( 'Enable', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[enabled]" id="init_fx_seasonal_enabled" value="1" <?php checked( ! empty( $seasonal['enabled'] ) ); ?>>
						<?php esc_html_e( 'Enable seasonal effects on site', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_theme"><?php esc_html_e( 'Theme', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<select name="<?php echo esc_attr( $field ); ?>[theme]" id="init_fx_seasonal_theme" class="fx-seasonal-theme">
						<option value="auto" <?php selected( $seasonal['theme'], 'auto' ); ?>><?php esc_html_e( 'Auto (follow the holiday calendar)', 'init-fx-engine' ); ?></option>
						<?php foreach ( $themes as $slug => $definition ) : ?>
							<option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $seasonal['theme'], $slug ); ?>>
								<?php echo esc_html( ( $definition['label'] ?? $slug ) . ' ' . implode( '', array_slice( (array) ( $definition['items'] ?? array() ), 0, 3 ) ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<button type="button" class="button fx-seasonal-preview-btn"><?php esc_html_e( 'Preview', 'init-fx-engine' ); ?></button>
					<p class="description"><?php esc_html_e( 'Preview uses the values currently in the form, no need to save first.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Schedule', 'init-fx-engine' ); ?></th>
				<td>
					<fieldset>
						<label>
							<input type="radio" name="<?php echo esc_attr( $field ); ?>[mode]" value="auto" <?php checked( $seasonal['mode'], 'auto' ); ?>>
							<?php esc_html_e( 'Built-in holiday calendar', 'init-fx-engine' ); ?>
						</label>
						<br>
						<label>
							<input type="radio" name="<?php echo esc_attr( $field ); ?>[mode]" value="custom" <?php checked( $seasonal['mode'], 'custom' ); ?>>
							<?php esc_html_e( 'Custom schedule', 'init-fx-engine' ); ?>
						</label>
						<br>
						<label>
							<input type="radio" name="<?php echo esc_attr( $field ); ?>[mode]" value="always" <?php checked( $seasonal['mode'], 'always' ); ?>>
							<?php esc_html_e( 'Always on (useful for testing)', 'init-fx-engine' ); ?>
						</label>
					</fieldset>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Custom dates', 'init-fx-engine' ); ?></th>
				<td>
					<label><?php esc_html_e( 'Start Date', 'init-fx-engine' ); ?>:
						<input type="date" name="<?php echo esc_attr( $field ); ?>[custom_start]" value="<?php echo esc_attr( $seasonal['custom_start'] ); ?>">
					</label>
					&nbsp;
					<label><?php esc_html_e( 'End Date', 'init-fx-engine' ); ?>:
						<input type="date" name="<?php echo esc_attr( $field ); ?>[custom_end]" value="<?php echo esc_attr( $seasonal['custom_end'] ); ?>">
					</label>
					<p class="description"><?php esc_html_e( 'Only used with the custom schedule.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Holiday calendar', 'init-fx-engine' ); ?></th>
				<td>
					<?php if ( $running ) : ?>
						<p style="margin: 0 0 1em;">
							<strong>
								<?php
								echo esc_html(
									sprintf(
										/* translators: %s: holiday theme name. */
										__( 'Today visitors will see: %s', 'init-fx-engine' ),
										$themes[ $running ]['label'] ?? $running
									)
								);
								?>
							</strong>
						</p>
					<?php elseif ( ! empty( $seasonal['enabled'] ) ) : ?>
						<p style="margin: 0 0 1em;"><?php esc_html_e( 'No seasonal effect is scheduled for today.', 'init-fx-engine' ); ?></p>
					<?php endif; ?>

					<?php if ( ! empty( $upcoming ) ) : ?>
						<ul style="margin: 0;">
							<?php
							foreach ( $upcoming as $window ) :
								$start_dt = DateTimeImmutable::createFromFormat( '!Y-m-d', $window['start'], $utc );
								$end_dt   = DateTimeImmutable::createFromFormat( '!Y-m-d', $window['end'], $utc );

								if ( ! $start_dt || ! $end_dt ) {
									continue;
								}
								?>
								<li>
									<?php
									echo esc_html(
										sprintf(
											/* translators: 1: holiday name, 2: start date, 3: end date. */
											__( '%1$s: %2$s – %3$s', 'init-fx-engine' ),
											$themes[ $window['theme'] ]['label'] ?? $window['theme'],
											wp_date( $date_format, $start_dt->getTimestamp(), $utc ),
											wp_date( $date_format, $end_dt->getTimestamp(), $utc )
										)
									);
									?>
									<?php if ( $window['start'] <= $today ) : ?>
										<em>(<?php esc_html_e( 'happening now', 'init-fx-engine' ); ?>)</em>
									<?php endif; ?>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_homepage_only"><?php esc_html_e( 'Homepage only', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[homepage_only]" id="init_fx_seasonal_homepage_only" value="1" <?php checked( ! empty( $seasonal['homepage_only'] ) ); ?>>
						<?php esc_html_e( 'Show seasonal effects on homepage only', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_greeting"><?php esc_html_e( 'Greeting effect', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[greeting]" id="init_fx_seasonal_greeting" value="1" <?php checked( ! empty( $seasonal['greeting'] ) ); ?>>
						<?php esc_html_e( 'Play a themed greeting effect once per visit (e.g. fireworks show on New Year, lucky money on Tết)', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_reduced_motion"><?php esc_html_e( 'Accessibility', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<label>
						<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[reduced_motion]" id="init_fx_seasonal_reduced_motion" value="1" <?php checked( ! empty( $seasonal['reduced_motion'] ) ); ?>>
						<?php esc_html_e( 'Respect the visitor\'s "reduce motion" system setting', 'init-fx-engine' ); ?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_emojis"><?php esc_html_e( 'Custom emojis', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="text" class="regular-text fx-seasonal-emojis" name="<?php echo esc_attr( $field ); ?>[emojis]" id="init_fx_seasonal_emojis"
						value="<?php echo esc_attr( $seasonal['emojis'] ); ?>" placeholder="🎃, 👻, 🦇">
					<p class="description"><?php esc_html_e( 'Optional. Comma-separated, up to 12 emojis. Leave empty to use the theme\'s own emojis.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_amount"><?php esc_html_e( 'Amount', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" class="fx-seasonal-amount" name="<?php echo esc_attr( $field ); ?>[amount]" id="init_fx_seasonal_amount"
						value="<?php echo esc_attr( $seasonal['amount'] ); ?>" min="5" max="100" step="1">
					<p class="description"><?php esc_html_e( 'Recommended: 20–40. Automatically reduced on small screens.', 'init-fx-engine' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_size"><?php esc_html_e( 'Size (px)', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" class="fx-seasonal-size" name="<?php echo esc_attr( $field ); ?>[size]" id="init_fx_seasonal_size"
						value="<?php echo esc_attr( $seasonal['size'] ); ?>" min="12" max="64" step="1">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_speed"><?php esc_html_e( 'Speed', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" class="fx-seasonal-speed" name="<?php echo esc_attr( $field ); ?>[speed]" id="init_fx_seasonal_speed"
						value="<?php echo esc_attr( $seasonal['speed'] ); ?>" min="0.3" max="3" step="0.1">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="init_fx_seasonal_opacity"><?php esc_html_e( 'Opacity', 'init-fx-engine' ); ?></label>
				</th>
				<td>
					<input type="number" class="fx-seasonal-opacity" name="<?php echo esc_attr( $field ); ?>[opacity]" id="init_fx_seasonal_opacity"
						value="<?php echo esc_attr( $seasonal['opacity'] ); ?>" min="0.2" max="1" step="0.1">
				</td>
			</tr>
		</table>
	</div>
	<?php
}
