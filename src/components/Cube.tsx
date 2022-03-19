import { useLoader, Vector3 } from "@react-three/fiber"
import { RepeatWrapping, TextureLoader } from "three"

export interface CubeProps {
    position: Vector3,
    vertices: Float32Array,
    faces?: Array<number>,
    index: Uint8Array,
    uv: Float32Array,
    material: number,
    colors: Float32Array
}

export const Cube = (props: CubeProps) => {

    const texture = useLoader(TextureLoader, process.env.PUBLIC_URL + "/assets/kogama/materials/" + props.material + ".jpg");
    texture.wrapS = texture.wrapT = RepeatWrapping;

    return (
        <mesh position={props.position}>
            <bufferGeometry attach="geometry" onUpdate={self => self.computeVertexNormals()}>
                <bufferAttribute 
                    attach="index"
                    count={props.index.length}
                    array={props.index}
                    itemSize={1}
                />
                <bufferAttribute 
                    attachObject={["attributes", "position"]}
                    count={props.vertices.length / 3}
                    array={props.vertices}
                    itemSize={3}
                />
                <bufferAttribute 
                    attachObject={["attributes", "uv"]}
                    count={props.uv.length / 2}
                    array={props.uv}
                    itemSize={2}
                />
                <bufferAttribute 
                    attachObject={["attributes", "color"]}
                    count={props.colors.length / 3}
                    array={props.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <meshStandardMaterial attach="material" map={texture} />
        </mesh>

    )
}