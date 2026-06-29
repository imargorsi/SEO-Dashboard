<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Company $company,
        public User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Your :app company account has been approved', ['app' => config('app.name')]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.company-approved',
            with: [
                'companyName' => $this->company->name,
                'pocName' => $this->user->name,
                'loginEmail' => $this->user->email,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
                'apiLoginUrl' => rtrim((string) config('app.url'), '/').'/api/v1/auth/login',
            ],
        );
    }
}
