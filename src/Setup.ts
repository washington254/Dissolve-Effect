import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export default class Setup {

    static fov = 75;
    static near = 0.01;
    static far = 1000;


    cnvs: HTMLCanvasElement;
    re: THREE.WebGLRenderer;
    cam: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    stats: Stats;
    orbCtrls: OrbitControls;
    texture!: THREE.DataTexture;
    rgbeLoader: RGBELoader;
    clock: THREE.Clock;
    resizeHandler: () => void;
    pane: Pane;

    constructor(cnvs: HTMLCanvasElement, resizeHandler: () => void) {

        let w = cnvs.clientWidth;
        let h = cnvs.clientHeight;
        let aspect = w / h;

        // create and setup the scene
        this.cnvs = cnvs;
        this.re = new THREE.WebGLRenderer({ canvas: cnvs, antialias: true });
        this.re.toneMapping = THREE.CineonToneMapping;
        this.re.outputColorSpace = THREE.SRGBColorSpace;
        if (this.isMobileDevice()) {
            this.re.setSize(cnvs.clientWidth * 0.7, cnvs.clientHeight * 0.7, false);
        } else {
            this.re.setSize(cnvs.clientWidth, cnvs.clientHeight, false);
        }
        this.re.setPixelRatio(window.devicePixelRatio);
        this.cam = new THREE.PerspectiveCamera(75, aspect, Setup.near, Setup.far);
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.orbCtrls = new OrbitControls(this.cam, this.cnvs);
        this.orbCtrls.enableZoom = false;
        this.rgbeLoader = new RGBELoader();
        this.pane = new Pane();
        this.resizeHandler = resizeHandler;


        document.body.appendChild(this.stats.dom);



        // attach resize handler
        window.addEventListener('resize', () => { this.handleWindowResize() });
        window.addEventListener('orientationchange', () => {
            location.reload();
        });



    }


    isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    setEnvMap(url: string) {
        this.rgbeLoader.load(url, (texture: THREE.DataTexture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.scene.environment = texture;
            this.texture = texture;
        }
        )
    }


    updateTexture() {
        this.scene.environment = this.texture;
    }

    private handleWindowResize() {

        this.resizeHandler();
    }


}


