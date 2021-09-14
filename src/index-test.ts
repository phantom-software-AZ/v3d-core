import "@babylonjs/core/Loading/loadingScreen";

// Register plugins (side effect)
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Materials";
import "@babylonjs/loaders/glTF/glTFFileLoader";

// Debug
import "@babylonjs/core/Debug";
import "@babylonjs/gui";
import "@babylonjs/inspector";
import {Scene} from "@babylonjs/core/scene";
import {Engine} from "@babylonjs/core/Engines/engine";
import {Color3, Vector3} from "@babylonjs/core/Maths/math";

import {V3DCore} from "./index";

// Init BabylonJS Engine
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
let engine: Engine;
if (Engine.isSupported()) {
    engine = new Engine(canvas, true);
}

const fileInput = document.getElementById('select-file') as HTMLInputElement;

fileInput.onchange = async (e) => {
    console.log("Onload");
    // debugger;
    const vrmFile = fileInput.files?.[0];

    // Create v3d core
    const v3DCore = new V3DCore(engine, new Scene(engine));
    v3DCore.transparentBackground();
    await v3DCore.AppendAsync('', vrmFile);

    // Get managers
    const vrmManager = v3DCore.getVRMManagerByURI(vrmFile.name);

    // Camera
    v3DCore.attachCameraTo(vrmManager);

    // Lights
    v3DCore.addAmbientLight(new Color3(1, 1, 1));

    // Lock camera target
    v3DCore.scene.onBeforeRenderObservable.add(() => {
        vrmManager.cameras[0].setTarget(vrmManager.rootMesh.getAbsolutePosition());
    });

    // Render loop
    engine.runRenderLoop(() => {
        v3DCore.scene.render();
    });

    // Model Transformation
    vrmManager.rootMesh.translate(new Vector3(1, 0, 0), 1);
    vrmManager.rootMesh.rotation = new Vector3(0, 135, 0);

    // Work with HumanoidBone
    vrmManager.humanoidBone.leftUpperArm.addRotation(0, -0.5, 0);
    vrmManager.humanoidBone.head.addRotation(0.1, 0, 0);

    // Work with BlendShape(MorphTarget)
    vrmManager.morphing('Joy', 1.0);

    fileInput.value = '';
};

export {};
