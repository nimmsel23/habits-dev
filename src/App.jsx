import { useState, useEffect } from 'react'
import { CheckSquare, LogIn, Loader } from 'lucide-react'
import { watchAuth, signIn, isLocalMode } from '@db'
import Habits from './views/Habits/index.jsx'
import Journal from '@journal/views/JournalVosView.jsx'

export default function App() {
  const [user, setUser]     = useState(undefined)
  const [signing, setSigning] = useState(false)
  const [activeTab, setActiveTab] = useState('habits')

  useEffect(() => {
    if (isLocalMode()) { setUser({ displayName: 'Local' }); return }
    return watchAuth(u => setUser(u ?? null))
  }, [])

  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0a0a0f' }}>
      <Loader size={24} style={{ color:'#475569' }} />
    </div>
  )

  if (!user) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0a0a0f', color:'#e2e8f0', gap:16 }}>
      <CheckSquare size={32} style={{ color:'#3b82f6' }} />
      <div style={{ fontSize:16, fontWeight:600 }}>Habits</div>
      <div style={{ fontSize:13, color:'#64748b' }}>Bitte anmelden um fortzufahren</div>
      <button
        onClick={async () => { setSigning(true); try { await signIn() } finally { setSigning(false) } }}
        disabled={signing}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'1px solid #334155', background:'#0f172a', color:'#e2e8f0', cursor:'pointer', fontSize:14 }}
      >
        <LogIn size={16} />{signing ? 'Anmelden…' : 'Mit Google anmelden'}
      </button>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg, #0a0a0f)', color:'var(--text, #e2e8f0)', fontFamily:'system-ui, sans-serif' }}>
      <header style={{ padding: '16px', display: 'flex', gap: '8px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
        <button 
          onClick={() => setActiveTab('habits')}
          style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'habits' ? '#3b82f6' : 'transparent', color: activeTab === 'habits' ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Habits
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'journal' ? '#f59e0b' : 'transparent', color: activeTab === 'journal' ? '#1e293b' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Journal
        </button>
      </header>
      <main style={{ padding: '16px' }}>
        {activeTab === 'habits' ? (
          <Habits />
        ) : (
          <Journal user={user} date={new Date()} />
        )}
      </main>
    </div>
  )
}
