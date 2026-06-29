import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  ForgotPasswordFormSection,
  type ForgotPasswordAuthAlert,
} from "@/sections/ForgotPasswordFormSection.tsx"
import {
  RegisterFormSection,
  type RegisterAuthAlert,
} from "@/sections/RegisterFormSection.tsx"
import {
  ResetPasswordFormSection,
  type ResetPasswordAuthAlert,
} from "@/sections/ResetPasswordFormSection.tsx"
import {
  SignInFormSection,
  type SignInAuthAlert,
} from "@/sections/SignInFormSection.tsx"
import { SignInHeroSection } from "@/sections/SignInHeroSection.tsx"
import type { ForgotPasswordValues } from "@/sections/forgotPassword.types.ts"
import type { RegisterValues } from "@/sections/register.types.ts"
import type { ResetPasswordValues } from "@/sections/resetPassword.types.ts"
import type { SignInValues } from "@/sections/signIn.types.ts"
import { usePostLoginLoading } from "@/context/PostLoginLoadingContext"
import { requestPasswordReset } from "@/lib/auth/forgotPasswordApi"
import { loginWithCredentials } from "@/lib/auth/login"
import {
  clearResetPasswordSearchParams,
  parseResetPasswordLinkParams,
} from "@/lib/auth/resetPasswordLink"
import { submitRegistration } from "@/lib/auth/registerApi"
import { submitPasswordReset } from "@/lib/auth/resetPasswordApi"
import { setStoredAuthUser } from "@/lib/auth/sessionUser.ts"
import { setToken } from "@/lib/auth/token"

type AuthView = "signIn" | "forgotPassword" | "resetPassword" | "register"

