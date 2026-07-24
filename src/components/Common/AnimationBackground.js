// import React from 'react';
// import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// export default function AnimationBackground() {
//   return (
//     <DotLottieReact
//       src="https://lottie.host/4dd1b770-70da-493a-8887-928378ebebe2/6LRNtBhAqM.lottie"
//       loop
//       autoplay
//       style={{
//         position: 'fixed',
//         top: '0',
//         left: '0',
//         width: '100%', 
//         height: '100vh',
//         zIndex: 999,
//         pointerEvents: 'none', 
//       }}
//     />
//   );
// }


import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AnimationBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 999,
        pointerEvents: 'none',
      }}
    >
      <DotLottieReact
        // src="https://lottie.host/a8179590-a316-4c3f-94f5-c4e49ce2f37b/R414MY7SQF.lottie"
        // src="https://lottie.host/cd2e6990-89a6-495b-9a1d-e50e65c1cbf6/wkQV0VQr6k.lottie"
        // src='https://lottie.host/a09d30e8-0bfb-44de-8c81-314ac3b3efa5/xBUBcYmg1f.lottie'
        // src="https://lottie.host/61330a54-6792-49e8-a136-7f5ec132add8/ngzIjF0Ete.lottie"
        src="https://lottie.host/b71a83cf-568e-4a4e-9d07-7075813f3b1e/e0vmfaYb0G.lottie"
        loop
        autoplay
        style={{
          width: '100%',
          height: '100%',
          transform: 'translateX(5%)', // adjust this value until right edge looks clean
        }}
      />
    </div>
  );
}
