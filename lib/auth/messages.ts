export const authMessages = {
  failed: "These credentials do not match our records.",
  throttle: (seconds: number) => `Too many login attempts. Please try again in ${seconds} seconds.`,
  authenticated: "Authenticated.",
  loggedOut: "Logged out.",
  unauthenticated: "Unauthenticated.",
  unverifiedEmail: "Your email address is not verified.",
  alreadyVerified: "Already verified.",
  verificationSent: "Verification link sent.",
  registrationSuccess:
    "Account created. Check your email for a verification link, then sign in to continue.",
  registrationUnableToSend: "We could not send the verification email. Please try again later.",
  passwordResetSent:
    "Check your email for a link to reset your password. If you do not see it within a few minutes, check your spam folder or try again.",
  passwordResetUserNotFound: "We could not find an account with that email address.",
  passwordResetThrottled: (seconds: number) =>
    `Please wait ${seconds} seconds before requesting another password reset link.`,
  passwordResetUnableToSend: "We could not send the password reset email. Please try again later.",
  passwordResetSuccess: "Your password has been reset. You can sign in with your new password.",
  passwordResetInvalidToken: "This password reset link is invalid or has expired. Request a new link and try again.",
  passwordResetUnable: "We could not reset your password. Please request a new reset link and try again.",
};
