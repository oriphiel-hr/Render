<?php

namespace App\Exceptions;

class InvalidTransferException extends LedgerException
{
    public function __construct(string $message)
    {
        parent::__construct($message);
    }

    public function errorCode(): string
    {
        return 'INVALID_TRANSFER';
    }
}
