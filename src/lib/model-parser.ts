import { Vector2, Vector3 } from "three";
import { CubeProps } from "../components/Cube";
import BytePacker from "./byte-packer/byte-packer";
import bytePositionLookUpTable from "./byte-position-lookup-table";
import { Face, FaceFlags } from "./enums";

const identityByteCorners = [20, 120, 124, 24, 4, 104, 100, 0];

export interface Cube {
    x: number,
    y: number,
    z: number,
    material: number,
    byteCorners: Uint8Array,
    unIndentedSides : number,
    hiddenSides : number,
}

interface FaceData {
    face: Face,
    faceVertices: Array<Vector3>,
    colors: Array<Color>,
}

interface Color {
    r: number,
    g: number,
    b: number,
}

function parseModel(data: Uint8Array): Cube[]{

    const result : Cube[] = [];

    const bytePacker = new BytePacker(data);
    const size = bytePacker.readInt();

    for(let i = 0; i < size; i++) {

        let x = bytePacker.readShort();
        const y = bytePacker.readShort();
        const z = bytePacker.readShort();
        const byte = bytePacker.readByte();

        let byteCorners: Uint8Array;

        if((byte & 1) === 0) {
            byteCorners = bytePacker.readBytes(8);
        }else {
            byteCorners = new Uint8Array([20, 120, 124, 24, 4, 104, 100, 0]);
        }

        const material = bytePacker.readByte();
        
        let res = ({x, y, z, material, byteCorners, unIndentedSides: -1, hiddenSides: 0});
        res.unIndentedSides = getUnindentedSides(res);
        result.push(res);

        // Parse identical cubes in the same row.
        const cubesInRow = byte >> 2;

        for(let j = 1; j < cubesInRow; j++) {
            x++;
            let res = ({x, y, z, material, byteCorners, unIndentedSides: -1, hiddenSides: 0});
            res.unIndentedSides = getUnindentedSides(res);
            result.push(res);
        }
    }

    return result;
}

function getUnindentedSides(cube: Cube) {

    let unIndentedSides = 0;
    let number = 0;

    let array: Boolean[] = [];

    for(let i = 0; i < 8; i++) {
       array[i] = cube.byteCorners[i] !== identityByteCorners[i]; 
       if(array[i]) number++;
    }

    if(number === 0) {
        unIndentedSides = 63;
        return unIndentedSides;
    }

    if(number > 4) {
        unIndentedSides = 0;
        return unIndentedSides;
    }

    if(!array[0] && !array[1] && !array[2] && !array[3]) {
        unIndentedSides |= 1;
    }

    if(!array[4] && !array[5] && !array[6] && !array[7]) {
        unIndentedSides |= 2; 
    }

    if(!array[2] && !array[3] && !array[4] && !array[5]) {
        unIndentedSides |= 8;
    }

    if(!array[0] && !array[1] && !array[6] && !array[7]) {
        unIndentedSides |= 4;
    }

    if(!array[0] && !array[3] && !array[4] && !array[7]) {
        unIndentedSides |= 16;
    }

    if(!array[1] && !array[2] && !array[5] && !array[6]) {
        unIndentedSides |= 32;
    }

    return unIndentedSides;

}

function byteArrayToCorners(byteArray: Uint8Array) {

    let array : Array<Vector3> = [];
    array.fill(new Vector3(), 0, 8);

    for(let i = 0; i < 8; i++) {
        array[i] = bytePositionLookUpTable[byteArray[i]]
    }

    return array;

}

function getAverageLightValue(face: Face, vertex: number, inside: boolean) {

    // TODO: Properly implement.

    let color: Color = {r: 0, g: 0, b: 0};

    //let num = (face * Face.Left + vertex);
    let num2 = 0;

    for(let i = 0; i < 4; i++) {
        num2 += 255;
    }

    color.r = num2 / 1020;
    color.g = num2 / 1020;
    color.b = num2 / 1020;

    return color;

}

