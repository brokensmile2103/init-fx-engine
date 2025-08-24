=== Init FX Engine – Interactive, Event-Driven, Lightweight ===
Contributors: brokensmile.2103
Tags: animation, effect, confetti, comment, interaction
Requires at least: 5.5
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Bring your WordPress site to life with interactive visual effects triggered by keywords, comments, and special occasions.

== Description ==

**Init FX Engine** brings modern, interactive visual effects to your WordPress site — from fireworks to snowfall, emoji rain, and more. All effects are fully customizable, and can be triggered via keywords, shortcodes, or special events.

> 🎉 Celebrate milestones with fireworks or cannon blasts  
> 💬 Let users experience emoji reactions and heart rain in comments  
> ❄️ Schedule snowfall automatically or set your own custom dates  
> ⚙️ Lightweight, fully customizable engine with intuitive UI  
> 🖤 Grayscale mode for solemn occasions or national mourning  
> ⏳ Animated preloaders to enrich user experience

Not just an effect plugin — this is an **FX Engine** for WordPress.

This plugin is part of the [Init Plugin Suite](https://en.inithtml.com/init-plugin-suite-minimalist-powerful-and-free-wordpress-plugins/) — a collection of minimalist, fast, and developer-focused tools for WordPress.

GitHub repository: [https://github.com/brokensmile2103/init-fx-engine](https://github.com/brokensmile2103/init-fx-engine)

**Highlights:**
- Interactive visual effects: Firework, Emoji Rain, Heart Rain, Cannon Blast, Starlight, Celebration Burst
- Preloader (loading screen) with 6 styles: Dot Dot Dot, Bar, Logo, Flower, Spinner, Emoji
- Supports gradient or solid background for preloader
- Auto-fetch favicon for logo-based animation
- Snowfall effect with date scheduler (auto/custom)
- Grayscale mode (manual or scheduled)
- Shortcode `[init-fx-ambient]` for ambient background animation
- Keywords to trigger effects inside comments or post content
- Real-time preview of effects in settings page
- Lightweight, extensible, and multilingual-ready

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`.
2. Activate the plugin from the “Plugins” screen.
3. Go to **Settings → Init FX Engine** to configure effects.
4. Optionally insert `[init-fx-ambient]` into posts or templates.

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

= 1.1 – August 25, 2025 =
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

* canvas-confetti — https://www.kirilv.com/canvas-confetti/
* particles.js — https://vincentgarreau.com/particles.js/

Both are MIT licensed and bundled with the plugin.
