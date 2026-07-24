import { useEffect, useRef } from "react";
import { HHMMSSToMs, msToHHMMSS } from "../helpers/function_helper";

const useDailySiteTime = () => {
    const startTimeRef = useRef(Date.now());
    const todayRef = useRef(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        startTimeRef.current = Date.now();
        const saveTime = () => {
            const now = Date.now();
            const sessionMs = now - startTimeRef.current;
            if (sessionMs <= 0) return;

            const store =
                JSON.parse(localStorage.getItem("dailySiteTime")) || {};

            const today = todayRef.current;

            // convert existing HH:mm:ss → ms
            const previousMs = HHMMSSToMs(store[today]);

            const totalMs = previousMs + sessionMs;

            // convert back to HH:mm:ss
            store[today] = msToHHMMSS(totalMs);

            localStorage.setItem("dailySiteTime", JSON.stringify(store));

            startTimeRef.current = Date.now();
        };

        // Refresh / close
        window.addEventListener("beforeunload", saveTime);

        // Tab switch
        const handleVisibility = () => {
            if (document.visibilityState === "hidden") {
                saveTime();
            } else {
                startTimeRef.current = Date.now();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            saveTime();
            window.removeEventListener("beforeunload", saveTime);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);
};

export default useDailySiteTime;
