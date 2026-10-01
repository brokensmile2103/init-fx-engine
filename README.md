# Init FX Engine – Interactive, Event-Driven, Lightweight

> Bring your WordPress site to life with fireworks, emoji rain, preloaders, snowfall and seasonal holiday scenes — all triggered by keywords, comments, special events, or a native Block Editor block.

**Not just effects. A true FX Engine for WordPress.**

[![Version](https://img.shields.io/badge/stable-v2.0.1-blue.svg)](https://wordpress.org/plugins/init-fx-engine/)
[![License](https://img.shields.io/badge/license-GPLv2-blue.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
![Made with ❤️ in HCMC](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20in%20HCMC-blue)

## Overview

Init FX Engine adds modern, interactive visual effects to your WordPress site.  
From fireworks to snowfall, emoji rain to animated preloaders — all effects are customizable, lightweight, and can be triggered by keywords, shortcodes, a Block Editor block, or scheduled events.

Perfect for celebrations, user engagement, or adding a touch of flair to your site.

## What's New in v2.0.1

- **Seasonal Effects**: holiday scenes floating over your site — 🎃 Halloween bats & ghosts, 🎄 Christmas, 🎉 New Year, 🌸 Tết (Lunar New Year) blossoms & lucky money, 💖 Valentine, 🏮 Mid-Autumn lanterns rising into the sky
- **Built-in holiday calendar** with automatic theme switching — Tết and Mid-Autumn dates follow the Vietnamese lunar calendar (UTC+7), bundled through 2040 and filterable
- **Themed greeting** once per visit: a real fireworks show on New Year, lucky money rain on Tết, and more
- **5 new effects**: `halloweenBurst`, `luckyMoney`, `fireworksShow`, `snowBurst`, `lanternRise` — for keywords, `[initfxen-fx]` and the FX Trigger block
- **New bundled library**: [fireworks-js](https://github.com/crashmax-dev/fireworks-js) (MIT), lazy-loaded only when the Fireworks Show actually runs
- **JavaScript API**: `FXEngine.trigger(name, options)`, `FXEngine.register(name, fn)`, `FXEngine.effects()`
- **Faster frontend**: sprite-based canvas renderer that pauses in hidden tabs, starts after page load and respects `prefers-reduced-motion`; lighter inline-formatting scan; cached confetti shapes

### Developer filters

| Filter | Purpose |
| --- | --- |
| `init_plugin_suite_fx_engine_seasonal_themes` | Add, remove or tweak seasonal themes (emojis, motion, glow, greeting) |
| `init_plugin_suite_fx_engine_seasonal_window` | Change the built-in date window of a theme |
| `init_plugin_suite_fx_engine_lunar_dates` | Add or override Tết / Mid-Autumn dates per year |
| `init_plugin_suite_fx_engine_seasonal_config` | Alter the payload sent to the frontend |

## What's New in v2.0.0

- **Block Editor (Gutenberg) support**: a native **FX Trigger** block, equivalent to `[initfxen-fx]`, grouped under its own **Init FX Engine** category in the block inserter. It shares the exact same rendering code as the shortcode, with a live preview right in the editor
- **Requires at least** raised from 5.5 to 6.9, for consistency with the rest of the Init Plugin Suite's 2.0.0 releases
- No Abilities API in this release — this plugin has no data to read or write (everything it does is a purely visual, client-side effect), so there's nothing meaningful for an AI agent to query here

## Features

- Native Block Editor block: **FX Trigger** — with a live preview in the editor
- Interactive visual effects: Fireworks, Emoji Rain, Heart Rain, Cannon Blast, Celebration Burst, Starlight, Halloween Burst, Lucky Money, Fireworks Show, Snow Burst, Lantern Rise
- Animated preloaders with 6 built-in styles (Dot, Bar, Logo, Flower, Spinner, Emoji)
- Auto-fetch favicon for logo-based preloader
- Snowfall effect with automatic or custom date scheduling
- Seasonal Effects: Halloween, Christmas, New Year, Tết, Valentine, Mid-Autumn — automatic holiday calendar, custom schedule or always-on
- Real fireworks show (fireworks-js) for New Year's Eve and celebrations
- Grayscale mode (manual or scheduled) for solemn occasions
- Shortcodes: `[initfxen-fx]` to trigger effects, `[initfxen-fx-ambient]` for background animation (legacy aliases `[init-fx]` / `[init-fx-ambient]` still work)
- Comment/content keyword triggers for instant effects
- Inline text formatting: `*bold*`, `~strike~`, `` `italic` ``, `^highlight^`, `_neon_`
- Settings page with real-time preview
- Lightweight, extensible, multilingual-ready

## Block Editor (Gutenberg)

A native block is available under its own **Init FX Engine** category in the block inserter — no shortcode needed if you prefer working entirely in the editor:

- **FX Trigger** — equivalent to `[initfxen-fx]`. A link or button that fires a visual effect (fireworks, emoji rain, etc.) on click or hover, with full control over effect, trigger, tag, and emoji right from the block sidebar

The block shares the exact same rendering code as the shortcode, so switching between the two never changes the output.

> **Note:** `[initfxen-fx-ambient]` (background particles) does not have a block equivalent yet — its rendering behavior wasn't stable enough to bring into the Block Editor in this release. The shortcode itself is untouched and works exactly as before.

## Installation

1. Upload to `/wp-content/plugins/init-fx-engine`
2. Activate in WordPress admin
3. Go to **Settings → Init FX Engine** and configure effects
4. Optionally insert `[initfxen-fx-ambient]` into posts or templates, or add the **FX Trigger** block in the editor

## Requirements

- WordPress 6.9 or later (raised from 5.5 in v2.0.0)
- PHP 7.4 or later

## License

GPLv2 or later — open source, extensible, developer-first.

## Part of Init Plugin Suite

Init FX Engine is part of the [Init Plugin Suite](https://en.inithtml.com/init-plugin-suite-minimalist-powerful-and-free-wordpress-plugins/) — a collection of blazing-fast, no-bloat plugins made for WordPress developers who care about quality and speed.
