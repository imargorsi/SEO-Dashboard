<x-mail::message>
# {{ __('Account approved') }}

{{ __('Hi :name,', ['name' => $pocName]) }}

{{ __('Your company :company has been approved. You can now sign in with the email and password you chose during registration.', ['company' => $companyName]) }}

<x-mail::button :url="$frontendUrl">
{{ __('Go to dashboard') }}
</x-mail::button>

{{ __('Sign in at') }}: {{ $apiLoginUrl }}

{{ __('Thanks,') }}<br>
{{ config('app.name') }}
</x-mail::message>
