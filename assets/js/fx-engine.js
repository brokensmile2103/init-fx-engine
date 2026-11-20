/**
 * Init FX Engine — effect registry, public API, keyword triggers and shortcode/block triggers.
 *
 * Từ 2.0.2 file này chỉ được tải khi trang thực sự cần (có từ khóa, shortcode, block FX Trigger,
 * hoặc lời chào theo mùa). Phần định dạng nội tuyến + spoiler đã tách sang fx-inline.js.
 *
 * Public API:
 *   FXEngine.trigger( name, options )   — chạy 1 hiệu ứng.
 *   FXEngine.register( name, fn )       — đăng ký hiệu ứng riêng.
 *   FXEngine.effects()                  — danh sách hiệu ứng.
 *   FXEngine.scan( root )               — quét lại từ khóa + shortcode trong vùng DOM mới (AJAX...).
 *   window.runEffect( name, options )   — tên cũ, vẫn giữ để tương thích.
 */

// Dùng var (không dùng const/let ở top-level) để file có lỡ bị nạp 2 lần cũng không lỗi redeclare.
var INIT_FX_EFFECTS = window.INIT_FX_EFFECTS = window.INIT_FX_EFFECTS || {};

( function ( window, document ) {
	'use strict';

	var Z_INDEX = 1000;

	function runEffect( name, options ) {
		var effect = INIT_FX_EFFECTS[ name ];

		if ( typeof effect === 'function' ) {
			effect( options );
		} else if ( window.console ) {
			window.console.warn( '[Init FX Engine] Unknown effect:', name );
		}
	}

	window.runEffect = runEffect;

	window.FXEngine = window.FXEngine || {};
	window.FXEngine.trigger = runEffect;
	window.FXEngine.register = function ( name, fn ) {
		if ( name && typeof fn === 'function' ) {
			INIT_FX_EFFECTS[ name ] = fn;
		}
	};
	window.FXEngine.effects = function () {
		return Object.keys( INIT_FX_EFFECTS );
	};

	// =====================================================================
	// Helpers
	// =====================================================================

	function hasConfetti() {
		return typeof window.confetti === 'function';
	}

	// Gọi confetti với zIndex mặc định thống nhất cho mọi hiệu ứng.
	function fx( opts ) {
		if ( ! hasConfetti() ) {
			return null;
		}
		if ( opts.zIndex === undefined ) {
			opts.zIndex = Z_INDEX;
		}
		return window.confetti( opts );
	}

	function extend( target ) {
		for ( var i = 1; i < arguments.length; i++ ) {
			var src = arguments[ i ];
			for ( var key in src ) {
				if ( Object.prototype.hasOwnProperty.call( src, key ) ) {
					target[ key ] = src[ key ];
				}
			}
		}
		return target;
	}

	function rand( min, max ) {
		return Math.random() * ( max - min ) + min;
	}

	// confetti.shapeFromText/shapeFromPath tạo canvas + bitmap mỗi lần gọi → cache lại.
	var shapeCache = window.__initFxShapeCache = window.__initFxShapeCache || new Map();

	function textShape( text, scalar ) {
		var key = 't|' + text + '|' + scalar;
		var shape = shapeCache.get( key );
		if ( ! shape ) {
			shape = window.confetti.shapeFromText( { text: text, scalar: scalar } );
			shapeCache.set( key, shape );
		}
		return shape;
	}

	function pathShape( key, path, matrix ) {
		var shape = shapeCache.get( 'p|' + key );
		if ( ! shape ) {
			shape = window.confetti.shapeFromPath( matrix ? { path: path, matrix: matrix } : { path: path } );
			shapeCache.set( 'p|' + key, shape );
		}
		return shape;
	}

	// Chạy fn mỗi khung hình trong `duration` ms, cứ `every` khung mới phát 1 lần (nhẹ CPU).
	function loop( duration, every, fn ) {
		var end = Date.now() + duration;
		var tick = 0;

		( function frame() {
			if ( tick++ % every === 0 ) {
				fn( end - Date.now() );
			}
			if ( Date.now() < end ) {
				window.requestAnimationFrame( frame );
			}
		} )();
	}

	// =====================================================================
	// Classic effects
	// =====================================================================

	function firework() {
		var duration = 5000;
		var end = Date.now() + duration;
		var defaults = { startVelocity: 30, spread: 360, ticks: 60 };

		var interval = window.setInterval( function () {
			var timeLeft = end - Date.now();
			if ( timeLeft <= 0 ) {
				window.clearInterval( interval );
				return;
			}

			var particleCount = 50 * ( timeLeft / duration );

			fx( extend( {}, defaults, { particleCount: particleCount, origin: { x: rand( 0.1, 0.3 ), y: Math.random() - 0.2 } } ) );
			fx( extend( {}, defaults, { particleCount: particleCount, origin: { x: rand( 0.7, 0.9 ), y: Math.random() - 0.2 } } ) );
		}, 250 );
	}

	function starlightBurst() {
		var defaults = {
			spread: 360,
			ticks: 50,
			gravity: 0,
			decay: 0.94,
			startVelocity: 30,
			colors: [ '#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8' ],
		};

		function shoot() {
			fx( extend( {}, defaults, { particleCount: 40, scalar: 1.2, shapes: [ 'star' ] } ) );
			fx( extend( {}, defaults, { particleCount: 10, scalar: 0.75, shapes: [ 'circle' ] } ) );
		}

		window.setTimeout( shoot, 0 );
		window.setTimeout( shoot, 100 );
		window.setTimeout( shoot, 200 );
	}

	function emojiRain( emoji ) {
		var scalar = 2;
		var shape = textShape( typeof emoji === 'string' && emoji ? emoji : '😂', scalar );
		var defaults = {
			spread: 360,
			ticks: 60,
			gravity: 0,
			decay: 0.96,
			startVelocity: 20,
			shapes: [ shape ],
			scalar: scalar,
		};

		function shoot() {
			fx( extend( {}, defaults, { particleCount: 30 } ) );
			fx( extend( {}, defaults, { particleCount: 5, flat: true } ) );
			fx( extend( {}, defaults, { particleCount: 15, scalar: scalar / 2, shapes: [ 'circle' ] } ) );
		}

		window.setTimeout( shoot, 0 );
		window.setTimeout( shoot, 100 );
		window.setTimeout( shoot, 200 );
	}

	function schoolPride() {
		var colors = [ '#bb0000', '#ffffff' ];

		loop( 5000, 1, function () {
			fx( { particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: colors } );
			fx( { particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: colors } );
		} );
	}

	function celebrationBurst() {
		loop( 5000, 1, function () {
			fx( { particleCount: 7, angle: 60, spread: 55, origin: { x: 0 } } );
			fx( { particleCount: 7, angle: 120, spread: 55, origin: { x: 1 } } );
		} );
	}

	function heartRain() {
		var heart = pathShape(
			'heart',
			'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
			[ 0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333 ]
		);

		loop( 4000, 1, function () {
			fx( {
				scalar: 2,
				spread: 180,
				particleCount: 3,
				origin: { y: -0.1 },
				startVelocity: -35,
				shapes: [ heart ],
				colors: [ '#f93963', '#a10864', '#ee0b93' ],
			} );
		} );
	}

	function cannonBlast() {
		fx( {
			particleCount: 120,
			spread: 90,
			startVelocity: 40,
			gravity: 0.7,
			scalar: 1.2,
			origin: { y: 0.6 },
		} );
	}

	// =====================================================================
	// Seasonal effects (2.0.1, làm mới ở 2.0.2)
	// =====================================================================

	// 🎃 Halloween: bí ngô, ma, dơi bung ra rồi lộn nhào rơi xuống + kim tuyến cam/tím/xanh độc.
	function halloweenBurst() {
		var scalar = 2.6;
		var shapes = [ '🎃', '👻', '🦇' ].map( function ( t ) {
			return textShape( t, scalar );
		} );
		var colors = [ '#ff7518', '#8e3fd6', '#ffb347', '#39ff14', '#2b1b3f' ];

		fx( { particleCount: 18, spread: 360, startVelocity: 32, gravity: 0.55, decay: 0.92, ticks: 140, shapes: shapes, scalar: scalar, origin: { y: 0.45 } } );
		fx( { particleCount: 70, spread: 360, startVelocity: 38, gravity: 0.6, decay: 0.91, ticks: 120, colors: colors, scalar: 0.9, origin: { y: 0.45 } } );

		window.setTimeout( function () {
			fx( { particleCount: 10, angle: 60, spread: 50, startVelocity: 45, origin: { x: 0, y: 0.7 }, shapes: shapes, scalar: scalar } );
			fx( { particleCount: 10, angle: 120, spread: 50, startVelocity: 45, origin: { x: 1, y: 0.7 }, shapes: shapes, scalar: scalar } );
		}, 250 );
	}

	// 🧧 Tết: bao lì xì lật lộn rơi xuống, hoa đào/mai + kim tuyến đỏ vàng, mở màn bằng 1 chùm vàng.
	function luckyMoney() {
		var scalar = 2.4;
		var envelopes = [ textShape( '🧧', scalar ) ];
		var flowers = [ '🌸', '🌼' ].map( function ( t ) {
			return textShape( t, scalar * 0.8 );
		} );
		var colors = [ '#d4141c', '#ffcc00', '#ff4d4d', '#ffd700', '#fff1a8' ];

		fx( { particleCount: 60, spread: 120, startVelocity: 45, origin: { y: 0.65 }, colors: [ '#ffd700', '#ffcc00', '#fff1a8' ], shapes: [ 'star', 'circle' ], scalar: 1.1 } );

		loop( 3500, 3, function () {
			fx( {
				particleCount: 1,
				startVelocity: 0,
				ticks: 320,
				gravity: 0.5,
				drift: rand( -0.5, 0.5 ),
				origin: { x: Math.random(), y: -0.05 },
				shapes: Math.random() < 0.55 ? envelopes : flowers,
				scalar: scalar,
			} );
			fx( {
				particleCount: 3,
				startVelocity: 0,
				ticks: 260,
				gravity: 0.7,
				origin: { x: Math.random(), y: -0.05 },
				colors: colors,
				shapes: [ 'square', 'circle' ],
				scalar: 0.9,
			} );
		} );
	}

	// 🌸 Tết: mưa cánh hoa đào & hoa mai (vẽ bằng path → lật lượn tự nhiên như cánh hoa thật).
	function blossomRain() {
		var petal = pathShape( 'petal', 'M0 -10 C 6 -8 9 -2 7 4 C 5 9 1 10 0 7 C -1 10 -5 9 -7 4 C -9 -2 -6 -8 0 -10 Z' );
		var peach = [ '#ffb7c5', '#ff9eb5', '#ffc8d6', '#ff8fab' ];
		var apricot = [ '#ffd23f', '#ffc107', '#ffe066' ];

		loop( 5000, 2, function () {
			var isApricot = Math.random() < 0.4;
			fx( {
				particleCount: 2,
				startVelocity: 0,
				ticks: 400,
				gravity: 0.6,
				drift: rand( -0.8, 0.8 ),
				origin: { x: Math.random(), y: -0.05 },
				shapes: [ petal ],
				colors: isApricot ? apricot : peach,
				scalar: rand( 1.1, 1.6 ),
			} );
		} );
	}

	// ❄️ Giáng sinh: bông tuyết bung ra từ giữa màn hình.
	function snowBurst() {
		var scalar = 2;
		var flake = textShape( '❄️', scalar );
		var defaults = {
			spread: 360,
			ticks: 140,
			gravity: 0.3,
			decay: 0.93,
			startVelocity: 26,
			origin: { y: 0.4 },
		};

		function shoot() {
			fx( extend( {}, defaults, { particleCount: 18, shapes: [ flake ], scalar: scalar } ) );
			fx( extend( {}, defaults, { particleCount: 34, shapes: [ 'circle' ], colors: [ '#ffffff', '#dff4ff', '#b3e5ff' ], scalar: 0.8 } ) );
		}

		window.setTimeout( shoot, 0 );
		window.setTimeout( shoot, 180 );
	}

	// 🏮 Trung Thu: đèn lồng bay lên từ dưới đáy màn hình.
	function lanternRise() {
		var scalar = 2.4;
		var shapes = [ '🏮', '🏮', '🥮' ].map( function ( t ) {
			return textShape( t, scalar );
		} );

		loop( 2500, 6, function () {
			fx( {
				particleCount: 1,
				angle: 90,
				spread: 30,
				startVelocity: rand( 14, 22 ),
				decay: 0.97,
				gravity: -0.12,
				ticks: 360,
				drift: rand( -0.3, 0.3 ),
				origin: { x: rand( 0.05, 0.95 ), y: 1.05 },
				shapes: shapes,
				scalar: scalar,
				flat: true,
			} );
		} );
	}

	// 🎆 Pháo hoa thật (fireworks-js, MIT) — chỉ tải thư viện khi thực sự cần (lazy load ~10KB).
	var fireworksLoader = null;
	var fireworksCurrent = null;
	var fireworksTimer = 0;

	function getFireworksCtor() {
		return window.Fireworks && ( window.Fireworks.Fireworks || window.Fireworks.default );
	}

	function loadFireworksLib() {
		if ( getFireworksCtor() ) {
			return Promise.resolve( getFireworksCtor() );
		}
		if ( fireworksLoader ) {
			return fireworksLoader;
		}

		var src = window.INIT_FX && window.INIT_FX.assets && window.INIT_FX.assets.fireworks;
		if ( ! src ) {
			return Promise.reject( new Error( 'fireworks-js URL missing' ) );
		}

		fireworksLoader = new Promise( function ( resolve, reject ) {
			var script = document.createElement( 'script' );
			script.src = src;
			script.async = true;
			script.onload = function () {
				if ( getFireworksCtor() ) {
					resolve( getFireworksCtor() );
				} else {
					reject( new Error( 'fireworks-js not available' ) );
				}
			};
			script.onerror = function () {
				reject( new Error( 'fireworks-js failed to load' ) );
			};
			document.head.appendChild( script );
		} ).catch( function ( err ) {
			fireworksLoader = null; // Cho phép thử lại lần sau.
			throw err;
		} );

		return fireworksLoader;
	}

	function fireworksShow( options ) {
		var duration = Math.max( 2000, Math.min( 20000, Number( options ) || 6000 ) );

		loadFireworksLib().then( function ( Fireworks ) {
			function scheduleEnd( show, holder ) {
				window.clearTimeout( fireworksTimer );
				fireworksTimer = window.setTimeout( function () {
					// Gọi lại trong lúc đang tắt dần → tạo show mới thay vì dùng show sắp đóng.
					if ( fireworksCurrent && fireworksCurrent.show === show ) {
						fireworksCurrent = null;
					}
					holder.style.opacity = '0';
					show.waitStop( true ).then( function () {
						if ( holder.parentNode ) {
							holder.parentNode.removeChild( holder );
						}
					} );
				}, duration );
			}

			// Đang bắn rồi → kéo dài show thay vì tạo thêm canvas mới.
			// (Không dùng show.launch(): hàm này tự gọi waitStop() và sẽ kết thúc show sớm.)
			if ( fireworksCurrent ) {
				scheduleEnd( fireworksCurrent.show, fireworksCurrent.holder );
				return;
			}

			var holder = document.createElement( 'div' );
			holder.className = 'init-fx-fireworks';
			holder.setAttribute( 'aria-hidden', 'true' );
			// Nền "bầu trời đêm" mờ dần vào/ra → pháo hoa vẫn rực rỡ trên các theme nền trắng.
			holder.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:' + Z_INDEX + ';pointer-events:none;overflow:hidden;background:radial-gradient(ellipse at 50% 120%,rgba(30,20,70,.55),rgba(4,8,28,.7));opacity:0;transition:opacity .6s ease;';
			document.body.appendChild( holder );
			window.requestAnimationFrame( function () {
				holder.style.opacity = '1';
			} );

			var show = new Fireworks( holder, {
				autoresize: true,
				opacity: 0.5,
				acceleration: 1.05,
				friction: 0.97,
				gravity: 1.5,
				particles: 70,
				traceLength: 3,
				traceSpeed: 10,
				explosion: 6,
				intensity: 32,
				flickering: 50,
				lineStyle: 'round',
				hue: { min: 0, max: 360 },
				delay: { min: 25, max: 50 },
				rocketsPoint: { min: 20, max: 80 },
				lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
				brightness: { min: 50, max: 80 },
				decay: { min: 0.015, max: 0.03 },
				mouse: { click: false, move: false, max: 1 },
				sound: { enabled: false },
			} );

			fireworksCurrent = { show: show, holder: holder };
			show.start();
			scheduleEnd( show, holder );
		} ).catch( function () {
			// Không tải được thư viện → dùng pháo hoa confetti sẵn có.
			firework();
		} );
	}

	extend( INIT_FX_EFFECTS, {
		firework: firework,
		starlightBurst: starlightBurst,
		emojiRain: emojiRain,
		schoolPride: schoolPride,
		celebrationBurst: celebrationBurst,
		heartRain: heartRain,
		cannonBlast: cannonBlast,
		halloweenBurst: halloweenBurst,
		luckyMoney: luckyMoney,
		blossomRain: blossomRain,
		snowBurst: snowBurst,
		lanternRise: lanternRise,
		fireworksShow: fireworksShow,
	} );

	// =====================================================================
	// Keyword triggers
	// =====================================================================

	var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1, SVG: 1, MATH: 1, INPUT: 1, SELECT: 1, OPTION: 1, BUTTON: 1, TITLE: 1, TEMPLATE: 1 };
	var PROCESSED_ATTR = 'data-fx-keyword-processed';
	var keywordMatcher;

	function escapeRx( s ) {
		return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	}

	// Dựng regex 1 lần. Ưu tiên lookbehind Unicode; trình duyệt cũ (Safari < 16.4) không hỗ trợ
	// → fallback dùng nhóm tiền tố, không làm chết cả file như trước.
	function buildKeywordMatcher() {
		var source = window.FX_KEYWORDS;
		var all = [];

		if ( ! source || typeof source !== 'object' ) {
			return null;
		}

		Object.keys( source ).forEach( function ( effect ) {
			( source[ effect ] || [] ).forEach( function ( entry ) {
				if ( entry && entry.keyword ) {
					var kw = String( entry.keyword );
					all.push( { kw: kw, kwLower: kw.toLowerCase(), effect: effect, emoji: entry.emoji || null } );
				}
			} );
		} );

		if ( ! all.length ) {
			return null;
		}

		// Dedup (ưu tiên chuỗi dài hơn), sort dài → ngắn để tránh match bán phần.
		var byKey = new Map();
		all.forEach( function ( item ) {
			var prev = byKey.get( item.kwLower );
			if ( ! prev || item.kw.length > prev.kw.length ) {
				byKey.set( item.kwLower, item );
			}
		} );

		var list = Array.from( byKey.values() ).sort( function ( a, b ) {
			return b.kw.length - a.kw.length;
		} );
		var alternation = list.map( function ( i ) {
			return escapeRx( i.kw );
		} ).join( '|' );
		var regex;
		var prefixGroup = false;

		try {
			regex = new RegExp( '(?<![\\p{L}\\p{N}_])(' + alternation + ')(?![\\p{L}\\p{N}_])', 'giu' );
		} catch ( e ) {
			regex = new RegExp( '(^|[^\\p{L}\\p{N}_])(' + alternation + ')(?![\\p{L}\\p{N}_])', 'giu' );
			prefixGroup = true;
		}

		return {
			regex: regex,
			prefixGroup: prefixGroup,
			lookup: new Map( list.map( function ( i ) {
				return [ i.kwLower, i ];
			} ) ),
		};
	}

	function bindKeywordClicks( root ) {
		if ( root.__fxKwDelegated ) {
			return;
		}
		root.__fxKwDelegated = true;

		root.addEventListener( 'click', function ( e ) {
			var a = e.target && e.target.closest ? e.target.closest( 'a.fx-keyword' ) : null;
			if ( ! a ) {
				return;
			}
			e.preventDefault();
			runEffect( a.dataset.effect || '', a.dataset.emoji || null );
		} );
	}

	function replaceKeywords( root ) {
		if ( keywordMatcher === undefined ) {
			keywordMatcher = buildKeywordMatcher();
		}
		if ( ! keywordMatcher || ! root ) {
			return;
		}

		var regex = keywordMatcher.regex;
		var lookup = keywordMatcher.lookup;
		var prefixGroup = keywordMatcher.prefixGroup;

		bindKeywordClicks( document.body );

		var walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT, {
			acceptNode: function ( node ) {
				var p = node.parentElement;
				if ( ! node.nodeValue || ! p || SKIP_TAGS[ p.tagName ] ) {
					return NodeFilter.FILTER_REJECT;
				}
				if ( p.isContentEditable || p.closest( 'a, [contenteditable], .fx-no-keywords' ) || p.hasAttribute( PROCESSED_ATTR ) ) {
					return NodeFilter.FILTER_REJECT;
				}
				regex.lastIndex = 0;
				return regex.test( node.nodeValue ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			},
		} );

		var nodes = [];
		var toMark = new Set();
		for ( var n = walker.nextNode(); n; n = walker.nextNode() ) {
			nodes.push( n );
		}

		nodes.forEach( function ( textNode ) {
			var text = textNode.nodeValue;
			var frag = document.createDocumentFragment();
			var last = 0;
			var m;

			regex.lastIndex = 0;
			while ( ( m = regex.exec( text ) ) ) {
				var prefix = prefixGroup ? m[ 1 ] : '';
				var matched = prefixGroup ? m[ 2 ] : m[ 1 ];
				var start = m.index + prefix.length;

				if ( start > last ) {
					frag.appendChild( document.createTextNode( text.slice( last, start ) ) );
				}

				var meta = lookup.get( matched.toLowerCase() );
				var a = document.createElement( 'a' );
				a.href = '#';
				a.className = 'fx-keyword';
				a.setAttribute( 'role', 'button' );
				a.dataset.effect = meta ? meta.effect : '';
				if ( meta && meta.emoji ) {
					a.dataset.emoji = meta.emoji;
				}
				a.textContent = matched; // Giữ nguyên hoa/thường như trong nội dung.

				frag.appendChild( a );
				last = start + matched.length;
				regex.lastIndex = last;
			}

			if ( last < text.length ) {
				frag.appendChild( document.createTextNode( text.slice( last ) ) );
			}

			var parent = textNode.parentNode;
			parent.replaceChild( frag, textNode );
			if ( parent.nodeType === 1 ) {
				toMark.add( parent );
			}
		} );

		// Đánh dấu để không quét lại cùng vùng.
		toMark.forEach( function ( el ) {
			el.setAttribute( PROCESSED_ATTR, '1' );
		} );
	}

	// =====================================================================
	// Shortcode / block triggers
	// =====================================================================

	var inViewObserver = null;

	function bindTriggers( root ) {
		var els = ( root || document ).querySelectorAll( '.fx-shortcode' );

		Array.prototype.forEach.call( els, function ( el ) {
			if ( el.__fxBound ) {
				return;
			}
			el.__fxBound = true;

			var trigger = el.dataset.trigger || 'click';

			if ( trigger === 'immediate' ) {
				runEffect( el.dataset.effect, el.dataset.emoji );
			} else if ( trigger === 'click' ) {
				el.addEventListener( 'click', function ( e ) {
					e.preventDefault();
					runEffect( el.dataset.effect, el.dataset.emoji );
				} );
				// Phần tử không phải <a>/<button> (đã có role=button + tabindex) → hỗ trợ Enter/Space.
				if ( el.tagName !== 'A' && el.tagName !== 'BUTTON' ) {
					el.addEventListener( 'keydown', function ( e ) {
						if ( e.key === 'Enter' || e.key === ' ' ) {
							e.preventDefault();
							runEffect( el.dataset.effect, el.dataset.emoji );
						}
					} );
				}
			} else if ( trigger === 'hover' ) {
				el.addEventListener( 'mouseenter', function () {
					runEffect( el.dataset.effect, el.dataset.emoji );
				} );
			} else if ( trigger === 'in-view' ) {
				if ( ! ( 'IntersectionObserver' in window ) ) {
					runEffect( el.dataset.effect, el.dataset.emoji );
					return;
				}
				// 1 IntersectionObserver dùng chung cho mọi phần tử "in-view".
				if ( ! inViewObserver ) {
					inViewObserver = new IntersectionObserver( function ( entries ) {
						entries.forEach( function ( entry ) {
							if ( ! entry.isIntersecting ) {
								return;
							}
							inViewObserver.unobserve( entry.target );
							runEffect( entry.target.dataset.effect, entry.target.dataset.emoji );
						} );
					}, { threshold: 0.3 } );
				}
				inViewObserver.observe( el );
			}
		} );
	}

	function scan( root ) {
		root = root || document.body;
		replaceKeywords( root );
		bindTriggers( root );
	}

	window.FXEngine.scan = scan;

	// Tương thích ngược: bản cũ khai báo các hàm này ở phạm vi global (firework(), cannonBlast()...,
	// replaceFXKeywordsInDOM()). Giữ lại làm alias cho code tùy biến của người dùng.
	Object.keys( INIT_FX_EFFECTS ).forEach( function ( name ) {
		if ( ! ( name in window ) ) {
			window[ name ] = INIT_FX_EFFECTS[ name ];
		}
	} );
	window.replaceFXKeywordsInDOM = window.replaceFXKeywordsInDOM || replaceKeywords;

	// Chạy được cả khi script bị trì hoãn (defer/async/delay JS của plugin cache) sau DOMContentLoaded.
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', function () {
			scan();
		} );
	} else {
		scan();
	}
}( window, document ) );
