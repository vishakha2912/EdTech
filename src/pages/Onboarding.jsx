import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/ThemeContext'
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  GraduationCap, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react'

const examOptions = [
  { id: 'JEE', name: 'JEE (Main + Advanced)', desc: 'Engineering Entrance', icon: '⚡', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'NEET', name: 'NEET (UG)', desc: 'Medical Entrance', icon: '🩺', subjects: ['Physics', 'Chemistry', 'Biology'] },
  { id: 'UPSC', name: 'UPSC CSE', desc: 'Civil Services', icon: '🏛️', subjects: ['Polity', 'History', 'Geography', 'Economy'] },
  { id: 'MHT-CET', name: 'MHT-CET', desc: 'State Engineering', icon: '🎓', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  { id: 'GATE', name: 'GATE', desc: 'Postgrad Engineering', icon: '⚙️', subjects: ['Core Subject', 'Aptitude', 'Mathematics'] },
  { id: 'CAT', name: 'CAT', desc: 'MBA Entrance', icon: '📈', subjects: ['Quant', 'LRDI', 'Verbal'] },
]

const steps = [
  { id: 1, title: 'Your Profile', subtitle: 'Tell us about yourself' },
  { id: 2, title: 'Target Exam', subtitle: 'What are you preparing for?' },
  { id: 3, title: 'All Set!', subtitle: 'Ready to start your journey' },
]

export default function Onboarding({ session, onComplete }) {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState(session?.user?.user_metadata?.full_name || '')
  const [age, setAge] = useState('')
  const [selectedExam, setSelectedExam] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { theme, toggleTheme } = useTheme()

  const handleFinish = async () => {
    if (!fullName.trim() || !selectedExam) return
    
    setLoading(true)
    setError(null)

    try {
      // Update user metadata in Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          age: age ? parseInt(age) : null,
          target_exam: selectedExam,
          is_premium: false,
          subscription: 'free',
          onboarding_complete: true,
        }
      })

      if (updateError) throw updateError

      // Upsert profile in profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: fullName.trim(),
        email: session.user.email,
        target_exam: selectedExam,
        age: age ? parseInt(age) : null,
        is_premium: false,
        subscription_status: 'free',
      })

      if (profileError) {
        console.warn('Profile upsert warning:', profileError.message)
      }

      onComplete()
    } catch (err) {
      setError(err.message)
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return fullName.trim().length >= 2
    if (step === 2) return selectedExam !== null
    return true
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="theme-toggle fixed top-6 right-6 z-50"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-brand-primary" />}
      </button>

      {/* Background blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl glass-card p-10 md:p-14 relative overflow-hidden"
      >
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/5 rounded-bl-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-xl shadow-brand-primary/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="text-xl font-bold font-sans tracking-tight">Concept<span className="text-brand-primary">Bridge</span></span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-3 transition-all duration-300 ${step >= s.id ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                  step > s.id 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : step === s.id 
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' 
                      : 'bg-[var(--color-surface-card)] border border-[var(--color-border)] text-text-muted'
                }`}>
                  {step > s.id ? <CheckCircle2 size={18} /> : s.id}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-black uppercase tracking-widest">{s.title}</p>
                  <p className="text-[10px] text-text-muted">{s.subtitle}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 rounded-full transition-all duration-500 ${step > s.id ? 'bg-green-500' : 'bg-[var(--color-border)]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight mb-2">
                  Let's get to <span className="gradient-text">know you</span>
                </h2>
                <p className="text-text-muted font-medium">We'll personalize your learning experience.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-brand-primary" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Vishakha Sharma"
                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-2xl px-6 py-4 placeholder:text-text-muted/50 focus:border-brand-primary transition-all outline-none text-text-primary font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Age (Optional)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 18"
                    min="10"
                    max="60"
                    className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-2xl px-6 py-4 placeholder:text-text-muted/50 focus:border-brand-primary transition-all outline-none text-text-primary font-medium"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight mb-2">
                  Select your <span className="gradient-text">Target Exam</span>
                </h2>
                <p className="text-text-muted font-medium">We'll customize questions, subjects, and difficulty for your exam.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {examOptions.map((exam) => (
                  <motion.button
                    key={exam.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedExam(exam.id)}
                    className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                      selectedExam === exam.id
                        ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10 ring-1 ring-brand-primary/30'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    {selectedExam === exam.id && (
                      <div className="absolute top-2 right-2 bg-brand-primary text-white p-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{exam.icon}</div>
                    <p className="font-bold text-sm">{exam.id}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{exam.desc}</p>
                  </motion.button>
                ))}
              </div>

              {selectedExam && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="glass-card p-5 border-brand-primary/20"
                >
                  <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={14} /> Subjects for {selectedExam}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {examOptions.find(e => e.id === selectedExam)?.subjects.map(sub => (
                      <span key={sub} className="text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1.5 rounded-lg">
                        {sub}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-brand-primary/30"
              >
                <CheckCircle2 className="text-white" size={48} />
              </motion.div>

              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight mb-3">
                  Welcome, <span className="gradient-text">{fullName}!</span>
                </h2>
                <p className="text-text-muted font-medium max-w-md mx-auto leading-relaxed">
                  Your personalized <span className="text-brand-primary font-bold">{selectedExam}</span> preparation journey starts now. 
                  We'll generate unique questions, track your progress, and help you bridge concept gaps.
                </p>
              </div>

              <div className="glass-card p-6 max-w-sm mx-auto text-left space-y-4 border-brand-primary/20">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Your Plan</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-green-500" /> Personalized {selectedExam} questions
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-green-500" /> AI-powered explanations
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-green-500" /> Concept gap analysis
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors py-3 px-5 rounded-xl hover:bg-[var(--color-surface-card)] border border-transparent hover:border-[var(--color-border)]"
            >
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="primary-btn flex items-center gap-2 py-4 px-8 text-sm font-black disabled:opacity-30 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 group"
            >
              Continue <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="primary-btn flex items-center gap-2 py-4 px-8 text-sm font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <>Start Learning <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /></>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
