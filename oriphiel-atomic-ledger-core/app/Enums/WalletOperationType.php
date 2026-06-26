<?php

namespace App\Enums;

enum WalletOperationType: string
{
    case Deposit = 'deposit';
    case Withdrawal = 'withdrawal';
    case Trade = 'trade';
}
