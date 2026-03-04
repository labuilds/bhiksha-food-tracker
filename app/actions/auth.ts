'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginWithPasscode(passcode: string) {
    const correctPasscode = process.env.APP_PASSCODE;

    if (correctPasscode && passcode === correctPasscode) {
        const cookieStore = await cookies();
        cookieStore.set('bhiksha_auth', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        return { success: true };
    }

    return { success: false, error: 'Invalid Passcode' };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('bhiksha_auth');
    redirect('/login');
}
