import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-gray-900">Adecis</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Know which leads are worth your time.
            <br />
            <span className="text-blue-600">Before you read them.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Adecis scores every inbound lead that arrives in your Slack or
            email, tells you what matters, and drafts a reply you can actually
            send. Built for freelancers and agencies who choose their clients.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white rounded-md px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <span className="text-sm text-gray-400">
              7 days free. No credit card.
            </span>
          </div>
        </div>

        {/* Live example */}
        <div className="mt-16 bg-gray-50 rounded-xl border p-6 max-w-xl">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">
            What you see when a lead arrives
          </p>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 py-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    HIGH
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Sarah from Maple Bakery
                  </span>
                </div>
                <span className="text-xs text-gray-400">Slack</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-0.5 mb-3">
                <li>• Needs full website redesign, budget $3-5k</li>
                <li>• Timeline: launch by March</li>
                <li>• Current site is outdated (2019)</li>
              </ul>
              <div className="bg-gray-50 rounded-md p-2.5 text-sm text-gray-500 italic">
                &quot;Hi Sarah, thanks for reaching out. A redesign sounds like a
                great fit — I&apos;d love to learn more about your vision.
                Want to grab 30 minutes this week?&quot;
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  Send Reply
                </span>
                <span className="text-xs text-gray-400">
                  Copy reply
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            How it works
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Set up in 2 minutes. Get value from your first inbound message.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border p-5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Lead arrives
              </h3>
              <p className="text-sm text-gray-500">
                Someone messages your Slack channel or emails your contact form.
                Adecis picks it up instantly.
              </p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                AI scores it
              </h3>
              <p className="text-sm text-gray-500">
                Intent score, clear summary, and a draft reply — all in under 5
                seconds. Conservative scoring you can trust.
              </p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                You reply faster
              </h3>
              <p className="text-sm text-gray-500">
                Send the AI-drafted reply directly, edit it, or copy it.
                Never miss a good client again.
              </p>
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Built for decision-heavy freelancers
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            If you regularly evaluate inbound requests and decide which work to take, Adecis saves you hours.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Web & app developers',
              'UI/UX & brand designers',
              'Marketing consultants',
              'Growth & ads specialists',
              'SEO agencies',
              'Tech consultants',
              'No-code builders',
              'Productized service founders',
            ].map((role) => (
              <div
                key={role}
                className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-md px-3 py-2"
              >
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {role}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Simple pricing
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            One plan. Everything included. No usage surprises.
          </p>
          <div className="bg-white rounded-lg border p-6 max-w-sm">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">$19</span>
              <span className="text-lg text-gray-500">/mo</span>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                500 leads per month
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited replies
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
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                7-day free trial
              </li>
            </ul>
            <Link
              href="/signup"
              className="mt-6 block text-center bg-blue-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              No credit card required
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Adecis — AI lead scoring for freelancers and agencies.</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-600">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-gray-600">
              Start Free Trial
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
