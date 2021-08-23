// has side-effect
// ref. https://webpack.js.org/guides/tree-shaking#mark-the-file-as-side-effect-free
// babylonjs loading screen
import "@babylonjs/core/Loading/loadingScreen";

// Register plugins (side effect)
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Materials";
import "@babylonjs/loaders/glTF/glTFFileLoader";

// Debug
import "@babylonjs/core/Debug";
import "@babylonjs/gui";
import "@babylonjs/inspector";
const debug = true;

import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Scene} from "@babylonjs/core/scene";
import {Engine} from "@babylonjs/core/Engines/engine";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Vector3} from "@babylonjs/core/Maths/math";

import * as VRMLoader from 'babylon-vrm-loader/src';
import {DirectionalLight} from "@babylonjs/core/Lights/directionalLight";
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight";
import {PointLight} from "@babylonjs/core/Lights/pointLight";
import {Mesh} from "@babylonjs/core/Meshes/mesh";
import {ShadowGenerator} from "@babylonjs/core/Lights/Shadows/shadowGenerator";

console.log('Init');

// Init Babylon Engine
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
let engine: Engine, scene: Scene;
if (Engine.isSupported()) {
    engine = new Engine(canvas, true);
}

VRMLoader.loadVrmManager();

// vrmFile is File object retrieved by <input type="file">.
const fileInput = document.getElementById('select-file') as HTMLInputElement;

fileInput.onchange = async (e) => {
    const vrmFile = fileInput.files?.[0];
    scene = await SceneLoader.LoadAsync('file:', vrmFile, engine);

    // Camera
    const camera = new ArcRotateCamera('MainCamera1', 0, 0, 3, new Vector3(0, 1.5, 0),
        scene, true);
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 20;
    camera.wheelDeltaPercentage = 0.01;
    camera.setPosition(new Vector3(0, 1.5, -3));
    camera.setTarget(new Vector3(0, 1.5, 0));
    camera.attachControl(canvas);

    scene.createDefaultEnvironment({
        createGround: true,
        createSkybox: false,
        enableGroundMirror: false,
        enableGroundShadow: false,
    });

    // Lights
    const directionalLight = new DirectionalLight('DirectionalLight1', new Vector3(0, -0.5, 1.0), scene);
    directionalLight.position = new Vector3(0, 25, -50);
    directionalLight.setEnabled(true);
    const hemisphericLight = new HemisphericLight('HemisphericLight1', new Vector3(-0.2, -0.8, -1), scene);
    hemisphericLight.setEnabled(false);
    const pointLight = new PointLight('PointLight1', new Vector3(0, 0, 1), scene);
    pointLight.setEnabled(false);

    // Meshes
    const standardMaterialSphere = Mesh.CreateSphere('StandardMaterialSphere1', 16, 1, scene);
    standardMaterialSphere.position = new Vector3(1.5, 1.2, 0);
    standardMaterialSphere.receiveShadows = true;

    const shadowCaster = Mesh.CreateTorusKnot('ShadowCaster', 1, 0.2, 32, 32, 2, 3, scene);
    shadowCaster.position = new Vector3(0.0, 5.0, -10.0);
    shadowCaster.setEnabled(debug);
    if (true) {
        const shadowGenerator = new ShadowGenerator(1024, directionalLight);
        shadowGenerator.addShadowCaster(shadowCaster);
    }

    const vrmManager = scene.metadata.vrmManagers[0];

    // Update secondary animation
    scene.onBeforeRenderObservable.add(() => {
        vrmManager.update(scene.getEngine().getDeltaTime());
    });

    await scene.debugLayer.show({
        globalRoot: document.getElementById('wrapper') as HTMLElement,
        handleResize: true,
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

// Model Transformation
    vrmManager.rootMesh.translate(new Vector3(1, 0, 0), 1);

// Work with HumanoidBone
    vrmManager.humanoidBone.leftUpperArm.addRotation(0, 1, 0);

// Work with BlendShape(MorphTarget)
    vrmManager.morphing('Joy', 1.0);

    fileInput.value = '';
};

export {};
