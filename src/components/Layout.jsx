import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/ThemeContext'
import { 
  LayoutDashboard, 
  GraduationCap, 
  LineChart, 
  Network, 
  MessageSquare, 
  LogOut,
  Zap,
  User as UserIcon,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

const SidebarLink = ({ to, icon: Icon, children, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-brand-primary/20 text-brand-primary shadow-lg border border-brand-primary/20' 
        : 'hover:bg-[var(--color-surface-card-hover)] text-text-muted hover:text-text-primary'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{children}</span>
  </Link>
)

export default function Layout({ session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [requestStatus, setRequestStatus] = useState('none')
  
  useEffect(() => {
    if (session?.user) {
      checkRequestStatus()
    }
  }, [session])

  const checkRequestStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_requests')
        .select('status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (data) {
        setRequestStatus(data.status)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRequestPremium = async () => {
    try {
      setRequestStatus('pending')
      const { error } = await supabase
        .from('premium_requests')
        .insert([{
          user_id: session.user.id,
          user_email: session.user.email,
          status: 'pending'
        }])
        
      if (error) {
        setRequestStatus('none')
        alert('Failed to request access: ' + error.message)
        return
      }

      // Send silent email notification to Host/Admin!
      // To activate: replace YOUR_ACCESS_KEY with a free key from web3forms.com
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY, 
          subject: `✨ New ConceptBridge Premium Request from ${session.user.email}`,
          message: `User ${session.user.email} just requested Premium Access!\n\nYou can approve them by updating their status in Supabase or your Admin Portal!`,
        })
      }).catch(err => console.log("Email notification failed secretly:", err));

    } catch (err) {
      console.error(err)
      setRequestStatus('none')
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('demo_mode')
    await supabase.auth.signOut()
    navigate('/')
    window.location.reload()
  }

  const isPremium = localStorage.getItem('premium_unlocked') === 'true' || session?.user?.user_metadata?.subscription === 'premium'
  const isAdmin = session?.user?.email === 'admin@conceptbridge.ai' || session?.user?.email?.includes('admin')

  return (
    <div className="flex min-h-screen text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-card m-4 rounded-3xl flex flex-col p-6 space-y-8 h-[calc(100vh-2rem)] sticky top-4">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-xl shadow-brand-primary/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="text-xl font-bold font-sans tracking-tight">Concept<span className="text-brand-primary">Bridge</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} active={location.pathname === '/dashboard'}>Dashboard</SidebarLink>
          <SidebarLink to="/exams" icon={GraduationCap} active={location.pathname === '/exams'}>Practice</SidebarLink>
          <SidebarLink to="/analytics" icon={LineChart} active={location.pathname === '/analytics'}>Analytics</SidebarLink>
          <SidebarLink to="/graph" icon={Network} active={location.pathname === '/graph'}>Concept Map</SidebarLink>
          <SidebarLink to="/chat" icon={MessageSquare} active={location.pathname === '/chat'}>AI Tutor</SidebarLink>
          {isAdmin && (
            <SidebarLink to="/admin" icon={UserIcon} active={location.pathname === '/admin'}>Admin Area</SidebarLink>
          )}
        </nav>

        <div className="pt-4 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Theme</span>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-brand-primary" />
              )}
            </button>
          </div>

          {!isPremium && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border border-brand-primary/20">
              <p className="text-sm font-semibold mb-2">Upgrade to Pro</p>
              <p className="text-xs text-text-muted mb-3 leading-relaxed">Unlock deep AI reasoning and the concept bridge graph.</p>
              
              {requestStatus === 'pending' ? (
                <button disabled className="w-full bg-yellow-500/20 text-yellow-500 py-2 rounded-lg text-sm font-medium cursor-not-allowed">Requested...</button>
              ) : requestStatus === 'rejected' ? (
                 <button onClick={handleRequestPremium} className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded-lg text-sm font-medium transition-colors">Request Again</button>
              ) : (
                <button onClick={handleRequestPremium} className="w-full primary-btn py-2 text-sm">Request Access</button>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-3 p-2 group hover:bg-[var(--color-surface-card-hover)] rounded-xl transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-card)] flex items-center justify-center group-hover:bg-brand-primary/20">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-text-muted truncate">{session?.user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
    </div>
  )
}
