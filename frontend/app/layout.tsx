// import type { Metadata } from 'next'
import './globals.css'
// import { ThemeProvider } from "@/components/theme-provider"
// import { ThemeSwitcher } from "@/components/theme-switcher"

// export const metadata: Metadata = {
//   title: 'v0 App',
//   description: 'Created with v0',
//   generator: 'v0.dev',
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   )
// }


import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex justify-end p-4">
            <ThemeSwitcher />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
