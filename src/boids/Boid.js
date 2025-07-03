import * as THREE from 'three';

export default class Boid {
  constructor() {
    // Position initiale aléatoire
    this.position = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(400),
      THREE.MathUtils.randFloatSpread(400),
      THREE.MathUtils.randFloatSpread(400)
    );

    // Vitesse aléatoire initiale
    this.velocity = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(2),
      THREE.MathUtils.randFloatSpread(2),
      THREE.MathUtils.randFloatSpread(2)
    );

    // Accélération initiale nulle
    this.acceleration = new THREE.Vector3();

    // Paramètres dynamiques
    this.maxSpeed = 5.0;
    this.maxForce = 0.2;
  }

  // Application des règles de regroupement
  flock(boids) {
    const alignment = this.align(boids);
    const cohesion = this.cohere(boids);
    const separation = this.separate(boids);
    const attraction = this.attractToCenter();

    // Pondération des comportements
    alignment.multiplyScalar(1.2);
    cohesion.multiplyScalar(1.0);
    separation.multiplyScalar(1.5);
    attraction.multiplyScalar(0.8);

    // Ajout à l'accélération totale
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(attraction);
  }

  // Mise à jour des mouvements
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
  }

  // Bordures de l’espace
  edges() {
    const bounds = 250;
    ['x', 'y', 'z'].forEach(axis => {
      if (this.position[axis] > bounds) this.position[axis] = -bounds;
      if (this.position[axis] < -bounds) this.position[axis] = bounds;
    });
  }

  // Alignement avec les voisins
  align(boids) {
    const perceptionRadius = 60;
    const steering = new THREE.Vector3();
    let total = 0;
    for (let other of boids) {
      const d = this.position.distanceTo(other.position);
      if (other !== this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }

  // Cohésion (centre de masse local)
  cohere(boids) {
    const perceptionRadius = 60;
    const steering = new THREE.Vector3();
    let total = 0;
    for (let other of boids) {
      const d = this.position.distanceTo(other.position);
      if (other !== this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.divideScalar(total);
      steering.sub(this.position);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }

  // Séparation (évite collisions)
  separate(boids) {
    const perceptionRadius = 40;
    const steering = new THREE.Vector3();
    let total = 0;
    for (let other of boids) {
      const d = this.position.distanceTo(other.position);
      if (other !== this && d < perceptionRadius) {
        const diff = new THREE.Vector3().subVectors(this.position, other.position);
        diff.divideScalar(d * d); // pondération par la distance
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }

  // Attire légèrement vers un point mouvant
  attractToCenter() {
    const t = performance.now() * 0.001;
    const center = new THREE.Vector3(
      Math.sin(t * 0.15) * 100,
      Math.cos(t * 0.1) * 100,
      Math.sin(t * 0.2) * 100
    );
    const force = center.clone().sub(this.position);
    force.setLength(this.maxForce);
    return force;
  }
}

