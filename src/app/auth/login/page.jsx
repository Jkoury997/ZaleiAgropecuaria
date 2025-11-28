"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  EggIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { login, userAccess } from "@/utils/authUtils";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);
    setError("");

    try {
      const loginResponse = await login({ email, password });
      if (!loginResponse.AccessKey) {
        throw new Error( loginResponse.Mensaje || "Tu correo electrónico o contraseña es incorrecto.");
      }

      const userAccessResponse = await userAccess({
        empresa: process.env.NEXT_PUBLIC_EMPRESA,
      });
      if (userAccessResponse.Estado) {
                    if (userAccessResponse.Empresa) {
                localStorage.setItem("EMPRESA_NAME", userAccessResponse.Empresa);
            }
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        throw new Error(
          userAccessResponse.Mensaje || "Tu correo electrónico o contraseña es incorrecto."
        );
      }
    } catch (error) {
      console.error("Error during login or user access:", error);
      setError(
        error.message || "Tu correo electrónico o contraseña es incorrecto."
      );
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="flex justify-center">
          <EggIcon className="h-8 w-8" />
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Zalei Agropecuaria</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Inicia sesión en tu cuenta
            </p>
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
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={handleTogglePassword}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  {showPassword ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              <Input
                id="password"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <div className="text-right">
                <Link
                  href="/auth/recovery"
                  className="text-sm text-primary hover:underline"
                  prefetch={false}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            {showError && <Alert type="error" title="Error" message={error} />}
            <div className="flex items-center justify-between">
            <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Cargando
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
