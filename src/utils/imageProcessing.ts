/**
 * Premium Image Processing Utilities
 * Handles compression, resizing, format conversion, and validation
 */

export interface ImageValidation {
    isValid: boolean;
    error?: string;
}

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ProcessImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    convertToWebP?: boolean;
    onProgress?: (progress: number) => void;
}

// File type validation
export function validateImageType(file: File): ImageValidation {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Only JPEG, PNG, GIF, and WebP images are supported',
        };
    }
    return { isValid: true };
}

// File size validation
export function validateImageSize(file: File, maxSizeMB: number = 10): ImageValidation {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return {
            isValid: false,
            error: `Image must be smaller than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
    }
    return { isValid: true };
}

// Get image dimensions
export function getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.width,
                height: img.height,
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

// Validate image dimensions
export async function validateImageDimensions(
    file: File,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
): Promise<ImageValidation> {
    try {
        const dimensions = await getImageDimensions(file);

        if (minWidth && dimensions.width < minWidth) {
            return {
                isValid: false,
                error: `Image width must be at least ${minWidth}px. Current: ${dimensions.width}px`,
            };
        }

        if (minHeight && dimensions.height < minHeight) {
            return {
                isValid: false,
                error: `Image height must be at least ${minHeight}px. Current: ${dimensions.height}px`,
            };
        }

        if (maxWidth && dimensions.width > maxWidth) {
            return {
                isValid: false,
                error: `Image width must be at most ${maxWidth}px. Current: ${dimensions.width}px`,
            };
        }

        if (maxHeight && dimensions.height > maxHeight) {
            return {
                isValid: false,
                error: `Image height must be at most ${maxHeight}px. Current: ${dimensions.height}px`,
            };
        }

        return { isValid: true };
    } catch {
        return {
            isValid: false,
            error: 'Failed to read image dimensions',
        };
    }
}

// Compress and resize image
export async function processImage(file: File, options: ProcessImageOptions = {}): Promise<Blob> {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85,
        convertToWebP = true,
        onProgress,
    } = options;

    return new Promise((resolve, reject) => {
        onProgress?.(10);

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            onProgress?.(30);

            try {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;

                    if (width > height) {
                        width = Math.min(width, maxWidth);
                        height = width / aspectRatio;
                    } else {
                        height = Math.min(height, maxHeight);
                        width = height * aspectRatio;
                    }
                }

                onProgress?.(50);

                // Create canvas and draw image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Use better image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                onProgress?.(70);

                // Convert to blob
                const mimeType = convertToWebP ? 'image/webp' : file.type;
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            onProgress?.(100);
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create image blob'));
                        }
                    },
                    mimeType,
                    quality
                );
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error('Unknown error processing image')
                );
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

// Convert blob to File
export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
