<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1((string) $notifiable->getEmailForVerification()),
            ],
        );

        return (new MailMessage)
            ->subject('Verify your email — '.config('app.name'))
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Click the button below to verify your email and activate your exchange account.')
            ->action('Verify email', $verificationUrl)
            ->line('This link expires in 24 hours.')
            ->line('If you did not create an account, you can ignore this message.');
    }
}
