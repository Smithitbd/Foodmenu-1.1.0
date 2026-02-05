// components/SkeletonImage.jsx
import { useState } from 'react';

const SkeletonImage = ({ src, alt, className = "", rounded = "rounded-2xl", link = "#" }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <a href={link} className="block group">
      <div className={`relative overflow-hidden bg-gray-200 ${rounded} ${className}`}>
        {/* Shimmer Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse">
            <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>
        )}

        {/* Real Image */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${rounded}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </a>
  );
};

export default SkeletonImage;