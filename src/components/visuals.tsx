"use client"

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// --- 3D Components ---

const RotatingShape = ({ color = '#3b82f6' }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[2.5, 0]} />
                <meshStandardMaterial color={color} wireframe />
            </mesh>
        </Float>
    );
};

export const LoginVisual = () => {
    return (
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <RotatingShape />
            </Canvas>
        </div>
    );
};

import { useTheme } from 'next-themes';

const PipelineStage = ({ position, label, active, index, isDark }: any) => {
    const meshRef = useRef<THREE.Group>(null);
    const color = active ? '#3b82f6' : (isDark ? '#52525b' : '#a1a1aa');

    useFrame((state) => {
        if (active && meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
        }
    });

    return (
        <group position={position} ref={meshRef}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.6, 1.5, 32]} />
                <meshStandardMaterial color={color} transparent opacity={0.8} />
            </mesh>
            <Text position={[0, -1, 0]} fontSize={0.3} color={active ? (isDark ? 'white' : 'black') : 'gray'}>
                {label}
            </Text>
        </group>
    );
};

export const DashboardPipeline = () => {
    const stages = ['Client', 'Research', 'Package', 'Agreement', 'Invoice'];
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <div className="h-48 w-full rounded-xl bg-muted/20 overflow-hidden relative">
            <Canvas>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} />
                <group position={[-3, 0.5, 0]}>
                    {stages.map((stage, i) => (
                        <PipelineStage
                            key={stage}
                            index={i}
                            position={[i * 1.5, 0, 0]}
                            label={stage}
                            active={i <= 2} // Mock active state
                            isDark={isDark}
                        />
                    ))}
                </group>
            </Canvas>
            <div className="absolute bottom-2 left-4 text-xs font-mono text-zinc-400">WORKFLOW VISUALIZER</div>
        </div>
    );
};

const SmallOrbMesh = ({ hovered }: { hovered: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * (hovered ? 2 : 0.5);
            const targetScale = hovered ? 1.2 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    return (
        <mesh ref={meshRef}>
            <dodecahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial color="#3b82f6" wireframe />
        </mesh>
    );
};

export const SmallOrb = () => {
    const [hovered, setHover] = useState(false);

    return (
        <div className="h-20 w-20" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Canvas>
                <ambientLight intensity={0.8} />
                <pointLight position={[5, 5, 5]} />
                <SmallOrbMesh hovered={hovered} />
            </Canvas>
        </div>
    );
};


// --- GSAP Components ---

export const CountUp = ({ end, duration = 2, prefix = '', suffix = '' }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useGSAP(() => {
        const obj = { value: 0 };
        gsap.to(obj, {
            value: end,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
                if (ref.current) {
                    ref.current.innerText = prefix + Math.floor(obj.value).toLocaleString() + suffix;
                }
            },
        });
    }, [end]);

    return <span ref={ref} className="font-bold text-3xl tracking-tight">{prefix}0{suffix}</span>;
};

export const SignatureAnimation = ({ onComplete }: { onComplete?: () => void }) => {
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!pathRef.current) return;
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
        gsap.to(pathRef.current, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="h-16 w-48 border-b-2 border-zinc-300 dark:border-zinc-700 relative">
            <svg
                viewBox="0 0 200 100"
                className="absolute bottom-2 left-0 w-full h-full pointer-events-none"
            >
                <path
                    ref={pathRef}
                    d="M10,80 C40,70 40,90 70,80 S100,50 130,70 S160,90 190,50"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    className="opacity-0"
                />
            </svg>
            <span className="absolute -bottom-6 left-0 text-xs text-zinc-400">Authorized Signature</span>
        </div>
    );
};

export const ConfettiEffect = ({ active }: { active: boolean }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (active && containerRef.current) {
            // Simple particle burst
            for (let i = 0; i < 30; i++) {
                const dot = document.createElement('div');
                dot.classList.add('absolute', 'w-2', 'h-2', 'rounded-full', 'bg-blue-500');
                containerRef.current.appendChild(dot);

                const angle = Math.random() * Math.PI * 2;
                const velocity = 50 + Math.random() * 100;

                gsap.fromTo(dot,
                    { x: 0, y: 0, opacity: 1, scale: 1 },
                    {
                        x: Math.cos(angle) * velocity,
                        y: Math.sin(angle) * velocity,
                        opacity: 0,
                        scale: 0,
                        duration: 1 + Math.random(),
                        ease: "power2.out",
                        onComplete: () => dot.remove()
                    }
                );
            }
        }
    }, [active]);

    return <div ref={containerRef} className="relative w-0 h-0 overflow-visible mx-auto" />;
};

export const LoadingBar = ({ isLoading }: { isLoading: boolean }) => {
    const barRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (isLoading) {
            gsap.to(barRef.current, {
                width: '100%',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });
        } else {
            gsap.to(barRef.current, { width: '0%', duration: 0.5 });
        }
    }, [isLoading]);

    return (
        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div ref={barRef} className="h-full bg-blue-600 w-0" />
        </div>
    );
};
