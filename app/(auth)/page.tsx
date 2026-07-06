import { Suspense } from "react";
import { SignInScreen } from "@/components/auth/sign-in-screen";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SignInScreen />
    </Suspense>
  );
}
