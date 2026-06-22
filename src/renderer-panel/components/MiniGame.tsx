import React, { useEffect, useRef, useState } from "react";
import { PetState } from "../../shared/types";

const GAME_DURATION_MS = 30_000;
const CANVAS_W = 340;
const CANVAS_H = 380;
const BASKET_W = 60;
const BASKET_H = 16;

interface Star {
  x: number;
  y: number;
  speed: number;
}

export default function MiniGame({ state }: { state: PetState }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{ coins: number; exp: number } | null>(null);
  const basketXRef = useRef(CANVAS_W / 2);

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let stars: Star[] = [];
    let running = true;
    let localScore = 0;
    const startedAt = Date.now();
    let lastSpawn = 0;

    function handleMove(e: MouseEvent): void {
      const rect = canvas.getBoundingClientRect();
      basketXRef.current = Math.max(BASKET_W / 2, Math.min(CANVAS_W - BASKET_W / 2, e.clientX - rect.left));
    }
    canvas.addEventListener("mousemove", handleMove);

    function frame(): void {
      if (!running) return;
      const elapsed = Date.now() - startedAt;
      if (elapsed > GAME_DURATION_MS) {
        running = false;
        canvas.removeEventListener("mousemove", handleMove);
        const coins = localScore * 3;
        const exp = localScore * 2;
        window.petApi.doAction({ type: "minigameResult", coins, exp });
        setResult({ coins, exp });
        setPlaying(false);
        return;
      }

      if (elapsed - lastSpawn > 650) {
        lastSpawn = elapsed;
        stars.push({ x: Math.random() * (CANVAS_W - 20) + 10, y: -10, speed: 2 + Math.random() * 2.5 });
      }

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#eef6ff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const basketX = basketXRef.current;
      const basketY = CANVAS_H - 24;
      stars = stars.filter((s) => {
        s.y += s.speed;
        ctx.font = "20px sans-serif";
        ctx.fillText("⭐", s.x - 10, s.y);

        const caught =
          s.y > basketY - 10 && s.y < basketY + BASKET_H && Math.abs(s.x - basketX) < BASKET_W / 2;
        if (caught) {
          localScore += 1;
          setScore(localScore);
          return false;
        }
        return s.y < CANVAS_H + 20;
      });

      ctx.fillStyle = "#5b4636";
      ctx.fillRect(basketX - BASKET_W / 2, basketY, BASKET_W, BASKET_H);

      const remainingSec = Math.ceil((GAME_DURATION_MS - elapsed) / 1000);
      ctx.fillStyle = "#33302e";
      ctx.font = "14px sans-serif";
      ctx.fillText(`剩余 ${remainingSec}s`, 8, 18);

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    return () => {
      running = false;
      canvas.removeEventListener("mousemove", handleMove);
    };
  }, [playing]);

  function startGame(): void {
    setScore(0);
    setResult(null);
    setPlaying(true);
  }

  return (
    <div className="panel-section">
      <h3>接星星</h3>
      <p>移动鼠标控制篮子，接住掉落的星星，30 秒内接到越多奖励越多。</p>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="minigame-canvas" />
      <div className="minigame-footer">
        <span>得分：{score}</span>
        {!playing && (
          <button onClick={startGame}>{result ? "再玩一次" : "开始游戏"}</button>
        )}
      </div>
      {result && (
        <div className="minigame-result">
          本轮获得 🪙{result.coins} + 经验{result.exp}
        </div>
      )}
    </div>
  );
}
