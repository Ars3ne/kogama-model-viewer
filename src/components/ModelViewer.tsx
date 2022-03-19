import { Suspense } from "react";

import { parse } from "../lib/model-parser";
import { Canvas } from '@react-three/fiber';
import { CameraControls } from "./CameraControls";
import { Cube, CubeProps } from "./Cube";

import { nanoid } from "nanoid";

const Loading = () => {
    return <></>;
}

const ModelViewer = (props: {data: Uint8Array}) => {

    const blocks: CubeProps[] = parse(props.data);

    return (
        <Canvas camera={{fov: 80}}>

            <Suspense fallback={<Loading />}>

                <ambientLight intensity={0.5} />
                <pointLight position={[-10, 0, -20]} intensity={.5} />
                <pointLight position={[0, -10, -0]} intensity={1.5} />

                {
                    blocks.map((b) => {
                        return <Cube
                            position={b.position}
                            vertices={b.vertices}
                            faces={b.faces}
                            index={b.index}
                            uv={b.uv}
                            material={b.material}
                            colors={b.colors}
                            key={nanoid()}
                        />
                    })
                }

            </Suspense>

            <CameraControls />

        </Canvas>

    )

}

export default ModelViewer;
