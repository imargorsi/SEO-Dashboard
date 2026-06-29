<x-mail::message>
# {{ __('Welcome, :name', ['name' => $pocName]) }}

{{ __('Your company :company is now active on :app.', ['company' => $companyName, 'app' => config('app.name')]) }}

{{ __('You are the company administrator (point of contact). Sign in with:') }}

<x-mail::panel>
{{ __('Email') }}: {{ $loginEmail }}

{{ __('Password') }}: {{ $plainPassword }}
</x-mail::panel>

<x-mail::button :url="$frontendUrl">
{{ __('Open app') }}
</x-mail::button>

{{ __('JSON API login URL:') }}

<x-mail::panel>
{{ $apiLoginUrl }}
</x-mail::panel>

{{ __('Send POST with JSON body: `{"email":"…","password":"…"}` to receive a Bearer token.') }}

{{ __('Change your password after first login if you prefer.') }}

{{ __('Regards,') }}<br>
{{ config('app.name') }}
</x-mail::message>
