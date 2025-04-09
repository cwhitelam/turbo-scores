import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '../../utils/imageLoader';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    sizes?: string[];
    placeholder?: string | boolean;
    onLoad?: () => void;
    onError?: () => void;
    priority?: boolean;
}

/**
 * An optimized image component that improves loading performance
 * Includes responsive sizing, lazy loading, and placeholder support
 */
export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    sizes = ['100vw'],
    placeholder = false,
    onLoad,
    onError,
    priority = false,
    ...rest
}: OptimizedImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Generate optimized URLs
    const optimizedSrc = getOptimizedImageUrl(src, { width, height });
    const srcSet = generateSrcSet(src);
    const sizesAttr = generateSizes(sizes);

    useEffect(() => {
        // Reset states when src changes
        setLoaded(false);
        setError(false);
    }, [src]);

    // Handle loading and error states
    const handleLoad = () => {
        setLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        onError?.();
    };

    // Create placeholder styling
    const placeholderStyles = !loaded && placeholder
        ? 'bg-gray-200 animate-pulse'
        : '';

    return (
        <div
            className={`relative overflow-hidden ${loaded ? 'bg-transparent' : placeholderStyles} ${className}`}
            style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
        >
            <img
                src={optimizedSrc}
                srcSet={srcSet}
                sizes={sizesAttr}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={handleLoad}
                onError={handleError}
                {...rest}
            />

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    {alt || 'Image failed to load'}
                </div>
            )}
        </div>
    );
} 