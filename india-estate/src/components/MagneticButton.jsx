import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * MagneticButton - A button that follows the cursor with a magnetic effect
 * Perfect for CTAs and important interactive elements
 */
const MagneticButton = ({
    children,
    className = '',
    onClick,
    strength = 0.3,
    ...props
}) => {
    const buttonRef = useRef(null);
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            positionRef.current = { x: deltaX, y: deltaY };

            button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };

        const handleMouseLeave = () => {
            button.style.transform = 'translate(0px, 0px)';
            positionRef.current = { x: 0, y: 0 };
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return (
        <motion.button
            ref={buttonRef}
            className={`relative transition-transform duration-200 ease-out ${className}`}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default MagneticButton;
