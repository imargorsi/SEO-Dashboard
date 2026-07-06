<?php

namespace App\Integrations\Google\Data;

final readonly class OAuthState
{
    /**
     * @param  list<string>  $services
     */
    public function __construct(
        public int $projectId,
        public int $userId,
        public array $services,
        public int $expiresAt,
        public string $nonce,
    ) {}

    /**
     * @return array{project_id: int, user_id: int, services: list<string>, expires_at: int, nonce: string}
     */
    public function toPayload(): array
    {
        return [
            'project_id' => $this->projectId,
            'user_id' => $this->userId,
            'services' => $this->services,
            'expires_at' => $this->expiresAt,
            'nonce' => $this->nonce,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromPayload(array $payload): self
    {
        $services = $payload['services'] ?? [];
        if (! is_array($services)) {
            $services = [];
        }

        return new self(
            projectId: (int) ($payload['project_id'] ?? 0),
            userId: (int) ($payload['user_id'] ?? 0),
            services: array_values(array_map('strval', $services)),
            expiresAt: (int) ($payload['expires_at'] ?? 0),
            nonce: (string) ($payload['nonce'] ?? ''),
        );
    }
}
