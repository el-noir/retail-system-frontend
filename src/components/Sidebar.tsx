import React from 'react'

import { Button } from './ui/button'

const navItems: { title: string; meta: string }[] = [
  { title: 'Overview', meta: 'Live pulse' },
  { title: 'Pipeline', meta: 'Stage health' },
  { title: 'Accounts', meta: 'Key renewals' },
  { title: 'Playbooks', meta: 'Rituals' },
  { title: 'Settings', meta: 'Preferences' },
]

export default function Sidebar() {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 shadow-[0_14px_70px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Team pod</p>
          <p className="text-sm font-semibold text-white">Growth Collective</p>
        </div>
      </div>
      <div className="mt-6 space-y-2 text-sm text-slate-200">
        {navItems.map(({ title, meta }) => (
          <Button
            key={title}
            variant="ghost"
            className="flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-2 text-left text-white transition hover:border-slate-700 hover:bg-slate-800/50"
          >
            <div className="text-left">
              <p className="font-medium text-white">{title}</p>
              <p className="text-xs text-slate-400">{meta}</p>
            </div>
            <span className="text-xs text-slate-500">→</span>
          </Button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
        <p className="font-semibold">Health score: 82</p>
        <p className="text-emerald-100/80">Maintain cadence; watch late-stage drift.</p>
      </div>
    </aside>
  )
}