function getVisibleFaceVertices(cube: Cube) {
    
    const borders = byteArrayToCorners(cube.byteCorners);

    let index = 0;

    let faceData: Array<FaceData> = [
        {face: Face.None, faceVertices: [], colors: []},
        {face: Face.None, faceVertices: [], colors: []},
        {face: Face.None, faceVertices: [], colors: []},
        {face: Face.None, faceVertices: [], colors: []},
        {face: Face.None, faceVertices: [], colors: []},
        {face: Face.None, faceVertices: [], colors: []},
    ];

    if((cube.hiddenSides & 1) === 0) {
        faceData[index].face = Face.Top;
        faceData[index].faceVertices[0] = borders[0];
        faceData[index].colors[0] = getAverageLightValue(faceData[index].face, 0, borders[0].y < 0.5);
        faceData[index].faceVertices[1] = borders[1];
        faceData[index].colors[1] = getAverageLightValue(faceData[index].face, 1, borders[1].y < 0.5);
        faceData[index].faceVertices[2] = borders[2];
        faceData[index].colors[2] = getAverageLightValue(faceData[index].face, 2, borders[2].y < 0.5);
        faceData[index].faceVertices[3] = borders[3];
        faceData[index].colors[3] = getAverageLightValue(faceData[index].face, 3, borders[3].y < 0.5);
        index++;
    }

    if((cube.hiddenSides & 2) === 0) {
        faceData[index].face = Face.Bottom;
        faceData[index].faceVertices[0] = borders[4];
        faceData[index].colors[0] = getAverageLightValue(faceData[index].face, 0, borders[4].y > -0.5);
        faceData[index].faceVertices[1] = borders[5];
        faceData[index].colors[1] = getAverageLightValue(faceData[index].face, 1, borders[5].y > -0.5);
        faceData[index].faceVertices[2] = borders[6];
        faceData[index].colors[2] = getAverageLightValue(faceData[index].face, 2, borders[6].y > -0.5);
        faceData[index].faceVertices[3] = borders[7];
        faceData[index].colors[3] = getAverageLightValue(faceData[index].face, 3, borders[7].y > -0.5);
        index++;
    }

    if((cube.hiddenSides & 4) === 0) {
        faceData[index].face = Face.Front;
        faceData[index].faceVertices[0] = borders[7];
        faceData[index].colors[0] = getAverageLightValue(faceData[index].face, 0, borders[7].z > -0.5);
        faceData[index].faceVertices[1] = borders[6];
        faceData[index].colors[1] = getAverageLightValue(faceData[index].face, 1, borders[6].z > -0.5);
        faceData[index].faceVertices[2] = borders[1];
        faceData[index].colors[2] = getAverageLightValue(faceData[index].face, 2, borders[1].z > -0.5);
        faceData[index].faceVertices[3] = borders[0];
        faceData[index].colors[3] = getAverageLightValue(faceData[index].face, 3, borders[0].z > -0.5);
        index++;
    }

    if((cube.hiddenSides & 8) === 0) {
        faceData[index].face = Face.Back;
        faceData[index].faceVertices[0] = borders[5];
        faceData[index].colors[0] = getAverageLightValue(faceData[index].face, 0, borders[5].z < 0.5);
        faceData[index].faceVertices[1] = borders[4];
        faceData[index].colors[1] = getAverageLightValue(faceData[index].face, 1, borders[4].z < 0.5);
        faceData[index].faceVertices[2] = borders[3];
        faceData[index].colors[2] = getAverageLightValue(faceData[index].face, 2, borders[3].z < 0.5);
        faceData[index].faceVertices[3] = borders[2];
        faceData[index].colors[3] = getAverageLightValue(faceData[index].face, 3, borders[2].z < 0.5);
        index++;
    }

    if((cube.hiddenSides & 16) === 0) {
        faceData[index].face = Face.Left;
        faceData[index].faceVertices[0] = borders[4];
        faceData[index].colors[0] = getAverageLightValue(faceData[index].face, 0, borders[5].x > -0.5);
        faceData[index].faceVertices[1] = borders[7];
        faceData[index].colors[1] = getAverageLightValue(faceData[index].face, 1, borders[7].x > -0.5);
        faceData[index].faceVertices[2] = borders[0];
        faceData[index].colors[2] = getAverageLightValue(faceData[index].face, 2, borders[0].x > -0.5);
        faceData[index].faceVertices[3] = borders[3];
        faceData[index].colors[3] = getAverageLightValue(faceData[index].face, 3, borders[3].x > -0.5);
        index++;
    }

    if((cube.hiddenSides & 32) === 0) {
        faceData[index].face = Face.Right;
        faceData[index].faceVertices[0] = borders[6];
        faceData[index].colors[0] = getAverageLightValue(faceData[index].face, 0, borders[6].x < 0.5);
        faceData[index].faceVertices[1] = borders[5];
        faceData[index].colors[1] = getAverageLightValue(faceData[index].face, 1, borders[5].x < 0.5);
        faceData[index].faceVertices[2] = borders[2];
        faceData[index].colors[2] = getAverageLightValue(faceData[index].face, 2, borders[2].x < 0.5);
        faceData[index].faceVertices[3] = borders[1];
        faceData[index].colors[3] = getAverageLightValue(faceData[index].face, 3, borders[1].x < 0.5);
        index++;
    }

    return faceData;

}

