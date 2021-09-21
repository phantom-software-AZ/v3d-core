/** Copyright (c) 2021 The v3d Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Material, BackgroundMaterial, BaseTexture, Color3, CubeTexture, Mesh, Scene, Texture} from "@babylonjs/core";
import {SkyMaterial} from "@babylonjs/materials";


export class v3DSkyBox {

    private static _environmentTextureCDNUrl = "https://assets.babylonjs.com/environments/environmentSpecular.env";

    private readonly _skybox: Mesh;
    private readonly _skyboxBase: Mesh;
    get skybox(): Mesh {
        return this._skybox;
    }

    public skyboxMaterial: BackgroundMaterial;
    public skyboxBaseMaterial: SkyMaterial;
    public skyboxReflectionTexture: CubeTexture;

    public constructor(
        private readonly scene: Scene,
        private readonly textureName: string,
        public readonly boxSize: number,
        public readonly envTexture?: BaseTexture,
    ) {
        this._skybox = Mesh.CreateBox("Skybox", boxSize, this.scene, undefined, Mesh.BACKSIDE);
        this._skyboxBase = Mesh.CreateBox("SkyboxBase", boxSize+1, this.scene, undefined, Mesh.BACKSIDE);
        this.createMaterial(textureName);
        this._skybox.material = this.skyboxMaterial;
        this._skyboxBase.material = this.skyboxBaseMaterial;
        this._skybox.renderingGroupId = 0;
        this._skyboxBase.renderingGroupId = 0;
        this._skybox.material.transparencyMode = Material.MATERIAL_ALPHATESTANDBLEND;
        this._skybox.material.alpha = 0.5;
        this.setupImageProcessing();
    }

    /**
     * Setup the skybox material and the skybox reflection texture
     * @param textureName name (URI) to the texture files
     * @private
     */
    private createMaterial(textureName: string) {
        this.skyboxBaseMaterial = new SkyMaterial("SkyboxBaseMaterial", this.scene);
        this.skyboxMaterial = new BackgroundMaterial("SkyboxMaterial", this.scene);
        this.skyboxMaterial.backFaceCulling = false;
        this.skyboxMaterial.useRGBColor = false;
        this.skyboxMaterial.primaryColor = new Color3(1, 1, 1);
        this.skyboxMaterial.enableNoise = true;
        this.skyboxReflectionTexture = new CubeTexture(textureName, this.scene);
        this.skyboxReflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        this.skyboxReflectionTexture.gammaSpace = false;
        this.skyboxMaterial.reflectionTexture = this.skyboxReflectionTexture;
    }

    /**
     * Setup the image processing according to the specified options.
     */
    private setupImageProcessing(): void {
        this.scene.imageProcessingConfiguration.contrast = 1.2;
        this.scene.imageProcessingConfiguration.exposure = 0.8;
        this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this.scene.environmentTexture = this.envTexture ? this.envTexture
            : CubeTexture.CreateFromPrefilteredData(v3DSkyBox._environmentTextureCDNUrl, this.scene);
    }
}
