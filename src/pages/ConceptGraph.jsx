import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Network, 
  Info, 
  ChevronRight, 
  Search, 
  Filter, 
  Zap,
  CheckCircle2,
  LockKeyhole,
  ArrowRight,
  Sparkles,
  Brain
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// A much more comprehensive set of concepts for a "massive" feel
const initialData = {
  nodes: [
    // Physics Cluster
    { id: 'Newton\'s Laws', subject: 'Physics', group: 'physics', val: 24 },
    { id: 'Circular Motion', subject: 'Physics', group: 'physics', val: 18 },
    { id: 'Centripetal Force', subject: 'Physics', group: 'physics', val: 14 },
    { id: 'Work-Energy', subject: 'Physics', group: 'physics', val: 22 },
    { id: 'Thermodynamics', subject: 'Physics', group: 'physics', val: 26 },
    { id: 'Entropy', subject: 'Physics', group: 'physics', val: 16 },
    { id: 'Magnetic Fields', subject: 'Physics', group: 'physics', val: 20 },
    { id: 'Electromagnetism', subject: 'Physics', group: 'physics', val: 25 },
    { id: 'Lorentz Force', subject: 'Physics', group: 'physics', val: 15 },
    { id: 'Atomic Physics', subject: 'Physics', group: 'physics', val: 22 },
    
    // Biology Cluster
    { id: 'Cell Biology', subject: 'Biology', group: 'biology', val: 24 },
    { id: 'Genetics', subject: 'Biology', group: 'biology', val: 26 },
    { id: 'Mendelian Genetics', subject: 'Biology', group: 'biology', val: 18 },
    { id: 'Meiosis', subject: 'Biology', group: 'biology', val: 16 },
    { id: 'Molecular Biology', subject: 'Biology', group: 'biology', val: 28 },
    { id: 'DNA Replication', subject: 'Biology', group: 'biology', val: 20 },
    { id: 'Evolution', subject: 'Biology', group: 'biology', val: 24 },
    { id: 'Human Physiology', subject: 'Biology', group: 'biology', val: 26 },
    
    // Chemistry Cluster
    { id: 'Chemical Bonding', subject: 'Chemistry', group: 'chemistry', val: 26 },
    { id: 'VSEPR Theory', subject: 'Chemistry', group: 'chemistry', val: 18 },
    { id: 'Organic Chemistry', subject: 'Chemistry', group: 'chemistry', val: 30 },
    { id: 'Hydrocarbons', subject: 'Chemistry', group: 'chemistry', val: 22 },
    { id: 'Electrochemistry', subject: 'Chemistry', group: 'chemistry', val: 25 },
    { id: 'Redox Reactions', subject: 'Chemistry', group: 'chemistry', val: 18 },
    { id: 'Coordination Compounds', subject: 'Chemistry', group: 'chemistry', val: 22 },
    
    // Math Cluster
    { id: 'Calculus', subject: 'Mathematics', group: 'math', val: 30 },
    { id: 'Differentiation', subject: 'Mathematics', group: 'math', val: 22 },
    { id: 'Integration', subject: 'Mathematics', group: 'math', val: 22 },
    { id: 'Probability', subject: 'Mathematics', group: 'math', val: 20 },
    { id: 'Matrices', subject: 'Mathematics', group: 'math', val: 24 },
    
    // Cross-Bridge Concepts
    { id: 'Bio-Electricity', subject: 'Cross-Subject', group: 'cross', val: 18 },
    { id: 'Biophysical Chemistry', subject: 'Cross-Subject', group: 'cross', val: 16 },
    { id: 'Math in Physics', subject: 'Cross-Subject', group: 'cross', val: 20 },
  ],
  links: [
    // Physics
    { source: 'Newton\'s Laws', target: 'Circular Motion' },
    { source: 'Circular Motion', target: 'Centripetal Force' },
    { source: 'Newton\'s Laws', target: 'Work-Energy' },
    { source: 'Thermodynamics', target: 'Entropy' },
    { source: 'Magnetic Fields', target: 'Lorentz Force' },
    { source: 'Electromagnetism', target: 'Lorentz Force' },
    { source: 'Atomic Physics', target: 'Electromagnetism' },
    
    // Biology
    { source: 'Cell Biology', target: 'Genetics' },
    { source: 'Genetics', target: 'Mendelian Genetics' },
    { source: 'Meiosis', target: 'Mendelian Genetics' },
    { source: 'Cell Biology', target: 'Meiosis' },
    { source: 'Molecular Biology', target: 'DNA Replication' },
    { source: 'Genetics', target: 'Molecular Biology' },
    { source: 'Molecular Biology', target: 'Evolution' },
    
    // Chemistry
    { source: 'Chemical Bonding', target: 'VSEPR Theory' },
    { source: 'Organic Chemistry', target: 'Hydrocarbons' },
    { source: 'Electrochemistry', target: 'Redox Reactions' },
    
    // Math
    { source: 'Calculus', target: 'Differentiation' },
    { source: 'Calculus', target: 'Integration' },
    
    // Cross-Subject
    { source: 'Magnetic Fields', target: 'Bio-Electricity' },
    { source: 'Cell Biology', target: 'Bio-Electricity' },
    { source: 'Chemical Bonding', target: 'Biophysical Chemistry' },
    { source: 'Molecular Biology', target: 'Biophysical Chemistry' },
    { source: 'Calculus', target: 'Math in Physics' },
    { source: 'Newton\'s Laws', target: 'Math in Physics' },
  ]
}

