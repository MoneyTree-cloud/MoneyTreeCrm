import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const CountdownTimer = ({ targetDate }) => {
  const endTime = dayjs(targetDate).add(48, 'hour');

  const calculateTimeLeft = () => {
    const now = dayjs();
    const duration = endTime.diff(now);

    if (duration <= 0) return 'Expired';

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const seconds = Math.floor((duration / 1000) % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;
