/**
 * Image loading and optimization utilities
 * Reduces bundle size by efficient image loading and size management
 */

// Image cache to avoid reloading
const IMAGE_CACHE = new Map<string, string>();

// Default image size and quality settings
const DEFAULT_SETTINGS = {
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    quality: 80,
    format: 'webp' as 'webp' | 'jpeg' | 'png' | 'avif',
};

interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

/**
 * Generate an optimized image URL using remote image optimization services
 * This function can be adjusted to work with various services like Cloudinary, Imgix, etc.
 */
export function getOptimizedImageUrl(
    src: string,
    options: ImageOptions = {}
): string {
    // Skip optimization for data URIs, SVGs, and already optimized URLs
    if (
        src.startsWith('data:') ||
        src.endsWith('.svg') ||
        src.includes('imagedelivery.net') ||
        src.includes('optimized=true')
    ) {
        return src;
    }

    // Check cache first
    const cacheKey = `${src}-${JSON.stringify(options)}`;
    if (IMAGE_CACHE.has(cacheKey)) {
        return IMAGE_CACHE.get(cacheKey) as string;
    }

    const settings = { ...DEFAULT_SETTINGS, ...options };

    // For team logos, use ESPN's domain directly
    if (src.includes('espncdn.com/i/teamlogos')) {
        // ESPN CDN is already optimized, just return it
        IMAGE_CACHE.set(cacheKey, src);
        return src;
    }

    try {
        // Create URL parameters for the image
        const params = new URLSearchParams();

        if (settings.width) params.append('w', settings.width.toString());
        if (settings.height) params.append('h', settings.height.toString());
        if (settings.quality) params.append('q', settings.quality.toString());
        if (settings.format) params.append('fm', settings.format);

        params.append('optimized', 'true');

        // For external images, add a proxy service (optional)
        // This is an example using Cloudinary, but you can use any image optimization service
        const optimizedUrl = src;

        // When in production, could use an image optimization proxy
        if (import.meta.env.PROD) {
            // Commented out as an example - would need to replace with your actual service
            // optimizedUrl = `https://res.cloudinary.com/your-cloud-name/image/fetch/${params.toString()}/${encodeURIComponent(src)}`;
        }

        // Cache the result
        IMAGE_CACHE.set(cacheKey, optimizedUrl);
        return optimizedUrl;
    } catch (error) {
        console.error('Image optimization error:', error);
        return src;
    }
}

/**
 * Generate responsive srcSet for an image
 */
export function generateSrcSet(
    src: string,
    widths: number[] = [320, 640, 960, 1280, 1600],
    format: 'webp' | 'jpeg' | 'png' | 'avif' = 'webp'
): string {
    return widths
        .map(width => {
            const url = getOptimizedImageUrl(src, { width, format });
            return `${url} ${width}w`;
        })
        .join(', ');
}

/**
 * Generate appropriate sizes attribute for responsive images
 */
export function generateSizes(sizes: string[] = ['100vw']): string {
    return sizes.join(', ');
}

/**
 * Preload important images to improve perceived performance
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = priority;

    document.head.appendChild(link);
} 