<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferFundsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return (int) $this->input('sender_id') === $user->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sender_id' => ['required', 'integer', 'exists:users,id'],
            'receiver_id' => ['required', 'integer', 'exists:users,id', 'different:sender_id'],
            'amount' => ['required', 'regex:/^\d+(\.\d{1,8})?$/'],
            'asset' => ['nullable', 'string', 'max:16'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ];
    }
}
