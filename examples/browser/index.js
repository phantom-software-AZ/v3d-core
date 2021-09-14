// Get webpack export
const V3DCore = window["v3d-core"];

// Init BabylonJS Engine
const canvas = document.getElementById('renderCanvas');
let engine;
if (BABYLON.Engine.isSupported()) {
    engine = new BABYLON.Engine(canvas, true);
}

const fileInput = document.getElementById('select-file');
fileInput.onchange = async (e) => {
    console.log("Onload");
    const vrmFile = fileInput.files?.[0];

    // Init v3d-core
    const v3DCore = new V3DCore.V3DCore(engine);
    v3DCore.transparentBackground();

    // Load VRM file
    await v3DCore.AppendAsync('', vrmFile);

    // Get manager
    const vrmManager = v3DCore.getVRMManagerByURI(vrmFile.name);

    // Camera
    v3DCore.attachCameraTo(vrmManager);

    // Lights
    v3DCore.addAmbientLight(new BABYLON.Color3(1, 1, 1));

    // Lock camera target
    v3DCore.scene.onBeforeRenderObservable.add(() => {
        vrmManager.cameras[0].setTarget(vrmManager.rootMesh.getAbsolutePosition());
    });

    // Render loop
    engine.runRenderLoop(() => {
        v3DCore.scene.render();
    });

    // Model Transformation
    vrmManager.rootMesh.translate(new BABYLON.Vector3(1, 0, 0), 1);
    vrmManager.rootMesh.rotation = new BABYLON.Vector3(0, 135, 0);

    // Work with HumanoidBone
    vrmManager.humanoidBone.leftUpperArm.addRotation(0, -0.5, 0);
    vrmManager.humanoidBone.head.addRotation(0.1, 0, 0);

    // Work with BlendShape(MorphTarget)
    vrmManager.morphing('Joy', 1.0);

    fileInput.value = '';
};
