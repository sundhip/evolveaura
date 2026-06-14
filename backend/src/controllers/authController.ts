import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role, primaryGoal } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });

    let passwordHash = '';
    if (password) passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password ? passwordHash : null,
        profile: {
          create: {
            name,
            role: role || 'PROFESSIONAL',
            primaryGoal: primaryGoal || 'Balanced Growth',
            auraShields: 0
          }
        }
      },
      include: { profile: true }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { email: bodyEmail, name: bodyName, googleId: bodyGoogleId, credential, accessToken } = req.body;
    let email = bodyEmail;
    let name = bodyName;
    let googleId = bodyGoogleId;

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (credential) {
      if (clientId) {
        // Real Google verification using official SDK for ID Token
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload) {
          return res.status(400).json({ error: 'Invalid Google ID token payload' });
        }
        email = payload.email;
        name = payload.name || payload.given_name || 'Google User';
        googleId = payload.sub;
      } else {
        // Fallback: decode JWT without verification (sandbox mode)
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            email = payload.email;
            name = payload.name || payload.given_name || 'Google User';
            googleId = payload.sub;
          }
        } catch (e) {
          console.warn('Failed to parse credential JWT, falling back to body parameters:', e);
        }
      }
    } else if (accessToken) {
      if (clientId) {
        // Real Google verification using official SDK for Access Token
        const client = new OAuth2Client(clientId);
        client.setCredentials({ access_token: accessToken });
        const userInfoResponse = await client.request<any>({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo'
        });
        const payload = userInfoResponse.data;
        if (!payload || !payload.email) {
          return res.status(400).json({ error: 'Failed to retrieve user info from Google' });
        }
        email = payload.email;
        name = payload.name || payload.given_name || 'Google User';
        googleId = payload.sub;
      } else {
        // Fallback sandbox
        email = bodyEmail || 'sandbox@domain.com';
        name = bodyName || 'Sandbox User';
        googleId = bodyGoogleId || 'sandbox-google-id';
      }
    }

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID are required for sign-in' });
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      include: { profile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          profile: {
            create: {
              name: name || 'Google User',
              role: 'PROFESSIONAL',
              primaryGoal: 'Balanced Growth'
            }
          }
        },
        include: { profile: true }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: { profile: true }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true, projects: true }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const allocateStatPoint = async (req: AuthRequest, res: Response) => {
  try {
    const { statName } = req.body;
    if (!['INT', 'STR', 'VIT', 'WIS', 'AGI'].includes(statName)) {
      return res.status(400).json({ error: 'Invalid stat name' });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! }
    });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.unallocatedPoints <= 0) {
      return res.status(400).json({ error: 'No unallocated points available' });
    }

    const updateData: any = {
      unallocatedPoints: { decrement: 1 }
    };

    const fieldName = `stat${statName}`;
    updateData[fieldName] = { increment: 1 };

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.userId! },
      data: updateData
    });

    // Balanced Growth check
    const stats = [
      updatedProfile.statINT,
      updatedProfile.statSTR,
      updatedProfile.statVIT,
      updatedProfile.statWIS,
      updatedProfile.statAGI
    ];
    const maxStat = Math.max(...stats);
    const minStat = Math.min(...stats);
    const isBalanced = (maxStat - minStat) <= 3;

    res.json({ profile: updatedProfile, isBalanced });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const ascendRank = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! }
    });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Verify stats balance
    const stats = [
      profile.statINT,
      profile.statSTR,
      profile.statVIT,
      profile.statWIS,
      profile.statAGI
    ];
    const maxStat = Math.max(...stats);
    const minStat = Math.min(...stats);
    const isBalanced = (maxStat - minStat) <= 3;

    if (!isBalanced) {
      return res.status(400).json({ error: 'Growth is unbalanced. Your lowest stat cannot be more than 3 levels behind your highest stat.' });
    }

    // Determine next rank
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];
    const idx = ranks.indexOf(profile.auraRank);
    let nextRank = profile.auraRank;
    if (idx !== -1 && idx < ranks.length - 1) {
      nextRank = ranks[idx + 1];
    }

    const { devBypass } = req.body;
    let newLevel = profile.currentLevel;
    let newXP = profile.currentXP;

    if (devBypass) {
      const xpPenalty = 500;
      newXP = profile.currentXP - xpPenalty;
      if (newXP < 0) {
        while (newXP < 0 && newLevel > 1) {
          newLevel -= 1;
          const prevLevelMaxXP = Math.round(100 * Math.pow(newLevel, 1.5));
          newXP = prevLevelMaxXP + newXP;
        }
        if (newXP < 0) newXP = 0;
      }
      
      // Log the penalty
      await prisma.xPLog.create({
        data: {
          userId: req.userId!,
          xpGained: -xpPenalty,
          source: `Dev Skip Penalty: skipped Rank Ascension Trial`
        }
      });
    } else {
      newLevel += 1;
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        auraRank: nextRank,
        equippedTitle: `Aura ${nextRank} Sentinel`,
        currentLevel: newLevel,
        currentXP: newXP
      }
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const clearFatigue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        fatigueActive: false,
        fatigueEndsAt: null
      }
    });
    res.json({ success: true, profile: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
