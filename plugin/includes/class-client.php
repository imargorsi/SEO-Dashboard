<?php

if (!defined('ABSPATH')) {
    exit;
}

final class Crawllex_Lead_Capture_Client
{
    public function __construct(
        private readonly string $base_url,
        private readonly string $source_key,
    ) {
    }

    /**
     * @return array{ok: bool, status: int, message: string, data: mixed}
     */
    public function verify(): array
    {
        return $this->post(CRAWLLEX_LC_VERIFY_PATH, array(
            'pluginVersion' => CRAWLLEX_LC_VERSION,
        ));
    }

    /**
     * @param array<string, mixed> $payload
     * @return array{ok: bool, status: int, message: string, data: mixed}
     */
    public function ingest(array $payload): array
    {
        $payload['pluginVersion'] = CRAWLLEX_LC_VERSION;
        return $this->post(CRAWLLEX_LC_INGEST_PATH, $payload);
    }

    /**
     * @param array<string, mixed> $body
     * @return array{ok: bool, status: int, message: string, data: mixed}
     */
    private function post(string $path, array $body): array
    {
        $json = wp_json_encode($body);
        if (!is_string($json) || $json === '') {
            return array(
                'ok' => false,
                'status' => 0,
                'message' => 'Could not encode the request.',
                'data' => null,
            );
        }

        $url = self::request_url($this->base_url, $path);
        $response = wp_remote_post($url, array(
            'timeout' => 15,
            'redirection' => 0,
            'headers' => array(
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                CRAWLLEX_LC_KEY_HEADER => $this->source_key,
            ),
            'body' => $json,
        ));

        if (is_wp_error($response)) {
            return array(
                'ok' => false,
                'status' => 0,
                'message' => self::clip_message(self::connect_error_message($response, $this->base_url)),
                'data' => null,
            );
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        $raw = (string) wp_remote_retrieve_body($response);
        $decoded = json_decode($raw, true);
        $message = '';
        $data = null;

        if (is_array($decoded)) {
            $message = isset($decoded['message']) ? (string) $decoded['message'] : '';
            $data = $decoded['data'] ?? null;
            $ok = !empty($decoded['success']) && $status >= 200 && $status < 300;
        } else {
            $ok = false;
            $message = 'Unexpected response from Crawllex.';
        }

        if ($message === '') {
            $message = $ok ? 'Request succeeded.' : 'Request failed.';
        }

        return array(
            'ok' => $ok,
            'status' => $status,
            'message' => self::clip_message($message),
            'data' => $data,
        );
    }

    /**
     * PHP/cURL often resolves "localhost" to IPv6 (::1) while Next.js listens on IPv4.
     */
    private static function request_url(string $base_url, string $path): string
    {
        $base = untrailingslashit($base_url);
        $base = (string) preg_replace('#^(https?://)localhost(?=[:/]|$)#i', '${1}127.0.0.1', $base);
        return $base . $path;
    }

    private static function connect_error_message(WP_Error $error, string $base_url): string
    {
        $raw = $error->get_error_message();
        $code = (string) $error->get_error_code();
        $is_connect = $code === 'http_request_failed'
            && (str_contains($raw, 'cURL error 7') || str_contains(strtolower($raw), 'could not connect'));

        if (!$is_connect) {
            return $raw;
        }

        $host = wp_parse_url($base_url, PHP_URL_HOST);
        if (is_string($host) && in_array(strtolower($host), array('localhost', '127.0.0.1'), true)) {
            return 'Could not connect to Crawllex. On the same computer use http://127.0.0.1:3000. In Docker use http://host.docker.internal:3000. A hosted WordPress site cannot reach localhost.';
        }

        return 'Could not connect to Crawllex at this URL. Check that the dashboard is running and reachable from the WordPress server.';
    }

    private static function clip_message(string $message): string
    {
        $message = trim($message);
        if (function_exists('mb_substr')) {
            return (string) mb_substr($message, 0, CRAWLLEX_LC_MESSAGE_MAX);
        }
        return substr($message, 0, CRAWLLEX_LC_MESSAGE_MAX);
    }
}
