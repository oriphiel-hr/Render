<?php

namespace App\Enums;

enum WalletOperationStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
}
