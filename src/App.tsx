import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import * as THREE from 'three';

const PASSWORD = 'c7z4y10hjjia';

const PasswordScreen = ({ onEnter }: { onEnter: () => void }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      onEnter();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-pink-500"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: -20,
              opacity: 0,
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-widest">
          Happy Birthday
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入密码"
            className={`px-6 py-3 rounded-full bg-zinc-800 text-white text-center text-lg w-64 border-2 transition-colors ${
              error ? 'border-red-500' : 'border-pink-500 focus:border-pink-400'
            } outline-none`}
            autoFocus
          />
          <motion.p
            animate={{ opacity: error ? 1 : 0 }}
            className="text-red-500 text-sm"
          >
            密码错误
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
};

const StartScreen3D = ({ onStart }: { onStart: () => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    balloons: THREE.Mesh[];
    confetti: THREE.Mesh[];
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleColors = [
      new THREE.Color('#ff6b9d'),
      new THREE.Color('#c44569'),
      new THREE.Color('#f8b500'),
      new THREE.Color('#ff6b6b'),
      new THREE.Color('#ffd93d'),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const balloonGroup = new THREE.Group();
    const balloons: THREE.Mesh[] = [];
    const balloonColors = [0xff6b9d, 0xf8b500, 0xff6b6b, 0xc44569, 0xffd93d];

    for (let i = 0; i < 12; i++) {
      const balloonGeometry = new THREE.SphereGeometry(1, 16, 16);
      const balloonMaterial = new THREE.MeshPhongMaterial({
        color: balloonColors[i % balloonColors.length],
        transparent: true,
        opacity: 0.7,
        shininess: 100,
      });
      const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
      balloon.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        Math.random() * 20 - 10
      );
      balloon.userData = {
        originalY: balloon.position.y,
        speed: 0.3 + Math.random() * 0.5,
        amplitude: 0.5 + Math.random() * 1,
        phase: Math.random() * Math.PI * 2,
      };
      balloons.push(balloon);
      balloonGroup.add(balloon);

      const stringGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -2, 0),
      ]);
      const stringMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
      const string = new THREE.Line(stringGeometry, stringMaterial);
      balloon.add(string);
    }
    scene.add(balloonGroup);

    const confettiGroup = new THREE.Group();
    const confetti: THREE.Mesh[] = [];
    const confettiColors = [0xff6b9d, 0xf8b500, 0xff6b6b, 0x00d2d3, 0xffd93d];

    for (let i = 0; i < 80; i++) {
      const confettiGeometry = new THREE.PlaneGeometry(0.3, 0.5);
      const confettiMaterial = new THREE.MeshPhongMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const piece = new THREE.Mesh(confettiGeometry, confettiMaterial);
      piece.position.set(
        (Math.random() - 0.5) * 50,
        Math.random() * 40 - 20,
        Math.random() * 30 - 15
      );
      piece.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      piece.userData = {
        velocityY: -0.02 - Math.random() * 0.05,
        velocityX: (Math.random() - 0.5) * 0.02,
        velocityRotX: (Math.random() - 0.5) * 0.05,
        velocityRotY: (Math.random() - 0.5) * 0.05,
        originalOpacity: 0.6 + Math.random() * 0.4,
      };
      confetti.push(piece);
      confettiGroup.add(piece);
    }
    scene.add(confettiGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff6b9d, 1, 100);
    pointLight.position.set(10, 10, 20);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xf8b500, 0.8, 100);
    pointLight2.position.set(-10, -10, 20);
    scene.add(pointLight2);

    sceneRef.current = { scene, camera, renderer, particles, balloons, confetti, animationId: 0 };

    const animate = () => {
      const { particles: p, balloons: b, confetti: c } = sceneRef.current!;
      const time = Date.now() * 0.001;

      p.rotation.y += 0.0005;
      p.rotation.x += 0.0002;

      b.forEach((balloon) => {
        const { originalY, speed, amplitude, phase } = balloon.userData;
        balloon.position.y = originalY + Math.sin(time * speed + phase) * amplitude;
        balloon.rotation.z = Math.sin(time * 0.5 + phase) * 0.1;
      });

      c.forEach((piece) => {
        const { velocityY, velocityX, velocityRotX, velocityRotY, originalOpacity } = piece.userData;
        piece.position.y += velocityY;
        piece.position.x += velocityX;
        piece.rotation.x += velocityRotX;
        piece.rotation.y += velocityRotY;

        if (piece.position.y < -25) {
          piece.position.y = 25;
          piece.position.x = (Math.random() - 0.5) * 50;
        }
        (piece.material as THREE.MeshPhongMaterial).opacity = originalOpacity * (0.5 + Math.sin(time * 2 + piece.position.x) * 0.5);
      });

      renderer.render(scene, camera);
      sceneRef.current!.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 drop-shadow-[0_0_30px_rgba(255,107,157,0.8)] text-center px-4">
          一份特别的生日惊喜
        </h1>
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(255,107,157,0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-xl shadow-2xl flex items-center gap-3 pointer-events-auto cursor-pointer border-2 border-white/30 backdrop-blur-sm"
        >
          <Heart className="fill-white" />
          点击开启
        </motion.button>
      </motion.div>
    </div>
  );
};

