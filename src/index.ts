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
import {EventState, IShadowLight, Light, ShadowGenerator } from "@babylonjs/core";
import {isIShadowLight} from "./utilities/types";
import {v3DSceneOptimizer} from "./scene/optimizer";
import {v3DSkyBox} from "./scene/skybox";


export class V3DCore implements GLTFLoaderExtensionObserver {

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

    private _managerRenderFunc:
        (eventData: Scene, eventState: EventState) => void = () => {
        for (const manager of this.loadedVRMManagers) {
            manager.update(this.engine.getDeltaTime());
        }
    };

    public updateManagerRenderFunction(
        func: (eventData: Scene, eventState: EventState) => void) {
        this._managerRenderFunc = func;
    }

    private _cameraOnBeforeRenderFunc: Function[] = [];
    private _sceneOptimizer;

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
    ) {
        // Register
        this.registerVrmPlugin();
        this.registerVrmExtension();

        if (!this.scene)
            this.scene = new Scene(this.engine);
        else
            this.engine = this.scene.getEngine();

        this.setupSecodaryAnimation();
        this.enableResize();
        this._sceneOptimizer = new v3DSceneOptimizer(this.scene);
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
        this.scene.clearColor = Color4.FromColor3(color, this.scene.clearColor.a);
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
    public addCamera(
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
        if (light && this._shadowGenerators.has(light)) {
            const shadowGenerator = new ShadowGenerator(1024, light);
            this._shadowGenerators.set(light, shadowGenerator);
        } else {
            for (const l of this.scene.lights) {
                if (isIShadowLight(l)) {
                    const shadowGenerator = new ShadowGenerator(1024, l);
                    this._shadowGenerators.set(l, shadowGenerator);
                }
            }
        }
    }

    /**
     * Get corresponding shadow generator for light.
     * @param light Light to get shadow generator
     */
    public getShadownGenerator(light: IShadowLight) {
        return this._shadowGenerators.get(light);
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
    private setupSecodaryAnimation() {
        // Update secondary animation
        this.scene.onBeforeRenderObservable.add(
            (eventData: Scene, eventState: EventState) => {
                this._managerRenderFunc(eventData, eventState);
            }
        );
        // Camera
        this.scene.onBeforeRenderObservable.add(
            () => {
                for (const f of this._cameraOnBeforeRenderFunc)
                    f();
            }
        )
    }

    private enableResize() {
        this.engine.getRenderingCanvas().onresize = () => {
            this.engine.resize();
        }
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
}

export default V3DCore;
