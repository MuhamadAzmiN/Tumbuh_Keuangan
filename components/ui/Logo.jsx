import React from 'react';

export function TumbuhLogo({ className = "w-8 h-8" }) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
      <img
        src="/logo.png"
        alt="Pencatatan Azmi Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
