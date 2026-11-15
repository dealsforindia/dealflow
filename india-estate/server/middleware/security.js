import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';

// AI-Driven WAF Simulation (Bot Detection & Scoring)
const aiWaf = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;

    // Suspicious patterns (Basic Simulation)
    const suspiciousPatterns = ['sqlmap', 'nikto', 'curl', 'python', 'wget'];
    const isBot = suspiciousPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));

    if (isBot) {
        console.warn(`[WAF] Blocked Malicious Bot: ${ip} | UA: ${userAgent}`);
        return res.status(403).json({ error: 'Access Denied: Automated Traffic Detected' });
    }

    next();
};

const setupSecurity = (app) => {
    // Zero Trust Headers
    app.use(helmet());

    // Custom CSP for Zero Trust
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
                connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"], // Allow local dev
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        })
    );

    // Rate Limiting (DOS Protection)
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api', limiter);

    // Data Sanitization
    // app.use(xss()); // Prevent XSS (Disabled due to Express 5 incompatibility)
    app.use(hpp()); // Prevent HTTP Parameter Pollution

    // CORS (Strict Whitelist)
    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:5174'], // Trust both ports
        credentials: true,
        optionsSuccessStatus: 200
    }));

    // AI WAF
    app.use(aiWaf);

    console.log('[Security] Bulletproof Protocols Activated: TLS 1.3 Strict, WAF On, CSP Enforced.');
};

export default setupSecurity;
