<?php
// Dynamic render cho block init-fx-engine/fx-trigger.
// $attributes, $content, $block được WordPress tự inject khi dùng "render" trong block.json.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$atts = [
    'text'  => isset( $attributes['text'] ) ? (string) $attributes['text'] : '',
    'fx'    => isset( $attributes['fx'] ) ? (string) $attributes['fx'] : '',
    'emoji' => isset( $attributes['emoji'] ) ? (string) $attributes['emoji'] : '',
    'shoot' => isset( $attributes['shoot'] ) ? (string) $attributes['shoot'] : 'click',
    'tag'   => isset( $attributes['tag'] ) ? (string) $attributes['tag'] : 'a',
];

// initfxen_render_fx_shortcode() renders the exact same markup as
// [initfxen-fx] and already escapes everything internally — no wrapper is
// added here so the block's frontend output is byte-for-byte identical to
// the shortcode's.
// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo initfxen_render_fx_shortcode( $atts, null, 'initfxen-fx' );
