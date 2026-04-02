import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { generateDashboardAnalytics } from '../lib/ai'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { 
  LineChart as LineChartIcon, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Flame,
  Target,
  ArrowUpRight,
  TrendingUp,
  History,
  Info,
  Sparkles,
  RefreshCw,
  BookMarked,
  Layout
} from 'lucide-react'

// Default fallback data if API is still loading or fails
const fallbackData = {
  progressionData: [
    { name: 'Mon', score: 65, avg: 72 },
    { name: 'Tue', score: 58, avg: 70 },
    { name: 'Wed', score: 82, avg: 71 },
    { name: 'Thu', score: 75, avg: 73 },
    { name: 'Fri', score: 85, avg: 74 },
    { name: 'Sat', score: 92, avg: 75 },
    { name: 'Sun', score: 88, avg: 76 }
  ],
  subjectData: [
    { name: 'Physics', value: 45, color: '#8b5cf6' },
    { name: 'Biology', value: 35, color: '#3b82f6' },
    { name: 'Chemistry', value: 20, color: '#ec4899' }
  ],
  weakTopics: [
    { topic: 'Circular Motion', accuracy: 42, trends: -5 },
    { topic: 'Fluid Mechanics', accuracy: 48, trends: 12 },
    { topic: 'Cell Division', accuracy: 52, trends: -2 }
  ],
  stats: {
    correctAnswers: 184,
    percentile: 94.2,
    streak: "4 Days",
    avgTimePerQ: "1 min 12s"
  },
  urgentAttention: {
    topic: "Physics: Circular Motion",
    drop: 5,
    mastery: 42
  },
  aiAdvice: "Identify missing prerequisites and bridge concept gaps with our AI tutor tailored for Indian competitive exams."
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAIAnalytics = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userExam = session?.user?.user_metadata?.target_exam || 'JEE'
      
      const historyLog = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
      
      // Call Gemini for entirely dynamic dashboard numbers based on practice history
      const generatedData = await generateDashboardAnalytics(userExam, [], historyLog)
      
      if (generatedData) {
        setData(generatedData)
      } else {
        setData(fallbackData)
      }
    } catch (err) {
      console.error(err)
      setData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-20 glass-card">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-brand-primary"></div>
          <Sparkles size={24} className="absolute inset-0 m-auto text-brand-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Compiling Diagnostics</h2>
        <p className="text-text-muted text-sm font-medium animate-pulse">Gemini AI is generating dynamic mock insights...</p>
      </div>
    )
  }

  const payload = data || fallbackData

  return (
    <div className="space-y-12 pb-20 page-transition">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black font-sans tracking-tight mb-2 flex items-center gap-3">
            Dynamic <span className="gradient-text">Insights</span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full flex items-center gap-1 border border-brand-primary/20">
               <Sparkles size={10} /> AI Powered
            </span>
          </h1>
          <p className="text-text-muted font-medium flex items-center gap-2 max-w-xl leading-relaxed mt-4 bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10 italic">
            "{payload.aiAdvice}"
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchAIAnalytics} className="secondary-btn text-xs py-2 px-4 flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh AI
          </button>
          <button className="primary-btn text-xs py-2 px-6 shadow-brand-primary/10">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Progression Chart */}
        <div className="lg:col-span-2 glass-card p-10 space-y-10 group hover:bg-[var(--color-surface-card-hover)] transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-sans leading-tight">Mastery <span className="text-brand-primary">Growth</span></h2>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <span className="text-xs font-bold text-text-muted tracking-widest">YOU</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-text-muted/30 rounded-full" />
                  <span className="text-xs font-bold text-text-muted tracking-widest text-[10px]">AVG ASPIRANT</span>
               </div>
            </div>
          </div>
          
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payload.progressionData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} tickMargin={15} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} tickMargin={15} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '12px' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={4}
                    animationDuration={2000}
                />
                <Area 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="var(--color-text-muted)" 
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    strokeOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action/Focus Areas */}
        <div className="space-y-8">
           <div className="glass-card p-8 bg-gradient-to-br from-brand-accent/10 to-transparent border-brand-accent/20 relative overflow-hidden">
               <div className="absolute top-[-40px] right-[-40px] opacity-10">
                  <AlertCircle size={120} className="text-brand-accent" />
               </div>
               <h3 className="text-brand-accent font-black tracking-widest text-[10px] uppercase mb-4">Urgent Attention</h3>
               <p className="text-lg font-black leading-tight mb-4">{payload.urgentAttention?.topic || 'N/A'}</p>
               <div className="flex items-center gap-2 mb-6 text-brand-accent font-bold text-xs">
                  <TrendingUp size={16} className={payload.urgentAttention?.drop > 0 ? 'text-red-500' : 'text-green-500'} /> 
                  Accuracy changed by {payload.urgentAttention?.drop || 0}% this week.
               </div>
               <div className="w-full bg-[var(--color-input-bg)] rounded-full h-1.5 mb-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${payload.urgentAttention?.mastery || 50}%` }} className="h-full bg-brand-accent shadow-[0_0_10px_rgba(236,72,153,0.5)]"></motion.div>
               </div>
               <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Current Mastery: {payload.urgentAttention?.mastery || 0}%</p>
           </div>

           <div className="glass-card p-8 space-y-8">
              <h3 className="font-bold text-sm tracking-widest uppercase text-text-muted flex items-center gap-2">
                 <Target size={16} className="text-brand-secondary" /> Focus Heatmap
              </h3>
              <div className="space-y-4">
                {payload.weakTopics?.map((topic, i) => (
                  <div key={i} className="flex flex-col gap-2 group cursor-pointer hover:bg-[var(--color-surface-card-hover)] p-3 rounded-2xl transition-colors">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span>{topic.topic}</span>
                       <span className={topic.trends > 0 ? 'text-green-500' : 'text-red-500'}>{topic.trends > 0 ? '+' : ''}{topic.trends}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-input-bg)] rounded-full h-1 overflow-hidden">
                       <div className="h-full bg-text-muted/30" style={{ width: `${Math.max(0, topic.accuracy)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <StatCard icon={CheckCircle2} label="Correct Answers" value={payload.stats?.correctAnswers || 0} sub="Based on recent tests" color="text-green-400" />
         <StatCard icon={Trophy} label="Rank percentile" value={payload.stats?.percentile || 0} sub="Compared to peers" color="text-brand-primary" />
         <StatCard icon={Flame} label="Practice Streak" value={payload.stats?.streak || "0 Days"} sub="Keep it up!" color="text-orange-400" />
         <StatCard icon={ArrowUpRight} label="Avg Time / Q" value={payload.stats?.avgTimePerQ || "0s"} sub="AI calculated metric" color="text-brand-secondary" />
      </div>
      
      {/* Subject Breakdown */}
      <div className="glass-card p-10 grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
         <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-black font-sans leading-tight">Subject <br/> <span className="gradient-text">Engagement</span></h2>
            <p className="text-xs font-medium text-text-muted leading-relaxed">Dynamic analysis of your activity across different subject categories generated by Gemini.</p>
            <div className="space-y-3">
               {payload.subjectData?.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#8b5cf6' }} />
                     <span className="text-[10px] font-black text-text-muted tracking-widest uppercase">{s.name} ({s.value}%)</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="lg:col-span-3 h-64 relative flex items-center justify-center">
            <div className="absolute inset-0 z-0 opacity-10 blur-[60px] bg-brand-primary/20 rounded-full" />
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={payload.subjectData || []} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                     {(payload.subjectData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Past Performance - Mistakes Review */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black font-sans tracking-tight flex items-center gap-3">
          <History className="text-brand-primary" /> Past <span className="text-brand-primary">Mistakes Review</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {JSON.parse(localStorage.getItem('practiceHistory') || '[]')
            .filter(session => session.mistakes && session.mistakes.length > 0)
            .reverse()
            .slice(0, 4)
            .map((session, sidx) => (
              <div key={sidx} className="space-y-4">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center justify-between">
                  <span>Session: {new Date(session.date).toLocaleDateString()} - {session.subject}</span>
                  <span className="text-red-500">{session.mistakes.length} Mistakes</span>
                </p>
                <div className="space-y-3">
                  {session.mistakes.map((mistake, midx) => (
                    <div key={midx} className="glass-card p-6 border-red-500/10 hover:border-red-500/30 transition-all group">
                      <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2">{mistake.topic}</p>
                      <p className="text-sm font-bold mb-3 leading-relaxed">Q: {mistake.question}</p>
                      <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter mb-1">Your Answer</p>
                          <p className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{mistake.yourAnswer}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter mb-1">Correct Answer</p>
                          <p className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">{mistake.correctAnswer}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] group-hover:bg-brand-primary/5 transition-colors">
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Sparkles size={10} /> AI Insight
                        </p>
                        <p className="text-[11px] font-medium leading-relaxed italic opacity-80">"{mistake.explanation}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
          {JSON.parse(localStorage.getItem('practiceHistory') || '[]').filter(s => s.mistakes && s.mistakes.length > 0).length === 0 && (
            <div className="col-span-full py-20 glass-card border-dashed flex flex-col items-center justify-center text-center opacity-40">
              <CheckCircle2 size={40} className="text-green-500 mb-4" />
              <p className="font-bold">No mistakes to review yet!</p>
              <p className="text-xs text-text-muted">Keep practicing to build your insight log.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Next-Gen Study Path */}
      <section className="space-y-8 pt-8">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black font-sans tracking-tight flex items-center gap-3">
              <BookMarked className="text-brand-primary" /> Personalized <span className="gradient-text">Study Path</span>
           </h2>
           <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">Actionable Insights</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {payload.weakTopics?.map((topic, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className="glass-card p-8 space-y-6 relative overflow-hidden group border-white/5"
            >
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-brand-primary/10 rounded-full blur-[40px] group-hover:bg-brand-primary/20 transition-colors" />
              <div className="space-y-2 relative z-10">
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Bridge Priority {i+1}</span>
                <h3 className="text-xl font-black leading-tight group-hover:text-brand-primary transition-colors">{topic.topic}</h3>
                <p className="text-xs text-text-muted font-medium italic">"Current accuracy of {topic.accuracy}% indicates a fundamental misconception in the prerequisite chain."</p>
              </div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded bg-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-brand-primary">1</span>
                  </div>
                  <p className="text-[11px] font-bold text-text-muted">Review the core fundamentals of {topic.topic} in our Concepts library.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded bg-brand-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-brand-secondary">2</span>
                  </div>
                  <p className="text-[11px] font-bold text-text-muted">Take a targeted 10-question drill session focused solely on {topic.topic}.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 relative z-10">
                <button className="flex-1 py-3 px-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20">
                  REFINE TOPIC
                </button>
                <button className="p-3 bg-white/5 text-text-muted rounded-xl hover:text-white transition-colors">
                  <Layout size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {(!payload.weakTopics || payload.weakTopics.length === 0) && [1,2,3].map(i => (
             <div key={i} className="glass-card p-12 border-dashed flex flex-col items-center justify-center text-center opacity-30">
                <div className="w-12 h-12 rounded-full border border-dashed border-text-muted mb-4 flex items-center justify-center">
                  <Trophy size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Performance Data</p>
             </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="glass-card p-6 space-y-4 group hover:scale-[1.05] transition-all glass-card-hover">
      <div className={`p-3 rounded-2xl bg-[var(--color-surface-card)] w-fit ${color}`}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-text-muted tracking-widest uppercase">{label}</p>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-[10px] font-bold text-text-muted/60 flex items-center gap-1">
           {sub}
        </p>
      </div>
    </div>
  )
}
