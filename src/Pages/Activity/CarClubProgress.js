import { assetImageBaseUrl } from "../../helpers/api_helper";

const MAX_POINTS = 1500;
const REWARD_MILESTONES = [
  { point: 25, name: "iPad", image: "ipad.png" },
  { point: 75, name: "iPhone 17 Pro", image: "17pro.png" },
  { point: 100, name: "Rado Watch", image: "rado.png" },
  { point: 125, name: "Bullet", image: "bullet.png" },
  { point: 150, name: "Tata Tiago XE", image: "tiago.png" },
  { point: 250, name: "Kia Sonet", image: "kiason.png" },
  { point: 300, name: "Mahindra Thar", image: "thar.png" },
  { point: 400, name: "Kia Seltos", image: "kiasal.png" },
  { point: 500, name: "Mahindra BE6", image: "be6.png" },
  { point: 800, name: "Innova Hycross", image: "innova.png" },
  { point: 1200, name: "Fortuner", image: "fortuner.png" },
  { point: 1500, name: "Audi A6", image: "audi.png" }
];

const CarClubProgress = ({ data = [] }) => {
  // Extract totalPoints from rewardData prop
  const totalPoints = data?.reduce(
    (sum, item) => sum + (item?.rewardPoint || 0),
    0
  );

  const firstMilestonePoint = REWARD_MILESTONES[0].point;

  const isZero = totalPoints === 0;
  const isBeforeFirstMilestone = totalPoints > 0 && totalPoints < firstMilestonePoint;
  const hasAchievedMilestone = totalPoints >= firstMilestonePoint;

  const percentage = Math.min((totalPoints / MAX_POINTS) * 100, 100);

  // Milestone Logic
  const lastAchieved = [...REWARD_MILESTONES]?.filter(m => totalPoints >= m?.point)?.pop();
  const nextMilestone = REWARD_MILESTONES.find(m => m.point > totalPoints) || REWARD_MILESTONES[REWARD_MILESTONES.length - 1];
  const pointsToNext = nextMilestone?.point - totalPoints;

  return (
    <div className="car-club-wrapper">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes targetPulse {
          0% { transform: scale(1); box-shadow: 0 0 0px rgba(255, 152, 0, 0); }
          50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(255, 152, 0, 0.4); }
          100% { transform: scale(1); box-shadow: 0 0 0px rgba(255, 152, 0, 0); }
        }
        .car-club-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 0;
          padding: 0 10px;
        }
        .main-layout {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 620px;
          gap: 15px;
        }
        .visual-container {
          flex: 0 0 85px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 85px;
        }
        .img-card {
          height: 42px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.03);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .target-anim {
          animation: targetPulse 2.5s infinite ease-in-out;
          border: 1px solid rgba(255, 152, 0, 0.3);
        }
        .reward-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .engine-room {
          flex: 1;
          min-width: 160px;
        }
        .track-base {
          height: 16px;
          background-color: #ff9800; /* Bold Orange Track */
          border-radius: 50px;
          padding: 3px;
          border: 1px solid #e67e22;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
        }
        .fill-engine {
          height: 100%;
          background: linear-gradient(90deg, #1b5e20 0%, #2ecc71 100%);
          border-radius: 50px;
          transition: width 1.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }
        /* Glossy Shimmer Overlay */
        .fill-engine::after {
          content: "";
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 3s infinite linear;
        }
        .welcome-badge {
          height: 40px;
          width: 40px;
          border-radius: 30%;
          background: linear-gradient(135deg, #1b5e20, #2ecc71);
          color: white;
          font-size: 10px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(25, 135, 84, 0.3);
        }
        @media (max-width: 1100px) {
          .hide-on-tablet { display: none; }
          .visual-container { flex: 0 0 65px; min-width: 65px; }
        }
      `}</style>

      <div className="main-layout">
        {/* Achieved/Start Section */}
        <div className="visual-container">
          <span style={{ fontSize: "10px", fontWeight: "900", color: "#198754", marginBottom: "5px", letterSpacing: "0.5px" }} className="hide-on-tablet text-uppercase">
            {isZero ? "Start" : isBeforeFirstMilestone ? "In Progress" : "Achieved"}

          </span>
          {hasAchievedMilestone ? (
            <div className="img-card">
              <img
                src={assetImageBaseUrl + lastAchieved.image}
                className="reward-image"
                alt="achieved"
              />
            </div>
          ) : (
            <div className="welcome-badge">GO!</div>
          )}


        </div>

        {/* Progress Bar Section */}
        <div className="engine-room">
          <div className="d-flex justify-content-between align-items-end mb-1 px-1">
            <span style={{ fontSize: "15px", fontWeight: "900", color: "#1b5e20" }}>
              {totalPoints.toLocaleString()} <small style={{ fontSize: "10px", color: "#666", fontWeight: "700" }}>PTS</small>
            </span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#d35400" }} className="hide-on-tablet">
              {totalPoints >= MAX_POINTS ? "🏆 CLUB ELITE" : `${pointsToNext} PTS TO NEXT`}
            </span>
          </div>

          <div className="track-base">
            <div className="fill-engine" style={{ width: `${percentage}%` }} />
          </div>

          <div className="d-flex justify-content-between mt-1 px-1" style={{ fontSize: "10px", fontWeight: "800", color: "#95a5a6" }}>
            {[0, 1500].map(val => (
              <span key={val} style={{ color: totalPoints >= val ? "#1b5e20" : "#95a5a6" }}>{val}</span>
            ))}
          </div>
        </div>

        {/* Animated Target Section */}
        {totalPoints < 1500 &&
          <div className="visual-container">
            <span style={{ fontSize: "10px", fontWeight: "900", color: "#d35400", marginBottom: "5px", letterSpacing: "0.5px" }} className="hide-on-tablet text-uppercase">Target</span>
            <div className="img-card target-anim">
              <img src={assetImageBaseUrl + nextMilestone.image} className="reward-image" alt="target" />
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default CarClubProgress;