import React from 'react';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';

// Alert component
export const Alert = ({ type, title, message }) => {
  let bgColor, IconComponent, textColor, iconColor;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-50';
      textColor = 'text-green-800';
      iconColor = 'text-green-400';
      IconComponent = CircleCheckIcon;
      break;
    case 'error':
      bgColor = 'bg-red-50';
      textColor = 'text-red-800';
      iconColor = 'text-red-400';
      IconComponent = TriangleAlertIcon;
      break;
    case 'warning':
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-800';
      iconColor = 'text-yellow-400';
      IconComponent = InfoIcon;
      break;
    default:
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-800';
      iconColor = 'text-blue-400';
      IconComponent = InfoIcon;
  }

  return (
    <div className={`rounded-md p-4 ${bgColor}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          <div className={`mt-2 text-sm ${textColor}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
