import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { QrCodeIcon } from "lucide-react";

export default function QrView({ Codigo, Descripcion }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <QrCodeIcon className="h-4 w-4" />
          <span className="sr-only">Ver QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          <div className="bg-white p-2 ">
            <QRCode value={Codigo} size={200} />
          </div>
          <div className="space-y-2 text-center">
            <DialogTitle>{Codigo}</DialogTitle>
            <DialogDescription>
              {Descripcion}
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
