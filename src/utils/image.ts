/**
 * RAVO OS — Image Utils
 * Utilitários para otimização de imagens
 */

/**
 * Gerar srcset responsivo
 */
export function generateSrcSet(
  imagePath: string,
  sizes: number[] = [320, 640, 960, 1280]
): string {
  return sizes
    .map((size) => {
      const [name, ext] = imagePath.split('.');
      return `${name}-${size}w.${ext} ${size}w`;
    })
    .join(', ');
}

/**
 * Gerar sizes attribute para imagens responsivas
 */
export function generateSizes(
  breakpoints: { maxWidth: number; size: string }[] = [
    { maxWidth: 640, size: '100vw' },
    { maxWidth: 960, size: '90vw' },
    { maxWidth: 1280, size: '85vw' },
  ]
): string {
  return breakpoints
    .map(({ maxWidth, size }) => `(max-width: ${maxWidth}px) ${size}`)
    .concat('100vw')
    .join(', ');
}

/**
 * Componente Image com lazy loading
 */
export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blur?: boolean;
  loading?: 'lazy' | 'eager';
}

/**
 * Calcular aspect ratio
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Otimizar URL de imagem para CDN
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const params = new URLSearchParams();

  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);

  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
}

/**
 * Placeholder blur data URI
 */
export function generateBlurDataUri(width: number = 10, height: number = 10): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) return '';

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

/**
 * Preload images
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  );
}

/**
 * Check browser support para WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => resolve(webP.height === 2);
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoBIAEADsAcJZACdMEOAAD++v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+';
  });
}

/**
 * Get best image format
 */
export async function getBestImageFormat(): Promise<'webp' | 'jpg'> {
  const supportsWebp = await supportsWebP();
  return supportsWebp ? 'webp' : 'jpg';
}
