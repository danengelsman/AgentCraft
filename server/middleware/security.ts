import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/production';
import { createLogger } from '../services/logger';

const logger = createLogger('security');

// Rate limiting configurations
export const generalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      userId: (req.session as any)?.userId,
    });
    res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

// Stricter rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.AUTH_RATE_LIMIT_MAX, // 5 attempts
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      email: req.body?.email,
    });
    res.status(429).json({ 
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

// Password reset rate limiter (even stricter)
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts.',
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn('Password reset rate limit exceeded', { 
      ip: req.ip,
      email: req.body?.email,
    });
    res.status(429).json({ 
      error: 'Too many password reset attempts. Please try again later.',
      retryAfter: 3600,
    });
  },
});

// AI/Chat rate limiter (to prevent API abuse)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: 'Too many AI requests.',
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', { 
      ip: req.ip,
      userId: (req.session as any)?.userId,
    });
    res.status(429).json({ 
      error: 'Too many AI requests. Please slow down.',
      retryAfter: 60,
    });
  },
});

// CSRF Protection - relies on SameSite cookies and secure session configuration
// Modern browsers with SameSite=lax cookies provide CSRF protection by default
// Additional protection can be added if needed via double-submit cookies
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // With SameSite=lax cookies, CSRF attacks are largely mitigated
  // Log potential CSRF attempts based on referer mismatch in production
  if (config.NODE_ENV === 'production' && req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const referer = req.headers.referer || req.headers.origin;
    const appUrl = new URL(config.APP_URL);
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== appUrl.host) {
          logger.warn('Potential CSRF attempt - referer mismatch', { 
            ip: req.ip,
            path: req.path,
            method: req.method,
            referer,
            expected: appUrl.host,
          });
          // Don't block - just log for monitoring
        }
      } catch (e) {
        // Invalid referer URL - ignore
      }
    }
  }
  
  next();
};

// Security headers with Helmet
export const securityHeaders = () => {
  if (config.NODE_ENV === 'production') {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://api.openai.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });
  } else {
    // Development mode - less restrictive
    return helmet({
      contentSecurityPolicy: false,
      hsts: false,
    });
  }
};

// IP-based blocking for suspicious activity
const blockedIPs = new Set<string>();
const suspiciousActivity = new Map<string, number>();

export const ipBlocking = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  
  // Check if IP is blocked
  if (ip !== 'unknown' && blockedIPs.has(ip)) {
    logger.warn('Blocked IP attempted access', { ip, path: req.path });
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Track suspicious activity (e.g., multiple 401s)
  if (res.statusCode === 401 || res.statusCode === 403) {
    if (ip !== 'unknown') {
      const count = suspiciousActivity.get(ip) || 0;
      suspiciousActivity.set(ip, count + 1);
      
      // Auto-block after 10 suspicious attempts
      if (count >= 10) {
        blockedIPs.add(ip);
        logger.error('IP auto-blocked due to suspicious activity', { ip });
      }
    }
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS prevention - sanitize common attack vectors
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove script tags and dangerous attributes
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query) as any;
  }
  
  next();
};

// Audit logging for sensitive operations
export const auditMiddleware = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.session as any)?.userId;
    logger.info(`AUDIT: ${action}`, {
      action,
      userId,
      ip: req.ip,
      path: req.path,
      method: req.method,
      body: req.method !== 'GET' ? req.body : undefined,
    });
    next();
  };
};