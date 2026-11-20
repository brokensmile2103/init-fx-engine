=== Init FX Engine – Interactive, Event-Driven, Lightweight ===
Contributors: brokensmile.2103
Tags: animation, effect, confetti, snow, particles
Requires at least: 6.9
Tested up to: 7.2
Requires PHP: 7.4
Stable tag: 2.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Bring your WordPress site to life with visual effects, particle backgrounds and hand-drawn seasonal holiday scenes — loaded only where they are used.

== Description ==

**Init FX Engine** brings modern, interactive visual effects to your WordPress site — from fireworks to snowfall, emoji rain, particle backgrounds and full holiday scenes. All effects are fully customizable, and can be triggered via keywords, shortcodes, Block Editor blocks, or special events.

> 🎉 Celebrate milestones with fireworks or cannon blasts  
> 💬 Let users experience emoji reactions and heart rain in comments  
> ❄️ Classic snowfall with random depth, on an automatic or custom schedule  
> 🎄 Hand-drawn seasonal scenes: Christmas, New Year, Lunar New Year (Tết), Valentine, Mid-Autumn, Halloween — with decorations  
> ✨ Particle backgrounds (stars, snow, bubbles, fireflies, network, emoji) powered by tsParticles  
> 🎆 Real fireworks show for New Year's Eve and celebrations  
> ⚡ Smart loading: no script is loaded on pages that do not use any effect  
> 🖤 Grayscale mode for solemn occasions or national mourning  
> ⏳ Animated preloaders to enrich user experience

Not just an effect plugin — this is an **FX Engine** for WordPress.

