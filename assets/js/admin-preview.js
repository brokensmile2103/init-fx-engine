/**
 * Init FX Engine — settings page live previews.
 */
( function ( window, document ) {
	'use strict';

	function ready( fn ) {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', fn );
		} else {
			fn();
		}
	}

	function valueOf( box, selector ) {
		var input = box.querySelector( selector );
		if ( ! input ) {
			return '';
		}
		return input.type === 'checkbox' ? input.checked : input.value;
	}

	ready( function () {
		var fx = window.INIT_FX || {};

		// ---------------------------------------------------------------
		// Keyword effects
		// ---------------------------------------------------------------
		document.querySelectorAll( '.fx-preview-btn' ).forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				var effect = btn.dataset.effect;
				var input = btn.closest( 'td' ).querySelector( 'input' );
				var emoji;

				if ( effect === 'emojiRain' && input && input.value ) {
					var firstPair = input.value.split( ',' ).map( function ( s ) {
						return s.trim();
					} ).find( function ( pair ) {
						return pair.indexOf( ':' ) !== -1;
					} );
					if ( firstPair ) {
						emoji = firstPair.split( ':' ).slice( 1 ).join( ':' ).trim() || undefined;
					}
				}

				if ( typeof window.runEffect === 'function' ) {
					window.runEffect( effect, emoji );
				}
			} );
		} );

		// ---------------------------------------------------------------
		// Snowfall
		// ---------------------------------------------------------------
		var snowBtn = document.querySelector( '.fx-snowfall-preview-btn' );
		if ( snowBtn ) {
			snowBtn.addEventListener( 'click', function () {
				var box = snowBtn.closest( '.fx-snowfall-settings' ) || document;
				if ( ! window.initFxSnowfall ) {
					return;
				}
				if ( window.initFxSeasonal ) {
					window.initFxSeasonal.stop();
				}
				window.initFxSnowfall.preview( {
					amount: valueOf( box, '.fx-snowfall-amount' ),
					size: valueOf( box, '.fx-snowfall-size' ),
					speed: valueOf( box, '.fx-snowfall-speed' ),
					opacity: valueOf( box, '.fx-snowfall-opacity' ),
					style: valueOf( box, '.fx-snowfall-style' ),
					wind: valueOf( box, '.fx-snowfall-wind' ),
				}, 8000 );
			} );
		}

		// ---------------------------------------------------------------
		// Seasonal effects — dùng giá trị đang nhập trong form (chưa cần lưu).
		// ---------------------------------------------------------------
		var seasonalBtn = document.querySelector( '.fx-seasonal-preview-btn' );
		if ( seasonalBtn ) {
			seasonalBtn.addEventListener( 'click', function () {
				var box = seasonalBtn.closest( '.fx-seasonal-settings' ) || document;
				var themes = fx.seasonalThemes || {};
				var theme = valueOf( box, '.fx-seasonal-theme' ) || 'auto';

				if ( theme === 'auto' ) {
					theme = fx.seasonalAutoTheme || Object.keys( themes )[ 0 ];
				}

				var definition = themes[ theme ];
				if ( ! definition || ! window.initFxSeasonal ) {
					return;
				}

				if ( window.initFxSnowfall ) {
					window.initFxSnowfall.stop();
				}

				var custom = String( valueOf( box, '.fx-seasonal-emojis' ) ).split( ',' ).map( function ( s ) {
					return s.trim();
				} ).filter( Boolean ).slice( 0, 12 );

				window.initFxSeasonal.preview( {
					theme: theme,
					items: custom.length ? custom : definition.items,
					customItems: custom.length > 0,
					motion: definition.motion,
					glow: definition.glow,
					greeting: valueOf( box, '.fx-seasonal-greeting' ) ? definition.greeting : '',
					amount: valueOf( box, '.fx-seasonal-amount' ),
					size: valueOf( box, '.fx-seasonal-size' ),
					speed: valueOf( box, '.fx-seasonal-speed' ),
					opacity: valueOf( box, '.fx-seasonal-opacity' ),
					decor: valueOf( box, '.fx-seasonal-decor' ),
					interactive: valueOf( box, '.fx-seasonal-interactive' ),
				}, 10000 );
			} );
		}

		// ---------------------------------------------------------------
		// Particle backgrounds — trình tạo shortcode + xem trước trực tiếp.
		// ---------------------------------------------------------------
		var ambientBox = document.querySelector( '.fx-ambient-settings' );
		if ( ambientBox ) {
			var preview = ambientBox.querySelector( '.fx-ambient-preview' );
			var output = ambientBox.querySelector( '.fx-ambient-code' );
			var copyBtn = ambientBox.querySelector( '.fx-ambient-copy' );
			var fields = ambientBox.querySelectorAll( '.fx-ambient-field' );
			var layer = null;
			var timer = 0;

			var update = function () {
				var config = {};
				var parts = [ '[initfxen-fx-ambient' ];

				fields.forEach( function ( field ) {
					var key = field.dataset.key;
					var value = String( field.value || '' ).trim().replace( /"/g, '' );
					if ( value === '' ) {
						return;
					}
					parts.push( key + '="' + value + '"' );
					config[ key === 'ambient' ? 'preset' : key ] = ( key === 'amount' || key === 'speed' ) ? Number( value ) : value;
				} );

				output.value = parts.join( ' ' ) + ']';

				if ( ! preview || ! window.initFxAmbient ) {
					return;
				}
				if ( ! layer ) {
					layer = document.createElement( 'div' );
					layer.style.cssText = 'position:absolute;inset:0;';
					preview.appendChild( layer );
				}
				window.initFxAmbient.mount( layer, config ).catch( function () {} );
			};

			fields.forEach( function ( field ) {
				field.addEventListener( 'input', function () {
					window.clearTimeout( timer );
					timer = window.setTimeout( update, 250 );
				} );
				field.addEventListener( 'change', update );
			} );

			if ( copyBtn ) {
				copyBtn.addEventListener( 'click', function () {
					var label = copyBtn.textContent;
					var done = function () {
						copyBtn.textContent = ( fx.adminI18n && fx.adminI18n.copied ) || label;
						window.setTimeout( function () {
							copyBtn.textContent = label;
						}, 1500 );
					};
					if ( window.navigator.clipboard ) {
						window.navigator.clipboard.writeText( output.value ).then( done, function () {
							output.select();
						} );
					} else {
						output.select();
					}
				} );
			}

			update();
		}
	} );
}( window, document ) );
