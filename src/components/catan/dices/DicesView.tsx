import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TextureLoader, Mesh, Vector3, Euler } from "three";
import { OrbitControls } from "@react-three/drei";
import { useCatanStore } from "@/store/useCatanStore";
import { Quaternion } from "three";
import { randInt } from "three/src/math/MathUtils.js";

const rotations = [
    new Euler(0, Math.PI / 2, Math.PI),
    new Euler(0, -Math.PI / 2, Math.PI),
    new Euler(Math.PI / 2, 0, 0),
    new Euler(1.5 * Math.PI, 0, 0),
    new Euler(0, 0, 0),
    new Euler(Math.PI, 0, 0),
];

function Dice({
    texturePaths,
    position,
    num,
}: {
    texturePaths: string[];
    position?: Vector3;
    num: number;
}) {
    const ref = useRef<Mesh>(null);

    const [fakeNum, setFakeNum] = useState<number>(1);

    // Load textures
    const textures = texturePaths.map((path) => new TextureLoader().load(path));

    useFrame(() => {
        const { current } = ref;
        if (!current) return;
        const euler = rotations[fakeNum - 1].clone();

        euler.x += Math.PI * 2;
        euler.y += Math.PI * 2;
        euler.z += Math.PI * 2;
        current.quaternion.slerp(new Quaternion().setFromEuler(euler), 0.2);
    });

    useEffect(() => {
        let timeoutId: number | undefined = undefined;
        const roll = async (seconds: number) => {
            const rand = randInt(1, 6);
            setFakeNum(rand);
            if (seconds < 0) return Promise.resolve(rand);
            else {
                return new Promise<number>((resolve) => {
                    // @ts-ignore
                    timeoutId = setTimeout(async () => {
                        resolve(await roll(seconds - 100 / (1000 * seconds)));
                    }, 100 / seconds);
                });
            }
        };
        roll(1).then(() => {
            setFakeNum(num);
        });

        return () => {
            clearTimeout(timeoutId);
        };
    }, [num]);

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
    const { dices } = useCatanStore();

    const diceTextures = [
        "textures/dices/di1.png",
        "textures/dices/di2.png",
        "textures/dices/di3.png",
        "textures/dices/di4.png",
        "textures/dices/di5.png",
        "textures/dices/di6.png",
    ];

    return (
        <div className="h-15">
            <Canvas
                shadows
                orthographic
                camera={{ fov: 50, zoom: 150, position: [0, 0, 1] }}
            >
                <ambientLight intensity={3} color="#ffffff" />
                <group position={[0, 0, 0]}>
                    <Dice
                        texturePaths={diceTextures}
                        position={new Vector3(-0.2, 0, 0)}
                        num={dices[0]}
                    />
                    <Dice
                        texturePaths={diceTextures}
                        position={new Vector3(0.2, 0, 0)}
                        num={dices[1]}
                    />
                </group>
                <OrbitControls />
            </Canvas>
        </div>
    );
}
