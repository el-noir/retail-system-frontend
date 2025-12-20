'use client'

import React from 'react'

import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'

type Metric = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
}

type Activity = {
  title: string
  time: string
  meta: string
}

type Deal = {
  company: string
  owner: string
  stage: string
  amount: string
  probability: string
}

const metrics: Metric[] = [
  { label: 'Monthly Recurring Revenue', value: '$128,400', delta: '+12.4%', trend: 'up' },
  { label: 'New Leads', value: '482', delta: '+8.1%', trend: 'up' },
  { label: 'Avg. Deal Size', value: '$4,980', delta: '-2.3%', trend: 'down' },
  { label: 'Churn Rate', value: '1.4%', delta: '-0.2%', trend: 'up' },
]

const activities: Activity[] = [
  { title: 'Follow-up: Umbra Labs', time: '09:20', meta: 'Call | High intent' },
  { title: 'Demo: Northwind', time: '11:00', meta: 'Meet | Account exec' },
  { title: 'Proposal review: Lumio', time: '14:30', meta: 'Doc | Legal pending' },
  { title: 'Quarterly sync: CoreX', time: '16:00', meta: 'Meet | Renewal' },
]

const deals: Deal[] = [
  { company: 'Umbra Labs', owner: 'A. Patel', stage: 'Negotiation', amount: '$86,000', probability: '65%' },
  { company: 'Northwind', owner: 'M. Zhang', stage: 'Demo', amount: '$24,500', probability: '45%' },
  { company: 'Lumio', owner: 'S. Reyes', stage: 'Proposal', amount: '$41,200', probability: '55%' },
  { company: 'CoreX', owner: 'J. Novak', stage: 'Renewal', amount: '$63,800', probability: '72%' },
]

const sparklineValues = [68, 72, 64, 76, 80, 78, 85, 92]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(200px,15%),1fr] lg:items-start">
          <Sidebar />

          <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">Growth dashboard</p>
                <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Welcome back, team</h1>
                <p className="text-sm text-slate-300">Your pipeline, performance, and rituals for today.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Today</p>
                  <p className="text-sm font-medium text-white">Dec 20, 2025</p>
                </div>
              </div>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_14px_60px_-20px_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:shadow-[0_20px_70px_-25px_rgba(16,185,129,0.6)]"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-2xl font-semibold text-white">{metric.value}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        metric.trend === 'up'
                          ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30'
                          : 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30'
                      }`}
                    >
                      {metric.delta}
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${metric.trend === 'up' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                      style={{ width: metric.trend === 'up' ? '76%' : '48%' }}
                    />
                  </div>
                </article>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <article className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_14px_70px_-24px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Revenue velocity</p>
                    <h2 className="text-xl font-semibold text-white">Rolling 8 week cadence</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">Updated 2h ago</div>
                </div>
                <div className="mt-6 grid grid-cols-8 gap-3">
                  {sparklineValues.map((value, index) => (
                    <div key={index} className="relative flex h-40 items-end rounded-xl bg-gradient-to-b from-white/5 to-white/0">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-emerald-400 to-teal-500 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.8)]"
                        style={{ height: `${value}%` }}
                      />
                      <span className="absolute inset-x-0 -bottom-7 text-center text-xs text-slate-400">W{index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500" />
                  <div>
                    <p className="font-semibold">Momentum holds steady</p>
                    <p className="text-emerald-100/80">Top quartile weeks are compounding. Keep deal cycles under 21 days to sustain velocity.</p>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_14px_70px_-24px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Today&apos;s rituals</p>
                    <h2 className="text-xl font-semibold text-white">Action queue</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">4 items</span>
                </div>
                <div className="mt-6 space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.title}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)]"
                    >
                      <div>
                        <p className="font-medium text-white">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.meta}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100 ring-1 ring-white/10">{activity.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
                  <p className="font-semibold">Reminder</p>
                  <p className="text-emerald-100/80">Close loops within 24h to keep NPS above 60.</p>
                </div>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_14px_70px_-24px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sales pipeline</p>
                    <h2 className="text-xl font-semibold text-white">Stage distribution</h2>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">This week</span>
                </div>
                <div className="mt-6 space-y-3">
                  {[['Prospecting', 38], ['Discovery', 52], ['Proposal', 44], ['Negotiation', 60], ['Closed Won', 24]].map(
                    ([stage, value]) => (
                      <div key={stage}>
                        <div className="flex items-center justify-between text-sm text-slate-200">
                          <span>{stage}</span>
                          <span className="text-slate-400">{value}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="font-semibold text-white">Next best actions</p>
                  <p className="text-slate-300">Push proposal approvals and guard against elongating negotiation cycles.</p>
                </div>
              </article>

              <article className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_14px_70px_-24px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Deals</p>
                    <h2 className="text-xl font-semibold text-white">Active opportunities</h2>
                  </div>
                  <Button className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100 shadow-[0_10px_30px_-18px_rgba(16,185,129,0.7)] transition hover:border-emerald-300/80 hover:text-white">
                    Add deal
                  </Button>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-5 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.14em] text-slate-400">
                    <span>Company</span>
                    <span>Owner</span>
                    <span>Stage</span>
                    <span>Amount</span>
                    <span>Probability</span>
                  </div>
                  <div className="divide-y divide-white/10 bg-white/5">
                    {deals.map((deal) => (
                      <div
                        key={deal.company}
                        className="grid grid-cols-5 items-center px-4 py-3 text-sm text-slate-100 hover:bg-white/5"
                      >
                        <span className="font-medium text-white">{deal.company}</span>
                        <span className="text-slate-300">{deal.owner}</span>
                        <span className="text-slate-300">{deal.stage}</span>
                        <span className="font-semibold text-white">{deal.amount}</span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-center text-xs text-slate-100 ring-1 ring-white/10">
                          {deal.probability}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
