import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { 
  Trophy, Flame, Target, ChevronRight, Play,
  CheckCircle2, AlertCircle, GraduationCap, Lock,
  Zap, BookOpen, Network, BarChart3, Sparkles, ArrowRight
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const examSubjectMap = {
  'JEE':     { subjects: ['Physics', 'Chemistry', 'Mathematics'], icon: '⚡', color: '#8b5cf6' },
  'NEET':    { subjects: ['Physics', 'Chemistry', 'Biology'], icon: '🩺', color: '#3b82f6' },
  'MHT-CET': { subjects: ['Physics', 'Chemistry', 'Mathematics'], icon: '🎓', color: '#10b981' },
  'GATE':    { subjects: ['Core Subject', 'Aptitude', 'Mathematics'], icon: '⚙️', color: '#f59e0b' },
  'CAT':     { subjects: ['Quant', 'LRDI', 'Verbal'], icon: '📈', color: '#ec4899' },
  'UPSC':    { subjects: ['Polity', 'History', 'Geography', 'Economy'], icon: '🏛️', color: '#6366f1' },
}

const subjectColors = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'
]

const recentMistakes = [
  { topic: 'Circular Motion', error: 'Formula Confusion', date: '2h ago' },
  { topic: 'Cell Division', error: 'Mendelian Genetics Gap', date: '5h ago' },
  { topic: 'Optics', error: 'Sign Convention', date: 'Yesterday' },
]

