"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction
} from "@/components/ui/sidebar";
import { BoxIcon, ChevronRight, ClipboardList, HomeIcon, Store } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/dashboard",
      icon:HomeIcon,
      roles: ["admin", "usuario", "recursos_humanos"],
      items: [
,
      ],
    },
    {
      title: "Despachos",
      url: "/dashboard/stock/despachos",
      icon:ClipboardList,
      roles: ["admin", "usuario", "recursos_humanos"],
      items: [
,
      ],
    },
    {
      title: "Almacenes",
      url: "#",
      icon: Store,
      roles: ["admin", "recursos_humanos"],
      items: [
        {
          title: "Lista",
          url: "/dashboard/stock/warehouse",
          roles: ["admin", "recursos_humanos"],
        },
      ],
    },
    {
      title: "Productos",
      url: "#",
      icon: BoxIcon,
      roles: ["admin"],
      items: [
        {
          title: "Cajones",
          url: "/dashboard/stock/cajones/create",
          roles: ["admin"],
        },
        {
          title: "Paquetes",
          url: "/dashboard/stock/pallets/move",
          roles: ["admin"],
        },
      ],
    },
  ],
};

export default function SideBarLinks() {
  const router = useRouter();
   const [title, setTitle] = useState(process.env.NEXT_PUBLIC_EMPRESA_NAME || "Mi Empresa");
  const [suffix, setSuffix] = useState(""); // para mostrar al lado del título

   useEffect(() => {
    // Buscar nombre en localStorage
    const empresaName = localStorage.getItem("EMPRESA_NAME");
    if (empresaName) {
      setTitle(empresaName);

      // Detectar si es sistema de prueba por el nombre
      if (/prueba|test|qa|staging/i.test(empresaName)) {
        setSuffix(" (Prueba)");
      }
    }
  }, []);
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/jinx/Logout");
      if (response.ok) {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Sidebar variant="inset">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground p-2">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{title}{suffix}</span>
                  <span className="truncate text-xs">Zalei Agropecuaria S.A.</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
    <Collapsible key={item.title} asChild >
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
        {item.items?.length > 0 && (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <a href={subItem.url}>{subItem.title}</a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        )}
      </SidebarMenuItem>
    </Collapsible>
  ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              Cerrar Sesion
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
