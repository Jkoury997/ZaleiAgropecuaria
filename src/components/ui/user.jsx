import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { UserRound } from "lucide-react";

export function UserDropMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
        const response = await fetch('/api/jinx/Logout');
        const data = await response.json();
        if (data.success === true) {
            // Limpiar localStorage si la API lo indica
            if (data.clearStorage) {
                localStorage.removeItem('cosechaFiltros');
                localStorage.removeItem('cosechaUltimaCarga');
            }
            window.location.href = "/auth/login";
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

  const handleProfileRedirect = () => {
    const useruuid = Cookies.get('useruuid'); // Asegúrate de que 'useruuid' es el nombre de tu cookie
    if (useruuid) {
      router.push(`/dashboard/profile?useruuid=${useruuid}`);
    }
  };

  return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative  rounded-full">
                    <UserRound className='h-5 w-5'  alt="Avatar"></UserRound>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileRedirect}>Perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Cerrar sesion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
  );
}
