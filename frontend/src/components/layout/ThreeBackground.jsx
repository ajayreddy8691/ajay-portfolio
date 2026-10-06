import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Data-themed 3D scene: an animated bar-chart "city", a floating line chart and drifting data points.
 * Cheap on purpose: instanced bars, low pixel ratio, 30 fps on phones, paused when the tab is hidden.
 */
export default function ThreeBackground() {
  const ref = useRef(null);

  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: ref.current, alpha: true, antialias: !matchMedia('(pointer: coarse)').matches, powerPreference: 'low-power' }); } catch { return undefined; }
    const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    const sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(6, 12, 8);
    const rim = new THREE.PointLight(0x22d3ee, 40, 40); rim.position.set(-8, 5, 4);
    scene.add(ambient, sun, rim);

    // --- bar chart city ---
    const cols = coarse ? 9 : 15, rows = coarse ? 8 : 12, gap = 1.25, N = cols * rows;
    const geo = new THREE.BoxGeometry(0.8, 1, 0.8); geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15, transparent: true, opacity: 0.62 });
    const bars = new THREE.InstancedMesh(geo, mat, N);
    bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const cA = new THREE.Color(0x22d3ee), cB = new THREE.Color(0x6366f1), cC = new THREE.Color(0xfbbf24), tmp = new THREE.Color();
    const xs = new Float32Array(N), zs = new Float32Array(N);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const k = i * rows + j, t = i / (cols - 1);
      xs[k] = (i - (cols - 1) / 2) * gap; zs[k] = (j - (rows - 1) / 2) * gap;
      tmp.copy(t < 0.55 ? cA.clone().lerp(cB, t / 0.55) : cB.clone().lerp(cC, (t - 0.55) / 0.45));
      bars.setColorAt(k, tmp);
    }
    const city = new THREE.Group(); city.add(bars); city.position.set(coarse ? 0 : 3, -4.2, -6); scene.add(city);
    const dummy = new THREE.Object3D();

    // --- floating line chart ---
    const LP = 48, lp = new Float32Array(LP * 3);
    const lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85 });
    const line = new THREE.Line(lineGeo, lineMat); line.position.set(-3, 3.2, -8); scene.add(line);

    // --- data points ---
    const PN = coarse ? 120 : 320, pp = new Float32Array(PN * 3);
    for (let i = 0; i < PN; i++) { pp[i * 3] = (Math.random() - 0.5) * 50; pp[i * 3 + 1] = Math.random() * 16 - 3; pp[i * 3 + 2] = (Math.random() - 0.5) * 30 - 6; }
    const ptsGeo = new THREE.BufferGeometry(); ptsGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const ptsMat = new THREE.PointsMaterial({ size: 0.09, color: 0x9bdcff, transparent: true, opacity: 0.55, depthWrite: false });
    const pts = new THREE.Points(ptsGeo, ptsMat); scene.add(pts);

    // On phones the address bar changes innerHeight while scrolling. Ignore height-only resizes so the canvas never re-allocates.
    let lastW = 0;
    const resize = () => {
      const w = innerWidth, h = innerHeight;
      if (coarse && w === lastW) return;
      lastW = w;
      renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.25 : 1.5)); renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    let mx = 0, my = 0, sy = 0, wasLight = null, frame = 0, raf;
    const onMove = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
    const onScroll = () => { sy = scrollY; };
    resize();
    addEventListener('resize', resize); addEventListener('mousemove', onMove, { passive: true }); addEventListener('scroll', onScroll, { passive: true });
    const isLight = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'light' : matchMedia('(prefers-color-scheme: light)').matches);

    const draw = (ms) => {
      const t = ms / 1000, light = isLight();
      if (light !== wasLight) {
        wasLight = light; mat.opacity = light ? 0.5 : 0.62; ambient.intensity = light ? 1.1 : 0.75;
        lineMat.color.set(light ? 0xc2750a : 0xfbbf24); ptsMat.color.set(light ? 0x2563eb : 0x9bdcff); ptsMat.opacity = light ? 0.4 : 0.55;
      }
      for (let k = 0; k < N; k++) {
        const x = xs[k], z = zs[k];
        const h = 0.5 + (Math.sin(x * 0.45 + t * 0.9) + 1) * 1.1 + (Math.cos(z * 0.55 - t * 0.7) + 1) * 0.8 + (Math.sin((x + z) * 0.3 + t * 0.5) + 1) * 0.5;
        dummy.position.set(x, 0, z); dummy.scale.set(1, h, 1); dummy.updateMatrix(); bars.setMatrixAt(k, dummy.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < LP; i++) { lp[i * 3] = i * 0.28; lp[i * 3 + 1] = Math.sin(i * 0.38 + t * 0.9) * 0.9 + i * 0.07 + Math.sin(i * 1.3 + t) * 0.18; lp[i * 3 + 2] = 0; }
      lineGeo.attributes.position.needsUpdate = true;
      city.rotation.y = -0.55 + Math.sin(t * 0.08) * 0.12 + mx * 0.35;
      pts.rotation.y = t * 0.012 + mx * 0.08;
      camera.position.set(mx * 1.6, 5.5 - my * 1.2 - sy * 0.002, 15); camera.lookAt(0, 0, -4);
      renderer.render(scene, camera);
    };
    const loop = (ms) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (coarse && (frame++ & 1)) return; // 30fps on phones
      draw(ms);
    };
    if (reduce) draw(0); else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize); removeEventListener('mousemove', onMove); removeEventListener('scroll', onScroll);
      bars.dispose(); geo.dispose(); mat.dispose(); lineGeo.dispose(); lineMat.dispose(); ptsGeo.dispose(); ptsMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas id="bg" ref={ref} />;
}
