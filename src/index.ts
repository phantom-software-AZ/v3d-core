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
const shadow_debug = false;

import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Scene} from "@babylonjs/core/scene";
import {Engine} from "@babylonjs/core/Engines/engine";
import * as CANNON from 'cannon-es';
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Color3, Space, Vector3} from "@babylonjs/core/Maths/math";
import {ShadowGenerator} from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import * as VRMLoader from 'babylon-vrm-loader/src';
import {DirectionalLight} from "@babylonjs/core/Lights/directionalLight";
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight";
import {PointLight} from "@babylonjs/core/Lights/pointLight";
import {SphereBuilder} from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import {TorusKnotBuilder} from "@babylonjs/core/Meshes/Builders/torusKnotBuilder";
import {MToonMaterial} from "babylon-mtoon-material/src";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {Material} from "@babylonjs/core/Materials/material";
import {VertexBuffer} from "@babylonjs/core/Meshes/buffer";
import {AmmoJSPlugin, BoxBuilder, CannonJSPlugin, PhysicsImpostor, PhysicsImpostorParameters} from "@babylonjs/core";
import {Mesh} from "@babylonjs/core/Meshes/mesh";

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
    const gravityVector = new Vector3(0,-9.81, 0);
    // const physicsPlugin = new CannonJSPlugin(true, 10, CANNON);
    // @ts-ignore
    const ammo = await window.Ammo();
    const physicsPlugin  = new AmmoJSPlugin(true, ammo);
    scene.enablePhysics(gravityVector, physicsPlugin);

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
    directionalLight.position = new Vector3(-50, 25, 0);
    directionalLight.setEnabled(true);
    const hemisphericLight = new HemisphericLight('HemisphericLight1', new Vector3(-0.2, -0.8, -1), scene);
    hemisphericLight.setEnabled(false);
    const pointLight = new PointLight('PointLight1', new Vector3(0, 0, 1), scene);
    pointLight.setEnabled(false);
// Meshes
    const standardMaterialSphere = SphereBuilder.CreateSphere('StandardMaterialSphere1', {}, scene);
    standardMaterialSphere.position = new Vector3(1.2, 1.2, 0);
    standardMaterialSphere.receiveShadows = true;

    const shadowCaster = TorusKnotBuilder.CreateTorusKnot('ShadowCaster', {}, scene);
    shadowCaster.position = new Vector3(-10.0, 5.0, 0.0);
    shadowCaster.setEnabled(shadow_debug);
    if (shadow_debug) {
        const shadowGenerator = new ShadowGenerator(1024, directionalLight);
        shadowGenerator.addShadowCaster(shadowCaster);
    }

    const vrmManager = scene.metadata.vrmManagers[0];

    // Update secondary animation
    scene.onBeforeRenderObservable.add(() => {
        vrmManager.update(scene.getEngine().getDeltaTime());
    });

    // Physics?
    const floor = BoxBuilder.CreateBox('MyFloor', {width: 15, height: 2, depth: 15}, scene);
    floor.position = new Vector3(0, -2, 0);
    floor.receiveShadows = true;
    const reparent = true;
    const rootMesh = vrmManager.rootMesh;
    rootMesh.checkCollisions = false;
    floor.checkCollisions = false;
    vrmManager.enablePhysics();
    // const parent = rootMesh.parent;
    // if (reparent === true) rootMesh.setParent(null);
    // const options: PhysicsImpostorParameters = {
    //     mass: 1,
    //     friction: 0.1,
    //     restitution: 0.9,
    // }
    // rootMesh.physicsImpostor = new PhysicsImpostor(rootMesh, PhysicsImpostor.BoxImpostor, options, scene);
    // if (reparent === true) rootMesh.parent = parent;
    floor.physicsImpostor = new PhysicsImpostor(floor, PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0 }, scene);

    if (debug) {
        await scene.debugLayer.show({
            globalRoot: document.getElementById('wrapper') as HTMLElement,
            handleResize: true,
        });
    }

    engine.runRenderLoop(() => {
        scene.render();
    });

// Model Transformation
    vrmManager.rootMesh.translate(new Vector3(1, 0, 0), 1);

// Work with HumanoidBone
    vrmManager.humanoidBone.leftUpperArm.addRotation(0, -1, 0);

// Work with BlendShape(MorphTarget)
    vrmManager.morphing('Joy', 1.0);

    fileInput.value = '';
};

export {};