const CakeScene3D = ({ onNext }: { onNext: () => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isBlown, setIsBlown] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    flames: THREE.Mesh[];
    petals: THREE.Points;
    sparkles: THREE.Points;
    cakeGroup: THREE.Group;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const cakeGroup = new THREE.Group();
    const plateGeometry = new THREE.CylinderGeometry(5, 5, 0.3, 32);
    const plateMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = -3;
    plate.receiveShadow = true;
    cakeGroup.add(plate);

    const bottomTierGeometry = new THREE.CylinderGeometry(4, 4.2, 2.5, 32);
    const cakeMaterial = new THREE.MeshPhongMaterial({ color: 0xffc0cb, shininess: 60 });
    const bottomTier = new THREE.Mesh(bottomTierGeometry, cakeMaterial);
    bottomTier.position.y = -2.15;
    bottomTier.castShadow = true;
    cakeGroup.add(bottomTier);

    const middleTierGeometry = new THREE.CylinderGeometry(3, 3.2, 2, 32);
    const middleTier = new THREE.Mesh(middleTierGeometry, cakeMaterial);
    middleTier.position.y = -0.4;
    middleTier.castShadow = true;
    cakeGroup.add(middleTier);

    const topTierGeometry = new THREE.CylinderGeometry(2, 2.2, 1.5, 32);
    const topTier = new THREE.Mesh(topTierGeometry, cakeMaterial);
    topTier.position.y = 1.05;
    topTier.castShadow = true;
    cakeGroup.add(topTier);

    const frostingGeometry = new THREE.TorusGeometry(4, 0.2, 8, 32);
    const frostingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 150 });
    const frosting1 = new THREE.Mesh(frostingGeometry, frostingMaterial);
    frosting1.rotation.x = Math.PI / 2;
    frosting1.position.y = -0.9;
    cakeGroup.add(frosting1);

    const frosting2 = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.15, 8, 32),
      frostingMaterial
    );
    frosting2.rotation.x = Math.PI / 2;
    frosting2.position.y = 0.85;
    cakeGroup.add(frosting2);

    const frosting3 = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.12, 8, 32),
      frostingMaterial
    );
    frosting3.rotation.x = Math.PI / 2;
    frosting3.position.y = 1.8;
    cakeGroup.add(frosting3);

    const flames: THREE.Mesh[] = [];
    const candlePositions = [
      [-1.5, 2.3, 0],
      [0, 2.5, 0],
      [1.5, 2.3, 0],
    ];

    candlePositions.forEach((pos, i) => {
      const candleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16);
      const candleMaterial = new THREE.MeshPhongMaterial({ color: 0xfff5f5 });
      const candle = new THREE.Mesh(candleGeometry, candleMaterial);
      candle.position.set(pos[0], pos[1], pos[2]);
      cakeGroup.add(candle);

      const flameGeometry = new THREE.ConeGeometry(0.15, 0.5, 8);
      const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.9,
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(pos[0], pos[1] + 0.85, pos[2]);
      flame.userData = { phase: i * 0.5 };
      flames.push(flame);
      cakeGroup.add(flame);
    });

    const petalGeometry = new THREE.BufferGeometry();
    const petalCount = 50;
    const petalPositions = new Float32Array(petalCount * 3);
    const petalColors = new Float32Array(petalCount * 3);
    const petalColor = new THREE.Color(0xffcccc);

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 40;
      petalPositions[i * 3 + 1] = Math.random() * 30 - 5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      petalColors[i * 3] = petalColor.r;
      petalColors[i * 3 + 1] = petalColor.g;
      petalColors[i * 3 + 2] = petalColor.b;
    }

    petalGeometry.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    petalGeometry.setAttribute('color', new THREE.BufferAttribute(petalColors, 3));

    const petalMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const petals = new THREE.Points(petalGeometry, petalMaterial);
    scene.add(petals);

    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 30;
    const sparklePositions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions[i * 3] = (Math.random() - 0.5) * 30;
      sparklePositions[i * 3 + 1] = Math.random() * 20;
      sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xffd700,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    scene.add(cakeGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffd700, 1, 50);
    pointLight.position.set(5, 10, 10);
    pointLight.castShadow = true;
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight2.position.set(-5, 5, 10);
    scene.add(pointLight2);

    sceneRef.current = { scene, camera, renderer, flames, petals, sparkles, cakeGroup, animationId: 0 };

    const animate = () => {
      if (!sceneRef.current) return;
      const { flames: f, petals: p, sparkles: s, cakeGroup: cg } = sceneRef.current;
      const time = Date.now() * 0.001;

      if (!isBlown) {
        f.forEach((flame) => {
          const { phase } = flame.userData;
          const scale = 1 + Math.sin(time * 8 + phase) * 0.2;
          flame.scale.set(scale, scale + Math.sin(time * 10 + phase) * 0.3, scale);
          flame.rotation.y = Math.sin(time * 6 + phase) * 0.2;
          (flame.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(time * 8 + phase) * 0.3;
        });
      } else {
        f.forEach((flame) => {
          flame.scale.set(0, 0, 0);
        });
      }

      const petalPositions = p.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < petalCount; i++) {
        petalPositions[i * 3 + 1] -= 0.03;
        petalPositions[i * 3] += Math.sin(time + i) * 0.01;
        if (petalPositions[i * 3 + 1] < -10) {
          petalPositions[i * 3 + 1] = 25;
        }
      }
      p.geometry.attributes.position.needsUpdate = true;
      p.rotation.y += 0.001;

      s.rotation.y += 0.01;
      s.rotation.x += 0.005;

      cg.position.y = Math.sin(time * 0.5) * 0.2;
      cg.rotation.y = Math.sin(time * 0.2) * 0.05;

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  }, [isBlown]);

  const handleBlow = () => {
    if (!isBlown) {
      setIsBlown(true);
      setTimeout(() => onNext(), 1500);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#fff5f7] to-[#ffe4ec]">
      <div ref={mountRef} className="absolute inset-0" />
      <AnimatePresence>
        {showButton && !isBlown && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 px-4"
          >
            <p className="text-2xl md:text-3xl font-medium text-rose-500 tracking-tight bg-white/70 backdrop-blur-md px-8 py-3 rounded-full border border-white/50 shadow-lg text-center">
              许个愿，吹灭蜡烛吧
            </p>
            <motion.button
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlow}
              className="px-12 py-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-2xl shadow-2xl cursor-pointer border-2 border-white/30"
            >
              呼~ 💨
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PinkHeartsScene = ({ onNext }: { onNext: () => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    heartParticles: THREE.Points;
    floatingParticles: THREE.Points;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(onNext, 5000);
    return () => clearTimeout(timer);
  }, [onNext]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const heartPositions: THREE.Vector3[] = [];
    const heartPoints = 100;
    for (let i = 0; i < heartPoints; i++) {
      const t = (i / heartPoints) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      heartPositions.push(new THREE.Vector3(x * 0.25, y * 0.25, 0));
    }

    const heartParticleCount = 2000;
    const heartPositions_arr = new Float32Array(heartParticleCount * 3);
    const heartColors = new Float32Array(heartParticleCount * 3);
    const heartSizes = new Float32Array(heartParticleCount);
    const heartPhases = new Float32Array(heartParticleCount);

    for (let i = 0; i < heartParticleCount; i++) {
      const heartIdx = Math.floor(Math.random() * heartPositions.length);
      const basePos = heartPositions[heartIdx];
      const spread = 2.5;
      heartPositions_arr[i * 3] = basePos.x + (Math.random() - 0.5) * spread;
      heartPositions_arr[i * 3 + 1] = basePos.y + (Math.random() - 0.5) * spread;
      heartPositions_arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
      const colorMix = Math.random();
      heartColors[i * 3] = 1;
      heartColors[i * 3 + 1] = 0.2 + colorMix * 0.4;
      heartColors[i * 3 + 2] = 0.5 + colorMix * 0.4;
      heartSizes[i] = 0.08 + Math.random() * 0.12;
      heartPhases[i] = Math.random() * Math.PI * 2;
    }

    const heartGeometry = new THREE.BufferGeometry();
    heartGeometry.setAttribute('position', new THREE.BufferAttribute(heartPositions_arr, 3));
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(heartColors, 3));
    heartGeometry.setAttribute('size', new THREE.BufferAttribute(heartSizes, 1));

    const heartMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const heartParticles = new THREE.Points(heartGeometry, heartMaterial);
    scene.add(heartParticles);

    const floatParticleCount = 300;
    const floatPositions = new Float32Array(floatParticleCount * 3);
    const floatColors = new Float32Array(floatParticleCount * 3);
    const floatSizes = new Float32Array(floatParticleCount);
    const floatPhases = new Float32Array(floatParticleCount);
    const floatSpeeds = new Float32Array(floatParticleCount);

    for (let i = 0; i < floatParticleCount; i++) {
      floatPositions[i * 3] = (Math.random() - 0.5) * 20;
      floatPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      floatPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      floatColors[i * 3] = 1;
      floatColors[i * 3 + 1] = 0.3 + Math.random() * 0.5;
      floatColors[i * 3 + 2] = 0.6 + Math.random() * 0.3;
      floatSizes[i] = 0.05 + Math.random() * 0.08;
      floatPhases[i] = Math.random() * Math.PI * 2;
      floatSpeeds[i] = 0.3 + Math.random() * 0.5;
    }

    const floatGeometry = new THREE.BufferGeometry();
    floatGeometry.setAttribute('position', new THREE.BufferAttribute(floatPositions, 3));
    floatGeometry.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));
    floatGeometry.setAttribute('size', new THREE.BufferAttribute(floatSizes, 1));

    const floatMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const floatingParticles = new THREE.Points(floatGeometry, floatMaterial);
    scene.add(floatingParticles);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0xff69b4, 2, 30);
    pointLight1.position.set(3, 3, 8);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xff1493, 1.5, 30);
    pointLight2.position.set(-3, -3, 8);
    scene.add(pointLight2);

    sceneRef.current = { scene, camera, renderer, heartParticles, floatingParticles, animationId: 0 };

    let startTime = Date.now();

    const animate = () => {
      if (!sceneRef.current) return;
      const { heartParticles: hp, floatingParticles: fp } = sceneRef.current;
      const elapsed = (Date.now() - startTime) * 0.001;

      const hpPositions = hp.geometry.attributes.position.array as Float32Array;
      const hpSizes = hp.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < heartParticleCount; i++) {
        const phase = heartPhases[i];
        hpPositions[i * 3 + 1] += Math.sin(elapsed * 2.5 + phase) * 0.008;
        hpSizes[i] = (0.08 + Math.sin(elapsed * 3 + phase) * 0.05) * 0.3;
      }
      hp.geometry.attributes.size.needsUpdate = true;
      hp.rotation.y = Math.sin(elapsed * 0.4) * 0.2;
      hp.rotation.z = Math.sin(elapsed * 0.3) * 0.1;

      const fpPositions = fp.geometry.attributes.position.array as Float32Array;
      const fpSizes = fp.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < floatParticleCount; i++) {
        const phase = floatPhases[i];
        const speed = floatSpeeds[i];
        fpPositions[i * 3 + 1] += speed * 0.015;
        fpPositions[i * 3] += Math.sin(elapsed + phase) * 0.005;
        fpSizes[i] = 0.05 + Math.sin(elapsed * 2 + phase) * 0.03;

        if (fpPositions[i * 3 + 1] > 10) {
          fpPositions[i * 3 + 1] = -10;
          fpPositions[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
      fp.geometry.attributes.size.needsUpdate = true;
      fp.rotation.y = elapsed * 0.1;

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-pink-900 via-pink-950 to-black">
      <div ref={mountRef} className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <p className="text-pink-200 text-2xl md:text-4xl font-bold tracking-widest text-center px-4 drop-shadow-[0_0_50px_rgba(255,105,180,1)]">
          一份特别的生日惊喜
        </p>
      </motion.div>
    </div>
  );
};

const BlackoutScene = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onNext, 2500);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full bg-black flex items-center justify-center"
    />
  );
};

