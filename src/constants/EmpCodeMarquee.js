import React from "react";
import { useUserStore } from "../store/useUserStore";

export default function EmpCodeMarquee() {
    const empCode = useUserStore((state) => state.user.empCode);

    if (!empCode) return null;

    return (
        <>
            <style>{`
                .empcode-watermark {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    grid-auto-rows: 120px;
                    align-items: center;
                    justify-items: center;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                    overflow: hidden;
                }

                .empcode-watermark span {
                    font-size: 20px;
                    font-weight: 600;
                    color: rgba(0, 0, 0, 0.08);
                    transform: rotate(-30deg);
                    white-space: nowrap;
                    letter-spacing: 2px;
                }
            `}</style>

            <div className="empcode-watermark">
                {Array.from({ length: 60 }).map((_, index) => (
                    <span key={index}>{empCode}</span>
                ))}
            </div>
        </>
    );
}