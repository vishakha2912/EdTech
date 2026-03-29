import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { 
  Network, 
  Info, 
  ChevronRight, 
  Search, 
  Filter, 
  Lock, 
  Zap,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const initialData = {
  nodes: [
    { id: 'Newton\'s Laws', subject: 'Physics', group: 1, val: 20 },
    { id: 'Circular Motion', subject: 'Physics', group: 1, val: 15 },
    { id: 'Magnetic Fields', subject: 'Physics', group: 1, val: 18 },
    { id: 'Electromagnetism', subject: 'Physics', group: 1, val: 25 },
    { id: 'Centripetal Force', subject: 'Physics', group: 1, val: 12 },
    { id: 'Lorentz Force', subject: 'Physics', group: 1, val: 14 },
    { id: 'Cell Biology', subject: 'Biology', group: 2, val: 22 },
    { id: 'Genetics', subject: 'Biology', group: 2, val: 24 },
    { id: 'Mendelian Genetics', subject: 'Biology', group: 2, val: 18 },
    { id: 'Meiosis', subject: 'Biology', group: 2, val: 15 },
    { id: 'Bio-Electricity', subject: 'Cross-Subject', group: 3, val: 10 },
  ],
  links: [
    { source: 'Newton\'s Laws', target: 'Circular Motion' },
    { source: 'Circular Motion', target: 'Centripetal Force' },
    { source: 'Magnetic Fields', target: 'Lorentz Force' },
    { source: 'Electromagnetism', target: 'Lorentz Force' },
    { source: 'Centripetal Force', target: 'Lorentz Force' },
    { source: 'Cell Biology', target: 'Genetics' },
    { source: 'Genetics', target: 'Mendelian Genetics' },
    { source: 'Meiosis', target: 'Mendelian Genetics' },
    { source: 'Cell Biology', target: 'Meiosis' },
    { source: 'Magnetic Fields', target: 'Bio-Electricity' },
    { source: 'Cell Biology', target: 'Bio-Electricity' },
  ]
}

export default function ConceptGraph() {
  const svgRef = useRef()
  const location = useLocation()
  
  const [isPremium, setIsPremium] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [passcode, setPasscode] = useState('')

  const targetTopics = location.state?.targetTopics || (location.state?.targetTopic ? [location.state?.targetTopic] : null)

  // Build a specialized, isolated graph based on ONLY the weak topic areas from mistakes
  const [graphData] = useState(() => {
    if (targetTopics && targetTopics.length > 0) {
      // Build a CLEAN, isolated graph — no mixing with the base data
      const nodes = []
      const links = []
      
      targetTopics.forEach((topic, idx) => {
        const fundamentalsId = topic + ' — Basics'
        const advancedId = topic + ' — Advanced'
        const prereqId = topic + ' — Prerequisites'
        
        nodes.push({ id: topic, subject: 'Weak Area', group: 3, val: 32 })
        nodes.push({ id: fundamentalsId, subject: 'Core Fundamentals', group: 1, val: 22 })
        nodes.push({ id: advancedId, subject: 'Next Level', group: 2, val: 16 })
        nodes.push({ id: prereqId, subject: 'Must Know Before', group: 1, val: 18 })
        
        // Each cluster is fully independent — no cross-topic links
        links.push({ source: prereqId, target: fundamentalsId })
        links.push({ source: fundamentalsId, target: topic })
        links.push({ source: topic, target: advancedId })
      })
      
      return { nodes, links }
    }
    
    // Default: return the original static graph for the sidebar navigation
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
    if (passcode === 'EDTECH2026' || passcode === 'admin123') {
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

    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border') || 'rgba(150,150,150,0.3)'
    const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted') || '#94a3b8'

    // ── STATIC LAYOUT: Pre-assign fixed x,y positions ──────────────
    // For weakness analysis mode: arrange each cluster as a vertical chain side by side
    // For default mode: use a simple force simulation but instantly freeze it
    const nodes = graphData.nodes.map(n => ({ ...n }))
    const links = graphData.links.map(l => ({ ...l }))

    if (targetTopics && targetTopics.length > 0) {
      // Static vertical chain layout per topic cluster
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
          nodePositions[name] = {
            x: cx,
            y: 80 + rowIdx * rowGap
          }
        })
      })
      
      nodes.forEach(n => {
        if (nodePositions[n.id]) {
          n.fx = nodePositions[n.id].x
          n.fy = nodePositions[n.id].y
          n.x = n.fx
          n.y = n.fy
        }
      })
    } else {
      // Default graph: run simulation briefly then freeze
      const sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(110))
        .force('charge', d3.forceManyBody().strength(-280))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .stop()
      // Run 300 ticks instantly to settle positions
      for (let i = 0; i < 300; i++) sim.tick()
      // Freeze all nodes
      nodes.forEach(n => { n.fx = n.x; n.fy = n.y })
    }

    // Resolve link source/target to node objects for positioning
    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
    const resolvedLinks = links.map(l => ({
      source: typeof l.source === 'string' ? nodeById[l.source] : l.source,
      target: typeof l.target === 'string' ? nodeById[l.target] : l.target
    })).filter(l => l.source && l.target)

    // Draw links
    svg.append('g')
      .attr('stroke', borderColor)
      .attr('stroke-opacity', 0.7)
      .selectAll('line')
      .data(resolvedLinks)
      .join('line')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    // Draw nodes
    const nodeG = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => setSelectedNode(d))

    nodeG.append('circle')
      .attr('r', d => d.val)
      .attr('fill', d => {
        if (d.group === 3) return '#ec4899'
        if (d.group === 2) return '#3b82f6'
        return '#8b5cf6'
      })
      .attr('filter', 'drop-shadow(0 0 10px rgba(139,92,246,0.4))')

    nodeG.append('text')
      .text(d => d.id)
      .attr('x', 0)
      .attr('y', d => d.val + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', textMuted)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter')

  }, [isPremium, graphData])

  return (
    <div className="h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 page-transition">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black font-sans tracking-tight mb-2">
            {targetTopics ? "Weakness Analysis " : "Concept "} <span className="gradient-text">Graph</span>
          </h1>
          <p className="text-text-muted font-medium flex items-center gap-2">
            <Network size={18} className="text-brand-primary" /> Visualizing {targetTopics ? targetTopics.length + ' Knowledge Gaps' : '42 mastered concepts'}.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 glass-card px-4 py-2 text-xs font-bold text-text-muted">
            <Search size={14} /> Search Concepts
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 text-xs font-bold text-text-muted">
            <Filter size={14} /> Filter Subjects
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
        {/* Graph Display */}
        <div className="lg:col-span-3 glass-card relative overflow-hidden shadow-2xl bg-[var(--color-surface-card)]">
          {!isPremium && (
             <div className="absolute inset-0 z-20 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center space-y-8 group overflow-hidden" style={{backgroundColor: 'rgba(var(--color-background-rgb), 0.7)'}}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
                <div className="w-24 h-24 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-primary/40 relative z-10 group-hover:rotate-12 transition-transform">
                  <LockKeyhole size={40} className="text-white fill-white" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h2 className="text-4xl font-black tracking-tight leading-tight">Visualize your <span className="gradient-text">Neural Network</span></h2>
                  <p className="text-text-muted font-medium max-w-sm mx-auto leading-relaxed">Upgrade to Pro to unlock the interactive Concept Bridge graph and see hidden links between subjects.</p>
                </div>
                <div className="space-y-4 relative z-10 flex flex-col items-center">
                  <input 
                    type="password" 
                    placeholder="Enter Secret Passcode" 
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    className="px-6 py-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center text-lg font-bold w-64 focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                  />
                  <button 
                    onClick={handleUnlock}
                    className="primary-btn py-4 px-10 border border-brand-primary text-lg font-black shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-4 w-64"
                  >
                    Unlock Superpowers
                  </button>
                </div>
             </div>
          )}
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        {/* Info Panel */}
        <div className="glass-card p-8 space-y-8 overflow-y-auto max-h-full no-scrollbar relative min-h-64">
          {!isPremium && <div className="absolute inset-0 backdrop-blur-[2px] z-10 rounded-2xl" style={{backgroundColor: 'rgba(var(--color-background-rgb), 0.4)'}} />}
          
          <h3 className="text-xl font-bold font-sans flex items-center gap-2">
            <Info size={20} className="text-brand-primary" /> Concept Details
          </h3>
          
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
                   <label className="text-[10px] font-black tracking-widest text-brand-primary uppercase">Current Node</label>
                   <p className="text-2xl font-black mt-2 leading-tight">{selectedNode.id}</p>
                   <span className="inline-block mt-3 px-3 py-1 rounded-full bg-[var(--color-surface-card-hover)] border border-[var(--color-border)] text-[10px] font-bold text-text-muted uppercase tracking-widest">{selectedNode.subject}</span>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">Linked Nodes</label>
                  <div className="space-y-2">
                    {graphData.links.filter(l => {
                      const srcId = typeof l.source === 'string' ? l.source : l.source?.id
                      const tgtId = typeof l.target === 'string' ? l.target : l.target?.id
                      return srcId === selectedNode.id || tgtId === selectedNode.id
                    }).map((l, i) => {
                      const srcId = typeof l.source === 'string' ? l.source : l.source?.id
                      const tgtId = typeof l.target === 'string' ? l.target : l.target?.id
                      const other = srcId === selectedNode.id ? tgtId : srcId
                      const isParent = tgtId === selectedNode.id
                      return (
                        <div key={i} onClick={() => setSelectedNode(graphData.nodes.find(n => n.id === other))} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-card-hover)] border border-[var(--color-border)] group hover:border-brand-primary/50 transition-colors cursor-pointer">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary block mb-0.5">{isParent ? '⬆ Prerequisite' : '⬇ Next Step'}</span>
                            <span className="text-sm font-semibold text-text-muted group-hover:text-text-primary transition-colors">{other}</span>
                          </div>
                          <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Subtopics to study for this concept */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">Subtopics to Study</label>
                  <div className="space-y-2">
                    {[
                      selectedNode.id.replace(' — Basics','').replace(' — Advanced','').replace(' — Prerequisites',''),
                    ].map(baseTopic => [
                      { title: 'Core Definition', desc: 'Understand the exact definition and scope of ' + baseTopic },
                      { title: 'Key Formulas', desc: 'Memorize all standard equations used in ' + baseTopic + ' problems' },
                      { title: 'Problem Types', desc: 'Practice the 3 most common question types in ' + baseTopic },
                      { title: 'Common Mistakes', desc: 'Identify unit errors and sign mistakes in ' + baseTopic },
                      { title: 'Cross Links', desc: 'Understand how ' + baseTopic + ' connects to adjacent topics' },
                    ]).flat().map((sub, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-card-hover)] border border-[var(--color-border)]">
                        <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-brand-primary">{idx+1}</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-text-primary">{sub.title}</p>
                          <p className="text-[10px] text-text-muted leading-relaxed mt-0.5">{sub.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 space-y-4">
                  <p className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Master Strategy
                  </p>
                  <p className="text-sm font-medium leading-relaxed font-sans text-text-primary/80 italic">
                    "This concept is the anchor for {graphData.links.filter(l => (l.source.id === selectedNode.id || l.target.id === selectedNode.id)).length} cross-bridge topics. Master its fundamentals to stop losing marks in Practice Mock tests."
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40 py-20 pb-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center animate-spin duration-10000">
                  <Network size={24} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Select a node</p>
                  <p className="text-[10px] mt-2 font-medium text-text-muted max-w-xs leading-relaxed">Click on any concept in the graph to view relationships and Master insights.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
