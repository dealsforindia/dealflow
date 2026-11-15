import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes intelligently
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
