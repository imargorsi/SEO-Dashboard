<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PocCompanyWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Company $company,
        public User $user,
        public string $plainPassword,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Your :app company account is ready', ['app' => config('app.name')]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.poc-company-welcome',
            with: [
                'companyName' => $this->company->name,
                'pocName' => $this->user->name,
                'loginEmail' => $this->user->email,
                'plainPassword' => $this->plainPassword,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
                'apiLoginUrl' => rtrim((string) config('app.url'), '/').'/api/v1/auth/login',
            ],
        );
    }
}
