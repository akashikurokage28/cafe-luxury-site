/* Gold glitter that falls from the Story section down to the Reservations section. */
(function () {
  const cv = document.getElementById("glitter");
  if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (cv) cv.remove();
    return;
  }
  const ctx = cv.getContext("2d");
  const from = document.getElementById("about"); // where the glitter starts
  const to = document.getElementById("reserve"); // where it ends
  let W = 0,
    H = 0,
    ps = [],
    lastY = scrollY,
    prev = 0;

  function sprite(draw) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    draw(c.getContext("2d"));
    return c;
  }
  const glow = (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,244,200,1)");
    r.addColorStop(0.25, "rgba(229,201,135,.85)");
    r.addColorStop(1, "rgba(201,164,92,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  };
  const dot = sprite(glow);
  const star = sprite((g) => {
    glow(g);
    g.translate(32, 32);
    g.fillStyle = "rgba(255,240,180,1)";
    g.beginPath();
    g.moveTo(0, -31);
    g.quadraticCurveTo(2, -2, 31, 0);
    g.quadraticCurveTo(2, 2, 0, 31);
    g.quadraticCurveTo(-2, 2, -31, 0);
    g.quadraticCurveTo(-2, -2, 0, -31);
    g.fill();
  });

  const make = () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    s: 3 + Math.random() * 8, // size
    v: 22 + Math.random() * 48, // fall speed (px per second)
    sw: Math.random() * 6.28,
    sa: 8 + Math.random() * 18, // sway phase and amount
    ph: Math.random() * 6.28,
    tw: 1.5 + Math.random() * 3, // twinkle phase and speed
    st: Math.random() < 0.3, // some pieces are 4-point sparkles
  });

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.round(W / 16)); // fewer pieces on small screens
    while (ps.length < n) ps.push(make());
    ps.length = n;
  }

  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min((t - prev) / 1000, 0.05);
    prev = t;
    const zt = from.getBoundingClientRect().top,
      zb = to.getBoundingClientRect().bottom;
    const dS = scrollY - lastY;
    lastY = scrollY;
    ctx.clearRect(0, 0, W, H);
    if (zt > H || zb < 0) return; // glitter zone is off screen
    const top = Math.max(zt, 0),
      bot = Math.min(zb, H);
    ctx.globalCompositeOperation = "lighter";
    for (const p of ps) {
      p.y += p.v * dt - dS * 0.25; // fall, with a little scroll parallax
      p.x += Math.sin((t / 1000) * 0.8 + p.sw) * p.sa * dt;
      if (p.x < -10) p.x = W + 10;
      else if (p.x > W + 10) p.x = -10;
      if (p.y > bot + 60) {
        p.y = top - 5 - Math.random() * 40;
        p.x = Math.random() * W;
      } else if (p.y < top - 60) {
        p.y = top + Math.random() * (bot - top);
        p.x = Math.random() * W;
      }
      const edge =
        Math.min(Math.max((p.y - zt) / 140, 0), 1) *
        Math.min(Math.max((zb - p.y) / 140, 0), 1);
      const a =
        edge * (0.55 + 0.45 * Math.sin((t / 1000) * p.tw + p.ph)) * 0.85;
      if (a < 0.02) continue;
      const s = p.s * (p.st ? 2.2 : 1.6);
      ctx.globalAlpha = a;
      ctx.drawImage(p.st ? star : dot, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  size();
  addEventListener("resize", size);
  requestAnimationFrame(frame);
})();
