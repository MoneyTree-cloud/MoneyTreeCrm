import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

// Small Lottie (JSON) player — lottie-web's light SVG renderer.
// `playing` true → loops; false → rests on the first frame.
const LottieIcon = ({ animationData, playing = true, speed = 1, className, style }) => {
  const boxRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: boxRef.current,
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    });
    animRef.current = anim;
    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [animationData]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    anim.setSpeed(speed);
    if (playing) anim.play();
    else anim.goToAndStop(0, true);
  }, [playing, speed, animationData]);

  return <span ref={boxRef} className={className} style={{ display: "inline-block", ...style }} aria-hidden="true" />;
};

export default LottieIcon;
