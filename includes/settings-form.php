<?php defined('ABSPATH') || exit; ?>

<div class="wrap">
    <h1><?php esc_html_e('Init FX Engine Settings', 'init-fx-engine'); ?></h1>
    <form method="post" action="options.php">
        <?php
        settings_fields('init_plugin_suite_fx_engine_settings_group');

        $keywords = get_option('init_plugin_suite_fx_engine_keywords', []);
        $snowfall = get_option('init_plugin_suite_fx_engine_snowfall', []);
        $grayscale = get_option('init_plugin_suite_fx_engine_grayscale', []);
        $preloader = get_option('init_plugin_suite_fx_engine_preloader', []);

        $fields = [
            'firework'         => __('Firework', 'init-fx-engine'),
            'starlightBurst'   => __('Starlight Burst', 'init-fx-engine'),
            'emojiRain'        => __('Emoji Rain', 'init-fx-engine') . '<br><small>' . __('Format: keyword:emoji, keyword:emoji', 'init-fx-engine') . '</small>',
            'cannonBlast'      => __('Cannon Blast', 'init-fx-engine'),
            'heartRain'        => __('Heart Rain', 'init-fx-engine'),
            'schoolPride'      => __('School Pride', 'init-fx-engine'),
            'celebrationBurst' => __('Celebration Burst', 'init-fx-engine')
        ];
        ?>

        <table class="form-table" role="presentation">
            <tr>
                <th scope="row"><?php esc_html_e('Preloader (Loading screen)', 'init-fx-engine'); ?></th>
                <td>
                    <label>
                        <input type="checkbox" name="init_plugin_suite_fx_engine_preloader[enabled]" value="1" <?php checked($preloader['enabled'] ?? false); ?>>
                        <?php esc_html_e('Enable loading screen before page fully loads', 'init-fx-engine'); ?>
                    </label>
                    <br><br>
                    <label>
                        <?php esc_html_e('Style', 'init-fx-engine'); ?>:
                        <select name="init_plugin_suite_fx_engine_preloader[style]">
                            <?php
                            $styles = ['dot', 'bar', 'logo', 'flower', 'spinner', 'emoji'];
                            foreach ($styles as $style):
                                printf(
                                    '<option value="%1$s" %2$s>%3$s</option>',
                                    esc_attr($style),
                                    selected($preloader['style'] ?? '', $style, false),
                                    esc_html(ucwords(str_replace(['_', '-'], ' ', $style)))
                                );
                            endforeach;
                            ?>
                        </select>
                    </label>
                    <br><br>
                    <label>
                        <?php esc_html_e('Background Color', 'init-fx-engine'); ?>:
                        <input type="text" name="init_plugin_suite_fx_engine_preloader[bg]" class="regular-text"
                               value="<?php echo esc_attr($preloader['bg'] ?? ''); ?>"
                               placeholder="#ffffff or red, blue">
                        <br>
                        <small><?php esc_html_e('Use a single color or comma-separated values for gradient.', 'init-fx-engine'); ?></small>
                    </label>
                    <br><br>
                    <label>
                        <input type="checkbox"
                               name="init_plugin_suite_fx_engine_preloader[session_once]"
                               value="1" <?php checked($preloader['session_once'] ?? false); ?>>
                        <?php esc_html_e('Only show on first visit in a session', 'init-fx-engine'); ?>
                    </label>
                </td>
            </tr>

            <?php foreach ($fields as $key => $label): ?>
                <tr>
                    <th scope="row">
                        <label for="fx_engine_keywords_<?php echo esc_attr($key); ?>">
                            <?php echo wp_kses_post($label); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" class="regular-text fx-keyword-input"
                               id="fx_engine_keywords_<?php echo esc_attr($key); ?>"
                               name="init_plugin_suite_fx_engine_keywords[<?php echo esc_attr($key); ?>]"
                               value="<?php echo esc_attr($keywords[$key] ?? ''); ?>">
                        <button type="button" class="button fx-preview-btn" data-effect="<?php echo esc_attr($key); ?>">
                            <?php esc_html_e('Preview', 'init-fx-engine'); ?>
                        </button>
                    </td>
                </tr>
            <?php endforeach; ?>

            <tr>
                <th scope="row"><?php esc_html_e('Snowfall Effect', 'init-fx-engine'); ?></th>
                <td>
                    <label>
                        <input type="checkbox" name="init_plugin_suite_fx_engine_snowfall[enabled]" value="1" <?php checked($snowfall['enabled'] ?? false); ?>>
                        <?php esc_html_e('Enable snowfall effect on site', 'init-fx-engine'); ?>
                    </label>
                    <br><br>
                    <label><input type="radio" name="init_plugin_suite_fx_engine_snowfall[mode]" value="auto" <?php checked($snowfall['mode'] ?? 'auto', 'auto'); ?>>
                        <?php esc_html_e('Auto schedule (Dec 20 – Dec 31)', 'init-fx-engine'); ?></label>
                    <br>
                    <label><input type="radio" name="init_plugin_suite_fx_engine_snowfall[mode]" value="custom" <?php checked($snowfall['mode'] ?? 'auto', 'custom'); ?>>
                        <?php esc_html_e('Custom schedule', 'init-fx-engine'); ?></label>
                    <div style="margin-top: 0.5em;">
                        <label><?php esc_html_e('Start Date', 'init-fx-engine'); ?>:
                            <input type="date" name="init_plugin_suite_fx_engine_snowfall[custom_start]" value="<?php echo esc_attr($snowfall['custom_start'] ?? ''); ?>">
                        </label>
                        &nbsp;
                        <label><?php esc_html_e('End Date', 'init-fx-engine'); ?>:
                            <input type="date" name="init_plugin_suite_fx_engine_snowfall[custom_end]" value="<?php echo esc_attr($snowfall['custom_end'] ?? ''); ?>">
                        </label>
                    </div>
                    <br>
                    <label>
                        <input type="checkbox"
                               name="init_plugin_suite_fx_engine_snowfall[homepage_only]"
                               value="1" <?php checked($snowfall['homepage_only'] ?? false); ?>>
                        <?php esc_html_e('Show snowfall effect on homepage only', 'init-fx-engine'); ?>
                    </label>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Grayscale (Turn off full page color)', 'init-fx-engine'); ?></th>
                <td>
                    <label>
                        <input type="checkbox" name="init_plugin_suite_fx_engine_grayscale[enabled]" value="1" <?php checked($grayscale['enabled'] ?? false); ?>>
                        <?php esc_html_e('Enable grayscale effect on site', 'init-fx-engine'); ?>
                    </label>
                    <br><br>
                    <label><input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="always" <?php checked($grayscale['mode'] ?? 'always', 'always'); ?>>
                        <?php esc_html_e('Always on', 'init-fx-engine'); ?></label>
                    <br>
                    <label><input type="radio" name="init_plugin_suite_fx_engine_grayscale[mode]" value="custom" <?php checked($grayscale['mode'] ?? 'off', 'custom'); ?>>
                        <?php esc_html_e('Custom schedule', 'init-fx-engine'); ?></label>
                    <div style="margin-top: 0.5em;">
                        <label><?php esc_html_e('Start Date', 'init-fx-engine'); ?>:
                            <input type="date" name="init_plugin_suite_fx_engine_grayscale[custom_start]" value="<?php echo esc_attr($grayscale['custom_start'] ?? ''); ?>">
                        </label>
                        &nbsp;
                        <label><?php esc_html_e('End Date', 'init-fx-engine'); ?>:
                            <input type="date" name="init_plugin_suite_fx_engine_grayscale[custom_end]" value="<?php echo esc_attr($grayscale['custom_end'] ?? ''); ?>">
                        </label>
                    </div>
                </td>
            </tr>

            <tr>
                <th scope="row"><?php esc_html_e('Inline Formatting', 'init-fx-engine'); ?></th>
                <td>
                    <label>
                        <input type="checkbox"
                               name="init_plugin_suite_fx_engine_inlinefmt[enabled]"
                               value="1" <?php checked($inlinefmt['enabled'] ?? true); ?>>
                        <?php esc_html_e('Apply inline formatting in text', 'init-fx-engine'); ?>
                    </label>
                    <br>
                    <small class="description">
                        <?php esc_html_e('When enabled, the engine will parse simple inline markup in outputs.', 'init-fx-engine'); ?>
                    </small>
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>
</div>
