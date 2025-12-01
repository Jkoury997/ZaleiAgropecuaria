import React from "react";
import { useRouter } from "next/navigation";

function IconButton({ name, icon: Icon, url, onClick }) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (url) {
      router.push(url);
    }
  };

  return (
    <div className="flex flex-col items-center" onClick={handleClick}>
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white p-2 transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer">
        <Icon className="h-6 w-6" />
      </div>
      <span className="mt-2 text-sm text-muted-foreground">{name}</span>
    </div>
  );
}

export default function IconGrid({ items }) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
      {items.map((item, index) => (
        <IconButton
          key={index}
          name={item.name}
          icon={item.icon}
          url={item.url}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}