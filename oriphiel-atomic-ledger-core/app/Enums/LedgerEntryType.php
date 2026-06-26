<?php

namespace App\Enums;

enum LedgerEntryType: string
{
    case DepositPending = 'deposit_pending';
    case DepositConfirm = 'deposit_confirm';
    case WithdrawalLock = 'withdrawal_lock';
    case WithdrawalComplete = 'withdrawal_complete';
    case TradeLock = 'trade_lock';
    case TradeSettle = 'trade_settle';
    case TransferOut = 'transfer_out';
    case TransferIn = 'transfer_in';
    case OpeningBalance = 'opening_balance';
    case AdminAdjustment = 'admin_adjustment';
}
