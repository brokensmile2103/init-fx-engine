/**
 * Init FX Engine — Seasonal Effects (Halloween, Christmas, New Year, Tết, Valentine, Mid-Autumn).
 *
 * Renderer canvas siêu nhẹ, không phụ thuộc thư viện:
 * - Emoji được vẽ sẵn 1 lần vào sprite (offscreen canvas) → mỗi frame chỉ drawImage, không fillText.
 * - Chuyển động tính theo thời gian thực (delta time) → mượt như nhau ở 60Hz/120Hz.
 * - Tự dừng khi tab bị ẩn, tự chạy lại khi quay lại tab.
 * - Số lượng hạt tự giảm theo diện tích màn hình (mobile nhẹ hơn desktop).
 * - Chỉ khởi động sau khi trang load xong (requestIdleCallback) → không ảnh hưởng LCP.
 * - Tôn trọng "prefers-reduced-motion" (có thể tắt trong cài đặt).
 *
 * API: window.initFxSeasonal.start( config ) / stop() / preview( config, ms ) / isRunning()
 */
( function ( window, document ) {
	'use strict';

	if ( window.initFxSeasonal ) {
		return;
	}

	var MAX_DPR = 2;
	var MAX_DT = 0.05; // giây — tránh "nhảy cóc" sau khi tab bị treo.
	var REF_AREA = 1440 * 900;
	var FONT_STACK = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';

	var state = {
		cfg: null,
		canvas: null,
		ctx: null,
		sprites: [],
		particles: [],
		width: 0,
		height: 0,
		dpr: 1,
		raf: 0,
		last: 0,
		running: false,
		resizeQueued: false,
		previewTimer: 0
	};

	function num( value, min, max, fallback ) {
		if ( value === '' || value === null || value === undefined ) {
			return fallback;
		}
		value = Number( value );
		if ( ! isFinite( value ) ) {
			return fallback;
		}
		return Math.max( min, Math.min( max, value ) );
	}

	function rand( min, max ) {
		return Math.random() * ( max - min ) + min;
	}

	function prefersReducedMotion() {
		return !! ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );
	}

	function normalize( cfg ) {
		cfg = cfg || {};

		var items = Array.isArray( cfg.items ) ? cfg.items.filter( function ( item ) {
			return typeof item === 'string' && item.trim() !== '';
		} ) : [];

		return {
			theme: String( cfg.theme || '' ),
			items: items.length ? items : [ '❄️' ],
			motion: [ 'fall', 'rise', 'flutter' ].indexOf( cfg.motion ) !== -1 ? cfg.motion : 'fall',
			glow: typeof cfg.glow === 'string' ? cfg.glow : '',
			greeting: typeof cfg.greeting === 'string' ? cfg.greeting : '',
			amount: num( cfg.amount, 5, 100, 28 ),
			size: num( cfg.size, 12, 64, 26 ),
			speed: num( cfg.speed, 0.3, 3, 1 ),
			opacity: num( cfg.opacity, 0.2, 1, 0.9 ),
			reducedMotion: cfg.reducedMotion !== false
		};
	}

	// ---------------------------------------------------------------------
	// Sprites — vẽ emoji 1 lần duy nhất ở kích thước lớn nhất cần dùng.
	// ---------------------------------------------------------------------
	function buildSprites() {
		var cfg = state.cfg;
		var px = Math.round( cfg.size * state.dpr );
		var pad = cfg.glow ? Math.ceil( px * 0.6 ) : Math.ceil( px * 0.2 );
		var box = px + pad * 2;
		var cache = {};

		state.sprites = cfg.items.map( function ( text ) {
			if ( cache[ text ] ) {
				return cache[ text ];
			}

			var canvas = document.createElement( 'canvas' );
			canvas.width = box;
			canvas.height = box;

			var g = canvas.getContext( '2d' );
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.font = px + 'px ' + FONT_STACK;

			if ( cfg.glow ) {
				g.shadowColor = cfg.glow;
				g.shadowBlur = pad;
			}

			g.fillText( text, box / 2, box / 2 + px * 0.06 );
			cache[ text ] = canvas;

			return canvas;
		} );
	}

	// ---------------------------------------------------------------------
	// Particles
	// ---------------------------------------------------------------------
	function targetCount() {
		var ratio = ( state.width * state.height ) / REF_AREA;
		return Math.max( 4, Math.round( state.cfg.amount * Math.max( 0.35, Math.min( 1, ratio ) ) ) );
	}

	function spawn( p, initial ) {
		var cfg = state.cfg;
		var w = state.width;
		var h = state.height;
		var margin = cfg.size * 1.5;
		var base;

		p.sprite = state.sprites[ ( Math.random() * state.sprites.length ) | 0 ];
		p.scale = rand( 0.55, 1 );
		p.alpha = cfg.opacity * rand( 0.75, 1 );
		p.phase = rand( 0, Math.PI * 2 );
		p.swing = rand( 12, 36 );
		p.swingSpeed = rand( 0.6, 1.6 );
		p.rot = 0;
		p.spin = 0;
		p.flap = 1;
		p.vx = 0;

		// Hạt to hơn đi nhanh hơn một chút → có chiều sâu (parallax).
		base = rand( 35, 70 ) * cfg.speed * ( 0.6 + p.scale * 0.6 );

		if ( cfg.motion === 'rise' ) {
			p.x = Math.random() * w;
			p.y = initial ? Math.random() * h : h + margin;
			p.vy = -base * 0.55;
			p.swing = rand( 6, 18 );
		} else if ( cfg.motion === 'flutter' ) {
			var dir = Math.random() < 0.5 ? -1 : 1;
			p.vx = dir * base * 1.3;
			p.vy = rand( -8, 8 ) * cfg.speed;
			p.x = initial ? Math.random() * w : ( dir > 0 ? -margin : w + margin );
			p.y = rand( 0, h * 0.85 );
			p.swing = rand( 10, 30 );
			p.swingSpeed = rand( 2, 4 );
		} else {
			p.x = Math.random() * w;
			p.y = initial ? Math.random() * h : -margin;
			p.vy = base;
			p.rot = rand( 0, Math.PI * 2 );
			p.spin = rand( -1.2, 1.2 );
		}

		return p;
	}

	function syncParticleCount() {
		var target = targetCount();
		var list = state.particles;

		while ( list.length < target ) {
			list.push( spawn( {}, true ) );
		}

		if ( list.length > target ) {
			list.length = target;
		}
	}

	function update( dt ) {
		var cfg = state.cfg;
		var list = state.particles;
		var w = state.width;
		var h = state.height;
		var margin = cfg.size * 1.5;
		var i, p;

		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			p.phase += p.swingSpeed * dt;

			if ( cfg.motion === 'rise' ) {
				p.y += p.vy * dt;
				p.x += Math.sin( p.phase ) * p.swing * dt;
				p.rot = Math.sin( p.phase * 0.8 ) * 0.12;
				if ( p.y < -margin ) {
					spawn( p, false );
				}
			} else if ( cfg.motion === 'flutter' ) {
				p.x += p.vx * dt;
				p.y += ( p.vy + Math.sin( p.phase ) * p.swing * 2 ) * dt;
				p.rot = Math.sin( p.phase * 0.5 ) * 0.2;
				p.flap = 0.65 + 0.35 * Math.abs( Math.sin( p.phase * 1.5 ) );
				if ( p.x < -margin * 2 || p.x > w + margin * 2 || p.y < -margin * 2 || p.y > h + margin * 2 ) {
					spawn( p, false );
				}
			} else {
				p.y += p.vy * dt;
				p.x += Math.sin( p.phase ) * p.swing * dt;
				p.rot += p.spin * dt;
				if ( p.y > h + margin || p.x < -margin * 2 || p.x > w + margin * 2 ) {
					spawn( p, false );
				}
			}
		}
	}

	function draw() {
		var ctx = state.ctx;
		var dpr = state.dpr;
		var list = state.particles;
		var i, p, img, half, cos, sin, sx, sy;

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.clearRect( 0, 0, state.canvas.width, state.canvas.height );

		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			img = p.sprite;
			half = img.width / 2;
			cos = Math.cos( p.rot );
			sin = Math.sin( p.rot );
			sx = p.scale * p.flap;
			sy = p.scale;

			ctx.globalAlpha = p.alpha;
			ctx.setTransform( cos * sx, sin * sx, -sin * sy, cos * sy, p.x * dpr, p.y * dpr );
			ctx.drawImage( img, -half, -half );
		}

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.globalAlpha = 1;
	}

	function frame( now ) {
		if ( ! state.running ) {
			return;
		}

		var dt = state.last ? Math.min( MAX_DT, ( now - state.last ) / 1000 ) : 0;
		state.last = now;

		update( dt );
		draw();

		state.raf = window.requestAnimationFrame( frame );
	}

	// ---------------------------------------------------------------------
	// Canvas / lifecycle
	// ---------------------------------------------------------------------
	function resize() {
		state.resizeQueued = false;

		if ( ! state.canvas ) {
			return;
		}

		var dpr = Math.min( MAX_DPR, window.devicePixelRatio || 1 );
		var w = window.innerWidth;
		var h = window.innerHeight;
		var dprChanged = dpr !== state.dpr;

		state.width = w;
		state.height = h;
		state.dpr = dpr;
		state.canvas.width = Math.round( w * dpr );
		state.canvas.height = Math.round( h * dpr );

		if ( dprChanged || ! state.sprites.length ) {
			buildSprites();
			state.particles.forEach( function ( p ) {
				p.sprite = state.sprites[ ( Math.random() * state.sprites.length ) | 0 ];
			} );
		}

		syncParticleCount();
	}

	function onResize() {
		if ( ! state.resizeQueued ) {
			state.resizeQueued = true;
			window.requestAnimationFrame( resize );
		}
	}

	function onVisibility() {
		if ( ! state.canvas ) {
			return;
		}

		if ( document.hidden ) {
			state.running = false;
			window.cancelAnimationFrame( state.raf );
		} else if ( ! state.running ) {
			state.running = true;
			state.last = 0;
			state.raf = window.requestAnimationFrame( frame );
		}
	}

	function stop() {
		state.running = false;
		window.cancelAnimationFrame( state.raf );
		window.clearTimeout( state.previewTimer );
		window.removeEventListener( 'resize', onResize );
		document.removeEventListener( 'visibilitychange', onVisibility );

		if ( state.canvas && state.canvas.parentNode ) {
			state.canvas.parentNode.removeChild( state.canvas );
		}

		state.canvas = null;
		state.ctx = null;
		state.sprites = [];
		state.particles = [];
		state.last = 0;
	}

	function start( config ) {
		stop();

		var cfg = normalize( config );

		if ( cfg.reducedMotion && prefersReducedMotion() ) {
			return false;
		}

		var canvas = document.createElement( 'canvas' );
		canvas.className = 'init-fx-seasonal';
		canvas.setAttribute( 'aria-hidden', 'true' );
		canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999;pointer-events:none;display:block;';

		var ctx = canvas.getContext( '2d' );
		if ( ! ctx ) {
			return false;
		}

		state.cfg = cfg;
		state.canvas = canvas;
		state.ctx = ctx;
		state.dpr = 0; // ép resize() dựng sprite lần đầu.

		document.body.appendChild( canvas );
		resize();

		window.addEventListener( 'resize', onResize, { passive: true } );
		document.addEventListener( 'visibilitychange', onVisibility );

		state.running = ! document.hidden;
		if ( state.running ) {
			state.raf = window.requestAnimationFrame( frame );
		}

		return true;
	}

	function runGreeting( cfg ) {
		if ( ! cfg.greeting || typeof window.runEffect !== 'function' ) {
			return;
		}

		var key = 'init_fx_seasonal_greeted_' + cfg.theme;

		try {
			if ( window.sessionStorage.getItem( key ) === '1' ) {
				return;
			}
			window.sessionStorage.setItem( key, '1' );
		} catch ( e ) {
			// sessionStorage bị chặn → vẫn chạy lời chào như bình thường.
		}

		window.setTimeout( function () {
			window.runEffect( cfg.greeting );
		}, 700 );
	}

	function preview( config, ms ) {
		var cfg = normalize( config );

		// Preview trong admin luôn chạy, kể cả khi máy bật reduced motion.
		cfg.reducedMotion = false;
		start( cfg );

		if ( cfg.greeting && typeof window.runEffect === 'function' ) {
			window.runEffect( cfg.greeting );
		}

		state.previewTimer = window.setTimeout( stop, ms || 8000 );
	}

	function boot() {
		var cfg = window.INIT_FX && window.INIT_FX.seasonal;

		if ( ! cfg || ! cfg.autostart ) {
			return;
		}

		var normalized = normalize( cfg );

		if ( normalized.reducedMotion && prefersReducedMotion() ) {
			return;
		}

		if ( start( normalized ) ) {
			runGreeting( normalized );
		}
	}

	function whenIdle( fn ) {
		if ( 'requestIdleCallback' in window ) {
			window.requestIdleCallback( fn, { timeout: 2000 } );
		} else {
			window.setTimeout( fn, 200 );
		}
	}

	window.initFxSeasonal = {
		start: start,
		stop: stop,
		preview: preview,
		isRunning: function () {
			return !! state.canvas;
		}
	};

	if ( document.readyState === 'complete' ) {
		whenIdle( boot );
	} else {
		window.addEventListener( 'load', function () {
			whenIdle( boot );
		}, { once: true } );
	}
} )( window, document );
