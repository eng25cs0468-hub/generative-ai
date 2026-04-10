import { useEffect } from "react";

function Effects() {
  useEffect(() => {
    // Snow effect
    const createSnow = () => {
      const snow = document.createElement("div");
      snow.className = "snowflake";
      snow.textContent = "❄";
      snow.style.left = Math.random() * window.innerWidth + "px";
      snow.style.animationDuration = Math.random() * 3 + 2 + "s";
      document.body.appendChild(snow);

      setTimeout(() => snow.remove(), 5000);
    };

    const snowInterval = setInterval(createSnow, 300);

    // Confetti effect
    const createConfetti = () => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.backgroundColor = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
      ][Math.floor(Math.random() * 4)];
      confetti.style.animationDuration = Math.random() * 2 + 1 + "s";
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    };

    const confettiInterval = setInterval(createConfetti, 100);

    return () => {
      clearInterval(snowInterval);
      clearInterval(confettiInterval);
    };
  }, []);

  return null;
}

export default Effects;
