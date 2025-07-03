import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Boid from '../boids/Boid';

const SceneBoids = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scène
    const scene = new THREE.Scene();

    // Caméra
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 0, 200);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);

    // Liste des boids
    const numBoids = 300;
    const boids = [];

    for (let i = 0; i < numBoids; i++) {
      boids.push(new Boid());
    }

    // Points dans la scène
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numBoids * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x55aaff, size: 3 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation
    let animationId;

    const animate = () => {
      for (let i = 0; i < numBoids; i++) {
        boids[i].flock(boids);
        boids[i].update();
        boids[i].edges();

        positions[i * 3] = boids[i].position.x;
        positions[i * 3 + 1] = boids[i].position.y;
        positions[i * 3 + 2] = boids[i].position.z;
      }

      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Nettoyage
    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current?.firstChild) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
    />
  );
};

export default SceneBoids;