function getVertexIndex(cube: Cube){

    let result = 0;

    if((cube.hiddenSides & 1) === 0) result++;
    if((cube.hiddenSides & 2) === 0) result++;
    if((cube.hiddenSides & 4) === 0) result++;
    if((cube.hiddenSides & 8) === 0) result++;
    if((cube.hiddenSides & 16) === 0) result++;
    if((cube.hiddenSides & 32) === 0) result++;


    return result;


}

function getFaceUVs(faceVertices: Array<Vector3>, face: Face, scale: Vector3): Vector2[]{

    if(scale.x !== scale.y || scale.x !== scale.z) {
        return [new Vector2(0, 0)];
    }

    let uvs : Vector2[] = [
        new Vector2(0, 0),
        new Vector2(0, 0),
        new Vector2(0, 0),
        new Vector2(0, 0),
    ];

    let offsetVector = new Vector2(0.5, 0.5);

    switch(face) {
        case Face.Top:
            uvs[0].set(faceVertices[0].x, faceVertices[0].z);
            uvs[1].set(faceVertices[1].x, faceVertices[1].z);
            uvs[2].set(faceVertices[2].x, faceVertices[2].z);
            uvs[3].set(faceVertices[3].x, faceVertices[3].z);
            break;
        case Face.Bottom:
            uvs[0].set(-faceVertices[0].x, faceVertices[0].z);
            uvs[1].set(-faceVertices[1].x, faceVertices[1].z);
            uvs[2].set(-faceVertices[2].x, faceVertices[2].z);
            uvs[3].set(-faceVertices[3].x, faceVertices[3].z);
            offsetVector = new Vector2(-0.5, 0.5);
            break;
        case Face.Front:
            uvs[0].set(faceVertices[0].x, faceVertices[0].y);
            uvs[1].set(faceVertices[1].x, faceVertices[1].y);
            uvs[2].set(faceVertices[2].x, faceVertices[2].y);
            uvs[3].set(faceVertices[3].x, faceVertices[3].y);
            break;
        case Face.Back:
            uvs[0].set(-faceVertices[0].x, faceVertices[0].y);
            uvs[1].set(-faceVertices[1].x, faceVertices[1].y);
            uvs[2].set(-faceVertices[2].x, faceVertices[2].y);
            uvs[3].set(-faceVertices[3].x, faceVertices[3].y);
            offsetVector = new Vector2(-0.5, 0.5);
            break;
        case Face.Left:
            uvs[0].set(-faceVertices[0].z, faceVertices[0].y);
            uvs[1].set(-faceVertices[1].z, faceVertices[1].y);
            uvs[2].set(-faceVertices[2].z, faceVertices[2].y);
            uvs[3].set(-faceVertices[3].z, faceVertices[3].y);
            offsetVector = new Vector2(-0.5, 0.5);
            break;
        case Face.Right:
            uvs[0].set(faceVertices[0].z, faceVertices[0].y);
            uvs[1].set(faceVertices[1].z, faceVertices[1].y);
            uvs[2].set(faceVertices[2].z, faceVertices[2].y);
            uvs[3].set(faceVertices[3].z, faceVertices[3].y);
            break;
    }

    let div = 2 / scale.x;

    uvs[0] = uvs[0].add(offsetVector);
    uvs[1] = uvs[1].add(offsetVector);
    uvs[2] = uvs[2].add(offsetVector);
    uvs[3] = uvs[3].add(offsetVector);

    uvs[0] = uvs[0].divide(new Vector2(div, div));
    uvs[1] = uvs[1].divide(new Vector2(div, div));
    uvs[2] = uvs[2].divide(new Vector2(div, div));
    uvs[3] = uvs[3].divide(new Vector2(div, div));

    return uvs;
}

function getBlockIndex(vertexIndex: number) {

    const index : number[] = [];

    let num = 0;
    for(let i = 0; i < vertexIndex; i++) {
        let num4 = num * 4;
        index.push(num4);
        index.push(num4 + 3);
        index.push(num4 + 2);
        index.push(num4 + 2);
        index.push(num4 + 1);
        index.push(num4);
        num++;
    }

    return new Uint8Array(index);
}

