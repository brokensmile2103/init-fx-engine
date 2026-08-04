=== Init FX Engine – Interactive, Event-Driven, Lightweight ===
Contributors: brokensmile.2103
Tags: animation, effect, confetti, comment, interaction
Requires at least: 6.9
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 2.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Bring your WordPress site to life with visual effects, now with native Block Editor support.

== Description ==

**Init FX Engine** brings modern, interactive visual effects to your WordPress site — from fireworks to snowfall, emoji rain, and more. All effects are fully customizable, and can be triggered via keywords, shortcodes, Block Editor blocks, or special events.

> 🎉 Celebrate milestones with fireworks or cannon blasts  
> 💬 Let users experience emoji reactions and heart rain in comments  
> ❄️ Schedule snowfall automatically or set your own custom dates  
> ⚙️ Lightweight, fully customizable engine with intuitive UI  
> 🖤 Grayscale mode for solemn occasions or national mourning  
> ⏳ Animated preloaders to enrich user experience

Not just an effect plugin — this is an **FX Engine** for WordPress.

This plugin is part of the [Init Plugin Suite](https://en.inithtml.com/init-plugin-suite-minimalist-powerful-and-free-wordpress-plugins/) — a collection of minimalist, fast, and developer-focused tools for WordPress.

GitHub repository: [https://github.com/brokensmile2103/init-fx-engine](https://github.com/brokensmile2103/init-fx-engine)

**What's New in v2.0.0:**
- **Block Editor (Gutenberg) support**: a native **FX Trigger** block, grouped under its own **Init FX Engine** category in the block inserter. The block shares the exact same rendering code as its `[initfxen-fx]` shortcode counterpart, with a live preview right in the editor
- **Requires at least** raised from 5.5 to 6.9

**Highlights:**
- Native Block Editor block: FX Trigger — with live preview in the editor
- Interactive visual effects: Firework, Emoji Rain, Heart Rain, Cannon Blast, Starlight, Celebration Burst
- Preloader (loading screen) with 6 styles: Dot Dot Dot, Bar, Logo, Flower, Spinner, Emoji
- Supports gradient or solid background for preloader
- Auto-fetch favicon for logo-based animation
- Snowfall effect with date scheduler (auto/custom)
- Grayscale mode (manual or scheduled)
- Shortcode `[initfxen-fx-ambient]` for ambient background animation
- Keywords to trigger effects inside comments or post content
- Real-time preview of effects in settings page
- Lightweight, extensible, and multilingual-ready

== Block Editor (Gutenberg) ==

A native block is available under its own **Init FX Engine** category in the block inserter — no shortcode needed if you prefer working entirely in the editor:

- **FX Trigger** — equivalent to `[initfxen-fx]`. A link or button that fires a visual effect (fireworks, emoji rain, etc.) on click or hover

The block shares the exact same rendering code as its shortcode, so switching between the Block Editor and shortcode never changes the output. Block settings map directly to shortcode attributes, and a live preview is shown right in the editor as you configure it.

Note: the `[initfxen-fx-ambient]` shortcode does not have a block equivalent in this release — its rendering behavior wasn't stable enough to bring into the Block Editor yet. The shortcode itself is unaffected and continues to work exactly as before.

Note: this plugin does not include Abilities API support. It has no data to read or write — everything it does is a purely visual, client-side effect — so there is nothing meaningful for an AI agent or automation tool to query here.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`.
2. Activate the plugin from the “Plugins” screen.
3. Go to **Settings → Init FX Engine** to configure effects.
4. Optionally insert `[initfxen-fx-ambient]` into posts or templates, or add the equivalent block in the Block Editor.

== Frequently Asked Questions ==

= Can I add my own effects? =  
Yes. Developers can hook into the engine via JavaScript or WordPress hooks.

= Is the plugin heavy or slow? =  
No. Scripts are loaded only when needed — optimized for performance.

= Can I use the effects outside of comments? =  
Yes. Use the `[init-fx]` shortcode or call `FXEngine.trigger('effect')` in JavaScript.

= Does it support text formatting? =  
Yes. You can format text using simple markers:  
`*bold*`, `~strike~`, `` `italic` ``, `^highlight^`, `_neon_`

== Screenshots ==

1. Settings page with real-time preview of fireworks, emoji rain, preloaders, and more.
2. Snowfall effect scheduled automatically or set with custom dates.

== Changelog ==

= 2.0.0 – August 4, 2026 =
- **New: Block Editor (Gutenberg) support**: a native **FX Trigger** block (equivalent to `[initfxen-fx]`), grouped under its own **Init FX Engine** block category (instead of the generic "Widgets" category). Registered via `block.json` (with a PHP `render.php` file wired through the `"render"` field, WP 6.1+) that calls the exact same shortcode function as its shortcode counterpart — no duplicated display logic, output always matches. The editor integration is a single, no-build-step vanilla JavaScript file using `wp.serverSideRender` for a live preview directly in the editor. The `[initfxen-fx-ambient]` shortcode does not get a block equivalent in this release — its rendering behavior wasn't stable enough yet; the shortcode itself is unaffected
- **Changed**: `Requires at least` raised from 5.5 to 6.9, for consistency with the rest of the Init Plugin Suite's 2.0.0 releases
- **Note**: this release does not add Abilities API support. This plugin has no data to read or write — everything it does is a purely visual, client-side effect — so there is nothing meaningful for an AI agent to query
- **Tested up to: 7.1**

= 1.6 – December 17, 2025 =
- **Enhancement**: Added advanced Snowfall configuration options — control snow amount, size, fall speed, and opacity
- **UX**: Introduced fine-grained snowfall tuning for balanced visuals without overwhelming content
- **Performance**: Optimized particle density calculation to prevent visual clutter at higher snow counts
- **Stability**: Enforced strict value clamping and safe defaults to avoid misconfiguration and extreme effects
- **Developer**: Normalized snowfall settings schema with backward-compatible defaults for legacy installs
- **Developer**: Frontend now receives a minimal, sanitized snowfall config payload (reduces JS surface and coupling)
- **Compatibility**: Improved resilience when particles.js loads late or configuration is partially missing
- **Internationalization**: Added translatable strings for all new Snowfall settings and helper descriptions
- **Code Quality**: Refactored snowfall bootstrapping logic for clearer separation between schedule logic and rendering
- **Maintainability**: Prepared Snowfall module for future presets (Light / Normal / Heavy) without breaking changes

= 1.5 – December 9, 2025 =
- **New Feature**: Added *Homepage-only Snowfall* option — allow snowfall effect to run exclusively on the homepage
- **UX**: Snowfall settings now provide clearer scope control between full-site and homepage-only display
- **Developer**: Extended snowfall option schema with `homepage_only` flag
- **Security**: Improved sanitization for snowfall scope settings
- **Compatibility**: Ensured correct behavior with both `is_front_page()` and `is_home()` configurations
- **Stability**: Prevented unnecessary asset loading on non-homepage pages when homepage-only mode is enabled
- **Performance**: Reduced frontend script footprint when snowfall is limited to homepage

= 1.4 – November 14, 2025 =
- **Performance**: Rebuilt FX Keyword Scanner — now uses a single-pass TreeWalker, unified regex engine, parent-level deduping, and smart skip rules for ultra-fast DOM parsing
- **Stability**: Improved safety checks with `data-fx-keyword-processed` to prevent reprocessing loops and ensure clean node replacement
- **UX**: Smoother keyword-trigger interactions via a single delegated click listener (reduces event overhead and boosts responsiveness)
- **Developer**: Refactored internal matching pipeline for clarity, extensibility, and easier debugging
- **Compatibility**: More accurate keyword detection across multilingual and mixed-format HTML content

= 1.3 – September 13, 2025 =
- **New Feature**: Added *Session-only Preloader* option (only shows preloader on first visit per session)
- **New Feature**: Added *Inline Formatting toggle* (enable/disable parsing of inline syntax in texts)
- **New Feature**: Introduced *Spoiler syntax* using `||text||` — wraps any content (including images) inside a blurred container with click-to-reveal overlay
- **Internationalization**: Spoiler overlay label (`Tap to reveal`) is now translatable via i18n
- **CSS Injection**: Optimized to load highlight and spoiler styles only when needed
- **Developer**: Extended sanitize and settings registration for new options (`session_once`, `inlinefmt`)
- **Stability**: Fixed duplication issues when parsing spoiler blocks and ensured clean DOM structure
- **UX**: Improved spoiler accessibility with ARIA labels

= 1.2 – August 25, 2025 =
- **Critical Fix**: Resolved preloader flash/flicker issue during page load
- **Performance**: Eliminated race conditions in asset loading sequence
- **Compatibility**: Enhanced support for themes without `wp_body_open` hook
- **Stability**: Fixed "Cannot read properties of null" errors in early execution
- **Code Quality**: Refactored preloader timing mechanism for WordPress standards compliance
- **User Experience**: Smoother transitions with anti-flash CSS critical loading
- **Developer**: Improved error handling and graceful degradation fallbacks

= 1.1 – August 24, 2025 =
- **New Effects**: Particle Burst, Text Typewriter, Floating Bubbles, Lightning Strike
- **Advanced Triggers**: Scroll-based, time-delayed sequences, interaction tracking
- **Enhanced Keywords**: Phrase support, case-insensitive matching, bulk import/export
- **Mobile Optimization**: 40% better performance, responsive effect scaling
- **Developer API**: Custom effect creation, debug mode, WordPress hooks
- **Bug Fixes**: Preloader race condition, Safari compatibility, memory cleanup

= 1.0 – May 17, 2025 =
- First public release
- Fireworks, emoji rain, heart rain, cannon blast and more
- Animated preloader with 6 built-in styles
- Settings page with real-time preview
- Shortcodes for triggering and ambient effects
- Snowfall scheduler (auto/custom)
- Optional grayscale mode (manual or scheduled)
- Inline text formatting with common syntax
- Performance optimized and extensible

== License ==

This plugin is licensed under the GPLv2 or later.  
You are free to use, modify, and distribute it under the same license.

== Credits ==

This plugin includes these open-source libraries:

* canvas-confetti — [https://www.kirilv.com/canvas-confetti/](https://www.kirilv.com/canvas-confetti/)
* particles.js — [https://vincentgarreau.com/particles.js/](https://vincentgarreau.com/particles.js/)

Both are MIT licensed and bundled with the plugin.
