class Firework {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }
  
  reset() {
    if (Math.random() < 0.5) {
      this.x = this.canvasWidth * (0.33 + Math.random() * 0.34);
    } else {
      this.x = Math.random() < 0.5 ? 
               this.canvasWidth * (0.1 + Math.random() * 0.2) : 
               this.canvasWidth * (0.7 + Math.random() * 0.2);
    }
    this.y = this.canvasHeight;
    
    // New color palette
    const colors = [
      'hsl(0, 100%, 50%)',    // Red
      'hsl(30, 100%, 50%)',   // Orange
      'hsl(60, 100%, 50%)',   // Yellow
      'hsl(240, 100%, 50%)',  // Blue
      'hsl(0, 0%, 75%)',      // Silver
      'hsl(270, 100%, 50%)',  // Purple
      'hsl(120, 100%, 50%)'   // Green
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.complementaryColor = this.color;
    
    this.dx = (Math.random() - 0.5) * 1.5;
    this.dy = -(Math.random() * 4 + 6);
    this.gravity = 0.08;
    
    this.windEffect = (Math.random() - 0.5) * 0.02;
    
    this.exploded = false;
    this.particles = [];
    this.sparkles = [];
    this.age = 0;
    
    this.explosionType = Math.floor(Math.random() * 3);
  }
  
  launch() {
    this.dx += this.windEffect;
    this.x += this.dx;
    this.y += this.dy;
    this.dy += this.gravity * 0.7;
  
    const trailLength = 4;
    for (let i = 0; i < trailLength; i++) {
      const alpha = 1 - (i / trailLength);
      const offset = i * 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.x - this.dx * offset, this.y - this.dy * offset);
      this.ctx.lineTo(this.x - this.dx * (offset + 2), this.y - this.dy * (offset + 2));
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  
    if (Math.random() < 0.2) {
      this.sparkles.push({
        x: this.x,
        y: this.y,
        size: Math.random() * 1.5,
        alpha: 0.8
      });
    }
  
    if (this.dy >= -2 || this.y <= this.canvasHeight * 0.2) {
      this.explode();
    }
  }
  
  explode() {
    const baseParticleCount = 60;
    
    switch (this.explosionType) {
      case 0:
        for (let i = 0; i < baseParticleCount; i++) {
          const angle = (i / baseParticleCount) * Math.PI * 2;
          const speed = 4 + Math.random();
          this.createParticle(angle, speed);
        }
        break;
        
      case 1:
        for (let ring = 0; ring < 2; ring++) {
          const radius = ring === 0 ? 3 : 5;
          for (let i = 0; i < baseParticleCount; i++) {
            const angle = (i / baseParticleCount) * Math.PI * 2;
            this.createParticle(angle, radius);
          }
        }
        break;
        
      case 2:
        const points = 8;
        for (let i = 0; i < points; i++) {
          const baseAngle = (i / points) * Math.PI * 2;
          for (let j = 0; j < 10; j++) {
            const angle = baseAngle + (Math.random() - 0.5) * 0.5;
            const speed = 3 + Math.random() * 2;
            this.createParticle(angle, speed);
          }
        }
        break;
    }
    
    this.exploded = true;
  }
  
  createParticle(angle, speed) {
    this.particles.push({
      x: this.x,
      y: this.y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: Math.random() * 2 + 1.5,
      alpha: 1,
      color: this.color,
      trail: [{ x: this.x, y: this.y }],
      maxTrailLength: Math.floor(Math.random() * 8) + 5,
      decay: 0.016
    });
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.dy += this.gravity;
      particle.dx *= 0.99;
      
      particle.size *= 0.96;
      
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > particle.maxTrailLength) {
        particle.trail.shift();
      }
      
      if (particle.trail.length > 1) {
        const gradient = this.ctx.createLinearGradient(
          particle.trail[0].x, particle.trail[0].y,
          particle.x, particle.y
        );
        gradient.addColorStop(0, `rgba(${this.getRGB(particle.color)}, 0)`);
        gradient.addColorStop(1, `rgba(${this.getRGB(particle.color)}, ${particle.alpha})`);
        
        this.ctx.beginPath();
        this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        for (let j = 1; j < particle.trail.length; j++) {
          this.ctx.lineTo(particle.trail[j].x, particle.trail[j].y);
        }
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = particle.size;
        this.ctx.stroke();
      }
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.getRGB(particle.color)}, ${particle.alpha})`;
      this.ctx.fill();
      
      if (Math.random() < 0.05) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * 0.3})`;
        this.ctx.fill();
      }
      
      particle.alpha -= particle.decay;
      
      if (particle.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sparkle = this.sparkles[i];
      sparkle.alpha -= 0.05;
      
      if (sparkle.alpha > 0) {
        this.ctx.beginPath();
        this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.alpha})`;
        this.ctx.fill();
      } else {
        this.sparkles.splice(i, 1);
      }
    }
  }
  
  update() {
    this.age++;
    
    if (!this.exploded) {
      this.launch();
    } else {
      this.updateParticles();
    }
    
    if (this.exploded && this.particles.length === 0 && this.sparkles.length === 0) {
      this.reset();
    }
  }
  
  getRGB(hslColor) {
    const match = hslColor.match(/hsl\((\d+\.?\d*),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [_, h, s, l] = match;
      const rgb = this.hslToRgb(parseFloat(h), parseInt(s), parseInt(l));
      return rgb.join(",");
    }
    return "255,255,255";
  }
  
  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  }
}

class FireworksDisplay {
  constructor() {
    this.canvas = document.getElementById("fireworks-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    
    this.fireworks = [];
    for (let i = 0; i < 8; i++) {
      this.fireworks.push(
        new Firework(this.ctx, this.canvas.width, this.canvas.height)
      );
    }
    
    window.addEventListener("resize", () => this.resize());
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  animate() {
    this.ctx.fillStyle = "rgba(7, 7, 48, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.fireworks.forEach(firework => firework.update());
    
    requestAnimationFrame(() => this.animate());
  }
}

new FireworksDisplay();
