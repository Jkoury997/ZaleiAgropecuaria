import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from 'lucide-react';

export default function ListTable({ data, handleDelete, handleSend }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.FullCode}</TableCell>
              <TableCell>{item.Cantidad}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => handleDelete(index)}>
                  <Trash className="h-5 w-5" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-4 text-right">
        <Button onClick={handleSend}>Crear pallet</Button>
      </div>
    </div>
  );
}