function simpleFaceVisibilityTest(faceFlag: FaceFlags, faceFlagOpposite: FaceFlags, cube: Cube, neighborCube: Cube) {

    if((cube.unIndentedSides & faceFlag) !== 0 && (neighborCube.unIndentedSides & faceFlagOpposite) !== 0) {

        cube.hiddenSides |= faceFlag;
        neighborCube.hiddenSides |= faceFlagOpposite;

    }else {
        advancedFaceVisibilityTest(faceFlag, faceFlagOpposite, cube, neighborCube);
    }

}

function faceFlagToFace(faceFlag: FaceFlags) {

    if(faceFlag <= FaceFlags.Back) {

        switch(faceFlag) {
            case FaceFlags.Top:
                return Face.Top;
            case FaceFlags.Bottom:
                return Face.Bottom;
            case FaceFlags.Top | FaceFlags.Bottom:
                break;
            case FaceFlags.Front:
                return Face.Front;
            default:
                if (faceFlag === FaceFlags.Back) {
                    return Face.Back;
                }
                break;
        }
    }else {
        if(faceFlag === FaceFlags.Left) {
            return Face.Left;
        }

        if(faceFlag === FaceFlags.Right) {
            return Face.Right;
        }
    }
    return Face.Top;
}

function getFace(faceVertices: Uint8Array, face: Face) {

    const faceCorners = byteArrayToCorners(faceVertices);

    const result : Vector3[] = [
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3()
    ];

    switch(face) {
        case Face.Top:
            result[0] = faceCorners[0];
            result[1] = faceCorners[1];
            result[2] = faceCorners[2];
            result[3] = faceCorners[3];
            break;
        case Face.Bottom:
            result[0] = faceCorners[4];
            result[1] = faceCorners[5];
            result[2] = faceCorners[6];
            result[3] = faceCorners[7];
            break;
        case Face.Front:
            result[0] = faceCorners[7];
            result[1] = faceCorners[6];
            result[2] = faceCorners[1];
            result[3] = faceCorners[0];
            break;
        case Face.Back:
            result[0] = faceCorners[5];
            result[1] = faceCorners[4];
            result[2] = faceCorners[3];
            result[3] = faceCorners[2];
            break;
        case Face.Left:
            result[0] = faceCorners[4];
            result[1] = faceCorners[7];
            result[2] = faceCorners[0];
            result[3] = faceCorners[3];
            break;
        case Face.Right:
            result[0] = faceCorners[6];
            result[1] = faceCorners[5];
            result[2] = faceCorners[2];
            result[3] = faceCorners[1];
            break;
    }

    return result;

}

function allFaceCornersIsTouchingCubeBorder(face: Face, faceIndices: Vector3[]) {

    let index : number = -1;
    let num : number = 0.5;

    switch(face) {
        case Face.Top:
            index = 1;
            num = 0.5;
        break;
        case Face.Bottom:
            index = 1;
            num = -0.5;
        break;
        case Face.Front:
            index = 2;
            num = -0.5;
        break;
        case Face.Back:
            index = 2;
            num = 0.5;
        break;
        case Face.Left:
            index = 0;
            num = -0.5;
        break;
        case Face.Right:
            index = 0;
            num = 0.5;
        break;
    }

    for(const vector in faceIndices) {
        if(faceIndices[vector].getComponent(index) !== num) return false;
    }

    return true;

}

function advancedFaceVisibilityTest(faceFlag: FaceFlags, faceFlagOpposite: FaceFlags, cube: Cube, neighborCube: Cube) {

    const face = faceFlagToFace(faceFlag);
    const face2 = getFace(cube.byteCorners, face);

    if(allFaceCornersIsTouchingCubeBorder(face, face2)) {

        const face3 = faceFlagToFace(faceFlagOpposite);
        const face4 = getFace(neighborCube.byteCorners, face3);

        if(allFaceCornersIsTouchingCubeBorder(face3, face4)) {

            switch(face) {

                case Face.Top: case Face.Bottom: {

                    for(let i = 0; i < 4; i++) {
                        if(face2[i].x !== face4[3 - i].x || face2[i].z !== face4[3 - i].z) return;
                    }

                    cube.hiddenSides |= faceFlag;
                    neighborCube.hiddenSides |= faceFlagOpposite;

                    break;
                }

                case Face.Front: case Face.Back: {

                    if(face2[0].x !== face4[1].x || face2[0].y !== face4[1].y || face2[1].x !== face4[0].x || face2[1].y !== face4[0].y || face2[2].x !== face4[3].x || face2[2].y !== face4[3].y || face2[3].x !== face4[2].x || face2[3].y !== face4[2].y) {
                        return;
                    }

                    cube.hiddenSides |= faceFlag;
                    neighborCube.hiddenSides |= faceFlagOpposite;
                    break;

                }

                case Face.Left: case Face.Right: {

                    if(face2[0].z !== face4[1].z || face2[0].y !== face4[1].y || face2[1].z !== face4[0].z || face2[1].y !== face4[0].y || face2[2].z !== face4[3].z || face2[2].y !== face4[3].y || face2[3].z !== face4[2].z || face2[3].y !== face4[2].y) {
                        return;
                    }

                    cube.hiddenSides |= faceFlag;
                    neighborCube.hiddenSides |= faceFlagOpposite;
                    break;

                }

            }
        }

    }
}

