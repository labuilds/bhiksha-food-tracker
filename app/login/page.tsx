'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithPasscode } from '@/app/actions/auth'

export default function LoginPage() {
    const [passcode, setPasscode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const router = useRouter()

    let typingTimeout: NodeJS.Timeout;

    const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasscode(e.target.value)
        setIsTyping(true)

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            setIsTyping(false);
        }, 300);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await loginWithPasscode(passcode)

        if (result.success) {
            router.push('/')
        } else {
            setError(result.error || 'Invalid passcode')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm glass-panel p-8 text-center flex flex-col items-center border-t-4 border-t-orange-500">

                <div className="relative w-32 h-32 mb-6 pointer-events-none select-none">
                    {/* Fallback styling directly on the img to ensure dimensions */}
                    <img
                        src="/sadhguru-bobble.png"
                        alt="Sadhguru Bobblehead"
                        className={`w-full h-full object-contain drop-shadow-md transition-all ${isTyping ? 'animate-bounce-reaction' : 'animate-bobblehead'}`}
                        onError={(e) => {
                            // Optionally hide or set placeholder if image is missing so it doesn't show broken icon
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23f3f4f6" /><text x="50" y="55" font-family="sans-serif" font-size="20" text-anchor="middle" fill="%239ca3af">Guru</text></svg>';
                        }}
                    />
                </div>

                <h1 className="text-2xl font-bold text-stone-800 mb-2">Welcome Back</h1>
                <p className="text-sm text-stone-500 mb-8">Enter the ashram passcode to access the Bhiksha Hall tracker.</p>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <div>
                        <input
                            type="password"
                            value={passcode}
                            onChange={handleType}
                            placeholder="Enter Passcode..."
                            className="w-full text-center tracking-widest text-lg font-bold"
                            required
                            suppressHydrationWarning
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || !passcode}
                        className="primary-btn w-full mt-2"
                    >
                        {loading ? 'Verifying...' : 'Enter Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    )
}
