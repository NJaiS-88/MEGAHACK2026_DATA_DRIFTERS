const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth Middleware: No token provided');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
      // Primary verification with JWT_SECRET
      const secret = process.env.JWT_SECRET || 'secret_key';
      console.log(`Auth Middleware: Using secret starting with: ${secret.substring(0, 10)}...`);
      
      try {
        const decoded = jwt.verify(token, secret);
        console.log('Auth Middleware: Token verified with primary secret');
        req.userId = decoded.userId;
        next();
      } catch (primaryErr) {
        console.warn('Auth Middleware: Primary verification failed:', primaryErr.message);
        
        // Fallback verification for old tokens
        if (secret !== 'secret_key') {
          try {
            const decodedFallback = jwt.verify(token, 'secret_key');
            console.warn('Auth Middleware: Token verified with OLD fallback secret. User should log out/in.');
            req.userId = decodedFallback.userId;
            next();
          } catch (fallbackErr) {
            console.error('Auth Middleware: All verification attempts failed');
            throw primaryErr; // Rethrow original error if both fail
          }
        } else {
          throw primaryErr;
        }
      }
    } catch (err) {
      console.error('Auth Middleware: Token validation error:', err.message);
      res.status(401).json({ error: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth Middleware: Server Error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
