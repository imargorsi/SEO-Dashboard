import { RouterProvider } from "react-router-dom"
import { PostLoginLoadingProvider } from "./context/PostLoginLoadingContext.tsx"
import { ThemeProvider } from "./context/ThemeContext.tsx"
import { router } from "./router/routes.tsx"
import { SWRProvider } from "./lib/swr/index.ts"

export default function App() {
  return (
    <ThemeProvider>
      <PostLoginLoadingProvider>
        <SWRProvider>
          <RouterProvider router={router} />
        </SWRProvider>
      </PostLoginLoadingProvider>
    </ThemeProvider>
  )
}
