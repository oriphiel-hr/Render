<?php

namespace App\Notifications;

use App\Models\UserInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly UserInvitation $invitation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $acceptUrl = url('/invite/'.$this->invitation->token);

        return (new MailMessage)
            ->subject('You are invited to '.config('app.name'))
            ->greeting('Hello '.$this->invitation->name.'!')
            ->line('An administrator invited you to join the exchange ledger platform.')
            ->action('Accept invitation', $acceptUrl)
            ->line('This invitation expires on '.$this->invitation->expires_at->toDayDateTimeString().'.');
    }
}
