import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_RECENT_BACKERS, 
  CONTRIBUTION_TIERS, 
  TESTIMONIES,
  FUNDING_PROGRESS,
  LAUNCH_COST
} from './data';
import { Backer } from './types';

// Imported modular components
import InteractiveSchema from './components/InteractiveSchema';
import BudgetChart from './components/BudgetChart';
import ContributionWidget from './components/ContributionWidget';
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
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // Simulated QA & Contact forms state
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactMsg, setContactMsg] = useState<string>('');
  const [contactSubmitting, setContactSubmitting] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // Compute stats
  const backersCount = 12 + (backersList.length - INITIAL_RECENT_BACKERS.length);
  const rawPercentage = (raisedAmount / CAMPAGNE_GOAL) * 100;
  const percentage = Math.min(100, Math.round(rawPercentage * 10) / 10);

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const launchCost = LAUNCH_COST;
  const launchCostShare = Math.round((launchCost / CAMPAGNE_GOAL) * 100);

  // Callback to handle successful simulation donation
  const handleContributionAdded = (amount: number, name: string) => {
    setRaisedAmount((prev) => prev + amount);
    
    // Add to top of backer ticker
    const newBacker: Backer = {
      id: `backer-custom-${Date.now()}`,
      name,
      amount,
      time: "À l'instant",
      badge: amount >= 150000 ? 'Platine' : amount >= 50000 ? 'Or' : amount >= 15000 ? 'Argent' : 'Bronze',
      isCustom: true
    };
    
    setBackersList((prev) => [newBacker, ...prev]);
    setHasContributed(true);
    
    // Auto clear alert
    setTimeout(() => {
      setHasContributed(false);
    }, 8000);
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
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

  // Scroll smoothly to checkout component
  const scrollToSimulator = () => {
    const el = document.getElementById('simulateur');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              aria-expanded={showMobileMenu}
              aria-label="Ouvrir le menu mobile"
            >
              <span className="text-xl font-bold">☰</span>
            </button>
            <button 
              onClick={scrollToSimulator}
              className="px-5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-white hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Je participe</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className={`lg:hidden ${showMobileMenu ? 'block' : 'hidden'} border-t border-slate-200 bg-white/95`}> 
          <nav className="space-y-2 px-4 py-4">
            <a href="#probleme" onClick={() => setShowMobileMenu(false)} className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Le Problème</a>
            <a href="#solution" onClick={() => setShowMobileMenu(false)} className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Notre Solution</a>
            <a href="#pourquoi" onClick={() => setShowMobileMenu(false)} className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Pourquoi Investir ?</a>
            <a href="#budget" onClick={() => setShowMobileMenu(false)} className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Financement</a>
            <a href="#impact" onClick={() => setShowMobileMenu(false)} className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Témoignages</a>
            <a href="#contact" onClick={() => setShowMobileMenu(false)} className="block rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Transparence & Contact</a>
          </nav>
        </div>
      </header>

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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
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
                    <div>
                      <span className="block text-xl font-bold text-slate-100 font-mono">{backersCount}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">Personnes ayant investi</span>
                    </div>
                  </div>

                  {/* Instant shortcut trigger */}
                  <button 
                    onClick={scrollToSimulator}
                    className="w-full py-3.5 bg-brand-green hover:bg-brand-green/95 text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-md block text-center"
                  >
                    Investisser dès maintenant
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
            <div className="mb-12 text-center">
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

                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-slate-500 text-xs block">Coût estimatif de lancement :</span>
                  <span className="text-2xl font-black text-brand-blue block">{formatFCFA(launchCost)}</span>
                  <span className="text-xs text-slate-500 block">{launchCostShare}% de l'objectif total estimé</span>
                  <span className="text-xs text-brand-green font-medium block">Couvre toute la phase pré-SaaS et pilotes d’écoles</span>
                </div>

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

        {/* SECTION 5: APPEL A L'ACTION INTERACTIF (SIMULATEUR DE DON) */}
        <section id="simulateur" className="py-20 bg-white Scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-widest block">Investissement Participatif</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue tracking-tight leading-snug">
                Faites un test et simulez un soutien au projet
              </h2>
              <div className="w-12 h-1 bg-brand-blue mx-auto rounded-full" />
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Utilisez le formulaire interactif ci-dessous pour choisir votre formule ou configurer un don personnalisé. En simulant un paiement, vous mettez à jour instantanément la campagne globale de SchoolTrack !
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              
              {/* Left Grid: Contribution Widget (Simulation Workspace) */}
              <div className="lg:col-span-7">
                <ContributionWidget 
                  onContributionAdded={handleContributionAdded}
                  totalRaised={raisedAmount}
                  totalGoal={CAMPAGNE_GOAL}
                  backersList={backersList}
                />
              </div>

              {/* Right Grid: Live Recent Supporters lists */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col h-full space-y-6">
                  
                  <div>
                    <h3 className="text-lg font-bold text-brand-blue">Soutiens Récents de la Campagne</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Défilement dynamique des contributeurs d'honneur du projet.
                    </p>
                  </div>

                  {/* Backer List Ticker Scrollable */}
                  <div className="flex-grow overflow-y-auto space-y-3.5 max-h-[380px] pr-2.5">
                    <AnimatePresence initial={false}>
                      {backersList.map((backer) => (
                        <motion.div
                          key={backer.id}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                            backer.isCustom 
                              ? 'bg-emerald-50 border-brand-green/35' 
                              : 'bg-white border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-full ${backer.isCustom ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 text-brand-blue'}`}>
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{backer.name}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                <span className="text-slate-500">{backer.time}</span>
                                <span>•</span>
                                <span className={`px-1 rounded ${
                                  backer.badge === 'Platine' || backer.amount >= 150000
                                    ? 'bg-blue-100 text-blue-800' 
                                    : backer.badge === 'Or' || backer.amount >= 50000
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-slate-100 text-slate-600'
                                } font-semibold`}>
                                  {backer.badge || (backer.amount >= 50000 ? 'Or' : 'Soutien')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-xs font-black text-brand-blue block">
                              +{formatFCFA(backer.amount)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Motivational footer banner */}
                  <div className="bg-brand-blue/5 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2.5">
                    <p className="font-semibold text-brand-blue flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-brand-green" />
                      Que simule ce widget ?
                    </p>
                    <p className="leading-relaxed text-[11px]">
                      Il s'agit d'une simulation interactive de financement. Elle modifie les variables d'affichage de la plateforme en temps réel pour démontrer son ergonomie et sa compatibilité avec les moyens de paiement d’Afrique de l’Ouest.
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 6: IMPACT SOCIAL & TEMOIGNAGES */}
        <section id="impact" className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest block">Paroles de d'Acteurs</span>
              <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight leading-snug">
                L’impact social prévu sur le terrain
              </h2>
              <div className="w-12 h-1 bg-brand-green mx-auto rounded-full" />
              <p className="text-slate-600 text-sm leading-relaxed">
                Retours d'enseignants, de chefs d'établissements administratifs, de parents d'élèves engagés dans nos zones d'études préparatoires de pré-lancement.
              </p>
            </div>

            {/* Testimonials cards lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIES.map((testy) => (
                <div key={testy.id} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
                  
                  {/* Visual quote mark decor */}
                  <span className="absolute -top-3 -left-1 text-7xl text-brand-green/10 font-serif leading-none pointer-events-none">“</span>
                  
                  <blockquote className="text-slate-600 text-xs leading-relaxed italic relative z-10 mb-6">
                    {testy.quote}
                  </blockquote>

                  <div className="flex items-center gap-3.5 border-t border-slate-100 pt-4">
                    <img 
                      src={testy.avatar} 
                      alt={testy.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="block font-bold text-slate-800 text-xs leading-none">{testy.name}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                        {testy.role} — <strong className="text-slate-500 font-semibold">{testy.location}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Icons indicators summary as requested */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-center">
              <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-6">Objectifs qualitatifs mesurés par SchoolTrack</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <span className="text-3xl block">📱</span>
                  <h5 className="font-bold text-slate-800 text-sm">Suivi en temps réel</h5>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    Diffusion d'alertes instantanées par SMS et passerelles de messageries pour toute absence indésirée détectée.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-3xl block">👨‍👩‍👧</span>
                  <h5 className="font-bold text-slate-800 text-sm">Implication parentale renforcée</h5>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    Connexion permanente et fluide avec l'école : justificatifs, bulletins, cahiers d'évaluation à portée d'un clic.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-3xl block">🎓</span>
                  <h5 className="font-bold text-slate-800 text-sm">Garantie de réussite scolaire</h5>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    Réaction immédiate de la famille face aux difficultés scolaires, réduisant le taux d'échec de façon quantifiable d'ici la fin du trimestre.
                  </p>
                </div>
              </div>
            </div>

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
                    Vous êtes directeur d’établissement, investisseur qualifié ou parent d’élève et souhaitez discuter du calendrier de déploiement ? Écrivez-nous directement.
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
                          placeholder="Bonjour Koffi, je suis directeur de collège à Lomé et j'aimerais équiper nos 400 élèves dès la prochaine rentrée..."
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
