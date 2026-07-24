import { useEffect, useRef } from 'react';
import ApiClient from '../helpers/api_helper';
import { useUserStore } from '../store/useUserStore';
import { SCREEN_TIME_END, SCREEN_TIME_START } from '../helpers/url_helper';

// ── Config ──────────────────────────────────────────────────────────────────
// const INACTIVITY_MS = 60_000;       // 60s with no activity → end session  [DISABLED]
const START_DEBOUNCE_MS = 300;      // wait this long before firing enter

// ── Module-level state (survives component remounts / StrictMode) ───────────
// Keyed by `${userId}:${screenName}` — one active session per user+screen pair.
const activeSessions = new Map();   // key → sessionId (string) | 'PENDING'

const getKey = (userId, screenName) => `${userId}:${screenName}`;

// ── Helpers ─────────────────────────────────────────────────────────────────
const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Unknown';
};

// Start a session if none exists yet for this user+screen
const startSession = async (userId, screenName) => {
    const key = getKey(userId, screenName);
    // Already starting or already started → bail
    if (activeSessions.has(key)) return;

    // Reserve the slot immediately so concurrent calls bail above
    activeSessions.set(key, 'PENDING');

    try {
        const resp = await ApiClient.post(SCREEN_TIME_START, {
            userId,
            screenName,
            platform: 'WEB',
            deviceInfo: null,
            browserName: getBrowserName(),
            appVersion: null,
        });
        if (resp?.data?.status === 1 && resp.data.data) {
            activeSessions.set(key, resp.data.data);
        } else {
            activeSessions.delete(key);   // failed → release lock
        }
    } catch (err) {
        activeSessions.delete(key);
        console.warn('[useScreenTime] start failed:', err.message);
    }
};

// End the active session for this user+screen
const endSession = async (userId, screenName, useBeacon = false) => {
    const key = getKey(userId, screenName);
    const sid = activeSessions.get(key);
    // Nothing active, or still pending the enter response → nothing to end
    if (!sid || sid === 'PENDING') return;

    activeSessions.delete(key);   // release lock immediately

    const url = `${SCREEN_TIME_END}?sessionId=${sid}`;
    if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(url);
    } else {
        try { await ApiClient.post(url); }
        catch (err) { console.warn('[useScreenTime] end failed:', err.message); }
    }
};

// ── Hook ────────────────────────────────────────────────────────────────────
export default function useScreenTime(screenName) {
    const userId = useUserStore((s) => s.user?.userId);
    const startDebounceRef = useRef(null);

    useEffect(() => {
        if (!userId || !screenName) return;

        // ── Debounced start: don't fire enter until things settle ───────────
        // StrictMode and rapid re-mounts cancel this timer before it fires,
        // so the enter API only hits when the component is *truly* stable.
        const scheduleStart = () => {
            if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
            startDebounceRef.current = setTimeout(() => {
                startSession(userId, screenName);
            }, START_DEBOUNCE_MS);
        };

        // Tab visibility — pause on hide, resume on show
        const handleVisibility = () => {
            if (document.hidden) {
                endSession(userId, screenName, false);
            } else {
                // Tab back in focus → start a new session if none active
                const key = getKey(userId, screenName);
                if (!activeSessions.has(key)) scheduleStart();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        // Tab/window close — fire-and-forget via Beacon
        const handleUnload = () => endSession(userId, screenName, true);
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pagehide', handleUnload);

        // Start on mount (debounced)
        scheduleStart();

        // ── Cleanup — runs when user navigates away from this screen ────────
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('pagehide', handleUnload);

            // Cancel pending debounced start — kills the StrictMode duplicate
            if (startDebounceRef.current) clearTimeout(startDebounceRef.current);

            endSession(userId, screenName, false);
        };
    }, [userId, screenName]);
}