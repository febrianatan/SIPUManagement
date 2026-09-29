import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" className="fill-red-700 dark:fill-red-800" />
            <path
                d="M20 7L28 12.5V27.5L20 33L12 27.5V12.5L20 7Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
            />
            <path
                d="M16 16.5C16 14.5 17.5 13.5 20 13.5C22.5 13.5 24 14.5 24 16.5C24 19 16 18.5 16 22C16 24 17.5 25 20 25C22.8 25 24 23.8 24 23"
                stroke="#FDE047"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="20" cy="20" r="1.5" fill="white" />
        </svg>
    );
}
