"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl border shadow-md bg-gray-200 dark:bg-gray-800 dark:text-white"
    >
      {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
    </button>
  )
}
