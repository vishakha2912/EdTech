import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Play, BookOpen, GraduationCap, Sparkles, RefreshCw, History, X, ChevronRight, CheckCircle2, Target } from 'lucide-react'

const examSubjectMap = {
  'JEE':     { subjects: ['Physics', 'Chemistry', 'Mathematics'], icon: '⚡', color: '#8b5cf6' },
  'NEET':    { subjects: ['Physics', 'Chemistry', 'Biology'], icon: '🩺', color: '#3b82f6' },
  'MHT-CET': { subjects: ['Physics', 'Chemistry', 'Mathematics'], icon: '🎓', color: '#10b981' },
  'GATE':    { subjects: ['Core Subject', 'Aptitude', 'Mathematics'], icon: '⚙️', color: '#f59e0b' },
  'CAT':     { subjects: ['Quant', 'LRDI', 'Verbal'], icon: '📈', color: '#ec4899' },
  'UPSC':    { subjects: ['Polity', 'History', 'Geography', 'Economy'], icon: '🏛️', color: '#6366f1' },
}

const subjectColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1']

export default function ExamSelector() {
  const navigate = useNavigate()
  const [exam, setExam] = useState('JEE')
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [historyData, setHistoryData] = useState([])

  useEffect(() => {
    const fetchExam = async () => {
      // Try Supabase session first
      const { data: { session } } = await supabase.auth.getSession()
      const userExam =
        session?.user?.user_metadata?.target_exam ||
        localStorage.getItem('current_target_exam') ||
        'JEE'
      setExam(userExam)
      setLoading(false)
    }
    fetchExam()
    
    // Load History
    const hData = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
    setHistoryData(hData)
  }, [])

  const subjects = examSubjectMap[exam]?.subjects || ['Physics', 'Chemistry', 'Mathematics']
  const examInfo = examSubjectMap[exam]

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 page-transition">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary/10 to-transparent p-8 rounded-3xl border border-brand-primary/10 relative overflow-hidden">
        <div className="z-10 relative">
          <p className="text-brand-primary font-bold text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <GraduationCap size={14} /> Practice Zone
          </p>
          <h1 className="text-4xl font-black font-sans tracking-tight mb-2">
            {examInfo?.icon} {exam} — <span className="gradient-text">Pick a Subject</span>
          </h1>
          <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-4 mt-4">
            <p className="text-text-muted font-medium text-sm max-w-md leading-relaxed">
              Select a subject below to start your personalized **10-Question non-repeating mock test**.
              Your exam is set to <span className="text-brand-primary font-bold">{exam}</span>.
            </p>
            <button 
              onClick={() => setShowHistory(true)}
              className="px-6 py-3 rounded-xl bg-brand-primary/10 border border-brand-primary text-brand-primary text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 shrink-0"
            >
              <History size={16} /> Past Attempts
            </button>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] -z-0" />
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map((subject, i) => (
          <motion.div
            key={subject}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-8 hover:border-brand-primary/40 transition-all group relative overflow-hidden flex flex-col justify-between h-52 cursor-pointer"
            onClick={() => navigate(`/practice/${exam}/${subject}`)}
          >
            {/* Background icon */}
            <div className="absolute top-[-10%] right-[-10%] p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <BookOpen size={110} />
            </div>

            <div>
              {/* Subject initial badge */}
              <div
                className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-white text-xl font-black shadow-lg"
                style={{ backgroundColor: subjectColors[i % subjectColors.length] }}
              >
                {subject.charAt(0)}
              </div>
              <h3 className="text-xl font-black mb-1 group-hover:text-brand-primary transition-colors">
                {subject}
              </h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {exam} • AI-Powered Mock Test
              </p>
            </div>

            <button
              className="w-full py-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-black group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all flex items-center justify-center gap-2"
              onClick={(e) => { e.stopPropagation(); navigate(`/practice/${exam}/${subject}`) }}
            >
              START TEST <Play size={12} className="fill-current" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card max-w-3xl w-full p-8 relative overflow-hidden flex flex-col max-h-[85vh] border-brand-primary/30"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black font-sans tracking-tight flex items-center gap-2">
                <History className="text-brand-primary" /> Past Attempt <span className="gradient-text">History</span>
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {historyData.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-50 space-y-4">
                  <History size={48} className="text-text-muted" />
                  <p className="font-bold uppercase tracking-widest text-text-muted">No Practice History Yet</p>
                </div>
              ) : (
                historyData.map((attempt, index) => (
                  <div key={index} className="bg-[var(--color-surface-card)] border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="text-[10px] font-black bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full uppercase tracking-wider">{attempt.exam}</span>
                          <span className="text-[10px] font-bold text-text-muted">{new Date(attempt.date).toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-black">{attempt.subject} Mock Test</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{attempt.score}<span className="text-sm text-text-muted">pts</span></p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--color-border)]">
                       <div className="text-center">
                          <p className="text-sm font-black text-green-400">{attempt.accuracy}%</p>
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Accuracy</p>
                       </div>
                       <div className="text-center border-x border-[var(--color-border)]">
                          <p className="text-sm font-black text-brand-secondary">{Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</p>
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Time</p>
                       </div>
                       <div className="text-center">
                          <p className="text-sm font-black text-red-400">{attempt.mistakesCount}</p>
                          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Mistakes</p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Note */}
      <div className="glass-card p-5 flex items-center gap-4 border-brand-primary/10">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-brand-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">AI-Generated Questions</p>
          <p className="text-xs text-text-muted font-medium">
            Each session generates fresh questions using Gemini AI, personalized for <span className="text-brand-primary font-bold">{exam}</span>.
            Go to <span className="font-bold">Dashboard</span> to switch your target exam.
          </p>
        </div>
      </div>
    </div>
  )
}
