import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Send, MessageSquare, User, Bot, Sparkles, ShieldCheck, Lock, 
  Zap, ChevronRight, AlertTriangle, BookOpen, Brain, Map,
  ArrowRight, Clock, CheckCircle2, X, Tag, FlaskConical, HelpCircle, Lightbulb, List
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateChatResponse } from '../lib/ai'

const initialMessages = [
  { id: 1, text: "Hello! I'm your ConceptBridge AI Tutor powered by Gemini. Ask me any topic — like 'Electromagnetism', 'Integration', 'Photosynthesis' — and I'll give you a complete breakdown: definition, explanation, key topics, formulas, related concepts, and practice questions!", sender: 'ai', timestamp: new Date() },
]

// Render a rich structured AI response
function StructuredResponse({ data, userExam, onTopicClick }) {
  const [expandedQ, setExpandedQ] = useState(null)

  return (
    <div className="space-y-4 text-sm">
      {/* Definition */}
      {data.definition && (
        <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10">
          <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Tag size={10} /> Definition</p>
          <p className="text-text-primary font-medium leading-relaxed">{data.definition}</p>
        </div>
      )}

      {/* Explanation */}
      {data.explanation && (
        <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Brain size={10} /> Explanation</p>
          <p className="text-text-muted leading-relaxed">{data.explanation}</p>
        </div>
      )}

      {/* Key Topics */}
      {data.keyTopics?.length > 0 && (
        <div>
          <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1"><List size={10} /> Important Topics</p>
          <div className="flex flex-wrap gap-2">
            {data.keyTopics.map((t, i) => (
              <span key={i} className="text-[10px] font-bold bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Related Topics */}
      {data.relatedTopics?.length > 0 && (
        <div>
          <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap size={10} /> Related Topics</p>
          <div className="flex flex-wrap gap-2">
            {data.relatedTopics.map((t, i) => (
              <button
                key={i}
                onClick={() => onTopicClick(t)}
                className="text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full hover:bg-cyan-500/20 transition-colors"
              >{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Formulas */}
      {data.formulas?.length > 0 && (
        <div>
          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1"><FlaskConical size={10} /> Formulas</p>
          <div className="space-y-2">
            {data.formulas.map((f, i) => (
              <div key={i} className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-[10px] text-amber-400 font-black mb-0.5">{f.name}</p>
                <p className="font-mono text-white text-sm font-bold">{f.equation}</p>
                {f.note && <p className="text-[10px] text-text-muted mt-1">{f.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example Questions */}
      {data.exampleQuestions?.length > 0 && (
        <div>
          <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-1"><HelpCircle size={10} /> Practice Questions</p>
          <div className="space-y-2">
            {data.exampleQuestions.map((q, i) => (
              <div key={i} className="rounded-xl border border-pink-500/20 bg-pink-500/5 overflow-hidden">
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full text-left p-3 flex items-start gap-2 hover:bg-pink-500/10 transition-colors"
                >
                  <span className="text-pink-400 font-black text-[10px] shrink-0 mt-0.5">Q{i+1}.</span>
                  <p className="text-text-primary text-xs font-medium flex-1">{q.question}</p>
                  <ChevronRight size={12} className={`text-pink-400 shrink-0 mt-0.5 transition-transform ${expandedQ === i ? 'rotate-90' : ''}`} />
                </button>
                {expandedQ === i && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options?.map((opt, j) => (
                        <div key={j} className={`text-[10px] px-2 py-1.5 rounded-lg font-medium border ${
                          opt === q.answer 
                            ? 'bg-green-500/20 border-green-500/40 text-green-300' 
                            : 'bg-white/5 border-white/10 text-text-muted'
                        }`}>{opt}</div>
                      ))}
                    </div>
                    {q.hint && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Lightbulb size={10} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-300">{q.hint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tip */}
      {data.proTip && (
        <div className="p-3 rounded-xl border border-brand-primary/30 bg-brand-primary/10 flex items-start gap-2">
          <Sparkles size={12} className="text-brand-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-brand-primary font-medium">{data.proTip}</p>
        </div>
      )}
    </div>
  )
}

// Build a learning path for any topic using prerequisite chain logic
const buildLearningPath = (topic) => {
  const paths = {
    'Integration': [
      { topic: 'Algebra Basics', days: 10, color: '#8b5cf6' },
      { topic: 'Functions & Graphs', days: 15, color: '#8b5cf6' },
      { topic: 'Limits & Continuity', days: 12, color: '#6366f1' },
      { topic: 'Derivatives', days: 20, color: '#3b82f6' },
      { topic: 'Integration', days: 25, color: '#ec4899' },
    ],
    'Thermodynamics': [
      { topic: 'Basic Physics', days: 7, color: '#8b5cf6' },
      { topic: 'Kinetic Theory of Gases', days: 12, color: '#6366f1' },
      { topic: 'Laws of Thermodynamics', days: 18, color: '#3b82f6' },
      { topic: 'Thermodynamics', days: 20, color: '#ec4899' },
    ],
    'Genetics': [
      { topic: 'Cell Biology Basics', days: 8, color: '#8b5cf6' },
      { topic: 'DNA Structure', days: 10, color: '#6366f1' },
      { topic: 'Meiosis & Mitosis', days: 12, color: '#3b82f6' },
      { topic: 'Mendelian Genetics', days: 15, color: '#10b981' },
      { topic: 'Genetics', days: 18, color: '#ec4899' },
    ],
    'Electromagnetism': [
      { topic: 'Electric Charges', days: 8, color: '#8b5cf6' },
      { topic: 'Electrostatics', days: 12, color: '#6366f1' },
      { topic: 'Current Electricity', days: 15, color: '#3b82f6' },
      { topic: 'Magnetic Fields', days: 15, color: '#10b981' },
      { topic: 'Electromagnetism', days: 20, color: '#ec4899' },
    ],
  }
  
  // Fallback generic path for any topic not in the list
  return paths[topic] || [
    { topic: topic + ' — Fundamentals', days: 10, color: '#8b5cf6' },
    { topic: topic + ' — Core Concepts', days: 15, color: '#6366f1' },
    { topic: topic + ' — Problem Solving', days: 12, color: '#3b82f6' },
    { topic: topic, days: 20, color: '#ec4899' },
    { topic: topic + ' — Advanced', days: 15, color: '#10b981' },
  ]
}

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userExam, setUserExam] = useState('JEE')
  const [passcode, setPasscode] = useState('')
  const [weakTopics, setWeakTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [showLearningPath, setShowLearningPath] = useState(false)
  const [learningPath, setLearningPath] = useState([])
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.subscription === 'premium' || localStorage.getItem('premium_unlocked') === 'true') {
        setIsPremium(true)
      }
      if (session?.user?.user_metadata?.target_exam) {
        setUserExam(session.user.user_metadata.target_exam)
      }
    })
    
    // Load weak topics from localStorage (saved from practice sessions)
    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]')
    const allMistakes = history.flatMap(s => s.mistakes || [])
    const topicCounts = {}
    allMistakes.forEach(m => {
      if (m.topic) topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1
    })
    const sorted = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count }))
    
    setWeakTopics(sorted.length > 0 ? sorted : [
      { topic: 'Thermodynamics', count: 3 },
      { topic: 'Integration', count: 2 },
      { topic: 'Genetics', count: 2 },
      { topic: 'Electromagnetism', count: 1 },
    ])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleUnlock = () => {
    if (passcode === 'EDTECH2026' || passcode === 'admin123') {
       localStorage.setItem('premium_unlocked', 'true')
       setIsPremium(true)
    } else {
       alert('Incorrect passcode!')
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setLoading(true)

    try {
      const result = await generateChatResponse(userInput, userExam, messages)
      const aiResponse = { 
        id: Date.now() + 1, 
        structured: result?.definition ? result : null,
        text: result?.definition ? null : (result?.response || `Let me help you with "${userInput}". Could you provide more context?`),
        sender: 'ai', 
        timestamp: new Date(),
        relatedTopics: result?.relatedTopics || []
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (err) {
      const fallback = {
        id: Date.now() + 1,
        text: `Great question about "${userInput}"! This is a key concept in your ${userExam} preparation.`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallback])
    }
    setLoading(false)
  }

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic)
  }

  const handleLearningPath = (topic) => {
    const path = buildLearningPath(topic)
    setLearningPath(path)
    setShowLearningPath(true)
    setSelectedTopic(null)
  }

  const handleAITutor = async (topic) => {
    setSelectedTopic(null)
    const userMsg = `Explain ${topic} in detail for my ${userExam} exam`
    const userMessage = { id: Date.now(), text: userMsg, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    try {
      const result = await generateChatResponse(userMsg, userExam, messages)
      const aiResponse = {
        id: Date.now() + 1,
        structured: result?.definition ? result : null,
        text: result?.definition ? null : `Let me explain ${topic} for your ${userExam} preparation step by step.`,
        sender: 'ai',
        timestamp: new Date(),
        relatedTopics: result?.relatedTopics || []
      }
      setMessages(prev => [...prev, aiResponse])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `${topic} is a critical topic for ${userExam}. Focus on: 1) Core definitions 2) Standard formulas 3) Application in MCQs 4) Related prerequisite concepts.`,
        sender: 'ai',
        timestamp: new Date()
      }])
    }
    setLoading(false)
  }

  const totalDays = learningPath.reduce((sum, s) => sum + s.days, 0)

  return (
    <div className="flex gap-6 page-transition" style={{ height: 'calc(100vh - 9rem)' }}>
      
      {/* Learning Path Modal */}
      <AnimatePresence>
        {showLearningPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowLearningPath(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-10 max-w-2xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowLearningPath(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl">
                <X size={18} className="text-text-muted" />
              </button>

              <div className="mb-8">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">📍 Your Personalized</p>
                <h2 className="text-3xl font-black">Learning <span className="gradient-text">Path</span></h2>
                <p className="text-text-muted text-sm mt-2 flex items-center gap-2">
                  <Clock size={14} className="text-brand-accent" />
                  Total estimated time: <span className="text-white font-black">{totalDays} days</span>
                </p>
              </div>

              {/* Flow Graph */}
              <div className="relative">
                {learningPath.map((step, idx) => (
                  <div key={idx} className="relative">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-5 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-brand-primary/40 transition-all group"
                    >
                      {/* Step Number */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shrink-0 shadow-lg"
                        style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}40` }}
                      >
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-black text-base ${idx === learningPath.length - 1 ? 'gradient-text text-lg' : ''}`}>
                          {step.topic}
                          {idx === learningPath.length - 1 && ' 🎯'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex-1 h-1.5 bg-[var(--color-input-bg)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(step.days / totalDays) * 100}%`, backgroundColor: step.color }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-text-muted whitespace-nowrap">{step.days} days</span>
                        </div>
                      </div>

                      {idx < learningPath.length - 1 && (
                        <CheckCircle2 size={18} className="text-text-muted group-hover:text-green-400 transition-colors" />
                      )}
                      {idx === learningPath.length - 1 && (
                        <Sparkles size={18} className="text-brand-accent" />
                      )}
                    </motion.div>

                    {/* Arrow connector */}
                    {idx < learningPath.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowRight size={16} className="text-text-muted rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => { setShowLearningPath(false); setInput(`Create a daily study plan for ${learningPath[learningPath.length-1]?.topic} covering ${totalDays} days`) }}
                  className="flex-1 primary-btn py-4 font-black text-sm flex items-center justify-center gap-2"
                >
                  <Brain size={16} /> Ask AI to Customize This Plan
                </button>
                <button
                  onClick={() => setShowLearningPath(false)}
                  className="px-6 py-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-black text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: Chat Area */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black font-sans tracking-tight mb-2">
              AI <span className="gradient-text">Tutor Chat</span>
            </h1>
            <p className="text-text-muted font-medium flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-primary" /> 
              Powered by Gemini AI • Personalized for {userExam}
            </p>
          </div>
          {isPremium ? (
            <div className="flex items-center gap-2 glass-card px-4 py-2 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest">
              <ShieldCheck size={14} /> Unlimited Access
            </div>
          ) : (
            <div className="flex items-center gap-2 glass-card px-4 py-2 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest">
              <AlertTriangle size={14} /> 3 Questions Left
            </div>
          )}
        </div>

        <div className="flex-1 glass-card relative flex flex-col overflow-hidden shadow-2xl group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative z-10">
            <AnimatePresence mode="popLayout">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={`flex gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    m.sender === 'ai' ? 'bg-gradient-to-tr from-brand-primary to-brand-secondary text-white' : 'bg-[var(--color-surface-card)] text-text-muted border border-[var(--color-border)]'
                  }`}>
                    {m.sender === 'ai' ? <Bot size={20} className="fill-white/20" /> : <User size={20} />}
                  </div>
                  <div className={`space-y-2 ${m.sender === 'ai' ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
                    <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed font-sans shadow-xl border ${
                      m.sender === 'ai' 
                        ? 'bg-[var(--color-surface-card)] border-[var(--color-border)] rounded-tl-none' 
                        : 'bg-brand-primary text-white border-brand-primary/20 rounded-tr-none'
                    }`}>
                      {m.structured ? (
                        <StructuredResponse 
                          data={m.structured} 
                          userExam={userExam}
                          onTopicClick={(t) => setInput(`Explain ${t} for ${userExam}`)}
                        />
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot size={20} className="fill-white/20" />
                </div>
                <div className="p-5 rounded-3xl rounded-tl-none bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 relative z-10 border-t border-[var(--color-border)]">
            {!isPremium && messages.length >= 7 && (
              <div className="absolute inset-x-0 bottom-full p-6 backdrop-blur-xl border-t border-brand-primary/30 flex flex-col items-center space-y-4 text-center">
                <div className="absolute top-[-18px] p-2 bg-brand-primary text-white rounded-full"><Lock size={12} /></div>
                <div>
                  <h3 className="text-lg font-bold font-sans">Reach your <span className="gradient-text">Potential</span></h3>
                  <p className="text-xs text-text-muted mt-1">Upgrade to Pro for unlimited AI tutoring.</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <input type="password" placeholder="Enter Secret Passcode" value={passcode} onChange={e => setPasscode(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center text-sm font-bold w-52 focus:outline-none focus:border-brand-primary text-text-primary" />
                  <button onClick={handleUnlock} className="primary-btn py-3 px-8 text-sm font-black w-52">Unlock Superpowers</button>
                </div>
              </div>
            )}
            
            <form id="chat-form" onSubmit={handleSend} className="relative">
              <input 
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about any formula, concept, or problem..."
                disabled={!isPremium && messages.length >= 7}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-[2rem] px-8 py-5 placeholder:text-text-muted/50 focus:border-brand-primary transition-all outline-none text-text-primary pr-20 shadow-inner disabled:opacity-50" 
              />
              <button type="submit" disabled={!input.trim() || (!isPremium && messages.length >= 7)}
                className="absolute right-3 top-3 bottom-3 aspect-square bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white shadow-xl hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setInput(`Give me all important formulas for ${userExam}`)} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase hover:text-text-primary transition-colors bg-[var(--color-surface-card)] px-4 py-2 rounded-xl border border-[var(--color-border)]">
                <BookOpen size={12} className="text-brand-secondary" /> {userExam} Formulas
              </button>
              <button onClick={() => setInput('Solve my doubt:')} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-text-muted uppercase hover:text-text-primary transition-colors bg-[var(--color-surface-card)] px-4 py-2 rounded-xl border border-[var(--color-border)]">
                <Sparkles size={12} className="text-brand-accent" /> Doubt Solver
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Weak Topics Panel */}
      <div className="w-72 shrink-0 flex flex-col space-y-4">
        <div className="glass-card p-5 flex-1 overflow-y-auto no-scrollbar">
          <div className="mb-5">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">📊 Identified From Practice</p>
            <h3 className="text-lg font-black">Weak <span className="gradient-text">Concepts</span></h3>
            <p className="text-[10px] text-text-muted mt-1">Click a topic to get personalized help</p>
          </div>

          <div className="space-y-2">
            {weakTopics.map(({ topic, count }, idx) => (
              <div key={idx}>
                <button
                  onClick={() => handleTopicClick(selectedTopic === topic ? null : topic)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group text-left ${
                    selectedTopic === topic
                      ? 'border-brand-primary/50 bg-brand-primary/10'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-brand-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${count >= 3 ? 'bg-red-500' : count >= 2 ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <div>
                      <p className="text-sm font-black">{topic}</p>
                      <p className="text-[10px] text-text-muted">{count} mistake{count > 1 ? 's' : ''} in practice</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`text-text-muted transition-transform ${selectedTopic === topic ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </button>

                {/* Action buttons appear on topic select */}
                <AnimatePresence>
                  {selectedTopic === topic && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pl-2 space-y-2">
                        <button
                          onClick={() => handleLearningPath(topic)}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500 hover:text-white transition-all group"
                        >
                          <Map size={16} className="shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-black">Learning Path</p>
                            <p className="text-[9px] opacity-70">Step-by-step roadmap with timeline</p>
                          </div>
                          <ArrowRight size={12} className="ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                          onClick={() => handleAITutor(topic)}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500 hover:text-white transition-all group"
                        >
                          <Brain size={16} className="shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-black">AI Tutor</p>
                            <p className="text-[9px] opacity-70">Get instant AI explanation</p>
                          </div>
                          <ArrowRight size={12} className="ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-5">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Session Stats</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Messages sent</span>
              <span className="font-black">{messages.filter(m => m.sender === 'user').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Topics covered</span>
              <span className="font-black text-brand-primary">{weakTopics.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Plan access</span>
              <span className={`font-black ${isPremium ? 'text-green-400' : 'text-orange-400'}`}>{isPremium ? 'Pro' : 'Free'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
