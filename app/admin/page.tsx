-'('(  LayoutDashboard, FileQuestion, Users, FileText,
  CreditCard, Sparkles, CalendarClock, TableProperties,
  LogOut
} from 'lucide-react';

// Sidebar Navigation Configuration
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
  { id: 'aigen', label: 'AI Generate', icon: Sparkles },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'scheduled', label: 'Scheduled', icon: CalendarClock },
  { id: 'csvimport', label: 'CSV Import', icon: TableProperties },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Authenticate and Verify Admin Privileges
  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-white/40 backdrop-blur-xl border-r border-white/60 p-6 flex flex-col min-h-screen">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-2xl font-black text-emerald-950 font-serif tracking-tight">Admin Panel</h1>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">Gyankunj Academy</p>
        </div>

        <nav className="flex-1 space-y-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20' 
                    : 'text-gray-500 hover:bg-white/60 hover:text-emerald-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/60 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        
        {/* OVERVIEW TAB (Live Mission Control) */}
        {activeTab === 'overview' && <AdminOverview />}

        {/* QUIZZES TAB (Curriculum Manager) */}
        {activeTab === 'quizzes' && <QuizManager />}

        {/* AI GENERATE TAB */}
        {activeTab === 'aigen' && <AiQuizBuilder />}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && <ResourceManager />}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && <StudentsManager />}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && <PaymentsManager />}

        {/* CSV IMPORT TAB */}
        {activeTab === 'csvimport' && <CsvImporter />}

        {/* SCHEDULED TAB (Placeholder) */}
        {activeTab === 'scheduled' && (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-900/20 rounded-[2rem]">
            <CalendarClock className="w-16 h-16 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold text-emerald-950 mb-2 font-serif">Live Events Module</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              This module will handle the logic for setting up live, time-gated "All India Mock Tests".
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

