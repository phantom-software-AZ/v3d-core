import {AbstractMesh, Mesh, ShadowGenerator, Skeleton, SkeletonViewer, TransformNode } from "@babylonjs/core";
import V3DCore from "./v3d-core";

export class V3DHelper {

    constructor(
        private readonly core: V3DCore
    ) {
    }

    /**
     * Make a node cast shadow from a ShadowGenerator
     * @param shadowGenerator
     * @param nodeName
     */
    public addNodeToShadowCasterByName(
        shadowGenerator: ShadowGenerator,
        nodeName: string
    ) {
        shadowGenerator.addShadowCaster(this.core.scene.getNodeByName(nodeName) as Mesh);
    }

    /**
     * Make nodes cast shadow from a ShadowGenerator
     * @param shadowGenerator
     * @param nodeName
     */
    public addNodeToShadowCasterContainsName(
        shadowGenerator: ShadowGenerator,
        nodeName: string
    ) {
        for (const node of this.core.scene.getNodes()) {
            if (node && node.name.includes(nodeName)) {
                shadowGenerator.addShadowCaster(node as Mesh);
            }
        }
    }

    /**
     * Make node receive shadow
     * @param nodeName
     */
    public makeReceiveShadowByName(nodeName: string) {
        (this.core.scene.getNodeByName(nodeName) as Mesh).receiveShadows = true;
    }

    /**
     * Make nodes receive shadow
     * @param nodeName
     */
    public makeReceiveShadowContainsName(nodeName: string) {
        for (const node of this.core.scene.getNodes()) {
            if (node && node.name.includes(nodeName)) {
                try {
                    (node as Mesh).receiveShadows = true;
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    public showSkeletonDebug(
        skeleton: Skeleton,
        mesh: AbstractMesh
    ) {
        const options = {
            pauseAnimations : true, //True or False flag to pause the animations while trying to construct the debugMesh. Default: True
            returnToRest : false, //Flag to force the skeleton back into its restPose before constructing the debugMesh. Default: False
            computeBonesUsingShaders : true, //Tell the debugMesh to use or not use the GPU for its calculations, if you ever want to do picking on the mesh this will need to be False. Default: True
            useAllBones : true, //Visualize all bones or skip the ones with no influence.
            displayMode : SkeletonViewer.DISPLAY_LINES, //A value that controls which display mode to use. (SkeletonViewer.DISPLAY_LINES = 0, SkeletonViewer.DISPLAY_SPHERES = 1, SkeletonViewer.DISPLAY_SPHERE_AND_SPURS = 2). Default = 0.
        };
        const skeletonViewer = new SkeletonViewer(
            skeleton, //Target Skeleton
            mesh, //That skeletons Attached Mesh or a Node with the same globalMatrix
            this.core.scene, //The Scene scope
            true, //autoUpdateBoneMatrices?
            mesh.renderingGroupId > 0 ? mesh.renderingGroupId + 1 : 1, // renderingGroupId
            options, //Configuration Options
        );

        return skeletonViewer;
    }
}
