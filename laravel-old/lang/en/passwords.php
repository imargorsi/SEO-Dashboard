<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Password reset language lines
    |--------------------------------------------------------------------------
    |
    | Keys match Laravel's password broker statuses (`passwords.sent`, etc.)
    | for compatibility with Password::sendResetLink() / Password::reset().
    |
    */

    'reset' => 'Your password has been reset. You can sign in with your new password.',

    'sent' => 'We have emailed your password reset link.',

    'sent_notice' => 'Check your email for a link to reset your password. If you do not see it within a few minutes, check your spam folder or try again.',

    'user' => 'We could not find an account with that email address.',

    'token' => 'This password reset link is invalid or has expired. Request a new link and try again.',

    'throttled' => 'Please wait :seconds seconds before requesting another password reset link.',

    'unable_to_send' => 'We could not send the password reset email. Please try again later.',

    'unable_to_reset' => 'We could not reset your password. Please request a new reset link and try again.',

];
