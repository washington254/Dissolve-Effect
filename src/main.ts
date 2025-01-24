import './style.css'
import { Setup } from './Setup';
import * as THREE from 'three';

const cnvs = document.getElementById('c') as HTMLCanvasElement;
if (!cnvs) throw new Error("Canvas not found");


const world = new Setup(cnvs);
world.cam.position.set(0, 0, 5);
world.setEnvMap("/night.hdr");

const PARAMS = {
    box_x: 0,
    box_y: 0,
    box_z: 0,
}
world.pane.addBinding(PARAMS, "box_x", { min: -10, max: 10, step: 0.01 });


const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const normalMat = new THREE.MeshNormalMaterial();
const box = new THREE.Mesh(boxGeo, normalMat);


world.scene.add(box);


function updateBox() {

    box.position.setX(PARAMS.box_x);

    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
}

function animate() {
    world.stats.update();
    world.orbCtrls.update();

    updateBox();

    world.re.render(world.scene, world.cam);
    requestAnimationFrame(animate);
}

animate();
