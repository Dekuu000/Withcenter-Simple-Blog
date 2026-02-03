import { useState, useRef, useCallback } from 'react';
import { Image, X, Upload } from 'lucide-react';

interface ImageUploadProps {
    value?: string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    disabled?: boolean;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled = false,
    className = ''
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((file: File | null) => {
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be smaller than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onChange(file);
        }
    }, [onChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        onChange(null);
        onRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange, onRemove]);

    const handleClick = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    // Update preview when external value changes
    if (value !== undefined && value !== preview && !preview?.startsWith('data:')) {
        setPreview(value);
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-semibold text-gray-900">
                Cover Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-40 sm:h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Remove image"
                            aria-label="Remove image"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all
                        ${isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className={`p-2 sm:p-3 rounded-full ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                            {isDragging ? (
                                <Upload className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600" />
                            ) : (
                                <Image className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                                {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, GIF or WebP (max 5MB)
                            </p>
                        </div>
                    </div>
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
