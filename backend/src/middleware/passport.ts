import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { prisma } from '../database/client';

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/oauth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (err: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Google'));
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                password: '', // OAuth users don't have passwords
                emailVerified: true,
                provider: 'google',
              },
            });
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

// GitHub Strategy
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/oauth/github/callback';

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: (err: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value || (profile as any).email;
          if (!email) {
            return done(new Error('No email from GitHub'));
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || profile.username || email.split('@')[0],
                firstName: profile.displayName?.split(' ')[0] || profile.username || '',
                lastName: profile.displayName?.split(' ')[1] || '',
                password: '', // OAuth users don't have passwords
                emailVerified: true,
                provider: 'github',
              },
            });
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export default passport;

