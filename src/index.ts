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


export class V3DCore implements GLTFLoaderExtensionObserver {

    /**
     * GLTFFileLoader plugin factory
     * @private
     */
    private _vrmFileLoader = new VRMFileLoader();

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

    /**
     * Loaded VRM Managers
     * @private
     */
    private _loadedVRMManagers: VRMManager[] = [];
    public addVRMManager(manager: VRMManager) {
        if (manager)
            this._loadedVRMManagers.push(manager);
    }

    /**
     * Get VRM Manager by index
     * @param idx
     */
    public getVRMManagerByIndex(idx: number) {
        return (idx >= 0 && idx < this._loadedVRMManagers.length)
            ? this._loadedVRMManagers[idx]
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
        for (const manager of this._loadedVRMManagers) {
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

    public addAmbientLight(color?: Color3) {
        const light = new HemisphericLight(
            "V3DHemiLight",
            new Vector3(0, 1, 1), this.scene);
        if (color)
            light.diffuse = color;
        light.setEnabled(true);
    }

    /**
     * Attach a following camera to VRM model.
     * TODO: there seems to be a bug when meshes are near the edge of camera cone
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
        this.scene.onBeforeRenderObservable.add(() => {
            for (const manager of this._loadedVRMManagers) {
                manager.update(this.engine.getDeltaTime());
            }
        });
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