export default function Dashboard() {
  const [userData, setUserData] = useState({ name: 'Aspirant', exam: 'JEE', isPremium: false, userId: null, email: null })
  const [requestStatus, setRequestStatus] = useState(null)
  const [requestingAccess, setRequestingAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { name: 'Physics', value: 65, color: '#8b5cf6' },
    { name: 'Chemistry', value: 80, color: '#3b82f6' },
    { name: 'Mathematics', value: 45, color: '#ec4899' },
  ])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const exam = session.user.user_metadata?.target_exam || 'JEE'
        setUserData({
          name: session.user.user_metadata?.full_name || 'Aspirant',
          exam,
          isPremium: localStorage.getItem('premium_unlocked') === 'true' || session.user.user_metadata?.is_premium || session.user.user_metadata?.subscription === 'premium' || false,
          userId: session.user.id,
          email: session.user.email
        })
        
        // Fetch request status
        const { data: reqData } = await supabase
          .from('premium_requests')
          .select('status')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          
        if (reqData) {
          setRequestStatus(reqData.status)
        }

        // Update stats based on exam
        const subjects = examSubjectMap[exam]?.subjects || ['Physics', 'Chemistry', 'Mathematics']
        setStats(subjects.slice(0, 3).map((s, i) => ({
          name: s, value: Math.floor(Math.random() * 40 + 50), color: subjectColors[i]
        })))
      }
      setLoading(false)
    }
    fetchUserData()
  }, [])

  const handleExamChange = async (newExam) => {
    setUserData(prev => ({ ...prev, exam: newExam }))
    const subjects = examSubjectMap[newExam]?.subjects || []
    setStats(subjects.slice(0, 3).map((s, i) => ({
      name: s, value: Math.floor(Math.random() * 40 + 50), color: subjectColors[i]
    })))
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase.auth.updateUser({ data: { target_exam: newExam } })
    }
    localStorage.setItem('current_target_exam', newExam)
  }

  const handleRequestAccess = async () => {
    setRequestingAccess(true)
    try {
      const { error } = await supabase
        .from('premium_requests')
        .insert([{ 
          user_id: userData.userId, 
          user_email: userData.email, 
          status: 'pending' 
        }])
      
      if (error) throw error
      setRequestStatus('pending')
      
      // Notify Admin secretly
      if (import.meta.env.VITE_WEB3FORMS_KEY) {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: import.meta.env.VITE_WEB3FORMS_KEY, 
            subject: `✨ New ConceptBridge Premium Request from ${userData.email}`,
            message: `User ${userData.email} just requested Premium Access!\n\nYou can approve them by updating their status in Supabase or your Admin Portal!`,
          })
        }).catch(err => console.log("Email notification failed secretly:", err));
      }

      alert('Premium access request sent directly to admin! It will be reviewed shortly.')
    } catch (error) {
      console.error('Error requesting access:', error)
      alert('Failed to send request. ' + error.message)
    } finally {
      setRequestingAccess(false)
    }
  }

  const subjects = examSubjectMap[userData.exam]?.subjects || ['Physics', 'Chemistry', 'Mathematics']

  if (loading) return null

  return (
    <div className="space-y-12 page-transition pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-brand-primary/10 to-transparent p-8 rounded-3xl border border-brand-primary/10 relative overflow-hidden">
        <div className="z-10">
          <p className="text-brand-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">Aspirant Dashboard</p>
          <h1 className="text-4xl md:text-5xl font-black font-sans tracking-tight mb-2">
            Welcome back, <span className="gradient-text">{userData.name}!</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 text-[10px] font-black bg-brand-primary text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-brand-primary/20">
              <GraduationCap size={14} /> Preparing for {userData.exam}
            </div>
            <div className="h-1 w-1 bg-text-muted rounded-full"></div>
            <p className="text-text-muted text-sm font-medium flex items-center gap-2">
              <Flame className="text-orange-500 fill-orange-500" size={16} /> 4 Day Streak
            </p>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] -z-0"></div>
      </div>

      {/* Mission + Subjects Combined */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tight">Select your <span className="gradient-text">Mission</span></h2>
          <p className="text-text-muted font-medium">Choose your target exam — subjects appear below instantly.</p>
        </div>

        {/* Exam Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(examSubjectMap).map(([exam, info], i) => (
            <motion.button
              key={exam}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleExamChange(exam)}
              className={`glass-card p-6 flex flex-col items-center gap-4 text-center transition-all ${
                userData.exam === exam 
                ? 'border-brand-primary bg-brand-primary/5 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                : 'hover:border-brand-primary/30'
              }`}
            >
              <div className={`text-3xl`}>{info.icon}</div>
              <div>
                <p className="font-bold text-sm tracking-tight">{exam}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Entrance</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Subject Cards — appear when exam is selected */}
        <AnimatePresence mode="wait">
          <motion.div
            key={userData.exam}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {examSubjectMap[userData.exam]?.icon} {userData.exam} — <span className="text-brand-primary">Study Material</span>
                </h2>
                <p className="text-text-muted text-sm mt-1">Select a subject to access premium notes, books, and YouTube lectures.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {subjects.map((subject, i) => (
                <motion.div
                  key={subject + userData.exam}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card p-6 hover:border-brand-primary/40 transition-all group relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer"
                  onClick={() => navigate(`/study/${userData.exam}/${subject}`)}
                >
                  <div className="absolute top-[-10%] right-[-10%] p-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                    <BookOpen size={100} />
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white text-lg font-black"
                      style={{ backgroundColor: subjectColors[i] || '#8b5cf6' }}>
                      {subject.charAt(0)}
                    </div>
                    <h3 className="text-lg font-black mb-1 group-hover:text-brand-primary transition-colors">{subject}</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{userData.exam} • Study Hub</p>
                  </div>
                  <button
                    className="w-full py-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-black group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all flex items-center justify-center gap-2"
                    onClick={(e) => { e.stopPropagation(); navigate(`/study/${userData.exam}/${subject}`) }}
                  >
                    STUDY MATERIAL <BookOpen size={12} className="fill-current" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom Grid: Premium Features + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-text-muted uppercase tracking-widest px-2">Free Features</h3>
              <div className="space-y-3">
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><Target size={20} /></div>
                  <div><p className="text-sm font-bold">Limited Mock Tests</p><p className="text-[10px] text-text-muted">3 tests per day</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><CheckCircle2 size={20} /></div>
                  <div><p className="text-sm font-bold">Basic Explanations</p><p className="text-[10px] text-text-muted">Text-based solutions</p></div>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-brand-primary uppercase tracking-widest">Premium Features</h3>
                <Zap size={14} className="text-brand-primary fill-brand-primary" />
              </div>
              <div className="grid grid-cols-1 gap-3 relative">
                {!userData.isPremium && (
                  <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-[var(--color-surface-card)] flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] space-y-3">
                    <div className="p-3 bg-brand-primary/20 rounded-full text-brand-primary shadow-xl"><Lock size={20} /></div>
                    <button 
                      onClick={handleRequestAccess}
                      disabled={requestStatus === 'pending' || requestingAccess}
                      className="px-6 py-2 bg-brand-primary text-white text-xs font-black rounded-full shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {requestStatus === 'pending' ? 'REQUEST PENDING...' : 'REQUEST PREMIUM ACCESS'}
                    </button>
                    {requestStatus === 'rejected' && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Previous Request Rejected</p>
                    )}
                  </div>
                )}
                <div className={`glass-card p-4 flex items-center gap-4 ${!userData.isPremium ? 'opacity-40' : ''}`}>
                  <Network size={20} className="text-brand-primary" /><p className="text-sm font-bold">Concept Graph</p>
                </div>
                <div className={`glass-card p-4 flex items-center gap-4 ${!userData.isPremium ? 'opacity-40' : ''}`}>
                  <BarChart3 size={20} className="text-brand-secondary" /><p className="text-sm font-bold">Advanced Analytics</p>
                </div>
                <Link to="/ai-notes" className={`glass-card p-4 flex items-center gap-4 hover:border-brand-primary/30 transition-all ${!userData.isPremium ? 'opacity-40 pointer-events-none' : ''}`}>
                  <Sparkles size={20} className="text-amber-500" />
                  <div><p className="text-sm font-bold">AI Smart Notes</p><p className="text-[9px] text-text-muted">Conceptual &amp; Easy notes</p></div>
                </Link>
                <div className={`glass-card p-4 flex items-center gap-4 ${!userData.isPremium ? 'opacity-40' : ''}`}>
                  <Zap size={20} className="text-orange-500" /><p className="text-sm font-bold">AI Foundation Tutor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6 flex flex-col items-center">
            <h3 className="font-bold text-lg font-sans self-start">Overall Accuracy</h3>
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black">{Math.round(stats.reduce((a, b) => a + b.value, 0) / stats.length)}%</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Score</p>
              </div>
            </div>
            <div className="w-full space-y-3">
              {stats.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="font-bold">{s.name}</span>
                  </div>
                  <span className="text-text-muted">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 space-y-6">
            <h3 className="font-bold flex items-center gap-2"><AlertCircle size={20} className="text-brand-accent" /> Critical Focus</h3>
            <div className="space-y-4">
              {recentMistakes.map((mistake, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-[var(--color-surface-card-hover)] p-2 rounded-xl transition-colors">
                  <div>
                    <p className="text-sm font-bold">{mistake.topic}</p>
                    <p className="text-[10px] text-brand-accent font-medium uppercase tracking-wider">{mistake.error}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20 relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] p-8 opacity-20 group-hover:scale-110 transition-transform">
              <Trophy size={80} className="text-brand-primary" />
            </div>
            <h3 className="font-bold text-brand-primary mb-1 text-sm tracking-tight">Level Up Incoming</h3>
            <p className="text-xs font-medium mb-4 pr-12 text-text-muted">Analyze 5 more mistakes to unlock "Concept Specialist" badge.</p>
            <div className="h-1.5 bg-[var(--color-input-bg)] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-brand-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"></motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
