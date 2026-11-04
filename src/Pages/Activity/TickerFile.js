import { memo } from "react";
import Logo from "../../assets/images/Tree_transparent.png";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_TICKER_DATA } from "../../helpers/url_helper";
import LottieIcon from "../../components/Common/LottieIcon";
import speakerAnimation from "../../assets/lottie/Loudspeaker.lottie/animations/12345.json";

const colors = [
  "#c38c42", // Gold
  "#FF4500", // Orange Red
  "#1E90FF", // Dodger Blue
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
];

// scroll speed — seconds per character of text (bigger = slower)
const SECONDS_PER_CHAR = 0.13;
// repeat short lists so one copy is wider than the screen (no gap in the loop)
const MIN_CHARS = 220;

// Pure CSS marquee: the browser compositor moves the strip, so it stays smooth
// even while the rest of the page is busy. (react-ticker measured the DOM and
// re-rendered React on every frame, which made it stutter.)
const TickerFile = () => {
  const { data: tickerData } = useGet(GET_ALL_TICKER_DATA);
  const tickerList = tickerData ? tickerData?.data?.data : [];
  const activeTickers =
    tickerList?.length > 0
      ? tickerList?.filter((ticker) => ticker.isActive === "YES")
      : [];

  if (activeTickers.length === 0) {
    return null;
  }

  const textLength = activeTickers.reduce((sum, t) => sum + (t.tickerName || "").length + 6, 0);
  const repeat = Math.max(1, Math.ceil(MIN_CHARS / Math.max(textLength, 1)));
  const loop = Array.from({ length: repeat }, () => activeTickers).flat();
  const duration = Math.max(10, textLength * repeat * SECONDS_PER_CHAR);

  // two identical halves; the track slides by exactly one half, then restarts seamlessly
  const renderHalf = (half) =>
    loop.map((ticker, i) => (
      <div className="mt-ticker__item" key={`${half}-${i}`} aria-hidden={half === 1}>
        <span className="mt-ticker__msg" style={{ color: colors[i % colors.length] }}>
          {ticker.tickerName}
        </span>
        <img src={Logo} alt="" className="mt-ticker__logo" />
      </div>
    ));

  return (
    <div className="mt-ticker">
      {/* announcement speaker fixed at the start of the strip */}
      <div className="mt-ticker__speaker">
        <LottieIcon animationData={speakerAnimation} className="mt-ticker__speaker-anim" />
      </div>
      <div className="mt-ticker__viewport">
        <div className="mt-ticker__track" style={{ animationDuration: `${duration}s` }}>
          {renderHalf(0)}
          {renderHalf(1)}
        </div>
      </div>
    </div>
  );
};

export default memo(TickerFile);
