<?php

/**
 * Fallback entry when the web server document root is the Laravel project root
 * (same folder as this file) instead of `public/`.
 *
 * With DirectoryIndex, requesting the folder URL can run this file and boot Laravel.
 * Routes like /login still need either mod_rewrite + root `.htaccess`, or the host
 * must point the document root at `public/`.
 */
require __DIR__.'/public/index.php';
