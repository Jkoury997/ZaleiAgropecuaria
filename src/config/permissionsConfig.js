// config/permissionsConfig.js
import { Box } from 'lucide-react'; // Importar íconos

// Configuración de permisos
const permissionsConfig = {
  Stock: {
    icon: Box, // Añadir el ícono aquí para el grupo principal Stock

    // Subgrupo: Almacenes
    Almacenes: {
      main: '/dashboard/stock/warehouse', // Ruta principal para Almacenes
      View: '/almacenes/view', // Acción de ver almacenes
    },

    // Subgrupo: Cajones
    Cajones: {
      main: '/dashboard/stock/cajones/create', // Ruta principal para crear cajones
      Insert: '/cajones/insert', // Acción de insertar cajones
    },

    // Subgrupo: Pallets
    Pallets: {
      main: '/dashboard/stock/pallets/move', // Ruta principal para mover pallets
      Edit: '/pallets/edit', // Acción de editar pallets
      Insert: '/pallets/insert', // Acción de insertar pallets
      View: '/pallets/view', // Acción de ver pallets
    },
  },
};

export default permissionsConfig;
