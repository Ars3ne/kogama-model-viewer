import ModelViewer from './ModelViewer';


interface KogamaViewerProps {
    type: ModelViewerType,
    data: Uint8Array
}

type ModelViewerType = ("model" | "avatar");

const KogamaViewer = (props: KogamaViewerProps) => {
    
    switch(props.type) {

        case "model":
            return <ModelViewer data={props.data} />
        default:
            return null;
    }
    
}

export default KogamaViewer;