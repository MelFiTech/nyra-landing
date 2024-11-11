import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export function Card({ 
  icon, 
  title, 
  description, 
  image, 
  className = '', 
  ...props 
}: CardProps) {
  return (
    <div 
      className={`bg-white rounded-[32px] p-4 flex flex-col h-full w-[400px] ${className}`}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4">
          <img src={icon} alt="" className="w-8 h-8" />
        </div>
      )}

      {/* Title */}
      <h3 className="font-clash text-2xl font-medium mb-4">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-base leading-relaxed mb-4">
          {description}
        </p>
      )}

      {/* Image */}
      {image && (
        <div className="mt-auto">
          <img 
            src={image} 
            alt="" 
            className="w-full h-auto object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}