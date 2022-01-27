/** Copyright (c) 2021 The v3d Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import "@babylonjs/core/Loading/loadingScreen";

// Register plugins (side effect)
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Materials";
import "@babylonjs/loaders/glTF/glTFFileLoader";

// Debug
import "@babylonjs/core/Debug";
import "@babylonjs/gui";
import "@babylonjs/inspector";
const debug = false;

import {Engine} from "@babylonjs/core/Engines/engine";
import {Color3, Curve3, Vector3} from "@babylonjs/core/Maths/math";

import {V3DCore, V3DHelper} from "v3d-core/dist/src";
import {VRMManager} from "v3d-core/dist/src/importer/babylon-vrm-loader/src";
import {AbstractMesh, DirectionalLight, HemisphericLight, Mesh, PointLight,
     StandardMaterial, Animation, EasingFunction,
    Texture, Node, TransformNode, VolumetricLightScatteringPostProcess, AnimationGroup,
    IAnimationKey, BlackAndWhitePostProcess, UniversalCamera, Scene} from "@babylonjs/core";
import * as EaseFunctions from "@babylonjs/core/Animations/easing";

declare global {
    interface Window {
        vrmManager: VRMManager;
        v3DCore: V3DCore;
    }
}

// Init BabylonJS Engine
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
let engine: Engine;
if (Engine.isSupported()) {
    engine = new Engine(canvas, true);
}

window.onload = async (e) => {
    console.log("Onload");
    const vrmFile = 'testfiles/2078913627571329107.vrm';
    const vrmFile2 = 'testfiles/7822444336497004526.vrm';
    const fingers = ["Thumb", "Index", "Middle", "Ring", "Little"]
    const parts = ["Proximal", "Intermediate", "Distal"]
    const initialDelay = 6000;

    // Create v3d-core
    const scene = new Scene(engine);
    const freeCam = new UniversalCamera("FreeCam", Vector3.Zero(), scene);
    freeCam.minZ = 0.1;
    const v3DCore = new V3DCore(engine, scene, freeCam);
    const v3DHelper = new V3DHelper(v3DCore);
    window.v3DCore = v3DCore;
    v3DCore.transparentBackground();
    await v3DCore.AppendAsync('./classroom/', 'classroom_m.babylon');
    await v3DCore.AppendAsync('', vrmFile);
    await v3DCore.AppendAsync('', vrmFile2);

    // Get managers
    const vrmManager = v3DCore.getVRMManagerByURI(vrmFile);
    const vrmManager2 = v3DCore.getVRMManagerByURI(vrmFile2);

    // Camera
    const mainCamera = v3DCore.mainCamera as UniversalCamera;
    mainCamera.setTarget(new Vector3(3.386, 0.429, -5.272));
    mainCamera.speed = 0.1;
    mainCamera.angularSensibility = 2000;
    const monoPostProcess = new BlackAndWhitePostProcess("bw", 1.0, v3DCore.mainCamera);
    v3DCore.mainCamera.detachPostProcess(monoPostProcess);

    // Lights
    const vrmRootMeshAndChildren = vrmManager.rootMesh.getDescendants();
    const vrmRootMeshAndChildren2 = vrmManager2.rootMesh.getDescendants();
    vrmManager.setShadowEnabled(true);
    vrmManager2.setShadowEnabled(true);
    const sunColor = new Color3(0.902, 0.7451, 0.5333);
    (v3DCore.scene.getNodeByName("windows") as Mesh).isVisible = false;
    v3DCore.scene.environmentIntensity = 0.4;
    v3DCore.engine.hideLoadingUI();
    const coridor_ceilingLight = v3DCore.scene.getLightByName('coridor_ceilingLight') as PointLight;
    coridor_ceilingLight.shadowMinZ = 1;
    coridor_ceilingLight.shadowMaxZ = 1;
    const blackBoard_light_old = v3DCore.scene.getLightByName('blackBoard_light') as HemisphericLight;
    blackBoard_light_old.dispose();
    const sun = v3DCore.scene.getLightByName('sun') as DirectionalLight;
    sun.position.y = 2;
    sun.position.z = 5;
    sun.position = sun.position.scale(10);
    sun.direction = sun.position.negate().normalize();
    sun.diffuse = sunColor;
    sun.specular = sunColor;
    const exterior_fillLight = v3DCore.scene.getLightByName('exterior_fillLight') as HemisphericLight;

    exterior_fillLight.intensity = 0.6;
    exterior_fillLight.diffuse = new Color3(1, 1, 1);
    exterior_fillLight.direction = new Vector3(sun.position.x, sun.position.y, sun.position.z);
    // Exclude exterior filling light from lighting walls
    exterior_fillLight.includedOnlyMeshes =
        v3DCore.scene.getNodes().filter(e => !e.name.includes("woodBase") && !e.name.includes("wall")) as AbstractMesh[];

    coridor_ceilingLight.intensity = 5;
    v3DCore.enableShabows(coridor_ceilingLight);
    // Exclude corridor light from lighting humanoid models
    coridor_ceilingLight.includedOnlyMeshes =
        v3DCore.scene.getNodes().filter(e => (!vrmRootMeshAndChildren.some(n=>e===n) && !vrmRootMeshAndChildren2.some(n=>e===n))) as AbstractMesh[];
    const coridorLightShadowGenerator = v3DCore.getShadownGenerator(coridor_ceilingLight);
    // Shadows
    v3DHelper.addNodeToShadowCasterByName(coridorLightShadowGenerator, "ceiling");
    v3DHelper.addNodeToShadowCasterByName(coridorLightShadowGenerator, "door_window");
    v3DHelper.addNodeToShadowCasterByName(coridorLightShadowGenerator, "doorFrame");
    v3DHelper.addNodeToShadowCasterByName(coridorLightShadowGenerator, "plank");
    v3DHelper.addNodeToShadowCasterContainsName(coridorLightShadowGenerator, "wall");
    v3DHelper.addNodeToShadowCasterContainsName(coridorLightShadowGenerator, "porte");
    v3DHelper.addNodeToShadowCasterContainsName(coridorLightShadowGenerator, "Plane.");
    v3DHelper.addNodeToShadowCasterContainsName(coridorLightShadowGenerator, "Cylinder813");

    sun.intensity = 1.2;
    v3DCore.enableShabows(sun);
    const sunShadowGenerator = v3DCore.getShadownGenerator(sun);
    // Shadows
    v3DHelper.addNodeToShadowCasterByName(sunShadowGenerator, "ceiling");
    v3DHelper.addNodeToShadowCasterByName(sunShadowGenerator, "plank");
    v3DHelper.addNodeToShadowCasterByName(sunShadowGenerator, "vrm_root_0");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "wall");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "woodWindow");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "woodBase");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "Box280");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "Box297");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "Plane.");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "Cylinder813");
    v3DHelper.addNodeToShadowCasterContainsName(sunShadowGenerator, "ChamferBox01");

    // roomLight
    const roomLightIntensity = 1.2;
    const room_light = new DirectionalLight("classroom_light",
        new Vector3(0.2, -1, -0.2), v3DCore.scene);
    room_light.setEnabled(true);
    room_light.intensity = roomLightIntensity;
    // Exclude room light from lighting humanoid models
    room_light.includedOnlyMeshes =
        v3DCore.scene.getNodes().filter(e => (!vrmRootMeshAndChildren.some(n=>e===n) && !vrmRootMeshAndChildren2.some(n=>e===n))) as AbstractMesh[];
    v3DCore.enableShabows(room_light);
    const blackBoardLightShadowGenerator = v3DCore.getShadownGenerator(room_light);
    // Shadows
    v3DHelper.addNodeToShadowCasterByName(blackBoardLightShadowGenerator, "Plane.008");
    v3DHelper.addNodeToShadowCasterByName(blackBoardLightShadowGenerator, "Plane.009");
    v3DHelper.addNodeToShadowCasterByName(blackBoardLightShadowGenerator, "Plane.010");
    v3DHelper.addNodeToShadowCasterByName(blackBoardLightShadowGenerator, "Plane.015");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "porte");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Box280");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Box297");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Plane.");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Cylinder813");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Line263");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Line264");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Line265");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "Rectangl16");
    v3DHelper.addNodeToShadowCasterContainsName(blackBoardLightShadowGenerator, "ChamferBox01");

    // Make meshes receive shadows
    v3DHelper.makeReceiveShadowByName("sol");
    v3DHelper.makeReceiveShadowByName("worldMap");
    v3DHelper.makeReceiveShadowByName("ceiling");
    v3DHelper.makeReceiveShadowByName("beams");
    v3DHelper.makeReceiveShadowByName("plank");
    v3DHelper.makeReceiveShadowContainsName("wall");
    v3DHelper.makeReceiveShadowContainsName("porte");
    v3DHelper.makeReceiveShadowContainsName("woodBase");

    // Volumetric light
    const vls = new VolumetricLightScatteringPostProcess(
        'vls', 1.0, v3DCore.mainCamera, null, 100,
        Texture.BILINEAR_SAMPLINGMODE, v3DCore.engine, false, v3DCore.scene);
    (vls.mesh.material as StandardMaterial).diffuseTexture = new Texture('texture/sun.png', v3DCore.scene, true, false, Texture.BILINEAR_SAMPLINGMODE);
    (vls.mesh.material as StandardMaterial).diffuseTexture.hasAlpha = true;
    (vls.mesh.material as StandardMaterial).diffuseColor = sunColor;
    vls.mesh.position = sun.position;
    vls.mesh.scaling = new Vector3(10, 10, 10);

    // Skybox
    v3DCore.createSkyBox(200, "texture/rainbow");
    v3DCore.skyBox.skyboxBaseMaterial.useSunPosition = true;
    v3DCore.skyBox.skyboxBaseMaterial.sunPosition = vls.mesh.position;

    v3DCore.scene.imageProcessingConfiguration.contrast = 1.8;
    v3DCore.scene.imageProcessingConfiguration.exposure = 1.2;

    // Inspector
    if (debug) {
        await v3DCore.scene.debugLayer.show({
            globalRoot: document.getElementById('wrapper'),
            handleResize: true,
        });
    }

    // Custom Render function
    let gravityPowerCycle = 0;
    const gravityDir = new Vector3(1, 0, 0);
    v3DCore.updateAfterRenderFunction(
        () => {
            // Simulated wind
            const gravityPowerTerm = (gravityPowerCycle / 1000) * Math.PI;
            vrmManager.update(
                v3DCore.engine.getDeltaTime(),
                {
                    gravityPower: 0.0666 * (
                        Math.cos(gravityPowerTerm)
                        + Math.sin(gravityPowerTerm * 2) + 2),
                    gravityDir: gravityDir,
                });
            gravityPowerCycle += v3DCore.engine.getDeltaTime();
        }
    );

    // Render loop
    let needCache = true;
    v3DCore.engine.runRenderLoop(() => {
        if (needCache) {
            triggerCache();
            v3DCore.scene.render();
            needCache = false;
        } else
            v3DCore.scene.render();
    });

    // Manual fix for problematic meshes
    function removeMeshes(a: number, b: number) {
        const bodyMesh = vrmManager.rootMesh.getChildTransformNodes(true)[1].getChildTransformNodes(true)[0] as Mesh;
        const bodyMeshIndices = bodyMesh.getIndices(true, true);
        for (let i = a; i < b; i++) { // remove some vertices
            bodyMeshIndices[i] = 0;
        }
        bodyMesh.setIndices(bodyMeshIndices);
    }
    removeMeshes(18900, 19200);

    // Scene and models setup
    const frontDoor = v3DCore.scene.getNodeByName("porte") as TransformNode;
    setupScene();
    setupScene2();

    // Animations
    const keyframetimes: number[] = [];
    const {animationGroup1, animationGroup11, animationGroup2,
        camAnimationGroup1} = setupAnimations();

    function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    await doAnimation();

    async function doAnimation() {
        // Init
        camAnimationGroup1.reset();
        animationGroup11.reset();
        animationGroup1.reset();
        animationGroup2.reset();
        coridor_ceilingLight.diffuse = new Color3(1, 1, 1);
        await sleep(initialDelay);
        (vrmManager2.rootMesh as Node).setEnabled(false);
        (vrmManager.rootMesh as Node).setEnabled(true);

        // Start camera motion
        camAnimationGroup1.play(false);

        // Set up first appearance
        await sleep(keyframetimes[0] / 60 * 1000 + 1);
        const coridor_ceilingLight_intensity = coridor_ceilingLight.intensity;
        coridor_ceilingLight.intensity = 0.1;
        frontDoor.rotation.y = -0.9425;
        (vrmManager2.rootMesh as Node).setEnabled(true);

        // Second Animation start
        animationGroup1.onAnimationGroupEndObservable.addOnce(() => {
            animationGroup11.play(true);
        });
        animationGroup1.play(false);

        // First animation when turn around
        await sleep((keyframetimes[1] - keyframetimes[0]) / 60 * 1000 + 1);
        animationGroup2.play(false);

        // Turn back
        await sleep(2000);
        // (vrmManager.rootMesh as Node).setEnabled(false);
        await v3DCore.startQuickAnimation(mainCamera,
            "mainCamera1-2", "target",
            60, new Vector3(-2.546, 1.187, 1.274), new Vector3(2.384, 0.871, -8.381),
            undefined, new EaseFunctions.CubicEase()).waitAsync();

        // Post processing effects
        await sleep(1000);
        const aberrationAmount = 160;
        const aberrationDuration = 2;
        v3DCore.renderingPipeline.chromaticAberrationEnabled = true;
        v3DCore.renderingPipeline.chromaticAberration.aberrationAmount = 0;
        await v3DCore.startQuickAnimation(v3DCore.renderingPipeline.chromaticAberration,
            "chromaticAberration1",
            "aberrationAmount",
            aberrationDuration, 0, aberrationAmount).waitAsync();
        await v3DCore.startQuickAnimation(v3DCore.renderingPipeline.chromaticAberration,
            "chromaticAberration2",
            "aberrationAmount",
            aberrationDuration, aberrationAmount, 0).waitAsync();
        mainCamera.attachPostProcess(monoPostProcess);
        v3DCore.renderingPipeline.grainEnabled = true;
        v3DCore.renderingPipeline.grain.animated = true;
        v3DCore.renderingPipeline.grain.intensity = 35;
        v3DCore.renderingPipeline.imageProcessing.vignetteEnabled = true;
        v3DCore.renderingPipeline.imageProcessing.vignetteCameraFov = 1;
        v3DCore.renderingPipeline.imageProcessing.vignetteWeight = 2.1;
        (vrmManager.rootMesh as Node).setEnabled(false);
        await sleep(1500);
        await v3DCore.startQuickAnimation(v3DCore.renderingPipeline.chromaticAberration,
            "chromaticAberration3",
            "aberrationAmount",
            aberrationDuration, 0, aberrationAmount).waitAsync();
        await v3DCore.startQuickAnimation(v3DCore.renderingPipeline.chromaticAberration,
            "chromaticAberration4",
            "aberrationAmount",
            aberrationDuration, aberrationAmount, 0).waitAsync();
        (vrmManager.rootMesh as Node).setEnabled(true);
        animationGroup11.stop();
        animationGroup11.reset();
        animationGroup1.reset();
        v3DCore.renderingPipeline.chromaticAberrationEnabled = false;
        v3DCore.renderingPipeline.grainEnabled = false;
        v3DCore.renderingPipeline.imageProcessing.vignetteEnabled = false;
        mainCamera.detachPostProcess(monoPostProcess);

        // Turn back again
        await sleep(3500);
        (vrmManager2.rootMesh as Node).setEnabled(false);
        await v3DCore.startQuickAnimation(mainCamera,
            "mainCamera1-3", "target",
            60, new Vector3(2.384, 0.871, -8.381), new Vector3(-3.121, 1.614, -0.067),
            undefined, new EaseFunctions.CubicEase()).waitAsync();
        const node = v3DCore.scene.getNodeByName("Circle.008") as Mesh;
        await v3DCore.startQuickAnimation(node.material,
            node.name,
            "emissiveIntensity",
            60, 1, 0, undefined,
            new EaseFunctions.BounceEase(3, 3),
            EasingFunction.EASINGMODE_EASEINOUT).waitAsync();
        await v3DCore.startQuickAnimation(node.material,
            node.name,
            "emissiveIntensity",
            60, 0, 1, undefined,
            new EaseFunctions.BounceEase(3, 3),
            EasingFunction.EASINGMODE_EASEINOUT).waitAsync();
        coridor_ceilingLight.diffuse = new Color3(0.9804, 0.0392, 0.0392);
        v3DCore.startQuickAnimation(coridor_ceilingLight,
            "coridor_ceilingLight2",
            "intensity",
            180, 0.1, coridor_ceilingLight_intensity / 2, undefined,
            new EaseFunctions.CubicEase(),
            EasingFunction.EASINGMODE_EASEIN).waitAsync();
        v3DCore.startQuickAnimation(frontDoor.rotation,
            "frontDoor.rotation",
            "y",
            180, -0.9425, 0, undefined,
            new EaseFunctions.CubicEase(),
            EasingFunction.EASINGMODE_EASEIN).waitAsync();
    }

    function setupScene() {
        // Mesh transformation
        const woodWindow = v3DCore.scene.getNodeByName("woodWindow") as TransformNode;
        woodWindow.position = new Vector3(4.077, 1.878, -4.357);
        woodWindow.addRotation(0, 0, 1.5708);
        (v3DCore.scene.getNodeByName("ChamferBox065.002") as TransformNode).position = new Vector3(3.429, 0.402, -1.257);

        // Model Transformation
        const skeletonViewer = v3DHelper.showSkeletonDebug(
            (vrmManager.rootMesh.getChildTransformNodes()[1] as Mesh).skeleton,
            vrmManager.rootMesh);
        skeletonViewer.isEnabled = false;
        vrmManager.rootMesh.position = new Vector3(3.05, 0, -4);
        vrmManager.rootMesh.addRotation(0, -1.5708, 0);
        vrmManager.rootMesh.scaling = new Vector3(1.1, 1.2, -1.1);

        // Work with HumanoidBone
        vrmManager.humanoidBone.head.addRotation(0.699, 0.349, 0);
        vrmManager.humanoidBone.neck.addRotation(0.35, 0, 0);
        vrmManager.humanoidBone.spine.addRotation(-0.949, 0, 0);
        vrmManager.humanoidBone.hips.addRotation(-0.175, 0, 0);
        vrmManager.humanoidBone.leftUpperArm.addRotation(1.397, 0, 0).addRotation(0, -1.4, 1.571);
        vrmManager.humanoidBone.rightUpperArm.addRotation(1.397, 0, 0).addRotation(0, 1.4, -1.571);
        vrmManager.humanoidBone.leftLowerArm.addRotation(0, -0.174, -0.523).addRotation(0.349, 0, 0);
        vrmManager.humanoidBone.rightLowerArm.addRotation(0, 0.174, 0.523).addRotation(-0.349, 0, 0);
        vrmManager.humanoidBone.leftHand.addRotation(-0.175, 0, -0.785);
        vrmManager.humanoidBone.rightHand.addRotation(0, 0, 0.785);
        vrmManager.humanoidBone.leftThumbProximal.addRotation(0, 0.348, 0);
        vrmManager.humanoidBone.rightThumbProximal.addRotation(0, -0.348, 0);
        vrmManager.humanoidBone.leftUpperLeg.addRotation(0.175, 0, 0);
        vrmManager.humanoidBone.rightUpperLeg.addRotation(0.175, 0, 0);
        vrmManager.humanoidBone.leftLowerLeg.addRotation(-0.175, 0, 0);

        // Work with BlendShape
        vrmManager.morphing('Sorrow', 0.4);
        vrmManager.morphing('I', 0.6);
    }

    function setupScene2() {
        // Mesh transformation
        frontDoor.rotation = new Vector3(Math.PI, Math.PI * 2, 0);

        // Model Transformation
        const skeletonViewer2 = v3DHelper.showSkeletonDebug(
            (vrmManager2.rootMesh.getChildTransformNodes()[1] as Mesh).skeleton,
            vrmManager2.rootMesh);
        skeletonViewer2.isEnabled = false;
        vrmManager2.rootMesh.position = new Vector3(-2.22, 0, 1.8);
        vrmManager2.rootMesh.scaling = new Vector3(1.2, 1.2, -1.2);
        vrmManager2.rootMesh.addRotation(0, -0.98, 0);

        // Work with HumanoidBone
        vrmManager2.humanoidBone.rightShoulder.position = new Vector3(0.06, 0.06, 0.02);
        vrmManager2.humanoidBone.leftUpperArm.addRotation(0, -0.348, 0);
        vrmManager2.humanoidBone.rightUpperArm.rotation = new Vector3(0, 0.3491, -1.412);
        vrmManager2.humanoidBone.leftLowerArm.addRotation(0, 0, -1.218);
        vrmManager2.humanoidBone.leftHand.addRotation(-0.348, 0, -0.174);
        vrmManager2.humanoidBone.leftLittleProximal.addRotation(0, -0.18, 0);
        vrmManager2.humanoidBone.leftRingProximal.addRotation(0, -0.09, 0);
        vrmManager2.humanoidBone.leftIndexProximal.addRotation(0, 0.15, 0);
        vrmManager2.humanoidBone.leftThumbProximal.addRotation(0, 0.348, 0);
        vrmManager2.humanoidBone.leftThumbIntermediate.addRotation(0, 0.348, 0);
        vrmManager2.humanoidBone.leftThumbDistal.addRotation(0, 0.174, 0);

        // MorphTarget
        vrmManager2.morphing("Sorrow", 0.7);
    }

    function setupAnimations() {
        // Model 1 Animation 0
        const animation1Start1 = 0;
        const animation1Length1 = 70;
        const animation1Start2 = 50;
        const animation1Length2 = 70;
        const animation1: [Node, Animation][] = [];
        const animation1EaseFunc = new EaseFunctions.CubicEase();
        const animation1EaseMode = EasingFunction.EASINGMODE_EASEINOUT;
        const animation1EaseFunc2 = new EaseFunctions.QuarticEase();
        const animation1EaseMode2 = EasingFunction.EASINGMODE_EASEOUT;

        let keyFrames: Array<IAnimationKey> = [
            {
                frame: animation1Start1,
                value: new Vector3(0.699, 0.349, 0),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(0, 0.5236, 0),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.head,
            "head", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(-0.949, 0, 0),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(-0.0873, 0.3491, 0),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.spine,
            "spine", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(0, 0, 0),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(-0.0873, 0.3491, 0),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.chest,
            "chest", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(0, 0, 0),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(-0.03491, 0.3491, 0),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.upperChest,
            "upperChest", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(-0.175, 0, 0),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(0, 0, 0),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.hips,
            "hips", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(0.1682, -1.541, 0.1765),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(0, 0, 1.309),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.leftUpperArm,
            "leftUpperArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(0.1682, 1.541, -0.1765),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(0.1745, 1.396, -0.1745),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.rightUpperArm,
            "rightUpperArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(0.3008, -0.3538, -0.5503),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(0.9599, -0.1745, -0.349),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.leftLowerArm,
            "leftLowerArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(-0.3008, -0.0058, 0.5503),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(-0.1745, 0.349, 1.9024),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.rightLowerArm,
            "rightLowerArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(-0.175, 0, -0.785),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(-0.6981, 0, -0.349),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.leftHand,
            "leftHand", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start1,
                value: new Vector3(0, 0, 0.785),
            },
            {
                frame: animation1Start1 + animation1Length1,
                value: new Vector3(0, 0.349, 0),
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.humanoidBone.rightHand,
            "rightHand", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc, animation1EaseMode));
        keyFrames = [
            {
                frame: animation1Start2,
                value: 0.4,
            },
            {
                frame: animation1Start2 + animation1Length2,
                value: 0,
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.MorphTargetPropertyMap["Sorrow"],
            "morph1", "value", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc2, animation1EaseMode2));
        keyFrames = [
            {
                frame: animation1Start2,
                value: 0.6,
            },
            {
                frame: animation1Start2 + animation1Length2,
                value: 0,
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.MorphTargetPropertyMap["I"],
            "morph2", "value", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc2, animation1EaseMode2));
        keyFrames = [
            {
                frame: animation1Start2,
                value: 0,
            },
            {
                frame: animation1Start2 + animation1Length2,
                value: 1.5,
            }
        ];
        animation1.push(v3DCore.createAnimation(vrmManager.MorphTargetPropertyMap["Joy"],
            "morph3", "value", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation1EaseFunc2, animation1EaseMode2));
        const animationGroup1 = new AnimationGroup("vrmManager1-1");
        for (const a of animation1)
            animationGroup1.addTargetedAnimation(a[1], a[0]);
        animationGroup1.normalize(Math.min(animation1Start1, animation1Start2),
            Math.max(animation1Start1 + animation1Length1, animation1Start2 + animation1Length2));

        // Model 1 Animation 1
        const animation11Start1 = 0;
        const animation11Length1 = 35;
        const animation11: [Node, Animation][] = [];
        const animation11EaseFunc = new EaseFunctions.CubicEase();
        const animation11EaseMode = EasingFunction.EASINGMODE_EASEOUT;
        keyFrames = [
            {
                frame: animation11Start1,
                value: new Vector3(-0.1745, 0.349, 1.9024),
            },
            {
                frame: animation11Start1 + animation11Length1,
                value: new Vector3(0.1745, 0.349, 1.9024),
            },
            {
                frame: animation11Start1 + animation11Length1 + animation11Length1,
                value: new Vector3(-0.1745, 0.349, 1.9024),
            }
        ];
        animation11.push(v3DCore.createAnimation(vrmManager.humanoidBone.rightLowerArm,
            "rightLowerArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation11EaseFunc, animation11EaseMode));
        keyFrames = [
            {
                frame: animation11Start1,
                value: new Vector3(0, 0.349, 0),
            },
            {
                frame: animation11Start1 + animation11Length1,
                value: new Vector3(0, -0.174, 0),
            },
            {
                frame: animation11Start1 + animation11Length1 + animation11Length1,
                value: new Vector3(0, 0.349, 0),
            }
        ];
        animation11.push(v3DCore.createAnimation(vrmManager.humanoidBone.rightHand,
            "rightHand", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation11EaseFunc, animation11EaseMode));
        const animationGroup11 = new AnimationGroup("vrmManager1-2");
        for (const a of animation11)
            animationGroup11.addTargetedAnimation(a[1], a[0]);

        // Model 2 Animation 0
        const animation2Start = 0;
        const animation2Length = 50;
        const animation2: [Node, Animation][] = [];
        const animation2EaseFunc = new EaseFunctions.ExponentialEase();
        keyFrames = [
            {
                frame: animation2Start,
                value: new Vector3(0, 0, 0),
            },
            {
                frame: animation2Start + animation2Length,
                value: new Vector3(0, 0, -0.3491),
            }
        ];
        animation2.push(v3DCore.createAnimation(vrmManager2.humanoidBone.rightShoulder,
            "rightShoulder", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation2EaseFunc, EasingFunction.EASINGMODE_EASEOUT));
        keyFrames = [
            {
                frame: animation2Start,
                value: new Vector3(0, 0.3491, -1.412),
            },
            {
                frame: animation2Start + animation2Length,
                value: new Vector3(-0.2618, 0.7854, -0.4363),
            }
        ];
        animation2.push(v3DCore.createAnimation(vrmManager2.humanoidBone.rightUpperArm,
            "rightUpperArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation2EaseFunc, EasingFunction.EASINGMODE_EASEOUT));
        keyFrames = [
            {
                frame: animation2Start,
                value: new Vector3(0, 0, 0),
            },
            {
                frame: animation2Start + animation2Length,
                value: new Vector3(0.348, 2.262, 0),
            }
        ];
        animation2.push(v3DCore.createAnimation(vrmManager2.humanoidBone.rightLowerArm,
            "rightLowerArm", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation2EaseFunc, EasingFunction.EASINGMODE_EASEOUT));
        keyFrames = [
            {
                frame: animation2Start,
                value: new Vector3(0, 0, 0),
            },
            {
                frame: animation2Start + animation2Length,
                value: new Vector3(0.696, 0, 0),
            }
        ];
        animation2.push(v3DCore.createAnimation(vrmManager2.humanoidBone.rightHand,
            "rightHand", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation2EaseFunc, EasingFunction.EASINGMODE_EASEOUT));
        keyFrames = [
            {
                frame: animation2Start,
                value: new Vector3(0, 0, 0),
            },
            {
                frame: animation2Start + animation2Length,
                value: new Vector3(-0.174, 0, 0),
            }
        ];
        animation2.push(v3DCore.createAnimation(vrmManager2.humanoidBone.head,
            "head", "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            animation2EaseFunc, EasingFunction.EASINGMODE_EASEOUT));
        const dir = "right";
        const val1 = -1.19;
        for (const fin of fingers)
            for (const part of parts) {
                const humanoidBone: any = vrmManager2.humanoidBone;
                const node = humanoidBone[dir + fin + part] as TransformNode;
                keyFrames = [
                    {
                        frame: animation2Start,
                        value: new Vector3(0, 0, 0),
                    },
                    {
                        frame: animation2Start + animation2Length,
                        value: new Vector3(0, 0, 0),
                    }
                ]
                if (fin === "Thumb")
                    keyFrames[1].value.x = val1;
                else
                    keyFrames[1].value.z = val1;
                animation2.push(v3DCore.createAnimation(node,
                    node.name, "rotation", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
                    animation2EaseFunc, EasingFunction.EASINGMODE_EASEOUT));
            }
        const animationGroup2 = new AnimationGroup("vrmManager2-1");
        for (const a of animation2)
            animationGroup2.addTargetedAnimation(a[1], a[0]);
        animationGroup2.normalize(animation2Start, animation2Start + animation2Length)

        // Camera animation 1
        const camAnimation1: [Node, Animation][] = [];
        const camAnimation1EaseFunc = new EaseFunctions.QuarticEase();
        const camAnimation1EaseMode = EasingFunction.EASINGMODE_EASEINOUT;
        let timestamp = 0;
        const accumulateTime = (interval: number, saveTo?: number[]) => {
            timestamp += interval;
            if (saveTo)
                saveTo.push(timestamp);
            return timestamp;
        }
        const keyFrameTimestamps = [
            [timestamp, accumulateTime(120)],
            [timestamp, accumulateTime(330)],
            [timestamp, accumulateTime(240)],
            [timestamp, accumulateTime(210)],
            [timestamp, accumulateTime(240)],
            [timestamp, accumulateTime(210)],
            [timestamp, accumulateTime(420)],
            [timestamp, accumulateTime(120, keyframetimes)],
            [accumulateTime(210), accumulateTime(60)],
            [accumulateTime(60), accumulateTime(40)],
            [accumulateTime(120), accumulateTime(90, keyframetimes)],
        ]
        keyFrames = [];
        createCurveForCamera(keyFrames,
            new Vector3(-3.037, 0.856, -4.306), keyFrameTimestamps[0][0],
            new Vector3(-3.037, 0.856, -4.306), keyFrameTimestamps[0][1]);
        createCurveForCamera(keyFrames,
            new Vector3(-3.037, 0.856, -4.306), keyFrameTimestamps[0][1],
            new Vector3(-1.931, 0.889, -2.756), keyFrameTimestamps[1][1]);
        createCurveForCamera(keyFrames,
            new Vector3(-1.931, 0.889, -2.756), keyFrameTimestamps[1][1],
            new Vector3(-1.764, 1.885, -1.015), keyFrameTimestamps[2][1]);
        createCurveForCamera(keyFrames,
            new Vector3(-1.764, 1.885, -1.015), keyFrameTimestamps[2][1],
            new Vector3(-1.375, 1.922, 0.450), keyFrameTimestamps[3][1]);
        createCurveForCamera(keyFrames,
            new Vector3(-1.375, 1.922, 0.450), keyFrameTimestamps[3][1],
            new Vector3(0.901, 1.667, 1.375), keyFrameTimestamps[4][1]);
        createCurveForCamera(keyFrames,
            new Vector3(0.901, 1.667, 1.375), keyFrameTimestamps[4][1],
            new Vector3(0.868, 1.667, 1.416), keyFrameTimestamps[5][1]);
        createCurveForCamera(keyFrames,
            new Vector3(0.868, 1.667, 1.416), keyFrameTimestamps[5][1],
            new Vector3(3.167, 1.575, -1.913), keyFrameTimestamps[6][1]);
        camAnimation1.push(v3DCore.createAnimation(mainCamera,
            "mainCamera1", "position", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            camAnimation1EaseFunc, camAnimation1EaseMode));
        keyFrames = [
            {
                frame: keyFrameTimestamps[0][0],
                value: new Vector3(0, 0, 0),
            },
            {
                frame: keyFrameTimestamps[0][1],
                value: new Vector3(-0.198, 0.576, 1.594),
            },
            {
                frame: keyFrameTimestamps[1][1],
                value: new Vector3(-0.543, 2.374, 3.474),
            },
            {
                frame: keyFrameTimestamps[2][1],
                value: new Vector3(3.754, 2.486, 2.470),
            },
            {
                frame: keyFrameTimestamps[3][1],
                value: new Vector3(-3.613, 1.959, 6.610),
            },
            {
                frame: keyFrameTimestamps[4][1],
                value: new Vector3(6.354, -1.837, 2.339),
            },
            {
                frame: keyFrameTimestamps[5][1],
                value: new Vector3(5.836, 2.371, 5.631),
            },
            {
                frame: keyFrameTimestamps[6][1],
                value: new Vector3(8.714, 1.726, 1.092),
            },
            {
                frame: keyFrameTimestamps[7][1],
                value: new Vector3(4.462, 0.917, -8.279),
            },
            {
                frame: keyFrameTimestamps[8][0],
                value: new Vector3(4.462, 0.917, -8.279),
            },
            {
                frame: keyFrameTimestamps[8][1],
                value: new Vector3(2.862, -0.982, -7.939),
            },
            {
                frame: keyFrameTimestamps[9][0],
                value: new Vector3(2.862, -0.982, -7.939),
            },
            {
                frame: keyFrameTimestamps[9][1],
                value: new Vector3(4.462, 0.917, -8.279),
            },
            {
                frame: keyFrameTimestamps[10][0],
                value: new Vector3(4.462, 0.917, -8.279),
            },
            {
                frame: keyFrameTimestamps[10][1],
                value: new Vector3(-2.546, 1.187, 1.274),
            },
        ];
        camAnimation1.push(v3DCore.createAnimation(mainCamera,
            "mainCamera1", "target", keyFrames, Animation.ANIMATIONLOOPMODE_CYCLE,
            camAnimation1EaseFunc, camAnimation1EaseMode));
        const camAnimationGroup1 = new AnimationGroup("mainCamera1-1");
        for (const a of camAnimation1)
            camAnimationGroup1.addTargetedAnimation(a[1], a[0]);
        camAnimationGroup1.normalize(0, keyFrameTimestamps[10][1]);

        return {animationGroup1, animationGroup11, animationGroup2, camAnimationGroup1};
    }

    /**
     * A quick caching hack
     */
    async function triggerCache() {
        v3DCore.scene.imageProcessingConfiguration.exposure = 0.0001;

        const onEndFunc11 = () => {
            animationGroup11.onAnimationGroupEndObservable.removeCallback(onEndFunc11);
            animationGroup11.reset();
            animationGroup1.reset();
        }
        animationGroup11.onAnimationGroupEndObservable.add(onEndFunc11);
        animationGroup1.onAnimationGroupEndObservable.addOnce(() => {
            animationGroup11.play(false);
        });
        animationGroup1.play(false);

        const onEndFunc2 = () => {
            animationGroup2.onAnimationGroupEndObservable.removeCallback(onEndFunc2);
            animationGroup2.reset();
        }
        animationGroup2.onAnimationGroupEndObservable.addOnce(onEndFunc2);
        animationGroup2.play(false);

        const cameraPos = mainCamera.position;
        const cameraTarget = mainCamera.target;

        mainCamera.position = new Vector3(10.430, 1.847, 1.072);
        mainCamera.target = new Vector3(6.248, 1.970, -0.171);

        await sleep(initialDelay);

        mainCamera.position = cameraPos;
        mainCamera.target = cameraTarget;

        v3DCore.scene.imageProcessingConfiguration.exposure = 1.2;
    }

    function createCurveForCamera(
        keyFrames: Array<IAnimationKey>,
        p1: Vector3,
        t1: number,
        p2: Vector3,
        t2: number
    ) {
        const catmullRom = Curve3.CreateCatmullRomSpline(
            [p1, p2], t2 - t1);
        const points = catmullRom.getPoints();
        for (let p = 0; p < points.length; p++) {
            keyFrames.push({
                frame: p+t1,
                value: points[p]
            });
        }
    }

};
