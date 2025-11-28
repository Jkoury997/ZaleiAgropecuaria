import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetTrigger, SheetTitle, SheetHeader, SheetContent, Sheet } from "@/components/ui/sheet";
import { Search } from "@/components/ui/search";
import { UserDropMenu } from "./user";
import { NavLinks } from "./navlinks";
import { MenuIcon } from "lucide-react"; // Asegúrate de importar el icono del menú

export default function Header({ title}) {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const handleLinkClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6">
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button className="lg:hidden" size="icon" variant="ghost">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            <NavLinks onLinkClick={handleLinkClick}/>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
        <UserDropMenu />
      </div>
    </header>
  );
}
