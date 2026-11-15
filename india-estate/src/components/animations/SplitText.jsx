import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SplitText = ({
    text,
    className = '',
    delay = 50,
    duration = 1.25,
    ease = 'power3.out',
    splitType = 'chars',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = '-100px',
    textAlign = 'center',
    tag = 'p',
    onLetterAnimationComplete
}) => {
    const ref = useRef(null);
    const animationCompletedRef = useRef(false);
    const onCompleteRef = useRef(onLetterAnimationComplete);

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onLetterAnimationComplete;
    }, [onLetterAnimationComplete]);

    useGSAP(
        () => {
            if (!ref.current || !text) return;
            // Prevent re-animation if already completed
            if (animationCompletedRef.current) return;
            const el = ref.current;

            const startPct = (1 - threshold) * 100;
            const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
            const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
            const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
            const sign =
                marginValue === 0
                    ? ''
                    : marginValue < 0
                        ? `-=${Math.abs(marginValue)}${marginUnit}`
                        : `+=${marginValue}${marginUnit}`;
            const start = `top ${startPct}%${sign}`;

            // Simpler implementation without GSAPSplitText plugin (paid)
            // We'll manually split standard React children if needed, or just assume text prop
            // For free version, we can iterate children if we pre-split them in render.

            const elements = Array.from(el.querySelectorAll('.split-char, .split-word, .split-line'));

            if (elements.length > 0) {
                gsap.fromTo(
                    elements,
                    { ...from },
                    {
                        ...to,
                        duration,
                        ease,
                        stagger: delay / 1000,
                        scrollTrigger: {
                            trigger: el,
                            start,
                            once: true,
                            fastScrollEnd: true,
                            anticipatePin: 0.4
                        },
                        onComplete: () => {
                            animationCompletedRef.current = true;
                            onCompleteRef.current?.();
                        },
                        willChange: 'transform, opacity',
                        force3D: true
                    }
                );
            }
        },
        {
            dependencies: [
                text,
                delay,
                duration,
                ease,
                splitType,
                JSON.stringify(from),
                JSON.stringify(to),
                threshold,
                rootMargin,
            ],
            scope: ref
        }
    );

    const renderContent = () => {
        if (splitType === 'chars') {
            return text.split('').map((char, i) => (
                <span key={i} className="split-char" style={{ display: 'inline-block', whiteSpace: 'pre' }}>{char}</span>
            ));
        }
        if (splitType === 'words') {
            return text.split(' ').map((word, i) => (
                <span key={i} className="split-word" style={{ display: 'inline-block', whiteSpace: 'pre' }}>{word + (i < text.split(' ').length - 1 ? ' ' : '')}</span>
            ));
        }
        return text;
    };

    const renderTag = () => {
        const style = {
            textAlign,
            overflow: 'hidden',
            display: 'inline-block',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            willChange: 'transform, opacity'
        };
        const classes = `split-parent ${className}`;
        const Tag = tag || 'p';

        return (
            <Tag ref={ref} style={style} className={classes}>
                {renderContent()}
            </Tag>
        );
    };
    return renderTag();
};

export default SplitText;
