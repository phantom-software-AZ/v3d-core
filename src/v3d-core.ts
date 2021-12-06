/** Copyright (c) 2021 The v3d Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Scene} from "@babylonjs/core/scene";
import {Engine} from "@babylonjs/core/Engines/engine";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Color3, Color4, Vector3} from "@babylonjs/core/Maths/math";

import {GLTFLoaderExtensionObserver} from "./importer/loader-observer";
import {
    VRMFileLoader,
    VRMLoaderExtension,
    VRMManager
} from "babylon-vrm-loader/src";
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import {Animation, Animatable, Camera, DefaultRenderingPipeline, EventState, IShadowLight, Light, ShadowGenerator, DepthOfFieldEffectBlurLevel, IAnimationKey, EasingFunction, Nullable, SceneOptimizerOptions } from "@babylonjs/core";
import {getAnimationDataType, isIShadowLight} from "./utilities/types";
import {V3DSceneOptimizer} from "./scene/optimizer";
import {v3DSkyBox} from "./scene/skybox";


export class V3DCore implements GLTFLoaderExtensionObserver {

    public static FRAMERATE = 60;

    /**
     * GLTFFileLoader plugin factory
     * @private
     */
    private _vrmFileLoader = new VRMFileLoader();
    /**
     * Shadow generators
     */
    private _shadowGenerators:
        Map<IShadowLight, ShadowGenerator> =
        new Map<IShadowLight, ShadowGenerator>();

    /**
     * Scene optimizer
     */
    private _sceneOptimizer: V3DSceneOptimizer;

    /**
     * Rendering pipeline
     */
    private readonly _renderingPipeline: DefaultRenderingPipeline;
    get renderingPipeline(): DefaultRenderingPipeline {
        return this._renderingPipeline;
    }

    /**
     * Callbacks when loading is done
     */
    private _onLoadCompleteCallbacks: Function[] = [];
    public addOnLoadCompleteCallbacks(callback: Function): void {
        this._onLoadCompleteCallbacks.push(callback);
    }

    public removeOnLoadCompleteCallback(callback: Function) {
        const idx = this._onLoadCompleteCallbacks.indexOf(callback);
        if(idx !== -1) {
            this._onLoadCompleteCallbacks.splice(idx, 1);
        }
    }

    public resetOnLoadCompleteCallbacks() {
        this._onLoadCompleteCallbacks = [];
    }

    private _beforeRenderFunc:
        (eventData: Scene, eventState: EventState) => void = () => {};
    private _afterRenderFunc:
        (eventData: Scene, eventState: EventState) => void = () => {
        for (const manager of this.loadedVRMManagers) {
            manager.update(this.engine.getDeltaTime());
        }
    };

    public updateBeforeRenderFunction(
        func: (eventData: Scene, eventState: EventState) => void) {
        this._beforeRenderFunc = func;
    }

    public updateAfterRenderFunction(
        func: (eventData: Scene, eventState: EventState) => void) {
        this._afterRenderFunc = func;
    }

    private _cameraOnBeforeRenderFunc: Function[] = [];
    private _mainCamera: Camera;
    get mainCamera(): Camera {
        return this._mainCamera;
    }
    set mainCamera(value: Camera) {
        this._mainCamera = value;
    }

    public skyBox: v3DSkyBox = null;

    /**
     * Loaded VRM Managers
     * @private
     */
    public loadedVRMManagers: VRMManager[] = [];
    public addVRMManager(manager: VRMManager) {
        if (manager)
            this.loadedVRMManagers.push(manager);
    }

    /**
     * Get VRM Manager by index
     * @param idx
     */
    public getVRMManagerByIndex(idx: number) {
        return (idx >= 0 && idx < this.loadedVRMManagers.length)
            ? this.loadedVRMManagers[idx]
            : null;
    }

    /**
     * Get VRM Manager by URI
     * VRM doesn't have any UID in metadata. Title can be unfilled too.
     * Filename is the only reasonable ID.
     * @param uri
     */
    // VRM doesn't have any UID in metadata. Title can be unfilled too.
    // Filename is the only reasonable ID.
    public getVRMManagerByURI(uri: String) {
        for (const manager of this.loadedVRMManagers) {
            if (manager.uri === uri)
                return manager;
        }
        return null;
    }

    public constructor(
        readonly engine: Engine,
        public scene?: Scene,
        camera?: Camera,
    ) {
        // Register
        this.registerVrmPlugin();
        this.registerVrmExtension();

        if (!this.scene)
            this.scene = new Scene(this.engine);
        else
            this.engine = this.scene.getEngine();

        this.setupObservable();
        this.enableResize();

        if (camera) {
            this._mainCamera = camera;
            this.scene.switchActiveCamera(camera);
        } else
            this.addCamera();
        this._renderingPipeline = new DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            true, // Do you want the pipeline to use HDR texture?
            this.scene, // The scene instance
            [this._mainCamera] // The list of cameras to be attached to
        );
        this.setupRenderingPipeline();
    }

    /**
     * Make background transparent.
     */
    public transparentBackground() {
        this.scene.clearColor.a = 0;
    }

    /**
     * Make background solid.
     */
    public solidBackground() {
        this.scene.clearColor.a = 1;
    }

    /**
     * Change background color.
     * @param color
     */
    public setBackgroundColor(color: Color3) {
        this.scene.clearColor = Color4.FromColor3(color, this.scene.clearColor.a).toLinearSpace();
    }

    /**
     * Add an ambient light.
     * @param color color of the light
     */
    public addAmbientLight(color?: Color3) {
        const light = new HemisphericLight(
            "V3DHemiLight",
            new Vector3(0, 1, 1), this.scene);
        if (color)
            light.diffuse = color;
        light.setEnabled(true);
    }

    /**
     * Add a basic arc rotate camera to scene.
     * TODO: there seems to be a bug when meshes are near the edge of camera cone
     * Probably has something to do with culling
     * @param radius rotation radius
     */
    private addCamera(
        radius: number = 3,
    ) {
        const camera = new ArcRotateCamera(
            'V3DMainCamera',
            0, 0, radius,
            new Vector3(0, 0, 0),
            this.scene, true);
        camera.lowerRadiusLimit = 0.1;
        camera.upperRadiusLimit = 20;
        camera.wheelDeltaPercentage = 0.05;
        camera.minZ = 0;
        camera.setPosition(new Vector3(0, 1.5, -5));
        camera.attachControl(this.engine.getRenderingCanvas());

        this._mainCamera = camera;
        this.scene.switchActiveCamera(this._mainCamera, true);
    }

    /**
     * Attach a arc rotate following camera to VRM model.
     * Probably has something to do with culling
     * @param manager VRM Manager to attach the camera to
     * @param radius rotation radius
     */
    public attachCameraTo(
        manager: VRMManager,
        radius: number = 3,
    ) {
        const camera = new ArcRotateCamera(
            'V3DArcCamera' + manager.cameras.length,
            0, 0, radius, manager.rootMesh.position,
            this.scene, true);
        camera.lowerRadiusLimit = 0.1;
        camera.upperRadiusLimit = 20;
        camera.wheelDeltaPercentage = 0.05;
        camera.minZ = 0;
        camera.setPosition(new Vector3(0, 1.5, -5));
        camera.setTarget(manager.rootMesh.getAbsolutePosition());
        camera.attachControl(this.engine.getRenderingCanvas());

        manager.appendCamera(camera);

        this._cameraOnBeforeRenderFunc.push(() => {
            camera.setTarget(manager.rootMesh.getAbsolutePosition());
        });
    }

    /**
     *
     * Create a skybox for the scene.
     * @param size size of the skybox
     * @param textureName path to skybox texture
     */
    public createSkyBox(
        size: number,
        textureName?: string,
    ) {
        if (!this.skyBox) {
            this.skyBox = new v3DSkyBox(this.scene,
                textureName ? textureName : "texture/skybox", size);
        }
    }

    /**
     * Enable shadow caster for light.
     * @param light Light to enable shadows.
     */
    public enableShabows(light?: IShadowLight) {
        if (light) {
            if (!this._shadowGenerators.has(light)) {
                const shadowGenerator = new ShadowGenerator(1024, light);
                this.setupShadowGenerator(shadowGenerator);
                this._shadowGenerators.set(light, shadowGenerator);
            } else {
                console.warn("Light " + light.name + " already has a shadow generator!");
            }
        } else {
            for (const l of this.scene.lights) {
                if (isIShadowLight(l)) {
                    const shadowGenerator = new ShadowGenerator(1024, l);
                    this.setupShadowGenerator(shadowGenerator);
                    this._shadowGenerators.set(l, shadowGenerator);
                }
            }
        }
    }

    /**
     * Get corresponding shadow generator for light.
     * @param light Light to get shadow generator
     */
    public getShadownGenerator(light: IShadowLight): Nullable<ShadowGenerator> {
        return this._shadowGenerators.get(light);
    }

    /**
     * Convenience function for starting animation
     * @param target
     * @param name
     * @param property
     * @param duration
     * @param from
     * @param to
     * @param loopMode
     * @param easingFunction
     * @param easingMode
     */
    public startQuickAnimation(
        target: any,
        name: string,
        property: string,
        duration: number,
        from: any,
        to: any,
        loopMode?: number | undefined,
        easingFunction?: EasingFunction,
        easingMode?: number
    ): Animatable {
        const anim = this.createAnimation(
            target, name, property,
            [{frame: 0, value: from}, {frame: duration, value: to}],
            loopMode, easingFunction, easingMode
        );
        return this.scene.beginDirectAnimation(anim[0], [anim[1]], 0, duration,
            false);
    }

    /**
     * Convenience function for creating animation
     * @param target
     * @param name
     * @param property
     * @param keyFrames
     * @param loopMode
     * @param easingFunction
     * @param easingMode
     */
    public createAnimation(
        target: any,
        name: string,
        property: string,
        keyFrames: Array<IAnimationKey>,
        loopMode?: number | undefined,
        easingFunction?: EasingFunction,
        easingMode?: number,
    ): [any, Animation] {
        // Make sure keyFrames is not empty
        if (keyFrames.length < 1)
            throw Error("Key Frames empty");

        // Get data type
        const dataType = getAnimationDataType(keyFrames[0].value);
        if (dataType === null)
            throw Error("Cannot determine data type from keyframes!");

        const animation = new Animation(
            name, property, V3DCore.FRAMERATE,
            dataType, loopMode);
        animation.setKeys(keyFrames);

        if (easingFunction) {
            if (easingMode)
                easingFunction.setEasingMode(easingMode);
            animation.setEasingFunction(easingFunction);
        }

        return [target, animation];
    }

    public enableOptimizer(options?: SceneOptimizerOptions) {
        this._sceneOptimizer = new V3DSceneOptimizer(this.scene, options);
    }

    // Don't make wrappers static, so plugins will always be registered
    /**
     * Wrapper for SceneLoader.AppendAsync.
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     */
    public AppendAsync(
        rootUrl: string,
        sceneFilename?: string | File,
    ): Promise<Scene> {
        return SceneLoader.AppendAsync(rootUrl, sceneFilename, this.scene);
    }

    /**
     * Wrapper for SceneLoader.LoadAsync
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     */
    public LoadAsync(
        rootUrl: string,
        sceneFilename?: string | File,
    ): Promise<Scene> {
        return SceneLoader.LoadAsync(rootUrl, sceneFilename, this.engine);
    }

    // GLTFLoaderExtensionObserver
    public onLoadReady() {
        for (const f of this._onLoadCompleteCallbacks) {
            f();
        }
    }

    /**
     * Set up for time update.
     * @private
     */
    private setupObservable() {
        this.scene.onBeforeRenderObservable.add(
            (eventData: Scene, eventState: EventState) => {
                this._beforeRenderFunc(eventData, eventState);
            }
        );
        // Camera
        this.scene.onBeforeRenderObservable.add(
            () => {
                for (const f of this._cameraOnBeforeRenderFunc)
                    f();
            }
        )
        // Update secondary animation
        this.scene.onAfterRenderObservable.add(
            (eventData: Scene, eventState: EventState) => {
                this._afterRenderFunc(eventData, eventState);
            }
        );
    }

    private enableResize() {
        this.engine.getRenderingCanvas().onresize = () => {
            this.engine.resize();
        }
    }

    private setupShadowGenerator(shadowGenerator: any) {
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
    }

    private registerVrmExtension() {
        // ローダーに登録する
        GLTFLoader.RegisterExtension(VRMLoaderExtension.NAME, (loader) => {
            return new VRMLoaderExtension(loader, this);
        });
    }

    private registerVrmPlugin() {
        if (SceneLoader) {
            SceneLoader.RegisterPlugin(this._vrmFileLoader);
        }
    };

    private setupRenderingPipeline() {
        this._renderingPipeline.samples = 4;
        this._renderingPipeline.depthOfFieldEnabled = true;
        this._renderingPipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Medium;
        this._renderingPipeline.depthOfField.focusDistance  = 2000; // distance of the current focus point from the camera in millimeters considering 1 scene unit is 1 meter
        this._renderingPipeline.depthOfField.focalLength  = 10; // focal length of the camera in millimeters
        this._renderingPipeline.depthOfField.fStop  = 1.4; // aka F number of the camera defined in stops as it would be on a physical device
    }
}

export default V3DCore;