const PhotosScene3D = ({ onNext }: { onNext: () => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    photos: THREE.Sprite[];
    animationId: number;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(onNext, 20000);
    return () => clearTimeout(timer);
  }, [onNext]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const photos: THREE.Sprite[] = [];
    const imageFiles = [
      '00bff473-dbb2-4da6-a8f8-ec6b91cb44cf.jpg',
      '0a403bf4-c185-4b01-ac6e-c45430c56f88.jpg',
      '0cb1489b-281e-44ad-8063-ee1061a99c4b.jpg',
      '0da09950-d002-4575-8e7c-36a396858a33(1).jpg',
      '30fb932b-1b51-4d32-843c-51ab2ae08033.jpg',
      '32c8e5b1-6318-41b3-8b58-f9824b1986b2(1).jpg',
      '3798731e-9347-4e57-b998-286b1d7e70f6.jpg',
      '38c94b50-8309-45c2-861c-ea8474ee7a48.jpg',
      '4c40f114-cd1d-40f1-aefb-d8fa1de0d841.jpg',
      '52a1cbc0-52f8-42b4-b7d9-4198056ecde3(1).jpg',
      '52bdab61-2380-45ef-9330-e4f397747f5f.jpg',
      '5a72f1aa-b8d9-41c6-9fd4-75dac6b10c12(1).jpg',
      '6a7bcb8b-7df8-46a6-9f89-69fbd9df40bb(1).jpg',
      '6c990e4d-ae33-4449-9996-91aff54ec9dd.jpg',
      '7ab8f007-067c-48b6-859e-2e76c3b15fb3(1).jpg',
      '97d1d4aa-63e8-4a4e-abb1-0dcfb4c31c9e(1).jpg',
      '9c5b1a1e-5e9e-489a-ad8c-2163461aa119.jpg',
      '9c6e578a-36d8-4546-a384-c52d860818b5(1).jpg',
      'a5b8fcc4-f8ba-4511-9a54-e6d61a37e88d.jpg',
      'bd76451b-c3a7-40f4-86c6-7958ad34fc3c(1).jpg',
      'ce540f87-5982-4bc8-ac51-7c540f2e02cf.jpg',
    ];

    const cols = 2;
    const imgWidth = 7;
    const imgHeight = 9.3;
    const gapX = 8;
    const gapY = 10;
    const startX = -gapX / 2;
    const startY = gapY / 2;

    imageFiles.forEach((filename, i) => {
      const col = i % cols;
      const row = Math.floor(i % 4 / cols);
      const baseX = startX + col * gapX;
      const baseY = startY - row * gapY;

      const spriteMaterial = new THREE.SpriteMaterial({ transparent: true, opacity: 0 });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(imgWidth, imgHeight, 1);
      sprite.position.set(baseX, baseY, 0);
      sprite.userData = {
        groupIndex: Math.floor(i / 4),
        indexInGroup: i % 4,
        startDelay: Math.floor(i / 4) * 2 + (i % 4) * 0.4,
        opacity: 0,
        appeared: false,
      };
      photos.push(sprite);
      scene.add(sprite);

      textureLoader.load(
        `/images/${filename}`,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          sprite.material.map = texture;
          sprite.material.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff69b4, 0.8, 100);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    sceneRef.current = { scene, camera, renderer, photos, animationId: 0 };

    let startTime = Date.now();

    const animate = () => {
      if (!sceneRef.current) return;
      const { photos: p } = sceneRef.current;
      const elapsed = (Date.now() - startTime) * 0.001;

      p.forEach((photo) => {
        const { startDelay, opacity } = photo.userData;

        if (elapsed > startDelay && !photo.userData.appeared) {
          photo.userData.opacity = Math.min(1, opacity + 0.015);
          photo.material.opacity = photo.userData.opacity;
          if (photo.userData.opacity >= 1) {
            photo.userData.appeared = true;
          }
        }
      });

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 2 }}
          className="text-white text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest drop-shadow-[0_0_30px_rgba(255,105,180,0.9)] text-center px-4"
        >
          Happy Birthday
        </motion.p>
      </div>
    </div>
  );
};

