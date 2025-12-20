import React from 'react'

import { Button } from './ui/button'
import Link from 'next/dist/client/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500" />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Store Master</p>
            <p className="text-sm font-semibold text-white">Your Store</p>
          </div>
        </div>

        <div className="flex items-center gap-3">

        <Link href="/sign-up">  <Button variant="ghost"
        className='hidden rounded-full bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400 transition hover:bg-emerald-500/20 hover:text-emerald-300 sm:inline-flex' >Sign Up</Button></Link>

        <Link href="/sign-in">

        <Button variant="outline" 
        className='hidden rounded-full border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-400/40 hover:text-white sm:inline-flex' >Login</Button></Link>
        </div>
      </div>
    </nav>
  )
}
