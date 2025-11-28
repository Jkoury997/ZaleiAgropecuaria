"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {Alert } from "@/components/ui/alert";
import { Egg, LoaderIcon} from "lucide-react";
import { sendEmail } from "@/utils/authUtils";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);
    setError("");
    setSuccessMessage("");

    try {
      const sendEmailResponse = await sendEmail({ email });
      if (sendEmailResponse.Estado) {
        setSuccessMessage("Código enviado correctamente a tu correo electrónico.");
        setShowSuccess(true);
        // Redirigir al dashboard después de un pequeño retraso para asegurar que las cookies están establecidas
        setTimeout(() => {
          router.push("/auth/recovery/password");
        }, 2000);
      } else {
        throw new Error(sendEmailResponse.Mensaje || "User access validation failed");
      }
    } catch (error) {
      console.error("Error during email sending or user access:", error);
      setError(error.message || "Tu correo electrónico no existe.");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="flex justify-center">
          <Egg className="h-12 w-12" />
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Zalei Agropecuaria</h1>
            <p className="text-gray-500 dark:text-gray-400">Te enviaremos un código a tu email.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                placeholder="nombre@ejemplo.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {showError && <Alert type="error" title="Error" message={error} />}

            {showSuccess && <Alert type="success" title="Success" message={successMessage} />}

            <div className="flex items-center justify-between">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Cargando
                  </>
                ) : (
                  "Enviar código"
                )}
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