export function SignInPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { beginAuthTransition } = usePostLoginLoading()
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" })
  const { t: tFp } = useTranslation("translation", {
    keyPrefix: "auth.forgotPassword",
  })
  const { t: tRp } = useTranslation("translation", {
    keyPrefix: "auth.resetPassword",
  })
  const { t: tReg } = useTranslation("translation", {
    keyPrefix: "auth.register",
  })

  const resetLink = useMemo(
    () => parseResetPasswordLinkParams(searchParams),
    [searchParams],
  )

  const [authView, setAuthView] = useState<AuthView>("signIn")
  const [forgotRequestSent, setForgotRequestSent] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [signInAlert, setSignInAlert] = useState<SignInAuthAlert | null>(null)
  const [forgotAlert, setForgotAlert] =
    useState<ForgotPasswordAuthAlert | null>(null)
  const [resetAlert, setResetAlert] = useState<ResetPasswordAuthAlert | null>(
    null,
  )
  const [registerAlert, setRegisterAlert] =
    useState<RegisterAuthAlert | null>(null)

  const signInForm = useForm<SignInValues>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  })

  const forgotForm = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
    mode: "onBlur",
  })

  const resetForm = useForm<ResetPasswordValues>({
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onBlur",
  })

  const registerForm = useForm<RegisterValues>({
    defaultValues: {
      company_name: "",
      poc_name: "",
      poc_email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onBlur",
  })

  const showResetFromUrl = resetLink != null
  const effectiveView: AuthView = showResetFromUrl ? "resetPassword" : authView

  function clearResetUrlParams() {
    const next = clearResetPasswordSearchParams(searchParams)
    setSearchParams(next, { replace: true })
  }

  async function onSignInSubmit(values: SignInValues) {
    setSignInAlert(null)
    try {
      const { token, message, user } = await loginWithCredentials(
        values.email,
        values.password,
      )
      setToken(token)
      setStoredAuthUser(user)
      const successText =
        (message && message.trim()) || t("loginSuccess")
      setSignInAlert({
        variant: "default",
        title: successText,
      })
      window.setTimeout(() => {
        beginAuthTransition()
        navigate("/dashboard")
      }, 650)
    } catch (err) {
      const text =
        err instanceof Error ? err.message : t("loginErrorUnexpected")
      setSignInAlert({ variant: "destructive", title: text })
    }
  }

  async function onForgotSubmit(values: ForgotPasswordValues) {
    setForgotAlert(null)
    try {
      const json = await requestPasswordReset(values.email.trim())
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null
      if (!json.success) {
        setForgotAlert({
          variant: "destructive",
          title: apiMsg ?? tFp("submitErrorFallback"),
        })
        return
      }
      setForgotRequestSent(true)
      setForgotAlert({
        variant: "default",
        title: apiMsg ?? tFp("submitSuccess"),
      })
    } catch (e) {
      setForgotAlert({
        variant: "destructive",
        title:
          e instanceof Error ? e.message : tFp("submitErrorFallback"),
      })
    }
  }

  async function onRegisterSubmit(values: RegisterValues) {
    setRegisterAlert(null)
    try {
      const pocEmail = values.poc_email.trim()
      const json = await submitRegistration({
        company_name: values.company_name.trim(),
        poc_name: values.poc_name.trim(),
        poc_email: pocEmail,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null

      if (!json.success) {
        setRegisterAlert({
          variant: "destructive",
          title: apiMsg ?? tReg("submitErrorFallback"),
        })
        return
      }

      registerForm.reset()
      setRegisterAlert(null)
      signInForm.reset({ email: pocEmail, password: "" })
      setAuthView("signIn")
      setSignInAlert({
        variant: "default",
        title: apiMsg ?? tReg("submitSuccess"),
      })
    } catch (e) {
      setRegisterAlert({
        variant: "destructive",
        title:
          e instanceof Error ? e.message : tReg("submitErrorFallback"),
      })
    }
  }

  async function onResetSubmit(values: ResetPasswordValues) {
    if (!resetLink?.valid) return

    setResetAlert(null)
    try {
      const json = await submitPasswordReset({
        token: resetLink.token,
        email: resetLink.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      const apiMsg =
        typeof json.message === "string" && json.message.trim()
          ? json.message.trim()
          : null

      if (!json.success) {
        setResetAlert({
          variant: "destructive",
          title: apiMsg ?? tRp("submitErrorFallback"),
        })
        return
      }

      setResetComplete(true)
      setResetAlert({
        variant: "default",
        title: apiMsg ?? tRp("submitSuccess"),
      })
      resetForm.reset()
      clearResetUrlParams()
    } catch (e) {
      setResetAlert({
        variant: "destructive",
        title:
          e instanceof Error ? e.message : tRp("submitErrorFallback"),
      })
    }
  }

  function goToRegister() {
    setSignInAlert(null)
    setRegisterAlert(null)
    registerForm.reset()
    setAuthView("register")
  }

  function goToForgotPassword() {
    setSignInAlert(null)
    const email = signInForm.getValues("email")
    setForgotRequestSent(false)
    setForgotAlert(null)
    forgotForm.reset({ email: email || "" })
    setAuthView("forgotPassword")
  }

  function goToSignIn() {
    setForgotRequestSent(false)
    setForgotAlert(null)
    setResetComplete(false)
    setResetAlert(null)
    setRegisterAlert(null)
    resetForm.reset()
    registerForm.reset()
    clearResetUrlParams()
    setAuthView("signIn")
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col lg:flex-row-reverse">
      {effectiveView === "signIn" ? (
        <SignInFormSection
          register={signInForm.register}
          errors={signInForm.formState.errors}
          isSubmitting={signInForm.formState.isSubmitting}
          onValidSubmit={signInForm.handleSubmit(onSignInSubmit)}
          onForgotPasswordClick={goToForgotPassword}
          onRegisterClick={goToRegister}
          authAlert={signInAlert}
        />
      ) : effectiveView === "register" ? (
        <RegisterFormSection
          register={registerForm.register}
          errors={registerForm.formState.errors}
          isSubmitting={registerForm.formState.isSubmitting}
          onValidSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          onBackToSignIn={goToSignIn}
          authAlert={registerAlert}
        />
      ) : effectiveView === "forgotPassword" ? (
        <ForgotPasswordFormSection
          register={forgotForm.register}
          errors={forgotForm.formState.errors}
          isSubmitting={forgotForm.formState.isSubmitting}
          onValidSubmit={forgotForm.handleSubmit(onForgotSubmit)}
          onBackToSignIn={goToSignIn}
          requestSent={forgotRequestSent}
          authAlert={forgotAlert}
        />
      ) : (
        <ResetPasswordFormSection
          register={resetForm.register}
          errors={resetForm.formState.errors}
          isSubmitting={resetForm.formState.isSubmitting}
          onValidSubmit={resetForm.handleSubmit(onResetSubmit)}
          onBackToSignIn={goToSignIn}
          resetComplete={resetComplete}
          authAlert={resetAlert}
          invalidLink={resetLink?.valid === false}
        />
      )}
      <SignInHeroSection />
    </main>
  )
}