function setCubeVisibility(cube: Cube, cubes: Cube[]) {

    let positionX = cube.x;
    let positionY = cube.y;
    let positionZ = cube.z;
    let neighborCube: Cube | undefined;

    positionY += 1;
    neighborCube = cubes.find(cub => cub.x === positionX && cub.y === positionY && cub.z === positionZ);

    if(neighborCube !== undefined) {
        simpleFaceVisibilityTest(FaceFlags.Top, FaceFlags.Bottom, cube, neighborCube);
    }

    positionY -= 2;
    neighborCube = cubes.find(cub => cub.x === positionX && cub.y === positionY && cub.z === positionZ);

    if(neighborCube !== undefined) {
        simpleFaceVisibilityTest(FaceFlags.Bottom, FaceFlags.Top, cube, neighborCube);
    }

    positionY += 1;
    positionZ += 1;
    neighborCube = cubes.find(cub => cub.x === positionX && cub.y === positionY && cub.z === positionZ);

    if(neighborCube !== undefined) {
        simpleFaceVisibilityTest(FaceFlags.Back, FaceFlags.Front, cube, neighborCube);
    }

    positionZ -= 2;
    neighborCube = cubes.find(cub => cub.x === positionX && cub.y === positionY && cub.z === positionZ);

    if(neighborCube !== undefined) {
        simpleFaceVisibilityTest(FaceFlags.Front, FaceFlags.Back, cube, neighborCube);
    }

    positionZ += 1;
    positionX += 1;
    neighborCube = cubes.find(cub => cub.x === positionX && cub.y === positionY && cub.z === positionZ);

    if(neighborCube !== undefined) {
        simpleFaceVisibilityTest(FaceFlags.Right, FaceFlags.Left, cube, neighborCube);
    }

    positionX -= 2;
    neighborCube = cubes.find(cub => cub.x === positionX && cub.y === positionY && cub.z === positionZ);

    if(neighborCube !== undefined) {
        simpleFaceVisibilityTest(FaceFlags.Left, FaceFlags.Right, cube, neighborCube);
    }
    positionX += 1;
   
}

export function parse(data: Uint8Array, scale: Vector3 = new Vector3(1, 1, 1)) {

    const cubes: CubeProps[] = [];
    
    const blocks = parseModel(data);

    for(const cube in blocks) {
        
        const uvs: number[] = [];
        const vertices : number[] = [];
        
        const colors: number[] = [];
        const faceList: Face[] = [];
        
        setCubeVisibility(blocks[cube], blocks);

        const visibleVertices = getVisibleFaceVertices(blocks[cube]);
        const vertexIndex = getVertexIndex(blocks[cube]);
        
        for(const face in visibleVertices) {

            const uv = getFaceUVs(visibleVertices[face].faceVertices, visibleVertices[face].face, scale);

            for(const i in uv) {
                uvs.push(uv[i].x);
                uvs.push(uv[i].y);
            }

            for(const vert in visibleVertices[face]["faceVertices"]) {
                vertices.push(visibleVertices[face]["faceVertices"][vert].x);
                vertices.push(visibleVertices[face]["faceVertices"][vert].y);
                vertices.push(visibleVertices[face]["faceVertices"][vert].z);
                faceList.push(visibleVertices[face].face);
            }

            for(const color in visibleVertices[face]["colors"]) {
                colors.push(visibleVertices[face]["colors"][color].r);
                colors.push(visibleVertices[face]["colors"][color].g);
                colors.push(visibleVertices[face]["colors"][color].b);
            }

        }

        const position = new Vector3(blocks[cube].x, blocks[cube].y, blocks[cube].z);

        cubes.push({
            position, 
            vertices: new Float32Array(vertices), 
            faces: faceList,
            index: getBlockIndex(vertexIndex),
            uv: new Float32Array(uvs), 
            material: blocks[cube].material, 
            colors: new Float32Array(colors), 
        });

        setCubeVisibility(blocks[cube], blocks);
       
    }

    return cubes;

}
