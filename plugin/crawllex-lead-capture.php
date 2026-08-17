<?php
/**
 * Plugin Name: Crawllex Lead Capture
 * Plugin URI: https://crawllex.com
 * Description: Send WordPress form submissions to Crawllex with a Lead Source Key.
 * Version: 0.1.0
 * Requires at least: 6.2
 * Requires PHP: 8.1
 * Author: Crawllex
 * License: GPL-2.0-or-later
 * Text Domain: crawllex-lead-capture
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CRAWLLEX_LC_VERSION', '0.1.0');
define('CRAWLLEX_LC_FILE', __FILE__);
define('CRAWLLEX_LC_DIR', plugin_dir_path(__FILE__));
define('CRAWLLEX_LC_OPTION', 'crawllex_lead_capture');
define('CRAWLLEX_LC_VERIFY_PATH', '/api/v1/leads/ingest/verify');
define('CRAWLLEX_LC_INGEST_PATH', '/api/v1/leads/ingest');
define('CRAWLLEX_LC_KEY_HEADER', 'X-Lead-Source-Key');
define('CRAWLLEX_LC_KEY_PREFIX', 'clx_ls_');
define('CRAWLLEX_LC_KEY_HEX_LENGTH', 64);
define('CRAWLLEX_LC_LOG_LIMIT', 20);
define('CRAWLLEX_LC_EXTRAS_MAX_KEYS', 40);
define('CRAWLLEX_LC_EXTRAS_KEY_MAX', 80);
define('CRAWLLEX_LC_EXTRAS_VALUE_MAX', 2000);
define('CRAWLLEX_LC_MESSAGE_MAX', 200);

require_once CRAWLLEX_LC_DIR . 'includes/class-logger.php';
require_once CRAWLLEX_LC_DIR . 'includes/class-client.php';
require_once CRAWLLEX_LC_DIR . 'includes/class-normalizer.php';
require_once CRAWLLEX_LC_DIR . 'includes/class-settings.php';
require_once CRAWLLEX_LC_DIR . 'includes/class-forms.php';
require_once CRAWLLEX_LC_DIR . 'includes/class-plugin.php';

Crawllex_Lead_Capture_Plugin::init();
