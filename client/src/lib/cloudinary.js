const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryClientConfigured = () =>
    Boolean(
        cloudName &&
            uploadPreset &&
            cloudName !== 'your_cloud_name' &&
            uploadPreset !== 'your_upload_preset'
    );

/** Upload profile image directly to Cloudinary (unsigned preset — no API secret in browser). */
export async function uploadProfileImageToCloudinary(file) {
    if (!isCloudinaryClientConfigured()) {
        throw new Error(
            'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to client/.env'
        );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'tracker-profiles');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    return data.secure_url;
}

export default uploadProfileImageToCloudinary;
