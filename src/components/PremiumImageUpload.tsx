import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Image,
    X,
    Upload,
    Loader2,
    Check,
    AlertCircle,
    RefreshCw,
    Crop,
    ZoomIn,
    ZoomOut,
    Move,
    Eye,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import {
    validateImageType,
    validateImageSize,
    validateImageDimensions,
    processImage,
    blobToFile,
    formatFileSize,
} from '../utils/imageProcessing';

interface PremiumImageUploadProps {
    value?: string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    disabled?: boolean;
    className?: string;
    maxSizeMB?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    enableCompression?: boolean;
    convertToWebP?: boolean;
}

type UploadStage = 'idle' | 'validating' | 'cropping' | 'processing' | 'complete' | 'error';

interface CropBox {
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
}

export default function PremiumImageUpload({
    value,
    onChange,
    onRemove,
    disabled = false,
    className = '',
    maxSizeMB = 10,
    minWidth = 800,
    minHeight = 400,
    maxWidth = 1920,
    maxHeight = 1080,
    enableCompression = true,
    convertToWebP = true,
}: PremiumImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [processedSize, setProcessedSize] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Cropping state - resizable crop box
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 60 });
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null); // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortController = useRef<AbortController | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cropBoxRef = useRef<HTMLDivElement>(null);
    const tempFileRef = useRef<File | null>(null);

    useEffect(() => {
        if (value !== undefined && value !== preview && !preview?.startsWith('data:')) {
            setPreview(value);
        }
    }, [value, preview]);

    // Update live preview when crop box or image changes
    useEffect(() => {
        if (uploadStage === 'cropping' && tempImage && imageRef.current && containerRef.current) {
            const updatePreview = async () => {
                try {
                    const blob = await getCroppedImage();
                    const url = URL.createObjectURL(blob);
                    setCroppedPreview(url);
                } catch {
                    // Ignore errors during preview
                }
            };

            const debounce = setTimeout(updatePreview, 100);
            return () => clearTimeout(debounce);
        }
    }, [imagePosition, zoom, cropBox, uploadStage]);

    const resetState = useCallback(() => {
        setUploadStage('idle');
        setUploadProgress(0);
        setError(null);
        setOriginalSize(0);
        setProcessedSize(0);
        setIsProcessing(false);
        setTempImage(null);
        setZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setCropBox({ x: 10, y: 10, width: 80, height: 60 });
        setCroppedPreview(null);
    }, []);

    const handleFileSelect = useCallback(
        async (file: File | null) => {
            if (!file) return;

            resetState();
            setUploadStage('validating');
            setError(null);

            abortController.current = new AbortController();

            try {
                setUploadProgress(10);

                const typeValidation = validateImageType(file);
                if (!typeValidation.isValid) {
                    throw new Error(typeValidation.error);
                }

                setUploadProgress(20);

                const sizeValidation = validateImageSize(file, maxSizeMB);
                if (!sizeValidation.isValid) {
                    throw new Error(sizeValidation.error);
                }

                setUploadProgress(30);

                if (minWidth || minHeight || maxWidth || maxHeight) {
                    const dimensionValidation = await validateImageDimensions(
                        file,
                        minWidth,
                        minHeight,
                        maxWidth,
                        maxHeight
                    );
                    if (!dimensionValidation.isValid) {
                        throw new Error(dimensionValidation.error);
                    }
                }

                setOriginalSize(file.size);
                setUploadProgress(50);

                // Show cropping interface
                const reader = new FileReader();
                reader.onloadend = () => {
                    setTempImage(reader.result as string);
                    tempFileRef.current = file;
                    setImagePosition({ x: 0, y: 0 });
                    setZoom(1);
                    setCropBox({ x: 10, y: 10, width: 80, height: 60 });
                    setUploadStage('cropping');
                    setUploadProgress(0);
                };
                reader.readAsDataURL(file);
            } catch (err: unknown) {
                if (abortController.current?.signal.aborted) {
                    return;
                }

                const error = err as Error;
                setError(error.message || 'Failed to process image');
                setUploadStage('error');
                setUploadProgress(0);
                setIsProcessing(false);
            }
        },
        [maxSizeMB, minWidth, minHeight, maxWidth, maxHeight, resetState]
    );

    const getCroppedImage = useCallback(async (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!containerRef.current || !imageRef.current || !tempImage) {
                reject(new Error('No image to crop'));
                return;
            }

            const container = containerRef.current;
            const img = imageRef.current;
            const containerRect = container.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();

            // Convert crop box percentages to pixels
            const cropX = (cropBox.x / 100) * containerRect.width;
            const cropY = (cropBox.y / 100) * containerRect.height;
            const cropWidth = (cropBox.width / 100) * containerRect.width;
            const cropHeight = (cropBox.height / 100) * containerRect.height;

            // Calculate source coordinates
            const scale = img.naturalWidth / imgRect.width;

            const sourceX = Math.max(0, (cropX + containerRect.left - imgRect.left) * scale);
            const sourceY = Math.max(0, (cropY + containerRect.top - imgRect.top) * scale);
            const sourceWidth = Math.min(img.naturalWidth - sourceX, cropWidth * scale);
            const sourceHeight = Math.min(img.naturalHeight - sourceY, cropHeight * scale);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            // Draw cropped image
            const destX = Math.max(0, imgRect.left - (cropX + containerRect.left));
            const destY = Math.max(0, imgRect.top - (cropY + containerRect.top));
            const destWidth = sourceWidth / scale;
            const destHeight = sourceHeight / scale;

            ctx.drawImage(
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                destX,
                destY,
                destWidth,
                destHeight
            );

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create cropped image'));
                    }
                },
                'image/png',
                1
            );
        });
    }, [tempImage, cropBox]);

    const handleCropConfirm = useCallback(async () => {
        if (!tempFileRef.current) return;

        setUploadStage('processing');
        setIsProcessing(true);
        setUploadProgress(10);

        try {
            const croppedBlob = await getCroppedImage();
            setUploadProgress(40);

            if (enableCompression) {
                const croppedFile = blobToFile(croppedBlob, 'cropped.png');

                const processedBlob = await processImage(croppedFile, {
                    maxWidth,
                    maxHeight,
                    quality: 0.85,
                    convertToWebP,
                    onProgress: (progress) => {
                        const mappedProgress = 40 + (progress / 100) * 50;
                        setUploadProgress(mappedProgress);
                    },
                });

                if (abortController.current?.signal.aborted) {
                    return;
                }

                setProcessedSize(processedBlob.size);

                const originalExtension = tempFileRef.current.name.split('.').pop() || '';
                const newExtension = convertToWebP ? 'webp' : originalExtension;
                const newFileName = tempFileRef.current.name.replace(
                    /\.[^/.]+$/,
                    `.${newExtension}`
                );
                const processedFile = blobToFile(processedBlob, newFileName);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                    setUploadProgress(100);
                    setUploadStage('complete');
                    setIsProcessing(false);
                    setTempImage(null);
                    setCroppedPreview(null);
                };
                reader.readAsDataURL(processedFile);

                onChange(processedFile);
            } else {
                const croppedFile = blobToFile(croppedBlob, 'cropped.png');
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                    setUploadProgress(100);
                    setUploadStage('complete');
                    setIsProcessing(false);
                    setTempImage(null);
                    setCroppedPreview(null);
                };
                reader.readAsDataURL(croppedFile);
                onChange(croppedFile);
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Failed to crop image');
            setUploadStage('error');
            setIsProcessing(false);
            setTempImage(null);
            setCroppedPreview(null);
        }
    }, [getCroppedImage, enableCompression, convertToWebP, maxWidth, maxHeight, onChange]);

    const handleCropCancel = useCallback(() => {
        setTempImage(null);
        tempFileRef.current = null;
        setUploadStage('idle');
        setZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setCropBox({ x: 10, y: 10, width: 80, height: 60 });
        setCroppedPreview(null);
    }, []);

    // Image dragging
    const handleImageMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingImage(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (isDraggingImage) {
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;

                setImagePosition((prev) => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY,
                }));

                setDragStart({ x: e.clientX, y: e.clientY });
            } else if (isResizing && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100;
                const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100;

                setCropBox((prev) => {
                    const newBox = { ...prev };

                    if (isResizing.includes('n')) {
                        newBox.y = Math.max(0, Math.min(prev.y + prev.height - 5, prev.y + deltaY));
                        newBox.height = prev.height - (newBox.y - prev.y);
                    }
                    if (isResizing.includes('s')) {
                        newBox.height = Math.max(5, Math.min(100 - prev.y, prev.height + deltaY));
                    }
                    if (isResizing.includes('w')) {
                        newBox.x = Math.max(0, Math.min(prev.x + prev.width - 5, prev.x + deltaX));
                        newBox.width = prev.width - (newBox.x - prev.x);
                    }
                    if (isResizing.includes('e')) {
                        newBox.width = Math.max(5, Math.min(100 - prev.x, prev.width + deltaX));
                    }

                    return newBox;
                });

                setDragStart({ x: e.clientX, y: e.clientY });
            }
        },
        [isDraggingImage, isResizing, dragStart]
    );

    const handleMouseUp = useCallback(() => {
        setIsDraggingImage(false);
        setIsResizing(null);
    }, []);

    // Resize handle mouse down
    const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(direction);
        setDragStart({ x: e.clientX, y: e.clientY });
    }, []);

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
                setIsDragging(true);
            }
        },
        [disabled]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (disabled) return;

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [disabled, handleFileSelect]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect]
    );

    const handleRemove = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
        }

        setPreview(null);
        onChange(null);
        onRemove?.();
        resetState();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange, onRemove, resetState]);

    const handleReplace = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    const handleClick = useCallback(() => {
        if (!disabled && !preview) {
            fileInputRef.current?.click();
        }
    }, [disabled, preview]);

    const handleRetry = useCallback(() => {
        setError(null);
        setUploadStage('idle');
        fileInputRef.current?.click();
    }, []);

    // Cropping Modal with Resizable Crop Box
    if (uploadStage === 'cropping' && tempImage) {
        return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4">
                <div
                    className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
                    style={{ maxHeight: '95vh' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col h-full max-h-[95vh]">
                        {/* Header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Crop className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Crop Cover Photo
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Drag corners to resize • Drag image to reposition
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCropCancel}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Main Content - Split View */}
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 overflow-auto">
                            {/* Left: Crop Area */}
                            <div className="lg:col-span-2">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Crop Area
                                    </h4>
                                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {Math.round(cropBox.width)}% × {Math.round(cropBox.height)}%
                                    </div>
                                </div>
                                <div
                                    ref={containerRef}
                                    className="relative bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200"
                                    style={{ aspectRatio: '16/10' }}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    {/* Draggable Image */}
                                    <img
                                        ref={imageRef}
                                        src={tempImage}
                                        alt="Crop preview"
                                        className="absolute cursor-move select-none max-w-none"
                                        style={{
                                            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom})`,
                                            transformOrigin: 'center',
                                        }}
                                        onMouseDown={handleImageMouseDown}
                                        draggable={false}
                                    />

                                    {/* Resizable Crop Box */}
                                    <div
                                        ref={cropBoxRef}
                                        className="absolute border-4 border-brand-primary bg-transparent pointer-events-none"
                                        style={{
                                            left: `${cropBox.x}%`,
                                            top: `${cropBox.y}%`,
                                            width: `${cropBox.width}%`,
                                            height: `${cropBox.height}%`,
                                        }}
                                    >
                                        {/* Grid overlay */}
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                            {[...Array(9)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="border border-brand-primary/20"
                                                />
                                            ))}
                                        </div>

                                        {/* Resize Handles - Corners */}
                                        <div
                                            className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-brand-primary rounded-full cursor-nwse-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'nw')}
                                        />
                                        <div
                                            className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-brand-primary rounded-full cursor-nesw-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'ne')}
                                        />
                                        <div
                                            className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-brand-primary rounded-full cursor-nesw-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'sw')}
                                        />
                                        <div
                                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-brand-primary rounded-full cursor-nwse-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'se')}
                                        />

                                        {/* Resize Handles - Edges */}
                                        <div
                                            className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-white border-2 border-brand-primary rounded-full cursor-ns-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'n')}
                                        />
                                        <div
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-white border-2 border-brand-primary rounded-full cursor-ns-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 's')}
                                        />
                                        <div
                                            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-white border-2 border-brand-primary rounded-full cursor-ew-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'w')}
                                        />
                                        <div
                                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-white border-2 border-brand-primary rounded-full cursor-ew-resize pointer-events-auto"
                                            onMouseDown={(e) => handleResizeStart(e, 'e')}
                                        />
                                    </div>

                                    {/* Hint */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
                                        <Move className="w-3.5 h-3.5" />
                                        Drag corners to resize • Drag image to move
                                    </div>
                                </div>
                            </div>

                            {/* Right: Live Preview */}
                            <div className="lg:col-span-1">
                                <div className="mb-3 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-brand-primary" />
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Blog Preview
                                    </h4>
                                </div>
                                <div className="space-y-4">
                                    {/* Card Preview */}
                                    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                        <div className="h-40 overflow-hidden bg-gray-100">
                                            {croppedPreview ? (
                                                <img
                                                    src={croppedPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-2">
                                                Your Blog Title
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                This is how your cover photo will appear on blog
                                                cards...
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            <strong>💡 Tip:</strong> Resize the crop box by dragging
                                            the corners or edges. Drag the image itself to adjust
                                            positioning.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
                            {/* Zoom Controls */}
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                                    className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-300"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <div className="flex-1 max-w-sm flex items-center gap-3">
                                    <span className="text-xs text-gray-600 font-medium">Zoom:</span>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.1"
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-700 font-bold min-w-[3rem] text-right">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                    className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-300"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    className="px-6 py-2.5 text-gray-700 hover:bg-white rounded-lg font-semibold transition-colors border border-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropConfirm}
                                    disabled={isProcessing}
                                    className="px-8 py-2.5 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Apply & Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-900">
                    Cover Image <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {preview && uploadStage === 'complete' && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Ready</span>
                    </div>
                )}
            </div>

            {preview ? (
                <div className="space-y-3">
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 sm:h-64 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                        />
                        {!disabled && (
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={handleReplace}
                                    className="p-2.5 bg-white/95 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white shadow-lg border border-gray-200 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Replace image"
                                    aria-label="Replace image"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Remove image"
                                    aria-label="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {enableCompression && processedSize > 0 && originalSize > 0 && (
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <span>
                                Original:{' '}
                                <span className="font-medium">{formatFileSize(originalSize)}</span>
                            </span>
                            <span className="text-green-600 font-medium">
                                Optimized: {formatFileSize(processedSize)} (
                                {Math.round((1 - processedSize / originalSize) * 100)}% smaller)
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                            ${
                                isDragging
                                    ? 'border-brand-primary bg-brand-bg shadow-lg scale-[1.02]'
                                    : error
                                      ? 'border-red-300 bg-red-50/50'
                                      : 'border-gray-300 hover:border-brand-primary hover:bg-gray-50'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            ${isProcessing ? 'pointer-events-none' : ''}
                        `}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className={`p-4 rounded-full ${
                                    isDragging
                                        ? 'bg-brand-primary/10'
                                        : error
                                          ? 'bg-red-100'
                                          : 'bg-gray-100'
                                }`}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                                ) : isDragging ? (
                                    <Upload className="w-8 h-8 text-brand-primary" />
                                ) : error ? (
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                ) : (
                                    <Image className="w-8 h-8 text-gray-400" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">
                                    {isProcessing
                                        ? uploadStage === 'validating'
                                            ? 'Validating image...'
                                            : 'Optimizing image...'
                                        : isDragging
                                          ? 'Drop your image here'
                                          : error
                                            ? 'Upload failed'
                                            : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF or WebP (max {maxSizeMB}MB)
                                </p>
                                <p className="text-xs text-brand-primary font-medium">
                                    {convertToWebP &&
                                        'Auto-converts to WebP for better performance'}
                                </p>
                            </div>

                            {isProcessing && uploadProgress > 0 && (
                                <div className="w-full max-w-xs">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-primary transition-all duration-300 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {Math.round(uploadProgress)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-red-700">{error}</p>
                                <button
                                    type="button"
                                    onClick={handleRetry}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium mt-1 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleInputChange}
                disabled={disabled}
                className="hidden"
            />
        </div>
    );
}
