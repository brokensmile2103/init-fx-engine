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
 * Render the "Seasonal Effects" row of the settings table.
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
	<tr id="init-fx-seasonal">
		<th scope="row"><?php esc_html_e( 'Seasonal Effects', 'init-fx-engine' ); ?></th>
		<td class="fx-seasonal-settings">
			<p class="description" style="margin-top: 0;">
				<?php esc_html_e( 'Holiday scenes floating over your site: Halloween bats, Tết blossoms and lucky money, Mid-Autumn lanterns, New Year fireworks and more.', 'init-fx-engine' ); ?>
			</p>
			<br>
			<label>
				<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[enabled]" value="1" <?php checked( ! empty( $seasonal['enabled'] ) ); ?>>
				<?php esc_html_e( 'Enable seasonal effects on site', 'init-fx-engine' ); ?>
			</label>
			<br><br>
			<label>
				<?php esc_html_e( 'Theme', 'init-fx-engine' ); ?>:
				<select name="<?php echo esc_attr( $field ); ?>[theme]" class="fx-seasonal-theme">
					<option value="auto" <?php selected( $seasonal['theme'], 'auto' ); ?>><?php esc_html_e( 'Auto (follow the holiday calendar)', 'init-fx-engine' ); ?></option>
					<?php foreach ( $themes as $slug => $definition ) : ?>
						<option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $seasonal['theme'], $slug ); ?>>
							<?php echo esc_html( ( $definition['label'] ?? $slug ) . ' ' . implode( '', array_slice( (array) ( $definition['items'] ?? array() ), 0, 3 ) ) ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			</label>
			<button type="button" class="button fx-seasonal-preview-btn"><?php esc_html_e( 'Preview', 'init-fx-engine' ); ?></button>
			<br><br>
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
			<div style="margin-top: 0.5em;">
				<label><?php esc_html_e( 'Start Date', 'init-fx-engine' ); ?>:
					<input type="date" name="<?php echo esc_attr( $field ); ?>[custom_start]" value="<?php echo esc_attr( $seasonal['custom_start'] ); ?>">
				</label>
				&nbsp;
				<label><?php esc_html_e( 'End Date', 'init-fx-engine' ); ?>:
					<input type="date" name="<?php echo esc_attr( $field ); ?>[custom_end]" value="<?php echo esc_attr( $seasonal['custom_end'] ); ?>">
				</label>
			</div>

			<?php if ( ! empty( $upcoming ) ) : ?>
				<p style="margin-bottom: 0.25em;"><strong><?php esc_html_e( 'Holiday calendar', 'init-fx-engine' ); ?></strong></p>
				<ul style="margin-top: 0;">
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

			<?php if ( $running ) : ?>
				<p>
					<?php
					echo esc_html(
						sprintf(
							/* translators: %s: holiday theme name. */
							__( 'Today visitors will see: %s', 'init-fx-engine' ),
							$themes[ $running ]['label'] ?? $running
						)
					);
					?>
				</p>
			<?php elseif ( ! empty( $seasonal['enabled'] ) ) : ?>
				<p><?php esc_html_e( 'No seasonal effect is scheduled for today.', 'init-fx-engine' ); ?></p>
			<?php endif; ?>

			<label>
				<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[homepage_only]" value="1" <?php checked( ! empty( $seasonal['homepage_only'] ) ); ?>>
				<?php esc_html_e( 'Show seasonal effects on homepage only', 'init-fx-engine' ); ?>
			</label>
			<br><br>
			<label>
				<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[greeting]" value="1" <?php checked( ! empty( $seasonal['greeting'] ) ); ?>>
				<?php esc_html_e( 'Play a themed greeting effect once per visit (e.g. fireworks show on New Year, lucky money on Tết)', 'init-fx-engine' ); ?>
			</label>
			<br><br>
			<label>
				<input type="checkbox" name="<?php echo esc_attr( $field ); ?>[reduced_motion]" value="1" <?php checked( ! empty( $seasonal['reduced_motion'] ) ); ?>>
				<?php esc_html_e( 'Respect the visitor\'s "reduce motion" system setting', 'init-fx-engine' ); ?>
			</label>
			<br><br>
			<label>
				<?php esc_html_e( 'Custom emojis', 'init-fx-engine' ); ?>:
				<input type="text" class="regular-text fx-seasonal-emojis" name="<?php echo esc_attr( $field ); ?>[emojis]"
					value="<?php echo esc_attr( $seasonal['emojis'] ); ?>" placeholder="🎃, 👻, 🦇">
			</label>
			<br>
			<small><?php esc_html_e( 'Optional. Comma-separated, up to 12 emojis. Leave empty to use the theme\'s own emojis.', 'init-fx-engine' ); ?></small>
			<br><br>
			<label>
				<?php esc_html_e( 'Amount', 'init-fx-engine' ); ?>:
				<input type="number" class="fx-seasonal-amount" name="<?php echo esc_attr( $field ); ?>[amount]"
					value="<?php echo esc_attr( $seasonal['amount'] ); ?>" min="5" max="100" step="1">
			</label>
			<small><?php esc_html_e( 'Recommended: 20–40. Automatically reduced on small screens.', 'init-fx-engine' ); ?></small>
			<br><br>
			<label>
				<?php esc_html_e( 'Size (px)', 'init-fx-engine' ); ?>:
				<input type="number" class="fx-seasonal-size" name="<?php echo esc_attr( $field ); ?>[size]"
					value="<?php echo esc_attr( $seasonal['size'] ); ?>" min="12" max="64" step="1">
			</label>
			<br><br>
			<label>
				<?php esc_html_e( 'Speed', 'init-fx-engine' ); ?>:
				<input type="number" class="fx-seasonal-speed" name="<?php echo esc_attr( $field ); ?>[speed]"
					value="<?php echo esc_attr( $seasonal['speed'] ); ?>" min="0.3" max="3" step="0.1">
			</label>
			<br><br>
			<label>
				<?php esc_html_e( 'Opacity', 'init-fx-engine' ); ?>:
				<input type="number" class="fx-seasonal-opacity" name="<?php echo esc_attr( $field ); ?>[opacity]"
					value="<?php echo esc_attr( $seasonal['opacity'] ); ?>" min="0.2" max="1" step="0.1">
			</label>
		</td>
	</tr>
	<?php
}
