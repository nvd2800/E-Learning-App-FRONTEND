import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const { PORT = 4000, JWT_SECRET = 'secret', ACCESS_TTL = '15m' } = process.env;

const signAccess = (u) =>
  jwt.sign({ sub: u.id, email: u.email, name: u.name }, JWT_SECRET, { expiresIn: ACCESS_TTL });

app.get('/', (_req, res) => res.json({ ok: true, service: 'auth-server' }));

// Đăng ký
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ error: 'Invalid payload' });

    const exist = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exist) return res.status(409).json({ error: 'Email exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash },
    });

    const token = signAccess(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { email: (email || '').toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu sai' });

    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Email hoặc mật khẩu sai' });

    const token = signAccess(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Lấy thông tin người dùng từ JWT
app.get('/api/auth/me', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  try {
    const p = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: p.sub } });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => console.log(`auth-server listening on :${PORT}`));
