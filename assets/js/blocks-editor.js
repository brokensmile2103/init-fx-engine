/**
 * Init FX Engine — Block Editor integration.
 *
 * Viết bằng vanilla JS (không JSX, không build step) để deploy trực tiếp lên
 * SVN của WordPress.org mà không cần Node/webpack.
 *
 * - FX Trigger: ServerSideRender để xem trước, render.php dùng lại 100% logic shortcode.
 * - FX Ambient Section: section chứa block con (InnerBlocks), nền hạt tsParticles được xem
 *   trước trực tiếp trong editor qua window.initFxAmbient.mount().
 */
( function ( wp, window ) {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useRef = wp.element.useRef;
	var useEffect = wp.element.useEffect;
	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var blockEditor = wp.blockEditor;
	var InspectorControls = blockEditor.InspectorControls;
	var useBlockProps = blockEditor.useBlockProps;
	var useInnerBlocksProps = blockEditor.useInnerBlocksProps;
	var InnerBlocks = blockEditor.InnerBlocks;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var SelectControl = wp.components.SelectControl;
	var RangeControl = wp.components.RangeControl;
	var ToggleControl = wp.components.ToggleControl;
	var ServerSideRender = wp.serverSideRender;

	var FX_OPTIONS = [
		{ label: __( 'Firework', 'init-fx-engine' ), value: 'firework' },
		{ label: __( 'Starlight Burst', 'init-fx-engine' ), value: 'starlightBurst' },
		{ label: __( 'Emoji Rain', 'init-fx-engine' ), value: 'emojiRain' },
		{ label: __( 'Cannon Blast', 'init-fx-engine' ), value: 'cannonBlast' },
		{ label: __( 'Heart Rain', 'init-fx-engine' ), value: 'heartRain' },
		{ label: __( 'School Pride', 'init-fx-engine' ), value: 'schoolPride' },
		{ label: __( 'Celebration Burst', 'init-fx-engine' ), value: 'celebrationBurst' },
		{ label: __( 'Halloween Burst', 'init-fx-engine' ), value: 'halloweenBurst' },
		{ label: __( 'Lucky Money (Tết)', 'init-fx-engine' ), value: 'luckyMoney' },
		{ label: __( 'Blossom Rain (Tết)', 'init-fx-engine' ), value: 'blossomRain' },
		{ label: __( 'Fireworks Show', 'init-fx-engine' ), value: 'fireworksShow' },
		{ label: __( 'Snow Burst', 'init-fx-engine' ), value: 'snowBurst' },
		{ label: __( 'Lantern Rise', 'init-fx-engine' ), value: 'lanternRise' },
	];

	var TRIGGER_OPTIONS = [
		{ label: __( 'Click', 'init-fx-engine' ), value: 'click' },
		{ label: __( 'Hover', 'init-fx-engine' ), value: 'hover' },
		{ label: __( 'When scrolled into view', 'init-fx-engine' ), value: 'in-view' },
		{ label: __( 'Immediately on page load', 'init-fx-engine' ), value: 'immediate' },
	];

	var TAG_OPTIONS = [ 'a', 'button', 'span', 'div', 'p', 'strong', 'em', 'b', 'i', 'mark', 'small', 'h2', 'h3', 'h4', 'h5', 'h6' ].map( function ( tag ) {
		return { label: tag, value: tag };
	} );

	var PRESET_OPTIONS = [
		{ label: __( 'Twinkling stars', 'init-fx-engine' ), value: 'stars' },
		{ label: __( 'Gentle snow', 'init-fx-engine' ), value: 'snow' },
		{ label: __( 'Rising bubbles', 'init-fx-engine' ), value: 'bubbles' },
		{ label: __( 'Fireflies', 'init-fx-engine' ), value: 'fireflies' },
		{ label: __( 'Network links', 'init-fx-engine' ), value: 'links' },
		{ label: __( 'Floating emoji', 'init-fx-engine' ), value: 'emoji' },
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
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { text: value } );
							},
						} ),
						el( SelectControl, {
							label: __( 'Effect', 'init-fx-engine' ),
							value: attributes.fx,
							options: FX_OPTIONS,
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { fx: value } );
							},
						} ),
						'emojiRain' === attributes.fx
							? el( TextControl, {
								label: __( 'Emoji (for Emoji Rain)', 'init-fx-engine' ),
								value: attributes.emoji,
								placeholder: '😂',
								__nextHasNoMarginBottom: true,
								onChange: function ( value ) {
									setAttributes( { emoji: value } );
								},
							} )
							: null,
						el( SelectControl, {
							label: __( 'Trigger On', 'init-fx-engine' ),
							value: attributes.shoot,
							options: TRIGGER_OPTIONS,
							__nextHasNoMarginBottom: true,
							help: ( 'in-view' === attributes.shoot || 'immediate' === attributes.shoot )
								? __( 'The text is optional for this trigger.', 'init-fx-engine' )
								: undefined,
							onChange: function ( value ) {
								setAttributes( { shoot: value } );
							},
						} ),
						el( SelectControl, {
							label: __( 'HTML Tag', 'init-fx-engine' ),
							value: attributes.tag,
							options: TAG_OPTIONS,
							__nextHasNoMarginBottom: true,
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

	// ---------------------------------------------------------------------
	// init-fx-engine/fx-ambient
	// ---------------------------------------------------------------------
	function AmbientPreview( props ) {
		var ref = useRef( null );
		var config = props.config;
		var key = JSON.stringify( config );

		useEffect( function () {
			var node = ref.current;
			var timer;
			// Editor chạy trong iframe → phải dùng bản fx-ambient.js nạp TRONG iframe (cùng document),
			// nếu không tsParticles sẽ tạo canvas ở trang cha.
			var view = node && node.ownerDocument && node.ownerDocument.defaultView;
			var api = view && view.initFxAmbient;
			if ( ! api ) {
				return undefined;
			}
			// Đợi người dùng ngừng gõ một chút rồi mới dựng lại nền hạt.
			timer = window.setTimeout( function () {
				api.mount( node, config ).catch( function () {} );
			}, 200 );
			return function () {
				window.clearTimeout( timer );
				if ( node.__fxAmbient ) {
					try {
						node.__fxAmbient.destroy();
					} catch ( e ) {}
					node.__fxAmbient = null;
				}
			};
		}, [ key ] ); // eslint-disable-line react-hooks/exhaustive-deps

		return el( 'div', {
			ref: ref,
			className: 'init-fx-ambient init-fx-ambient--section',
			'aria-hidden': 'true',
			style: { position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' },
		} );
	}

	registerBlockType( 'init-fx-engine/fx-ambient', {
		// Khai báo template ở cấp block type (cách mới từ WP 7.2, thay cho prop template của InnerBlocks).
		template: [
			[ 'core/heading', { style: { typography: { textAlign: 'center' } }, placeholder: __( 'Your headline…', 'init-fx-engine' ) } ],
			[ 'core/paragraph', { style: { typography: { textAlign: 'center' } }, placeholder: __( 'Add any blocks on top of the animated background.', 'init-fx-engine' ) } ],
		],
		edit: function ( props ) {
			var a = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'init-fx-ambient-section',
				style: { position: 'relative', overflow: 'hidden' },
			} );
			var innerBlocksProps = useInnerBlocksProps(
				{ className: 'init-fx-ambient-section__content', style: { position: 'relative', zIndex: 1 } }
			);

			var config = {
				preset: a.preset,
				color: a.color,
				amount: a.amount || undefined,
				speed: a.speed || undefined,
				emoji: a.emoji,
				hover: a.hover,
				click: a.click,
				lines: a.lines,
			};

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Particle Background', 'init-fx-engine' ), initialOpen: true },
						el( SelectControl, {
							label: __( 'Preset', 'init-fx-engine' ),
							value: a.preset,
							options: PRESET_OPTIONS,
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { preset: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Particle color', 'init-fx-engine' ),
							value: a.color,
							placeholder: '#ffffff',
							help: __( 'Leave empty to use the preset color.', 'init-fx-engine' ),
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { color: value } );
							},
						} ),
						'emoji' === a.preset
							? el( TextControl, {
								label: __( 'Emojis', 'init-fx-engine' ),
								value: a.emoji,
								placeholder: '✨, 🎈, 💖',
								__nextHasNoMarginBottom: true,
								onChange: function ( value ) {
									setAttributes( { emoji: value } );
								},
							} )
							: null,
						'links' === a.preset
							? el( ToggleControl, {
								label: __( 'Connect particles with lines', 'init-fx-engine' ),
								checked: !! a.lines,
								__nextHasNoMarginBottom: true,
								onChange: function ( value ) {
									setAttributes( { lines: value } );
								},
							} )
							: null,
						el( RangeControl, {
							label: __( 'Amount (0 = preset default)', 'init-fx-engine' ),
							value: a.amount,
							min: 0,
							max: 300,
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { amount: value || 0 } );
							},
						} ),
						el( RangeControl, {
							label: __( 'Speed (0 = preset default)', 'init-fx-engine' ),
							value: a.speed,
							min: 0,
							max: 10,
							step: 0.1,
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { speed: value || 0 } );
							},
						} ),
						el( SelectControl, {
							label: __( 'On hover', 'init-fx-engine' ),
							value: a.hover,
							options: [
								{ label: __( 'Preset default', 'init-fx-engine' ), value: '' },
								{ label: __( 'Nothing', 'init-fx-engine' ), value: 'none' },
								{ label: __( 'Repulse', 'init-fx-engine' ), value: 'repulse' },
								{ label: __( 'Grab', 'init-fx-engine' ), value: 'grab' },
								{ label: __( 'Bubble', 'init-fx-engine' ), value: 'bubble' },
							],
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { hover: value } );
							},
						} ),
						el( SelectControl, {
							label: __( 'On click', 'init-fx-engine' ),
							value: a.click,
							options: [
								{ label: __( 'Preset default', 'init-fx-engine' ), value: '' },
								{ label: __( 'Nothing', 'init-fx-engine' ), value: 'none' },
								{ label: __( 'Add particles', 'init-fx-engine' ), value: 'push' },
								{ label: __( 'Remove particles', 'init-fx-engine' ), value: 'remove' },
							],
							__nextHasNoMarginBottom: true,
							onChange: function ( value ) {
								setAttributes( { click: value } );
							},
						} )
					)
				),
				el(
					'div',
					blockProps,
					el( AmbientPreview, { config: config } ),
					el( 'div', innerBlocksProps )
				)
			);
		},
		save: function () {
			return el( InnerBlocks.Content );
		},
	} );
}( window.wp, window ) );
