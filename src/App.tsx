import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Download, Share2, ArrowLeft, Globe, Plus, Trash2, Edit3, Save, X, Settings, Sparkles, Loader2, FileText, LogIn, LogOut, User as UserIcon, Database, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { countries } from './mockData';
import { Summary, Category, News, UserProfile, Country } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateSummaryPDF } from './services/pdfService';
import { suggestCategoryAndSummary } from './services/geminiService';
import { auth, signInWithGoogle, logout, syncUserProfile, getSummaries, getNewsForSummary, createSummary, createNews } from './services/firebaseService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { seedDemoData } from './services/demoDataService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

function Header({ onHome, onAdmin, currentView, user, userProfile, onLogin, onLogout }: {
  onHome: () => void;
  onAdmin: () => void;
  currentView: string;
  user: User | null;
  userProfile: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isManager = userProfile?.role === 'admin' || userProfile?.role === 'editor';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-line">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => { onHome(); setMobileOpen(false); }}>
          <div className="w-8 h-8 bg-brand-dark rounded-sm flex items-center justify-center text-white font-bold text-lg">A</div>
          <div>
            <h1 className="text-sm font-bold font-serif leading-tight text-brand-dark">Síntese de Imprensa</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-bold">Embassy of Angola</p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
          <button onClick={onHome} className={cn("transition-colors py-1 px-2 border-b-2", currentView === 'dashboard' ? "text-brand-dark border-brand-gold" : "border-transparent hover:text-brand-dark")}>
            Capa
          </button>
          <button className="hover:text-brand-dark border-b-2 border-transparent py-1 px-2 transition-colors">Arquivo</button>
          <button className="hover:text-brand-dark border-b-2 border-transparent py-1 px-2 transition-colors">Países</button>
          {user && isManager && (
            <button onClick={onAdmin} className={cn("transition-colors flex items-center gap-2 py-1 px-2 border-b-2", currentView === 'admin' ? "text-brand-dark border-brand-gold" : "border-transparent hover:text-brand-dark")}>
              <Settings className="w-3.5 h-3.5" /> Gestão
            </button>
          )}
          <div className="border-l border-brand-line h-4 mx-2" />
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-brand-dark leading-none">{user.displayName}</span>
                <button onClick={onLogout} className="text-[9px] text-slate-400 hover:text-rose-500 font-bold mt-1">Sair</button>
              </div>
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="" className="w-7 h-7 rounded border border-brand-line" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <button onClick={onLogin} className="px-4 py-2 bg-brand-dark text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
              Entrar
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-brand-line bg-white overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              <button onClick={() => { onHome(); setMobileOpen(false); }} className={cn("text-left py-2.5 px-3 rounded text-xs font-bold uppercase tracking-widest transition-colors", currentView === 'dashboard' ? "bg-brand-dark text-white" : "text-slate-600 hover:bg-slate-50")}>
                Capa
              </button>
              <button className="text-left py-2.5 px-3 rounded text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">Arquivo</button>
              <button className="text-left py-2.5 px-3 rounded text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">Países</button>
              {user && isManager && (
                <button onClick={() => { onAdmin(); setMobileOpen(false); }} className={cn("text-left py-2.5 px-3 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2", currentView === 'admin' ? "bg-brand-dark text-white" : "text-slate-600 hover:bg-slate-50")}>
                  <Settings className="w-3.5 h-3.5" /> Gestão
                </button>
              )}
              <div className="border-t border-brand-line my-2" />
              {user ? (
                <div className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="" className="w-7 h-7 rounded border border-brand-line" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-brand-dark">{user.displayName}</span>
                  </div>
                  <button onClick={() => { onLogout(); setMobileOpen(false); }} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Sair</button>
                </div>
              ) : (
                <button onClick={() => { onLogin(); setMobileOpen(false); }} className="py-2.5 px-3 bg-brand-dark text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all text-center">
                  Entrar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-brand-line py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        <div className="flex flex-col gap-2">
          <p>Portal Institucional de Sínteses de Imprensa</p>
          <p className="text-[9px] opacity-60">Embaixada da República de Angola</p>
        </div>
        <div className="flex items-center gap-8">
          <p>Contactos Diplomáticos</p>
          <p>© 2024</p>
        </div>
      </div>
    </footer>
  );
}

function CategoryTag({ category }: { category: Category }) {
  const styles: Record<Category, string> = {
    'Política': 'text-blue-600',
    'Economia': 'text-amber-600',
    'Sociedade': 'text-emerald-600',
    'Cultura': 'text-purple-600',
    'Saúde/IA': 'text-rose-600',
    'Meio Ambiente': 'text-cyan-600',
  };

  return (
    <span className={cn("tag bg-slate-50 border border-brand-line", styles[category] || 'text-slate-500')}>
      {category}
    </span>
  );
}

function SummaryCard({ summary, onClick }: { summary: Summary, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="news-card flex flex-col h-full cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-slate-100 rounded-sm overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-400 border border-brand-line">
            {summary.paisId.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{summary.paisNome}</span>
        </div>
        {summary.status !== 'Arquivo' && (
          <span className={cn(
            "status-pill",
            summary.status === 'Hoje' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          )}>
            {summary.status}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold leading-tight mb-3 group-hover:text-brand-gold transition-colors">
        {summary.tituloCapa}
      </h3>

      <div className="mt-auto pt-4 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {summary.categorias.slice(0, 3).map(cat => (
            <CategoryTag key={cat} category={cat} />
          ))}
        </div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          {summary.dataReferencia} · {summary.totalNoticias} matérias
        </div>
      </div>
    </motion.div>
  );
}

// --- Summary Creation Modal ---

function NewSummaryModal({ onClose, onSave, isSubmitting, countries }: {
  onClose: () => void;
  onSave: (data: Omit<Summary, 'id'>) => void;
  isSubmitting: boolean;
  countries: Country[];
}) {
  const allCategories: Category[] = ['Política', 'Economia', 'Sociedade', 'Cultura', 'Saúde/IA', 'Meio Ambiente'];
  const [paisId, setPaisId] = useState(countries[0]?.id || 'pt');
  const [paisNome, setPaisNome] = useState(countries[0]?.nome || 'Portugal');
  const [dataReferencia, setDataReferencia] = useState(() => new Date().toISOString().split('T')[0]);
  const [titulo, setTitulo] = useState('');
  const [status, setStatus] = useState<'Hoje' | 'Ontem' | 'Arquivo'>('Hoje');
  const [selectedCats, setSelectedCats] = useState<Category[]>(['Política']);

  const handlePaisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sel = countries.find(c => c.id === e.target.value);
    if (sel) { setPaisId(sel.id); setPaisNome(sel.nome); }
  };

  const toggleCat = (cat: Category) =>
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const formatDate = (iso: string) => {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  const autoTitle = () => {
    const country = countries.find(c => c.id === paisId);
    setTitulo(`Síntese de Imprensa — ${country?.nome || paisNome}, ${formatDate(dataReferencia)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-xl border border-brand-line shadow-2xl w-full max-w-lg p-8 z-10 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-serif font-black text-brand-dark">Nova Síntese</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Criar nova edição institucional</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">País</label>
              <select value={paisId} onChange={handlePaisChange}
                className="w-full px-3 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold bg-slate-50 text-xs font-bold"
              >
                {countries.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Data de Referência</label>
              <input type="date" value={dataReferencia} onChange={(e) => setDataReferencia(e.target.value)}
                className="w-full px-3 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Título da Capa</label>
              <button onClick={autoTitle} className="text-[9px] font-bold text-brand-gold hover:underline uppercase tracking-widest">Auto-gerar</button>
            </div>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Síntese de Imprensa — Portugal, 20 de Abril..."
              className="w-full px-4 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold bg-slate-50 text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Estado</label>
            <div className="flex gap-2">
              {(['Hoje', 'Ontem', 'Arquivo'] as const).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={cn("px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors",
                    status === s ? "bg-brand-dark text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Categorias <span className="text-slate-300">(seleccione as aplicáveis)</span></label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => (
                <button key={cat} onClick={() => toggleCat(cat)}
                  className={cn("px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors border",
                    selectedCats.includes(cat)
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "bg-white text-slate-500 border-brand-line hover:border-slate-300"
                  )}
                >{cat}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-brand-line">
          <button onClick={onClose}
            className="flex-1 py-3 rounded border border-brand-line text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => titulo && selectedCats.length > 0 && onSave({
              paisId, paisNome,
              dataReferencia: formatDate(dataReferencia),
              tituloCapa: titulo,
              status, categorias: selectedCats,
              totalNoticias: 0,
            })}
            disabled={isSubmitting || !titulo || selectedCats.length === 0}
            className="flex-1 py-3 rounded bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Criar Síntese
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main Application ---

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'reading' | 'admin'>('dashboard');
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Database States
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [summaryNews, setSummaryNews] = useState<News[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Form States (News)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Sociedade');
  const [selectedSummaryForNews, setSelectedSummaryForNews] = useState<string>('');

  // Form States (Summary)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSummaryModalOpen, setIsNewSummaryModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await syncUserProfile(currentUser);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadSummaries = async () => {
      setIsLoadingData(true);
      try {
        const data = await getSummaries();
        setSummaries(data);
        if (data.length > 0 && !selectedSummaryForNews) {
          setSelectedSummaryForNews(data[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadSummaries();
  }, []);

  const handleRead = async (summary: Summary) => {
    setSelectedSummary(summary);
    setIsLoadingData(true);
    try {
      const news = await getNewsForSummary(summary.id);
      setSummaryNews(news);
      setCurrentView('reading');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleHome = () => {
    setCurrentView('dashboard');
    setSelectedSummary(null);
    setSummaryNews([]);
  };

  const handleAdmin = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setCurrentView('admin');
    setSelectedSummary(null);
  };

  const handleDownloadPDF = (summary: Summary) => {
    // If we are in reading view, we already have the news
    if (selectedSummary?.id === summary.id && summaryNews.length > 0) {
      generateSummaryPDF(summary, summaryNews);
    } else {
      // Otherwise fetch temporarily
      getNewsForSummary(summary.id).then(news => {
        generateSummaryPDF(summary, news);
      });
    }
  };

  const handleAiSuggest = async () => {
    if (!formTitle || !formContent) return;
    setIsAiLoading(true);
    try {
      const suggestion = await suggestCategoryAndSummary(formTitle, formContent);
      setFormCategory(suggestion.category);
      setFormContent(suggestion.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateNews = async () => {
    if (!selectedSummaryForNews || !formTitle || !formContent) return;
    setIsSubmitting(true);
    try {
      await createNews({
        sinteseId: selectedSummaryForNews,
        titulo: formTitle,
        corpo: formContent,
        categoria: formCategory,
        metadata: {
          fonte: 'Diário Digital',
          periodicidade: 'Diária',
          genero: 'Informativo',
          formato: 'Digital',
          data: new Date().toLocaleDateString('pt-PT'),
          urlOriginal: ''
        },
        ordem: 0
      });
      // Clear form
      setFormTitle('');
      setFormContent('');
      alert("Notícia publicada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar notícia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsSubmitting(true);
    try {
      await seedDemoData();
      const data = await getSummaries();
      setSummaries(data);
      alert("Dados de demonstração gerados com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar dados de demonstração.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async (summary: Summary) => {
    const text = `${summary.tituloCapa} — ${summary.paisNome}, ${summary.dataReferencia}`;
    if (navigator.share) {
      try { await navigator.share({ title: summary.tituloCapa, text, url: window.location.href }); }
      catch { /* utilizador cancelou */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleCreateSummary = async (data: Omit<Summary, 'id'>) => {
    setIsSubmitting(true);
    try {
      const newSummary = await createSummary(data);
      setSummaries(prev => [newSummary, ...prev]);
      setIsNewSummaryModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar síntese. Verifique as permissões e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSummaries = useMemo(() => {
    return summaries.filter(s =>
      s.paisNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tituloCapa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categorias.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [summaries, searchQuery]);

  return (
    <div className="min-h-screen">
      <Header
        onHome={handleHome}
        onAdmin={handleAdmin}
        currentView={currentView}
        user={user}
        userProfile={userProfile}
        onLogin={signInWithGoogle}
        onLogout={logout}
      />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isAuthLoading || isLoadingData ? (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40"
            >
              <Loader2 className="w-12 h-12 text-brand-olive animate-spin mb-4" />
              <p className="text-zinc-500 font-serif italic">Carregando portal institucional...</p>
            </motion.div>
          ) : (
            <>
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-12">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Portal de Acompanhamento</p>
                <h2 className="text-3xl md:text-4xl font-serif font-black mb-4 tracking-tight leading-tight text-brand-dark">
                  Sínteses diárias de imprensa internacional
                </h2>
                <p className="text-slate-500 max-w-2xl text-base leading-relaxed">
                  Monitorização da cobertura mediática estrategicamente organizada para a missão diplomática.
                </p>
              </div>

              <div className="bg-white p-1 rounded border border-brand-line shadow-sm mb-12">
                <div className="flex flex-col md:flex-row gap-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar arquivo..." 
                      className="w-full pl-10 pr-4 py-3 text-sm text-brand-dark font-medium focus:outline-none placeholder:text-slate-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="md:px-6 py-3 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                    Pesquisar
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 border-t border-brand-line mt-0 overflow-x-auto no-scrollbar">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Histórico:</span>
                  <button className="text-[9px] font-bold px-3 py-1 rounded bg-slate-900 text-white uppercase tracking-widest whitespace-nowrap">Geral</button>
                  {countries.map(country => (
                    <button key={country.id} className="text-[9px] font-bold px-3 py-1 rounded border border-brand-line text-slate-500 hover:bg-slate-50 uppercase tracking-widest whitespace-nowrap transition-colors">
                      {country.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-16">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-dark">Últimas Sínteses Publicadas</h3>
                  <button className="text-xs font-bold text-brand-olive flex items-center gap-1 hover:underline">
                    Ver todas <ChevronDown className="w-3 h-3 -rotate-90" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSummaries.map(s => (
                    <SummaryCard key={s.id} summary={s} onClick={() => handleRead(s)} />
                  ))}
                </div>
                {filteredSummaries.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-sm text-slate-500 mb-1">Sem sínteses publicadas</p>
                    <p className="text-xs">
                      {searchQuery ? 'Nenhum resultado para essa pesquisa.' : 'Use o Painel de Gestão para publicar a primeira edição.'}
                    </p>
                  </div>
                )}
              </div>

              <section className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-black/5">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-dark">Arquivo Recente</h3>
                  <button className="text-xs font-bold text-brand-olive flex items-center gap-1 hover:underline">
                    Arquivo completo <ChevronDown className="w-3 h-3 -rotate-90" />
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredSummaries.map(s => (
                    <div key={`arch-${s.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-black/5 group hover:border-brand-olive/20 transition-colors">
                      <div>
                        <h4 className="font-bold text-sm text-brand-dark group-hover:text-brand-olive transition-colors">{s.paisNome} - {s.dataReferencia}</h4>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          {s.totalNoticias} notícias · {s.categorias.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        <button 
                          onClick={() => handleDownloadPDF(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-[10px] font-bold hover:bg-zinc-50 transition-colors"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                        <button 
                          onClick={() => handleRead(s)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-[10px] font-bold hover:bg-zinc-200 transition-colors"
                        >
                          Ler <ArrowLeft className="w-3 h-3 rotate-180" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={handleHome}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-brand-dark mb-8 text-xs font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar à listagem
              </button>

              <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                   <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em]">
                       {selectedSummary?.paisNome} · {selectedSummary?.dataReferencia}
                    </span>
                   </div>
                </div>
                <h1 className="text-3xl font-serif font-black mb-6 leading-tight text-brand-dark">
                  {selectedSummary?.tituloCapa}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-brand-line pb-8">
                  <span className="status-pill bg-slate-900 text-white">{selectedSummary?.status}</span>
                  <span>{selectedSummary?.totalNoticias} NOTÍCIAS CADASTRADAS</span>
                  <div className="flex gap-2">
                    {selectedSummary?.categorias.map(cat => <CategoryTag key={cat} category={cat} />)}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => selectedSummary && handleDownloadPDF(selectedSummary)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button
                    onClick={() => selectedSummary && handleShare(selectedSummary)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-brand-line text-[10px] font-bold uppercase tracking-widest rounded hover:bg-slate-50 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Partilhar
                  </button>
                </div>
              </header>

              <section className="bg-slate-50 border border-brand-line rounded-lg p-8 mb-16 shadow-sm">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-6">Matérias Nesta Edição</h4>
                <div className="space-y-4">
                  {summaryNews.map((n, i) => (
                    <div key={n.id} className="flex gap-4 group cursor-pointer border-b border-slate-200/50 pb-4 last:border-0 last:pb-0">
                      <span className="w-6 h-6 bg-brand-dark text-white text-[10px] font-bold flex items-center justify-center rounded-sm shrink-0">0{i + 1}</span>
                      <p className="text-xs font-bold text-brand-dark group-hover:text-brand-gold transition-colors leading-snug">{n.titulo}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="space-y-24">
                {summaryNews.map((n, i) => (
                  <article key={n.id} className="relative bg-white border border-brand-line p-8 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-brand-line">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                          {n.categoria}
                        </span>
                        <h3 className="text-2xl font-serif font-bold leading-tight text-brand-dark">
                          {n.titulo}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">
                        {n.metadata.data}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed text-sm mb-8">
                      {n.corpo}
                    </p>

                    <div className="mb-8">
                       <table className="meta-table w-full">
                        <tbody>
                          {[
                            ['Fonte', n.metadata.fonte, 'Género', n.metadata.genero],
                            ['Tiragem', n.metadata.tiragem, 'Periodicidade', n.metadata.periodicidade],
                            ['Formato', n.metadata.formato, 'Data', n.metadata.data],
                          ].map((row, idx) => (
                            <tr key={idx}>
                              <td className="meta-label">{row[0]}</td>
                              <td className="text-slate-600">{row[1]}</td>
                              <td className="meta-label">{row[2]}</td>
                              <td className="text-slate-600">{row[3]}</td>
                            </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>

                    <div className="flex justify-end items-center pt-4">
                      <a href={n.metadata.urlOriginal} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:underline">Aceder Artigo Original →</a>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-24 p-12 bg-zinc-100 rounded-3xl text-center border border-black/5">
                 <p className="text-zinc-500 font-medium mb-6">Esta síntese contém {selectedSummary?.totalNoticias} notícias no total</p>
                 <button 
                   onClick={() => selectedSummary && handleDownloadPDF(selectedSummary)}
                   className="flex items-center gap-2 px-8 py-4 bg-white rounded-xl border-2 border-brand-dark/10 text-sm font-black mx-auto hover:bg-brand-dark hover:text-white transition-all shadow-sm"
                 >
                   <Download className="w-5 h-5" /> Descarregar PDF completo
                 </button>
              </div>
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-2xl font-serif font-black mb-1 text-brand-dark">Painel de Gestão</h2>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest opacity-60">Administração de conteúdos institucionais</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSeedDemo}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3 text-brand-gold" />}
                    Gerar Dados Exemplo (3 Dias)
                  </button>
                  <button
                    onClick={() => setIsNewSummaryModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-dark text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nova Síntese
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {summaries.map(s => (
                  <div key={`adm-${s.id}`} className="bg-white p-6 rounded border border-brand-line flex items-center justify-between gap-6 hover:border-brand-gold/30 transition-all shadow-sm">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="status-pill bg-slate-100 text-slate-500">{s.paisNome}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.dataReferencia}</span>
                      </div>
                      <h3 className="font-bold text-sm text-brand-dark font-serif">{s.tituloCapa}</h3>
                      <div className="flex gap-4 mt-2">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.totalNoticias} matérias cadastradas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 border border-brand-line rounded text-slate-400 hover:text-brand-dark hover:bg-slate-50 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2.5 border border-rose-100 rounded text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick News Tool */}
              <div className="mt-12 bg-white rounded border border-brand-line p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notícia Rápida
                  </h4>
                  <button 
                    onClick={handleAiSuggest}
                    disabled={!formTitle || !formContent || isAiLoading}
                    className="flex items-center gap-2 px-4 py-2 border border-brand-gold/30 text-brand-gold rounded text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold/5 disabled:opacity-50 transition-all"
                  >
                    {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Sugerir com IA
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Título</label>
                      <input 
                        type="text" 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold bg-slate-50 text-sm font-medium" 
                        placeholder="Ex: Título da matéria..." 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Conteúdo</label>
                      <textarea 
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold bg-slate-50 text-sm font-medium min-h-[160px]" 
                        placeholder="Conteúdo..." 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Síntese</label>
                          <select 
                            value={selectedSummaryForNews}
                            onChange={(e) => setSelectedSummaryForNews(e.target.value)}
                            className="w-full px-3 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold appearance-none bg-slate-50 text-xs font-bold uppercase tracking-widest opacity-70"
                          >
                            {summaries.map(s => <option key={s.id} value={s.id}>{s.paisNome} - {s.dataReferencia}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Categoria</label>
                          <select 
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value as Category)}
                            className="w-full px-3 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold appearance-none bg-slate-50 text-xs font-bold uppercase tracking-widest opacity-70"
                          >
                            <option>Política</option>
                            <option>Economia</option>
                            <option>Sociedade</option>
                            <option>Cultura</option>
                            <option>Saúde/IA</option>
                            <option>Meio Ambiente</option>
                          </select>
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Metadados</label>
                        <input type="text" className="w-full px-4 py-3 rounded border border-brand-line focus:outline-none focus:border-brand-gold bg-slate-50 text-sm font-medium" placeholder="Ex: Fonte · Tiragem · Periodicidade" />
                     </div>
                     <div className="pt-4 flex gap-2">
                        <button 
                          onClick={handleCreateNews}
                          disabled={isSubmitting || !selectedSummaryForNews}
                          className="flex-1 py-3.5 bg-brand-dark text-white rounded font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          PUBLICAR AGORA
                        </button>
                        <button className="px-4 py-3.5 bg-slate-100 text-slate-400 rounded hover:bg-slate-200 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {isNewSummaryModalOpen && (
          <NewSummaryModal
            onClose={() => setIsNewSummaryModalOpen(false)}
            onSave={handleCreateSummary}
            isSubmitting={isSubmitting}
            countries={countries}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
