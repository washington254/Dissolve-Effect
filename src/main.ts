import './style.css'
import * as THREE from 'three';

import Setup from './Setup.ts';
import GenColor from './lib/GenColor.ts';
import { sphereGeo } from './lib/geometries.ts';

import { setupBloomComposer, resizeBloomComposer } from './lib/BloomComposer.ts';

import perlinNoise from './shaders/noise.glsl?raw';
import { fragmentGlobal, fragmentMain, vertexGlobal, vertexMain } from './shaders/edge/edgeShader.glsl';
import { setupShaderSnippets, setupUniforms } from './lib/shaderHelper.ts';

import { dissolveUniformData } from './lib/Uniforms.ts';
import { setupTweaks } from './lib/tweaks.ts';

const cnvs = document.getElementById('c') as HTMLCanvasElement;
if (!cnvs) throw new Error("Canvas not found");

export const world = new Setup(cnvs, resizeBloomComposer);
world.cam.position.set(0, 0, 8);
world.setEnvMap("/night.hdr");

const composers = setupBloomComposer(world);

export const meshColor = new GenColor('#2c2c2c');

export const phyMat = new THREE.MeshPhysicalMaterial();
phyMat.color = meshColor.rgb;
phyMat.roughness = 0.0;
phyMat.metalness = 2.0;
phyMat.transparent = true;
phyMat.side = THREE.DoubleSide;
phyMat.onBeforeCompile = (shader) => { // handle dissolve effect with edges
    setupUniforms(shader, dissolveUniformData); // just import and pass the uniform data here , will set all the uniforms 
    setupShaderSnippets(shader, vertexGlobal, vertexMain, perlinNoise + fragmentGlobal, fragmentMain);
}

export let genMesh: THREE.Object3D;
genMesh = new THREE.Mesh(sphereGeo, phyMat);

export function updateGenMeshGeo(geo: THREE.BufferGeometry) {
    genMesh = new THREE.Mesh(geo, phyMat);
}

setupTweaks();


world.scene.add(genMesh);

const blackColor = new THREE.Color(0x000000);

function animate() {
    world.stats.update();
    world.orbCtrls.update();

    //world.re.render(world.scene, world.cam);
    world.scene.background = blackColor;
    composers.composer1.render();
    world.scene.background = world.texture;
    composers.composer2.render();
    requestAnimationFrame(animate);
}

animate();
