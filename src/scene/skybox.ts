import {BackgroundMaterial, BaseTexture, Color3, CubeTexture, Mesh, ReflectionProbe, Scene, Texture} from "@babylonjs/core";


export class v3DSkyBox {

    private static _environmentTextureCDNUrl = "https://assets.babylonjs.com/environments/environmentSpecular.env";

    private readonly _skybox: Mesh;
    get skybox(): Mesh {
        return this._skybox;
    }
    public skyboxMaterial: BackgroundMaterial;
    public skyboxReflectionTexture: CubeTexture;

    public constructor(
        private readonly scene: Scene,
        private readonly textureName: string,
        public readonly boxSize: number,
        public readonly envTexture?: BaseTexture,
    ) {
        this._skybox = Mesh.CreateBox("BackgroundSkybox", boxSize, this.scene, undefined, Mesh.BACKSIDE);
        this.createMaterial(textureName);
        this._skybox.material = this.skyboxMaterial;
        this._skybox.renderingGroupId = 0;
        this.setupImageProcessing();
    }

    /**
     * Setup the skybox material and the skybox reflection texture
     * @param textureName name (URI) to the texture files
     * @private
     */
    private createMaterial(textureName: string) {
        this.skyboxMaterial = new BackgroundMaterial("BackgroundSkyboxMaterial", this.scene);
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
