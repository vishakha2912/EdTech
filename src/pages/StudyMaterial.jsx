import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Youtube, ArrowLeft, Sparkles, 
  Library, ExternalLink, GraduationCap,
  PlayCircle, Clock, UploadCloud, FileText, Trash2,
  Brain, ArrowRight, Download, Link as LinkIcon, Hash
} from 'lucide-react'
import { generateStudySheet } from '../lib/ai'

// Simple IndexedDB wrapper for persistent, large file storage
const DB_NAME = 'conceptbridge_uploads'
const STORE_NAME = 'user_files'

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const saveFile = async (fileData) => {
  const db = await initDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(fileData)
    tx.oncomplete = () => resolve()
  })
}

const getStoredFiles = async (subject) => {
  const db = await initDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      resolve(request.result.filter(f => f.subject === subject).sort((a,b) => b.id - a.id))
    }
  })
}

const deleteFile = async (id) => {
  const db = await initDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
  })
}

// Dummy data generator based on exam and subject
const generateMaterial = (exam, subject) => {
  const books = {
    'Physics': [
      { title: 'Concepts of Physics (Vol 1 & 2)', author: 'H.C. Verma', type: 'Concept Building' },
      { title: 'Fundamentals of Physics', author: 'Halliday, Resnick & Walker', type: 'Advanced Reference' },
      { title: 'Problems in General Physics', author: 'I.E. Irodov', type: 'Tough Practice (JEE Advanced)' }
    ],
    'Chemistry': [
      { title: 'Physical Chemistry', author: 'O.P. Tandon', type: 'Numericals' },
      { title: 'Organic Chemistry', author: 'Morrison & Boyd', type: 'Concept Building' },
      { title: 'Concise Inorganic Chemistry', author: 'J.D. Lee', type: 'Memorization/Reference' }
    ],
    'Mathematics': [
      { title: 'Objective Mathematics', author: 'R.D. Sharma', type: 'Core Practice' },
      { title: 'Calculus', author: 'Thomas & Finney', type: 'Concept Building' },
      { title: 'Coordinate Geometry', author: 'S.L. Loney', type: 'Advanced Reference' }
    ],
    'Biology': [
      { title: 'NCERT Biology Class 11 & 12', author: 'NCERT', type: 'Absolute Core (NEET)' },
      { title: 'Objective NCERT at your Fingertips', author: 'MTG', type: 'MCQ Practice' },
      { title: 'Trueman\'s Elementary Biology', author: 'Trueman', type: 'Advanced Reference' }
    ]
  }

  const defaultBooks = [
    { title: `Ultimate Guide to ${subject}`, author: 'Exam Prep Co.', type: 'Comprehensive Reference' },
    { title: `Previous Year Questions: ${exam} ${subject}`, author: 'ConceptBridge Team', type: 'Practice' }
  ]

  const channels = [
    { name: 'Physics Wallah', handle: '@PhysicsWallah', subs: '11M+', desc: `Best one-shots for ${exam}` },
    { name: 'Unacademy JEE/NEET', handle: '@Unacademy', subs: '8M+', desc: 'Detailed live lectures' },
    { name: 'Vedantu Master Classes', handle: '@Vedantu', subs: '5M+', desc: 'Concept short tricks' }
  ]

  // Dynamic Youtube search links for the playlists
  const playlists = [
    { title: `${exam} ${subject} One Shot Series`, time: '20+ Hours', query: `${exam} ${subject} one shot playlist marathon` },
    { title: `${subject} PYQs (Last 10 Years)`, time: '8+ Hours', query: `${exam} ${subject} PYQ previous year questions solved` },
    { title: `Most Expected ${subject} Questions`, time: '3+ Hours', query: `${exam} most expected questions ${subject} important` }
  ]

  return {
    books: books[subject] || defaultBooks,
    channels,
    playlists
  }
}

