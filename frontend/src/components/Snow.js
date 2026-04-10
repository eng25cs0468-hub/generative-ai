import React, { useEffect } from "react";

const SNOWFLAKE_COUNT = 60;
const SNOWFLAKE_CHARS = ["❄", "•", "✻", "✼", "✺", "✹", "✧", "✦", "✩", "✪"];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function Snow() {
  useEffect(() => {
    // Remove snowflakes on unmount
    return () => {
      const snow = document.querySelectorAll('.snow');
      snow.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div className="snow">
      {Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => {
        const style = {
          left: `${randomBetween(0, 100)}vw`,
          animationDuration: `${randomBetween(4, 12)}s`,
          fontSize: `${randomBetween(1, 2.2)}em`,
          opacity: randomBetween(0.5, 0.95),
          animationDelay: `${randomBetween(0, 8)}s`,
        };
        const char = SNOWFLAKE_CHARS[Math.floor(Math.random() * SNOWFLAKE_CHARS.length)];
        return (
          <span className="snowflake" style={style} key={i}>
            {char}
          </span>
        );
      })}
    </div>
  );
}
