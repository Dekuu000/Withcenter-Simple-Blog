import { useState, useRef } from 'react';
import { Camera, X, Send, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface CommentFormProps {
    onSubmit: (content: string, imageFile: File | null) => Promise<void>;
    disabled?: boolean;
    user: User;
}

export default function CommentForm({ onSubmit, disabled = false, user }: CommentFormProps) {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && !imageFile) || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, imageFile);
            setContent('');
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-2 sm:gap-3 animate-fade-in">
            {/* User Avatar */}
            <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs sm:text-sm bg-gray-100">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            {/* Input Container */}
            <div className="flex-grow">
                <div className={`relative bg-gray-100 rounded-3xl overflow-hidden transition-all ${isSubmitting ? 'opacity-70' : ''}`}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`Comment as ${userName}`}
                        rows={1}
                        disabled={disabled || isSubmitting}
                        className="w-full text-sm sm:text-[15px] bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-500 text-gray-900 py-2.5 sm:py-3 px-3 sm:px-4 min-h-[44px] resize-none overflow-hidden"
                        style={{ height: 'auto', minHeight: '44px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />

                    {/* Image Preview inside the bubble */}
                    {imagePreview && (
                        <div className="relative mx-3 sm:mx-4 mb-3 sm:mb-4 mt-2">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-48 sm:max-h-60 object-cover rounded-xl border border-black/5"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-gray-900/50 text-white rounded-full hover:bg-gray-900/70 transition-colors backdrop-blur-sm min-w-[32px] min-h-[32px] flex items-center justify-center"
                                aria-label="Remove image"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Validations / Tooltip could go here */}

                {/* Actions below or integrated? Facebook has them right inside or right below */}
                {/* For this specific look often seen: Text input is one pill. Tools are separate icons or inside. */}
                {/* Based on the screenshot provided: Icons [Smile, Camera, GIF, Sticker] are BELOW the text text or at the end of the line. */}
                {/* But the screenshot shows them visibly in the bar. Let's put them in the bar if space allows or strict Facebook web style is icons on right of text within the Pill. */}
                {/* To ensure reliability, let's put them in a row directly attached to the input pill or inside it. */}

                <div className="flex items-center justify-between px-2 mt-2">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 rounded-full transition-colors min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center ${imageFile ? 'text-brand-primary bg-brand-bg' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="Attach a photo"
                            aria-label="Attach a photo"
                        >
                            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    <div className="text-xs text-gray-400">
                        {/* Status valid/count etc */}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e)}
                            disabled={(!content.trim() && !imageFile) || disabled || isSubmitting}
                            className={`p-2 rounded-full transition-all min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center ${(!content.trim() && !imageFile) || disabled || isSubmitting
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-brand-primary hover:bg-brand-bg cursor-pointer'
                                }`}
                            aria-label="Send comment"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
            />
        </form>
    );
}
