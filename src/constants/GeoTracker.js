import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '../store/useUserStore';
import ApiClient from '../helpers/api_helper';
import { SHARE_LIVE_LOCATION } from '../helpers/url_helper';

const GeoTracker = () => {
    const lastSentRef = useRef(0);
    const { user: { userId } } = useUserStore();
    const isSendingRef = useRef(false);
    
    const sendLocationToAPI = useCallback(async (latitude, longitude) => {
        if (isSendingRef.current) return;
        isSendingRef.current = true;
        lastSentRef.current = Date.now();

        try {
            await ApiClient.post(
                `${SHARE_LIVE_LOCATION}userId=${userId}&latitude=${latitude}&longitude=${longitude}`
            );
            console.log('Location sent successfully');
        } catch (error) {
            console.error('Location send error:', error);
        } finally {
            setTimeout(() => {
                isSendingRef.current = false;
            }, 5000); // prevent multiple calls within 5 seconds
        }
    }, [userId]);

    useEffect(() => {
        if (!navigator.geolocation || !userId) {
            if (!userId) {
                console.error('User id not exists')
                return
            }
            console.error('Geolocation not supported by browser');
            return;
        }
        let currentCoords = { latitude: null, longitude: null };

        const handlePositionUpdate = (position) => {
            const { latitude, longitude } = position.coords;
            currentCoords = { latitude, longitude };

            const now = Date.now();
            if (now - lastSentRef.current >= 900000) {
                sendLocationToAPI(latitude, longitude);
            }
        };

        const geoWatchId = navigator.geolocation.watchPosition(
            handlePositionUpdate,
            (error) => console.error('Geolocation error:', error),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );

        const intervalId = setInterval(() => {
            const { latitude, longitude } = currentCoords;
            const now = Date.now();
            if (latitude && longitude && now - lastSentRef.current >= 900000) {
                sendLocationToAPI(latitude, longitude);
            }
        }, 60000); // Check every 1 min, but send only if 10 min passed

        return () => {
            navigator.geolocation.clearWatch(geoWatchId);
            clearInterval(intervalId);
        };
    }, [sendLocationToAPI, userId]);

    return null; // This component does not render anything
};

export default GeoTracker;