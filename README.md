# Init FX Engine – Interactive, Event-Driven, Lightweight

> Bring your WordPress site to life with fireworks, emoji rain, snowfall, particle backgrounds and hand-drawn seasonal holiday scenes — triggered by keywords, comments, blocks or holidays, and loaded only where they are used.

**Not just effects. A true FX Engine for WordPress.**

[![Version](https://img.shields.io/badge/stable-v2.0.2-blue.svg)](https://wordpress.org/plugins/init-fx-engine/)
[![License](https://img.shields.io/badge/license-GPLv2-blue.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
![Made with ❤️ in HCMC](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20in%20HCMC-blue)

## Overview

Init FX Engine adds modern, interactive visual effects to your WordPress site.  
From fireworks to snowfall, particle backgrounds to full holiday scenes — all effects are customizable, lightweight, and can be triggered by keywords, shortcodes, Block Editor blocks, or scheduled events.

Perfect for celebrations, user engagement, or adding a touch of flair to your site.

## What's New in v2.0.2

- **Smart loading**: canvas-confetti and `fx-engine.js` only load when keywords are set, on pages with an FX shortcode/block, or for the seasonal greeting. A page that uses nothing loads nothing
- **Hand-drawn seasonal scenes** on canvas: crystal snowflakes, blossoms, lucky money, lanterns, hearts, bats, ghosts, glitter — plus decorations (string lights, Tết lanterns, full moon, spider webs) and opt-in click bursts
- **Faster Snowfall**: own canvas renderer replaces particles.js, with depth, wind, crystal flakes and a Preview button
- **Particle backgrounds** powered by [tsParticles](https://github.com/tsparticles/tsparticles): 6 presets for `[initfxen-fx-ambient]` and a new **FX Ambient Section** block with live editor preview
- **New effect**: `blossomRain` (Tết petals)
- **Nicer spoilers**: blurred background, label auto-hidden on short spoilers
- **Fixes**: shortcode tag allow-list (security), Grayscale breaking `position: fixed`, Safari < 16.4 crash, and more — see the [changelog](https://wordpress.org/plugins/init-fx-engine/#developers)

## Features

- Native Block Editor blocks: **FX Trigger** and **FX Ambient Section** — with live preview in the editor
- Interactive effects: Fireworks, Emoji Rain, Heart Rain, Cannon Blast, Celebration Burst, Starlight, Halloween Burst, Lucky Money, Blossom Rain, Fireworks Show, Snow Burst, Lantern Rise
- Seasonal Effects: Halloween, Christmas, New Year, Tết, Valentine, Mid-Autumn — automatic holiday calendar (lunar dates through 2040), custom schedule or always-on
- Particle backgrounds: network links, stars, snow, bubbles, fireflies, emoji
- Snowfall with automatic or custom date scheduling
- Animated preloaders with 6 styles (Dot, Bar, Logo, Flower, Spinner, Emoji)
- Grayscale mode (manual or scheduled) for solemn occasions
- Keyword triggers in comments and content
- Inline formatting: `*bold*`, `~strike~`, `` `italic` ``, `^highlight^`, `_neon_`, `||spoiler||`
- Settings page with real-time previews and a shortcode generator
- Respects `prefers-reduced-motion`, pauses in hidden tabs, multilingual-ready

## Shortcodes

| Shortcode | Purpose |
| --- | --- |
| `[initfxen-fx text="Boom" fx="firework" shoot="click"]` | Trigger an effect on `click`, `hover`, `in-view` or `immediate` |
| `[initfxen-fx-ambient ambient="stars"]` | Particle background: `links`, `stars`, `snow`, `bubbles`, `fireflies`, `emoji` |

Legacy aliases `[init-fx]` / `[init-fx-ambient]` still work.

## Developers

**JavaScript:** `FXEngine.trigger(name, options)`, `FXEngine.register(name, fn)`, `FXEngine.effects()`, `FXEngine.scan(root)`, `FXInline.format(root)`

| Filter | Purpose |
| --- | --- |
| `init_plugin_suite_fx_engine_load_engine` | Force the FX engine to load on the current page |
| `init_plugin_suite_fx_engine_ambient_config` | Alter the particle background config |
| `init_plugin_suite_fx_engine_seasonal_themes` | Add, remove or tweak seasonal themes |
| `init_plugin_suite_fx_engine_seasonal_window` | Change the built-in date window of a theme |
| `init_plugin_suite_fx_engine_lunar_dates` | Add or override Tết / Mid-Autumn dates per year |
| `init_plugin_suite_fx_engine_seasonal_config` | Alter the seasonal payload sent to the frontend |

## Installation

1. Upload to `/wp-content/plugins/init-fx-engine`
2. Activate in WordPress admin
3. Go to **Settings → Init FX Engine** and configure effects
4. Optionally add the **FX Trigger** / **FX Ambient Section** blocks, or use the shortcodes

## Requirements

- WordPress 6.9 or later
- PHP 7.4 or later

## Credits

Bundled libraries: [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC), [fireworks-js](https://github.com/crashmax-dev/fireworks-js) (MIT), [tsParticles](https://github.com/tsparticles/tsparticles) (MIT).

## License

GPLv2 or later — open source, extensible, developer-first.

## Part of Init Plugin Suite

Init FX Engine is part of the [Init Plugin Suite](https://en.inithtml.com/init-plugin-suite-minimalist-powerful-and-free-wordpress-plugins/) — a collection of blazing-fast, no-bloat plugins made for WordPress developers who care about quality and speed.
