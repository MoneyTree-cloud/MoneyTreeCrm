import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { assetImageBaseUrl } from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";

const REWARD_MILESTONES = [
    { point: 25, name: "iPad", image: assetImageBaseUrl + "ipad.png" },
    { point: 75, name: "iPhone 17 Pro", image: assetImageBaseUrl + "17pro.png" },
    { point: 100, name: "Rado Watch", image: assetImageBaseUrl + "rado.png" },
    { point: 125, name: "Bullet", image: assetImageBaseUrl + "bullet.png" },
    { point: 150, name: "Tata Tiago XE", image: assetImageBaseUrl + "tiago.png" },
    { point: 250, name: "Kia Sonet", image: assetImageBaseUrl + "kiason.png" },
    { point: 300, name: "Mahindra Thar", image: assetImageBaseUrl + "thar.png" },
    { point: 400, name: "Kia Seltos", image: assetImageBaseUrl + "kiasal.png" },
    { point: 500, name: "Mahindra BE6", image: assetImageBaseUrl + "be6.png" },
    { point: 800, name: "Innova Hycross", image: assetImageBaseUrl + "innova.png" },
    { point: 1200, name: "Fortuner", image: assetImageBaseUrl + "fortuner.png" },
    { point: 1500, name: "Audi A6", image: assetImageBaseUrl + "audi.png" }
];

const RewardPointsModal = ({ data = [], isOpen, onClose }) => {
    const totalPoints = data.reduce(
        (sum, item) => sum + (item.rewardPoint || 0),
        0
    );
    const achieved = REWARD_MILESTONES.filter(m => totalPoints >= m.point);
    const lastAchieved = achieved[achieved.length - 1];
    const nextReward = REWARD_MILESTONES.find(m => totalPoints < m.point);

    return (
        <Modal isOpen={isOpen} toggle={onClose} centered size="md">
            <ModalHeader
                toggle={onClose}
                className="text-white"
                style={{
                    background: "linear-gradient(135deg,#0f766e,#22c55e)"
                }}
            >
                Sale, Earn Points, Drive ....  Join CAR Club 🚗
            </ModalHeader>

            <ModalBody style={{ background: "#f9fafb", padding: 20 }}>
                {/* TOTAL POINTS */}
                {/* <div style={styles.pointsChip}>
                    You Achieved ⭐ {totalPoints} Points Till Now.
                </div> */}

                <div style={styles.pointsChip}>
                    {totalPoints === 0 ? (
                        <>🚀 Start your CAR Club journey — achieve points with your first booking!</>
                    ) : (
                        <>🎉 Great going! ⭐ You’ve achieved <b>{totalPoints}</b> CAR Club points so far.</>
                    )}
                </div>


                {/* ACHIEVED */}
                {lastAchieved && (
                    <div style={{ ...styles.rowCard, borderColor: defaultTheme.primary }}>
                        <span style={styles.badgeAchieved}>ACHIEVED</span>
                        <img src={lastAchieved.image} alt="" style={styles.icon} />
                        <div>
                            {/* <div style={styles.title}>{lastAchieved.name}</div> */}
                            <div style={styles.subText}>
                                {lastAchieved.point} points achieved
                            </div>
                        </div>
                    </div>
                )}

                {/* NEXT */}
                {nextReward && (
                    <div style={{ ...styles.rowCard, borderStyle: "dashed" }}>
                        <span style={styles.badgeNext}>NEXT</span>
                        <img src={nextReward.image} alt="" style={styles.icon} />
                        <div>
                            {/* <div style={styles.title}>{nextReward.name}</div> */}
                            <div style={styles.subText}>
                                Only <b>{nextReward.point - totalPoints}</b> points away
                            </div>
                        </div>
                    </div>
                )}
                <h6 style={{ textAlign: 'center', fontWeight: 'bold', color: 'red' }}>*T&C APPLY</h6>

                {!nextReward && (
                    <div style={styles.finalText}>
                        🏆 Ultimate CAR Club Reward Unlocked!
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default RewardPointsModal;

/* ================= STYLES ================= */

const styles = {
    pointsChip: {
        width: "fit-content",
        margin: "0 auto 16px",
        padding: "6px 14px",
        borderRadius: 20,
        background: "#ecfdf5",
        color: "#065f46",
        fontWeight: 700,
        fontSize: 14,
        border: "1px solid #a7f3d0"
    },
    rowCard: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#ffffff",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1.5px solid #e5e7eb",
        marginBottom: 12,
        position: "relative"
    },
    icon: {
        width: 80,
        height: 80,
        objectFit: "contain"
    },
    title: {
        fontWeight: 700,
        fontSize: 14,
        color: "#111827"
    },
    subText: {
        fontSize: 12,
        color: "#6b7280"
    },
    badgeAchieved: {
        position: "absolute",
        top: -8,
        right: 12,
        background: defaultTheme.primary,
        color: "#fff",
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 10,
        fontWeight: 700
    },
    badgeNext: {
        position: "absolute",
        top: -8,
        right: 12,
        background: defaultTheme.goldColorLogo,
        color: "#fff",
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 10,
        fontWeight: 700
    },
    finalText: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: 700,
        color: "#16a34a",
        marginTop: 16
    }
};