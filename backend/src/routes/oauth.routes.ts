import express, { Request, Response } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt';
import { formatResponse } from '../utils/errors';

const router = express.Router();

// Google OAuth - Step 1: Redirect to Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth - Step 2: Callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login?error=true' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    });

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&email=${user.email}&name=${user.name}`;
    res.redirect(redirectUrl);
  }
);

// GitHub OAuth - Step 1: Redirect to GitHub
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user', 'user:email'] })
);

// GitHub OAuth - Step 2: Callback from GitHub
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login?error=true' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    });

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&email=${user.email}&name=${user.name}`;
    res.redirect(redirectUrl);
  }
);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json(formatResponse(false, null, 'Logout failed'));
    }
    res.json(formatResponse(true, { message: 'Logged out successfully' }));
  });
});

export default router;
