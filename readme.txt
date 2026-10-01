=== Init FX Engine – Interactive, Event-Driven, Lightweight ===
Contributors: brokensmile.2103
Tags: animation, effect, confetti, comment, interaction
Requires at least: 6.9
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 2.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Bring your WordPress site to life with visual effects and seasonal holiday scenes, now with native Block Editor support.

== Description ==

**Init FX Engine** brings modern, interactive visual effects to your WordPress site — from fireworks to snowfall, emoji rain, and more. All effects are fully customizable, and can be triggered via keywords, shortcodes, Block Editor blocks, or special events.

> 🎉 Celebrate milestones with fireworks or cannon blasts  
> 💬 Let users experience emoji reactions and heart rain in comments  
> ❄️ Schedule snowfall automatically or set your own custom dates  
> 🎃 Seasonal holiday scenes: Halloween, Christmas, New Year, Lunar New Year (Tết), Valentine, Mid-Autumn  
> 🎆 Real fireworks show for New Year's Eve and celebrations  
> ⚙️ Lightweight, fully customizable engine with intuitive UI  
> 🖤 Grayscale mode for solemn occasions or national mourning  
> ⏳ Animated preloaders to enrich user experience

Not just an effect plugin — this is an **FX Engine** for WordPress.

This plugin is part of the [Init Plugin Suite](https://en.inithtml.com/init-plugin-suite-minimalist-powerful-and-free-wordpress-plugins/) — a collection of minimalist, fast, and developer-focused tools for WordPress.

GitHub repository: [https://github.com/brokensmile2103/init-fx-engine](https://github.com/brokensmile2103/init-fx-engine)

**What's New in v2.0.1:**
- **Seasonal Effects**: holiday scenes floating over your site — 🎃 Halloween bats & ghosts, 🎄 Christmas gifts, 🎉 New Year sparkles, 🌸 Tết (Lunar New Year) blossoms & lucky money, 💖 Valentine hearts, 🏮 Mid-Autumn lanterns rising into the sky
- **Built-in holiday calendar**: switches theme automatically, including Tết and the Mid-Autumn Festival computed from the Vietnamese lunar calendar (UTC+7)
- **Themed greeting** once per visit: a real fireworks show on New Year, lucky money rain on Tết, and more
- **5 new effects**: Halloween Burst, Lucky Money (Tết), Fireworks Show, Snow Burst, Lantern Rise — usable with keywords, shortcodes and the FX Trigger block
- **Faster frontend**: lighter DOM scanning, cached effect shapes, lazy-loaded fireworks library

**What's New in v2.0.0:**
- **Block Editor (Gutenberg) support**: a native **FX Trigger** block, grouped under its own **Init FX Engine** category in the block inserter. The block shares the exact same rendering code as its `[initfxen-fx]` shortcode counterpart, with a live preview right in the editor
- **Requires at least** raised from 5.5 to 6.9

**Highlights:**
- Native Block Editor block: FX Trigger — with live preview in the editor
- Interactive visual effects: Firework, Emoji Rain, Heart Rain, Cannon Blast, Starlight, Celebration Burst, Halloween Burst, Lucky Money, Fireworks Show, Snow Burst, Lantern Rise
- Seasonal Effects with a built-in holiday calendar (Halloween, Christmas, New Year, Tết, Valentine, Mid-Autumn), custom schedule or always-on mode
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

== Seasonal Effects ==

Go to **Settings → Init FX Engine → Seasonal Effects** and tick **Enable seasonal effects on site**.

- **Theme**: pick a holiday, or leave it on **Auto** to follow the holiday calendar
- **Built-in holiday calendar**: Halloween (Oct 24–31), Christmas (Dec 20–26), New Year (Dec 30 – Jan 2), Tết (one week before Lunar New Year's Day – the 7th day of the new year), Valentine (Feb 10–14), Mid-Autumn (one week before the 15th day of the 8th lunar month)
- **Custom schedule** or **Always on** (handy for testing on localhost)
- **Custom emojis**: replace the theme's emojis with your own (up to 12)
- **Greeting effect**: plays once per browser session (e.g. a fireworks show on New Year)
- The **Preview** button plays the scene right in the settings page

Performance: the scene is drawn on a single canvas with pre-rendered emoji sprites, starts only after the page has finished loading, pauses when the tab is hidden, uses fewer particles on small screens and respects the visitor's "reduce motion" setting.

Developers can customize themes and dates with the `init_plugin_suite_fx_engine_seasonal_themes`, `init_plugin_suite_fx_engine_seasonal_window`, `init_plugin_suite_fx_engine_lunar_dates` and `init_plugin_suite_fx_engine_seasonal_config` filters.

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

= How do I register my own effect in JavaScript? =  
Call `FXEngine.register('myEffect', function (options) { ... })`, then use `fx="myEffect"` in the shortcode or `FXEngine.trigger('myEffect')`.

= When does Tết / Mid-Autumn start automatically? =  
Dates are computed from the Vietnamese lunar calendar (UTC+7) and bundled up to 2040. You can add or override years with the `init_plugin_suite_fx_engine_lunar_dates` filter.

= The seasonal scene doesn't show up on my site. =  
Check that today is inside the holiday window (the settings page shows the calendar and what visitors will see today), or switch to **Always on** for testing. If your device has "reduce motion" enabled, the scene is skipped unless you untick that option. Remember to clear your page cache after changing settings.

= Does it support text formatting? =  
Yes. You can format text using simple markers:  
`*bold*`, `~strike~`, `` `italic` ``, `^highlight^`, `_neon_`

== Screenshots ==

1. Settings page with real-time preview of fireworks, emoji rain, preloaders, and more.
2. Snowfall effect scheduled automatically or set with custom dates.

== Changelog ==

= 2.0.1 – October 1, 2026 =
- **New: Seasonal Effects** — holiday scenes rendered over the page: Halloween (bats, ghosts, pumpkins), Christmas, New Year, Lunar New Year / Tết (peach & apricot blossoms, lucky money), Valentine and Mid-Autumn (glowing lanterns rising). Three motion styles: falling, rising and fluttering
- **New: Built-in holiday calendar** with automatic theme switching; Tết and Mid-Autumn dates are computed from the Vietnamese lunar calendar (UTC+7) and bundled through 2040. Also supports a custom date range or always-on mode, homepage-only display and custom emojis
- **New: Themed greeting effect**, played once per browser session (fireworks show on New Year, lucky money on Tết, lantern rise on Mid-Autumn...)
- **New effects**: Halloween Burst, Lucky Money (Tết), Fireworks Show, Snow Burst, Lantern Rise — available as keywords, in `[initfxen-fx]` and in the FX Trigger block
- **New library**: [fireworks-js](https://github.com/crashmax-dev/fireworks-js) 2.10.8 (MIT) for the realistic Fireworks Show. It is lazy-loaded only when the effect actually runs; if it cannot load, the classic confetti firework is used instead
- **New: JavaScript API** — `FXEngine.trigger( name, options )`, `FXEngine.register( name, fn )` and `FXEngine.effects()` (the `FXEngine.trigger` call mentioned in the FAQ now actually exists)
- **Settings**: Seasonal Effects section with a live **Preview** button, the upcoming holiday calendar and a "today visitors will see" indicator; preview buttons for every new effect
- **Performance**: the seasonal renderer draws pre-rendered emoji sprites on a single canvas, starts after page load via `requestIdleCallback`, pauses while the tab is hidden, caps device pixel ratio at 2, reduces particles on small screens and respects `prefers-reduced-motion`
- **Performance**: inline formatting no longer serializes the whole page (`innerHTML`) to look for spoilers, and skips text nodes without any formatting marker before running its regular expressions
- **Performance**: emoji/heart shapes are cached instead of being rebuilt on every effect, and all "in-view" shortcodes share a single `IntersectionObserver`
- **Performance**: removed duplicated rules from the preloader critical CSS (same visual result)
- **Compatibility**: `fx-engine.js` and `fx-snowfall.js` now also start when they are deferred/delayed by optimization plugins (after `DOMContentLoaded`); `fx-engine.js` declares its canvas-confetti dependency explicitly
- **Developer**: new filters `init_plugin_suite_fx_engine_seasonal_themes`, `init_plugin_suite_fx_engine_seasonal_window`, `init_plugin_suite_fx_engine_lunar_dates`, `init_plugin_suite_fx_engine_seasonal_config`
- **Internationalization**: new strings added to the POT file and Vietnamese translation (PO/MO/JSON regenerated with WP-CLI)
- **Uninstall**: the new `init_plugin_suite_fx_engine_seasonal` option is removed on uninstall

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
* fireworks-js 2.10.8 — [https://github.com/crashmax-dev/fireworks-js](https://github.com/crashmax-dev/fireworks-js) (Copyright © 2021-2023 Vitalij Ryndin)

All are MIT licensed and bundled with the plugin.
