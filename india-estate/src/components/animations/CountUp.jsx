import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function CountUp({
    to,
    from = 0,
    direction = "up",
    delay = 0,
    duration = 2,
    className = "",
    startWhen = true,
    separator = "",
    onStart,
    onEnd,
}) {
    const [count, setCount] = useState(from);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
    const startedRef = useRef(false);

    useEffect(() => {
        if (isInView && startWhen && !startedRef.current) {
            startedRef.current = true;
            onStart?.();

            let startTime;
            let animationFrame;

            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

                const currentCount = Math.floor(from + (to - from) * progress);
                setCount(currentCount);

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate);
                } else {
                    setCount(to);
                    onEnd?.();
                }
            };

            setTimeout(() => {
                animationFrame = requestAnimationFrame(animate);
            }, delay * 1000);

            return () => cancelAnimationFrame(animationFrame);
        }
    }, [isInView, startWhen, from, to, delay, duration, onStart, onEnd]);

    return (
        <span ref={ref} className={className}>
            {count.toLocaleString()}{separator}
        </span>
    );
}
