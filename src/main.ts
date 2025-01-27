import './style.css'

import * as THREE from 'three';

import Setup from './Setup.ts';
import GenColor from './lib/GenColor.ts';
import ParticleSystem from './lib/ParticleSystem.ts';
import { torusGeo } from './lib/geometries.ts';

import { setupBloomComposer, resizeBloomComposer } from './lib/BloomComposer.ts';

import perlinNoise from './shaders/noise.glsl?raw';
import { fragmentGlobal, fragmentMain, vertexGlobal, vertexMain } from './shaders/edge/edgeShader.glsl';
import particleVertex from './shaders/particle/vertex.glsl?raw';
import particleFragment from './shaders/particle/fragment.glsl?raw';
import { setupShaderSnippets, setupUniforms } from './lib/shaderHelper.ts';

import { dissolveUniformData } from './lib/Uniforms.ts';
import { progressBinding, setupTweaks, TWEAKS } from './lib/tweaks.ts';



const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/particle.png');



const cnvs = document.getElementById('c') as HTMLCanvasElement;
if (!cnvs) throw new Error("Canvas not found");

export const world = new Setup(cnvs, resizeBloomComposer);
world.cam.position.set(0, 0, 8);
world.setEnvMap("/night.hdr");

const composers = setupBloomComposer(world);

export const meshColor = new GenColor('#363636');

export const phyMat = new THREE.MeshStandardMaterial();
phyMat.color = meshColor.rgb;
phyMat.roughness = 0.0;
phyMat.metalness = 2.0;
phyMat.transparent = true;
phyMat.side = THREE.DoubleSide;
//phyMat.sheen = 1.0;
phyMat.onBeforeCompile = (shader) => { // handle dissolve effect with edges
    setupUniforms(shader, dissolveUniformData); // just import and pass the uniform data here , will set all the uniforms 
    setupShaderSnippets(shader, vertexGlobal, vertexMain, perlinNoise + fragmentGlobal, fragmentMain);
}

export let genMesh: THREE.Object3D;
export let particleMesh: THREE.Points;
export let particleSystem: ParticleSystem;

genMesh = new THREE.Mesh(torusGeo, phyMat);

export function updateGenMeshGeo(geo: THREE.BufferGeometry) {
    genMesh = new THREE.Mesh(geo, phyMat);
}

export function updateParticleSystem(geo: THREE.BufferGeometry) {
    particleMesh = new THREE.Points(geo, pointsMat);
    particleSystem = new ParticleSystem(geo);
    particleSystem.updateAttributesValues();
}



export const particleColor = new GenColor('#4d9bff');

export const particleUniforms = {
    uPixelDensity: {
        value: world.re.getPixelRatio(),
    },
    uBaseSize: {
        value: 80.0,
    },
    uFreq: dissolveUniformData.uFreq,
    uAmp: dissolveUniformData.uAmp,
    uEdge: dissolveUniformData.uEdge,
    uColor: { value: particleColor.vec3 },
    uProgress: dissolveUniformData.uProgress,
    uParticleTexture: { value: particleTexture }
}

setupTweaks();


const pointsMat = new THREE.ShaderMaterial();
pointsMat.transparent = true;
pointsMat.blending = THREE.AdditiveBlending;
pointsMat.uniforms = particleUniforms;
pointsMat.vertexShader = particleVertex;
pointsMat.fragmentShader = particleFragment;
particleMesh = new THREE.Points(torusGeo, pointsMat);
particleSystem = new ParticleSystem(torusGeo);


world.scene.add(particleMesh);
world.scene.add(genMesh);

const blackColor = new THREE.Color(0x000000);

const planeGeo = new THREE.PlaneGeometry(20, 20);
planeGeo.rotateX(Math.PI * -0.5);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });
planeMat.side = THREE.DoubleSide;
planeMat.roughness = 1.0;
planeMat.metalness = 0.6;
planeMat.emissiveIntensity = 1.0;
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.position.set(0, -5, 0);
world.scene.add(plane);


let autoProgress = false;

export function setAutoProgress(value: boolean) {
    autoProgress = value;
}

function animate() {
    world.stats.update();
    world.orbCtrls.update();

    particleSystem.updateAttributesValues();


    if (autoProgress) {
        dissolveUniformData.uProgress.value = Math.sin(world.clock.getElapsedTime() * 0.2) * 10.0;
        TWEAKS.progress = dissolveUniformData.uProgress.value;
        progressBinding.refresh();
    }



    //world.re.render(world.scene, world.cam);

    world.scene.background = blackColor;
    composers.composer1.render();

    world.scene.background = world.texture;
    composers.composer2.render();
    requestAnimationFrame(animate);
}

animate();
