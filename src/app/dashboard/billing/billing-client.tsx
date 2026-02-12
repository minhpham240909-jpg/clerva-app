'use client'

import { useState } from 'react'

interface BillingClientProps {
  profile: {
    subscription_status: string
    leads_used_this_month: number
    plan_lead_limit: number
    trial_ends_at: string
  }
}

export default function BillingClient({ profile }: BillingClientProps) {
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const isTrialing = profile.subscription_status === 'trialing'
  const isActive = profile.subscription_status === 'active'
  const trialDaysLeft = isTrialing
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0

  const usagePercent = Math.min(
    100,
    (profile.leads_used_this_month / profile.plan_lead_limit) * 100
  )

  async function handleUpgrade() {
    setCheckoutLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout')
        setCheckoutLoading(false)
      }
    } catch {
      setError('Failed to start checkout')
      setCheckoutLoading(false)
    }
  }

  async function handleManage() {
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to open billing portal')
      }
    } catch {
      setError('Failed to open billing portal')
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-gray-900 mb-1">Billing</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your subscription and track usage.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Current Plan
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium text-gray-900">
              {isActive ? 'Adecis Pro — $19/mo' : 'Free Trial'}
            </div>
            {isTrialing && (
              <div className="text-sm text-gray-500">
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} days remaining`
                  : 'Trial expired'}
              </div>
            )}
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800'
                : isTrialing && trialDaysLeft > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive
              ? 'Active'
              : isTrialing && trialDaysLeft > 0
                ? 'Trial'
                : 'Expired'}
          </span>
        </div>

        {/* Plan includes */}
        <div className="border-t pt-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            {isActive ? 'Your plan includes' : 'Free trial includes'}
          </p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span>{isActive ? '500 leads/month' : '25 leads/month'}</span>
                <p className="text-xs text-gray-400">Messages scored by AI per month</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span>{isActive ? 'Unlimited replies' : '5 replies/month'}</span>
                <p className="text-xs text-gray-400">Send AI-drafted replies with no cap</p>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Slack + email ingestion
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              AI scoring + draft replies
            </li>
          </ul>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-lg shadow-sm border p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Monthly Usage
        </h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Leads processed</span>
          <span className="font-medium text-gray-900">
            {profile.leads_used_this_month} / {profile.plan_lead_limit}
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className={`rounded-full h-2 transition-all ${
              usagePercent >= 90
                ? 'bg-red-500'
                : usagePercent >= 70
                  ? 'bg-yellow-500'
                  : 'bg-blue-600'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        {usagePercent >= 80 && !isActive && (
          <p className="text-xs text-amber-600 mt-2">
            You&apos;re running low on leads. Upgrade to Pro for 500/month.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!isActive && (
          <button
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="w-full bg-blue-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade to Pro — $19/mo'}
          </button>
        )}
        {isActive && (
          <button
            onClick={handleManage}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Manage Subscription
          </button>
        )}
      </div>
    </div>
  )
}
