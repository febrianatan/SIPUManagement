import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '', alt = 'Swiss-Belinn SKA Pekanbaru', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logoswissbell.png"
            alt={alt}
            className={`object-contain rounded-md select-none ${className}`}
            {...props}
        />
    );
}
