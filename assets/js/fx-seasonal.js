/**
 * Init FX Engine — Seasonal Effects 2.0.2 (Halloween, Christmas, New Year, Tết, Valentine, Mid-Autumn).
 *
 * Renderer canvas không phụ thuộc thư viện, vẽ tay toàn bộ cảnh lễ hội:
 * - Giáng sinh: bông tuyết pha lê + tuyết mềm, quà & cây thông; dây đèn nhấp nháy trên đầu trang.
 * - Năm mới: kim tuyến lật 3D, lấp lánh vàng; dây đèn vàng.
 * - Tết: hoa đào, hoa mai, cánh hoa lật lượn, bao lì xì; 2 đèn lồng đỏ đung đưa.
 * - Valentine: trái tim bóng bẩy bay lên, cánh hồng, lấp lánh.
 * - Trung Thu: đèn lồng phát sáng bay lên, sao lấp lánh; trăng rằm toả sáng.
 * - Halloween: dơi vỗ cánh, ma trôi, bí ngô, tàn lửa; mạng nhện + nhện đu dây.
 *
 * Hiệu năng:
 * - Mọi hình được vẽ sẵn 1 lần vào sprite (offscreen canvas) → mỗi frame chỉ drawImage.
 * - Delta time → mượt như nhau ở 60/120/144Hz; giới hạn DPR = 2.
 * - Số hạt tự giảm theo diện tích màn hình; dừng khi tab ẩn; khởi động khi trình duyệt rảnh
 *   sau sự kiện load → không ảnh hưởng LCP/INP. Tôn trọng prefers-reduced-motion.
 * - Theme thêm qua filter PHP hoặc khi người dùng nhập emoji riêng → dùng renderer emoji.
 *
 * API: window.initFxSeasonal.start( config ) / stop() / preview( config, ms ) / isRunning() / scenes()
 */
