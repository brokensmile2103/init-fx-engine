/**
 * Init FX Engine — Ambient particle backgrounds (tsParticles).
 *
 * Dùng cho shortcode [initfxen-fx-ambient] và block "FX Ambient Section".
 * Mỗi lớp nền là <div class="init-fx-ambient" data-fx-ambient='{"preset":"stars",...}'>.
 *
 * - Chỉ khởi tạo khi lớp nền sắp lọt vào màn hình (IntersectionObserver) → trang dài
 *   có nhiều section cũng không tốn CPU cho phần chưa cuộn tới.
 * - tsParticles tự tạm dừng khi ra khỏi màn hình / tab ẩn.
 * - Tương tác hover/click được lắng nghe trên phần tử cha (section) → không chặn link/nút bên trong.
 *
 * API: window.initFxAmbient.mount( element, config ) → Promise<container> / presets()
 */
( function ( window, document ) {
	'use strict';

	if ( window.initFxAmbient ) {
		return;
	}

	var engineReady = null;

	function ready() {
		if ( ! engineReady ) {
			engineReady = ( window.tsParticles && typeof window.loadSlim === 'function' )
				? Promise.resolve( window.loadSlim( window.tsParticles ) ).then( function () {
					return window.tsParticles;
				} )
				: Promise.reject( new Error( 'tsParticles not available' ) );
		}
		return engineReady;
	}

	function pick( value, fallback ) {
		return value === undefined || value === null || value === '' ? fallback : value;
	}

	function fill( color, opacity ) {
		var f = { enable: true, color: { value: color } };
		if ( opacity !== undefined ) {
			f.opacity = opacity;
		}
		return { fill: f };
	}

	// ---------------------------------------------------------------------
	// Presets — mỗi preset trả về options tsParticles hoàn chỉnh.
	// ---------------------------------------------------------------------
	var PRESETS = {
		// Mạng lưới: giữ đúng giao diện shortcode cũ (particles.js) cho tương thích.
		links: function ( c ) {
			var color = pick( c.color, '#ffffff' );
			return {
				defaults: { hover: 'repulse', click: 'push' },
				particles: {
					number: { value: pick( c.amount, 80 ), density: { enable: true, width: 1000, height: 800 } },
					paint: fill( color ),
					shape: { type: 'circle' },
					opacity: { value: 0.5 },
					size: { value: { min: 1, max: 3 } },
					links: { enable: c.lines !== false, distance: 150, color: color, opacity: 0.4, width: 1 },
					move: { enable: true, speed: pick( c.speed, 3 ), direction: 'none', outModes: 'out' },
				},
			};
		},
		stars: function ( c ) {
			return {
				defaults: { hover: 'none', click: 'none' },
				particles: {
					number: { value: pick( c.amount, 260 ), density: { enable: true, width: 1000, height: 800 } },
					paint: fill( pick( c.color, '#fffbe6' ) ),
					shape: { type: [ 'circle', 'circle', 'star' ] },
					opacity: { value: { min: 0.1, max: 1 }, animation: { enable: true, speed: 0.8, sync: false } },
					size: { value: { min: 0.4, max: 2.2 } },
					move: { enable: true, speed: pick( c.speed, 0.15 ), direction: 'none', random: true, outModes: 'out' },
				},
			};
		},
		snow: function ( c ) {
			return {
				defaults: { hover: 'none', click: 'none' },
				particles: {
					number: { value: pick( c.amount, 200 ), density: { enable: true, width: 1000, height: 800 } },
					paint: fill( pick( c.color, '#ffffff' ) ),
					shape: { type: 'circle' },
					opacity: { value: { min: 0.35, max: 0.95 } },
					size: { value: { min: 1, max: 4 } },
					move: { enable: true, speed: pick( c.speed, 1.4 ), direction: 'bottom', straight: false, drift: { min: -0.4, max: 0.4 }, outModes: 'out' },
				},
			};
		},
		bubbles: function ( c ) {
			var color = pick( c.color, '#9fe7ff' );
			return {
				defaults: { hover: 'bubble', click: 'none' },
				particles: {
					number: { value: pick( c.amount, 50 ), density: { enable: true, width: 1000, height: 800 } },
					paint: {
						fill: { enable: true, color: { value: color }, opacity: 0.12 },
						stroke: { width: 1.2, color: { value: color }, opacity: 0.6 },
					},
					shape: { type: 'circle' },
					opacity: { value: { min: 0.4, max: 0.9 } },
					size: { value: { min: 4, max: 16 } },
					move: { enable: true, speed: pick( c.speed, 1 ), direction: 'top', straight: false, outModes: 'out' },
				},
			};
		},
		fireflies: function ( c ) {
			return {
				defaults: { hover: 'grab', click: 'none' },
				particles: {
					number: { value: pick( c.amount, 80 ), density: { enable: true, width: 1000, height: 800 } },
					paint: fill( pick( c.color, '#ffe27a' ) ),
					shape: { type: 'circle' },
					opacity: { value: { min: 0.05, max: 1 }, animation: { enable: true, speed: 1.4, sync: false } },
					size: { value: { min: 1, max: 3.2 } },
					move: { enable: true, speed: pick( c.speed, 0.7 ), direction: 'none', random: true, outModes: 'bounce' },
				},
			};
		},
		emoji: function ( c ) {
			var list = String( pick( c.emoji, '✨,🎈,💖,⭐' ) ).split( ',' ).map( function ( s ) {
				return s.trim();
			} ).filter( Boolean );
			return {
				defaults: { hover: 'repulse', click: 'none' },
				particles: {
					number: { value: pick( c.amount, 34 ), density: { enable: true, width: 1000, height: 800 } },
					shape: { type: 'emoji', options: { emoji: { value: list.length ? list : [ '✨' ] } } },
					opacity: { value: { min: 0.6, max: 1 } },
					size: { value: { min: 10, max: 20 } },
					rotate: { value: { min: 0, max: 360 }, direction: 'random', animation: { enable: true, speed: 4 } },
					move: { enable: true, speed: pick( c.speed, 1 ), direction: 'top', straight: false, outModes: 'out' },
				},
			};
		},
	};

	function buildOptions( config ) {
		var c = config || {};
		var preset = PRESETS[ c.preset ] ? c.preset : 'links';
		var built = PRESETS[ preset ]( c );
		var hover = pick( c.hover, built.defaults.hover );
		var reduce = !! ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );

		return {
			options: {
				fullScreen: { enable: false },
				background: { color: 'transparent' },
				detectRetina: true,
				fpsLimit: 60,
				pauseOnBlur: true,
				pauseOnOutsideViewport: true,
				motion: { disable: false, reduce: { factor: 4, value: true } },
				particles: built.particles,
				interactivity: {
					detectsOn: 'window',
					events: {
						onHover: { enable: hover !== 'none' && ! reduce, mode: hover },
						onClick: { enable: false },
						resize: { enable: true },
					},
					modes: {
						grab: { distance: 160, links: { opacity: 0.6 } },
						bubble: { distance: 160, size: 18, duration: 2, opacity: 0.9 },
						repulse: { distance: 120, duration: 0.4 },
					},
				},
			},
			click: pick( c.click, built.defaults.click ),
		};
	}

	// Click "thêm/bớt hạt" chỉ trong phạm vi phần tử cha (section), không phải cả trang.
	function bindClicks( el, container, mode ) {
		var host = el.parentElement;
		if ( ! host || mode === 'none' || ( mode !== 'push' && mode !== 'remove' ) ) {
			return;
		}

		host.addEventListener( 'click', function ( e ) {
			if ( container.destroyed || ( e.target.closest && e.target.closest( 'a, button, input, select, textarea, label' ) ) ) {
				return;
			}
			if ( mode === 'remove' ) {
				container.particles.removeQuantity( 2 );
				return;
			}
			var rect = el.getBoundingClientRect();
			var ratio = container.retina ? container.retina.pixelRatio : 1;
			container.particles.push( 4, { x: ( e.clientX - rect.left ) * ratio, y: ( e.clientY - rect.top ) * ratio } );
		} );
	}

	function mount( el, config ) {
		if ( ! el ) {
			return Promise.reject( new Error( 'No element' ) );
		}

		if ( el.__fxAmbient ) {
			try {
				el.__fxAmbient.destroy();
			} catch ( e ) {}
			el.__fxAmbient = null;
		}

		var built = buildOptions( config );

		return ready().then( function ( engine ) {
			return engine.load( { element: el, options: built.options } );
		} ).then( function ( container ) {
			if ( container ) {
				el.__fxAmbient = container;
				bindClicks( el, container, built.click );
			}
			return container;
		} );
	}

	function parse( el ) {
		try {
			return JSON.parse( el.getAttribute( 'data-fx-ambient' ) || '{}' );
		} catch ( e ) {
			return {};
		}
	}

	function init( root ) {
		var els = ( root || document ).querySelectorAll( '.init-fx-ambient[data-fx-ambient]' );
		var observer = null;

		Array.prototype.forEach.call( els, function ( el ) {
			if ( el.__fxAmbientQueued ) {
				return;
			}
			el.__fxAmbientQueued = true;

			if ( ! ( 'IntersectionObserver' in window ) ) {
				mount( el, parse( el ) ).catch( function () {} );
				return;
			}

			if ( ! observer ) {
				observer = new IntersectionObserver( function ( entries ) {
					entries.forEach( function ( entry ) {
						if ( entry.isIntersecting ) {
							observer.unobserve( entry.target );
							mount( entry.target, parse( entry.target ) ).catch( function () {} );
						}
					} );
				}, { rootMargin: '200px 0px' } );
			}
			observer.observe( el );
		} );
	}

	window.initFxAmbient = {
		mount: mount,
		init: init,
		presets: function () {
			return Object.keys( PRESETS );
		},
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', function () {
			init();
		} );
	} else {
		init();
	}
}( window, document ) );
