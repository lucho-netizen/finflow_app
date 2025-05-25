import { useEffect } from "react"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      // Borra manualmente la cookie si el backend no lo hace
      document.cookie = "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      navigate("/login")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  )
}
