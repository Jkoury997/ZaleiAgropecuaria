"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ProductList({ listProducts, despachoInfo, onRetiraSubmit }) {
  const [productos, setProductos] = useState(listProducts || []);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Estado controlado
  const [retiro, setRetiro] = useState({});      // { [IdArticulo]: number | NaN }
  const [retiroStr, setRetiroStr] = useState({}); // { [IdArticulo]: string (lo que escribe el usuario) }
  const [almacen, setAlmacen] = useState({});    // { [IdArticulo]: string }

  const inputRefs = useRef({});

  // --- Helpers ---
  const getSelectedDepot = (p) =>
    (almacen[p.IdArticulo] ?? despachoInfo?.CodAlmacen ?? (p.Almacenes?.[0]?.Codigo ?? ""));

  const getDepotNameForCode = (code, p) => {
    if (!code) return "";
    if (code === despachoInfo?.CodAlmacen) return despachoInfo?.Almacen || code;
    const hit = (Array.isArray(p?.Almacenes) ? p.Almacenes : []).find(a => a?.Codigo === code);
    if (hit?.Descripcion) return hit.Descripcion;
    return code;
  };

  // Sugerencia: stock + 30% (no se valida contra esto, solo info)
  const getMaxRetira = (p) => Math.floor(Number(p?.Cantidad ?? 0) * 1.3);

  // Parse flexible: acepta "12,5", "12.5", "1.234,5", "1,234.5"
  const parseFlexibleNumber = (val) => {
    if (val === null || val === undefined) return NaN;
    const s = String(val).trim();
    if (s === "") return NaN;

    const hasComma = s.includes(",");
    const hasDot = s.includes(".");
    let normalized = s;

    if (hasComma && hasDot) {
      const lastComma = s.lastIndexOf(",");
      const lastDot = s.lastIndexOf(".");
      if (lastComma > lastDot) {
        // coma como decimal -> remover puntos (miles) y cambiar coma por punto
        normalized = s.replace(/\./g, "").replace(",", ".");
      } else {
        // punto como decimal -> remover comas (miles)
        normalized = s.replace(/,/g, "");
      }
    } else if (hasComma) {
      // solo coma -> decimal
      normalized = s.replace(",", ".");
    } else {
      // solo punto o solo dígitos
      normalized = s;
    }

    const n = Number(normalized);
    return n;
  };

  // Sync props -> estado + defaults (default SIEMPRE el del despacho)
  useEffect(() => {
    const arr = Array.isArray(listProducts) ? listProducts : [];
    setProductos(arr);

    setAlmacen(prev => {
      const next = { ...prev };
      for (const p of arr) {
        if (!next[p.IdArticulo]) {
          const defaultCode = despachoInfo?.CodAlmacen || (p.Almacenes?.[0]?.Codigo ?? "");
          next[p.IdArticulo] = defaultCode;
        }
      }
      return next;
    });

    setRetiro(prev => {
      const next = { ...prev };
      for (const p of arr) {
        if (typeof next[p.IdArticulo] === "undefined") next[p.IdArticulo] = 0;
      }
      return next;
    });

    setRetiroStr(prev => {
      const next = { ...prev };
      for (const p of arr) {
        if (typeof next[p.IdArticulo] === "undefined") next[p.IdArticulo] = "0";
      }
      return next;
    });
  }, [listProducts, despachoInfo?.CodAlmacen]);

  // Foco + scroll al seleccionar tarjeta
  useEffect(() => {
    if (selectedProductId && inputRefs.current[selectedProductId]) {
      const el = inputRefs.current[selectedProductId];
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedProductId]);

  // Cambios controlados (sin tope, acepta coma/punto)
  const handleRetiraChange = (producto, rawValue) => {
    setRetiroStr(prev => ({ ...prev, [producto.IdArticulo]: rawValue }));
    const parsed = parseFlexibleNumber(rawValue);
    setRetiro(prev => ({ ...prev, [producto.IdArticulo]: Number.isFinite(parsed) ? parsed : NaN }));
  };

  const handleAlmacenChange = (idArticulo, codigo) => {
    setAlmacen(prev => ({ ...prev, [idArticulo]: codigo }));
  };

  // Validaciones/resumen + REGLA GLOBAL DE DEPÓSITO ÚNICO
  const {
    invalidItems,
    totalRetira,
    allZero,
    enforcedDepot,
    enforcedDepotDesc,
    crossDepotError,
  } = useMemo(() => {
    let invalid = [];
    let total = 0;

    let enforced = null;
    let enforcedDesc = null;

    // 1) Encontrar depósito "enforced" (del primer ítem con Retira > 0)
    for (const p of productos) {
      const raw = retiroStr[p.IdArticulo] ?? "";
      const parsed = parseFlexibleNumber(raw);
      const r = Number.isFinite(parsed) ? parsed : 0;
      if (r > 0) {
        enforced = getSelectedDepot(p);
        enforcedDesc = getDepotNameForCode(enforced, p);
        break;
      }
    }

    // 2) Validar por ítem + detectar conflicto global
    let conflict = false;
    for (const p of productos) {
      const raw = retiroStr[p.IdArticulo] ?? "";
      const parsed = parseFlexibleNumber(raw);
      const isEmpty = raw.trim() === "";
      const r = Number.isFinite(parsed) ? parsed : 0;

      // total solo suma números válidos y >= 0
      if (Number.isFinite(parsed) && r >= 0) total += r;

      const depotCode = getSelectedDepot(p);
      const hasDepot = String(depotCode || "").length > 0;

      const inval =
        (!isEmpty && !Number.isFinite(parsed)) || // escribió algo inválido
        r < 0 ||                                   // negativos no
        (r > 0 && !hasDepot);                      // si retira, debe haber depósito

      if (inval) invalid.push(p.IdArticulo);

      if (enforced && r > 0 && depotCode !== enforced) {
        conflict = true;
      }
    }

    return {
      invalidItems: invalid,
      totalRetira: total,
      allZero: total === 0,
      enforcedDepot: enforced,           // código
      enforcedDepotDesc: enforcedDesc,   // descripción
      crossDepotError: Boolean(enforced) && conflict,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos, retiroStr, almacen, despachoInfo?.CodAlmacen]);

  // Submit (incluye CodAlmacen y DescAlmacen cuando Retira > 0)
  const handleGenerate = () => {
    const result = productos.map(p => {
      const raw = retiroStr[p.IdArticulo] ?? "";
      const parsed = parseFlexibleNumber(raw);
      const Retira = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
      const cod = getSelectedDepot(p);
      const desc = getDepotNameForCode(cod, p);
      return {
        IdArticulo: p.IdArticulo,
        Codigo: p.Codigo,
        Descripcion: p.Descripcion,
        Cantidad: p.Cantidad,
        Retira,
        ...(Retira > 0 ? { CodAlmacen: cod, DescAlmacen: desc } : {}),
      };
    });

    const onlyWithRetira = result.filter(item => Number(item.Retira) > 0);

    console.log("Productos a enviar (Retira > 0):", onlyWithRetira);
    onRetiraSubmit?.(onlyWithRetira);
  };

  // Deshabilitar submit si: errores por ítem, todo en 0 o hay conflicto de depósitos
  const disableSubmit = invalidItems.length > 0 || allZero || crossDepotError;

  return (
    <div className="space-y-4 pb-4">
      {/* Cabecera del Despacho */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-lg">Información del Despacho</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="text-sm">
            <p className="font-medium text-gray-500">ID: {despachoInfo?.Id}</p>
            <p className="font-medium text-gray-500">Número: {despachoInfo?.Numero}</p>
            <p className="font-medium text-gray-500">
              Almacén por defecto: {despachoInfo?.Almacen} ({despachoInfo?.CodAlmacen})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Productos */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold">Productos para Retirar ({productos.length})</h2>
          <div className="text-sm text-gray-600">
            Total a retirar: <span className="font-semibold">{totalRetira}</span>
          </div>
        </div>

        <div className="space-y-4">
          {productos.map(p => {
            const valueRetiraStr = retiroStr[p.IdArticulo] ?? "";
            const selectedAlmacenCode = getSelectedDepot(p);
            const inval = invalidItems.includes(p.IdArticulo);
            const parsed = parseFlexibleNumber(valueRetiraStr);
            const r = Number.isFinite(parsed) ? parsed : 0;
            const mismatch = Boolean(enforcedDepot) && r > 0 && selectedAlmacenCode !== enforcedDepot;

            const itemOptions = Array.isArray(p.Almacenes)
              ? p.Almacenes.filter(a => a.Codigo !== despachoInfo?.CodAlmacen)
              : [];

            return (
              <Card
                key={p.IdArticulo}
                className={`w-full ${inval || mismatch ? "ring-2 ring-destructive" : ""}`}
                onClick={() => setSelectedProductId(p.IdArticulo)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-lg">{p.Descripcion}</p>
                      <div className="text-sm text-gray-600 flex gap-4">
                        <span>ID: {p.IdArticulo}</span>
                        <span>Código: {p.Codigo}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      {/* Cantidad original */}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Cantidad:</p>
                        <p className="text-lg font-semibold">{p.Cantidad}</p>
                      </div>

                      {/* Retira (controlado sin tope, coma/punto) */}
                      <div className="flex flex-col">
                        <label htmlFor={`retira-${p.IdArticulo}`} className="text-sm font-medium text-gray-500">
                          Retira:
                        </label>
                        <Input
                          id={`retira-${p.IdArticulo}`}
                          type="text"                 // ← texto para permitir coma y punto libremente
                          inputMode="decimal"         // ← teclado decimal en mobile
                          ref={(el) => (inputRefs.current[p.IdArticulo] = el)}
                          value={valueRetiraStr}
                          onChange={(e) => handleRetiraChange(p, e.target.value)}
                          className="w-28 text-right"
                          placeholder="Cantidad"
                          autoFocus={selectedProductId === p.IdArticulo}
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          Formato: 12,5 o 12.5 · Sugerido máx: {getMaxRetira(p)}
                        </span>
                      </div>

                      {/* Almacén por ítem */}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Almacén para este ítem</span>

                        {Array.isArray(p.Almacenes) && p.Almacenes.length > 0 ? (
                          <Select
                            value={selectedAlmacenCode}
                            onValueChange={(val) => handleAlmacenChange(p.IdArticulo, val)}
                          >
                            <SelectTrigger
                              className={`w-full ${mismatch ? "border-destructive text-destructive" : ""}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue placeholder="Elegir almacén" />
                            </SelectTrigger>
                            <SelectContent onClick={(e) => e.stopPropagation()}>
                              {despachoInfo?.CodAlmacen && (
                                <SelectItem value={despachoInfo.CodAlmacen}>
                                  {despachoInfo.Almacen} ({despachoInfo.CodAlmacen})
                                </SelectItem>
                              )}
                              {itemOptions.map((a) => (
                                <SelectItem key={a.Codigo} value={a.Codigo}>
                                  {a.Descripcion} ({a.Codigo})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className={`text-sm border rounded px-3 py-2 ${mismatch ? "border-destructive text-destructive bg-destructive/10" : "text-gray-700 bg-muted/30"}`}>
                            {despachoInfo?.Almacen} ({despachoInfo?.CodAlmacen})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Errores por ítem */}
                    {(inval || mismatch) && (
                      <p className="text-sm text-destructive">
                        {inval ? (
                          <>Revisá “Retira” (número válido ≥ 0){r > 0 ? " y seleccioná un depósito válido." : ""}</>
                        ) : (
                          <>Este ítem debe usar el depósito <strong>{enforcedDepotDesc || enforcedDepot}</strong> porque ya hay otros con retiro en ese depósito.</>
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Banner de regla global */}
      {enforcedDepot && (
        <div className={`rounded-md border p-3 ${crossDepotError ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-emerald-500/30 bg-emerald-50 text-emerald-700"}`}>
          {crossDepotError ? (
            <>
              <strong>Atención:</strong> para generar el retiro, todos los ítems con cantidad &gt; 0 deben usar el <strong>mismo depósito</strong>. Depósito aplicado: <strong>{enforcedDepotDesc || enforcedDepot}</strong>. Revisá los que están marcados en rojo.
            </>
          ) : (
            <>Depósito de retiro seleccionado: <strong>{enforcedDepotDesc || enforcedDepot}</strong>.</>
          )}
        </div>
      )}

      {/* Botón enviar */}
      <div className="mt-6">
        <Button onClick={handleGenerate} className="w-full" disabled={disableSubmit}>
          Generar Retiro
        </Button>
        {disableSubmit && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            No puede haber valores inválidos o negativos, todos en 0, <strong>ni depósitos distintos</strong> entre ítems con retiro.
          </p>
        )}
      </div>
    </div>
  );
}
