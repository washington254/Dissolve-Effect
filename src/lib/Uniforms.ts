// all uniform related data stay here 
import GenColor from "./GenColor";
export const edgeColor = new GenColor('#0099ff');

export const dissolveUniformData = {
    uEdgeColor: {
        value: edgeColor.vec3,
    },
    uFreq: {
        value: 0.6,
    },
    uAmp: {
        value: 15.0
    },
    uProgress: {
        value: 0.0
    },
    uEdge: {
        value: 0.5
    }

}