This plugin is part of the [Init Plugin Suite](https://en.inithtml.com/init-plugin-suite-minimalist-powerful-and-free-wordpress-plugins/) — a collection of minimalist, fast, and developer-focused tools for WordPress.

GitHub repository: [https://github.com/brokensmile2103/init-fx-engine](https://github.com/brokensmile2103/init-fx-engine)

**Highlights:**
- Native Block Editor blocks: FX Trigger and FX Ambient Section — with live preview in the editor
- Interactive visual effects: Firework, Emoji Rain, Heart Rain, Cannon Blast, Starlight, Celebration Burst, Halloween Burst, Lucky Money, Blossom Rain, Fireworks Show, Snow Burst, Lantern Rise
- Seasonal Effects with a built-in holiday calendar (Halloween, Christmas, New Year, Tết, Valentine, Mid-Autumn), custom schedule or always-on mode
- Particle backgrounds: Network links, Twinkling stars, Gentle snow, Rising bubbles, Fireflies, Floating emoji
- Preloader (loading screen) with 6 styles: Dot Dot Dot, Bar, Logo, Flower, Spinner, Emoji
- Supports gradient or solid background for preloader
- Auto-fetch favicon for logo-based animation
- Snowfall with date scheduler (auto/custom), 4 snow styles, custom color, wind, battery saver mode and small-screen option
- Grayscale mode (manual or scheduled)
- Keywords to trigger effects inside comments or post content
- Real-time preview of effects in settings page
- Lightweight, extensible, and multilingual-ready

== Smart Loading ==

Since 2.0.2 the plugin only loads what the current page needs:

- **canvas-confetti + fx-engine.js**: only when at least one keyword effect is configured, on pages that contain an `[initfxen-fx]` shortcode or an FX Trigger block, or when the seasonal greeting effect has to play
- **fx-inline.js** (inline formatting and spoilers, no dependency): only when Inline Formatting is enabled
- **tsParticles + fx-ambient.js**: only on pages with an `[initfxen-fx-ambient]` shortcode or an FX Ambient Section block, and each background starts only when it scrolls near the viewport
- **fireworks-js**: lazy-loaded the first time a Fireworks Show actually runs
- **Snowfall, Seasonal Effects, Preloader, Grayscale**: only when enabled and scheduled for today

If your theme calls `FXEngine.trigger()` directly on pages without keywords or FX blocks, force the engine to load with:

`add_filter( 'init_plugin_suite_fx_engine_load_engine', '__return_true' );`

== Block Editor (Gutenberg) ==

Two native blocks are available under their own **Init FX Engine** category in the block inserter:

- **FX Trigger** — equivalent to `[initfxen-fx]`. A link or button that fires a visual effect (fireworks, emoji rain, etc.) on click, on hover, when scrolled into view, or immediately on page load
- **FX Ambient Section** — a section with an animated particle background. Put any blocks inside (headings, buttons, images...). Choose a preset, color, amount, speed and hover/click interactions; the background is previewed live in the editor. Supports wide/full alignment, background color/gradient, text color, padding and minimum height

FX Trigger shares the exact same rendering code as its shortcode, so switching between the Block Editor and shortcode never changes the output. FX Ambient Section shares its particle configuration with `[initfxen-fx-ambient]`.

Note: this plugin does not include Abilities API support. It has no data to read or write — everything it does is a purely visual, client-side effect — so there is nothing meaningful for an AI agent or automation tool to query here.

== Snowfall ==

Go to **Settings → Init FX Engine → Snowfall Effect**. Snowfall runs on its own lightweight canvas renderer (no library):

- **Snow style**: Classic round (default — solid round flakes with random size and opacity for depth, just like earlier versions), Soft glow, Crystal snowflakes, or Classic + crystal
- **Snow color**: white by default; a light blue or gray keeps snow visible on light backgrounds
- **Schedule**: automatic (Dec 20 – Dec 31) or custom dates, optionally homepage only
- **Amount, size, fall speed, opacity**
- **Wind**: gentle swaying and gusts; when off, snow drifts down at slightly random angles like before
- **Performance**: Smooth (60 fps) or Battery saver (30 fps)
- **Small screens**: optionally hide snowfall below 768px
- The **Preview** button plays the snow over a night-sky backdrop right in the settings page

Performance: pre-rendered sprites, frame-rate independent motion, fewer flakes on small screens, no canvas reallocation when the mobile address bar shows or hides, stops when the tab is hidden, starts after the page has loaded and respects "reduce motion".

== Seasonal Effects ==

Go to **Settings → Init FX Engine → Seasonal Effects** and tick **Enable seasonal effects on site**.

- **Theme**: pick a holiday, or leave it on **Auto** to follow the holiday calendar
- **Built-in holiday calendar**: Halloween (Oct 24–31), Christmas (Dec 20–26), New Year (Dec 30 – Jan 2), Tết (one week before Lunar New Year's Day – the 7th day of the new year), Valentine (Feb 10–14), Mid-Autumn (one week before the 15th day of the 8th lunar month – the 16th)
- **Custom schedule** or **Always on** (handy for testing on localhost)
- **Hand-drawn scenes**: crystal snowflakes, blossoms, petals, lucky-money envelopes, lanterns, hearts, bats, ghosts, glitter and confetti — drawn once into sprites, then animated on a single canvas
- **Decorations**: Christmas and New Year string lights, Tết lanterns, Mid-Autumn full moon, Halloween spider webs with a dangling spider (placed below the admin bar when you are logged in)
- **Interactive**: a burst of themed particles wherever visitors click or tap
- **Custom emojis**: replace the hand-drawn particles with your own emojis (up to 12)
- **Greeting effect**: plays once per browser session (e.g. a fireworks show on New Year)
- The **Preview** button plays the scene right in the settings page

Performance: every shape is pre-rendered once, the scene starts only after the page has finished loading, pauses when the tab is hidden, uses fewer particles on small screens, caps the device pixel ratio at 2 and respects the visitor's "reduce motion" setting. The FX engine is not loaded at all when the greeting effect is turned off.

Developers can customize themes and dates with the `init_plugin_suite_fx_engine_seasonal_themes`, `init_plugin_suite_fx_engine_seasonal_window`, `init_plugin_suite_fx_engine_lunar_dates` and `init_plugin_suite_fx_engine_seasonal_config` filters. Themes added through the filter are rendered with their emoji list.

== Particle Backgrounds ==

Use the **FX Ambient Section** block, or the shortcode inside any element that has `position: relative`:

`[initfxen-fx-ambient ambient="stars"]`

Attributes:

- `ambient` — preset: `links` (default, network with lines), `stars`, `snow`, `bubbles`, `fireflies`, `emoji`. Any other value falls back to `links`, so older shortcodes keep working
- `color` — particle color (default depends on the preset)
- `amount` — number of particles per 1000×800 px area (default depends on the preset)
- `speed` — movement speed (default depends on the preset)
- `emoji` — comma-separated emojis for the `emoji` preset
- `lines` — `true`/`false`, connecting lines for the `links` preset
- `hover` — `repulse`, `grab`, `bubble` or `none`
- `click` — `push`, `remove` or `none` (only reacts to clicks inside the parent element, links and buttons are ignored)
- `container_style` / `container_class` — position the particle layer yourself

The settings page includes a shortcode generator with a live preview.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`.
2. Activate the plugin from the “Plugins” screen.
3. Go to **Settings → Init FX Engine** to configure effects.
4. Optionally insert `[initfxen-fx-ambient]` into posts or templates, or add the FX Trigger / FX Ambient Section blocks in the Block Editor.

== Frequently Asked Questions ==

= Can I add my own effects? =  
Yes. Developers can hook into the engine via JavaScript or WordPress hooks.

= Is the plugin heavy or slow? =  
No. Since 2.0.2 every script is loaded only on pages that actually use it — a page without keywords, FX shortcodes/blocks or scheduled effects loads nothing from this plugin. See the "Smart Loading" section.

= Can I use the effects outside of comments? =  
Yes. Use the `[initfxen-fx]` shortcode, the FX Trigger block, or call `FXEngine.trigger('effect')` in JavaScript.

= How do I register my own effect in JavaScript? =  
Call `FXEngine.register('myEffect', function (options) { ... })`, then use `fx="myEffect"` in the shortcode or `FXEngine.trigger('myEffect')`.

= My keywords or spoilers do not work on content loaded with AJAX. =  
Call `FXEngine.scan( element )` for keywords and FX triggers, and `FXInline.format( element )` for inline formatting and spoilers, after inserting the new content.

= How do I exclude an area from keywords or inline formatting? =  
Add the class `fx-no-keywords` (keywords) or `fx-no-format` (inline formatting) to the element. Text inside links, buttons, code, form fields and editable areas is always skipped.

= When does Tết / Mid-Autumn start automatically? =  
Dates are computed from the Vietnamese lunar calendar (UTC+7) and bundled up to 2040. You can add or override years with the `init_plugin_suite_fx_engine_lunar_dates` filter.

= The seasonal scene doesn't show up on my site. =  
Check that today is inside the holiday window (the settings page shows the calendar and what visitors will see today), or switch to **Always on** for testing. If your device has "reduce motion" enabled, the scene is skipped unless you untick that option. Remember to clear your page cache after changing settings.

= Does it support text formatting? =  
Yes. You can format text using simple markers:  
`*bold*`, `~strike~`, `` `italic` ``, `^highlight^`, `_neon_`, `||spoiler||`

== Screenshots ==

1. Settings page — section navigation and Preloader (loading screen) settings.
2. Keyword Effects — keywords for each effect, with a Preview button per effect.
3. Snowfall Effect — schedule, homepage-only, snow style, snow color, amount, size, speed, opacity, wind, performance mode, small screens and the Preview button.
4. Seasonal Effects — theme, schedule, holiday calendar with "Today visitors will see", greeting, decorations, interactive bursts, accessibility and particle settings.
5. Particle Backgrounds — shortcode generator with a live tsParticles preview.
6. Grayscale — enable, always on / custom schedule / paused, custom dates.
7. Inline Formatting — enable inline markup and blurred spoilers.
8. Classic snowfall on a live site: round flakes with random size and opacity for depth.
9. Christmas seasonal scene with string lights, crystal snowflakes and gifts.
10. FX Ambient Section block with a live particle background in the Block Editor.
11. Lunar New Year (Tết) scene: swinging lanterns, peach and apricot blossoms, lucky-money envelopes, and blurred spoilers.

== Changelog ==

= 2.0.3 – November 20, 2026 =
- **Snowfall: Classic round style is back as the default** — solid round flakes with random size and random opacity for depth, drifting down at slightly random angles, matching the look of the particles.js snowfall used before 2.0.2. Existing "dots" settings automatically use the classic look
- **New Snowfall options**: Snow color, "Soft glow" style (the 2.0.2 dots), "Classic + crystal snowflakes", Performance (Smooth 60 fps / Battery saver 30 fps) and "Do not show on screens narrower than 768px"
- **Wind** is now optional and off by default for new installs (gentle swaying and gusts when enabled)
- **Performance**: the snowfall canvas is no longer reallocated when the mobile address bar shows or hides while scrolling; sprites are built once per color
- **Fix**: the Snowfall Preview button looked like it did nothing because white snow was invisible on the light admin background — the preview now plays over a night-sky backdrop
- **Readme**: new Snowfall section; "What's New" blocks removed from the description (see the changelog)
- **Internationalization**: new strings added to the POT file and Vietnamese translation

= 2.0.2 – November 20, 2026 =
- **New: Smart loading** — canvas-confetti and `fx-engine.js` are no longer enqueued on every page. They load only when keyword effects are configured, when the page renders an `[initfxen-fx]` shortcode or FX Trigger block (enqueued at render time), or when the seasonal greeting effect needs them. New filter `init_plugin_suite_fx_engine_load_engine` to force loading
- **New: `fx-inline.js`** — inline formatting and spoilers moved out of `fx-engine.js` into a small file without dependencies, so formatting text no longer pulls in canvas-confetti
- **New: Seasonal Effects 2.0** — hand-drawn canvas scenes replace the emoji-only scenes: crystal snowflakes and soft snow (Christmas), golden glitter, twinkling stars and 3D-flipping confetti (New Year), peach and apricot blossoms, tumbling petals and lucky-money envelopes (Tết), glossy hearts, rose petals and sparkles (Valentine), glowing flickering lanterns and stars (Mid-Autumn), flapping bats, floating ghosts, pumpkins and embers (Halloween)
- **New: Seasonal decorations** (Christmas and New Year string lights, swinging Tết lanterns, Mid-Autumn full moon, Halloween spider webs with a dangling spider), placed below the admin bar when logged in
- **New: Interactive seasonal bursts** — themed particles burst wherever visitors click or tap (opt-in)
- **New: Snowfall renderer** — a lightweight canvas renderer (no library) replaces particles.js: pre-rendered sprites, depth/parallax, gentle wind gusts, optional crystal snowflakes ("Snow style"), starts after page load, stops when the tab is hidden, scales with screen size and respects "reduce motion". All previous options are kept
- **New library: [tsParticles](https://github.com/tsparticles/tsparticles) 4.6.0** (slim bundle, MIT) for particle backgrounds, replacing the unmaintained particles.js
- **New: `[initfxen-fx-ambient]` presets** — `links` (default, same look as before), `stars`, `snow`, `bubbles`, `fireflies`, `emoji`, plus new `amount` and `emoji` attributes. Backgrounds start only when scrolled near the viewport. No more per-shortcode inline scripts
- **New: FX Ambient Section block** — a section with a particle background and any blocks inside, with live preview in the editor
- **New: Particle Backgrounds** section in the settings page with a shortcode generator and live preview
- **New effect: Blossom Rain (Tết)** — peach and apricot petals drawn with canvas-confetti paths. Halloween Burst and Lucky Money were refreshed (tumbling shapes, opening gold burst)
- **New: Snowfall Preview button** (played over a night-sky backdrop so white snow is visible on the light admin screen), Snowfall "Wind" and "Accessibility" options
- **New: FX Trigger block** — "When scrolled into view" and "Immediately on page load" triggers (already supported by the shortcode), Blossom Rain effect, and a safe list of HTML tags
- **New JavaScript APIs**: `FXEngine.scan( root )`, `FXInline.format( root )`, `initFxSnowfall.preview()`, `initFxSeasonal.burst()`, `initFxAmbient.mount()`
- **Developer**: the legacy global helpers (`firework()`, `cannonBlast()`... and `replaceFXKeywordsInDOM()`, `enhanceInlineFormatting()`) are kept as aliases; `window.runEffect()` still works
- **Improved: Spoilers** — blurred background instead of the gray box, a frosted "Tap to reveal" pill that never wraps, and the label is hidden automatically when the spoiler is too short. Revealed spoilers become normal text for screen readers
- **Settings**: quick navigation links between sections, example placeholders for every keyword field, "Paused" option for Grayscale
- **Security**: `[initfxen-fx]` now only accepts a safe list of HTML tags (previously `tag="script"` could output a `<script>` element from a Contributor account) and sanitizes the effect name
- **Security**: the preloader background color and ambient colors are sanitized so they cannot inject CSS; keyword settings are sanitized as plain text
- **Fix**: Grayscale was applied to `<body>`, which broke every `position: fixed` element (sticky headers, menus, snowfall); it is now applied to `<html>` with pure CSS, without the flash of color caused by the JavaScript class
- **Fix**: Grayscale could not be turned on again when its schedule had been saved as "off" (no radio button was shown for it)
- **Fix**: PHP warnings ("Undefined array key mode/style") when saving settings with missing fields; custom dates are now validated
- **Fix**: `fx-engine.js` used regular-expression lookbehind, which is a syntax error on Safari < 16.4 and broke every effect there; keyword matching now falls back gracefully and inline formatting no longer uses lookbehind
- **Fix**: inline formatting could modify text inside `<textarea>`, inputs and editable areas (e.g. front-end editors); keywords are no longer turned into nested links inside existing links or buttons
- **Fix**: the preloader used black dots on dark gradient backgrounds
- **Fix**: the ambient shortcode initialized on `DOMContentLoaded` only, so it never started when scripts were deferred by optimization plugins; `hover`/`click` interactions never worked with the default container style
- **Fix**: the settings page ignored its own default values; keyword defaults are now empty (as they effectively were on the frontend) with example placeholders
- **Fix**: the block category is no longer added twice when another plugin registers the same slug
- **Updated library**: canvas-confetti 1.9.3 → 1.9.4
- **Removed**: particles.js (replaced by the new Snowfall renderer and tsParticles). The `#particles-snow-js` id is kept on the snowfall canvas for custom CSS
- **Code quality**: all PHP files follow the WordPress Coding Standards (WPCS 3); preloader and grayscale output use `wp_add_inline_style()` / `wp_print_inline_script_tag()` instead of raw `<style>`/`<script>` tags
- **Internationalization**: new strings added to the POT file and Vietnamese translation (PO/MO/JSON regenerated with WP-CLI)

= 2.0.1 – October 1, 2026 =
- **New: Seasonal Effects** — holiday scenes rendered over the page: Halloween (bats, ghosts, pumpkins), Christmas, New Year, Lunar New Year / Tết (peach & apricot blossoms, lucky money), Valentine and Mid-Autumn (glowing lanterns rising). Three motion styles: falling, rising and fluttering
- **New: Built-in holiday calendar** with automatic theme switching; Tết and Mid-Autumn dates are computed from the Vietnamese lunar calendar (UTC+7) and bundled through 2040. Also supports a custom date range or always-on mode, homepage-only display and custom emojis
- **New: Themed greeting effect**, played once per browser session (fireworks show on New Year, lucky money on Tết, lantern rise on Mid-Autumn...)
- **New effects**: Halloween Burst, Lucky Money (Tết), Fireworks Show, Snow Burst, Lantern Rise — available as keywords, in `[initfxen-fx]` and in the FX Trigger block
- **New library**: [fireworks-js](https://github.com/crashmax-dev/fireworks-js) 2.10.8 (MIT) for the realistic Fireworks Show. It is lazy-loaded only when the effect actually runs; if it cannot load, the classic confetti firework is used instead
- **New: JavaScript API** — `FXEngine.trigger( name, options )`, `FXEngine.register( name, fn )` and `FXEngine.effects()` (the `FXEngine.trigger` call mentioned in the FAQ now actually exists)
- **Settings**: Seasonal Effects section with a live **Preview** button, the upcoming holiday calendar and a "today visitors will see" indicator; preview buttons for every new effect
- **Settings**: the settings page is now organized into clear sections (Preloader, Keyword Effects, Snowfall, Seasonal Effects, Grayscale, Inline Formatting), one setting per row with proper labels. Field names are unchanged, so existing settings are kept
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

This plugin bundles the following open-source libraries (all GPL-compatible):

* canvas-confetti 1.9.4 — ISC License, Copyright (c) 2020 Kiril Vatev — [https://github.com/catdad/canvas-confetti](https://github.com/catdad/canvas-confetti) — file: `assets/js/canvas-confetti.min.js` (minified from `dist/confetti.browser.js`)
* fireworks-js 2.10.8 — MIT License, Copyright (c) 2021-2023 Vitalij Ryndin — [https://github.com/crashmax-dev/fireworks-js](https://github.com/crashmax-dev/fireworks-js) — file: `assets/js/fireworks.min.js`
* tsParticles 4.6.0 (slim bundle) — MIT License, Copyright (c) 2020 Matteo Bruni — [https://github.com/tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) — file: `assets/js/tsparticles.slim.bundle.min.js` (unmodified `@tsparticles/slim` bundle from npm)

The full, human-readable source code of these libraries is available at the repositories above and on npm (`canvas-confetti`, `fireworks-js`, `@tsparticles/slim`).

Previous versions also bundled particles.js 2.0.0 (MIT, Vincent Garreau); it was removed in 2.0.2.

All other code (snowfall and seasonal renderers, effects, inline formatting) is original work of this plugin, licensed under GPLv2 or later.
