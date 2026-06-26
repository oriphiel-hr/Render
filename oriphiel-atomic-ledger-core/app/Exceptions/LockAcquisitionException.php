<?php

namespace App\Exceptions;

class LockAcquisitionException extends LedgerException
{
    public function __construct(private readonly string $lockKey)
    {
        parent::__construct(sprintf('Unable to acquire distributed lock: %s', $lockKey));
    }

    public function errorCode(): string
    {
        return 'LOCK_ACQUISITION_FAILED';
    }

    public function statusCode(): int
    {
        return 503;
    }

    public function context(): array
    {
        return ['lock_key' => $this->lockKey];
    }
}
