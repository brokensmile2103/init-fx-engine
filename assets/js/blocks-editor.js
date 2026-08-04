/**
 * Init FX Engine — Block Editor integration.
 *
 * Viết bằng vanilla JS (không JSX, không build step) để deploy trực tiếp lên
 * SVN của WordPress.org mà không cần Node/webpack. Block dùng
 * ServerSideRender để xem trước, và PHP render.php tương ứng (đăng ký qua
 * "render" trong block.json) để xuất HTML — dùng lại 100% logic shortcode
 * đã có, không lặp lại code.
 */
( function ( wp ) {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var SelectControl = wp.components.SelectControl;
	var ServerSideRender = wp.serverSideRender;

	var FX_OPTIONS = [
		{ label: __( 'Firework', 'init-fx-engine' ), value: 'firework' },
		{ label: __( 'Starlight Burst', 'init-fx-engine' ), value: 'starlightBurst' },
		{ label: __( 'Emoji Rain', 'init-fx-engine' ), value: 'emojiRain' },
		{ label: __( 'Cannon Blast', 'init-fx-engine' ), value: 'cannonBlast' },
		{ label: __( 'Heart Rain', 'init-fx-engine' ), value: 'heartRain' },
		{ label: __( 'School Pride', 'init-fx-engine' ), value: 'schoolPride' },
		{ label: __( 'Celebration Burst', 'init-fx-engine' ), value: 'celebrationBurst' },
	];

	// ---------------------------------------------------------------------
	// init-fx-engine/fx-trigger
	// ---------------------------------------------------------------------
	registerBlockType( 'init-fx-engine/fx-trigger', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps();

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'FX Trigger Settings', 'init-fx-engine' ), initialOpen: true },
						el( TextControl, {
							label: __( 'Button/Link Text', 'init-fx-engine' ),
							value: attributes.text,
							onChange: function ( value ) {
								setAttributes( { text: value } );
							},
						} ),
						el( SelectControl, {
							label: __( 'Effect', 'init-fx-engine' ),
							value: attributes.fx,
							options: FX_OPTIONS,
							onChange: function ( value ) {
								setAttributes( { fx: value } );
							},
						} ),
						'emojiRain' === attributes.fx
							? el( TextControl, {
									label: __( 'Emoji (for Emoji Rain)', 'init-fx-engine' ),
									value: attributes.emoji,
									placeholder: '😂',
									onChange: function ( value ) {
										setAttributes( { emoji: value } );
									},
							  } )
							: null,
						el( SelectControl, {
							label: __( 'Trigger On', 'init-fx-engine' ),
							value: attributes.shoot,
							options: [
								{ label: __( 'Click', 'init-fx-engine' ), value: 'click' },
								{ label: __( 'Hover', 'init-fx-engine' ), value: 'hover' },
							],
							onChange: function ( value ) {
								setAttributes( { shoot: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'HTML Tag', 'init-fx-engine' ),
							value: attributes.tag,
							help: __( 'e.g. a, button, span', 'init-fx-engine' ),
							onChange: function ( value ) {
								setAttributes( { tag: value } );
							},
						} )
					)
				),
				el(
					'div',
					blockProps,
					el( ServerSideRender, {
						block: 'init-fx-engine/fx-trigger',
						attributes: attributes,
					} )
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )( window.wp );
