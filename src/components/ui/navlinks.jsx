// NavLinks.js
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import permissionsConfig from '@/config/permissionsConfig';

export function NavLinks({ onLinkClick }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const pathname = usePathname();

  // Hacer la consulta a la API cuando se monta el componente
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/userpermissions'); // Ajusta la URL a tu API
        if (!response.ok) {
          throw new Error('Error al obtener los permisos');
        }
        const data = await response.json();
        setPermissions(data.Menu);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!permissions || !Array.isArray(permissions)) return <div>No permissions available</div>;

  const toggleGroup = (name) => {
    setOpenGroups((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const renderLinks = (menu, permissions) => {
    return Object.keys(menu).map((groupMajor) => {
      const groupMajorItems = menu[groupMajor];
      const Icon = groupMajorItems.icon;

      return (
        <div key={groupMajor}>
          {/* Encabezado del grupo */}
          <div
            className={clsx(
              'flex items-center justify-between gap-3 rounded-lg px-3 py-2 cursor-pointer',
              'text-gray-700 hover:text-gray-900 transition-all'
            )}
            onClick={() => toggleGroup(groupMajor)}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-5 w-5" />} {/* Mostrar ícono si existe */}
              {groupMajor}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openGroups[groupMajor] ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Submenú de grupos */}
          {openGroups[groupMajor] && (
            <div className="pl-4">
              {Object.keys(groupMajorItems).map((group) => {
                const items = groupMajorItems[group];
                
                // Verificar si el usuario tiene permisos para este grupo
                const hasPermission = permissions.some(permission => 
                  permission.Text === group &&
                  permission.Permisos.some(permiso => permiso.Permiso)
                );

                if (!hasPermission) return null;

                return (
                  <div key={group}>
                    <Link
                      href={items.main}
                      onClick={onLinkClick} // Ejecutar acción al hacer clic
                      className={clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        {
                          'text-gray-500 hover:text-gray-900': pathname !== items.main,
                          'bg-gray-100 text-gray-900': pathname === items.main,
                        }
                      )}
                    >
                      {group}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {renderLinks(permissionsConfig, permissions)}
    </>
  );
}
