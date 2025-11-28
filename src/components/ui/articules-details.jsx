import React from 'react';

export function ArticleDetails({ dataArticulo, Galpon, Cantidad }) {
  const articulo = dataArticulo?.Articulo;

  if (!articulo || !articulo.CodCabecera) return null;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Detalles del Artículo</h3>
      {articulo.DescDetalle && (
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium">Color: </span>{articulo.DescDetalle}
        </p>
      )}
      {articulo.DescMedida && (
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium">Medida: </span>{articulo.DescMedida}
        </p>
      )}
      {articulo.Descripcion && (
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium">Descripción: </span>{articulo.Descripcion}
        </p>
      )}
      {Galpon && (
        <p className="text-sm text-muted-foreground mb-1">
          <span className="font-medium">N° Galpón: </span>{Galpon}
        </p>
      )}
      {Cantidad && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Cantidad: </span>{Cantidad}
        </p>
      )}

    </div>
  );
}
