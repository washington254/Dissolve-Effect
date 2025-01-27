import * as THREE from 'three';
import Setup from '../Setup';
import { EffectComposer, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';

let res = new THREE.Vector2(window.innerWidth, window.innerHeight);

let effectComposer: EffectComposer;
let effectComposer2: EffectComposer;

let renderPass: RenderPass;
let bloomPass: UnrealBloomPass;
let outPass: OutputPass;
let shaderPass: ShaderPass;

export function setupBloomComposer(world: Setup): { composer1: EffectComposer, composer2: EffectComposer } {

    effectComposer = new EffectComposer(world.re);
    effectComposer2 = new EffectComposer(world.re);
    renderPass = new RenderPass(world.scene, world.cam);

    bloomPass = new UnrealBloomPass(res, 0.8, 0.2, 0.0);
    outPass = new OutputPass();


    // use when there are multiple objects 
    const layer1 = new THREE.Layers();
    layer1.set(1);


    effectComposer.addPass(renderPass);
    effectComposer.addPass(bloomPass);

    effectComposer.renderToScreen = false

    shaderPass = new ShaderPass(new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null }, // effect Composer will set this value it'll pass the base textre from previous pass
            uBloomTexture: {
                value: effectComposer.renderTarget2.texture
            }
        },

        vertexShader: `
        varying vec2 vUv;
        void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
    `,

        fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D uBloomTexture;
        varying vec2 vUv;
        void main(){
            vec4 baseEffect = texture2D(tDiffuse,vUv);
            vec4 bloomEffect = texture2D(uBloomTexture,vUv);
            gl_FragColor =baseEffect + bloomEffect;
        }
    `,
    }));


    effectComposer2.addPass(renderPass);
    effectComposer2.addPass(shaderPass);
    effectComposer2.addPass(outPass);

    return {
        composer1: effectComposer,
        composer2: effectComposer2,
    }
}

export function resizeBloomComposer() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderPass.setSize(w, h);
    bloomPass.setSize(w, h);
    shaderPass.setSize(w, h);
    outPass.setSize(w, h);


    effectComposer.setSize(w, h);
    effectComposer2.setSize(w, h);

}
