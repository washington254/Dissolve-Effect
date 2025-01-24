import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export class Setup {

    static w = window.innerWidth;
    static h = window.innerHeight;
    static fov = 75;
    static near = 0.01;
    static far = 1000;


    cnvs: HTMLCanvasElement;
    re: THREE.WebGLRenderer;
    cam: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    stats: Stats;
    orbCtrls: OrbitControls;
    rgbeLoader: RGBELoader;
    clock: THREE.Clock;
    pane: Pane;

    constructor(cnvs: HTMLCanvasElement) {

        let aspect = Setup.w / Setup.h;

        // create and setup the scene
        this.cnvs = cnvs;
        this.re = new THREE.WebGLRenderer({ canvas: cnvs, antialias: true });
        this.re.setSize(Setup.w, Setup.h);
        this.cam = new THREE.PerspectiveCamera(75, aspect, Setup.near, Setup.far);
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.orbCtrls = new OrbitControls(this.cam, this.cnvs);
        this.rgbeLoader = new RGBELoader();
        this.pane = new Pane();


        document.body.appendChild(this.stats.dom);



        // attach resize handler
        window.addEventListener('resize', () => { this.handleWindowResize() });


        this.smoothOrbCtrls();

    }

    smoothOrbCtrls() {
        this.orbCtrls.enableDamping = true;
        this.orbCtrls.dampingFactor = 0.01;
        this.orbCtrls.rotateSpeed = 0.5;
    }

    setEnvMap(url: string) {
        this.rgbeLoader.load(url, (texture: THREE.DataTexture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.scene.environment = texture;
        }
        )
    }



    private updateCanvasSize(w: number, h: number) {
        this.cnvs.style.width = w + "px";
        this.cnvs.style.height = h + "px";
    }

    private updateCameraAndRenderer(w: number, h: number) {
        this.cam.aspect = w / h;
        this.re.setSize(w, h);
        this.cam.updateProjectionMatrix();
    }

    private handleWindowResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.updateCanvasSize(w, h);
        this.updateCameraAndRenderer(w, h);
    }


}
