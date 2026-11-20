<?php
/**
 * Dynamic render for the init-fx-engine/fx-ambient block (section with a particle background).
 *
 * $attributes, $content, $block are injected by WordPress when using "render" in block.json.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Block render template, variables are scoped to the render callback.

$config = init_plugin_suite_fx_engine_ambient_config(
	array(
		'ambient' => isset( $attributes['preset'] ) ? (string) $attributes['preset'] : 'stars',
		'color'   => isset( $attributes['color'] ) ? (string) $attributes['color'] : '',
		'amount'  => isset( $attributes['amount'] ) ? (int) $attributes['amount'] : 0,
		'speed'   => ! empty( $attributes['speed'] ) ? (float) $attributes['speed'] : '',
		'emoji'   => isset( $attributes['emoji'] ) ? (string) $attributes['emoji'] : '',
		'hover'   => isset( $attributes['hover'] ) ? (string) $attributes['hover'] : '',
		'click'   => isset( $attributes['click'] ) ? (string) $attributes['click'] : '',
		'lines'   => ( ! isset( $attributes['lines'] ) || $attributes['lines'] ) ? 'true' : 'false',
	)
);

$layer = init_plugin_suite_fx_engine_ambient_layer(
	$config,
	'init-fx-ambient--section',
	'position:absolute;inset:0;z-index:0;pointer-events:none;'
);

$wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'init-fx-ambient-section',
		'style' => 'position:relative;overflow:hidden;',
	)
);

printf(
	'<div %1$s>%2$s<div class="init-fx-ambient-section__content" style="position:relative;z-index:1;">%3$s</div></div>',
	$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes().
	$layer, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped inside init_plugin_suite_fx_engine_ambient_layer().
	$content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks HTML, already rendered by WordPress.
);
