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
        credentials: "include",
      })

      if (res.status === 401) {
        // Token inválido o expirado
        navigate("/login")
        return null
      }

      return (await res.json()) as T
    } catch (error) {
      console.error("Fetch error:", error)
      return null
    }
  }

  return fetchWithAuth
}
