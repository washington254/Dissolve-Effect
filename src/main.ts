import './style.css'

import * as THREE from 'three';

import Setup from './Setup.ts';
import GenColor from './lib/GenColor.ts';
import ParticleSystem from './lib/ParticleSystem.ts';
import { teapotGeo } from './lib/geometries.ts';
import { meshArr } from './lib/tweaks.ts';
import { meshBlade } from './lib/tweaks.ts';

import { setupBloomComposer, resizeBloomComposer } from './lib/BloomComposer.ts';

import perlinNoise from './shaders/noise.glsl?raw';
import { fragmentGlobal, fragmentMain, vertexGlobal, vertexMain } from './shaders/edge/edgeShader.glsl';
import particleVertex from './shaders/particle/vertex.glsl?raw';
import particleFragment from './shaders/particle/fragment.glsl?raw';
import { setupShaderSnippets, setupUniforms } from './lib/shaderHelper.ts';

import { dissolveUniformData } from './lib/Uniforms.ts';
import { handleMeshChange, progressBinding, setupTweaks, TWEAKS } from './lib/tweaks.ts';



const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/particle.png');



const cnvs = document.getElementById('c') as HTMLCanvasElement;
if (!cnvs) throw new Error("Canvas not found");

export const world = new Setup(cnvs, resizeBloomComposer);
if (world.isMobileDevice()) {
    world.cam.position.set(4, 5, 20);
    world.setEnvMap("/night1k.hdr");
} else {
    world.cam.position.set(5, 7, 12);
    world.setEnvMap("/night2k.hdr");
}

const composers = setupBloomComposer(world);

export const meshColor = new GenColor('#636363');

export const phyMat = new THREE.MeshPhysicalMaterial();
phyMat.color = meshColor.rgb;
phyMat.iridescence = 0.2;
phyMat.roughness = 0.0;
phyMat.metalness = 2.0;
phyMat.side = THREE.DoubleSide;
phyMat.sheen = 1.0;
phyMat.onBeforeCompile = (shader) => { // handle dissolve effect with edges
    setupUniforms(shader, dissolveUniformData); // just import and pass the uniform data here , will set all the uniforms 
    setupShaderSnippets(shader, vertexGlobal, vertexMain, perlinNoise + fragmentGlobal, fragmentMain);
}

export let genMesh: THREE.Object3D;
export let particleMesh: THREE.Points;
export let particleSystem: ParticleSystem;

genMesh = new THREE.Mesh(teapotGeo, phyMat);

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
        value: world.isMobileDevice() ? 25.0 : 40.0,
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
particleMesh = new THREE.Points(teapotGeo, pointsMat);
particleSystem = new ParticleSystem(teapotGeo);


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
// world.scene.add(plane);


let autoProgress = false;

export function setAutoProgress(value: boolean) {
    autoProgress = value;
}

const scale = 0.7;

function resizeRendererToDisplaySize() {
    let width = 0;
    let height = 0;
    if (world.isMobileDevice()) {
        width = cnvs.clientWidth * scale;
        height = cnvs.clientHeight * scale;
    } else {
        width = cnvs.clientWidth;
        height = cnvs.clientHeight;

    }

    let needResize = false;
    if (world.isMobileDevice()) {
        needResize = cnvs.width !== width * scale || cnvs.height !== height * scale;
    } else {
        needResize = cnvs.width !== width || cnvs.height !== height;
    }
    if (needResize) {
        world.re.setSize(width, height, false);
    }
    return needResize;
}
const planeColor = new THREE.Color(0x1b1b1b);

let currentMesh = 1;
let lock = false;
let direction = 1;





function animate() {
    world.stats.update();
    world.orbCtrls.update();


    if (resizeRendererToDisplaySize()) {
        const canvas = world.re.domElement;
        world.cam.aspect = canvas.clientWidth / canvas.clientHeight;
        world.cam.updateProjectionMatrix();
    }

    particleSystem.updateAttributesValues();

    const time = world.clock.getElapsedTime();

    if (autoProgress) {
        if (direction == 1) {
            dissolveUniformData.uProgress.value += 0.1 * TWEAKS.speed;// Math.sin(time * TWEAKS.speed) * 15.0;
        } else {
            dissolveUniformData.uProgress.value -= 0.1 * TWEAKS.speed;// Math.sin(time * TWEAKS.speed) * 15.0;
        }
        if (dissolveUniformData.uProgress.value >= 14.00 || dissolveUniformData.uProgress.value <= -14.0) direction *= -1;
        if (dissolveUniformData.uProgress.value >= 14 && direction == 1) direction = -1;
        if (dissolveUniformData.uProgress.value <= -14 && direction == -1) direction = 1;

        TWEAKS.progress = dissolveUniformData.uProgress.value;
        if (TWEAKS.progress >= 14.0 && lock == false) {
            const index = currentMesh % (meshArr.length);
            const geo = meshArr[index];
            handleMeshChange(geo);
            currentMesh++;
            lock = true;
            //@ts-ignore
            meshBlade.value = meshArr[index];
        }

        if (TWEAKS.progress < 0) {
            lock = false;
        }
        progressBinding.refresh();

    }


    genMesh.position.y += Math.sin(time * 1.0) * 0.01;
    particleMesh.position.y += Math.sin(time * 1.0) * 0.01;

    //world.re.render(world.scene, world.cam);

    world.scene.background = blackColor;
    plane.material.color = blackColor;
    composers.composer1.render();

    plane.material.color = planeColor;


    composers.composer2.render();
    requestAnimationFrame(animate);
}

animate();
