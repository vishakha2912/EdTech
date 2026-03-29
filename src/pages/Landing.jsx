import { motion } from 'framer-motion'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/ThemeContext'
import { Zap, BookOpen, Target, Network, MessageSquare, Sun, Moon } from 'lucide-react'

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 h-full flex flex-col items-center text-center space-y-4 hover:border-brand-primary/20 transition-all"
  >
    <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-lg">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold font-sans">{title}</h3>
    <p className="text-sm text-text-muted leading-relaxed font-sans">{description}</p>
  </motion.div>
)

export default function Landing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { theme, toggleTheme } = useTheme()

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden text-text-primary">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-brand-primary" />}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 p-3 glass-card rounded-full inline-flex items-center gap-2 border-brand-primary/20 bg-brand-primary/5 pr-6"
        >
          <div className="bg-brand-primary p-1 rounded-full"><Zap className="text-white" size={12} /></div>
          <span className="text-xs font-bold tracking-tight text-brand-primary uppercase">New: Gemini AI-Powered Engine 2.0</span>
        </motion.div>

        <motion.h1 
          className="text-5xl lg:text-7xl font-black font-sans tracking-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Master Concepts, Not Just <br/> <span className="gradient-text">Correct Answers</span>
        </motion.h1>

        <motion.p 
          className="text-xl text-text-muted max-w-2xl mb-12 font-sans font-medium"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Identify missing prerequisites and bridge concept gaps with our AI tutor tailored for Indian competitive exams.
        </motion.p>

        {/* Auth Box */}
        <motion.div 
          className="w-full max-w-md glass-card p-10 relative z-10 shadow-2xl transition-all duration-500"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="text-center mb-8 space-y-2">
             <h2 className="text-2xl font-black font-sans">Welcome to ConceptBridge</h2>
             <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Sign in to start learning</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleGoogleAuth} 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white text-black font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider h-14 flex items-center justify-center gap-3 border border-gray-200"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black" /> : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            <p className="mt-6 text-xs text-text-muted leading-relaxed text-center">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>

          {error && <p className="mt-4 text-red-400 text-xs font-medium px-1 flex gap-2 justify-center">⚠️ {error}</p>}
          
          <div className="mt-10 pt-8 border-t border-[var(--color-border)] flex flex-col items-center">
            <p className="text-xs text-text-muted font-bold mb-4 uppercase tracking-[0.2em]">Want to test before connecting?</p>
            <button 
              onClick={() => {
                localStorage.setItem('demo_mode', 'true');
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-black text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-all uppercase tracking-widest shadow-lg"
            >
              Explore Demo Mode
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <FeatureCard 
          icon={BookOpen}
          title="Exam Focused" 
          description="Specialized practice for JEE, NEET, UPSC, MHT-CET, GATE, and CAT with AI-generated questions."
          delay={0.1}
        />
        <FeatureCard 
          icon={Target}
          title="Weakness Mapper" 
          description="Our algorithm identifies exactly where your foundation is weak based on wrong answers."
          delay={0.2}
        />
        <FeatureCard 
          icon={Network} 
          title="Concept Bridge" 
          description="Visualize the connections between topics. See exactly which prerequisite you missed."
          delay={0.3}
        />
        <FeatureCard 
          icon={MessageSquare} 
          title="24/7 AI Tutor" 
          description="Powered by Gemini AI. Get instant explanations and step-by-step reasoning anytime."
          delay={0.4}
        />
      </section>

      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  )
}
