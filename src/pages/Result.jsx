import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Timer as Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  BookOpen,
  LayoutDashboard,
  Zap,
  ChevronDown,
  ChevronUp,
  Network,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateAINotes } from '../lib/ai'

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { exam, subject, score, timeSpent, mistakesCount, totalQuestions, mistakes } = location.state || {
    exam: 'JEE',
    subject: 'Physics',
    score: 0,
    timeSpent: 0,
    mistakesCount: 0,
    totalQuestions: 5,
    mistakes: []
  }

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedNotes, setGeneratedNotes] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState({})

  const accuracy = Math.round(((totalQuestions - mistakesCount) / totalQuestions) * 100)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleGenerateNotes = async () => {
    if (mistakes.length === 0) return
    setIsGenerating(true)
    
    try {
      const notes = await generateAINotes(exam, subject, mistakes)
      if (notes) {
        setGeneratedNotes(notes)
      } else {
        throw new Error('AI returned empty response')
      }
    } catch (err) {
      console.error('Notes generation failed:', err)
      // Fallback notes so it doesn't crash
      setGeneratedNotes({
        title: "Manual Concept Review: " + subject,
        brief: "We encountered an issue with the AI, but here's a structured review based on your mistakes.",
        sections: [
          {
            heading: "Core Review",
            content: "You made " + mistakesCount + " mistakes in " + subject + ". Focus on these topics: " + [...new Set(mistakes.map(m => m.topic))].join(', '),
            points: ["Review the fundamental definitions", "Check your calculation steps", "Verify formula applications"]
          }
        ],
        oneLiner: "Keep practicing! Consistency leads to mastery."
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!generatedNotes) return
    setIsSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Try to insert - ignore error if table doesn't exist yet for demo
        await supabase.from('ai_notes').insert({
          user_id: session.user.id,
          subject: subject,
          exam: exam,
          title: generatedNotes.title,
          content: JSON.stringify(generatedNotes),
          created_at: new Date().toISOString()
        })
        alert('Notes saved to your AI Library!')
      }
    } catch (err) {
      console.error('Failed to save notes:', err)
      alert('Note: Setup the ai_notes table in Supabase to save persistently.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleExpand = (idx) => {
    setIsExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 page-transition pb-20">
      {/* Result Hero */}
      <div className="glass-card p-10 overflow-hidden relative border-brand-primary/20">
        <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-brand-primary/10 rounded-full blur-[100px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center relative z-10">
          <div className="md:col-span-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/20">
              <Trophy className="text-white" size={40} />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Performance</p>
              <h1 className="text-2xl font-black">Test Result</h1>
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Score</p>
              <p className="text-2xl font-black text-brand-primary">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Accuracy</p>
              <p className={`text-2xl font-black ${accuracy < 50 ? 'text-red-500' : 'text-green-500'}`}>{accuracy}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Time Spent</p>
              <p className="text-2xl font-black text-amber-500">{formatTime(timeSpent)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Mistakes</p>
              <p className="text-2xl font-black text-red-500">{mistakesCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Mistakes Review */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black font-sans tracking-tight flex items-center gap-3 px-2">
            <AlertCircle className="text-brand-accent" /> Mistake <span className="text-brand-accent">Log</span>
          </h2>
          
          <div className="space-y-4">
            {mistakes.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center opacity-40 border-dashed border-2">
                <CheckCircle2 size={40} className="text-green-500 mb-4" />
                <p className="font-bold">Perfect Score! No mistakes to review.</p>
              </div>
            ) : (
              mistakes.map((mistake, i) => (
                <div key={i} className="glass-card p-6 border-red-500/10 hover:border-red-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{mistake.topic}</p>
                    <button onClick={() => toggleExpand(i)} className="p-1 hover:bg-white/10 rounded-lg">
                      {isExpanded[i] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <p className="text-sm font-bold mb-4 leading-relaxed pr-8">Q: {mistake.question}</p>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1 opacity-60">You Picked</p>
                      <p className="text-xs font-bold">{mistake.yourAnswer}</p>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                      <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1 opacity-60">Correct Answer</p>
                      <p className="text-xs font-bold">{mistake.correctAnswer}</p>
                    </div>
                  </div>

                  {isExpanded[i] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] mt-4 space-y-3"
                    >
                      <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={10} /> Explanation
                      </p>
                      <p className="text-xs font-medium leading-relaxed italic opacity-80 decoration-brand-primary/30">
                        "{mistake.explanation}"
                      </p>
                      <hr className="border-[var(--color-border)]" />
                      <p className="text-xs leading-relaxed font-sans">{mistake.deepExplanation}</p>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Notes Generator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20 relative overflow-hidden group">
            <div className="absolute top-[-30px] right-[-30px] p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <BookOpen size={100} className="text-brand-primary" />
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-black tracking-tight mb-2">AI Notes <span className="text-brand-primary">Generator</span></h3>
              <p className="text-xs text-text-muted font-medium leading-relaxed">Turn your mistakes into clear conceptual study notes for long-term retention.</p>
            </div>

            {mistakes.length === 0 ? (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Expert Mode</p>
                <p className="text-xs font-medium mt-1">No gaps detected. You're set for the exam!</p>
              </div>
            ) : !generatedNotes ? (
              <button 
                onClick={handleGenerateNotes}
                disabled={isGenerating}
                className="w-full primary-btn py-4 text-xs font-black tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> GENERATING...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="fill-white" /> GENERATE MISTAKE NOTES
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                  <h4 className="text-[10px] font-black text-brand-primary uppercase mb-2 tracking-widest">Crystal Clear Analysis</h4>
                  <p className="text-xs font-black text-white mb-2">{generatedNotes.title}</p>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">{generatedNotes.brief}</p>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {generatedNotes.sections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                      <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">{section.heading}</p>
                      <p className="text-[11px] leading-relaxed opacity-70">{section.content}</p>
                      <ul className="space-y-1.5">
                        {section.points.map((point, pIdx) => (
                          <li key={pIdx} className="text-[11px] font-medium flex items-start gap-2">
                            <CheckCircle2 size={12} className="text-brand-primary mt-0.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">PRO TIP</p>
                    <p className="text-xs font-black italic">{generatedNotes.oneLiner}</p>
                  </div>
                </div>

                <button 
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="w-full primary-btn py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <BookOpen size={14} />} 
                  {isSaving ? 'SAVING...' : 'SAVE TO MY LIBRARY'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            {mistakes.length > 0 && (
              <button 
                onClick={() => navigate('/graph', { state: { targetTopics: [...new Set(mistakes.map(m => m.topic))] } })}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center gap-3 transition-all hover:bg-purple-500 hover:text-white shadow-lg shadow-purple-500/10 group"
              >
                <Network size={18} className="group-hover:scale-125 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Analyze All Weaknesses in Graph</span>
              </button>
            )}
            <button 
              onClick={() => navigate(`/practice/${exam}/${subject}`)}
              className="w-full py-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:bg-[var(--color-surface-card-hover)] flex items-center justify-center gap-3 transition-all group"
            >
              <RotateCcw size={18} className="text-brand-secondary group-hover:rotate-180 transition-all duration-500" />
              <span className="text-xs font-black uppercase tracking-widest">Retry Test</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl bg-brand-primary text-white flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-primary/20 hover:scale-[1.02]"
            >
              <LayoutDashboard size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
