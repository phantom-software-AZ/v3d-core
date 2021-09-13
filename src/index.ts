import {Scene} from "@babylonjs/core/scene";
import {Engine} from "@babylonjs/core/Engines/engine";
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
import {VertexBuffer} from "@babylonjs/core/Buffers/buffer";
import {Mesh} from "@babylonjs/core/Meshes/mesh";



export class V3DCore {
    /**
     * Callbacks when loading is done
     */
    private _onLoadedCallbacks: Function[] = [];
    public addOnLoadedCallbacks(callback: Function): void {
        this._onLoadedCallbacks.push(callback);
    }

    set resetOnLoadedCallbacks(value: Function[]) {
        this._onLoadedCallbacks = [];
    }

    public constructor(
    ) {
    }


}
