import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene setup ──────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020a04, 0.035);

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 3, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x0a200a, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffe8a0, 3);
    sunLight.position.set(8, 15, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.setScalar(1024);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-8, 5, -5);
    scene.add(fillLight);

    // ── Ground plane ─────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a3a0a });
    const groundPositions = groundGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < groundPositions.count; i++) {
      const x = groundPositions.getX(i);
      const z = groundPositions.getZ(i);
      groundPositions.setY(i, Math.sin(x * 0.5) * 0.3 + Math.cos(z * 0.3) * 0.2);
    }
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── Crop rows ─────────────────────────────────────────────
    const cropGroup = new THREE.Group();
    const stalkMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });

    function createCropPlant(x: number, z: number) {
      const plant = new THREE.Group();
      // Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5);
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.y = 0.4;
      stalk.castShadow = true;
      plant.add(stalk);
      // Leaves
      for (let i = 0; i < 3; i++) {
        const leafGeo = new THREE.ConeGeometry(0.25, 0.5, 5);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = 0.3 + i * 0.25;
        leaf.rotation.z = (i * Math.PI * 2) / 3;
        leaf.rotation.x = 0.5;
        leaf.castShadow = true;
        plant.add(leaf);
      }
      plant.position.set(x, 0, z);
      plant.rotation.y = Math.random() * Math.PI * 2;
      plant.scale.y = 0.7 + Math.random() * 0.6;
      return plant;
    }

    for (let row = -5; row <= 5; row++) {
      for (let col = -8; col <= 8; col++) {
        if (Math.abs(row) < 2 && Math.abs(col) < 3) continue; // Leave center clear
        cropGroup.add(createCropPlant(col * 1.5 + (row % 2) * 0.75, row * 1.5));
      }
    }
    scene.add(cropGroup);

    // ── Floating particles (dust/pollen) ─────────────────────
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Clouds ────────────────────────────────────────────────
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xccddee, transparent: true, opacity: 0.6 });
    const clouds: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const cloudGeo = new THREE.SphereGeometry(1.5 + Math.random() * 1.5, 7, 7);
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(-12 + i * 5 + Math.random() * 3, 8 + Math.random() * 3, -8 + Math.random() * 6);
      cloud.scale.set(1, 0.5, 1);
      clouds.push(cloud);
      scene.add(cloud);
    }

    // ── Sun ───────────────────────────────────────────────────
    const sunGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(8, 15, -10);
    scene.add(sun);
    // Sun glow
    const glowGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.15 });
    sun.add(new THREE.Mesh(glowGeo, glowMat));

    // ── Animation ─────────────────────────────────────────────
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.008;

      // Wind effect on crops
      cropGroup.children.forEach((plant, i) => {
        plant.rotation.z = Math.sin(time + i * 0.3) * 0.06;
      });

      // Float particles
      const pos = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        pos.setX(i, pos.getX(i) + 0.005);
        pos.setY(i, pos.getY(i) + Math.sin(time + i) * 0.002);
        if (pos.getX(i) > 15) pos.setX(i, -15);
      }
      pos.needsUpdate = true;

      // Move clouds
      clouds.forEach((cloud, i) => {
        cloud.position.x += 0.003 * (i % 2 === 0 ? 1 : 0.7);
        if (cloud.position.x > 15) cloud.position.x = -15;
      });

      // Gentle camera bob
      camera.position.y = 3 + Math.sin(time * 0.3) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ────────────────────────────────────────
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
