import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_RECENT_BACKERS, 
  TESTIMONIES,
  FUNDING_PROGRESS,
  LAUNCH_COST
} from './data';
import { Backer } from './types';

interface UserProfile {
  name: string;
  email: string;
  dob: string;
  profession: string;
  photoUrl: string;
}

interface UserAccount extends UserProfile {
  password: string;
  createdAt: string;
  mustChangePassword: boolean;
}

// Imported modular components
import InteractiveSchema from './components/InteractiveSchema';
import BudgetChart from './components/BudgetChart';
import FundingDashboard from './components/FundingDashboard';
import { InvestmentTable } from './components/InvestmentTable';

// Lucide icon assets
import { 
  Rocket, 
  Users, 
  Smartphone, 
  GraduationCap, 
  PiggyBank, 
  TrendingUp, 
  Heart, 
  ShieldCheck, 
  BadgeCheck, 
  PhoneCall, 
  Mail, 
  UserCheck, 
  ClipboardCheck, 
  Clock, 
  Copy, 
  Check, 
  Calendar,
  Share2,
  ChevronRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Campaign State
  const CAMPAGNE_GOAL = FUNDING_PROGRESS.totalGoal; // 30,000,000 FCFA
  const [raisedAmount, setRaisedAmount] = useState<number>(FUNDING_PROGRESS.amountRaised); // 3,455,090 FCFA collecté
  const [backersList, setBackersList] = useState<Backer[]>(INITIAL_RECENT_BACKERS);
  const [hasContributed, setHasContributed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Simulated QA & Contact forms state
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactMsg, setContactMsg] = useState<string>('');
  const [contactSubmitting, setContactSubmitting] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // Account gate state
  const [registerName, setRegisterName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerDob, setRegisterDob] = useState<string>('');
  const [registerProfession, setRegisterProfession] = useState<string>('');
  const [registerPhotoUrl, setRegisterPhotoUrl] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');

  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('siteAdminAuthenticated') === 'true';
  });
  const [adminResetTarget, setAdminResetTarget] = useState<string>('');
  const [adminResetPassword, setAdminResetPassword] = useState<string>('');
  const [adminResetError, setAdminResetError] = useState<string>('');
  const [adminResetSuccess, setAdminResetSuccess] = useState<string>('');
  const [passwordChangeEmail, setPasswordChangeEmail] = useState<string>('');
  const [passwordChangeNew, setPasswordChangeNew] = useState<string>('');
  const [passwordChangeConfirm, setPasswordChangeConfirm] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');
  const [users, setUsers] = useState<UserAccount[]>(() => {
    if (typeof window === 'undefined') return [];
    const rawUsers = localStorage.getItem('siteUsers');
    if (rawUsers) {
      try {
        return JSON.parse(rawUsers);
      } catch {
        return [];
      }
    }
    const storedProfile = localStorage.getItem('siteUserProfile');
    const storedPassword = localStorage.getItem('siteUserPassword');
    if (storedProfile && storedPassword) {
      try {
        const profileData: UserProfile = JSON.parse(storedProfile);
        return [
          {
            ...profileData,
            password: storedPassword,
            createdAt: new Date().toISOString(),
          },
        ];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [userActivity, setUserActivity] = useState<{ email: string; action: string; time: string }[]>(() => {
    if (typeof window === 'undefined') return [];
    const rawActivity = localStorage.getItem('siteUserActivity');
    if (!rawActivity) return [];
    try {
      return JSON.parse(rawActivity);
    } catch {
      return [];
    }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('siteCurrentUserEmail') || '';
  });

  // Login state
  const [isLoginMode, setIsLoginMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('siteUserProfile');
      return stored ? true : false;
    }
    return false;
  });
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const storedProfile = typeof window !== 'undefined' ? localStorage.getItem('siteUserProfile') : null;
  const initialProfile: UserProfile = storedProfile
    ? JSON.parse(storedProfile)
    : { name: '', email: '', dob: '', profession: '', photoUrl: '' };

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('siteAccountCreated') === 'true';
    }
    return false;
  });
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(initialProfile);
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

  const saveUsers = (nextUsers: UserAccount[]) => {
    setUsers(nextUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteUsers', JSON.stringify(nextUsers));
    }
  };

  const saveUserActivity = (nextActivity: { email: string; action: string; time: string }[]) => {
    setUserActivity(nextActivity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteUserActivity', JSON.stringify(nextActivity));
    }
  };

  const logUserActivity = (email: string, action: string) => {
    const nextActivity = [
      { email, action, time: new Date().toLocaleString('fr-FR') },
      ...userActivity,
    ].slice(0, 50);
    saveUserActivity(nextActivity);
  };

  const saveCurrentUserEmail = (email: string) => {
    setCurrentUserEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteCurrentUserEmail', email);
    }
  };

  const ADMIN_EMAIL = 'admin@admin.com';
  const ADMIN_PASSWORD = 'Admin@123';

  // Compute stats
  const backersCount = 12 + (backersList.length - INITIAL_RECENT_BACKERS.length);
  const rawPercentage = (raisedAmount / CAMPAGNE_GOAL) * 100;
  const percentage = Math.min(100, Math.round(rawPercentage * 10) / 10);
  const remainingAmount = Math.max(0, CAMPAGNE_GOAL - raisedAmount);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const launchCost = LAUNCH_COST;
  const launchCostShare = Math.round((launchCost / CAMPAGNE_GOAL) * 100);

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('investment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRegisterPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRegisterPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProfileDraft((prev: UserProfile) => ({ ...prev, photoUrl: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerDob.trim() || !registerProfession.trim()) {
      setRegisterError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }
    if (!registerEmail.includes('@')) {
      setRegisterError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    const newProfile: UserProfile = {
      name: registerName.trim(),
      email: registerEmail.trim(),
      dob: registerDob,
      profession: registerProfession.trim(),
      photoUrl: registerPhotoUrl,
    };

    const existingUser = users.find((user) => user.email.toLowerCase() === newProfile.email.toLowerCase());
    if (existingUser) {
      setRegisterError('Un compte existe déjà avec cette adresse email.');
      return;
    }

    const newAccount: UserAccount = {
      ...newProfile,
      password: registerPassword,
      createdAt: new Date().toLocaleString('fr-FR'),
      mustChangePassword: true,
    };

    saveUsers([newAccount, ...users]);
    logUserActivity(newProfile.email, 'Compte utilisateur créé par l’administrateur');

    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterDob('');
    setRegisterProfession('');
    setRegisterPhotoUrl('');
    setRegisterError('');
  }; 


  const handleLogout = () => {
    const logoutEmail = currentUserEmail || profile.email;
    if (logoutEmail) {
      logUserActivity(logoutEmail, 'Déconnexion');
    }
    setIsRegistered(false);
    setShowProfileMenu(false);
    setCurrentUserEmail('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('siteAccountCreated');
      localStorage.removeItem('siteCurrentUserEmail');
    }
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    if (loginEmail.trim().toLowerCase() === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteAdminAuthenticated', 'true');
        window.location.href = '/admin';
      }
      return;
    }

    const searchedUsers = users.length ? users : [];
    const matchedAccount = searchedUsers.find(
      (user) => user.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!matchedAccount) {
      setLoginError('Aucun compte trouvé avec cet email.');
      return;
    }

    if (matchedAccount.password !== loginPassword) {
      setLoginError('Email ou mot de passe incorrect.');
      return;
    }

    const profileData: UserProfile = {
      name: matchedAccount.name,
      email: matchedAccount.email,
      dob: matchedAccount.dob,
      profession: matchedAccount.profession,
      photoUrl: matchedAccount.photoUrl,
    };

    if (matchedAccount.mustChangePassword) {
      setProfile(profileData);
      setProfileDraft(profileData);
      setPasswordChangeEmail(matchedAccount.email);
      setPasswordChangeError('');
      setLoginEmail('');
      setLoginPassword('');
      return;
    }

    setProfile(profileData);
    setProfileDraft(profileData);
    setIsRegistered(true);
    saveCurrentUserEmail(profileData.email);
    logUserActivity(profileData.email, 'Connexion');
    setLoginEmail('');
    setLoginPassword('');
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteAccountCreated', 'true');
      localStorage.setItem('siteUserProfile', JSON.stringify(profileData));
      localStorage.setItem('siteUserPassword', matchedAccount.password);
    }
  };

  const handleOpenEditProfile = () => {
    setProfileDraft(profile);
    setIsEditingProfile(true);
    setShowProfileMenu(false);
  };

  const handleSaveProfile = () => {
    const oldEmail = currentUserEmail || profile.email;
    setProfile(profileDraft);
    setIsEditingProfile(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteUserProfile', JSON.stringify(profileDraft));
      const updatedUsers = users.map((user) =>
        user.email.toLowerCase() === oldEmail.toLowerCase()
          ? { ...user, ...profileDraft }
          : user
      );
      saveUsers(updatedUsers);
      if (oldEmail.toLowerCase() !== profileDraft.email.toLowerCase()) {
        saveCurrentUserEmail(profileDraft.email);
      }
    }
  };

  const handleAdminLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError('Veuillez saisir vos identifiants administrateur.');
      return;
    }

    if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
      setAdminError('Email ou mot de passe administrateur incorrect.');
      return;
    }

    setIsAdminAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteAdminAuthenticated', 'true');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminEmail('');
    setAdminPassword('');
    setAdminResetTarget('');
    setAdminResetPassword('');
    setAdminResetError('');
    setAdminResetSuccess('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('siteAdminAuthenticated');
    }
  };

  const handleAdminStartReset = (email: string) => {
    setAdminResetTarget(email);
    setAdminResetPassword('');
    setAdminResetError('');
    setAdminResetSuccess('');
  };

  const handleAdminConfirmReset = (e: FormEvent) => {
    e.preventDefault();
    if (!adminResetTarget) {
      setAdminResetError('Veuillez sélectionner un utilisateur.');
      return;
    }
    if (!adminResetPassword.trim()) {
      setAdminResetError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (adminResetPassword.length < 6) {
      setAdminResetError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    const updatedUsers = users.map((user) =>
      user.email.toLowerCase() === adminResetTarget.toLowerCase()
        ? { ...user, password: adminResetPassword, mustChangePassword: true }
        : user
    );

    saveUsers(updatedUsers);
    setAdminResetSuccess('Mot de passe réinitialisé. L’utilisateur devra le changer à sa prochaine connexion.');
    setAdminResetError('');
    setAdminResetTarget('');
    setAdminResetPassword('');

    const targetEmail = adminResetTarget;
    logUserActivity(targetEmail, 'Mot de passe administrateur réinitialisé');
  };

  const handlePasswordChangeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (!passwordChangeNew.trim() || !passwordChangeConfirm.trim()) {
      setPasswordChangeError('Veuillez renseigner le nouveau mot de passe et la confirmation.');
      return;
    }
    if (passwordChangeNew !== passwordChangeConfirm) {
      setPasswordChangeError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordChangeNew.length < 6) {
      setPasswordChangeError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    const updatedUsers = users.map((user) =>
      user.email.toLowerCase() === passwordChangeEmail.toLowerCase()
        ? { ...user, password: passwordChangeNew, mustChangePassword: false }
        : user
    );

    saveUsers(updatedUsers);

    const updatedUser = updatedUsers.find(
      (user) => user.email.toLowerCase() === passwordChangeEmail.toLowerCase()
    );

    if (updatedUser) {
      const profileData: UserProfile = {
        name: updatedUser.name,
        email: updatedUser.email,
        dob: updatedUser.dob,
        profession: updatedUser.profession,
        photoUrl: updatedUser.photoUrl,
      };
      setProfile(profileData);
      setProfileDraft(profileData);
      setIsRegistered(true);
      saveCurrentUserEmail(updatedUser.email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('siteAccountCreated', 'true');
        localStorage.setItem('siteUserProfile', JSON.stringify(profileData));
        localStorage.setItem('siteUserPassword', passwordChangeNew);
      }
      logUserActivity(updatedUser.email, 'Modification du mot de passe');
    }

    setPasswordChangeEmail('');
    setPasswordChangeNew('');
    setPasswordChangeConfirm('');
  };

  // Handle Contact Form Submission
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;

    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1500);
  };

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
          {!isAdminAuthenticated ? (
            <div>
              <div className="text-center mb-8">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10 text-brand-green mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm mt-3">Connectez-vous pour gérer les comptes utilisateurs et suivre les connexions.</p>
              </div>

              {adminError && (
                <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Email administrateur</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                    placeholder="admin@admin.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                    placeholder="Mot de passe admin"
                  />
                </div>
                <button type="submit" className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all">
                  Se connecter en tant qu'admin
                </button>
                <button
                  type="button"
                  onClick={() => (window.location.href = '/')}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all"
                >
                  Retour au site public
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Tableau de bord administrateur</h1>
                  <p className="text-slate-400 text-sm mt-2">Gestion des comptes utilisateurs et suivi des connexions.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="inline-flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all"
                >
                  Déconnexion admin
                </button>
              </div>

              {(adminResetSuccess || adminResetError) && (
                <div className="mb-6 space-y-3">
                  {adminResetSuccess && (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 text-sm">
                      {adminResetSuccess}
                    </div>
                  )}
                  {adminResetError && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                      {adminResetError}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Créer un compte utilisateur</h2>
                {registerError && (
                  <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                    {registerError}
                  </div>
                )}
                <p className="text-slate-400 text-sm mb-4">
                  Le mot de passe est temporaire. L’utilisateur devra le changer à sa première connexion.
                </p>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Nom complet</label>
                    <input
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                      placeholder="Nom complet"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Adresse email</label>
                    <input
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                      placeholder="email@exemple.com"
                      type="email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Mot de passe temporaire</label>
                    <input
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                      placeholder="Au moins 6 caractères"
                      type="password"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Date de naissance</label>
                      <input
                        value={registerDob}
                        onChange={(e) => setRegisterDob(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        type="date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Profession</label>
                      <input
                        value={registerProfession}
                        onChange={(e) => setRegisterProfession(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                        placeholder="Ex: Enseignant, Entrepreneur, Parent"
                        type="text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Photo de profil (optionnelle)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRegisterPhoto}
                      className="w-full text-slate-200 text-sm file:rounded-full file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-slate-950"
                    />
                    {registerPhotoUrl && (
                      <img src={registerPhotoUrl} alt="Aperçu photo" className="mt-3 h-24 w-24 rounded-full object-cover border border-slate-700" />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                  >
                    Créer le compte utilisateur
                  </button>
                </form>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Utilisateurs enregistrés</p>
                  <p className="text-3xl font-bold mt-4 text-white">{users.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Événements récents</p>
                  <p className="text-3xl font-bold mt-4 text-white">{userActivity.length}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Comptes utilisateurs</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 font-semibold">Nom</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">Profession</th>
                        <th className="px-3 py-2 font-semibold">Créé le</th>
                        <th className="px-3 py-2 font-semibold">État</th>
                        <th className="px-3 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.email} className="border-t border-slate-700">
                          <td className="px-3 py-3">{user.name}</td>
                          <td className="px-3 py-3">{user.email}</td>
                          <td className="px-3 py-3">{user.profession}</td>
                          <td className="px-3 py-3">{user.createdAt}</td>
                          <td className="px-3 py-3">
                            {user.mustChangePassword ? (
                              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300">
                                Changement requis
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-2">
                              {adminResetTarget === user.email ? (
                                <form onSubmit={handleAdminConfirmReset} className="space-y-2">
                                  <input
                                    value={adminResetPassword}
                                    onChange={(e) => setAdminResetPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-green"
                                    type="password"
                                    placeholder="Nouveau mot de passe"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="rounded-xl bg-brand-green px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-brand-green/90 transition-all"
                                    >
                                      Valider
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAdminResetTarget('')}
                                      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAdminStartReset(user.email)}
                                  className="rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/20 transition-all"
                                >
                                  Réinitialiser
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const keptUsers = users.filter((item) => item.email !== user.email);
                                  saveUsers(keptUsers);
                                  if (currentUserEmail.toLowerCase() === user.email.toLowerCase()) {
                                    handleLogout();
                                  }
                                }}
                                className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 transition-all"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Journal de connexion</h2>
                <div className="space-y-3">
                  {userActivity.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun événement enregistré.</p>
                  ) : (
                    userActivity.map((event, index) => (
                      <div key={`${event.email}-${index}`} className="rounded-2xl bg-slate-900 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-300">{event.email}</span>
                          <span className="text-xs text-slate-500">{event.time}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-200">{event.action}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (passwordChangeEmail) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10 text-brand-green mb-4">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Changement de mot de passe</h1>
            <p className="text-slate-400 text-sm mt-3">
              Vous devez changer votre mot de passe avant de pouvoir accéder au site.
            </p>
          </div>

          {passwordChangeError && (
            <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
              {passwordChangeError}
            </div>
          )}

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Nouveau mot de passe</label>
              <input
                value={passwordChangeNew}
                onChange={(e) => setPasswordChangeNew(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                placeholder="Nouveau mot de passe"
                type="password"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Confirmation du mot de passe</label>
              <input
                value={passwordChangeConfirm}
                onChange={(e) => setPasswordChangeConfirm(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                placeholder="Confirmez le mot de passe"
                type="password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
            >
              Valider le nouveau mot de passe
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-green/10 text-brand-green mb-4">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Se connecter</h1>
            <p className="text-slate-400 text-sm mt-3">
              Connectez-vous avec votre email et mot de passe. La création de compte est réservée à l’administrateur.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Adresse email</label>
              <input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                placeholder="email@exemple.com"
                type="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Mot de passe</label>
              <input
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-green"
                placeholder="Votre mot de passe"
                type="password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
            >
              Se connecter
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-6">
            Les comptes sont créés uniquement par l’administrateur. Contactez un administrateur si vous n’avez pas encore d’accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-brand-green/20 selection:text-brand-blue">
      
      {/* Top Banner Ticker Alert */}
      <div className="bg-brand-blue text-xs text-white py-2 px-4 shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
            <span>Campagne Active : Suivi Scolaire en temps réel par AYISSOU Koffi Elom</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Financement visé : {formatFCFA(CAMPAGNE_GOAL)}</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Lancement prévu : Deuxième trimestre 2027</span>
          </div>
        </div>
      </div>

      {/* Modern Compact Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm">
              <span className="text-xl text-brand-green">S</span>T
            </div>
            <div>
              <span className="font-extrabold text-brand-blue tracking-tight text-lg block leading-none">SchoolTrack</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-0.5">Mécénat Éducatif</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 ml-6">
            <a href="#probleme" className="px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors">Le Problème</a>
            <a href="#solution" className="px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors">Notre Solution</a>
            <a href="#pourquoi" className="px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors">Pourquoi Investir ?</a>
            <a href="#investment" className="px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors">Revenus sur investissement</a>
            <a href="#budget" className="px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors">Financement</a>
            <a href="#contact" className="px-2.5 py-1 rounded-lg hover:text-brand-blue hover:bg-brand-green/10 transition-colors">Transparence & Contact</a>
          </nav>

          <div className="flex items-center gap-3 relative">
            {isRegistered && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm cursor-pointer"
                >
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profil" className="h-full w-full object-cover" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-slate-700" />
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-3xl bg-white border border-slate-200 shadow-xl text-slate-800 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mon compte</p>
                      <p className="font-semibold text-sm mt-2 truncate">{profile.name || 'Utilisateur'}</p>
                      <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100"
                    >
                      Éditer le profil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-slate-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={scrollToSimulator}
              className="px-5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Je participe</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {isEditingProfile && (
        <section className="bg-slate-100 border-b border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center">
                    {profileDraft.photoUrl ? (
                      <img src={profileDraft.photoUrl} alt="Aperçu profil" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-slate-700">
                        {profileDraft.name
                          .split(' ')
                          .map((part) => part.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('')}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Édition de profil</p>
                    <h2 className="text-xl font-bold text-slate-900">Modifier vos informations</h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Nom complet</label>
                    <input
                      value={profileDraft.name}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Profession</label>
                    <input
                      value={profileDraft.profession}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, profession: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green"
                      type="text"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Email</label>
                    <input
                      value={profileDraft.email}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Date de naissance</label>
                    <input
                      value={profileDraft.dob}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, dob: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-green"
                      type="date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Photo de profil</label>
                  <div className="flex items-center gap-3">
                    <label htmlFor="edit-profile-photo" className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <path d="M12 15V3" />
                      </svg>
                      Choisir un fichier
                    </label>
                    {profileDraft.photoUrl ? (
                      <img src={profileDraft.photoUrl} alt="Aperçu du profil" className="h-14 w-14 rounded-full object-cover border border-slate-300" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 text-sm">
                        Aucun
                      </div>
                    )}
                  </div>
                  <input
                    id="edit-profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhoto}
                    className="sr-only"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
                  >
                    Enregistrer le profil
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live State Alert Ticker when someone contributes */}
      <AnimatePresence>
        {hasContributed && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-brand-blue text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-green/20 text-brand-green rounded-lg mt-0.5">
                <Rocket className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-sm text-slate-100">Nouvelle contribution simulée !</h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  La jauge globale a été actualisée en temps réel. Merci de tester et d'explorer la plateforme de l'application !
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-16">
        
        {/* HERO SECTION / CAMPAGNE GAUGE SUMMARY */}
        <section className="bg-slate-900 text-white pt-10 pb-16 px-4 md:px-6 relative overflow-hidden">
          
          {/* Subtle background circles */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[320px] h-[320px] bg-brand-green/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Vision Statement */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-semibold uppercase tracking-wider rounded-full border border-brand-green/20">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Projet d’Impact Social National</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-[1.12]">
                  Investissez dans l’avenir de l’éducation avec l’Application de suivi scolaire en temps réel.
                </h1>

                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light">
                  “Un projet innovant qui améliore la communication entre écoles et parents, réduit l’échec scolaire et garantit un suivi académique efficace.”
                </p>

                <div className="flex flex-wrap gap-3.5 pt-2">
                  <a 
                    href="#solution"
                    className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-xl transition-all text-sm block text-center"
                  >
                    Découvrir la solution
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                  <div>
                    <span className="block text-2xl font-black text-brand-green">100%</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Transparent &amp; Audit prévu</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-white">SMS + Web</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Zéro coupure réseau</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Campaign progress Card */}
              <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-xs border border-slate-850 p-6 rounded-3xl shadow-2xl relative">
                <div className="space-y-6">
                  
                  {/* Status Badges */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono">Simulateur Actif</span>
                  </div>

                  {/* Large Metrics */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 tracking-widest font-semibold block">Collecté</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-black text-brand-green tracking-tight font-mono">
                        {formatFCFA(raisedAmount)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      sur un objectif total estimé de <strong>{formatFCFA(CAMPAGNE_GOAL)}</strong>
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Progression globale</span>
                      <span className="text-brand-green font-mono">{percentage}% financé</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-brand-green h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Sub-campaign stats Grid */}
                  <div className="py-1.5 border-y border-slate-800/80">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-xl font-bold text-slate-100 font-mono">{backersCount}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Personnes ayant investi</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl md:text-3xl font-black text-yellow-300 font-mono">{formatFCFA(remainingAmount)}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Restant à collecter</span>
                      </div>
                    </div>
                  </div>

                  {/* Instant shortcut trigger */}
                  <button 
                    onClick={scrollToSimulator}
                    className="w-full py-3.5 bg-brand-green hover:bg-brand-green/95 text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-md block text-center"
                  >
                    Investir dès maintenant
                  </button>

                </div>
              </div>

            </div>
          </div>

        </section>

        {/* SECTION 1: PRESENTATION DU PROBLEME */}
        <section id="probleme" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Photo content */}
              <div className="lg:col-span-5 relative group">
                {/* Background colored shadow box */}
                <div className="absolute -inset-4 bg-brand-blue/5 rounded-3xl -rotate-2 transform group-hover:rotate-0 transition-transform duration-300 pointer-events-none" />
                
                {/* Photo render */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                  <img 
                    src="/src/assets/images/classroom_students_1780310259872.png" 
                    alt="Photo d'élèves africains attentifs et joyeux en classe"
                    className="w-full h-[320px] md:h-[400px] object-cover hover:scale-101 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating Caption Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl text-white text-xs flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <p className="leading-snug">
                      La réactivité administrative en temps réel multiplie par deux le taux d'implication parentale.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Problem description */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1">Le Constat Actuel</span>
                  <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                    Le manque de communication moderne nuit à l’excellence scolaire.
                  </h2>
                </div>

                {/* Problem quote requested */}
                <div className="bg-slate-50 border-l-4 border-slate-800 p-5 rounded-r-2xl">
                  <p className="text-slate-800 text-base italic leading-relaxed font-medium">
                    “Aujourd’hui, les parents découvrent trop tard les absences ou les mauvais résultats. La communication scolaire reste lente et inefficace.”
                  </p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  L'échec scolaire n'est souvent pas un problème de capacité, mais un problème de <strong className="text-brand-blue">latence d'information</strong>. Lorsqu'une absence n'est pas signalée immédiatement ou lorsqu'une mauvaise note de milieu de trimestre n'est vue par le parent qu'à la distribution des bulletins de fin d'année, il est trop tard pour réagir, organiser un soutien scolaire ou guider l’étudiant.
                </p>

                {/* Micro KPIs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg mt-0.5">
                      <span className="text-[10px] font-bold font-mono">92%</span>
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block">Absence de plateforme en ligne</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">Pour la très grande majorité des établissements subsahariens.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg mt-0.5">
                      <span className="text-[10px] font-bold font-mono">15 Jrs+</span>
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 block">Délai moyen d'information</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">Pour déceler un décrochage, une absence répétée ou un incident disciplinaire.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* SECTION 2: NOTRE SOLUTION */}
        <section id="solution" className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            {/* Header Text */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest block">Notre Solution</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Une application mobile et web qui connecte instantanément parents, enseignants et administration.
              </h2>
              <div className="w-12 h-1 bg-brand-green mx-auto rounded-full" />
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Notre plateforme fluidifie l’administration, allège la paperasse pour l’enseignant, et permet aux parents d'agir au jour le jour avec discernement.
              </p>
            </div>

            {/* Render interactive schema component (Parents <-> App <-> School) */}
            <InteractiveSchema />

            {/* Three key pillars description as requested */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5 text-brand-green font-semibold" />
                </div>
                <h4 className="font-bold text-base text-brand-blue mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full inline-block" />
                  📱 Suivi en temps réel
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Dès l'instant ou la feuille de présence ou le bulletin est validé sur le portail enseignant, le parent reçoit une alerte push ou un SMS pour en être notifié.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-brand-blue font-semibold" />
                </div>
                <h4 className="font-bold text-base text-brand-blue mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full inline-block" />
                  👨‍👩‍👧 Implication parentale
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Le parent n'attend plus de devoir venir chercher les relevés de fin d'année. Il fait partie intégrante du quotidien et peut communiquer directement avec l'école.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-brand-green font-semibold" />
                </div>
                <h4 className="font-bold text-base text-brand-blue mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full inline-block" />
                  🎓 Réussite scolaire
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Les professeurs évaluent et renseignent plus facilement leurs rapports. La fluidité d'analyse permet de redresser les situations bien avant les examens décisifs.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 3: POURQUOI INVESTIR ? */}
        <section id="pourquoi" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-widest block">Opportunité</span>
              <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Pourquoi investir dans ce projet innovant ?
              </h2>
              <div className="w-12 h-1 bg-brand-blue mx-auto rounded-full" />
              <p className="text-slate-600 text-sm leading-relaxed">
                Ce projet associe viabilité financière incontournable et changement social profond et mesurable pour l'éducation.
              </p>
            </div>

            {/* Strategic Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <PiggyBank className="w-6 h-6 text-brand-green" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Revenus garantis</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Grâce aux frais scolaires et d'inscriptions directement intégrés à la plateforme, l'application prélève de faibles redevances d'administration récurrentes garantissant des revenus prévisibles.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded w-fit uppercase">
                  SaaS Éducatif
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <TrendingUp className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Marché immense</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Cible prioritairement toutes les écoles secondaires, privées. Un fort désir de numérisation de la part des parents d'élèves africains.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded w-fit uppercase">
                  Primaires &amp; Lycées
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Impact social fort</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Réduit drastiquement l’échec scolaire et l'absentéisme non encadré. Renforce la transparence et l'éthique au sein de l'environnement éducatif.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded w-fit uppercase">
                  RSE &amp; Éthique
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl w-fit">
                    <Rocket className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h4 className="font-bold text-lg text-brand-blue">Expansion en Afrique</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Un fort potentiel d’exportation et d’expansion rapide. Les technologies mobiles en Afrique de l'Ouest connaissent l’une des croissances les plus fulgurantes.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded w-fit uppercase">
                  Panafricain
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 3.5: TABLEAU FINANCIER D'INVESTISSEMENT */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div id="investment" className="mb-12 text-center scroll-mt-24">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-2">Opportunité d'Investissement</span>
              <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Rendement selon palier (jusqu'à 400%) en 5 ans
              </h2>
              <p className="text-slate-600 text-sm mt-3 max-w-2xl mx-auto">
                Découvrez les conditions de remboursement équitable et transparent selon le montant investi
              </p>
            </div>
            <InvestmentTable />
          </div>
        </section>

        {/* SECTION 4: BUDGET & OBJECTIFS DE COLLECTE */}
        <section id="budget" className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column Text / Campaign Details */}
              <div className="lg:col-span-4 space-y-5">
                <div>
                  <span className="text-xs font-bold text-brand-green uppercase tracking-widest block mb-1">Ressources &amp; Transparence</span>
                  <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                    Un budget clair pour un déploiement maîtrisé
                  </h2>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  L'ensemble de la levée servira à propulser le développement de l'application, l'acquisition de serveurs locaux cloud sécurisés décisifs, et l'implantation territoriale par Mme/M. AYISSOU Koffi Elom et son équipe.
                </p>

                <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-emerald-500/10 text-emerald-800 p-3 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-green" />
                  <span>
                    Chaque contribution sera utilisée exclusivement pour le développement et le déploiement de l’application.
                  </span>
                </div>
              </div>

              {/* Right Column: Custom interactive donut chart component */}
              <div className="lg:col-span-8">
                <BudgetChart />
              </div>

            </div>

          </div>
        </section>

        {/* FUNDING DASHBOARD: statistiques et graphique */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FundingDashboard totalGoal={CAMPAGNE_GOAL} raisedAmount={raisedAmount} backers={backersList} />
          </div>
        </section>

        {/* SECTION 7: CONTACT & TRANSPARENCE */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              
              {/* Left column info */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-widest block mb-1">Directeur de projet</span>
                    <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                      Contact & Transparence
                    </h2>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    Porté par M. AYISSOU Koffi Elom, ce projet d'utilité publique répond à un cahier des charges rigide de rigueur et d’intégrité financière.
                  </p>
                </div>

                {/* Team coordinates panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-brand-blue text-sm">Coordonnées directes</h4>
                  
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-brand-green" />
                        <span>Porteur : <strong className="text-slate-900">AYISSOU Koffi Elom</strong></span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-brand-blue" />
                        <span>Tél : <strong className="text-slate-900">91 55 12 95</strong></span>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard('91551295', 'phone')}
                        className="text-slate-400 hover:text-brand-blue transition-colors"
                        title="Copier le numéro"
                      >
                        {copiedField === 'phone' ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-blue" />
                        <span>Email : <strong className="text-slate-900">contact@ayissou-scolaire.tg</strong></span>
                      </div>
                      <button 
                        onClick={() => handleCopyToClipboard('contact@ayissou-scolaire.tg', 'email')}
                        className="text-slate-400 hover:text-brand-blue transition-colors"
                        title="Copier l'email"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formal Engagement Pledge requested */}
                <div className="bg-brand-blue text-white p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-brand-green uppercase tracking-wider font-bold">Engagement formel</span>
                  <p className="text-xs leading-relaxed text-slate-200">
                    “Chaque contribution sera utilisée exclusivement pour le développement et le déploiement de l’application.”
                  </p>
                </div>
              </div>

              {/* Right column contact dynamic forms */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-brand-blue">Envoyer une question ou expression d’intérêt</h3>
                  <p className="text-xs text-slate-500">
                    Vous êtes investisseur qualifié et souhaitez discuter avec notre équipe ? Écrivez-nous directement.
                  </p>

                  {contactSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 p-5 rounded-xl text-xs space-y-1"
                    >
                      <h5 className="font-bold flex items-center gap-1 text-brand-green">
                        <Check className="w-4 h-4" /> Message envoyé avec succès !
                      </h5>
                      <p className="text-slate-600">
                        Merci pour votre message. Koffi Elom et son service de communication vous répondront dans un délai de 24 à 48 heures.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Mme/M. Adzo"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Email</label>
                          <input 
                            type="email" 
                            required
                            placeholder="adresse@exemple.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-blue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Votre message</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Bonjour Koffi, je suis commerçant à Lomé et j'aimerais investir dans votre projet dès maintenant..."
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-brand-blue"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={contactSubmitting}
                        className="w-full py-3 bg-brand-blue hover:bg-brand-blue/95 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        {contactSubmitting ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="w-4 h-4 text-brand-green" />
                            <span>Envoyer ma requête sécurisée</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Constitution légale en cours d'enregistrement</span>
                  <span>Lomé, Togo</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* DYNAMIC CALL TO ACTION FINAL BANNER */}
        <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-brand-green border border-white/10">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin-slow" />
            </div>

            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 max-w-2xl mx-auto leading-relaxed">
              “Rejoignez-nous pour transformer l’éducation en Afrique. Votre investissement n’est pas seulement financier, il est social et durable.”
            </p>

            <div className="pt-2">
              <button 
                onClick={scrollToSimulator}
                className="px-8 py-4 bg-brand-green hover:bg-brand-green/90 text-slate-900 font-extrabold text-sm rounded-xl transition-all shadow-xl hover:shadow-2xl cursor-pointer"
              >
                Je participe
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-4 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-extrabold border border-slate-800">
              <span className="text-brand-green">S</span>T
            </div>
            <div>
              <span className="font-bold text-slate-300 text-sm block leading-none">SchoolTrack Afrique</span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">© 2026 AYISSOU Koffi Elom. Tous Droits Réservés.</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>Données cryptées SSL</span>
            <span>•</span>
            <span>Simulateur Sandbox local</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

