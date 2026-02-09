'use client';

import React from 'react';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { Upload } from 'lucide-react';

type Props = {
    folder?: string;
    label?: string;
    className?: string;
    onUploaded: (url: string, info?: any) => void;
    disabled?: boolean;
};

const CloudinaryButton: React.FC<Props> = ({ folder = 'mis-al-falah/media', label = 'Upload', className = '', onUploaded, disabled }) => {
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    const canUpload = Boolean(preset) && !disabled;

    if (!canUpload) {
        return (
            <button
                type="button"
                disabled
                className={`inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-300 cursor-not-allowed ${className}`}
                title="Cloudinary preset belum diset"
            >
                <Upload size={14} /> {label}
            </button>
        );
    }

    return (
        <CldUploadWidget
            uploadPreset={preset}
            options={{ folder }}
            onSuccess={(result: CloudinaryUploadWidgetResults) => {
                const info = (result as any)?.info;
                const url = info?.secure_url || info?.url;
                if (url) onUploaded(url, info);
            }}
        >
            {({ open }) => (
                <button
                    type="button"
                    onClick={() => open()}
                    className={`inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-sm text-emerald-600 ${className}`}
                >
                    <Upload size={14} /> {label}
                </button>
            )}
        </CldUploadWidget>
    );
};

export default CloudinaryButton;