( function ( window, document ) {
	'use strict';

	if ( window.initFxSeasonal ) {
		return;
	}

	var MAX_DPR = 2;
	var MAX_DT = 0.05;
	var REF_AREA = 1440 * 900;
	var TAU = Math.PI * 2;
	var FONT_STACK = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
	var MAX_BURST = 140;

	var state = {
		cfg: null,
		scene: null,
		canvas: null,
		ctx: null,
		kinds: [],
		totalWeight: 0,
		particles: [],
		bursts: [],
		decor: null,
		width: 0,
		height: 0,
		dpr: 0,
		raf: 0,
		last: 0,
		time: 0,
		running: false,
		resizeQueued: false,
		previewTimer: 0,
	};

	// =====================================================================
	// Utils
	// =====================================================================

	function num( value, min, max, fallback ) {
		if ( value === '' || value === null || value === undefined ) {
			return fallback;
		}
		value = Number( value );
		return isFinite( value ) ? Math.max( min, Math.min( max, value ) ) : fallback;
	}

	function rand( min, max ) {
		return Math.random() * ( max - min ) + min;
	}

	function pick( list ) {
		return list[ ( Math.random() * list.length ) | 0 ];
	}

	function prefersReducedMotion() {
		return !! ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );
	}

	function makeCanvas( w, h ) {
		var c = document.createElement( 'canvas' );
		c.width = Math.max( 1, Math.ceil( w ) );
		c.height = Math.max( 1, Math.ceil( h || w ) );
		return c;
	}

	// Tạo sprite vuông: px = kích thước hình, pad = lề cho glow. draw( g, r ) vẽ quanh gốc (0,0), r = px/2.
	function sprite( px, padRatio, draw ) {
		var pad = Math.ceil( px * ( padRatio || 0.15 ) );
		var box = px + pad * 2;
		var c = makeCanvas( box );
		var g = c.getContext( '2d' );
		g.translate( box / 2, box / 2 );
		draw( g, px / 2 );
		return c;
	}

	function glow( g, color, blur ) {
		g.shadowColor = color;
		g.shadowBlur = blur;
	}

	function noGlow( g ) {
		g.shadowColor = 'rgba(0,0,0,0)';
		g.shadowBlur = 0;
	}

	// =====================================================================
	// Drawers — mỗi hàm vẽ 1 hình quanh gốc toạ độ, bán kính r.
	// =====================================================================

	function drawCrystal( g, r ) {
		var arm = r * 0.92;
		glow( g, 'rgba(140,190,255,0.85)', r * 0.3 );
		g.strokeStyle = '#ffffff';
		g.lineCap = 'round';
		g.lineWidth = Math.max( 1, r * 0.1 );

		for ( var i = 0; i < 6; i++ ) {
			g.save();
			g.rotate( ( TAU / 6 ) * i );
			g.beginPath();
			g.moveTo( 0, 0 );
			g.lineTo( 0, -arm );
			g.moveTo( 0, -arm * 0.42 );
			g.lineTo( -arm * 0.24, -arm * 0.64 );
			g.moveTo( 0, -arm * 0.42 );
			g.lineTo( arm * 0.24, -arm * 0.64 );
			g.moveTo( 0, -arm * 0.7 );
			g.lineTo( -arm * 0.15, -arm * 0.86 );
			g.moveTo( 0, -arm * 0.7 );
			g.lineTo( arm * 0.15, -arm * 0.86 );
			g.stroke();
			g.restore();
		}

		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc( 0, 0, r * 0.14, 0, TAU );
		g.fill();
	}

	function drawDot( color ) {
		return function ( g, r ) {
			var grad = g.createRadialGradient( 0, 0, 0, 0, 0, r );
			grad.addColorStop( 0, color || 'rgba(255,255,255,1)' );
			grad.addColorStop( 0.45, color || 'rgba(255,255,255,0.95)' );
			grad.addColorStop( 1, 'rgba(255,255,255,0)' );
			g.fillStyle = grad;
			g.beginPath();
			g.arc( 0, 0, r, 0, TAU );
			g.fill();
		};
	}

	function drawGlitter( color, glowColor ) {
		return function ( g, r ) {
			glow( g, glowColor, r * 0.6 );
			g.fillStyle = color;
			g.beginPath();
			g.moveTo( 0, -r );
			g.quadraticCurveTo( r * 0.12, -r * 0.12, r, 0 );
			g.quadraticCurveTo( r * 0.12, r * 0.12, 0, r );
			g.quadraticCurveTo( -r * 0.12, r * 0.12, -r, 0 );
			g.quadraticCurveTo( -r * 0.12, -r * 0.12, 0, -r );
			g.fill();
			noGlow( g );
			g.fillStyle = '#ffffff';
			g.beginPath();
			g.arc( 0, 0, r * 0.14, 0, TAU );
			g.fill();
		};
	}

	function drawStar( color, glowColor ) {
		return function ( g, r ) {
			glow( g, glowColor, r * 0.7 );
			g.fillStyle = color;
			g.beginPath();
			for ( var i = 0; i < 10; i++ ) {
				var rad = i % 2 === 0 ? r : r * 0.45;
				var a = ( Math.PI / 5 ) * i - Math.PI / 2;
				if ( i === 0 ) {
					g.moveTo( Math.cos( a ) * rad, Math.sin( a ) * rad );
				} else {
					g.lineTo( Math.cos( a ) * rad, Math.sin( a ) * rad );
				}
			}
			g.closePath();
			g.fill();
		};
	}

	function drawRibbon( color, shine ) {
		return function ( g, r ) {
			var w = r * 0.75;
			var h = r * 1.5;
			var grad = g.createLinearGradient( -w, -h / 2, w, h / 2 );
			grad.addColorStop( 0, color );
			grad.addColorStop( 0.5, shine );
			grad.addColorStop( 1, color );
			g.fillStyle = grad;
			g.beginPath();
			g.moveTo( -w / 2, -h / 2 );
			g.quadraticCurveTo( 0, -h / 2 - r * 0.15, w / 2, -h / 2 );
			g.lineTo( w / 2, h / 2 );
			g.quadraticCurveTo( 0, h / 2 - r * 0.15, -w / 2, h / 2 );
			g.closePath();
			g.fill();
		};
	}

	function petalPath( g, r, notch ) {
		// Cánh hoa hình giọt nước, đầu cánh có khía (hoa đào) hoặc tròn (hoa mai).
		g.beginPath();
		g.moveTo( 0, 0 );
		g.bezierCurveTo( -r * 0.55, -r * 0.25, -r * 0.6, -r * 0.85, -r * 0.18, -r );
		if ( notch ) {
			g.quadraticCurveTo( 0, -r * 0.82, r * 0.18, -r );
		} else {
			g.quadraticCurveTo( 0, -r * 1.08, r * 0.18, -r );
		}
		g.bezierCurveTo( r * 0.6, -r * 0.85, r * 0.55, -r * 0.25, 0, 0 );
		g.closePath();
	}

	function drawBlossom( petal, edge, center, notch ) {
		return function ( g, r ) {
			glow( g, 'rgba(0,0,0,0.12)', r * 0.15 );
			for ( var i = 0; i < 5; i++ ) {
				g.save();
				g.rotate( ( TAU / 5 ) * i );
				var grad = g.createLinearGradient( 0, 0, 0, -r );
				grad.addColorStop( 0, center );
				grad.addColorStop( 0.35, petal );
				grad.addColorStop( 1, edge );
				g.fillStyle = grad;
				petalPath( g, r * 0.98, notch );
				g.fill();
				g.restore();
			}
			noGlow( g );

			// Nhị hoa.
			g.strokeStyle = notch ? 'rgba(190,40,90,0.85)' : 'rgba(200,120,0,0.9)';
			g.fillStyle = notch ? '#ffe066' : '#ff8f00';
			g.lineWidth = Math.max( 0.8, r * 0.035 );
			for ( var j = 0; j < 10; j++ ) {
				var a = ( TAU / 10 ) * j;
				var len = r * ( j % 2 ? 0.32 : 0.42 );
				g.beginPath();
				g.moveTo( 0, 0 );
				g.lineTo( Math.cos( a ) * len, Math.sin( a ) * len );
				g.stroke();
				g.beginPath();
				g.arc( Math.cos( a ) * len, Math.sin( a ) * len, r * 0.055, 0, TAU );
				g.fill();
			}
			g.fillStyle = notch ? '#c2185b' : '#e65100';
			g.beginPath();
			g.arc( 0, 0, r * 0.12, 0, TAU );
			g.fill();
		};
	}

	function drawPetal( light, dark ) {
		return function ( g, r ) {
			var grad = g.createLinearGradient( 0, r * 0.5, 0, -r * 0.9 );
			grad.addColorStop( 0, dark );
			grad.addColorStop( 1, light );
			g.fillStyle = grad;
			g.translate( 0, r * 0.5 );
			petalPath( g, r, true );
			g.fill();
			g.strokeStyle = 'rgba(255,255,255,0.35)';
			g.lineWidth = Math.max( 0.6, r * 0.05 );
			g.beginPath();
			g.moveTo( 0, -r * 0.1 );
			g.quadraticCurveTo( -r * 0.05, -r * 0.5, 0, -r * 0.82 );
			g.stroke();
		};
	}

	function roundRect( g, x, y, w, h, rad ) {
		g.beginPath();
		g.moveTo( x + rad, y );
		g.arcTo( x + w, y, x + w, y + h, rad );
		g.arcTo( x + w, y + h, x, y + h, rad );
		g.arcTo( x, y + h, x, y, rad );
		g.arcTo( x, y, x + w, y, rad );
		g.closePath();
	}

	function drawEnvelope( g, r ) {
		var w = r * 1.25;
		var h = r * 1.8;
		var grad = g.createLinearGradient( 0, -h / 2, 0, h / 2 );
		grad.addColorStop( 0, '#e8262e' );
		grad.addColorStop( 1, '#a50d15' );

		glow( g, 'rgba(120,0,0,0.35)', r * 0.2 );
		g.fillStyle = grad;
		roundRect( g, -w / 2, -h / 2, w, h, r * 0.12 );
		g.fill();
		noGlow( g );

		// Nắp phong bì.
		g.fillStyle = 'rgba(0,0,0,0.12)';
		g.beginPath();
		g.moveTo( -w / 2, -h / 2 + r * 0.1 );
		g.lineTo( 0, -h * 0.12 );
		g.lineTo( w / 2, -h / 2 + r * 0.1 );
		g.closePath();
		g.fill();

		// Đồng tiền vàng.
		var gold = g.createRadialGradient( -r * 0.08, r * 0.05, 0, 0, r * 0.12, r * 0.42 );
		gold.addColorStop( 0, '#fff4b0' );
		gold.addColorStop( 0.6, '#f7c531' );
		gold.addColorStop( 1, '#c98a00' );
		g.fillStyle = gold;
		g.beginPath();
		g.arc( 0, r * 0.12, r * 0.38, 0, TAU );
		g.fill();
		g.fillStyle = '#b5121b';
		g.fillRect( -r * 0.11, r * 0.01, r * 0.22, r * 0.22 );

		g.strokeStyle = 'rgba(247,197,49,0.85)';
		g.lineWidth = Math.max( 1, r * 0.06 );
		roundRect( g, -w / 2 + r * 0.1, -h / 2 + r * 0.1, w - r * 0.2, h - r * 0.2, r * 0.08 );
		g.stroke();
	}

	function heartPath( g, r ) {
		g.beginPath();
		g.moveTo( 0, r * 0.85 );
		g.bezierCurveTo( -r * 1.25, -r * 0.05, -r * 0.6, -r * 1.05, 0, -r * 0.45 );
		g.bezierCurveTo( r * 0.6, -r * 1.05, r * 1.25, -r * 0.05, 0, r * 0.85 );
		g.closePath();
	}

	function drawHeart( light, dark ) {
		return function ( g, r ) {
			var grad = g.createLinearGradient( -r, -r, r, r );
			grad.addColorStop( 0, light );
			grad.addColorStop( 1, dark );
			glow( g, 'rgba(255,60,120,0.55)', r * 0.5 );
			g.fillStyle = grad;
			heartPath( g, r );
			g.fill();
			noGlow( g );
			g.fillStyle = 'rgba(255,255,255,0.5)';
			g.beginPath();
			g.ellipse( -r * 0.38, -r * 0.42, r * 0.2, r * 0.12, -0.6, 0, TAU );
			g.fill();
		};
	}

	function drawLantern( body, dark ) {
		return function ( g, r ) {
			var rx = r * 0.66;
			var ry = r * 0.62;

			// Quầng sáng.
			var halo = g.createRadialGradient( 0, 0, r * 0.2, 0, 0, r * 1.15 );
			halo.addColorStop( 0, 'rgba(255,170,60,0.45)' );
			halo.addColorStop( 1, 'rgba(255,120,30,0)' );
			g.fillStyle = halo;
			g.beginPath();
			g.arc( 0, 0, r * 1.15, 0, TAU );
			g.fill();

			// Thân đèn.
			var grad = g.createRadialGradient( 0, r * 0.05, r * 0.05, 0, 0, rx );
			grad.addColorStop( 0, '#fff1b8' );
			grad.addColorStop( 0.35, '#ffb347' );
			grad.addColorStop( 0.75, body );
			grad.addColorStop( 1, dark );
			g.fillStyle = grad;
			g.beginPath();
			g.ellipse( 0, 0, rx, ry, 0, 0, TAU );
			g.fill();

			// Nan đèn.
			g.strokeStyle = 'rgba(90,10,10,0.28)';
			g.lineWidth = Math.max( 0.8, r * 0.035 );
			[ 0.35, 0.7 ].forEach( function ( k ) {
				g.beginPath();
				g.ellipse( 0, 0, rx * k, ry, 0, 0, TAU );
				g.stroke();
			} );

			// Chóp & đáy vàng.
			g.fillStyle = '#f2c14e';
			roundRect( g, -rx * 0.45, -ry - r * 0.12, rx * 0.9, r * 0.16, r * 0.04 );
			g.fill();
			roundRect( g, -rx * 0.45, ry - r * 0.04, rx * 0.9, r * 0.16, r * 0.04 );
			g.fill();

			// Tua rua.
			g.strokeStyle = '#e53935';
			g.lineWidth = Math.max( 0.8, r * 0.04 );
			for ( var i = -2; i <= 2; i++ ) {
				g.beginPath();
				g.moveTo( i * r * 0.05, ry + r * 0.12 );
				g.lineTo( i * r * 0.07, ry + r * 0.42 );
				g.stroke();
			}
		};
	}

	// Dơi: lift ∈ [-1, 1] = độ nâng cánh (dựng 4 khung hình để vỗ cánh).
	function drawBat( lift ) {
		return function ( g, r ) {
			var tipY = -r * 0.55 * lift;
			glow( g, 'rgba(255,140,40,0.45)', r * 0.18 );
			g.fillStyle = '#20142c';

			[ -1, 1 ].forEach( function ( side ) {
				g.beginPath();
				g.moveTo( side * r * 0.12, -r * 0.08 );
				g.quadraticCurveTo( side * r * 0.5, tipY - r * 0.25, side * r, tipY );
				g.quadraticCurveTo( side * r * 0.82, tipY + r * 0.28, side * r * 0.68, tipY + r * 0.32 );
				g.quadraticCurveTo( side * r * 0.58, tipY * 0.5 + r * 0.12, side * r * 0.42, tipY * 0.4 + r * 0.3 );
				g.quadraticCurveTo( side * r * 0.32, r * 0.12, side * r * 0.2, r * 0.22 );
				g.quadraticCurveTo( side * r * 0.14, r * 0.12, side * r * 0.1, r * 0.16 );
				g.closePath();
				g.fill();
			} );

			// Thân + đầu + tai.
			g.beginPath();
			g.ellipse( 0, r * 0.05, r * 0.15, r * 0.24, 0, 0, TAU );
			g.fill();
			g.beginPath();
			g.arc( 0, -r * 0.2, r * 0.12, 0, TAU );
			g.fill();
			g.beginPath();
			g.moveTo( -r * 0.1, -r * 0.26 );
			g.lineTo( -r * 0.07, -r * 0.42 );
			g.lineTo( -r * 0.01, -r * 0.29 );
			g.moveTo( r * 0.1, -r * 0.26 );
			g.lineTo( r * 0.07, -r * 0.42 );
			g.lineTo( r * 0.01, -r * 0.29 );
			g.fill();
			noGlow( g );

			// Mắt.
			g.fillStyle = '#ffb300';
			g.beginPath();
			g.arc( -r * 0.045, -r * 0.21, r * 0.025, 0, TAU );
			g.arc( r * 0.045, -r * 0.21, r * 0.025, 0, TAU );
			g.fill();
		};
	}

	function drawGhost( g, r ) {
		var grad = g.createLinearGradient( 0, -r, 0, r );
		grad.addColorStop( 0, 'rgba(255,255,255,0.97)' );
		grad.addColorStop( 1, 'rgba(225,232,255,0.7)' );

		glow( g, 'rgba(170,190,255,0.75)', r * 0.35 );
		g.fillStyle = grad;
		g.beginPath();
		g.moveTo( -r * 0.6, r * 0.75 );
		g.lineTo( -r * 0.6, -r * 0.2 );
		g.arc( 0, -r * 0.2, r * 0.6, Math.PI, 0 );
		g.lineTo( r * 0.6, r * 0.75 );
		for ( var i = 0; i < 4; i++ ) {
			var x1 = r * 0.6 - ( i + 0.5 ) * r * 0.3;
			var x2 = r * 0.6 - ( i + 1 ) * r * 0.3;
			g.quadraticCurveTo( x1, i % 2 ? r * 0.95 : r * 0.55, x2, r * 0.75 );
		}
		g.closePath();
		g.fill();
		noGlow( g );

		g.fillStyle = '#2b2440';
		g.beginPath();
		g.ellipse( -r * 0.2, -r * 0.18, r * 0.09, r * 0.14, 0, 0, TAU );
		g.ellipse( r * 0.2, -r * 0.18, r * 0.09, r * 0.14, 0, 0, TAU );
		g.fill();
		g.beginPath();
		g.ellipse( 0, r * 0.12, r * 0.1, r * 0.13, 0, 0, TAU );
		g.fill();
	}

	function drawEmoji( text, glowColor ) {
		return function ( g, r ) {
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.font = Math.round( r * 2 ) + 'px ' + FONT_STACK;
			if ( glowColor ) {
				glow( g, glowColor, r * 0.9 );
			}
			g.fillText( text, 0, r * 0.08 );
		};
	}

	// =====================================================================
	// Kinds — loại hạt: hình vẽ + kích thước + kiểu chuyển động.
	// =====================================================================

	var KINDS = {
		crystal: { draw: drawCrystal, size: 1, motion: 'fall', spin: 0.9 },
		snowdot: { draw: drawDot(), size: 0.35, motion: 'fall', pad: 0 },
		glitter: { draw: drawGlitter( '#ffd54a', 'rgba(255,200,40,0.95)' ), size: 0.8, motion: 'fall', twinkle: true, spin: 0.6 },
		glitterWhite: { draw: drawGlitter( '#fff8dc', 'rgba(255,255,255,0.95)' ), size: 0.6, motion: 'fall', twinkle: true, spin: 0.6 },
		confettiGold: { draw: drawRibbon( '#d4a017', '#fff1a1' ), size: 0.75, motion: 'fall', flip: true, spin: 2.2 },
		confettiSilver: { draw: drawRibbon( '#a8b2c1', '#ffffff' ), size: 0.75, motion: 'fall', flip: true, spin: 2.2 },
		confettiRed: { draw: drawRibbon( '#d81b60', '#ff8fb1' ), size: 0.75, motion: 'fall', flip: true, spin: 2.2 },
		starGold: { draw: drawStar( '#ffe082', 'rgba(255,214,79,0.95)' ), size: 0.6, motion: 'twinkle' },
		peach: { draw: drawBlossom( '#ffc1d3', '#ff8fb1', '#ffe4ec', true ), size: 1.15, motion: 'fall', spin: 0.7, flip: true },
		apricot: { draw: drawBlossom( '#ffe14d', '#ffc400', '#fff6c2', false ), size: 1.1, motion: 'fall', spin: 0.7, flip: true },
		petalPink: { draw: drawPetal( '#ffd1dc', '#ff8fab' ), size: 0.7, motion: 'fall', spin: 1.6, flip: true, swing: 1.8 },
		petalYellow: { draw: drawPetal( '#fff3a0', '#ffc107' ), size: 0.65, motion: 'fall', spin: 1.6, flip: true, swing: 1.8 },
		envelope: { draw: drawEnvelope, size: 1.15, motion: 'fall', spin: 0.8, flip: true },
		heartPink: { draw: drawHeart( '#ff8fb8', '#e91e63' ), size: 1.15, motion: 'rise' },
		heartRed: { draw: drawHeart( '#ff6b6b', '#c2185b' ), size: 1, motion: 'rise' },
		petalRose: { draw: drawPetal( '#ff6b8a', '#b0003a' ), size: 0.7, motion: 'fall', spin: 1.6, flip: true, swing: 1.8 },
		sparklePink: { draw: drawGlitter( '#ffd6e7', 'rgba(255,105,180,0.95)' ), size: 0.55, motion: 'twinkle' },
		lanternRed: { draw: drawLantern( '#e53935', '#7f0000' ), size: 1.7, motion: 'rise', flicker: true, pad: 0.3 },
		lanternOrange: { draw: drawLantern( '#fb8c00', '#8d3a00' ), size: 1.5, motion: 'rise', flicker: true, pad: 0.3 },
		lanternYellow: { draw: drawLantern( '#fbc02d', '#9e6c00' ), size: 1.35, motion: 'rise', flicker: true, pad: 0.3 },
		bat: { frames: [ drawBat( 1 ), drawBat( 0.35 ), drawBat( -0.4 ), drawBat( 0.35 ) ], size: 1.7, motion: 'flutter', pad: 0.2 },
		ghost: { draw: drawGhost, size: 1.5, motion: 'drift', pad: 0.3 },
		ember: { draw: drawDot( 'rgba(255,170,60,1)' ), size: 0.3, motion: 'rise', twinkle: true },
	};

	// Cảnh của từng dịp: [loại hạt, trọng số]. density = hệ số số lượng so với "Amount".
	var SCENES = {
		christmas: {
			kinds: [ [ 'crystal', 4 ], [ 'snowdot', 7 ], [ 'emoji:🎁', 0.5 ], [ 'emoji:🎄', 0.35 ], [ 'emoji:⭐', 0.25 ] ],
			density: 2,
			decor: 'lights',
			lights: [ '#ff4d4d', '#ffd54a', '#4caf50', '#40c4ff', '#ff80ab' ],
		},
		newyear: {
			kinds: [ [ 'glitter', 4 ], [ 'glitterWhite', 3 ], [ 'confettiGold', 4 ], [ 'confettiSilver', 3 ], [ 'confettiRed', 1.5 ], [ 'starGold', 2 ] ],
			density: 2,
			decor: 'lights',
			lights: [ '#ffd700', '#fff3b0', '#ffb300', '#ffffff' ],
		},
		tet: {
			kinds: [ [ 'peach', 3 ], [ 'apricot', 2.5 ], [ 'petalPink', 4 ], [ 'petalYellow', 3 ], [ 'envelope', 0.9 ] ],
			density: 1.5,
			decor: 'lanterns',
		},
		valentine: {
			kinds: [ [ 'heartPink', 4 ], [ 'heartRed', 3 ], [ 'petalRose', 4 ], [ 'sparklePink', 3 ] ],
			density: 1.3,
			decor: '',
		},
		midautumn: {
			kinds: [ [ 'lanternRed', 3 ], [ 'lanternOrange', 2 ], [ 'lanternYellow', 1.5 ], [ 'starGold', 4 ], [ 'emoji:🥮', 0.4 ] ],
			density: 1,
			decor: 'moon',
		},
		halloween: {
			kinds: [ [ 'bat', 4 ], [ 'ghost', 1.5 ], [ 'emoji:🎃', 1.2 ], [ 'ember', 4 ] ],
			density: 1,
			decor: 'web',
		},
	};

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
			reducedMotion: cfg.reducedMotion !== false,
			decor: cfg.decor !== false,
			interactive: !! cfg.interactive,
			customItems: !! cfg.customItems,
		};
	}

	// Theme dựng sẵn → cảnh vẽ tay; emoji riêng / theme lạ (thêm qua filter) → cảnh emoji.
	function resolveScene( cfg ) {
		var base = SCENES[ cfg.theme ];

		if ( base && ! cfg.customItems ) {
			return base;
		}

		return {
			kinds: cfg.items.map( function ( item ) {
				return [ 'emoji:' + item, 1, cfg.motion ];
			} ),
			density: 1,
			decor: base ? base.decor : '',
			lights: base ? base.lights : null,
		};
	}

	// =====================================================================
	// Sprites
	// =====================================================================

	function buildKinds() {
		var cfg = state.cfg;
		var dpr = state.dpr;
		var cache = {};

		state.totalWeight = 0;
		state.kinds = state.scene.kinds.map( function ( entry ) {
			var name = entry[ 0 ];
			var def;

			if ( name.indexOf( 'emoji:' ) === 0 ) {
				def = {
					draw: drawEmoji( name.slice( 6 ), cfg.glow ),
					size: 1,
					motion: entry[ 2 ] || ( cfg.theme === 'midautumn' ? 'rise' : 'fall' ),
					pad: cfg.glow ? 0.6 : 0.2,
					spin: 0.6,
				};
			} else {
				def = KINDS[ name ];
			}

			var px = Math.max( 6, Math.round( cfg.size * def.size * dpr ) );
			var key = name + '|' + px;

			if ( ! cache[ key ] ) {
				cache[ key ] = def.frames ? def.frames.map( function ( fn ) {
					return sprite( px, def.pad === undefined ? 0.15 : def.pad, fn );
				} ) : [ sprite( px, def.pad === undefined ? 0.15 : def.pad, def.draw ) ];
			}

			state.totalWeight += entry[ 1 ];

			return {
				name: name,
				weight: entry[ 1 ],
				frames: cache[ key ],
				size: def.size,
				motion: def.motion,
				spin: def.spin || 0,
				flip: !! def.flip,
				twinkle: !! def.twinkle,
				flicker: !! def.flicker,
				swing: def.swing || 1,
			};
		} );
	}

	function pickKind() {
		var r = Math.random() * state.totalWeight;
		for ( var i = 0; i < state.kinds.length; i++ ) {
			r -= state.kinds[ i ].weight;
			if ( r <= 0 ) {
				return state.kinds[ i ];
			}
		}
		return state.kinds[ 0 ];
	}

	// =====================================================================
	// Particles
	// =====================================================================

	function targetCount() {
		var ratio = ( state.width * state.height ) / REF_AREA;
		var count = state.cfg.amount * ( state.scene.density || 1 );
		return Math.max( 6, Math.round( count * Math.max( 0.35, Math.min( 1, ratio ) ) ) );
	}

	function spawn( p, initial ) {
		var cfg = state.cfg;
		var w = state.width;
		var h = state.height;
		var k = pickKind();
		var margin = cfg.size * k.size * 1.5;
		var base;

		p.kind = k;
		p.frame = 0;
		p.scale = rand( 0.6, 1 );
		p.alpha = cfg.opacity * rand( 0.75, 1 );
		p.phase = rand( 0, TAU );
		p.swing = rand( 12, 34 ) * k.swing;
		p.swingSpeed = rand( 0.6, 1.5 );
		p.rot = 0;
		p.spin = k.spin ? rand( -k.spin, k.spin ) : 0;
		p.flip = rand( 0, TAU );
		p.flipSpeed = k.flip ? rand( 1.5, 4 ) : 0;
		p.vx = 0;
		p.life = 0;
		p.maxLife = 0;

		// Hạt to hơn đi nhanh hơn một chút → có chiều sâu (parallax).
		base = rand( 35, 70 ) * cfg.speed * ( 0.6 + p.scale * 0.6 );

		if ( k.motion === 'rise' ) {
			p.x = Math.random() * w;
			p.y = initial ? Math.random() * h : h + margin;
			p.vy = -base * 0.55;
			p.swing = rand( 6, 18 );
		} else if ( k.motion === 'flutter' ) {
			var dir = Math.random() < 0.5 ? -1 : 1;
			p.vx = dir * base * 1.4;
			p.vy = rand( -10, 10 ) * cfg.speed;
			p.x = initial ? Math.random() * w : ( dir > 0 ? -margin : w + margin );
			p.y = rand( h * 0.05, h * 0.8 );
			p.swing = rand( 10, 26 );
			p.swingSpeed = rand( 2, 3.5 );
		} else if ( k.motion === 'drift' ) {
			var side = Math.random() < 0.5 ? -1 : 1;
			p.vx = side * rand( 10, 22 ) * cfg.speed;
			p.vy = -rand( 4, 12 ) * cfg.speed;
			p.x = initial ? Math.random() * w : ( side > 0 ? -margin : w + margin );
			p.y = rand( h * 0.2, h * 0.9 );
			p.swing = rand( 14, 28 );
			p.swingSpeed = rand( 0.8, 1.4 );
		} else if ( k.motion === 'twinkle' ) {
			p.x = Math.random() * w;
			p.y = Math.random() * h;
			p.vx = rand( -4, 4 );
			p.vy = rand( -3, 3 );
			p.maxLife = rand( 2.5, 5 ) / Math.max( 0.5, cfg.speed );
			p.life = initial ? Math.random() * p.maxLife : 0;
		} else {
			p.x = Math.random() * w;
			p.y = initial ? Math.random() * h : -margin;
			p.vy = base;
			p.rot = rand( 0, TAU );
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
		var list = state.particles;
		var w = state.width;
		var h = state.height;
		var i, p, k, margin;

		for ( i = 0; i < list.length; i++ ) {
			p = list[ i ];
			k = p.kind;
			margin = state.cfg.size * k.size * 1.5;
			p.phase += p.swingSpeed * dt;
			p.flip += p.flipSpeed * dt;

			if ( k.motion === 'rise' ) {
				p.y += p.vy * dt;
				p.x += Math.sin( p.phase ) * p.swing * dt;
				p.rot = Math.sin( p.phase * 0.8 ) * 0.12;
				if ( p.y < -margin ) {
					spawn( p, false );
				}
			} else if ( k.motion === 'flutter' ) {
				p.x += p.vx * dt;
				p.y += ( p.vy + Math.sin( p.phase ) * p.swing * 2 ) * dt;
				p.rot = Math.sin( p.phase * 0.5 ) * 0.18;
				p.frame = ( ( p.phase * 6 ) | 0 ) % k.frames.length;
				if ( p.x < -margin * 2 || p.x > w + margin * 2 || p.y < -margin * 2 || p.y > h + margin * 2 ) {
					spawn( p, false );
				}
			} else if ( k.motion === 'drift' ) {
				p.x += p.vx * dt;
				p.y += ( p.vy + Math.cos( p.phase ) * p.swing ) * dt;
				p.rot = Math.sin( p.phase * 0.7 ) * 0.15;
				if ( p.x < -margin * 2 || p.x > w + margin * 2 || p.y < -margin * 2 ) {
					spawn( p, false );
				}
			} else if ( k.motion === 'twinkle' ) {
				p.life += dt;
				p.x += p.vx * dt;
				p.y += p.vy * dt;
				p.rot += 0.3 * dt;
				if ( p.life >= p.maxLife ) {
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

		// Hạt "bùng nổ" khi click: bay toả ra, rơi theo trọng lực, mờ dần.
		var bursts = state.bursts;
		for ( i = bursts.length - 1; i >= 0; i-- ) {
			p = bursts[ i ];
			p.life += dt;
			if ( p.life >= p.maxLife ) {
				bursts.splice( i, 1 );
				continue;
			}
			p.vy += 420 * dt;
			p.vx *= 1 - 1.2 * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.rot += p.spin * dt;
			p.flip += p.flipSpeed * dt;
			p.phase += 10 * dt;
			p.frame = p.kind.frames.length > 1 ? ( ( p.phase ) | 0 ) % p.kind.frames.length : 0;
		}
	}

	function particleAlpha( p ) {
		var k = p.kind;
		var a = p.alpha;

		if ( k.motion === 'twinkle' ) {
			a *= Math.sin( Math.PI * ( p.life / p.maxLife ) );
		} else if ( k.twinkle ) {
			a *= 0.55 + 0.45 * Math.sin( p.phase * 3.1 );
		} else if ( k.flicker ) {
			a *= 0.82 + 0.18 * Math.sin( p.phase * 5.3 ) * Math.sin( p.phase * 2.7 );
		}

		if ( p.maxLife && k.motion !== 'twinkle' ) {
			a *= 1 - p.life / p.maxLife; // Hạt burst mờ dần.
		}

		return a;
	}

	function drawParticle( ctx, p, dpr ) {
		var img = p.kind.frames[ p.frame ] || p.kind.frames[ 0 ];
		var half = img.width / 2;
		var cos = Math.cos( p.rot );
		var sin = Math.sin( p.rot );
		var sx = p.scale;
		var sy = p.scale;

		if ( p.kind.flip ) {
			// Lật 3D quanh trục dọc: co bề ngang theo cos(flip) → cánh hoa/kim tuyến/lì xì "lộn nhào".
			var f = Math.cos( p.flip );
			sx *= f < 0 ? Math.min( -0.12, f ) : Math.max( 0.12, f );
		}

		ctx.globalAlpha = Math.max( 0, Math.min( 1, particleAlpha( p ) ) );
		ctx.setTransform( cos * sx, sin * sx, -sin * sy, cos * sy, p.x * dpr, p.y * dpr );
		ctx.drawImage( img, -half, -half );
	}

	// =====================================================================
	// Decor — đồ trang trí đầu trang
	// =====================================================================

	function buildDecor() {
		var type = state.cfg.decor ? state.scene.decor : '';
		var dpr = state.dpr;
		var w = state.width;
		var scale = Math.max( 0.6, Math.min( 1, w / 1200 ) );

		state.decor = null;
		if ( ! type ) {
			return;
		}

		// Thanh admin (khi đăng nhập) nằm cố định trên cùng → đẩy đồ trang trí xuống dưới nó.
		var bar = document.getElementById( 'wpadminbar' );
		var top = 0;
		if ( bar && window.getComputedStyle( bar ).position === 'fixed' ) {
			top = bar.offsetHeight || 0;
		}

		var decor = { type: type, scale: scale, top: top };

		if ( type === 'lights' ) {
			var colors = state.scene.lights || [ '#ffd54a' ];
			var spacing = 46 * scale;
			var swag = Math.max( 220, Math.min( 420, w / 4 ) );
			var sag = 22 * scale;
			var bulbPx = Math.round( 34 * scale * dpr );
			var wire = makeCanvas( w * dpr, ( sag + 40 ) * dpr );
			var g = wire.getContext( '2d' );
			var x;

			function wireY( xx ) {
				var frac = ( xx % swag ) / swag;
				return 4 + sag * Math.sin( Math.PI * frac );
			}

			g.scale( dpr, dpr );
			g.strokeStyle = 'rgba(40,50,40,0.85)';
			g.lineWidth = 1.6;
			g.beginPath();
			for ( x = 0; x <= w; x += 4 ) {
				if ( x === 0 ) {
					g.moveTo( x, wireY( x ) );
				} else {
					g.lineTo( x, wireY( x ) );
				}
			}
			g.stroke();

			decor.wire = wire;
			decor.sprites = colors.map( function ( color ) {
				return sprite( bulbPx, 0.1, function ( gg, r ) {
					var halo = gg.createRadialGradient( 0, r * 0.15, 0, 0, r * 0.15, r );
					halo.addColorStop( 0, color );
					halo.addColorStop( 0.25, color );
					halo.addColorStop( 1, 'rgba(255,255,255,0)' );
					gg.globalAlpha = 0.55;
					gg.fillStyle = halo;
					gg.beginPath();
					gg.arc( 0, r * 0.15, r, 0, TAU );
					gg.fill();
					gg.globalAlpha = 1;
					gg.fillStyle = '#3a3a3a';
					gg.fillRect( -r * 0.1, -r * 0.42, r * 0.2, r * 0.2 );
					gg.fillStyle = color;
					gg.beginPath();
					gg.ellipse( 0, r * 0.08, r * 0.17, r * 0.27, 0, 0, TAU );
					gg.fill();
					gg.fillStyle = 'rgba(255,255,255,0.7)';
					gg.beginPath();
					gg.ellipse( -r * 0.05, r * 0.0, r * 0.05, r * 0.1, 0, 0, TAU );
					gg.fill();
				} );
			} );
			decor.bulbs = [];
			for ( x = spacing / 2; x < w; x += spacing ) {
				decor.bulbs.push( {
					x: x,
					y: wireY( x ) + 6 * scale,
					sprite: decor.sprites[ decor.bulbs.length % decor.sprites.length ],
					phase: rand( 0, TAU ),
					speed: rand( 1.2, 3 ),
				} );
			}
		} else if ( type === 'lanterns' ) {
			var lanternPx = Math.round( 64 * scale * dpr );
			decor.lantern = sprite( lanternPx, 0.35, drawLantern( '#e53935', '#7f0000' ) );
			decor.items = [
				{ x: Math.min( 90, w * 0.12 ), len: 46 * scale, phase: 0 },
				{ x: w - Math.min( 90, w * 0.12 ), len: 62 * scale, phase: 1.7 },
			];
			if ( w > 900 ) {
				decor.items.push( { x: w - Math.min( 90, w * 0.12 ) - 110 * scale, len: 30 * scale, phase: 3.1, small: true } );
			}
		} else if ( type === 'moon' ) {
			var moonR = Math.max( 34, Math.min( 70, Math.min( w, state.height ) * 0.08 ) );
			decor.r = moonR;
			decor.moon = sprite( Math.round( moonR * 2 * dpr ), 0.9, function ( gg, r ) {
				var halo = gg.createRadialGradient( 0, 0, r * 0.8, 0, 0, r * 1.9 );
				halo.addColorStop( 0, 'rgba(255,236,170,0.45)' );
				halo.addColorStop( 1, 'rgba(255,236,170,0)' );
				gg.fillStyle = halo;
				gg.beginPath();
				gg.arc( 0, 0, r * 1.9, 0, TAU );
				gg.fill();

				var disc = gg.createRadialGradient( -r * 0.3, -r * 0.3, r * 0.1, 0, 0, r );
				disc.addColorStop( 0, '#fffdf0' );
				disc.addColorStop( 0.7, '#ffeaa0' );
				disc.addColorStop( 1, '#f3c75f' );
				gg.fillStyle = disc;
				gg.beginPath();
				gg.arc( 0, 0, r, 0, TAU );
				gg.fill();

				gg.fillStyle = 'rgba(200,150,60,0.16)';
				[ [ -0.3, -0.15, 0.2 ], [ 0.25, 0.25, 0.16 ], [ 0.1, -0.4, 0.1 ], [ -0.15, 0.4, 0.12 ], [ 0.42, -0.1, 0.08 ] ].forEach( function ( c ) {
					gg.beginPath();
					gg.arc( c[ 0 ] * r, c[ 1 ] * r, c[ 2 ] * r, 0, TAU );
					gg.fill();
				} );
			} );
		} else if ( type === 'web' ) {
			var webPx = Math.round( 150 * scale * dpr );
			decor.web = makeCanvas( webPx );
			var wg = decor.web.getContext( '2d' );
			var R = webPx;
			var spokes = 7;
			var i, j;

			wg.strokeStyle = 'rgba(150,150,165,0.6)';
			wg.lineWidth = Math.max( 1, dpr * 0.9 );
			for ( i = 0; i <= spokes; i++ ) {
				var a = ( Math.PI / 2 ) * ( i / spokes );
				wg.beginPath();
				wg.moveTo( 0, 0 );
				wg.lineTo( Math.cos( a ) * R, Math.sin( a ) * R );
				wg.stroke();
			}
			for ( j = 1; j <= 6; j++ ) {
				var rr = ( R / 6.4 ) * j;
				wg.beginPath();
				for ( i = 0; i <= spokes; i++ ) {
					var aa = ( Math.PI / 2 ) * ( i / spokes );
					var px2 = Math.cos( aa ) * rr;
					var py2 = Math.sin( aa ) * rr;
					if ( i === 0 ) {
						wg.moveTo( px2, py2 );
					} else {
						var am = ( Math.PI / 2 ) * ( ( i - 0.5 ) / spokes );
						wg.quadraticCurveTo( Math.cos( am ) * rr * 0.86, Math.sin( am ) * rr * 0.86, px2, py2 );
					}
				}
				wg.stroke();
			}

			decor.spider = sprite( Math.round( 26 * scale * dpr ), 0.3, function ( gg, r ) {
				glow( gg, 'rgba(255,255,255,0.55)', r * 0.25 );
				gg.strokeStyle = '#1b1325';
				gg.lineWidth = Math.max( 1, r * 0.09 );
				for ( var s = -1; s <= 1; s += 2 ) {
					for ( var l = 0; l < 4; l++ ) {
						var ly = -r * 0.25 + l * r * 0.2;
						gg.beginPath();
						gg.moveTo( 0, ly );
						gg.quadraticCurveTo( s * r * 0.7, ly - r * 0.45, s * r * ( 0.9 + l * 0.04 ), ly + r * 0.35 );
						gg.stroke();
					}
				}
				gg.fillStyle = '#1b1325';
				gg.beginPath();
				gg.ellipse( 0, r * 0.12, r * 0.34, r * 0.42, 0, 0, TAU );
				gg.fill();
				gg.beginPath();
				gg.arc( 0, -r * 0.38, r * 0.2, 0, TAU );
				gg.fill();
				gg.fillStyle = '#ff5252';
				gg.beginPath();
				gg.arc( -r * 0.07, -r * 0.42, r * 0.05, 0, TAU );
				gg.arc( r * 0.07, -r * 0.42, r * 0.05, 0, TAU );
				gg.fill();
			} );
			decor.spiderX = Math.min( w - 40, Math.max( 160, w * 0.82 ) );
			decor.spiderLen = Math.min( 140, state.height * 0.18 ) * scale;
		}

		state.decor = decor;
	}

	function drawDecor( ctx, dpr, t ) {
		var d = state.decor;
		var w = state.width;
		var alpha = Math.max( 0.75, state.cfg.opacity );
		var i, b, img, s, oy;

		if ( ! d ) {
			return;
		}

		oy = d.top * dpr;

		ctx.globalAlpha = alpha;

		if ( d.type === 'lights' ) {
			ctx.setTransform( 1, 0, 0, 1, 0, oy );
			ctx.drawImage( d.wire, 0, 0 );
			for ( i = 0; i < d.bulbs.length; i++ ) {
				b = d.bulbs[ i ];
				img = b.sprite;
				ctx.globalAlpha = alpha * ( 0.45 + 0.55 * ( 0.5 + 0.5 * Math.sin( t * b.speed + b.phase ) ) );
				ctx.drawImage( img, b.x * dpr - img.width / 2, b.y * dpr - img.height / 2 );
			}
		} else if ( d.type === 'lanterns' ) {
			for ( i = 0; i < d.items.length; i++ ) {
				b = d.items[ i ];
				img = d.lantern;
				s = b.small ? 0.7 : 1;
				var angle = 0.07 * Math.sin( t * 1.3 + b.phase );
				var cos = Math.cos( angle );
				var sin = Math.sin( angle );
				var len = b.len * dpr;
				var drop = len + img.width * 0.2 * s;

				// Dây treo + đèn quay quanh điểm treo (đỉnh màn hình).
				ctx.setTransform( cos, sin, -sin, cos, b.x * dpr, oy );
				ctx.strokeStyle = 'rgba(160,40,30,0.9)';
				ctx.lineWidth = 1.5 * dpr;
				ctx.beginPath();
				ctx.moveTo( 0, 0 );
				ctx.lineTo( 0, len );
				ctx.stroke();
				ctx.setTransform( cos * s, sin * s, -sin * s, cos * s, b.x * dpr - sin * drop, oy + cos * drop );
				ctx.drawImage( img, -img.width / 2, -img.height / 2 );
			}
		} else if ( d.type === 'moon' ) {
			img = d.moon;
			ctx.globalAlpha = alpha * ( 0.92 + 0.08 * Math.sin( t * 0.8 ) );
			ctx.setTransform( 1, 0, 0, 1, 0, oy );
			ctx.drawImage( img, ( w - d.r * 2.1 ) * dpr - img.width / 2, d.r * 2.1 * dpr - img.height / 2 );
		} else if ( d.type === 'web' ) {
			img = d.web;
			ctx.setTransform( 1, 0, 0, 1, 0, oy );
			ctx.drawImage( img, 0, 0 );
			ctx.setTransform( -1, 0, 0, 1, w * dpr, oy );
			ctx.drawImage( img, 0, 0 );

			var bob = d.spiderLen * ( 0.75 + 0.25 * Math.sin( t * 0.9 ) );
			ctx.setTransform( 1, 0, 0, 1, 0, oy );
			ctx.strokeStyle = 'rgba(150,150,165,0.75)';
			ctx.lineWidth = dpr;
			ctx.beginPath();
			ctx.moveTo( d.spiderX * dpr, 0 );
			ctx.lineTo( d.spiderX * dpr, bob * dpr );
			ctx.stroke();
			img = d.spider;
			ctx.drawImage( img, d.spiderX * dpr - img.width / 2, bob * dpr );
		}

		ctx.globalAlpha = 1;
	}

	// =====================================================================
	// Interactive burst
	// =====================================================================

	function onPointerDown( e ) {
		if ( ! state.running || ! state.cfg || ! state.cfg.interactive ) {
			return;
		}
		if ( e.button !== undefined && e.button !== 0 ) {
			return;
		}
		burst( e.clientX, e.clientY, 12 );
	}

	function burst( x, y, count ) {
		var cfg = state.cfg;
		var room = MAX_BURST - state.bursts.length;
		count = Math.min( count || 12, room );

		for ( var i = 0; i < count; i++ ) {
			var k = pickKind();
			var angle = rand( 0, TAU );
			var speed = rand( 140, 340 ) * Math.min( 1.6, cfg.speed );
			state.bursts.push( {
				kind: k,
				frame: 0,
				x: x,
				y: y,
				vx: Math.cos( angle ) * speed,
				vy: Math.sin( angle ) * speed - 160,
				scale: rand( 0.45, 0.85 ),
				alpha: 1,
				rot: rand( 0, TAU ),
				spin: rand( -6, 6 ),
				flip: rand( 0, TAU ),
				flipSpeed: k.flip ? rand( 4, 8 ) : 0,
				phase: rand( 0, TAU ),
				life: 0,
				maxLife: rand( 0.9, 1.4 ),
			} );
		}

		if ( state.running && ! state.raf ) {
			state.raf = window.requestAnimationFrame( frame );
		}
	}

	// =====================================================================
	// Loop
	// =====================================================================

	function render() {
		var ctx = state.ctx;
		var dpr = state.dpr;
		var list = state.particles;
		var i;

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.clearRect( 0, 0, state.canvas.width, state.canvas.height );

		for ( i = 0; i < list.length; i++ ) {
			drawParticle( ctx, list[ i ], dpr );
		}

		drawDecor( ctx, dpr, state.time );

		for ( i = 0; i < state.bursts.length; i++ ) {
			drawParticle( ctx, state.bursts[ i ], dpr );
		}

		ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		ctx.globalAlpha = 1;
	}

	function frame( now ) {
		state.raf = 0;
		if ( ! state.running ) {
			return;
		}

		var dt = state.last ? Math.min( MAX_DT, ( now - state.last ) / 1000 ) : 0;
		state.last = now;
		state.time += dt;

		update( dt );
		render();

		state.raf = window.requestAnimationFrame( frame );
	}

	// =====================================================================
	// Canvas / lifecycle
	// =====================================================================

	function resize() {
		state.resizeQueued = false;
		if ( ! state.canvas ) {
			return;
		}

		var dpr = Math.min( MAX_DPR, window.devicePixelRatio || 1 );
		var dprChanged = dpr !== state.dpr;
		var widthChanged = window.innerWidth !== state.width;

		state.width = window.innerWidth;
		state.height = window.innerHeight;
		state.dpr = dpr;
		state.canvas.width = Math.round( state.width * dpr );
		state.canvas.height = Math.round( state.height * dpr );

		if ( dprChanged || ! state.kinds.length ) {
			buildKinds();
			state.particles.forEach( function ( p ) {
				spawn( p, true );
			} );
		}

		if ( dprChanged || widthChanged || ! state.decor ) {
			buildDecor();
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
			state.raf = 0;
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
		document.removeEventListener( 'pointerdown', onPointerDown );

		if ( state.canvas && state.canvas.parentNode ) {
			state.canvas.parentNode.removeChild( state.canvas );
		}

		state.canvas = null;
		state.ctx = null;
		state.kinds = [];
		state.particles = [];
		state.bursts = [];
		state.decor = null;
		state.raf = 0;
		state.last = 0;
		state.time = 0;
		state.width = 0;
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
		state.scene = resolveScene( cfg );
		state.canvas = canvas;
		state.ctx = ctx;
		state.dpr = 0; // Ép resize() dựng sprite lần đầu.

		document.body.appendChild( canvas );
		resize();

		window.addEventListener( 'resize', onResize, { passive: true } );
		document.addEventListener( 'visibilitychange', onVisibility );
		if ( cfg.interactive ) {
			document.addEventListener( 'pointerdown', onPointerDown, { passive: true } );
		}

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
		burst: function ( x, y, count ) {
			if ( state.canvas ) {
				burst( x, y, count );
			}
		},
		isRunning: function () {
			return !! state.canvas;
		},
		scenes: function () {
			return Object.keys( SCENES );
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
