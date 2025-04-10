// src/game-modes/test-scene.js
import * as THREE from 'three';
import { getEngine } from '../core/engine.js';
import { getAssetLoader } from '../core/asset-loader.js';

export class CockroachObject {
  constructor() {
    // Create a simple cockroach placeholder (a box with legs)
    this.createMesh();
    
    // Add properties
    this.speed = 2;
    this.rotationSpeed = 2;
    this.jumpForce = 5;
    this.gravity = 10;
    this.isJumping = false;
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    // Keyboard state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  createMesh() {
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x663300,
      roughness: 0.8,
      metalness: 0.2
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.castShadow = true;
    this.body.receiveShadow = true;
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x663300,
      roughness: 0.7,
      metalness: 0.3
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.z = 0.35;
    this.head.position.y = 0.05;
    this.head.castShadow = true;
    
    // Antennae
    const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.005, 0.2);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    this.leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    this.leftAntenna.position.set(0.05, 0.1, 0.4);
    this.leftAntenna.rotation.x = Math.PI / 4;
    this.leftAntenna.rotation.z = Math.PI / 8;
    
    this.rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    this.rightAntenna.position.set(-0.05, 0.1, 0.4);
    this.rightAntenna.rotation.x = Math.PI / 4;
    this.rightAntenna.rotation.z = -Math.PI / 8;
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.2);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    this.legs = [];
    
    // Left legs
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(0.2, -0.05, 0.2 - i * 0.2);
      leg.rotation.z = Math.PI / 4;
      this.legs.push(leg);
    }
    
    // Right legs
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(-0.2, -0.05, 0.2 - i * 0.2);
      leg.rotation.z = -Math.PI / 4;
      this.legs.push(leg);
    }
    
    // Create mesh group
    this.mesh = new THREE.Group();
    this.mesh.add(this.body);
    this.mesh.add(this.head);
    this.mesh.add(this.leftAntenna);
    this.mesh.add(this.rightAntenna);
    
    this.legs.forEach(leg => {
      this.mesh.add(leg);
    });
    
    // Position in scene
    this.mesh.position.set(0, 0.15, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
  }
  
  setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
    
    window.addEventListener('keyup', (event) => {
      this.handleKeyUp(event);
    });
  }
  
  handleKeyDown(event) {
    switch(event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.jump = true;
        if (!this.isJumping) {
          this.jump();
        }
        break;
    }
  }
  
  handleKeyUp(event) {
    switch(event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
    }
  }
  
  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocity.y = this.jumpForce;
    }
  }
  
  update(delta) {
    // Movement
    const moveSpeed = this.speed * delta;
    const rotateSpeed = this.rotationSpeed * delta;
    
    // Rotation
    if (this.keys.left) {
      this.mesh.rotation.y += rotateSpeed;
    }
    if (this.keys.right) {
      this.mesh.rotation.y -= rotateSpeed;
    }
    
    // Forward/backward movement
    const direction = new THREE.Vector3(0, 0, 0);
    
    if (this.keys.forward) {
      direction.z = -1;
    }
    if (this.keys.backward) {
      direction.z = 1;
    }
    
    if (direction.length() > 0) {
      direction.normalize();
      
      // Get movement in world coordinates
      const worldDirection = direction.clone();
      worldDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
      
      // Move the cockroach
      this.mesh.position.x += worldDirection.x * moveSpeed;
      this.mesh.position.z += worldDirection.z * moveSpeed;
      
      // Animate legs (simple alternating motion)
      const time = Date.now() * 0.01;
      for (let i = 0; i < this.legs.length; i++) {
        const leg = this.legs[i];
        const offset = i % 2 === 0 ? 0 : Math.PI;
        leg.rotation.x = Math.sin(time + offset) * 0.5;
      }
    }
    
    // Apply gravity and jumping
    this.velocity.y -= this.gravity * delta;
    this.mesh.position.y += this.velocity.y * delta;
    
    // Ground check
    if (this.mesh.position.y < 0.15) {
      this.mesh.position.y = 0.15;
      this.velocity.y = 0;
      this.isJumping = false;
    }
    
    // Boundary checks (simple box area)
    const boundary = 10;
    this.mesh.position.x = Math.max(-boundary, Math.min(boundary, this.mesh.position.x));
    this.mesh.position.z = Math.max(-boundary, Math.min(boundary, this.mesh.position.z));
  }
}

export const initTestScene = () => {
  const engine = getEngine();
  const assetLoader = getAssetLoader();
  
  // Create a ground plane
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  engine.scene.add(ground);
  
  // Create some obstacles
  const createBox = (x, y, z, width, height, depth, color) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ 
      color,
      roughness: 0.7,
      metalness: 0.3
    });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(x, y, z);
    box.castShadow = true;
    box.receiveShadow = true;
    engine.scene.add(box);
    return box;
  };
  
  // Add some boxes to the scene
  createBox(-3, 0.5, -3, 1, 1, 1, 0x9333EA);  // Purple box
  createBox(3, 0.5, -2, 1, 1, 1, 0x00FF66);   // Green box
  createBox(0, 0.25, -5, 3, 0.5, 0.5, 0xEF4444); // Red box
  
  // Create a cockroach object
  const cockroach = new CockroachObject();
  engine.scene.add(cockroach.mesh);
  engine.addObject(cockroach);
  
  // Position camera to follow the cockroach
  const cameraOffset = new THREE.Vector3(0, 3, 5);
  
  // Update the camera position in the animation loop
  const updateCamera = () => {
    const target = cockroach.mesh.position.clone();
    const position = target.clone().add(cameraOffset);
    
    engine.camera.position.copy(position);
    engine.camera.lookAt(target);
  };
  
  // Add camera update to the engine's game loop
  engine.gameObjects.push({
    update: () => updateCamera()
  });
  
  return { cockroach };
}; 