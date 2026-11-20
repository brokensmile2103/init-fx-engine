<?php
/**
 * Dynamic render for the init-fx-engine/fx-trigger block.
 *
 * $attributes, $content, $block are injected by WordPress when using "render" in block.json.
 *
 * @package Init_FX_Engine
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Block render template, variables are scoped to the render callback.

$atts = array(
	'text'  => isset( $attributes['text'] ) ? (string) $attributes['text'] : '',
	'fx'    => isset( $attributes['fx'] ) ? (string) $attributes['fx'] : '',
	'emoji' => isset( $attributes['emoji'] ) ? (string) $attributes['emoji'] : '',
	'shoot' => isset( $attributes['shoot'] ) ? (string) $attributes['shoot'] : 'click',
	'tag'   => isset( $attributes['tag'] ) ? (string) $attributes['tag'] : 'a',
);

// initfxen_render_fx_shortcode() renders the exact same markup as [initfxen-fx],
// escapes everything internally and enqueues the FX engine — no wrapper is added
// here so the block's frontend output is byte-for-byte identical to the shortcode's.
echo initfxen_render_fx_shortcode( $atts, null, 'initfxen-fx' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped inside the shortcode function.
