'use client';

import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    useGLTF,
    Grid,
    GizmoHelper,
    GizmoViewport,
} from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';

function Benchy() {
    const { scene } = useGLTF('/models/3DBenchy.glb');

    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (!mesh.material || !('color' in mesh.material)) {
                    mesh.material = new THREE.MeshStandardMaterial({
                        color: '#FF7123', // Naranja de tu paleta
                    });
                }
            }
        });
    }, [scene]);

    console.log('✅ Modelo cargado:', scene);

    return (
        <primitive
            object={scene}
            scale={0.5}
            position={[0, -1, 0]}
            rotation={[0, Math.PI, 0]}
        />
    );
}

export default function BenchyModel() {
    const controlsRef = useRef<any>(null); // 👈 Referencia a OrbitControls

    return (
        <div className="w-[400px] h-[400px] bg-black rounded-md shadow-lg">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[3, 3, 3]} intensity={1.5} />
                <Suspense fallback={null}>
                    <Benchy />
                </Suspense>
                <OrbitControls ref={controlsRef} />
                <Grid infiniteGrid={false} />
                <GizmoHelper
                    alignment="bottom-right"
                    margin={[80, 80]}
                    controls={controlsRef.current}
                >
                    <GizmoViewport />
                </GizmoHelper>
            </Canvas>
        </div>
    );
}
