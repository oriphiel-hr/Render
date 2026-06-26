<?php

namespace App\Exceptions;

class InsufficientFundsException extends LedgerException
{
    public function __construct(
        private readonly string $available,
        private readonly string $requested,
        private readonly int $userId,
    ) {
        parent::__construct(sprintf(
            'Insufficient funds for user %d. Available: %s, requested: %s.',
            $userId,
            $available,
            $requested
        ));
    }

    public function errorCode(): string
    {
        return 'INSUFFICIENT_FUNDS';
    }

    public function context(): array
    {
        return [
            'user_id' => $this->userId,
            'available' => $this->available,
            'requested' => $this->requested,
        ];
    }
}
