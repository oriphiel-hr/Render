<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferFundsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.regex' => 'Amount must be a positive decimal with up to 8 fractional digits.',
            'receiver_id.different' => 'Sender and receiver must be different users.',
        ];
    }
}
