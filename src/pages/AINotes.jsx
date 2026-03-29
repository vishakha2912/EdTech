import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Download,
  Share2,
  Copy,
  CheckCircle2,
  Brain
} from 'lucide-react'
import { generateExplanation } from '../lib/ai'

export default function AINotes() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setNotes(null)
    
    try {
      // Reusing generateExplanation with a twist for notes
      const response = await generateExplanation(
        `Generate comprehensive, conceptual, and easy-to-understand notes for: ${query}. Include key points, simplified explanations, and a one-liner tip.`,
        "concept request",
        "detailed explanation",
        "Educational Context"
      )
      
      if (response) {
        setNotes({
          title: query,
          content: response.deep || response.brief,
          keyPoints: response.prerequisites || ["Conceptual clarity", "Application focused", "Exam oriented"],
          tip: response.tip || "Focus on the fundamental principles first."
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${notes.title}\n\n${notes.content}\n\nTip: ${notes.tip}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 page-transition pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-10 rounded-3xl border border-amber-500/10 relative overflow-hidden">
        <div className="z-10 relative">
          <div className="flex items-center gap-3 text-amber-500 mb-4">
            <Sparkles size={24} className="fill-amber-500" />
            <h1 className="text-sm font-black uppercase tracking-[0.3em]">AI Smart Notes</h1>
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight max-w-2xl">
            Turn complex topics into <span className="text-amber-500">Crystal Clear</span> conceptual notes.
          </h2>
          <p className="text-text-muted font-medium max-w-xl">
            Enter any topic, formula, or complex concept and our AI will bridge the gaps with simplified explanations and structured points.
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-5%] w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -z-0"></div>
      </div>

      {/* Input Section */}
      <section className="glass-card p-2 rounded-[2rem] shadow-2xl">
        <form onSubmit={handleGenerate} className="flex items-center gap-4 p-2">
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-6 text-text-muted">
              <Brain size={24} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Quantum Mechanics for JEE, Photosynthesis simplified, Indian Polity structure..."
              className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[1.5rem] py-6 pl-16 pr-8 text-lg font-medium focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-text-muted/50 shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white px-10 rounded-[1.5rem] py-6 font-black tracking-widest flex items-center gap-3 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-amber-500/20 active:scale-95"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <>GENERATE <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </section>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-20 glass-card"
          >
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-amber-500"></div>
              <Sparkles size={32} className="absolute inset-0 m-auto text-amber-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold mb-2">Architecting your notes...</h3>
            <p className="text-text-muted text-sm font-medium">Simplifying concepts and structuring key points.</p>
          </motion.div>
        ) : notes ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-10 min-h-[500px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <BookOpen size={200} />
                </div>
                
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-black mb-2">{notes.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <p className="text-xs font-black text-text-muted uppercase tracking-widest">AI Generated Concepts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="p-3 hover:bg-[var(--color-surface-card-hover)] rounded-xl transition-all border border-[var(--color-border)] text-text-muted hover:text-text-primary" title="Copy">
                      {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button className="p-3 hover:bg-[var(--color-surface-card-hover)] rounded-xl transition-all border border-[var(--color-border)] text-text-muted hover:text-text-primary" title="Download PDF">
                      <Download size={18} />
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-text-muted font-sans font-medium">
                    {notes.content}
                  </p>
                </div>

                <div className="mt-12 p-8 bg-amber-500/5 rounded-3xl border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-500 mb-4">
                    <Zap size={18} className="fill-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Conceptual One-Liner Tip</span>
                  </div>
                  <p className="text-lg font-bold italic">"{notes.tip}"</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8 space-y-6">
                <h4 className="font-black text-xs uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <Search size={14} /> Key Focus Areas
                </h4>
                <div className="space-y-3">
                  {notes.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] group hover:border-amber-500/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-black">
                        {i + 1}
                      </div>
                      <span className="text-sm font-bold group-hover:text-text-primary transition-colors">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20 space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <Share2 size={18} className="text-brand-primary" /> Study Together
                </h4>
                <p className="text-xs text-text-muted font-medium leading-relaxed">
                  Share these AI-structured notes with your study group or save them to your concept library.
                </p>
                <button className="w-full primary-btn py-3 text-xs">ADD TO LIBRARY</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40 grayscale pointer-events-none">
             {[1,2,3,4].map(i => (
               <div key={i} className="glass-card p-8 h-48 border-dashed flex items-center justify-center">
                  <BookOpen size={40} className="text-text-muted/20" />
               </div>
             ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
