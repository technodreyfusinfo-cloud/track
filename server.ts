import express from 'express';
import cors from 'cors';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';

interface UserRecord {
  name: string;
  email: string;
  dob: string;
  profession: string;
  photoUrl: string;
  password: string;
  createdAt: string;
  mustChangePassword: boolean;
}

interface ActivityRecord {
  email: string;
  action: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  activity: ActivityRecord[];
}

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const dbPath = path.resolve(process.cwd(), 'database.json');
const adapter = new JSONFile<DatabaseSchema>(dbPath);
const db = new Low<DatabaseSchema>(adapter, { users: [], activity: [] });

await db.read();

const sanitizeUser = (user: UserRecord) => ({
  name: user.name,
  email: user.email,
  dob: user.dob,
  profession: user.profession,
  photoUrl: user.photoUrl || '',
  createdAt: user.createdAt,
  mustChangePassword: user.mustChangePassword,
});

const logActivity = async (email: string, action: string) => {
  const createdAt = new Date().toLocaleString('fr-FR');
  db.data!.activity.unshift({ email, action, createdAt });
  db.data!.activity = db.data!.activity.slice(0, 50);
  await db.write();
};

app.get('/api/users', async (req, res) => {
  await db.read();
  const users = db.data!.users.slice().reverse().map(sanitizeUser);
  res.json({ users });
});

app.get('/api/users/:email', async (req, res) => {
  await db.read();
  const email = String(req.params.email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === email);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

app.get('/api/activity', async (req, res) => {
  await db.read();
  const activity = db.data!.activity.slice(0, 50);
  res.json({ activity });
});

app.post('/api/activity', async (req, res) => {
  const { email, action } = req.body;
  if (!email || !action) {
    return res.status(400).json({ error: 'Email et action requis pour enregistrer l’activité.' });
  }
  await logActivity(String(email), String(action));
  return res.json({ success: true });
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  await db.read();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
  }

  const isPasswordValid = bcrypt.compareSync(String(password), user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }

  await logActivity(user.email, 'Connexion');
  return res.json({ user: sanitizeUser(user), mustChangePassword: user.mustChangePassword });
});

app.post('/api/users/create', async (req, res) => {
  const { name, email, dob, profession, photoUrl, password } = req.body;
  if (!name || !email || !dob || !profession || !password) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis.' });
  }

  await db.read();
  const lowerEmail = String(email).toLowerCase();
  const existing = db.data!.users.find((user) => user.email.toLowerCase() === lowerEmail);
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  const createdAt = new Date().toLocaleString('fr-FR');
  const hashedPassword = bcrypt.hashSync(String(password), 10);
  db.data!.users.push({
    name: String(name).trim(),
    email: lowerEmail,
    dob: String(dob).trim(),
    profession: String(profession).trim(),
    photoUrl: String(photoUrl || ''),
    password: hashedPassword,
    createdAt,
    mustChangePassword: true,
  });
  await db.write();

  await logActivity(lowerEmail, 'Compte utilisateur créé par l’administrateur');
  return res.status(201).json({ success: true });
});

app.post('/api/users/change-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  await db.read();
  const lowerEmail = String(email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  user.password = bcrypt.hashSync(String(newPassword), 10);
  user.mustChangePassword = false;
  await db.write();

  await logActivity(lowerEmail, 'Modification du mot de passe');
  return res.json({ success: true });
});

app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
  }

  await db.read();
  const lowerEmail = String(email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === lowerEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  user.password = bcrypt.hashSync(String(newPassword), 10);
  user.mustChangePassword = true;
  await db.write();

  await logActivity(lowerEmail, 'Mot de passe administrateur réinitialisé');
  return res.json({ success: true });
});

app.post('/api/users/update', async (req, res) => {
  const { oldEmail, name, email, dob, profession, photoUrl } = req.body;
  if (!oldEmail || !name || !email || !dob || !profession) {
    return res.status(400).json({ error: 'Tous les champs obligatoires sont requis.' });
  }

  await db.read();
  const lowerOldEmail = String(oldEmail).toLowerCase();
  const lowerNewEmail = String(email).toLowerCase();
  const user = db.data!.users.find((item) => item.email.toLowerCase() === lowerOldEmail);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (lowerOldEmail !== lowerNewEmail) {
    const existing = db.data!.users.find((item) => item.email.toLowerCase() === lowerNewEmail);
    if (existing) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
    }
  }

  user.name = String(name).trim();
  user.email = lowerNewEmail;
  user.dob = String(dob).trim();
  user.profession = String(profession).trim();
  user.photoUrl = String(photoUrl || '');
  await db.write();

  await logActivity(lowerNewEmail, 'Profil utilisateur modifié');
  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

app.listen(port, () => {
  console.log(`Backend API server is running on http://localhost:${port}`);
});
