/**
 * Init FX Engine — Snowfall.
 *
 * Từ 2.0.2 không còn dùng particles.js (thư viện ngừng phát triển từ 2016, ~23KB):
 * - 1 canvas, sprite bông tuyết dựng sẵn → mỗi khung hình chỉ drawImage.
 * - Chuyển động theo thời gian thực (delta time) → mượt như nhau ở 60Hz/120Hz/144Hz.
 * - Hạt to rơi nhanh hơn (chiều sâu), đung đưa nhẹ, gió đổi hướng chậm rãi.
 * - Số hạt tự co giãn theo diện tích màn hình (mobile nhẹ hơn desktop).
 * - Dừng hẳn khi tab bị ẩn, chỉ khởi động sau khi trang tải xong (không ảnh hưởng LCP).
 * - Tôn trọng "prefers-reduced-motion" (có thể tắt trong cài đặt).
 *
 * API: window.initFxSnowfall.start( config ) / stop() / preview( config, ms ) / isRunning()
 */
( function ( window, document ) {
	'use strict';

	if ( window.initFxSnowfall ) {
		return;
	}

	var MAX_DPR = 2;
	var MAX_DT = 0.05;
	var REF_AREA = 1440 * 900;
	var SPRITE_PX = 64;

	var state = {
		cfg: null,
		canvas: null,
		ctx: null,
		dot: null,
		flakes: [],
		particles: [],
		width: 0,
		height: 0,
		dpr: 1,
		raf: 0,
		last: 0,
		running: false,
		resizeQueued: false,
		wind: 0,
		windTarget: 0,
		windTimer: 0,
		previewTimer: 0,
		backdrop: null,
	};

	function num( value, min, max, fallback ) {
		value = Number( value );
		if ( value === 0 && min > 0 ) {
			return fallback;
		}
		return isFinite( value ) ? Math.max( min, Math.min( max, value ) ) : fallback;
	}

	function rand( min, max ) {
		return Math.random() * ( max - min ) + min;
	}

	function prefersReducedMotion() {
		return !! ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );
	}

	function normalize( cfg ) {
		cfg = cfg || {};
		return {
			amount: num( cfg.amount, 20, 200, 80 ),
			size: num( cfg.size, 1, 10, 4 ),
			speed: num( cfg.speed, 0.3, 5, 1.2 ),
			opacity: num( cfg.opacity, 0.1, 1, 0.6 ),
			style: [ 'dots', 'flakes', 'mixed' ].indexOf( cfg.style ) !== -1 ? cfg.style : 'dots',
			wind: cfg.wind !== false,
			reducedMotion: cfg.reducedMotion !== false,
		};
	}

	// ---------------------------------------------------------------------
	// Sprites (vẽ 1 lần)
	// ---------------------------------------------------------------------
	function makeCanvas( size ) {
		var c = document.createElement( 'canvas' );
		c.width = size;
		c.height = size;
		return c;
	}

	// Chấm tuyết mềm: lõi trắng + viền mờ dần + bóng xanh xám rất nhẹ (vẫn thấy trên nền trắng).
	function buildDot() {
		var c = makeCanvas( SPRITE_PX );
		var g = c.getContext( '2d' );
		var r = SPRITE_PX / 2;

		var halo = g.createRadialGradient( r, r, 0, r, r, r );
		halo.addColorStop( 0, 'rgba(255,255,255,1)' );
		halo.addColorStop( 0.45, 'rgba(255,255,255,0.95)' );
		halo.addColorStop( 0.7, 'rgba(225,238,255,0.45)' );
		halo.addColorStop( 1, 'rgba(200,220,245,0)' );

		g.fillStyle = halo;
		g.beginPath();
		g.arc( r, r, r, 0, Math.PI * 2 );
		g.fill();

		return c;
	}

	// Bông tuyết pha lê 6 cánh (3 biến thể).
	function buildFlake( variant ) {
		var c = makeCanvas( SPRITE_PX );
		var g = c.getContext( '2d' );
		var r = SPRITE_PX / 2;
		var arm = r * 0.78;
		var i;

		g.translate( r, r );
		g.strokeStyle = '#ffffff';
		g.lineCap = 'round';
		g.shadowColor = 'rgba(120,160,210,0.55)';
		g.shadowBlur = 4;
		g.lineWidth = variant === 2 ? 2.6 : 2.2;

		for ( i = 0; i < 6; i++ ) {
			g.save();
			g.rotate( ( Math.PI / 3 ) * i );
			g.beginPath();
			g.moveTo( 0, 0 );
			g.lineTo( 0, -arm );

			if ( variant === 0 ) {
				g.moveTo( 0, -arm * 0.45 );
				g.lineTo( -arm * 0.22, -arm * 0.66 );
				g.moveTo( 0, -arm * 0.45 );
				g.lineTo( arm * 0.22, -arm * 0.66 );
				g.moveTo( 0, -arm * 0.72 );
				g.lineTo( -arm * 0.14, -arm * 0.86 );
				g.moveTo( 0, -arm * 0.72 );
				g.lineTo( arm * 0.14, -arm * 0.86 );
			} else if ( variant === 1 ) {
				g.moveTo( -arm * 0.18, -arm * 0.55 );
				g.lineTo( arm * 0.18, -arm * 0.55 );
				g.moveTo( 0, -arm * 0.3 );
				g.lineTo( -arm * 0.3, -arm * 0.5 );
				g.moveTo( 0, -arm * 0.3 );
				g.lineTo( arm * 0.3, -arm * 0.5 );
			} else {
				g.moveTo( 0, -arm * 0.6 );
				g.lineTo( -arm * 0.28, -arm * 0.9 );
				g.moveTo( 0, -arm * 0.6 );
				g.lineTo( arm * 0.28, -arm * 0.9 );
			}

			g.stroke();
			g.restore();
		}

		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc( 0, 0, variant === 1 ? 3.5 : 2.5, 0, Math.PI * 2 );
		g.fill();

		return c;
	}

	function buildSprites() {
		if ( ! state.dot ) {
			state.dot = buildDot();
			state.flakes = [ buildFlake( 0 ), buildFlake( 1 ), buildFlake( 2 ) ];
		}
	}

	// ---------------------------------------------------------------------
	// Particles
	// ---------------------------------------------------------------------
	function targetCount() {
		var ratio = ( state.width * state.height ) / REF_AREA;
		return Math.max( 8, Math.round( state.cfg.amount * Math.max( 0.3, Math.min( 1.6, ratio ) ) ) );
	}

	function spawn( p, initial ) {
		var cfg = state.cfg;
		var useFlake = cfg.style === 'flakes' || ( cfg.style === 'mixed' && Math.random() < 0.35 );
		var depth = Math.pow( Math.random(), 1.4 ); // Nhiều hạt nhỏ ở xa, ít hạt to ở gần.

		p.flake = useFlake ? state.flakes[ ( Math.random() * 3 ) | 0 ] : null;
		p.r = cfg.size * ( 0.35 + depth * 0.65 ) * ( useFlake ? 2.4 : 1 );
		p.depth = depth;
		p.alpha = cfg.opacity * ( 0.45 + depth * 0.55 );
		p.vy = cfg.speed * rand( 18, 30 ) * ( 0.55 + depth * 0.9 );
		p.swing = rand( 6, 22 ) * ( 0.5 + depth );
		p.swingSpeed = rand( 0.4, 1.3 );
		p.phase = rand( 0, Math.PI * 2 );
		p.rot = rand( 0, Math.PI * 2 );
		p.spin = rand( -0.8, 0.8 );
		p.x = Math.random() * state.width;
		p.y = initial ? Math.random() * state.height : -p.r * 2 - Math.random() * 40;

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

	function updateWind( dt ) {
		if ( ! state.cfg.wind ) {
			state.wind = 0;
			return;
		}
		state.windTimer -= dt;
		if ( state.windTimer <= 0 ) {
			state.windTimer = rand( 4, 9 );
			state.windTarget = rand( -1, 1 ) * 22 * state.cfg.speed;
		}
		// Tiến dần về hướng gió mới → đổi hướng rất êm.
		state.wind += ( state.windTarget - state.wind ) * Math.min( 1, dt * 0.35 );
	}

	function update( dt ) {
		var list = state.particles;
		var w = state.width;
		var h = state.height;
		var wind = state.wind;
		var i, p;

		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			p.phase += p.swingSpeed * dt;
			p.y += p.vy * dt;
			p.x += ( Math.sin( p.phase ) * p.swing + wind * ( 0.4 + p.depth ) ) * dt;
			if ( p.flake ) {
				p.rot += p.spin * dt;
			}

			if ( p.y > h + p.r * 2 ) {
				spawn( p, false );
			} else if ( p.x < -p.r * 3 ) {
				p.x = w + p.r * 2;
			} else if ( p.x > w + p.r * 3 ) {
				p.x = -p.r * 2;
			}
		}
	}

	function draw() {
		var ctx = state.ctx;
		var dpr = state.dpr;
		var list = state.particles;
		var dot = state.dot;
		var i, p, d, cos, sin, s;

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.clearRect( 0, 0, state.canvas.width, state.canvas.height );

		// Lượt 1: chấm tuyết — không xoay, chỉ 1 transform cho cả lượt.
		ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			if ( p.flake ) {
				continue;
			}
			d = p.r * 2;
			ctx.globalAlpha = p.alpha;
			ctx.drawImage( dot, p.x - p.r, p.y - p.r, d, d );
		}

		// Lượt 2: bông tuyết pha lê (có xoay).
		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			if ( ! p.flake ) {
				continue;
			}
			s = ( p.r * 2 ) / SPRITE_PX;
			cos = Math.cos( p.rot ) * s * dpr;
			sin = Math.sin( p.rot ) * s * dpr;
			ctx.globalAlpha = p.alpha;
			ctx.setTransform( cos, sin, -sin, cos, p.x * dpr, p.y * dpr );
			ctx.drawImage( p.flake, -SPRITE_PX / 2, -SPRITE_PX / 2 );
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

		updateWind( dt );
		update( dt );
		draw();

		state.raf = window.requestAnimationFrame( frame );
	}

	// ---------------------------------------------------------------------
	// Lifecycle
	// ---------------------------------------------------------------------
	function resize() {
		state.resizeQueued = false;
		if ( ! state.canvas ) {
			return;
		}

		state.dpr = Math.min( MAX_DPR, window.devicePixelRatio || 1 );
		state.width = window.innerWidth;
		state.height = window.innerHeight;
		state.canvas.width = Math.round( state.width * state.dpr );
		state.canvas.height = Math.round( state.height * state.dpr );

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
		state.particles = [];
		state.last = 0;

		removeBackdrop();
	}

	// Nền "bầu trời đêm" chỉ dùng khi preview: tuyết trắng gần như vô hình trên nền sáng của trang admin.
	function addBackdrop() {
		var el = document.createElement( 'div' );
		el.className = 'init-fx-snowfall-backdrop';
		el.setAttribute( 'aria-hidden', 'true' );
		el.style.cssText = 'position:fixed;inset:0;z-index:998;pointer-events:none;background:radial-gradient(ellipse at 50% 0%,rgba(40,60,100,.82),rgba(8,14,30,.9));opacity:0;transition:opacity .5s ease;';
		document.body.appendChild( el );
		window.requestAnimationFrame( function () {
			el.style.opacity = '1';
		} );
		state.backdrop = el;
	}

	function removeBackdrop() {
		var el = state.backdrop;
		state.backdrop = null;
		if ( ! el ) {
			return;
		}
		el.style.opacity = '0';
		window.setTimeout( function () {
			if ( el.parentNode ) {
				el.parentNode.removeChild( el );
			}
		}, 500 );
	}

	function start( config ) {
		stop();

		var cfg = normalize( config );
		if ( cfg.reducedMotion && prefersReducedMotion() ) {
			return false;
		}

		var canvas = document.createElement( 'canvas' );
		canvas.id = 'particles-snow-js'; // Giữ id cũ cho CSS tùy biến của người dùng.
		canvas.className = 'init-fx-snowfall';
		canvas.setAttribute( 'aria-hidden', 'true' );
		canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999;pointer-events:none;display:block;';

		var ctx = canvas.getContext( '2d' );
		if ( ! ctx ) {
			return false;
		}

		state.cfg = cfg;
		state.canvas = canvas;
		state.ctx = ctx;
		state.wind = 0;
		state.windTimer = 0;

		buildSprites();
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

	function preview( config, ms ) {
		var cfg = normalize( config );
		cfg.reducedMotion = false; // Preview trong admin luôn chạy.
		if ( start( cfg ) ) {
			addBackdrop();
		}
		state.previewTimer = window.setTimeout( stop, ms || 8000 );
	}

	function boot() {
		var cfg = window.INIT_FX && window.INIT_FX.snowfall;
		if ( cfg ) {
			start( cfg );
		}
	}

	function whenIdle( fn ) {
		if ( 'requestIdleCallback' in window ) {
			window.requestIdleCallback( fn, { timeout: 2000 } );
		} else {
			window.setTimeout( fn, 200 );
		}
	}

	window.initFxSnowfall = {
		start: start,
		stop: stop,
		preview: preview,
		isRunning: function () {
			return !! state.canvas;
		},
	};

	if ( document.readyState === 'complete' ) {
		whenIdle( boot );
	} else {
		window.addEventListener( 'load', function () {
			whenIdle( boot );
		}, { once: true } );
	}
}( window, document ) );