const LetterScene = () => {
  const text = `亲爱的曹卓屹：

祝你19岁生日快乐！愿你得偿所愿，平安喜乐、万事顺意，希望最可爱的你能永远自由、热烈奔跑在自己所热爱的人生时区里，人生海海祝你有岸有帆！我永远在你身边，也永远都会爱你，这是我陪你过的第一个生日，虽然这个是电子版的，但是是我最真挚的祝愿。我希望你好好的，永远幸福，遇见你是一件很幸运的事情，如果可以，我希望永远和你在一起，不论发生什么事情我都不会离开你，因为我知道每个人都是独一无二的，世界上只有一个你，我也会好好珍惜你，我有时候也在感叹缘分奇妙，让我遇到了你，让我们走到一起，这是一件很幸运很幸运的事情。也祝你新的一岁，越来越好，天天开心，心想事成！万事如意，合家欢乐!马到成功，金榜题名!

From.佳`;

  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="w-full h-full bg-zinc-950 text-pink-100 p-6 md:p-8 flex flex-col items-center justify-center font-serif relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-pink-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      <div className="max-w-2xl w-full whitespace-pre-wrap leading-relaxed text-base md:text-lg lg:text-xl z-10 overflow-y-auto max-h-full py-6">
        {displayedText}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          |
        </motion.span>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [scene, setScene] = useState(-1);
  const [authenticated, setAuthenticated] = useState(false);

  const nextScene = useCallback(() => setScene((s) => s + 1), []);

  if (!authenticated) {
    return <PasswordScreen onEnter={() => {
      setAuthenticated(true);
      nextScene();
    }} />;
  }

  return (
    <div className="w-full h-screen overflow-hidden relative font-sans bg-black">
      <audio src="/music.mp3" autoPlay loop playsInline />
      <AnimatePresence mode="wait">
        {scene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <StartScreen3D onStart={nextScene} />
          </motion.div>
        )}
        {scene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <PinkHeartsScene onNext={nextScene} />
          </motion.div>
        )}
        {scene === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <CakeScene3D onNext={nextScene} />
          </motion.div>
        )}
        {scene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <BlackoutScene onNext={nextScene} />
          </motion.div>
        )}
        {scene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <PhotosScene3D onNext={nextScene} />
          </motion.div>
        )}
        {scene === 5 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <LetterScene />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}