import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

// Pages
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Practice from './pages/Practice'
import ExamSelector from './pages/ExamSelector'
import Analytics from './pages/Analytics'
import ConceptGraph from './pages/ConceptGraph'
import Chat from './pages/Chat'
import Onboarding from './pages/Onboarding'
import AdminDashboard from './pages/AdminDashboard'
import AINotes from './pages/AINotes'
import Result from './pages/Result'
import Layout from './components/Layout'
import StudyMaterial from './pages/StudyMaterial'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const checkOnboarding = (userSession) => {
    if (!userSession?.user) return false
    const meta = userSession.user.user_metadata
    // If the user hasn't completed onboarding (no target exam set), show onboarding
    return !meta?.onboarding_complete && !meta?.target_exam
  }

  useEffect(() => {
    // Check if demo mode is enabled
    const demoUser = localStorage.getItem('demo_mode')
    if (demoUser === 'true') {
      const demoSession = {
        user: {
          id: 'demo-user-id',
          email: 'demo@conceptbridge.ai',
          user_metadata: {
            full_name: 'Demo Aspirant',
            target_exam: 'JEE',
            is_premium: true,
            subscription: 'premium',
            onboarding_complete: true,
          }
        }
      }
      setSession(demoSession)
      setNeedsOnboarding(false)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setNeedsOnboarding(checkOnboarding(session))
      setLoading(false)

      if (session && session.user.user_metadata?.subscription !== 'premium') {
        supabase
          .from('premium_requests')
          .select('status')
          .eq('user_id', session.user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              const updatedSession = { 
                ...session, 
                user: {
                  ...session.user,
                  user_metadata: {
                    ...(session.user?.user_metadata || {}),
                    subscription: 'premium'
                  }
                }
              }
              setSession(updatedSession)
            }
          })
          .catch(console.error)
      }
    }).catch(() => {
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setNeedsOnboarding(checkOnboarding(session))
      
      if (session && session.user.user_metadata?.subscription !== 'premium') {
        supabase
          .from('premium_requests')
          .select('status')
          .eq('user_id', session.user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              const updatedSession = { 
                ...session, 
                user: {
                  ...session.user,
                  user_metadata: {
                    ...(session.user?.user_metadata || {}),
                    subscription: 'premium'
                  }
                }
              }
              setSession(updatedSession)
            }
          })
          .catch(console.error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleOnboardingComplete = async () => {
    // Refresh session to get latest user metadata
    const { data: { session: freshSession } } = await supabase.auth.getSession()
    setSession(freshSession)
    setNeedsOnboarding(false)
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
          <p className="text-text-muted text-sm font-medium animate-pulse">Loading ConceptBridge...</p>
        </div>
      </div>
    )
  }

  // Show onboarding for new users after authentication
  if (session && needsOnboarding) {
    return <Onboarding session={session} onComplete={handleOnboardingComplete} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route element={<Layout session={session} />}>
          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/dashboard/:subject" element={session ? <Practice /> : <Navigate to="/" />} />
          <Route path="/exams" element={session ? <ExamSelector /> : <Navigate to="/" />} />
          <Route path="/practice/:subject" element={session ? <Practice /> : <Navigate to="/" />} />
          <Route path="/practice/:exam/:subject" element={session ? <Practice /> : <Navigate to="/" />} />
          <Route path="/study/:exam/:subject" element={session ? <StudyMaterial /> : <Navigate to="/" />} />
          <Route path="/result" element={session ? <Result /> : <Navigate to="/" />} />
          <Route path="/analytics" element={session ? <Analytics /> : <Navigate to="/" />} />
          <Route path="/graph" element={session ? <ConceptGraph /> : <Navigate to="/" />} />
          <Route path="/chat" element={session ? <Chat /> : <Navigate to="/" />} />
          <Route path="/ai-notes" element={session ? <AINotes /> : <Navigate to="/" />} />
          <Route path="/admin" element={session ? <AdminDashboard session={session} /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
