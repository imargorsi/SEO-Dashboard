<?php

if (!defined('ABSPATH')) {
    exit;
}

final class Crawllex_Lead_Capture_Forms
{
    public static function init(): void
    {
        require_once CRAWLLEX_LC_DIR . 'includes/forms/class-contact-form-7.php';
        require_once CRAWLLEX_LC_DIR . 'includes/forms/class-elementor.php';
        Crawllex_Lead_Capture_Contact_Form_7::init();
        Crawllex_Lead_Capture_Elementor::init();
    }
}
