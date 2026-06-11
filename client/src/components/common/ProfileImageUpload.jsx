import { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import userApi from '@/features/user/userApi';
import { uploadProfileImageToCloudinary } from '@/lib/cloudinary';
import { getApiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ProfileImageUpload({ userId, value, onChange, onUploaded }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5 MB');
            return;
        }

        if (!userId) {
            toast.error('User not loaded. Please refresh and try again.');
            return;
        }

        setUploading(true);
        try {
            // Prefer server upload (signed API — no upload preset required)
            try {
                const { data } = await userApi.uploadProfileImage(file);
                onChange(data.data.profileImage);
                onUploaded?.();
                toast.success('Profile photo uploaded');
                return;
            } catch (serverError) {
                const status = serverError?.response?.status;
                // Fall back to client unsigned upload only if server Cloudinary is not configured
                if (status !== 503) throw serverError;
            }

            const url = await uploadProfileImageToCloudinary(file);
            await userApi.updateUser(userId, { profileImage: url });
            onChange(url);
            onUploaded?.();
            toast.success('Profile photo uploaded');
        } catch (error) {
            toast.error(error.message || getApiErrorMessage(error, 'Failed to upload image'));
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <Label>Profile Photo</Label>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div
                    className={cn(
                        'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted',
                        uploading && 'opacity-70'
                    )}
                >
                    {value ? (
                        <img src={value} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                    )}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Camera className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG or WebP. Max 5 MB. Stored on Cloudinary.
                    </p>
                </div>
            </div>
        </div>
    );
}
