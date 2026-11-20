/**
 * Init FX Engine — Snowfall.
 *
 * Renderer canvas riêng (không thư viện), thay cho particles.js từ 2.0.2. Bản 2.0.3:
 * - Kiểu "Classic" (mặc định): hạt tròn đặc, kích thước + độ mờ ngẫu nhiên tạo chiều sâu,
 *   rơi chéo nhẹ ngẫu nhiên — đúng cảm giác của Snowfall các bản cũ (particles.js).
 * - Thêm kiểu Soft glow (chấm tuyết phát sáng của 2.0.2), Crystal, Mixed; màu tuyết tùy chỉnh.
 * - Gió nhẹ (tùy chọn), chế độ tiết kiệm pin 30fps, tắt trên màn hình nhỏ (tùy chọn).
 *
 * Hiệu năng:
 * - Sprite dựng sẵn 1 lần → mỗi khung hình chỉ drawImage (hạt tròn không cần xoay/transform riêng).
 * - Delta time → tốc độ như nhau ở 60/120/144Hz; giới hạn DPR = 2.
 * - Số hạt co giãn theo diện tích màn hình.
 * - Mobile: thanh địa chỉ co/giãn không làm cấp phát lại canvas (chỉ cấp phát khi đổi chiều rộng
 *   hoặc chiều cao tăng vượt vùng đã có).
 * - Dừng khi tab ẩn, khởi động khi trình duyệt rảnh sau "load", tôn trọng prefers-reduced-motion.
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
	var STYLES = [ 'dots', 'soft', 'flakes', 'mixed' ];

	var state = {
		cfg: null,
		canvas: null,
		ctx: null,
		sprites: null,
		particles: [],
		width: 0,
		height: 0,
		allocW: 0,
		allocH: 0,
		dpr: 1,
		raf: 0,
		last: 0,
		frameGap: 0,
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

	function isSmallScreen() {
		return !! ( window.matchMedia && window.matchMedia( '(max-width: 767px)' ).matches );
	}

	function normalize( cfg ) {
		cfg = cfg || {};
		return {
			amount: num( cfg.amount, 20, 200, 80 ),
			size: num( cfg.size, 1, 10, 4 ),
			speed: num( cfg.speed, 0.3, 5, 1.2 ),
			opacity: num( cfg.opacity, 0.1, 1, 0.6 ),
			style: STYLES.indexOf( cfg.style ) !== -1 ? cfg.style : 'dots',
			color: /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test( cfg.color || '' ) ? cfg.color : '#ffffff',
			wind: !! cfg.wind,
			fps: Number( cfg.fps ) === 30 ? 30 : 60,
			hideMobile: !! cfg.hideMobile,
			reducedMotion: cfg.reducedMotion !== false,
		};
	}

	// ---------------------------------------------------------------------
	// Sprites (vẽ 1 lần cho mỗi lần start)
	// ---------------------------------------------------------------------
	function makeCanvas( size ) {
		var c = document.createElement( 'canvas' );
		c.width = size;
		c.height = size;
		return c;
	}

	// Classic: hình tròn đặc, mép khử răng cưa — giống particles.js.
	function buildRound( color ) {
		var c = makeCanvas( SPRITE_PX );
		var g = c.getContext( '2d' );
		g.fillStyle = color;
		g.beginPath();
		g.arc( SPRITE_PX / 2, SPRITE_PX / 2, SPRITE_PX / 2 - 0.5, 0, Math.PI * 2 );
		g.fill();
		return c;
	}

	// Soft glow: lõi sáng + viền mờ dần (kiểu chấm tuyết của 2.0.2).
	function buildSoft( color ) {
		var c = makeCanvas( SPRITE_PX );
		var g = c.getContext( '2d' );
		var r = SPRITE_PX / 2;

		g.fillStyle = color;
		g.beginPath();
		g.arc( r, r, r * 0.5, 0, Math.PI * 2 );
		g.fill();

		g.globalCompositeOperation = 'source-over';
		var halo = g.createRadialGradient( r, r, r * 0.45, r, r, r );
		halo.addColorStop( 0, color );
		halo.addColorStop( 1, 'rgba(255,255,255,0)' );
		g.globalAlpha = 0.55;
		g.fillStyle = halo;
		g.beginPath();
		g.arc( r, r, r, 0, Math.PI * 2 );
		g.fill();

		return c;
	}

	// Bông tuyết pha lê 6 cánh (3 biến thể).
	function buildFlake( variant, color ) {
		var c = makeCanvas( SPRITE_PX );
		var g = c.getContext( '2d' );
		var r = SPRITE_PX / 2;
		var arm = r * 0.78;
		var i;

		g.translate( r, r );
		g.strokeStyle = color;
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

		g.fillStyle = color;
		g.beginPath();
		g.arc( 0, 0, variant === 1 ? 3.5 : 2.5, 0, Math.PI * 2 );
		g.fill();

		return c;
	}

	function buildSprites() {
		var color = state.cfg.color;
		state.sprites = {
			round: buildRound( color ),
			soft: buildSoft( color ),
			flakes: [ buildFlake( 0, color ), buildFlake( 1, color ), buildFlake( 2, color ) ],
		};
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
		var s = state.sprites;
		var useFlake = cfg.style === 'flakes' || ( cfg.style === 'mixed' && Math.random() < 0.3 );
		var depth = Math.random();

		p.flake = useFlake ? s.flakes[ ( Math.random() * 3 ) | 0 ] : null;
		p.img = p.flake || ( cfg.style === 'soft' ? s.soft : s.round );

		// Giống particles.js: bán kính = ngẫu nhiên × size, độ mờ = ngẫu nhiên × opacity (độc lập)
		// → hạt to/nhỏ, đậm/nhạt lẫn lộn tạo cảm giác chiều sâu. Hạt to rơi nhanh hơn một chút.
		p.r = cfg.size * Math.max( 0.15, depth ) * ( useFlake ? 2.2 : 1 );
		p.alpha = cfg.opacity * Math.max( 0.06, Math.random() );
		p.vy = cfg.speed * 30 * rand( 0.5, 1.5 ) * ( 0.8 + depth * 0.4 );
		p.vx = ( Math.random() - 0.5 ) * cfg.speed * 30; // Rơi chéo nhẹ ngẫu nhiên như bản cũ.
		p.depth = depth;
		p.swing = cfg.wind ? rand( 4, 14 ) * ( 0.5 + depth ) : 0;
		p.swingSpeed = rand( 0.4, 1.2 );
		p.phase = rand( 0, Math.PI * 2 );
		p.rot = rand( 0, Math.PI * 2 );
		p.spin = rand( -0.8, 0.8 );
		p.x = Math.random() * state.width;
		p.y = initial ? Math.random() * state.height : -p.r * 2 - Math.random() * 30;

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
			return;
		}
		state.windTimer -= dt;
		if ( state.windTimer <= 0 ) {
			state.windTimer = rand( 4, 9 );
			state.windTarget = rand( -1, 1 ) * 20 * state.cfg.speed;
		}
		// Tiến dần về hướng gió mới → đổi hướng rất êm.
		state.wind += ( state.windTarget - state.wind ) * Math.min( 1, dt * 0.35 );
	}

	function update( dt ) {
		var list = state.particles;
		var w = state.width;
		var h = state.height;
		var wind = state.wind;
		var i, p, dx;

		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			dx = p.vx;

			if ( p.swing ) {
				p.phase += p.swingSpeed * dt;
				dx += Math.sin( p.phase ) * p.swing + wind * ( 0.4 + p.depth );
			}

			p.y += p.vy * dt;
			p.x += dx * dt;

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
		var i, p, d, cos, sin, s;

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.clearRect( 0, 0, state.canvas.width, state.canvas.height );

		// Lượt 1: hạt tròn — 1 transform cho cả lượt, không xoay.
		ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			if ( p.flake ) {
				continue;
			}
			d = p.r * 2;
			ctx.globalAlpha = p.alpha;
			ctx.drawImage( p.img, p.x - p.r, p.y - p.r, d, d );
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

		state.raf = window.requestAnimationFrame( frame );

		// Chế độ tiết kiệm pin: bỏ qua khung hình để giữ ~30fps.
		if ( state.frameGap && state.last && now - state.last < state.frameGap ) {
			return;
		}

		var dt = state.last ? Math.min( MAX_DT * 2, ( now - state.last ) / 1000 ) : 0;
		state.last = now;

		updateWind( dt );
		update( dt );
		draw();
	}

	// ---------------------------------------------------------------------
	// Lifecycle
	// ---------------------------------------------------------------------
	function resize() {
		state.resizeQueued = false;
		if ( ! state.canvas ) {
			return;
		}

		var dpr = Math.min( MAX_DPR, window.devicePixelRatio || 1 );
		var w = window.innerWidth;
		var h = window.innerHeight;

		state.width = w;
		state.height = h;

		// Chỉ cấp phát lại canvas khi đổi chiều rộng/DPR hoặc cao hơn vùng đã có
		// (thanh địa chỉ trên mobile co giãn khi cuộn không còn làm cấp phát lại).
		if ( w !== state.allocW || h > state.allocH || dpr !== state.dpr ) {
			state.allocH = w === state.allocW && dpr === state.dpr ? Math.max( h, state.allocH ) : h;
			state.allocW = w;
			state.dpr = dpr;
			state.canvas.width = Math.round( w * dpr );
			state.canvas.height = Math.round( state.allocH * dpr );
			state.canvas.style.height = state.allocH + 'px';
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
		state.allocW = 0;
		state.allocH = 0;

		removeBackdrop();
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
		canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100vh;z-index:999;pointer-events:none;display:block;';

		var ctx = canvas.getContext( '2d' );
		if ( ! ctx ) {
			return false;
		}

		state.cfg = cfg;
		state.canvas = canvas;
		state.ctx = ctx;
		state.wind = 0;
		state.windTarget = 0;
		state.windTimer = 0;
		state.frameGap = cfg.fps === 30 ? 1000 / 30 - 2 : 0;
		state.dpr = 0;

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
		cfg.hideMobile = false;
		if ( start( cfg ) ) {
			addBackdrop();
		}
		state.previewTimer = window.setTimeout( stop, ms || 8000 );
	}

	function boot() {
		var cfg = window.INIT_FX && window.INIT_FX.snowfall;
		if ( ! cfg ) {
			return;
		}
		if ( cfg.hideMobile && isSmallScreen() ) {
			return;
		}
		start( cfg );
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
