import { useEffect, useRef} from "react";
import { OrbitControls } from "@react-three/drei";
import * as ThreeType from "three-stdlib";

export const CameraControls = () => {

    const camera = useRef<ThreeType.OrbitControls>(null!);

    useEffect(() => {

        if(camera.current != null) {

            let autoRotateTimeout: NodeJS.Timeout;

            camera.current.addEventListener("start", function() {
                clearTimeout(autoRotateTimeout);
                camera.current.autoRotate = false;
            })

            camera.current.addEventListener("end", function() {
                autoRotateTimeout = setTimeout(function() {
                    camera.current.autoRotate = true;
                }, 1500);
            })

        };

    }, [])

    return (
        <OrbitControls
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={2.5}
            ref={camera}
        />
    )

}
