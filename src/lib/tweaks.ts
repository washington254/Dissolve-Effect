import { particleColor, world } from "../main";

import { meshColor } from "../main";
import { edgeColor1, edgeColor2 } from "./Uniforms";
import { genMesh, phyMat, particleMesh } from "../main";
import { dissolveUniformData } from "./Uniforms";
import { particleUniforms } from "../main";
import { BladeApi } from "tweakpane";
import { BindingApi } from "@tweakpane/core";
import { updateGenMeshGeo, updateParticleSystem } from '../main';
import { setAutoProgress } from "../main";
import { sphereGeo, torusGeo, boxGeo } from './geometries';

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

function handleEdge1ColorUpdate(color: string) {
    edgeColor1.setColor(color);
    dissolveUniformData.uEdgeColor1.value = edgeColor1.vec3;
}

function handleParticleColorUpdate(color: string) {
    particleColor.setColor(color);
    particleUniforms.uColor.value = particleColor.vec3;
}

function handleMeshChange(geo: any) {
    world.scene.remove(genMesh); updateGenMeshGeo(geo); world.scene.add(genMesh);


    world.scene.remove(particleMesh);
    updateParticleSystem(geo);
    world.scene.add(particleMesh);
}
export const TWEAKS: { [key: string]: any } = {};
export let progressBinding: BindingApi;
export function setupTweaks() {

    TWEAKS.meshColor = meshColor.hexString
    TWEAKS.edgeColor = edgeColor1.hexString
    TWEAKS.edgeColor2 = edgeColor2.hexString
    TWEAKS.particleColor = particleColor.hexString
    TWEAKS.object = genMesh
    TWEAKS.freq = dissolveUniformData.uFreq.value
    TWEAKS.amp = dissolveUniformData.uAmp.value
    TWEAKS.progress = dissolveUniformData.uProgress.value
    TWEAKS.edge = dissolveUniformData.uEdge.value
    TWEAKS.autoprogress = false;

    const meshBlade = createTweakList('Mesh', ['Trous', 'Sphere', 'Box'], [torusGeo, sphereGeo, boxGeo]);
    const meshColorBinding = world.pane.addBinding(TWEAKS, 'meshColor')
    const edge1ColorBinding = world.pane.addBinding(TWEAKS, "edgeColor")
    //const edge2ColorBinding = world.pane.addBinding(TWEAKS, "edgeColor2")
    const particleColorBinding = world.pane.addBinding(TWEAKS, "particleColor");
    const frequencyBinding = world.pane.addBinding(TWEAKS, "freq", { min: 0, max: 1, step: 0.001 })
    const amplitudeBinding = world.pane.addBinding(TWEAKS, "amp", { min: 12, max: 25, step: 0.001 })
    const autoProgressBinding = world.pane.addBinding(TWEAKS, "autoprogress");

    progressBinding = world.pane.addBinding(TWEAKS, "progress", { min: -20, max: 20, step: 0.00001 })
    const edgeBinding = world.pane.addBinding(TWEAKS, "edge", { min: 0, max: 5, step: 0.0001 })

    //@ts-ignore
    meshBlade.on('change', (val) => { handleMeshChange(val.value) })
    meshColorBinding.on('change', (val) => { handleMeshColorUpdate(val.value) });
    edge1ColorBinding.on('change', (val) => { handleEdge1ColorUpdate(val.value) });
    //edge2ColorBinding.on('change', (val) => { handleEdge2ColorUpdate(val.value) });
    particleColorBinding.on('change', (val) => { handleParticleColorUpdate(val.value) });
    frequencyBinding.on('change', (val) => { dissolveUniformData.uFreq.value = val.value });
    amplitudeBinding.on('change', (val) => { dissolveUniformData.uAmp.value = val.value });
    progressBinding.on('change', (val) => { dissolveUniformData.uProgress.value = val.value as number });
    edgeBinding.on('change', (val) => { dissolveUniformData.uEdge.value = val.value });
    autoProgressBinding.on('change', (val) => { setAutoProgress(val.value) });
}