const colorMap = {
  physics: '#8b5cf6', // Violet
  biology: '#ec4899', // Pink
  chemistry: '#3b82f6', // Blue
  math: '#10b981',    // Emerald
  cross: '#f59e0b',   // Amber
  weak: '#ef4444'      // Red
}

export default function ConceptGraph() {
  const svgRef = useRef()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isPremium, setIsPremium] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [passcode, setPasscode] = useState('')

  const targetTopics = location.state?.targetTopics || (location.state?.targetTopic ? [location.state?.targetTopic] : null)

  // Build a specialized, isolated graph based on ONLY the weak topic areas from mistakes
  const [graphData] = useState(() => {
    if (targetTopics && targetTopics.length > 0) {
      const nodes = []
      const links = []
      
      targetTopics.forEach((topic, idx) => {
        const fundamentalsId = topic + ' — Basics'
        const advancedId = topic + ' — Advanced'
        const prereqId = topic + ' — Prerequisites'
        
        nodes.push({ id: topic, subject: 'Weak Area', group: 'weak', val: 32 })
        nodes.push({ id: fundamentalsId, subject: 'Core Fundamentals', group: 'physics', val: 22 })
        nodes.push({ id: advancedId, subject: 'Next Level', group: 'math', val: 16 })
        nodes.push({ id: prereqId, subject: 'Must Know Before', group: 'chemistry', val: 18 })
        
        links.push({ source: prereqId, target: fundamentalsId })
        links.push({ source: fundamentalsId, target: topic })
        links.push({ source: topic, target: advancedId })
      })
      
      return { nodes, links }
    }
    
    return JSON.parse(JSON.stringify(initialData))
  })

  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    if (targetTopics && targetTopics.length > 0) {
       const node = graphData.nodes.find(n => n.id === targetTopics[0])
       if (node) setSelectedNode(node)
    }
  }, [targetTopics, graphData])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isUnlocked = localStorage.getItem('premium_unlocked') === 'true' || session?.user?.user_metadata?.subscription === 'premium'
      if (isUnlocked) {
        setIsPremium(true)
        setShowPaywall(false)
      } else {
        setShowPaywall(true)
      }
    })
  }, [])
  
  const handleUnlock = () => {
    if (passcode.toUpperCase() === 'EDTECH2026' || passcode.toLowerCase() === 'admin123') {
       localStorage.setItem('premium_unlocked', 'true')
       setIsPremium(true)
       setShowPaywall(false)
    } else {
       alert('Incorrect passcode!')
    }
  }

  useEffect(() => {
    if (!svgRef.current || !isPremium) return

    const width = 800
    const height = 600
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
    svg.selectAll('*').remove()

    // ── SVG DEFINITIONS (Filters/Gradients) ────────────────────────
    const defs = svg.append('defs')
    
    // Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur')
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over')

    // Create a color gradient for each subject
    Object.entries(colorMap).forEach(([key, color]) => {
      const grad = defs.append('radialGradient')
        .attr('id', `grad-${key}`)
      grad.append('stop').attr('offset', '0%').attr('stop-color', color)
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.4)
    })

    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border') || 'rgba(150,150,150,0.3)'
    const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary') || '#ffffff'
    const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted') || '#94a3b8'

    const nodes = graphData.nodes.map(n => ({ ...n }))
    const links = graphData.links.map(l => ({ ...l }))

    if (targetTopics && targetTopics.length > 0) {
      // STATIC PATH LAYOUT for Weakness Analysis
      const clusterCount = targetTopics.length
      const clusterWidth = width / (clusterCount + 1)
      const rowGap = 130
      const nodePositions = {}
      
      targetTopics.forEach((topic, idx) => {
        const cx = clusterWidth * (idx + 1)
        const topicNames = [
          topic + ' — Prerequisites',
          topic + ' — Basics',
          topic,
          topic + ' — Advanced'
        ]
        topicNames.forEach((name, rowIdx) => {
          nodePositions[name] = { x: cx, y: 80 + rowIdx * rowGap }
        })
      })
      
      nodes.forEach(n => {
        if (nodePositions[n.id]) {
          n.fx = nodePositions[n.id].x
          n.fy = nodePositions[n.id].y
          n.x = n.fx; n.y = n.fy
        }
      })
    } else {
      // STATIC CONSTELLATION for Main Graph
      // We'll use a force simulation but instantly freeze it for a "Premium Static" feel
      const sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(120))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .stop()
      
      for (let i = 0; i < 300; i++) sim.tick()
      nodes.forEach(n => { n.fx = n.x; n.fy = n.y })
    }

    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
    const resolvedLinks = links.map(l => ({
      source: typeof l.source === 'string' ? nodeById[l.source] : l.source,
      target: typeof l.target === 'string' ? nodeById[l.target] : l.target
    })).filter(l => l.source && l.target)

    // ── DRAWING ────────────────────────────────────────────────────
    
    // Draw links with animated dash
    const linkG = svg.append('g')
      .selectAll('line')
      .data(resolvedLinks)
      .join('line')
      .attr('stroke', borderColor)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '8,4')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    
    // Animate the dash displacement for a "flowing energy" effect
    linkG.append('animate')
      .attr('attributeName', 'stroke-dashoffset')
      .attr('from', 0)
      .attr('to', 24)
      .attr('dur', '1.5s')
      .attr('repeatCount', 'indefinite')

    // Draw nodes
    const nodeG = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => setSelectedNode(d))

    // Outer Glow
    nodeG.append('circle')
      .attr('r', d => d.val * 1.5)
      .attr('fill', d => colorMap[d.group] || colorMap.physics)
      .attr('opacity', 0.1)
      .attr('filter', 'url(#glow)')

    // Inner Core
    nodeG.append('circle')
      .attr('r', d => d.val)
      .attr('fill', d => `url(#grad-${d.group})`)
      .attr('stroke', d => colorMap[d.group])
      .attr('stroke-width', 2)
      .attr('class', 'node-circle')

    // Labels
    nodeG.append('text')
      .text(d => d.id)
      .attr('y', d => d.val + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', textMuted)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('font-family', 'Outfit, sans-serif')
      .style('pointer-events', 'none')

  }, [isPremium, graphData])

  const getSubtopicsForTopic = (topicName) => {
    const base = topicName.replace(' — Basics','').replace(' — Advanced','').replace(' — Prerequisites','')
    return [
      { title: 'Foundational Theory', desc: `Master the axiomatic origins and core definitions of ${base}.` },
      { title: 'Variable Interplay', desc: `Explore how primary variables in ${base} influence peripheral systems.` },
      { title: 'Common Pitfalls', desc: `Diagnostic mapping of recurring mistakes in competitive ${base} problems.` },
      { title: 'Advanced Synthesis', desc: `Synthesize complex ${base} concepts into actionable problem-solving schemas.` },
      { title: 'Prerequisite Audit', desc: `Review the essential knowledge dependencies required for mastering ${base}.` }
    ]
  }

  return (
    <div className="h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 page-transition">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest">Knowledge Visualization</div>
            {targetTopics && <div className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Zap size={10} /> Active Gap Analysis</div>}
          </div>
          <h1 className="text-4xl font-black font-sans tracking-tight">
            {targetTopics ? "Neural " : "Concept "} <span className="gradient-text">{targetTopics ? "Weaknesses" : "Architecture"}</span>
          </h1>
          <p className="text-text-muted font-medium flex items-center gap-2 mt-2">
            <Network size={18} className="text-brand-primary" /> 
            {targetTopics 
              ? `Isolated ${targetTopics.length} weakness clusters for targeted remediation.` 
              : `A multi-dimensional map of your ${initialData.nodes.length} core learning pillars.`}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 glass-card px-4 py-2 text-[10px] font-bold text-text-muted hover:text-text-primary transition-all">
            <Search size={14} /> SEARCH NODES
          </button>
          <button className="flex items-center gap-2 glass-card px-4 py-2 text-[10px] font-bold text-text-muted hover:text-text-primary transition-all">
            <Filter size={14} /> SUBJECT FILTER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[650px]">
        {/* Graph Display */}
        <div className="lg:col-span-3 glass-card relative overflow-hidden shadow-2xl bg-[var(--color-surface-card)] border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          {!isPremium && (
             <div className="absolute inset-0 z-20 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center space-y-10 group overflow-hidden" style={{backgroundColor: 'rgba(var(--color-background-rgb), 0.8)'}}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/20 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />
                
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-tr from-brand-primary via-brand-secondary to-brand-accent rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-primary/40 group-hover:rotate-12 transition-transform duration-500">
                    <LockKeyhole size={50} className="text-white fill-white" />
                  </div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border-2 border-dashed border-brand-primary/30 rounded-[3rem] -z-10" />
                </div>

                <div className="space-y-4 relative z-10 max-w-sm">
                  <h2 className="text-4xl font-black tracking-tight leading-tight">Unlock <span className="gradient-text">Concept Bridge</span></h2>
                  <p className="text-text-muted font-bold leading-relaxed">Visualize hidden dependencies between subjects and master your target exam with the legendary Concept Graph.</p>
                </div>

                <div className="space-y-4 relative z-10 flex flex-col items-center w-full max-w-xs">
                  <div className="w-full relative">
                    <input 
                      type="password" 
                      placeholder="ENTER SECRET PASSCODE" 
                      value={passcode}
                      onChange={e => setPasscode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                      className="px-6 py-5 rounded-2xl bg-[var(--color-surface-card)] border border-white/10 text-center text-sm font-black tracking-[0.2em] w-full focus:outline-none focus:border-brand-primary/50 transition-all text-text-primary shadow-xl"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary animate-pulse">
                      <Zap size={18} className="fill-brand-primary" />
                    </div>
                  </div>
                  <button 
                    onClick={handleUnlock}
                    className="w-full py-5 px-10 bg-brand-primary text-white text-xs font-black tracking-widest uppercase rounded-2xl shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    DEPLOY COGNITIVE MAP <ArrowRight size={16} />
                  </button>
                </div>
             </div>
          )}
          <svg ref={svgRef} className="w-full h-full" />
          
          {/* Subtle Corner Legend */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none">
            {Object.entries(colorMap).slice(0, 5).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="glass-card p-8 space-y-8 overflow-y-auto max-h-full no-scrollbar relative border-white/5 shadow-2xl">
          {!isPremium && <div className="absolute inset-0 backdrop-blur-[4px] z-10 rounded-2xl" style={{backgroundColor: 'rgba(var(--color-background-rgb), 0.5)'}} />}
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-black font-sans uppercase tracking-[0.1em] flex items-center gap-2">
              <Brain size={18} className="text-brand-primary" /> NODE INTELLIGENCE
            </h3>
            {selectedNode && <div className="p-1 rounded-md bg-white/5 text-text-muted hover:text-white cursor-pointer" onClick={() => setSelectedNode(null)}>
              <Info size={14} />
            </div>}
          </div>
          
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                   <label className="text-[10px] font-black tracking-widest text-brand-primary uppercase bg-brand-primary/10 px-2 py-0.5 rounded-full inline-block mb-3">{selectedNode.subject}</label>
                   <p className="text-3xl font-black leading-tight tracking-tight">{selectedNode.id}</p>
                   {selectedNode.group === 'weak' && (
                     <div className="mt-3 flex items-center gap-2 text-red-500 text-[10px] font-black uppercase">
                       <Zap size={14} className="fill-red-500" /> HIGHEST ERRATA FREQUENCY
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">Mastery</p>
                    <p className="text-lg font-black text-brand-secondary">42%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">Criticality</p>
                    <p className="text-lg font-black text-brand-accent">9/10</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-2 italic">
                    <Network size={12} /> Neural Bridges
                  </label>
                  <div className="space-y-2">
                    {graphData.links.filter(l => {
                      const srcId = typeof l.source === 'string' ? l.source : (l.source?.id || l.source)
                      const tgtId = typeof l.target === 'string' ? l.target : (l.target?.id || l.target)
                      return srcId === selectedNode.id || tgtId === selectedNode.id
                    }).map((l, i) => {
                      const srcId = typeof l.source === 'string' ? l.source : (l.source?.id || l.source)
                      const tgtId = typeof l.target === 'string' ? l.target : (l.target?.id || l.target)
                      const other = srcId === selectedNode.id ? tgtId : srcId
                      const isParent = tgtId === selectedNode.id
                      return (
                        <div key={i} onClick={() => setSelectedNode(graphData.nodes.find(n => n.id === other))} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-brand-primary transition-all cursor-pointer group hover:bg-white/[0.08]">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary block mb-0.5">{isParent ? 'Prerequisite' : 'Expansion Topic'}</span>
                            <span className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors">{other}</span>
                          </div>
                          <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-2 italic">
                    <Sparkles size={12} /> Mastery Path
                  </label>
                  <div className="space-y-3">
                    {getSubtopicsForTopic(selectedNode.id).map((sub, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5 border border-brand-primary/30 group-hover:scale-110 transition-transform">
                          <span className="text-[10px] font-black text-brand-primary">{idx+1}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-text-primary group-hover:text-brand-primary transition-colors">{sub.title}</p>
                          <p className="text-[10px] text-text-muted leading-relaxed font-medium">{sub.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/practice/${selectedNode.id}`)}
                  className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  START TARGETED PRACTICE <Zap size={14} className="fill-white" />
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 py-20 pb-40">
                <div className="relative">
                   <div className="w-20 h-20 rounded-full border-2 border-dashed border-brand-primary/50 flex items-center justify-center animate-spin duration-[20s]">
                    <Network size={32} className="text-brand-primary" />
                  </div>
                  <Sparkles size={16} className="absolute -top-2 -right-2 text-brand-accent animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Awaiting Node Selection</p>
                  <p className="text-[10px] font-medium text-text-muted max-w-xs mx-auto leading-relaxed">Interact with the graph to deploy specific study paths and Master strategies.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