export default function StudyMaterial() {
  const { exam, subject } = useParams()
  const [material, setMaterial] = useState(null)
  const [uploads, setUploads] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState(null)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  
  useEffect(() => {
    // Simulate loading to show off smooth UI
    const timer = setTimeout(() => {
      setMaterial(generateMaterial(exam, subject))
    }, 400)
    
    // Load local custom uploads
    getStoredFiles(subject).then(files => setUploads(files))
    
    return () => clearTimeout(timer)
  }, [exam, subject])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const newFile = {
        id: Date.now().toString(),
        subject,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type,
        dataUrl: event.target.result,
        date: new Date().toLocaleDateString()
      }
      await saveFile(newFile)
      setUploads(prev => [newFile, ...prev])
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteFile = async (id) => {
    if (confirm('Are you sure you want to delete this file?')) {
      await deleteFile(id)
      setUploads(prev => prev.filter(f => f.id !== id))
    }
  }

  const handleGenerateNotes = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setGeneratingNotes(true)
    setNotes(null)
    try {
      const response = await generateStudySheet(exam, subject, query)
      if (response) {
        setNotes(response)
      }
    } catch(err) { console.error(err) }
    setGeneratingNotes(false)
  }

  const handleDownloadNotes = () => {
    if (!notes) return
    
    let formulasHtml = ''
    if (notes.formulas && notes.formulas.length > 0) {
      formulasHtml = `<h3>Key Formulas</h3><ul>` + notes.formulas.map(f => `<li><strong>${f.name}:</strong> <code>${f.equation}</code><br/><small>${f.variables}</small></li>`).join('') + `</ul>`
    }

    let subtopicsHtml = `<h3>Subtopics & Concepts</h3><ul>` + (notes.subtopics || []).map(s => `<li><strong>${s.name}:</strong> ${s.explanation}</li>`).join('') + `</ul>`
    let relatedHtml = `<h3>Related & Prerequisite Topics</h3><ul>` + (notes.relatedTopics || []).map(r => `<li><strong>${r.name}:</strong> ${r.reason}</li>`).join('') + `</ul>`

    const docHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${notes.title}</title></head>
        <body style="font-family: Arial, sans-serif; p, li { line-height: 1.6; }">
          <h1 style="color: #2b2b2b; border-bottom: 2px solid #10b981; padding-bottom: 10px; font-size: 24pt;">${notes.title}</h1>
          <p><strong>Subject:</strong> ${subject} &nbsp;|&nbsp; <strong>Exam:</strong> ${exam}</p>
          <hr />
          <h2>Definition</h2>
          <p>${notes.definition}</p>
          
          ${formulasHtml}
          ${subtopicsHtml}
          ${relatedHtml}
          
          <br />
          <div style="background-color: #f1f5f9; padding: 15px; border-left: 5px solid #10b981;">
             <h3 style="margin-top: 0; color: #10b981;">Pro Tip</h3>
             <p style="font-style: italic;">${notes.proTip}</p>
          </div>
          <br />
          <p style="font-size: 10pt; color: grey; text-align: center;">Generated automatically by ConceptBridge AI</p>
        </body>
      </html>
    `
    
    const blob = new Blob(['\ufeff', docHTML], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${notes.title.replace(/\s+/g, '_')}_StudySheet.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!material) {
    return (
      <div className="h-[80vh] flex flex-col justify-center items-center gap-4">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
         <p className="text-text-muted font-bold animate-pulse">Curating the best resources for {subject}...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 page-transition">
      {/* Navigation & Header */}
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Dashboard</span>
        </Link>
        
        <div className="bg-gradient-to-r from-brand-secondary/20 to-transparent p-8 md:p-10 rounded-3xl border border-brand-secondary/20 relative overflow-hidden">
          <div className="z-10 relative">
            <p className="text-brand-secondary font-bold text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <Library size={14} /> Official Study Hub
            </p>
            <h1 className="text-4xl md:text-5xl font-black font-sans tracking-tight mb-3">
              {subject} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Mastery</span>
            </h1>
            <p className="text-text-muted font-medium text-sm md:text-base max-w-2xl">
              Access curated video lectures, recommended books, and AI-generated notes specifically tailored for your <span className="text-white font-bold">{exam}</span> preparation.
            </p>
          </div>
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-brand-secondary/20 rounded-full blur-[100px] -z-0 pointer-events-none" />
          <BookOpen size={200} className="absolute -bottom-10 -right-10 text-white opacity-[0.03] pointer-events-none -rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Video & Playlists) */}
        <div className="lg:col-span-2 space-y-8">
          {/* YouTube Playlists Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 px-2">
                <Youtube size={28} className="text-red-500" />
                <h2 className="text-2xl font-black tracking-tight">Best Video Lectures</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {material.playlists.map((pl, i) => (
                 <a 
                   key={i} 
                   href={`https://www.youtube.com/results?search_query=${encodeURIComponent(pl.query)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="glass-card p-6 flex flex-col justify-between h-40 group hover:border-red-500/30 transition-all cursor-pointer relative overflow-hidden"
                 >
                   <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <PlayCircle size={100} />
                   </div>
                   <div className="space-y-2 relative z-10">
                     <p className="text-xs font-black text-red-500 uppercase tracking-widest">{exam} • {subject}</p>
                     <h3 className="font-bold text-lg leading-tight group-hover:text-red-400 transition-colors">{pl.title}</h3>
                   </div>
                   <div className="flex items-center gap-2 mt-4 text-xs font-bold text-text-muted relative z-10">
                      <Clock size={14} /> {pl.time} 
                      <span className="ml-auto flex items-center gap-1 group-hover:text-white transition-colors">
                        Watch Now <ExternalLink size={12} />
                      </span>
                   </div>
                 </a>
               ))}
             </div>
          </section>

          {/* Book Recommendations Section */}
          <section className="space-y-4 pt-4">
             <div className="flex items-center gap-3 px-2">
                <BookOpen size={28} className="text-brand-primary" />
                <h2 className="text-2xl font-black tracking-tight">Standard References</h2>
             </div>
             <div className="space-y-3">
               {material.books.map((book, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--color-surface-card-hover)] transition-colors"
                 >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded border border-brand-primary/20 flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/5">
                        <BookOpen size={20} className="text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white mb-1">{book.title}</h3>
                        <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                          <span className="text-white/70">{book.author}</span>
                          <span className="text-[10px] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded text-white/50">{book.type}</span>
                        </p>
                      </div>
                    </div>
                    <a 
                      href={`https://www.amazon.in/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      Find Book <ExternalLink size={14} />
                    </a>
                 </motion.div>
               ))}
             </div>
          </section>

          {/* Personal Library (Uploads) Section */}
          <section className="space-y-4 pt-4 pb-8">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <Library size={28} className="text-yellow-400" />
                   <h2 className="text-2xl font-black tracking-tight">Your Personal Library</h2>
                </div>
                <div>
                   <label className="cursor-pointer bg-brand-primary text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform flex items-center gap-2">
                      <UploadCloud size={16} /> {isUploading ? 'UPLOADING...' : 'UPLOAD NOTES'}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={handleUpload} disabled={isUploading} />
                   </label>
                </div>
             </div>
             
             {uploads.length === 0 ? (
               <div className="glass-card p-8 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface-card-hover)] flex items-center justify-center mb-4">
                     <UploadCloud size={32} className="text-text-muted" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">No custom notes yet</h3>
                  <p className="text-sm text-text-muted max-w-sm">Upload your own handwritten notes, downloaded PDFs, or reference books to access them anytime, anywhere.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <AnimatePresence>
                   {uploads.map((file, i) => (
                     <motion.div 
                       key={file.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="glass-card p-5 group flex flex-col justify-between hover:border-yellow-400/30 transition-all border border-[var(--color-border)] relative"
                     >
                        <div className="flex items-start gap-4 mb-4">
                           <div className="p-3 bg-yellow-400/10 rounded-xl text-yellow-500 shrink-0">
                             <FileText size={24} />
                           </div>
                           <div className="overflow-hidden w-full pr-6">
                              <h3 className="font-bold text-sm truncate" title={file.name}>{file.name}</h3>
                              <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-1">
                                {file.size} • {file.date}
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={file.dataUrl} 
                            download={file.name}
                            onClick={(e) => {
                              // If it's a large file, the browser might take a moment to assemble the download
                              e.currentTarget.classList.add('opacity-50')
                              setTimeout(() => e.currentTarget.classList.remove('opacity-50'), 1000)
                            }}
                            className="bg-[var(--color-surface-card-hover)] flex-1 py-2 text-center text-xs font-black rounded-lg hover:bg-yellow-400 hover:text-black transition-colors"
                          >
                            DOWNLOAD
                          </a>
                          <button 
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
             )}
          </section>
        </div>

        {/* Right Column (AI & Extra Tools) */}
        <div className="space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-[#10b981]/10 to-transparent border-[#10b981]/20">
            <Sparkles size={32} className="text-[#10b981] mb-4" />
            <h3 className="text-xl font-black mb-2">Instant AI Notes Generator</h3>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Don't have time to read a 500-page book? Enter a topic related to {subject} to instantly generate a tailored study sheet.
            </p>
            
            <form onSubmit={handleGenerateNotes} className="relative mb-4">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Thermodynamics, Optics..."
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-[#10b981]/50 outline-none"
              />
              <button 
                type="submit" disabled={generatingNotes || !query.trim()}
                className="absolute right-2 top-2 p-1.5 bg-[#10b981] text-white rounded-lg disabled:opacity-50"
              >
                {generatingNotes ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : <ArrowRight size={16} />}
              </button>
            </form>

            <AnimatePresence>
              {notes && (
                <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="p-5 bg-[var(--color-surface-card-hover)] border border-[#10b981]/20 rounded-xl mt-4 space-y-4">
                  <h4 className="font-black text-xl text-[#10b981] border-b border-[#10b981]/20 pb-2">{notes.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed"><strong>Definition:</strong> {notes.definition}</p>
                  
                  {notes.formulas && notes.formulas.length > 0 && (
                     <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-text-primary flex items-center gap-1"><Hash size={12}/> Formulas</p>
                        {notes.formulas.map((f, i) => (
                           <div key={i} className="bg-black/20 p-2 rounded border border-[var(--color-border)]">
                              <p className="text-sm font-bold">{f.name}: <span className="text-amber-400 font-mono tracking-wider">{f.equation}</span></p>
                              <p className="text-[10px] text-text-muted mt-1">{f.variables}</p>
                           </div>
                        ))}
                     </div>
                  )}

                  {notes.subtopics && notes.subtopics.length > 0 && (
                     <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-text-primary flex items-center gap-1"><BookOpen size={12}/> Key Concepts</p>
                        <ul className="list-disc pl-4 space-y-1">
                           {notes.subtopics.map((s, i) => (
                              <li key={i} className="text-xs text-text-muted"><strong className="text-text-primary">{s.name}:</strong> {s.explanation}</li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {notes.relatedTopics && notes.relatedTopics.length > 0 && (
                     <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-brand-primary flex items-center gap-1"><LinkIcon size={12}/> Related Topics</p>
                        <div className="flex flex-wrap gap-2">
                           {notes.relatedTopics.map((r, i) => (
                              <div key={i} className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] px-2 py-1 rounded" title={r.reason}>
                                 {r.name}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="bg-[#10b981]/10 p-3 rounded-lg border-l-2 border-[#10b981]">
                     <p className="text-[10px] font-black text-[#10b981] uppercase mb-1">PRO TIP</p>
                     <p className="text-xs italic text-text-muted">{notes.proTip}</p>
                  </div>

                  <button 
                    onClick={handleDownloadNotes}
                    className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-white text-black font-black rounded-lg hover:bg-[#10b981] hover:text-white transition-all text-xs shadow-md"
                  >
                    DOWNLOAD AS WORD DOC <Download size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-card p-8 bg-gradient-to-bl from-brand-primary/10 to-transparent border-brand-primary/20">
            <GraduationCap size={32} className="text-brand-primary mb-4" />
            <h3 className="text-xl font-black mb-2">Ready to test?</h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Once you have studied the material, put your knowledge to the test. Take the {subject} mock exam.
            </p>
            <Link 
              to={`/practice/${exam}/${subject}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary/20 text-brand-primary border border-brand-primary font-black rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg shadow-brand-primary/20"
            >
              Start {subject} Mock Test <PlayCircle size={18} />
            </Link>
          </div>
          
          <div className="glass-card p-6 space-y-4">
             <h3 className="font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Youtube size={16}/> Top Channels</h3>
             <div className="space-y-4 mt-2">
                {material.channels.map((ch, i) => (
                   <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ch.name)}`} target="_blank" rel="noopener noreferrer" className="block group">
                      <p className="font-bold text-sm group-hover:text-red-400 transition-colors">{ch.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] font-bold text-text-muted">{ch.handle}</span>
                        <span className="text-[10px] font-bold text-text-muted bg-white/5 px-2 py-0.5 rounded">{ch.subs}</span>
                      </div>
                   </a>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
