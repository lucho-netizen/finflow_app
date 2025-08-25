import { useNavigate } from "react-router-dom"

export function useFetchWithAuth() {
  const navigate = useNavigate()

  const fetchWithAuth = async <T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    try {
      const res = await fetch(url, {
        ...options,
        credentials: "include", // cookies JWT o sesión
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      })

      if (res.status === 401) {
        // Token inválido o expirado → redirigir login
        navigate("/login")
        return null
      }

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      return (await res.json()) as T
    } catch (error) {
      console.error("❌ Fetch error:", error)
      return null
    }
  }

  return fetchWithAuth
}
