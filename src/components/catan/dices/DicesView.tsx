import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TextureLoader, Mesh, Vector3 } from "three";
import { OrbitControls } from "@react-three/drei";

function Dice({
    texturePaths,
    position,
}: {
    texturePaths: string[];
    position?: Vector3;
}) {
    const ref = useRef<Mesh>(null);

    // Load textures
    const textures = texturePaths.map((path) => new TextureLoader().load(path));

    useFrame(() => {
        ref.current?.rotateY(0.01);
        ref.current?.rotateX(0.01);
    });

    return (
        <mesh
            ref={ref}
            castShadow
            position={position}
            scale={new Vector3(1, 1, 1).multiplyScalar(0.25)}
        >
            <boxGeometry args={[1, 1, 1]} />
            {textures.map((texture, index) => (
                <meshToonMaterial
                    key={index}
                    attach={`material-${index}`}
                    map={texture}
                />
            ))}
        </mesh>
    );
}

export default function DicesView() {
    const diceTextures = [
        "textures/dices/di1.png",
        "textures/dices/di2.png",
        "textures/dices/di3.png",
        "textures/dices/di4.png",
        "textures/dices/di5.png",
        "textures/dices/di6.png",
    ];

    return (
        <Canvas
            shadows
            orthographic
            camera={{ fov: 50, zoom: 150, position: [0, 0, 1] }}
        >
            <ambientLight intensity={3} color="#ffffff" />
            <group position={[0, 0, 0]}>
                <Dice
                    texturePaths={diceTextures}
                    position={new Vector3(0.2, 0, 0)}
                />
                <Dice
                    texturePaths={diceTextures}
                    position={new Vector3(-0.2, 0, 0)}
                />
            </group>
            <OrbitControls />
        </Canvas>
    );
}
