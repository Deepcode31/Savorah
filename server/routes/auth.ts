import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserPersona } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { AuthRequest, requireAuth, signToken, toPublicUser } from '../middleware/auth.js';
import { seedPersonaData, clearUserFinanceData, hasOnlyPersonaSeedData } from '../seed.js';
import { sendOtpEmail, isMailerConfigured } from '../services/mailer.js';
import { config } from '../config.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PERSONAS: UserPersona[] = ['student', 'professional', 'family', 'senior'];
const isProd = process.env.NODE_ENV === 'production';

const DEMO_USERS: Record<
  UserPersona,
  { name: string; email: string; monthlyIncome: number; avatar: string }
> = {
  student: {
    name: 'Alex Rivera',
    email: 'alex.student@savorah.app',
    monthlyIncome: 25000,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede',
  },
  professional: {
    name: 'Sarah Chen, CFA',
    email: 'sarah.chen@savorah.app',
    monthlyIncome: 120000,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede',
  },
  family: {
    name: 'The Miller Household',
    email: 'miller.family@savorah.app',
    monthlyIncome: 150000,
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Miller&backgroundColor=b6e3f4,c0aede',
  },
  senior: {
    name: 'Robert Vance',
    email: 'robert.vance@savorah.app',
    monthlyIncome: 45000,
    avatar: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Robert&backgroundColor=b6e3f4,c0aede',
  },
};

const DEMO_EMAILS = new Set(Object.values(DEMO_USERS).map((d) => d.email));

/**
 * Real accounts used to get the same persona demo pack on signup.
 * Strip that seed once so they start empty (and can get AI budgets via onboarding).
 */
async function stripLegacyDemoSeedIfNeeded(user: {
  _id: any;
  email: string;
  onboardingComplete: boolean;
  save: () => Promise<any>;
}) {
  if (DEMO_EMAILS.has(user.email)) return false;
  const onlySeed = await hasOnlyPersonaSeedData(user._id);
  if (!onlySeed) return false;
  await clearUserFinanceData(user._id);
  user.onboardingComplete = false;
  await user.save();
  return true;
}

router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, persona, monthlyIncome } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      persona: persona || 'professional',
      monthlyIncome: Number(monthlyIncome) || 45000,
      currency: '₹',
      onboardingComplete: false,
    });
    const token = signToken(user._id.toString());
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user._id.toString());
    res.json({ token, user: toPublicUser(user) });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

/**
 * Real Google Sign-In. The frontend (Google Identity Services) sends the
 * signed ID token as `credential`; we verify it with Google, then create or
 * fetch the matching user in MongoDB. No hardcoded accounts.
 */
router.post('/google', async (req, res: Response) => {
  try {
    const credential = req.body?.credential;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }
    if (!config.googleClientId) {
      return res.status(501).json({
        error:
          'Google sign-in is not configured on the server. Set GOOGLE_CLIENT_ID in .env, or use email code login.',
      });
    }

    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }
    const payload = (await verifyRes.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };

    if (payload.aud !== config.googleClientId) {
      return res.status(401).json({ error: 'Google credential audience mismatch' });
    }
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!payload.email || !emailVerified) {
      return res.status(401).json({ error: 'Google account email not verified' });
    }

    const email = payload.email.toLowerCase().trim();
    const persona: UserPersona = VALID_PERSONAS.includes(req.body?.persona)
      ? req.body.persona
      : 'professional';
    const monthlyIncome = Number(req.body?.monthlyIncome) || 45000;

    let user = await User.findOne({ email });
    let isNew = false;
    if (!user) {
      isNew = true;
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        passwordHash: null,
        persona,
        monthlyIncome,
        currency: '₹',
        avatar: payload.picture,
        isGoogleUser: true,
        // Fresh account — no sample ledger; client runs AI budget onboarding.
        onboardingComplete: false,
      });
    } else {
      user.isGoogleUser = true;
      if (payload.picture) user.avatar = payload.picture;
      if (payload.name && !user.name) user.name = payload.name;
      await user.save();
      await stripLegacyDemoSeedIfNeeded(user);
    }

    const token = signToken(user._id.toString());
    res.status(isNew ? 201 : 200).json({
      token,
      user: toPublicUser(user),
      isNewUser: isNew || !user.onboardingComplete,
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: error.message || 'Google login failed' });
  }
});

