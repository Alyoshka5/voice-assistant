'use client'

import React, { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleOrb({ getAmplitude, userIsSpeakingRef }: { getAmplitude: () => number, userIsSpeakingRef: RefObject<boolean> }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvasWidth = 400;
        const canvasHeight = 400;
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
        camera.position.z = 200;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(canvasWidth, canvasHeight);
        renderer.setClearColor(0x0a0124);
        mountRef.current?.appendChild(renderer.domElement);

        const particleCount = 2000;
        const basePositions: number[] = [];
        const positions: number[] = [];

        const maxRadius = 90;

        for (let i = 0; i < particleCount; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = 2 * Math.PI * Math.random();
            let r = maxRadius * (0.8 + Math.random() * 0.4);

            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta);
            let z = r * Math.cos(phi);

            const abstractOffset = Math.sin(i * 0.15) * 12 + Math.cos(i * 0.27) * 8;
            const dir = new THREE.Vector3(x, y, z).normalize();
            dir.multiplyScalar(r + abstractOffset);

            x = dir.x;
            y = dir.y;
            z = dir.z;

            basePositions.push(x, y, z);
            positions.push(x, y, z);
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejs.org/examples/textures/sprites/circle.png');

        const particleMaterial = new THREE.PointsMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            size: 2.2,
            color: 0xffffff,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        let time = 0;
        let timeSpeed = 0.01;
        const targetColorIdle = new THREE.Color(0xffffff);
        // const targetColorSpeaking = new THREE.Color(0x8882d0);
        const targetColorSpeaking = new THREE.Color(0x66ccff);
        // const targetColorSpeaking = new THREE.Color(0xbe93ff);
        let currentColor = new THREE.Color(0xffffff);

        const animate = () => {
            requestAnimationFrame(animate);
            const targetSpeed = userIsSpeakingRef.current ? 0.08 : 0.01;
            timeSpeed = THREE.MathUtils.lerp(timeSpeed, targetSpeed, 0.1);
            time += timeSpeed;

            const targetColor = userIsSpeakingRef.current ? targetColorSpeaking : targetColorIdle;
            currentColor.lerp(targetColor, 0.05);
            particleMaterial.color.copy(currentColor);


            const positionAttr = particleGeometry.getAttribute("position") as THREE.BufferAttribute;

            const amplitude = getAmplitude();
            const scale = 1 + (amplitude / 255) * 0.8;

            for (let i = 0; i < particleCount; i++) {
                const ix = i * 3;
                const ox = basePositions[ix];
                const oy = basePositions[ix + 1];
                const oz = basePositions[ix + 2];

                const offset =
                    Math.sin(time * 1.5 + i * 0.1) * 6 +
                    Math.cos(time * 0.8 + i * 0.3) * 4 +
                    Math.sin(time * 0.4 + i * 0.7) * 3;

                const dir = new THREE.Vector3(ox, oy, oz).normalize();
                dir.multiplyScalar((maxRadius + offset) * scale);

                positionAttr.array[ix] = dir.x;
                positionAttr.array[ix + 1] = dir.y;
                positionAttr.array[ix + 2] = dir.z;
            }

            positionAttr.needsUpdate = true;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
}