import { useUserStore } from "../store/useUserStore";

// contained: fill the nearest positioned parent (e.g. a fixed chat panel) instead of the whole page
export default function EmpCodeMarquee({ contained = false }) {
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
                    /* 6 columns on wide screens (same as before); on narrow screens
                       each column keeps at least 180px so the codes don't crowd */
                    grid-template-columns: repeat(auto-fill, minmax(max(180px, calc(100% / 6 - 1px)), 1fr));
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

                .empcode-watermark.empcode-watermark-contained {
                    position: absolute;
                    top: 0; right: 0; bottom: 0; left: 0;
                    width: auto;
                    height: auto;
                    grid-template-columns: repeat(3, 1fr);
                    grid-auto-rows: 110px;
                    z-index: 20;
                }
            `}</style>

            <div className={`empcode-watermark ${contained ? "empcode-watermark-contained" : ""}`}>
                {Array.from({ length: contained ? 30 : 60 }).map((_, index) => (
                    <span key={index}>{empCode}</span>
                ))}
            </div>
        </>
    );
}