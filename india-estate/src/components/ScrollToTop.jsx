import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Force scroll to top on route change
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        // Prevent browser from restoring scroll position on refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Force scroll to top on initial load
        window.scrollTo(0, 0);

        return () => {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        };
    }, []);

    return null;
};

export default ScrollToTop;
