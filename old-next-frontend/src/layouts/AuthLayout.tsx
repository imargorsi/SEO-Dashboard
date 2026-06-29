import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--bg)]">
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
