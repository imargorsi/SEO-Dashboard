<x-mail::message>
# {{ __('Registration received') }}

{{ __('Hi :name,', ['name' => $pocName]) }}

{{ __('Thank you for registering :company. Your account is pending review by our team.', ['company' => $companyName]) }}

{{ __('You will receive another email once your company has been approved. Until then, you will not be able to sign in.') }}

{{ __('Thanks,') }}<br>
{{ config('app.name') }}
</x-mail::message>