/**
 * Step 1 of passwordless email login: generate a 6-digit code, store it hashed
 * with a 10-minute expiry, and email it. New-user signup details are stashed on
 * the OTP record so the account can be created on verify.
 */
router.post('/otp/request', async (req, res: Response) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const existing = await User.findOne({ email });
    const persona = VALID_PERSONAS.includes(req.body?.persona) ? req.body.persona : 'professional';
    const name = String(req.body?.name || '').trim() || email.split('@')[0];
    const monthlyIncome = Number(req.body?.monthlyIncome) || 45000;

    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);

    await Otp.findOneAndDelete({ email });
    await Otp.create({
      email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60_000),
      name: existing ? existing.name : name,
      persona: existing ? existing.persona : persona,
      monthlyIncome: existing ? existing.monthlyIncome : monthlyIncome,
    });

    const emailed = await sendOtpEmail(email, code);

    res.json({
      sent: true,
      emailed,
      isNewUser: !existing,
      // In dev without SMTP, surface the code so the flow is testable.
      ...(!emailed && !isProd ? { devCode: code } : {}),
    });
  } catch (error: any) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: error.message || 'Could not send login code' });
  }
});

/**
 * Step 2: verify the code. Creates the user (empty ledger) if new,
 * then issues a JWT. Codes are single-use and rate-limited by attempt count.
 */
router.post('/otp/verify', async (req, res: Response) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const code = String(req.body?.code || '').trim();
    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Enter the 6-digit code sent to your email' });
    }

    const record = await Otp.findOne({ email });
    if (!record) {
      return res.status(400).json({ error: 'Code expired or not found. Request a new one.' });
    }
    if (record.expiresAt.getTime() < Date.now()) {
      await record.deleteOne();
      return res.status(400).json({ error: 'Code expired. Request a new one.' });
    }
    if (record.attempts >= 5) {
      await record.deleteOne();
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }

    const ok = await bcrypt.compare(code, record.codeHash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(401).json({ error: 'Incorrect code. Please try again.' });
    }

    let user = await User.findOne({ email });
    let isNew = false;
    if (!user) {
      isNew = true;
      const persona = (record.persona || 'professional') as UserPersona;
      user = await User.create({
        name: record.name || email.split('@')[0],
        email,
        passwordHash: null,
        persona,
        monthlyIncome: record.monthlyIncome || 45000,
        currency: '₹',
        onboardingComplete: false,
      });
    } else {
      await stripLegacyDemoSeedIfNeeded(user);
    }

    await record.deleteOne();
    const token = signToken(user._id.toString());
    res.status(isNew ? 201 : 200).json({
      token,
      user: toPublicUser(user),
      isNewUser: isNew || !user.onboardingComplete,
    });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

/** Lets the frontend know which auth methods are available. */
router.get('/config', (_req, res: Response) => {
  res.json({
    googleClientId: config.googleClientId || null,
    emailConfigured: isMailerConfigured(),
  });
});

/** Instant hackathon demo login — upserts persona demo user + seeds data. */
router.post('/demo', async (req, res: Response) => {
  try {
    const persona = (req.body?.persona || 'student') as UserPersona;
    if (!['student', 'professional', 'family', 'senior'].includes(persona)) {
      return res.status(400).json({ error: 'Invalid persona' });
    }
    const demo = DEMO_USERS[persona];
    let user = await User.findOne({ email: demo.email });
    if (!user) {
      user = await User.create({
        name: demo.name,
        email: demo.email,
        passwordHash: await bcrypt.hash('demo1234', 10),
        persona,
        monthlyIncome: demo.monthlyIncome,
        currency: '₹',
        avatar: demo.avatar,
        onboardingComplete: true,
      });
    } else {
      user.persona = persona;
      user.monthlyIncome = demo.monthlyIncome;
      user.currency = '₹';
      user.name = demo.name;
      user.avatar = demo.avatar;
      user.onboardingComplete = true;
      await user.save();
    }
    await seedPersonaData(user._id, persona);
    const token = signToken(user._id.toString());
    res.json({ token, user: toPublicUser(user) });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: error.message || 'Demo login failed' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: toPublicUser(req.user!) });
});

export default router;
