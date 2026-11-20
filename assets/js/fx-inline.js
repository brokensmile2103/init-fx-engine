/**
 * Init FX Engine — Inline formatting + spoilers.
 *
 * Cú pháp: *bold*, `italic`, ~strike~, ^mark^, _highlight_, ||spoiler||
 *
 * Từ 2.0.2:
 * - Tách khỏi fx-engine.js → không cần tải canvas-confetti chỉ để định dạng chữ.
 * - Không dùng regex lookbehind → không còn lỗi cú pháp làm chết cả file trên Safari cũ.
 * - Bỏ qua textarea / input / contenteditable (trước đây có thể làm hỏng nội dung form).
 * - Spoiler: nền mờ nhòe (blur) thay cho nền xám; nhãn "Tap to reveal" dạng viên thuốc
 *   kính mờ, tự ẩn khi đoạn spoiler quá ngắn.
 *
 * API: window.FXInline.format( root ) — định dạng lại vùng DOM mới (AJAX...).
 */
( function ( window, document ) {
	'use strict';

	if ( window.FXInline ) {
		return;
	}

	var I18N = ( window.INIT_FX && window.INIT_FX.i18n ) || {};
	var SPOILER_LABEL = I18N.tap_to_reveal || 'Tap to reveal';
	var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, KBD: 1, SAMP: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, NOSCRIPT: 1, TITLE: 1, TEMPLATE: 1, SVG: 1, MATH: 1 };
	var SKIP_SELECTOR = '[contenteditable], .fx-no-format, #wpadminbar, .fx-spoiler, svg, math';
	var MARKER_RX = /[*`~^_]/;

	function escapeRx( s ) {
		return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	}

	function makeRule( marker, tag, className ) {
		var m = escapeRx( marker );
		return {
			marker: marker,
			tag: tag,
			className: className || '',
			regex: new RegExp( m + '([^\\s' + m + '][^' + m + ']*?[^\\s' + m + ']|[^\\s' + m + '])' + m, 'g' ),
		};
	}

	var RULES = [
		makeRule( '*', 'strong' ),
		makeRule( '`', 'em' ),
		makeRule( '~', 'del' ),
		makeRule( '^', 'mark' ),
		makeRule( '_', 'span', 'init-fx-highlight-text' ),
	];

	function isSpace( ch ) {
		return ch === undefined || ch === '' || /\s/.test( ch );
	}

	// Giữ đúng quy tắc cũ: dấu mở đứng sau đầu dòng/khoảng trắng, HOẶC dấu đóng đứng trước khoảng trắng/cuối dòng.
	function findValid( rule, text, from ) {
		var re = rule.regex;
		var m;

		re.lastIndex = from;
		while ( ( m = re.exec( text ) ) ) {
			var before = m.index > 0 ? text.charAt( m.index - 1 ) : '';
			var after = text.charAt( m.index + m[ 0 ].length );
			if ( isSpace( before ) || isSpace( after ) ) {
				return m;
			}
			re.lastIndex = m.index + 1;
		}
		return null;
	}

	function acceptNode( node, test ) {
		var p = node.parentNode;
		if ( ! node.nodeValue || ! p || p.nodeType !== 1 || SKIP_TAGS[ p.tagName.toUpperCase() ] ) {
			return NodeFilter.FILTER_REJECT;
		}
		if ( ! test( node.nodeValue ) || p.isContentEditable || p.closest( SKIP_SELECTOR ) ) {
			return NodeFilter.FILTER_REJECT;
		}
		return NodeFilter.FILTER_ACCEPT;
	}

	function collect( root, test ) {
		var list = [];
		var walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT, {
			acceptNode: function ( node ) {
				return acceptNode( node, test );
			},
		} );
		for ( var n = walker.nextNode(); n; n = walker.nextNode() ) {
			list.push( n );
		}
		return list;
	}

	// ---------------------------------------------------------------------
	// Inline rules
	// ---------------------------------------------------------------------
	function applyRules( textNode ) {
		var text = textNode.nodeValue;
		var frag = document.createDocumentFragment();
		var cursor = 0;
		var changed = false;

		while ( cursor < text.length ) {
			var earliest = null;
			var rule = null;

			for ( var i = 0; i < RULES.length; i++ ) {
				if ( text.indexOf( RULES[ i ].marker, cursor ) === -1 ) {
					continue;
				}
				var match = findValid( RULES[ i ], text, cursor );
				if ( match && ( ! earliest || match.index < earliest.index ) ) {
					earliest = match;
					rule = RULES[ i ];
				}
			}

			if ( ! earliest ) {
				break;
			}

			if ( earliest.index > cursor ) {
				frag.appendChild( document.createTextNode( text.slice( cursor, earliest.index ) ) );
			}

			var el = document.createElement( rule.tag );
			if ( rule.className ) {
				el.className = rule.className;
			}
			el.textContent = earliest[ 1 ];
			frag.appendChild( el );

			cursor = earliest.index + earliest[ 0 ].length;
			changed = true;
		}

		if ( changed ) {
			if ( cursor < text.length ) {
				frag.appendChild( document.createTextNode( text.slice( cursor ) ) );
			}
			textNode.parentNode.replaceChild( frag, textNode );
		}

		return changed;
	}

	// ---------------------------------------------------------------------
	// Spoilers
	// ---------------------------------------------------------------------
	function createSpoiler( content ) {
		var wrapper = document.createElement( 'span' );
		wrapper.className = 'fx-spoiler is-hidden';
		wrapper.setAttribute( 'role', 'button' );
		wrapper.setAttribute( 'tabindex', '0' );
		wrapper.setAttribute( 'aria-label', SPOILER_LABEL );
		wrapper.setAttribute( 'aria-expanded', 'false' );

		var inner = document.createElement( 'span' );
		inner.className = 'fx-spoiler-content';
		inner.setAttribute( 'aria-hidden', 'true' );
		inner.textContent = content;

		var label = document.createElement( 'span' );
		label.className = 'fx-spoiler-label';
		label.setAttribute( 'aria-hidden', 'true' );

		var pill = document.createElement( 'span' );
		pill.textContent = SPOILER_LABEL;
		label.appendChild( pill );

		wrapper.appendChild( inner );
		wrapper.appendChild( label );

		return wrapper;
	}

	function processSpoilers( textNode, created ) {
		var s = textNode.nodeValue;
		var frag = document.createDocumentFragment();
		var pos = 0;
		var changed = false;

		while ( pos < s.length ) {
			var start = s.indexOf( '||', pos );
			if ( start === -1 ) {
				break;
			}
			var end = s.indexOf( '||', start + 2 );
			if ( end === -1 ) {
				break;
			}

			var content = s.slice( start + 2, end );
			if ( content.trim() === '' ) {
				// "||||" hoặc "|| ||" → không phải spoiler, giữ nguyên.
				frag.appendChild( document.createTextNode( s.slice( pos, end + 2 ) ) );
				pos = end + 2;
				continue;
			}

			if ( start > pos ) {
				frag.appendChild( document.createTextNode( s.slice( pos, start ) ) );
			}

			var spoiler = createSpoiler( content );
			created.push( spoiler );
			frag.appendChild( spoiler );
			pos = end + 2;
			changed = true;
		}

		if ( changed ) {
			if ( pos < s.length ) {
				frag.appendChild( document.createTextNode( s.slice( pos ) ) );
			}
			textNode.parentNode.replaceChild( frag, textNode );
		}
	}

	function reveal( el ) {
		if ( ! el.classList.contains( 'is-hidden' ) ) {
			return;
		}
		el.classList.remove( 'is-hidden' );
		el.setAttribute( 'aria-expanded', 'true' );
		// Đã mở → để trình đọc màn hình đọc nội dung thật, bỏ vai trò nút.
		el.removeAttribute( 'role' );
		el.removeAttribute( 'tabindex' );
		el.removeAttribute( 'aria-label' );
		var inner = el.querySelector( '.fx-spoiler-content' );
		if ( inner ) {
			inner.removeAttribute( 'aria-hidden' );
		}
	}

	// Spoiler quá hẹp so với nhãn → ẩn nhãn, chỉ giữ hiệu ứng mờ (đọc trước rồi mới ghi → 1 lần layout).
	function fitLabels( spoilers ) {
		if ( ! spoilers.length ) {
			return;
		}
		window.requestAnimationFrame( function () {
			var compact = spoilers.filter( function ( el ) {
				var pill = el.querySelector( '.fx-spoiler-label > span' );
				return ! pill || pill.offsetWidth + 6 > el.clientWidth || pill.offsetHeight + 2 > el.clientHeight * 1.6;
			} );
			compact.forEach( function ( el ) {
				el.classList.add( 'is-compact' );
			} );
		} );
	}

	// ---------------------------------------------------------------------
	// CSS (chỉ chèn khi cần)
	// ---------------------------------------------------------------------
	function addStyle( id, css ) {
		if ( document.getElementById( id ) ) {
			return;
		}
		var style = document.createElement( 'style' );
		style.id = id;
		style.textContent = css;
		document.head.appendChild( style );
	}

	function ensureCSS( root, hasSpoiler ) {
		if ( root.querySelector( '.init-fx-highlight-text' ) ) {
			addStyle(
				'fx-highlight-style',
				'.init-fx-highlight-text{background-image:linear-gradient(120deg,rgba(156,255,0,.7) 0,rgba(156,255,0,.7) 100%);background-repeat:no-repeat;background-size:100% .5em;background-position:0 100%}'
			);
		}

		if ( hasSpoiler || root.querySelector( '.fx-spoiler' ) ) {
			addStyle(
				'fx-spoiler-style',
				'.fx-spoiler{position:relative;display:inline-block;max-width:100%;vertical-align:bottom;cursor:pointer;border-radius:.4em;isolation:isolate;-webkit-tap-highlight-color:transparent}' +
				'.fx-spoiler-content{transition:filter .35s ease,opacity .35s ease}' +
				'.fx-spoiler.is-hidden{background:rgba(127,127,127,.08);background:color-mix(in srgb,currentColor 7%,transparent)}' +
				'.fx-spoiler.is-hidden .fx-spoiler-content{filter:blur(.34em);opacity:.8;-webkit-user-select:none;user-select:none}' +
				'.fx-spoiler.is-hidden:hover .fx-spoiler-content{filter:blur(.26em)}' +
				'.fx-spoiler-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none;transition:opacity .25s ease}' +
				'.fx-spoiler-label>span{padding:.2em .7em;border-radius:999px;font-size:.72em;line-height:1.3;font-weight:600;letter-spacing:.02em;white-space:nowrap;background:rgba(127,127,127,.18);background:color-mix(in srgb,currentColor 14%,transparent);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:0 1px 6px rgba(0,0,0,.12)}' +
				'.fx-spoiler.is-compact .fx-spoiler-label,.fx-spoiler:not(.is-hidden) .fx-spoiler-label{opacity:0;visibility:hidden}' +
				'.fx-spoiler:focus-visible{outline:2px solid currentColor;outline-offset:2px}' +
				'@media (prefers-reduced-motion:reduce){.fx-spoiler-content,.fx-spoiler-label{transition:none}}'
			);
		}
	}

	// ---------------------------------------------------------------------
	// Main
	// ---------------------------------------------------------------------
	function bindEvents() {
		if ( document.__fxSpoilerBound ) {
			return;
		}
		document.__fxSpoilerBound = true;

		document.addEventListener( 'click', function ( e ) {
			var target = e.target && e.target.closest ? e.target.closest( '.fx-spoiler.is-hidden' ) : null;
			if ( target ) {
				// Spoiler nằm trong link → lần bấm đầu chỉ mở spoiler.
				e.preventDefault();
				reveal( target );
			}
		} );

		document.addEventListener( 'keydown', function ( e ) {
			var t = e.target;
			if ( ( e.key === 'Enter' || e.key === ' ' ) && t && t.classList && t.classList.contains( 'fx-spoiler' ) && t.classList.contains( 'is-hidden' ) ) {
				e.preventDefault();
				reveal( t );
			}
		} );
	}

	function format( root ) {
		root = root || document.body;
		if ( ! root ) {
			return;
		}

		// 1) Spoiler trước, 2) quy tắc nội tuyến sau (để không "ăn" vào phần đã bọc).
		var created = [];
		collect( root, function ( v ) {
			return v.indexOf( '||' ) !== -1;
		} ).forEach( function ( n ) {
			processSpoilers( n, created );
		} );

		collect( root, function ( v ) {
			return MARKER_RX.test( v );
		} ).forEach( applyRules );

		// Biến đổi DOM trước rồi mới chèn CSS (cùng 1 task, trước khi trình duyệt vẽ → không nháy).
		ensureCSS( root, created.length > 0 );
		fitLabels( created );

		if ( created.length || root.querySelector( '.fx-spoiler' ) ) {
			bindEvents();
		}
	}

	window.FXInline = { format: format, reveal: reveal };
	window.enhanceInlineFormatting = window.enhanceInlineFormatting || format; // Tên cũ (tương thích).

	// Chạy được cả khi script bị trì hoãn (defer/async/delay JS) sau DOMContentLoaded.
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', function () {
			format();
		} );
	} else {
		format();
	}
}( window, document ) );
