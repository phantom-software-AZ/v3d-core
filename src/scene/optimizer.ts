import {HardwareScalingOptimization,
    LensFlaresOptimization,
    MergeMeshesOptimization, ParticlesOptimization,
    PostProcessesOptimization,
    RenderTargetsOptimization, Scene, SceneOptimizer, SceneOptimizerOptions, TextureOptimization } from "@babylonjs/core";


export class v3DSceneOptimizer {

    /**
     * Customized scene optimizer options.
     * @private
     */
    private _options: SceneOptimizerOptions;
    get options(): SceneOptimizerOptions{
        return this._options;
    }
    set options(value: SceneOptimizerOptions) {
        this._options = value;
    }

    /**
     * SceneOptimizer
     * @private
     */
    private readonly _optimizer: SceneOptimizer;
    get optimizer(): SceneOptimizer {
        return this._optimizer;
    }

    public constructor(
        private readonly scene: Scene,
    ) {
        this._options = v3DSceneOptimizer.CustomOptimizerOptions();
        this._optimizer = new SceneOptimizer(scene, this._options);
        this._optimizer.targetFrameRate = 60;
        this._optimizer.trackerDuration = 2000;

        this._optimizer.start();
        this.setupFocusEvents(this._optimizer);
    }

    private static CustomOptimizerOptions(): SceneOptimizerOptions {
        const options = new SceneOptimizerOptions();
        options.addOptimization(new MergeMeshesOptimization(0));
        options.addOptimization(new LensFlaresOptimization(0));
        options.addOptimization(new PostProcessesOptimization(1));
        options.addOptimization(new ParticlesOptimization(1));
        options.addOptimization(new TextureOptimization(2, 512));
        options.addOptimization(new RenderTargetsOptimization(3));
        options.addOptimization(new HardwareScalingOptimization(4, 2));

        return options;
    }

    private setupFocusEvents(optimizer: SceneOptimizer) {
        if (window) {
            console.log("setupFocusEvents");
            window.addEventListener('focusin',function(e){
                console.log("Optimizer start");
                optimizer.start();
            }, true);
            window.addEventListener('focusout',function(e){
                console.log("Optimizer stop");
                optimizer.stop();
                optimizer.reset();
            }, true);
        }
    }
}
