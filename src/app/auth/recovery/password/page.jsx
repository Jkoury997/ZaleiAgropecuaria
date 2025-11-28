"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Egg, EyeIcon, EyeOffIcon, LoaderIcon, TriangleAlertIcon, CheckCircleIcon } from "lucide-react";
import { resetPassword, login, userAccess } from "@/utils/authUtils";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setShowError(true);
      setIsLoading(false);
      return;
    }

    try {
      const resetPasswordResponse = await resetPassword({ email, codigo, password });
      if (resetPasswordResponse.Estado) {
        setSuccessMessage("Contraseña cambiada correctamente.");
        setShowSuccess(true);

        // Iniciar sesión automáticamente después de cambiar la contraseña
        const loginResponse = await login({ email, password });
        if (!loginResponse.AccessKey) {
          throw new Error("Error al iniciar sesión después de cambiar la contraseña");
        }

        const userAccessResponse = await userAccess({ empresa: process.env.NEXT_PUBLIC_EMPRESA });
        if (userAccessResponse.Estado) {
          // Redirigir al dashboard después de un pequeño retraso
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
        } else {
          throw new Error(userAccessResponse.Mensaje || "La validación de acceso de usuario falló");
        }
      } else {
        throw new Error(resetPasswordResponse.Mensaje || "La validación de acceso de usuario falló");
      }
    } catch (error) {
      console.error("Error durante el cambio de contraseña:", error);
      setError(error.message || "Tu correo electrónico, código o contraseña es incorrecto.");
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
            <p className="text-gray-500 dark:text-gray-400">Cambia tu contraseña</p>
          </div>
          <form className="space-y-4" onSubmit={handleResetPassword}>
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
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="Código de verificación"
                required
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                id="password"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="absolute bottom-1 right-1 h-7 w-7"
                size="icon"
                variant="ghost"
                type="button"
                onClick={handleTogglePassword}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="sr-only">Alternar visibilidad de la contraseña</span>
              </Button>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              </div>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                className="absolute bottom-1 right-1 h-7 w-7"
                size="icon"
                variant="ghost"
                type="button"
                onClick={handleTogglePassword}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="sr-only">Alternar visibilidad de la contraseña</span>
              </Button>
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
                  "Cambiar contraseña"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
