import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";
import { PopupWarehouse } from "@/components/component/popup-warehouse";
import { Alert } from "@/components/ui/alert";

export function ListPallets({ pallets }) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });

  const sortedPallets = [...pallets].sort((a, b) => b.Numero.localeCompare(a.Numero, undefined, { numeric: true }));
  const filteredPallets = sortedPallets.filter((pallet) => {
    return (
      pallet.Numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pallet.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pallet.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleMoveClick = (pallet) => {
    setSelectedPallet(pallet);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPallet(null);
  };

  const handleSuccess = (type, title, message) => {
    setAlert({ show: true, type, title, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', title: '', message: '' });
    }, 5000); // Hide alert after 5 seconds
  };

  return (
    <Card className="border-none">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Paquetes</CardTitle>
          <CardDescription>Lista de paquetes.</CardDescription>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full lg:w-auto mt-4 lg:mt-0 lg:ml-auto">
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 lg:mb-0 lg:mr-4 w-full lg:w-auto"
          />
          <Link href={`${pathname}/move`} passHref>
            <Button className="w-full lg:w-auto">Mover Cajon</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {alert.show && <Alert type={alert.type} title={alert.title} message={alert.message} />}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Almacen</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPallets.map((pallet) => (
              <TableRow key={pallet.IdPallet}>
                <TableCell>{pallet.Numero.slice(-4)}</TableCell>
                <TableCell>{pallet.location}</TableCell>
                <TableCell>{pallet.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <Ellipsis className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="hidden">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleMoveClick(pallet)}>Mover de almacen</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link href={`${pathname}/create`} passHref>
          <Button className="w-full lg:w-auto">Create New Pallet</Button>
        </Link>
      </CardFooter>

      {selectedPallet && (
        <PopupWarehouse
          pallet={selectedPallet}
          isOpen={isDialogOpen}
          onClose={closeDialog}
          onSuccess={handleSuccess}
        />
      )}
    </Card>
  );
}
