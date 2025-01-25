import { world } from "../main";
import { meshColor } from "../main";
import { edgeColor } from "./Uniforms";
import { genMesh, phyMat } from "../main";
import { dissolveUniformData } from "./Uniforms";
import { BladeApi } from "tweakpane";
import { updateGenMeshGeo } from '../main';

import { planeGeo, sphereGeo, torusGeo, boxGeo } from './geometries';

function createTweakList(name: string, keys: string[], vals: any[]): BladeApi {
    const opts = [];
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = vals[i];
        opts.push({ text: k, value: v });
    }

    return world.pane.addBlade({
        view: 'list', label: name,
        options: opts,
        value: vals[0]
    })
}

function handleMeshColorUpdate(color: string) {
    meshColor.setColor(color);
    phyMat.color = meshColor.rgb;
}

function handleEdgeColorUpdate(color: string) {
    edgeColor.setColor(color);
    dissolveUniformData.uEdgeColor.value = edgeColor.vec3;
}

function handleMeshChange(geo: any) {
    world.scene.remove(genMesh); updateGenMeshGeo(geo); world.scene.add(genMesh);
}

export function setupTweaks() {
    const TWEAKS = {
        meshColor: meshColor.hexString,
        edgeColor: edgeColor.hexString,
        object: genMesh,
        freq: dissolveUniformData.uFreq.value,
        amp: dissolveUniformData.uAmp.value,
        progress: dissolveUniformData.uProgress.value,
        edge: dissolveUniformData.uEdge.value
    }

    const meshBlade = createTweakList('Mesh', ['Sphere', 'Plane', 'Torus', 'Box'], [sphereGeo, planeGeo, torusGeo, boxGeo]);
    const meshColorBinding = world.pane.addBinding(TWEAKS, 'meshColor')
    const edgeColorBinding = world.pane.addBinding(TWEAKS, "edgeColor")
    const frequencyBinding = world.pane.addBinding(TWEAKS, "freq", { min: 0, max: 1, step: 0.001 })
    const amplitudeBinding = world.pane.addBinding(TWEAKS, "amp", { min: 12, max: 25, step: 0.001 })
    const progressBinding = world.pane.addBinding(TWEAKS, "progress", { min: -20, max: 20, step: 0.00001 })
    const edgeBinding = world.pane.addBinding(TWEAKS, "edge", { min: 0, max: 5, step: 0.0001 })

    meshBlade.on('change', (val) => { handleMeshChange(val.value) })
    meshColorBinding.on('change', (val) => { handleMeshColorUpdate(val.value) });
    edgeColorBinding.on('change', (val) => { handleEdgeColorUpdate(val.value) });
    frequencyBinding.on('change', (val) => { dissolveUniformData.uFreq.value = val.value });
    amplitudeBinding.on('change', (val) => { dissolveUniformData.uAmp.value = val.value });
    progressBinding.on('change', (val) => { dissolveUniformData.uProgress.value = val.value });
    edgeBinding.on('change', (val) => { dissolveUniformData.uEdge.value = val.value });
}
