/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 677:
/***/ ((module) => {

module.exports = "// replace vBumpUV with mainUv\nvec2 uvOffset = vec2(0.0, 0.0);\n\n#if defined(BUMP) || defined(PARALLAX) || defined(DETAIL)\n    #ifdef NORMALXYSCALE\n        float normalScale = 1.0;\n    #elif defined(BUMP)\n        float normalScale = vBumpInfos.y;\n    #else\n        float normalScale = 1.0;\n    #endif\n\n    #if defined(TANGENT) && defined(NORMAL)\n        mat3 TBN = vTBN;\n    #elif defined(BUMP)\n        vec2 TBNUV=gl_FrontFacing ? mainUv : -mainUv;\n        mat3 TBN=cotangent_frame(normalW*normalScale,vPositionW,TBNUV,vTangentSpaceParams);\n    #else\n        vec2 TBNUV=gl_FrontFacing ? vDetailUV : -vDetailUV;\n        mat3 TBN=cotangent_frame(normalW*normalScale,vPositionW,TBNUV,vec2(1.,1.));\n    #endif\n#elif defined(ANISOTROPIC)\n    #if defined(TANGENT) && defined(NORMAL)\n        mat3 TBN = vTBN;\n    #else\n        vec2 TBNUV=gl_FrontFacing ? vMainUV1 : -vMainUV1;\n        mat3 TBN=cotangent_frame(normalW,vPositionW,TBNUV,vec2(1.,1.));\n    #endif\n#endif\n\n#ifdef PARALLAX\n    mat3 invTBN = transposeMat3(TBN);\n\n    #ifdef PARALLAXOCCLUSION\n        uvOffset = parallaxOcclusion(invTBN * -viewDirectionW, invTBN * normalW, mainUv, vBumpInfos.z);\n    #else\n        uvOffset = parallaxOffset(invTBN * viewDirectionW, vBumpInfos.z);\n    #endif\n#endif\n\n#ifdef DETAIL\n    vec4 detailColor = texture2D(detailSampler, vDetailUV + uvOffset);\n    vec2 detailNormalRG = detailColor.wy * 2.0 - 1.0;\n    float detailNormalB = sqrt(1. - saturate(dot(detailNormalRG, detailNormalRG)));\n    vec3 detailNormal = vec3(detailNormalRG, detailNormalB);\n#endif\n\n#ifdef BUMP\n    #ifdef OBJECTSPACE_NORMALMAP\n        normalW = normalize(texture2D(bumpSampler, mainUv).xyz  * 2.0 - 1.0);\n        normalW = normalize(mat3(normalMatrix) * normalW);\n    #elif !defined(DETAIL)\n        normalW = perturbNormal(TBN, texture2D(bumpSampler, mainUv + uvOffset).xyz, vBumpInfos.y);\n    #else\n        vec3 bumpNormal = texture2D(bumpSampler, mainUv + uvOffset).xyz * 2.0 - 1.0;\n        // Reference for normal blending: https://blog.selfshadow.com/publications/blending-in-detail/\n        #if DETAIL_NORMALBLENDMETHOD == 0 // whiteout\n            detailNormal.xy *= vDetailInfos.z;\n            vec3 blendedNormal = normalize(vec3(bumpNormal.xy + detailNormal.xy, bumpNormal.z * detailNormal.z));\n        #elif DETAIL_NORMALBLENDMETHOD == 1 // RNM\n            detailNormal.xy *= vDetailInfos.z;\n            bumpNormal += vec3(0.0, 0.0, 1.0);\n            detailNormal *= vec3(-1.0, -1.0, 1.0);\n            vec3 blendedNormal = bumpNormal * dot(bumpNormal, detailNormal) / bumpNormal.z - detailNormal;\n        #endif\n        normalW = perturbNormalBase(TBN, blendedNormal, vBumpInfos.y);\n    #endif\n#elif defined(DETAIL)\n        detailNormal.xy *= vDetailInfos.z;\n        normalW = perturbNormalBase(TBN, detailNormal, vDetailInfos.z);\n#endif\n";

/***/ }),

/***/ 477:
/***/ ((module) => {

module.exports = "uniform vec4 vEyePosition;\nuniform mat4 viewProjection;\nuniform mat4 view;\n\n// Colors\nuniform vec4 vDiffuseColor;\n#ifdef SPECULARTERM\nuniform vec4 vSpecularColor;\n#endif\nuniform vec3 vEmissiveColor;\nuniform vec3 vAmbientColor;\nuniform vec3 vShadeColor;\nuniform vec3 vRimColor;\nuniform vec4 vOutlineColor;\n\n// Samplers\n#ifdef DIFFUSE\nuniform vec2 vDiffuseInfos;\n#endif\n#ifdef AMBIENT\nuniform vec2 vAmbientInfos;\n#endif\n#ifdef EMISSIVE\nuniform vec2 vEmissiveInfos;\n#endif\n#ifdef BUMP\nuniform vec3 vBumpInfos;\nuniform vec2 vTangentSpaceParams;\n#endif\n#ifdef SHADE\nuniform vec2 vShadeInfos;\n#endif\n#ifdef RECEIVE_SHADOW\nuniform vec2 vReceiveShadowInfos;\n#endif\n#ifdef SHADING_GRADE\nuniform vec2 vShadingGradeInfos;\n#endif\n#ifdef RIM\nuniform vec2 vRimInfos;\n#endif\n#ifdef MATCAP\nuniform vec2 vMatCapInfos;\n#endif\n#ifdef OUTLINE_WIDTH\nuniform vec2 vOutlineWidthInfos;\n#endif\n#ifdef UV_ANIMATION_MASK\nuniform vec2 vUvAnimationMaskInfos;\n#endif\n#ifdef ALPHATEST\nuniform float alphaCutOff;\n#endif\n#if defined(SPECULAR) && defined(SPECULARTERM)\nuniform vec2 vSpecularInfos;\n#endif\n\n// MToon params\nuniform float shadingGradeRate;\nuniform float receiveShadowRate;\nuniform float shadeShift;\nuniform float shadeToony;\nuniform float lightColorAttenuation;\nuniform float indirectLightIntensity;\nuniform float rimLightingMix;\nuniform float rimFresnelPower;\nuniform float rimLift;\nuniform float outlineWidth;\nuniform float outlineScaledMaxDistance;\nuniform float outlineLightingMix;\nuniform float uvAnimationScrollX;\nuniform float uvAnimationScrollY;\nuniform float uvAnimationRotation;\n";

/***/ }),

/***/ 649:
/***/ ((module) => {

module.exports = "#ifdef LIGHT{X}\n/**\n    #if defined(SHADOWONLY) || defined(LIGHTMAP) && defined(LIGHTMAPEXCLUDED{X}) && defined(LIGHTMAPNOSPECULAR{X})\n\n    #else\n        #ifdef PBR\n\n            #ifdef SPOTLIGHT{X}\n                preInfo=computePointAndSpotPreLightingInfo(light{X}.vLightData,viewDirectionW,normalW);\n            #elif defined(POINTLIGHT{X})\n                preInfo=computePointAndSpotPreLightingInfo(light{X}.vLightData,viewDirectionW,normalW);\n            #elif defined(HEMILIGHT{X})\n                preInfo=computeHemisphericPreLightingInfo(light{X}.vLightData,viewDirectionW,normalW);\n            #elif defined(DIRLIGHT{X})\n                preInfo=computeDirectionalPreLightingInfo(light{X}.vLightData,viewDirectionW,normalW);\n            #endif\n            preInfo.NdotV=NdotV;\n\n            #ifdef SPOTLIGHT{X}\n                #ifdef LIGHT_FALLOFF_GLTF{X}\n                    preInfo.attenuation=computeDistanceLightFalloff_GLTF(preInfo.lightDistanceSquared,light{X}.vLightFalloff.y);\n                    preInfo.attenuation*=computeDirectionalLightFalloff_GLTF(light{X}.vLightDirection.xyz,preInfo.L,light{X}.vLightFalloff.z,light{X}.vLightFalloff.w);\n                #elif defined(LIGHT_FALLOFF_PHYSICAL{X})\n                    preInfo.attenuation=computeDistanceLightFalloff_Physical(preInfo.lightDistanceSquared);\n                    preInfo.attenuation*=computeDirectionalLightFalloff_Physical(light{X}.vLightDirection.xyz,preInfo.L,light{X}.vLightDirection.w);\n                #elif defined(LIGHT_FALLOFF_STANDARD{X})\n                    preInfo.attenuation=computeDistanceLightFalloff_Standard(preInfo.lightOffset,light{X}.vLightFalloff.x);\n                    preInfo.attenuation*=computeDirectionalLightFalloff_Standard(light{X}.vLightDirection.xyz,preInfo.L,light{X}.vLightDirection.w,light{X}.vLightData.w);\n                #else\n                    preInfo.attenuation=computeDistanceLightFalloff(preInfo.lightOffset,preInfo.lightDistanceSquared,light{X}.vLightFalloff.x,light{X}.vLightFalloff.y);\n                    preInfo.attenuation*=computeDirectionalLightFalloff(light{X}.vLightDirection.xyz,preInfo.L,light{X}.vLightDirection.w,light{X}.vLightData.w,light{X}.vLightFalloff.z,light{X}.vLightFalloff.w);\n                #endif\n            #elif defined(POINTLIGHT{X})\n                #ifdef LIGHT_FALLOFF_GLTF{X}\n                    preInfo.attenuation=computeDistanceLightFalloff_GLTF(preInfo.lightDistanceSquared,light{X}.vLightFalloff.y);\n                #elif defined(LIGHT_FALLOFF_PHYSICAL{X})\n                    preInfo.attenuation=computeDistanceLightFalloff_Physical(preInfo.lightDistanceSquared);\n                #elif defined(LIGHT_FALLOFF_STANDARD{X})\n                    preInfo.attenuation=computeDistanceLightFalloff_Standard(preInfo.lightOffset,light{X}.vLightFalloff.x);\n                #else\n                    preInfo.attenuation=computeDistanceLightFalloff(preInfo.lightOffset,preInfo.lightDistanceSquared,light{X}.vLightFalloff.x,light{X}.vLightFalloff.y);\n                #endif\n            #else\n                preInfo.attenuation=1.0;\n            #endif\n\n\n            #ifdef HEMILIGHT{X}\n                preInfo.roughness=roughness;\n            #else\n                preInfo.roughness=adjustRoughnessFromLightProperties(roughness,light{X}.vLightSpecular.a,preInfo.lightDistance);\n            #endif\n\n            #ifdef HEMILIGHT{X}\n                info.diffuse=computeHemisphericDiffuseLighting(preInfo,light{X}.vLightDiffuse.rgb,light{X}.vLightGround);\n            #elif defined(SS_TRANSLUCENCY)\n                info.diffuse=computeDiffuseAndTransmittedLighting(preInfo,light{X}.vLightDiffuse.rgb,subSurfaceOut.transmittance);\n            #else\n               info.diffuse=computeDiffuseLighting(preInfo,light{X}.vLightDiffuse.rgb);\n            #endif\n\n            #ifdef SPECULARTERM\n                #ifdef ANISOTROPIC\n                   info.specular=computeAnisotropicSpecularLighting(preInfo,viewDirectionW,normalW,anisotropicOut.anisotropicTangent,anisotropicOut.anisotropicBitangent,anisotropicOut.anisotropy,clearcoatOut.specularEnvironmentR0,specularEnvironmentR90,AARoughnessFactors.x,light{X}.vLightDiffuse.rgb);\n                #else\n                   info.specular=computeSpecularLighting(preInfo,normalW,clearcoatOut.specularEnvironmentR0,specularEnvironmentR90,AARoughnessFactors.x,light{X}.vLightDiffuse.rgb);\n                #endif\n            #endif\n\n            #ifdef SHEEN\n                #ifdef SHEEN_LINKWITHALBEDO\n\n                   preInfo.roughness=sheenOut.sheenIntensity;\n                #else\n                    #ifdef HEMILIGHT{X}\n                      preInfo.roughness=sheenOut.sheenRoughness;\n                    #else\n                      preInfo.roughness=adjustRoughnessFromLightProperties(sheenOut.sheenRoughness,light{X}.vLightSpecular.a,preInfo.lightDistance);\n                    #endif\n                #endif\n                info.sheen=computeSheenLighting(preInfo,normalW,sheenOut.sheenColor,specularEnvironmentR90,AARoughnessFactors.x,light{X}.vLightDiffuse.rgb);\n            #endif\n\n            #ifdef CLEARCOAT\n\n                #ifdef HEMILIGHT{X}\n                  preInfo.roughness=clearcoatOut.clearCoatRoughness;\n                #else\n                  preInfo.roughness=adjustRoughnessFromLightProperties(clearcoatOut.clearCoatRoughness,light{X}.vLightSpecular.a,preInfo.lightDistance);\n                #endif\n                info.clearCoat=computeClearCoatLighting(preInfo,clearcoatOut.clearCoatNormalW,clearcoatOut.clearCoatAARoughnessFactors.x,clearcoatOut.clearCoatIntensity,light{X}.vLightDiffuse.rgb);\n                #ifdef CLEARCOAT_TINT\n\n                    absorption=computeClearCoatLightingAbsorption(clearcoatOut.clearCoatNdotVRefract,preInfo.L,clearcoatOut.clearCoatNormalW,clearcoatOut.clearCoatColor,clearcoatOut.clearCoatThickness,clearcoatOut.clearCoatIntensity);\n                    info.diffuse*=absorption;\n                    #ifdef SPECULARTERM\n                        info.specular*=absorption;\n                    #endif\n                #endif\n\n                info.diffuse*=info.clearCoat.w;\n                #ifdef SPECULARTERM\n                    info.specular*=info.clearCoat.w;\n                #endif\n                #ifdef SHEEN\n                    info.sheen*=info.clearCoat.w;\n                #endif\n            #endif\n        #else\n            #ifdef SPOTLIGHT{X}\n                info=computeSpotLighting(viewDirectionW,normalW,light{X}.vLightData,light{X}.vLightDirection,light{X}.vLightDiffuse.rgb,light{X}.vLightSpecular.rgb,light{X}.vLightDiffuse.a,glossiness);\n            #elif defined(HEMILIGHT{X})\n                info=computeHemisphericLighting(viewDirectionW,normalW,light{X}.vLightData,light{X}.vLightDiffuse.rgb,light{X}.vLightSpecular.rgb,light{X}.vLightGround,glossiness);\n            #elif defined(POINTLIGHT{X}) || defined(DIRLIGHT{X})\n                info=computeLighting(viewDirectionW,normalW,light{X}.vLightData,light{X}.vLightDiffuse.rgb,light{X}.vLightSpecular.rgb,light{X}.vLightDiffuse.a,glossiness);\n            #endif\n        #endif\n        #ifdef PROJECTEDLIGHTTEXTURE{X}\n            info.diffuse*=computeProjectionTextureDiffuseLighting(projectionLightSampler{X},textureProjectionMatrix{X});\n        #endif\n    #endif\n*/\n    #ifdef SHADOW{X}\n        #ifdef SHADOWCSM{X}\n            for (int i=0; i<SHADOWCSMNUM_CASCADES{X}; i++)\n            {\n                #ifdef SHADOWCSM_RIGHTHANDED{X}\n                    diff{X}=viewFrustumZ{X}[i]+vPositionFromCamera{X}.z;\n                #else\n                    diff{X}=viewFrustumZ{X}[i]-vPositionFromCamera{X}.z;\n                #endif\n                if (diff{X}>=0.) {\n                    index{X}=i;\n                    break;\n                }\n            }\n            #ifdef SHADOWCSMUSESHADOWMAXZ{X}\n            if (index{X}>=0)\n            #endif\n            {\n            #if defined(SHADOWPCF{X})\n                #if defined(SHADOWLOWQUALITY{X})\n                    shadow=computeShadowWithCSMPCF1(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                #elif defined(SHADOWMEDIUMQUALITY{X})\n                    shadow=computeShadowWithCSMPCF3(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.yz,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                #else\n                    shadow=computeShadowWithCSMPCF5(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.yz,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                #endif\n            #elif defined(SHADOWPCSS{X})\n                #if defined(SHADOWLOWQUALITY{X})\n                    shadow=computeShadowWithCSMPCSS16(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],depthSampler{X},shadowSampler{X},light{X}.shadowsInfo.y,light{X}.shadowsInfo.z,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w,lightSizeUVCorrection{X}[index{X}],depthCorrection{X}[index{X}],penumbraDarkness{X});\n                #elif defined(SHADOWMEDIUMQUALITY{X})\n                    shadow=computeShadowWithCSMPCSS32(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],depthSampler{X},shadowSampler{X},light{X}.shadowsInfo.y,light{X}.shadowsInfo.z,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w,lightSizeUVCorrection{X}[index{X}],depthCorrection{X}[index{X}],penumbraDarkness{X});\n                #else\n                    shadow=computeShadowWithCSMPCSS64(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],depthSampler{X},shadowSampler{X},light{X}.shadowsInfo.y,light{X}.shadowsInfo.z,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w,lightSizeUVCorrection{X}[index{X}],depthCorrection{X}[index{X}],penumbraDarkness{X});\n                #endif\n            #else\n                shadow=computeShadowCSM(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n            #endif\n            #ifdef SHADOWCSMDEBUG{X}\n                shadowDebug{X}=vec3(shadow)*vCascadeColorsMultiplier{X}[index{X}];\n            #endif\n            #ifndef SHADOWCSMNOBLEND{X}\n                float frustumLength=frustumLengths{X}[index{X}];\n                float diffRatio=clamp(diff{X}/frustumLength,0.,1.)*cascadeBlendFactor{X};\n                if (index{X}<(SHADOWCSMNUM_CASCADES{X}-1) && diffRatio<1.)\n                {\n                    index{X}+=1;\n                    float nextShadow=0.;\n                    #if defined(SHADOWPCF{X})\n                        #if defined(SHADOWLOWQUALITY{X})\n                            nextShadow=computeShadowWithCSMPCF1(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                        #elif defined(SHADOWMEDIUMQUALITY{X})\n                            nextShadow=computeShadowWithCSMPCF3(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.yz,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                        #else\n                            nextShadow=computeShadowWithCSMPCF5(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.yz,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                        #endif\n                    #elif defined(SHADOWPCSS{X})\n                        #if defined(SHADOWLOWQUALITY{X})\n                            nextShadow=computeShadowWithCSMPCSS16(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],depthSampler{X},shadowSampler{X},light{X}.shadowsInfo.y,light{X}.shadowsInfo.z,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w,lightSizeUVCorrection{X}[index{X}],depthCorrection{X}[index{X}],penumbraDarkness{X});\n                        #elif defined(SHADOWMEDIUMQUALITY{X})\n                            nextShadow=computeShadowWithCSMPCSS32(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],depthSampler{X},shadowSampler{X},light{X}.shadowsInfo.y,light{X}.shadowsInfo.z,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w,lightSizeUVCorrection{X}[index{X}],depthCorrection{X}[index{X}],penumbraDarkness{X});\n                        #else\n                            nextShadow=computeShadowWithCSMPCSS64(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],depthSampler{X},shadowSampler{X},light{X}.shadowsInfo.y,light{X}.shadowsInfo.z,light{X}.shadowsInfo.x,light{X}.shadowsInfo.w,lightSizeUVCorrection{X}[index{X}],depthCorrection{X}[index{X}],penumbraDarkness{X});\n                        #endif\n                    #else\n                        nextShadow=computeShadowCSM(float(index{X}),vPositionFromLight{X}[index{X}],vDepthMetric{X}[index{X}],shadowSampler{X},light{X}.shadowsInfo.x,light{X}.shadowsInfo.w);\n                    #endif\n                    shadow=mix(nextShadow,shadow,diffRatio);\n                    #ifdef SHADOWCSMDEBUG{X}\n                        shadowDebug{X}=mix(vec3(nextShadow)*vCascadeColorsMultiplier{X}[index{X}],shadowDebug{X},diffRatio);\n                    #endif\n                }\n            #endif\n            }\n        #elif defined(SHADOWCLOSEESM{X})\n            #if defined(SHADOWCUBE{X})\n                shadow = computeShadowWithCloseESMCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.depthValues);\n            #else\n                shadow = computeShadowWithCloseESM(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.shadowsInfo.w);\n            #endif\n        #elif defined(SHADOWESM{X})\n            #if defined(SHADOWCUBE{X})\n                shadow = computeShadowWithESMCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.depthValues);\n            #else\n                shadow = computeShadowWithESM(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.shadowsInfo.w);\n            #endif\n        #elif defined(SHADOWPOISSON{X})\n            #if defined(SHADOWCUBE{X})\n                shadow = computeShadowWithPoissonSamplingCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.x, light{X}.depthValues);\n            #else\n                shadow = computeShadowWithPoissonSampling(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #endif\n        #elif defined(SHADOWPCF{X})\n            #if defined(SHADOWLOWQUALITY{X})\n                shadow = computeShadowWithPCF1(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #elif defined(SHADOWMEDIUMQUALITY{X})\n                shadow = computeShadowWithPCF3(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #else\n                shadow = computeShadowWithPCF5(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #endif\n        #elif defined(SHADOWPCSS{X})\n            #if defined(SHADOWLOWQUALITY{X})\n                shadow = computeShadowWithPCSS16(vPositionFromLight{X}, vDepthMetric{X}, depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #elif defined(SHADOWMEDIUMQUALITY{X})\n                shadow = computeShadowWithPCSS32(vPositionFromLight{X}, vDepthMetric{X}, depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #else\n                shadow = computeShadowWithPCSS64(vPositionFromLight{X}, vDepthMetric{X}, depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #endif\n        #else\n            #if defined(SHADOWCUBE{X})\n                shadow = computeShadowCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.depthValues);\n            #else\n                shadow = computeShadow(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\n            #endif\n        #endif\n        #ifdef SHADOWONLY\n            #ifndef SHADOWINUSE\n                #define SHADOWINUSE\n            #endif\n            globalShadow+=shadow;\n            shadowLightCount+=1.0;\n        #endif\n    #else\n        shadow = 1.;\n    #endif\n/**\n    #ifndef SHADOWONLY\n        #ifdef CUSTOMUSERLIGHTING\n            diffuseBase+=computeCustomDiffuseLighting(info,diffuseBase,shadow);\n            #ifdef SPECULARTERM\n                specularBase+=computeCustomSpecularLighting(info,specularBase,shadow);\n            #endif\n        #elif defined(LIGHTMAP) && defined(LIGHTMAPEXCLUDED{X})\n            diffuseBase+=lightmapColor.rgb*shadow;\n            #ifdef SPECULARTERM\n                #ifndef LIGHTMAPNOSPECULAR{X}\n                    specularBase+=info.specular*shadow*lightmapColor.rgb;\n                #endif\n            #endif\n            #ifdef CLEARCOAT\n                #ifndef LIGHTMAPNOSPECULAR{X}\n                    clearCoatBase+=info.clearCoat.rgb*shadow*lightmapColor.rgb;\n                #endif\n            #endif\n            #ifdef SHEEN\n                #ifndef LIGHTMAPNOSPECULAR{X}\n                    sheenBase+=info.sheen.rgb*shadow;\n                #endif\n            #endif\n        #else\n            #ifdef SHADOWCSMDEBUG{X}\n                diffuseBase+=info.diffuse*shadowDebug{X};\n            #else\n                diffuseBase+=info.diffuse*shadow;\n            #endif\n            #ifdef SPECULARTERM\n                specularBase+=info.specular*shadow;\n            #endif\n            #ifdef CLEARCOAT\n                clearCoatBase+=info.clearCoat.rgb*shadow;\n            #endif\n            #ifdef SHEEN\n                sheenBase+=info.sheen.rgb*shadow;\n            #endif\n        #endif\n    #endif\n*/\n\n    // ここで MToon のライティングを適用\n    #ifdef SPOTLIGHT{X}\n        lightDirection = computeSpotLightDirection(light{X}.vLightData);\n    #elif defined(HEMILIGHT{X})\n        lightDirection = computeHemisphericLightDirection(light{X}.vLightData, normalW.xyz);\n    #elif defined(POINTLIGHT{X}) || defined(DIRLIGHT{X})\n        lightDirection = computeLightDirection(light{X}.vLightData);\n    #endif\n    mtoonDiffuse = computeMToonDiffuseLighting(viewDirectionW.xyz, normalW.xyz, mainUv, lightDirection, light{X}.vLightDiffuse.rgba, shadow);\n    diffuseBase += mtoonDiffuse.rgb;\n    alpha = min(alpha, mtoonDiffuse.a);\n    #if defined(ALPHATEST) && ALPHATEST\n        alpha = (alpha - alphaCutOff) / max(fwidth(alpha), EPS_COL) + 0.5; // Alpha to Coverage\n        if (alpha < alphaCutOff) {\n            discard;\n        }\n        alpha = 1.0; // Discarded, otherwise it should be assumed to have full opacity\n    #else\n        if (alpha - 0.0001 < 0.000) { // Slightly improves rendering with layered transparency\n            discard;\n        }\n    #endif\n#endif\n";

/***/ }),

/***/ 483:
/***/ ((module) => {

module.exports = "#include<__decl__mtoonFragment>\n\n#if defined(BUMP) || !defined(NORMAL) || (defined(ALPHATEST) && ALPHATEST)\n#extension GL_OES_standard_derivatives : enable\n#endif\n\n#define CUSTOM_FRAGMENT_BEGIN\n#ifdef LOGARITHMICDEPTH\n#extension GL_EXT_frag_depth : enable\n#endif\n\n// Constants\n#define RECIPROCAL_PI2 0.15915494\n#define PI_2 6.28318530718\n#define EPS_COL 0.00001\n\n//uniform vec3 vEyePosition;\n//uniform vec3 vAmbientColor;\n//#ifdef ALPHATEST\n//uniform float alphaCutOff;\n//#endif\nuniform vec3 vEyeUp;\nuniform float aspect;\nuniform float isOutline;\nuniform vec4 time;\n\n// Input\nvarying vec3 vPositionW;\n\n#ifdef NORMAL\n    varying vec3 vNormalW;\n#endif\n#ifdef VERTEXCOLOR\n    varying vec4 vColor;\n#endif\n#include<mainUVVaryingDeclaration>[1..7]\n\n// Helper functions\n#include<helperFunctions>\n\n// Lights\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n\n#include<lightsFragmentFunctions>\n#include<shadowsFragmentFunctions>\n\n// Samplers\n#include<samplerFragmentDeclaration>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse,_SAMPLERNAME_,diffuse)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient,_SAMPLERNAME_,ambient)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive,_SAMPLERNAME_,emissive)\n#if defined(SPECULARTERM)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular,_SAMPLERNAME_,specular)\n#endif\n#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADE,_VARYINGNAME_,Shade,_SAMPLERNAME_,shade)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,RECEIVE_SHADOW,_VARYINGNAME_,ReceiveShadow,_SAMPLERNAME_,receiveShadow)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADING_GRADE,_VARYINGNAME_,ShadingGrade,_SAMPLERNAME_,shadingGrade)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,RIM,_VARYINGNAME_,Rim,_SAMPLERNAME_,rim)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap,_SAMPLERNAME_,matCap)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,OUTLINE_WIDTH,_VARYINGNAME_,OutlineWidth,_SAMPLERNAME_,outlineWidth)\n#include<samplerFragmentDeclaration>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask,_SAMPLERNAME_,uvAnimationMask)\n\n/**\n* DirectionalLight, PointLight の角度を計算\n*/\nvec3 computeLightDirection(vec4 lightData) {\n      return normalize(mix(lightData.xyz - vPositionW, -lightData.xyz, lightData.w));\n}\n\n/**\n* SpotLight の角度を計算\n*/\nvec3 computeSpotLightDirection(vec4 lightData) {\n     return normalize(lightData.xyz - vPositionW);\n}\n\n/**\n* HemisphericLight の角度を計算\n*/\nvec3 computeHemisphericLightDirection(vec4 lightData, vec3 vNormal) {\n     return normalize(lightData.xyz);\n}\n\n/**\n* MToon シェーダーの陰実装\n*/\nvec4 computeMToonDiffuseLighting(vec3 worldView, vec3 worldNormal, vec2 mainUv, vec3 lightDirection, vec4 lightDiffuse, float shadowAttenuation) {\n    float _receiveShadow = receiveShadowRate;\n#ifdef RECEIVE_SHADOW\n    _receiveShadow = _receiveShadow * texture2D(receiveShadowSampler, mainUv).r * vReceiveShadowInfos.y;\n#endif\n\n    float _shadingGrade = 0.0;\n#ifdef SHADING_GRADE\n    _shadingGrade = 1.0 - texture2D(shadingGradeSampler, mainUv).r * vShadingGradeInfos.y;\n#endif\n    _shadingGrade = 1.0 - shadingGradeRate * _shadingGrade;\n\n    // Lighting\n    vec3 _lightColor = lightDiffuse.rgb * step(0.5, length(lightDirection)); // length(lightDir) is zero if directional light is disabled.\n    float _dotNL = dot(lightDirection, worldNormal);\n#ifdef MTOON_FORWARD_ADD\n    float _lightAttenuation = 1.0;\n#else\n    float _lightAttenuation = shadowAttenuation * mix(1.0, shadowAttenuation, _receiveShadow);\n#endif\n\n    // lighting intensity\n    float _lightIntensity = _dotNL;\n    _lightIntensity = _lightIntensity * 0.5 + 0.5; // from [-1, +1] to [0, 1]\n    _lightIntensity = _lightIntensity * _lightAttenuation; // receive shadow\n    _lightIntensity = _lightIntensity * _shadingGrade; // darker\n    _lightIntensity = _lightIntensity * 2.0 - 1.0; // from [0, 1] to [-1, +1]\n    // tooned. mapping from [minIntensityThreshold, maxIntensityThreshold] to [0, 1]\n    float _maxIntensityThreshold = mix(1.0, shadeShift, shadeToony);\n    float _minIntensityThreshold = shadeShift;\n    _lightIntensity = clamp((_lightIntensity - _minIntensityThreshold) / max(EPS_COL, (_maxIntensityThreshold - _minIntensityThreshold)), 0.0, 1.0);\n\n    // Albedo color\n    vec3 _shade = vShadeColor;\n#ifdef SHADE\n    _shade = _shade * texture2D(shadeSampler, mainUv).rgb * vShadeInfos.y;\n#endif\n\n    vec4 _lit = vDiffuseColor;\n#ifdef DIFFUSE\n    _lit = _lit * texture2D(diffuseSampler, mainUv) * vDiffuseInfos.y;\n#endif\n    vec3 _col = mix(_shade.rgb, _lit.rgb, _lightIntensity);\n\n    // Direct Light\n    vec3 _lighting = _lightColor;\n    _lighting = mix(_lighting, vec3(max(EPS_COL, max(_lighting.x, max(_lighting.y, _lighting.z)))), lightColorAttenuation); // color atten\n#ifdef MTOON_FORWARD_ADD\n    _lighting *= 0.5; // darken if additional light\n    _lighting *= min(0, dotNL) + 1.0; // darken dotNL < 0 area by using half lambert\n    _lighting *= shadowAttenuation; // darken if receiving shadow\n#else\n    // base light does not darken.\n#endif\n    _col *= _lighting;\n\n    // Indirect Light\n#ifdef MTOON_FORWARD_ADD\n#else\n    vec3 _toonedGI = vAmbientColor.rgb; // TODO: GI\n    vec3 _indirectLighting = mix(_toonedGI, vAmbientColor.rgb, indirectLightIntensity);\n    _indirectLighting = mix(_indirectLighting, vec3(max(EPS_COL, max(_indirectLighting.x, max(_indirectLighting.y, _indirectLighting.z)))), lightColorAttenuation); // color atten\n    _col += _indirectLighting * _lit.rgb;\n\n    _col = min(_col.rgb, _lit.rgb); // comment out if you want to PBR absolutely.\n#endif\n\n    // parametric rim lighting\n#ifdef MTOON_FORWARD_ADD\n    vec3 _staticRimLighting = vec3(0.0);\n    vec3 _mixedRimLighting = _lighting;\n#else\n    vec3 _staticRimLighting = vec3(1.0);\n    vec3 _mixedRimLighting = _lighting + _indirectLighting;\n#endif\n    vec3 _rimLighting = mix(_staticRimLighting, _mixedRimLighting, rimLightingMix);\n    vec3 _rimColor = vRimColor.rgb;\n#ifdef RIM\n    _rimColor = _rimColor * texture2D(rimSampler, vRimUV + mainUv).rgb * vRimInfos.y;\n#endif\n    vec3 _rim = pow(clamp(1.0 - dot(worldNormal, worldView) + rimLift, 0.0, 1.0), rimFresnelPower) * _rimColor.rgb;\n    _col += mix(_rim * _rimLighting, vec3(0.0), isOutline);\n\n    // additive matcap\n#ifdef MTOON_FORWARD_ADD\n#else\n#ifdef MATCAP\n    vec3 _worldViewUp = normalize(vEyeUp - worldView * dot(worldView, vEyeUp));\n    vec3 _worldViewRight = normalize(cross(worldView, _worldViewUp));\n    vec2 _matCapUv = vec2(dot(_worldViewRight, worldNormal), dot(_worldViewUp, worldNormal)) * 0.5 + 0.5;\n    // uv.y is reversed\n    _matCapUv.y = (1.0 - _matCapUv.y);\n    vec3 _matCapLighting = texture2D(matCapSampler, _matCapUv).rgb * vMatCapInfos.y;\n    _col += mix(_matCapLighting, vec3(0.0), isOutline);\n#endif\n#endif\n\n    // Emission\n#ifdef MTOON_FORWARD_ADD\n#else\n    vec3 _emission = vEmissiveColor.rgb;\n#ifdef EMISSIVE\n     _emission *= texture2D(emissiveSampler, mainUv).rgb * vEmissiveInfos.y;\n#endif\n     _col += mix(_emission, vec3(0.0), isOutline);\n#endif\n\n    float _alpha = 1.0;\n\n#if defined(ALPHABLEND) || defined(ALPHATEST)\n    _alpha = mix(_lit.a, _lit.a * vOutlineColor.a, isOutline);\n#endif\n\n    // outline\n#ifdef MTOON_OUTLINE_COLOR_FIXED\n    _col = mix(_col, vOutlineColor.rgb, isOutline);\n#elif defined(MTOON_OUTLINE_COLOR_MIXED)\n    _col = mix(_col, vOutlineColor.rgb * mix(vec3(1.0), _col, outlineLightingMix), isOutline);\n#else\n#endif\n\n// debug\n#ifdef MTOON_DEBUG_NORMAL\n    #ifdef MTOON_FORWARD_ADD\n        return vec4(0.0);\n    #else\n        return vec4(worldNormal * 0.5 + 0.5, _lit.a);\n    #endif\n#elif defined(MTOON_DEBUG_LITSHADERATE)\n    #ifdef MTOON_FORWARD_ADD\n        return vec4(0.0);\n    #else\n        return vec4(_lightIntensity, _lit.a);\n    #endif\n#endif\n\n    return vec4(_col, _alpha);\n}\n\n#include<bumpFragmentMainFunctions>\n#include<bumpFragmentFunctions>\n#include<clipPlaneFragmentDeclaration>\n#include<logDepthDeclaration>\n#include<fogFragmentDeclaration>\n\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n    #define CUSTOM_FRAGMENT_MAIN_BEGIN\n    #ifdef MTOON_CLIP_IF_OUTLINE_IS_NONE\n        #ifdef MTOON_OUTLINE_WIDTH_WORLD\n        #elif defined(MTOON_OUTLINE_WIDTH_SCREEN)\n        #else\n            discard;\n        #endif\n    #endif\n\n    #include<clipPlaneFragment>\n    vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);\n\n    // Base color\n    // Strangely MToon decided to use base diffuse color as light color\n    vec4 baseColor = vec4(1., 1., 1., 1.);\n    vec3 diffuseColor = vec3(1., 1., 1.);\n//    vec3 diffuseColor=vDiffuseColor.rgb;\n\n    // Alpha\n    float alpha = 1.0;\n//    float alpha = vDiffuseColor.a;\n\n// Bump\n#ifdef NORMAL\n     vec3 normalW = normalize(vNormalW);\n#else\n     vec3 normalW = normalize(-cross(dFdx(vPositionW), dFdy(vPositionW)));\n#endif\n\n\n// MToon UV\n// 全てのテクスチャは diffuse(_MainTex) の UV 情報を利用する\nvec2 mainUv = vec2(0.0);\n#ifdef DIFFUSE\n    mainUv += vDiffuseUV;\n#elif defined(MAINUV1)\n    mainUv += vMainUV1;\n#elif defined(MAINUV2)\n    mainUv += vMainUV2;\n#elif defined(MAINUV3)\n    mainUv += vMainUV3;\n#elif defined(MAINUV4)\n    mainUv += vMainUV4;\n#elif defined(MAINUV5)\n    mainUv += vMainUV5;\n#elif defined(MAINUV6)\n    mainUv += vMainUV6;\n#endif\n\n// UV animation\nfloat uvAnim = time.y;\n#ifdef UV_ANIMATION_MASK\nuvAnim *= texture2D(uvAnimationMaskSampler, mainUv).r;\n#endif\n// Translate UV in bottom-left origin coordinates.\n// UV is reversed\nmainUv += vec2(-uvAnimationScrollX, -uvAnimationScrollY) * uvAnim;\n\n// Rotate UV counter-clockwise around (0.5, 0.5) in bottom-left origin coordinates.\nfloat rotateRad = uvAnimationRotation * PI_2 * uvAnim;\nvec2 rotatePivot = vec2(0.5, 0.5);\nmainUv = mat2(cos(rotateRad), -sin(rotateRad), sin(rotateRad), cos(rotateRad)) * (mainUv - rotatePivot) + rotatePivot;\n\n#include<mtoonBumpFragment>\n#ifdef TWOSIDEDLIGHTING\n    normalW = gl_FrontFacing ? normalW : -normalW;\n#endif\n\n#ifdef DIFFUSE\n//    baseColor=texture2D(diffuseSampler,vDiffuseUV+uvOffset);\n    #if defined(ALPHATEST) && !defined(ALPHATEST_AFTERALLALPHACOMPUTATIONS)\n        if (baseColor.a<alphaCutOff)\n            discard;\n    #endif\n    #ifdef ALPHAFROMDIFFUSE\n        alpha*=baseColor.a;\n    #endif\n    #define CUSTOM_FRAGMENT_UPDATE_ALPHA\n    baseColor.rgb*=vDiffuseInfos.y;\n#endif\n\n#include<depthPrePass>\n#define CUSTOM_FRAGMENT_UPDATE_DIFFUSE\n\n// Ambient color\nvec3 baseAmbientColor = vec3(1., 1., 1.);\n#ifdef AMBIENT\n    baseAmbientColor=texture2D(ambientSampler,vAmbientUV+uvOffset).rgb*vAmbientInfos.y;\n#endif\n\n#define CUSTOM_FRAGMENT_BEFORE_LIGHTS\n#ifdef SPECULARTERM\n    float glossiness=vSpecularColor.a;\n    vec3 specularColor=vSpecularColor.rgb;\n    #ifdef SPECULAR\n        vec4 specularMapColor=texture2D(specularSampler,vSpecularUV+uvOffset);\n        specularColor=specularMapColor.rgb;\n        #ifdef GLOSSINESS\n            glossiness=glossiness*specularMapColor.a;\n        #endif\n    #endif\n#else\n    float glossiness=0.;\n#endif\n\n// Lighting\nvec3 diffuseBase = vec3(0., 0., 0.);\nlightingInfo info;\n#ifdef SPECULARTERM\n    vec3 specularBase=vec3(0.,0.,0.);\n#endif\nfloat shadow = 1.;\nvec3 lightDirection = vec3(0.0, 1.0, 0.0);\n\nvec4 mtoonDiffuse = vec4(0.0, 0.0, 0.0, 1.0);\n\n// 通常の lightFragment ではなく、自前実装の mtoonLightFragment を読み込む\n#include<mtoonLightFragment>[0..maxSimultaneousLights]\n\n#ifdef VERTEXALPHA\n    alpha*=vColor.a;\n#endif\n\n#ifdef ALPHATEST\n    #ifdef ALPHATEST_AFTERALLALPHACOMPUTATIONS\n        if (alpha<alphaCutOff)\n            discard;\n    #endif\n    #ifndef ALPHABLEND\n        alpha=1.0;\n    #endif\n#endif\n\nvec3 emissiveColor=vEmissiveColor.rgb;\n// MToon use emissive texture in a non-standard way\n//#ifdef EMISSIVE\n//    emissiveColor+=texture2D(emissiveSampler,vEmissiveUV+uvOffset).rgb*vEmissiveInfos.y;\n//#endif\n\n#ifdef EMISSIVEASILLUMINATION\n    vec3 finalDiffuse=clamp(diffuseBase*diffuseColor+vAmbientColor,0.0,1.0)*baseColor.rgb;\n#else\n    #ifdef LINKEMISSIVEWITHDIFFUSE\n        vec3 finalDiffuse=clamp((diffuseBase)*diffuseColor+vAmbientColor,0.0,1.0)*baseColor.rgb;\n    #else\n        vec3 finalDiffuse=clamp(diffuseBase*diffuseColor+vAmbientColor,0.0,1.0)*baseColor.rgb;\n    #endif\n#endif\n#ifdef SPECULARTERM\n    vec3 finalSpecular=specularBase*specularColor;\n    #ifdef SPECULAROVERALPHA\n        alpha=clamp(alpha+dot(finalSpecular,vec3(0.3,0.59,0.11)),0.,1.);\n    #endif\n#else\n    vec3 finalSpecular=vec3(0.0);\n#endif\n\n#ifdef EMISSIVEASILLUMINATION\n    vec4 color=vec4(clamp(finalDiffuse*baseAmbientColor+finalSpecular,0.0,1.0),alpha);\n#else\n    vec4 color=vec4(finalDiffuse*baseAmbientColor+finalSpecular,alpha);\n#endif\n\n#define CUSTOM_FRAGMENT_BEFORE_FOG\ncolor.rgb = max(color.rgb, 0.);\n#include<logDepthFragment>\n#include<fogFragment>\n\n#ifdef PREMULTIPLYALPHA\n    // Convert to associative (premultiplied) format if needed.\n    color.rgb *= color.a;\n#endif\n\n#if !defined(PREPASS) || defined(WEBGL2)\n    gl_FragColor=color;\n#endif\n}\n";

/***/ }),

/***/ 854:
/***/ ((module) => {

module.exports = "// この include は特別で、 UboDeclaration または VertexDeclaration のどちらかに置換される\n// @see effect.ts\n#include<__decl__mtoonVertex>\n\n// 基本的に default.vertex.fx を踏襲している\n\n// Attributes\n#define CUSTOM_VERTEX_BEGIN\nattribute vec3 position;\n#ifdef NORMAL\nattribute vec3 normal;\n#endif\n#ifdef TANGENT\nattribute vec4 tangent;\n#endif\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#include<uvAttributeDeclaration>[2..7]\n#ifdef VERTEXCOLOR\nattribute vec4 color;\n#endif\n\n#include<helperFunctions>\n\n#include<bonesDeclaration>\n\n// Uniforms\n#include<instancesDeclaration>\n#include<prePassVertexDeclaration>\n#include<mainUVVaryingDeclaration>[1..7]\n#include<samplerVertexDeclaration>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse)\n#include<samplerVertexDeclaration>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient)\n#include<samplerVertexDeclaration>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive)\n#if defined(SPECULARTERM)\n#include<samplerVertexDeclaration>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular)\n#endif\n#include<samplerVertexDeclaration>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump)\n\n// Additional Uniforms\n#include<samplerVertexDeclaration>(_DEFINENAME_,SHADE,_VARYINGNAME_,Shade)\n#include<samplerVertexDeclaration>(_DEFINENAME_,RECEIVE_SHADOW,_VARYINGNAME_,ReceiveShadow)\n#include<samplerVertexDeclaration>(_DEFINENAME_,SHADING_GRADE,_VARYINGNAME_,ShadingGrade)\n#include<samplerVertexDeclaration>(_DEFINENAME_,RIM,_VARYINGNAME_,Rim)\n#include<samplerVertexDeclaration>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap)\n#include<samplerVertexDeclaration>(_DEFINENAME_,OUTLINE_WIDTH,_VARYINGNAME_,OutlineWidth)\n#ifdef OUTLINE_WIDTH\n    uniform sampler2D outlineWidthSampler;\n#endif\n#include<samplerVertexDeclaration>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask)\n\nuniform float aspect;\nuniform float isOutline;\n\n// Output\nvarying vec3 vPositionW;\n#ifdef NORMAL\n    varying vec3 vNormalW;\n#endif\n#ifdef VERTEXCOLOR\n    varying vec4 vColor;\n#endif\n#include<bumpVertexDeclaration>\n\n#include<clipPlaneVertexDeclaration>\n\n#include<fogVertexDeclaration>\n#include<__decl__lightVxFragment>[0..maxSimultaneousLights]\n#include<morphTargetsVertexGlobalDeclaration>\n#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]\n#include<logDepthDeclaration>\n#define CUSTOM_VERTEX_DEFINITIONS\n\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\n    vec3 positionUpdated = position;\n#ifdef NORMAL\n    vec3 normalUpdated = normal;\n#endif\n#ifdef TANGENT\n    vec4 tangentUpdated = tangent;\n#endif\n#ifdef UV1\n    vec2 uvUpdated=uv;\n#endif\n#include<morphTargetsVertexGlobal>\n#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]\n#define CUSTOM_VERTEX_UPDATE_POSITION\n#define CUSTOM_VERTEX_UPDATE_NORMAL\n#include<instancesVertex>\n#if defined(PREPASS) && defined(PREPASS_VELOCITY) && !defined(BONES_VELOCITY_ENABLED)\n\nvCurrentPosition=viewProjection*finalWorld*vec4(positionUpdated,1.0);\nvPreviousPosition=previousViewProjection*finalPreviousWorld*vec4(positionUpdated,1.0);\n#endif\n#include<bonesVertex>\n\n// Texture coordinates\n#ifndef UV1\n    vec2 uvUpdated=vec2(0.,0.);\n#endif\n#ifdef MAINUV1\n    vMainUV1=uvUpdated;\n#endif\n#include<uvVariableDeclaration>[2..7]\n#include<samplerVertexImplementation>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse,_MATRIXNAME_,diffuse,_INFONAME_,DiffuseInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient,_MATRIXNAME_,ambient,_INFONAME_,AmbientInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive,_MATRIXNAME_,emissive,_INFONAME_,EmissiveInfos.x)\n#if defined(SPECULARTERM)\n#include<samplerVertexImplementation>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular,_MATRIXNAME_,specular,_INFONAME_,SpecularInfos.x)\n#endif\n#include<samplerVertexImplementation>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump,_MATRIXNAME_,bump,_INFONAME_,BumpInfos.x)\n\nfloat outlineTex = 1.0;\nif (isOutline == 1.0) {\n#include<samplerVertexImplementation>(_DEFINENAME_,OUTLINE_WIDTH,_VARYINGNAME_,OutlineWidth,_MATRIXNAME_,outlineWidth,_INFONAME_,OutlineWidthInfos.x)\n#ifdef OUTLINE_WIDTH\n    #if defined(MAINUV1)\n        vec2 vOutlineWidthUV = vMainUV1;\n    #elif defined(MAINUV2)\n        vec2 vOutlineWidthUV = vMainUV2;\n    #elif defined(MAINUV3)\n        vec2 vOutlineWidthUV = vMainUV3;\n    #elif defined(MAINUV4)\n        vec2 vOutlineWidthUV = vMainUV4;\n    #elif defined(MAINUV5)\n        vec2 vOutlineWidthUV = vMainUV5;\n    #elif defined(MAINUV6)\n        vec2 vOutlineWidthUV = vMainUV6;\n    #else\n        vec2 vOutlineWidthUV = vec2(0., 0.);\n    #endif\n    outlineTex = texture2D(outlineWidthSampler, vOutlineWidthUV).r * vOutlineWidthInfos.y;\n#endif\n\n#if defined(MTOON_OUTLINE_WIDTH_WORLD) && defined(NORMAL)\n    // ワールド座標の normal 分だけ移動する\n    vec3 outlineOffset = normalize(finalWorld * vec4(normalUpdated, 1.0)).xyz * 0.01 * outlineWidth * outlineTex;\n    positionUpdated.xyz += outlineOffset;\n#endif\n} // End isOutline == 1.0\n\n    vec4 worldPos = finalWorld * vec4(positionUpdated, 1.0);\n\n#ifdef NORMAL\n    mat3 normalWorld = mat3(finalWorld);\n    #if defined(INSTANCES) && defined(THIN_INSTANCES)\n        vNormalW=normalUpdated/vec3(dot(normalWorld[0],normalWorld[0]),dot(normalWorld[1],normalWorld[1]),dot(normalWorld[2],normalWorld[2]));\n        vNormalW=normalize(normalWorld*vNormalW);\n    #else\n        #ifdef NONUNIFORMSCALING\n            normalWorld = transposeMat3(inverseMat3(normalWorld));\n        #endif\n    vNormalW = normalize(normalWorld * normalUpdated);\n    #endif\n#endif\n\n#define CUSTOM_VERTEX_UPDATE_WORLDPOS\n#ifdef MULTIVIEW\n    if (gl_ViewID_OVR == 0u) {\n        gl_Position = viewProjection * worldPos;\n    } else {\n        gl_Position = viewProjectionR * worldPos;\n    }\n#else\n    gl_Position = viewProjection * worldPos;\n#endif\n\n    vPositionW = vec3(worldPos);\n\n#include<prePassVertex>\n#if defined(MTOON_OUTLINE_WIDTH_SCREEN) && defined(NORMAL)\n    if (isOutline == 1.0) {\n        vec4 projectedNormal = normalize(viewProjection * finalWorld * vec4(normalUpdated, 1.0));\n        projectedNormal *= min(vertex.w, outlineScaledMaxDistance);\n        projectedNormal.x *= aspect;\n        gl_Position.xy += 0.01 * outlineWidth * outlineTex * projectedNormal.xy * clamp(\n            1.0 - abs(normalize(view * vec4(normalUpdated, 1.0)).z), 0.0, 1.0); // ignore offset when normal toward camera\n    }\n#endif\n\n    if (isOutline == 1.0) {\n        gl_Position.z += 1E-2 * gl_Position.w; // anti-artifact magic from three-vrm\n    }\n\n#include<samplerVertexImplementation>(_DEFINENAME_,SHADE,_VARYINGNAME_,Shade,_MATRIXNAME_,shade,_INFONAME_,ShadeInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,RECEIVE_SHADOW,_VARYINGNAME_,ReceiveShadow,_MATRIXNAME_,receiveShadow,_INFONAME_,ReceiveShadowInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,SHADING_GRADE,_VARYINGNAME_,ShadingGrade,_MATRIXNAME_,shadingGrade,_INFONAME_,ShadingGradeInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,RIM,_VARYINGNAME_,Rim,_MATRIXNAME_,rim,_INFONAME_,RimInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap,_MATRIXNAME_,matCap,_INFONAME_,MatCapInfos.x)\n#include<samplerVertexImplementation>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask,_MATRIXNAME_,uvAnimationMask,_INFONAME_,UvAnimationMaskInfos.x)\n\n#include<bumpVertex>\n#include<clipPlaneVertex>\n#include<fogVertex>\n#include<shadowsVertex>[0..maxSimultaneousLights]\n#ifdef VERTEXCOLOR\n\nvColor=color;\n#endif\n#include<pointCloudVertex>\n#include<logDepthVertex>\n#define CUSTOM_VERTEX_MAIN_END\n}\n";

/***/ }),

/***/ 463:
/***/ ((module) => {

module.exports = "// include<__decl__mtoonVertex> または include<__decl__mtoonFragment> と書いた時に WebGL2 の場合展開される\n// @see effect.ts\n\nlayout(std140, column_major) uniform;\n\nuniform Material\n{\n    // Color & Texture\n    vec4 vDiffuseColor;\n    vec2 vDiffuseInfos;\n    mat4 diffuseMatrix;\n    vec4 vSpecularColor;\n    vec2 vSpecularInfos;\n    mat4 specularMatrix;\n    vec3 vAmbientColor;\n    vec2 vAmbientInfos;\n    mat4 ambientMatrix;\n    vec3 vEmissiveColor;\n    vec2 vEmissiveInfos;\n    mat4 emissiveMatrix;\n    vec3 vBumpInfos;\n    mat4 bumpMatrix;\n    vec3 vShadeColor;\n    vec2 vShadeInfos;\n    mat4 shadeMatrix;\n    vec2 vReceiveShadowInfos;\n    mat4 receiveShadowMatrix;\n    vec2 vShadingGradeInfos;\n    mat4 shadingGradeMatrix;\n    vec3 vRimColor;\n    vec2 vRimInfos;\n    mat4 rimMatrix;\n    vec2 vMatCapInfos;\n    mat4 matCapMatrix;\n    vec4 vOutlineColor;\n    vec2 vOutlineWidthInfos;\n    mat4 outlineWidthMatrix;\n    vec2 vUvAnimationMaskInfos;\n    mat4 uvAnimationMaskMatrix;\n\n    // babylon specific\n    vec2 vTangentSpaceParams;\n    float pointSize;\n    float alphaCutOff;\n\n    // MToon params\n    float shadingGradeRate;\n    float receiveShadowRate;\n    float shadeShift;\n    float shadeToony;\n    float lightColorAttenuation;\n    float indirectLightIntensity;\n    float rimLightingMix;\n    float rimFresnelPower;\n    float rimLift;\n    float outlineWidth;\n    float outlineScaledMaxDistance;\n    float outlineLightingMix;\n    float uvAnimationScrollX;\n    float uvAnimationScrollY;\n    float uvAnimationRotation;\n};\n\n// babylon specific\nuniform Scene {\n    mat4 viewProjection;\n#ifdef MULTIVIEW\n    mat4 viewProjectionR;\n#endif\n    mat4 view;\n    mat4 projection;\n    vec4 vEyePosition;\n};\n";

/***/ }),

/***/ 486:
/***/ ((module) => {

module.exports = "// Uniforms\nuniform mat4 viewProjection;\nuniform mat4 view;\nuniform float outlineWidth;\nuniform float outlineScaledMaxDistance;\nuniform float outlineLightingMix;\n\n#ifdef DIFFUSE\nuniform mat4 diffuseMatrix;\nuniform vec2 vDiffuseInfos;\n#endif\n\n#ifdef EMISSIVE\nuniform vec2 vEmissiveInfos;\nuniform mat4 emissiveMatrix;\n#endif\n\n#ifdef BUMP\nuniform vec3 vBumpInfos;\nuniform mat4 bumpMatrix;\n#endif\n\n#ifdef SHADE\nuniform vec2 vShadeInfos;\nuniform mat4 shadeMatrix;\n#endif\n\n#ifdef RECEIVE_SHADOW\nuniform vec2 vReceiveShadowInfos;\nuniform mat4 receiveShadowMatrix;\n#endif\n\n#ifdef SHADING_GRADE\nuniform vec2 vShadingGradeInfos;\nuniform mat4 shadingGradeMatrix;\n#endif\n\n#ifdef RIM\nuniform vec2 vRimInfos;\nuniform mat4 rimMatrix;\n#endif\n\n#ifdef MATCAP\nuniform vec2 vMatCapInfos;\nuniform mat4 matCapMatrix;\n#endif\n\n#ifdef OUTLINE_WIDTH\nuniform vec2 vOutlineWidthInfos;\nuniform mat4 outlineWidthMatrix;\n#endif\n\n#ifdef UV_ANIMATION_MASK\nuniform vec2 vUvAnimationMaskInfos;\nuniform mat4 uvAnimationMaskMatrix;\n#endif\n\n#ifdef POINTSIZE\nuniform float pointSize;\n#endif\n";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "V3DCore": () => (/* binding */ V3DCore),
  "default": () => (/* binding */ src)
});

;// CONCATENATED MODULE: external "BABYLON"
const external_BABYLON_namespaceObject = BABYLON;
;// CONCATENATED MODULE: external "LOADERS"
const external_LOADERS_namespaceObject = LOADERS;
;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/vrm-file-loader.ts

/**
 * VRM/VCI ファイルを読み込めるようにする
 * 拡張子を変更しただけ
 */
class VRMFileLoader extends external_LOADERS_namespaceObject.GLTFFileLoader {
    constructor() {
        super(...arguments);
        this.name = 'vrm';
        this.extensions = {
            '.vrm': { isBinary: true },
            '.vci': { isBinary: true },
        };
        this.vrmManager = null;
    }
    createPlugin() {
        return new VRMFileLoader();
    }
    loadAsync(scene, data, rootUrl, onProgress, fileName) {
        this.uri = rootUrl;
        if (fileName)
            this.uri += fileName;
        return super.loadAsync(scene, data, rootUrl, onProgress, fileName);
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/collider.ts
/**
 * Collider
 */
class Collider {
    /**
     * @param offset The local coordinate from the node of the collider group.
     * @param radius The radius of the collider.
     */
    constructor(offset, radius) {
        this.offset = offset;
        this.radius = radius;
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/collider-group.ts

/**
 * VRM SpringBone ColliderGroup
 */
class ColliderGroup {
    /**
     * @param transform The node of the collider group for setting up collision detections.
     */
    constructor(transform) {
        this.transform = transform;
        this.colliders = [];
    }
    /**
     * Add offsetted collider
     *
     * @param offset The local coordinate from the node of the collider group.
     * @param radius The radius of the collider.
     */
    addCollider(offset, radius) {
        this.colliders.push(new Collider(offset, radius));
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/sphere-collider.ts
/**
 * Runtime Sphere Collider
 */
class SphereCollider {
    /**
     * @param position Absolute Collider Position
     * @param radius Collider radius
     */
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/vector3-helper.ts

/**
 * Vector3 Helper
 */
class Vector3Helper {
    /**
     * Vector3 * float
     *
     * @param original
     * @param amount
     */
    static multiplyByFloat(original, amount) {
        return new external_BABYLON_namespaceObject.Vector3(original.x * amount, original.y * amount, original.z * amount);
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/quaternion-helper.ts

/**
 * Quaternion Helper
 */
class QuaternionHelper {
    /**
     * Rotates the point point with rotation.
     *
     * Quaternion * Vector3
     *
     * @param quat
     * @param vec
     * @see https://docs.unity3d.com/2017.4/Documentation/ScriptReference/Quaternion-operator_multiply.html
     * @see https://answers.unity.com/questions/372371/multiply-quaternion-by-vector3-how-is-done.html
     * @see https://github.com/adragonite/math3d/blob/master/src/Quaternion.js#L287
     */
    static multiplyWithVector3(quat, vec) {
        const num = quat.x * 2;
        const num2 = quat.y * 2;
        const num3 = quat.z * 2;
        const num4 = quat.x * num;
        const num5 = quat.y * num2;
        const num6 = quat.z * num3;
        const num7 = quat.x * num2;
        const num8 = quat.x * num3;
        const num9 = quat.y * num3;
        const num10 = quat.w * num;
        const num11 = quat.w * num2;
        const num12 = quat.w * num3;
        const result = new external_BABYLON_namespaceObject.Vector3();
        result.x = (1 - (num5 + num6)) * vec.x + (num7 - num12) * vec.y + (num8 + num11) * vec.z;
        result.y = (num7 + num12) * vec.x + (1 - (num4 + num6)) * vec.y + (num9 - num10) * vec.z;
        result.z = (num8 - num11) * vec.x + (num9 + num10) * vec.y + (1 - (num4 + num5)) * vec.z;
        return result;
    }
    /**
     * Creates a rotation which rotates from fromDirection to toDirection.
     *
     * @see https://docs.unity3d.com/2017.4/Documentation/ScriptReference/Quaternion.FromToRotation.html
     * @see https://stackoverflow.com/questions/51549366/what-is-the-math-behind-fromtorotation-unity3d
     */
    static fromToRotation(from, to) {
        const axis = external_BABYLON_namespaceObject.Vector3.Cross(from, to).normalize();
        const a = external_BABYLON_namespaceObject.Vector3.Dot(from, to);
        const b = from.length() * to.length();
        const phi = Math.acos(Math.max(0.0, Math.min(1.0, a / b)));
        const sin = Math.sin(phi / 2);
        return new external_BABYLON_namespaceObject.Quaternion(sin * axis.x, sin * axis.y, sin * axis.z, Math.cos(phi / 2));
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/vrm-spring-bone-logic.ts




/**
 * Verlet Spring Bone Logic
 * TODO: collider is still kind of buggy. Internal meshes sometimes move outside external meshes.
 */
class VRMSpringBoneLogic {
    /**
     * @param center Center reference of TransformNode
     * @param radius Collision Radius
     * @param transform Base TransformNode
     * @param localChildPosition
     */
    constructor(center, radius, transform, localChildPosition) {
        this.radius = radius;
        this.transform = transform;
        // Initialize rotationQuaternion when not initialized
        if (!transform.rotationQuaternion) {
            transform.rotationQuaternion = transform.rotation.toQuaternion();
        }
        const parent = transform.parent;
        if (parent !== null && parent.rotationQuaternion === null) {
            parent.rotationQuaternion = parent.rotation.toQuaternion();
        }
        const worldChildPosition = transform.getAbsolutePosition().add(localChildPosition);
        this.currentTail = this.getCenterTranslatedPos(center, worldChildPosition);
        this.prevTail = this.currentTail;
        this.localRotation = transform.rotationQuaternion.clone();
        this.boneAxis = external_BABYLON_namespaceObject.Vector3.Normalize(localChildPosition);
        this.boneLength = localChildPosition.length();
    }
    /**
     * Update Tail position
     *
     * @param center Center reference of TransformNode
     * @param stiffnessForce Current frame stiffness
     * @param dragForce Current frame drag force
     * @param external Current frame external force
     * @param colliders Current frame colliders
     */
    update(center, stiffnessForce, dragForce, external, colliders) {
        const absPos = this.transform.getAbsolutePosition();
        if (Number.isNaN(absPos.x)) {
            // Do not update when absolute position is invalid
            return;
        }
        const currentTail = this.getCenterTranslatedWorldPos(center, this.currentTail);
        const prevTail = this.getCenterTranslatedWorldPos(center, this.prevTail);
        // verlet 積分で次の位置を計算
        let nextTail = currentTail;
        {
            // 減衰付きで前のフレームの移動を継続
            const attenuation = 1.0 - dragForce;
            const delta = Vector3Helper.multiplyByFloat(currentTail.subtract(prevTail), attenuation);
            nextTail.addInPlace(delta);
        }
        {
            // 親の回転による子ボーンの移動目標
            const rotation = this.getAbsoluteRotationQuaternion(this.transform.parent)
                .multiply(this.localRotation); // parentRotation * localRotation
            const rotatedVec = QuaternionHelper.multiplyWithVector3(rotation, this.boneAxis); // rotation * boneAxis
            const stiffedVec = Vector3Helper.multiplyByFloat(rotatedVec, stiffnessForce); // rotatedVec * stiffnessForce
            nextTail.addInPlace(stiffedVec); // nextTail + stiffedVec
        }
        {
            // 外力による移動量
            nextTail.addInPlace(external);
        }
        {
            // 長さを boneLength に強制
            const normalized = nextTail.subtract(absPos).normalize();
            nextTail = absPos.add(Vector3Helper.multiplyByFloat(normalized, this.boneLength));
        }
        {
            // Collision で移動
            nextTail = this.collide(colliders, nextTail);
        }
        this.prevTail = this.getCenterTranslatedPos(center, currentTail);
        this.currentTail = this.getCenterTranslatedPos(center, nextTail);
        // 回転を適用
        this.setAbsoluteRotationQuaternion(this.transform, this.transformToRotation(nextTail));
    }
    /**
     * Set Rotation Quaternion in world space.
     * @param node Node to set rotation
     * @param quatRotation Quaternion to set
     * @private
     */
    setAbsoluteRotationQuaternion(node, quatRotation) {
        if (node.parent) {
            const positionOrig = new external_BABYLON_namespaceObject.Vector3(0, 0, 0);
            const scalingOrig = new external_BABYLON_namespaceObject.Vector3(0, 0, 0);
            const quatRotationNew = external_BABYLON_namespaceObject.Quaternion.Identity();
            const tempWorldMatrix = external_BABYLON_namespaceObject.Matrix.Identity();
            node.computeWorldMatrix(true);
            node.getWorldMatrix().decompose(scalingOrig, external_BABYLON_namespaceObject.Quaternion.Identity(), positionOrig);
            external_BABYLON_namespaceObject.Matrix.ComposeToRef(scalingOrig, quatRotation, positionOrig, tempWorldMatrix);
            const diffMatrix = external_BABYLON_namespaceObject.Matrix.Identity();
            const invParentMatrix = external_BABYLON_namespaceObject.Matrix.Identity();
            node.parent.computeWorldMatrix(false); // Since only used after transformToRotation
            node.parent.getWorldMatrix().invertToRef(invParentMatrix);
            tempWorldMatrix.multiplyToRef(invParentMatrix, diffMatrix);
            diffMatrix.decompose(new external_BABYLON_namespaceObject.Vector3(0, 0, 0), quatRotationNew, new external_BABYLON_namespaceObject.Vector3(0, 0, 0));
            if (node.rotationQuaternion) {
                node.rotationQuaternion.copyFrom(quatRotationNew);
            }
            else {
                quatRotationNew.toEulerAnglesToRef(node.rotation);
            }
        }
        else {
            node.rotationQuaternion = quatRotation;
        }
    }
    getAbsoluteRotationQuaternion(node) {
        const quatRotation = external_BABYLON_namespaceObject.Quaternion.Identity();
        node?.computeWorldMatrix(true);
        node?.getWorldMatrix().decompose(new external_BABYLON_namespaceObject.Vector3(0, 0, 0), quatRotation, new external_BABYLON_namespaceObject.Vector3(0, 0, 0));
        return quatRotation;
    }
    getCenterTranslatedWorldPos(center, pos) {
        if (center !== null) {
            return center.getAbsolutePosition().add(pos);
        }
        return pos;
    }
    getCenterTranslatedPos(center, pos) {
        if (center !== null) {
            return pos.subtract(center.getAbsolutePosition());
        }
        return pos;
    }
    /**
     * 次のテールの位置情報から回転情報を生成する
     *
     * @see https://stackoverflow.com/questions/51549366/what-is-the-math-behind-fromtorotation-unity3d
     */
    transformToRotation(nextTail) {
        const rotation = this.getAbsoluteRotationQuaternion(this.transform.parent)
            .multiply(this.localRotation);
        const fromAxis = QuaternionHelper.multiplyWithVector3(rotation, this.boneAxis);
        const toAxis = nextTail.subtract(this.transform.absolutePosition).normalize();
        const result = QuaternionHelper.fromToRotation(fromAxis, toAxis);
        return result.multiplyInPlace(rotation);
    }
    /**
     * 衝突判定を行う
     * @param colliders SphereColliders
     * @param nextTail NextTail
     */
    collide(colliders, nextTail) {
        colliders.forEach((collider) => {
            const r = this.radius + collider.radius;
            const axis = nextTail.subtract(collider.position);
            // 少数誤差許容のため 2 cm 判定を小さくする
            if (axis.lengthSquared() <= (r * r) - 0.02) {
                // ヒット。 Collider の半径方向に押し出す
                const posFromCollider = collider.position.add(Vector3Helper.multiplyByFloat(axis.normalize(), r));
                // 長さを boneLength に強制
                const absPos = this.transform.absolutePosition;
                nextTail = absPos.add(Vector3Helper.multiplyByFloat(posFromCollider.subtractInPlace(absPos).normalize(), this.boneLength));
            }
        });
        return nextTail;
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/vrm-spring-bone.ts






/**
 * @see https://github.com/vrm-c/UniVRM/blob/master/Assets/VRM/UniVRM/Scripts/SpringBone/VRMSpringBone.cs
 */
class VRMSpringBone {
    /**
     * @see https://vrm.dev/en/vrm_spec/
     * @param comment Annotation comment
     * @param stiffness The resilience of the swaying object (the power of returning to the initial pose).
     * @param gravityPower The strength of gravity.
     * @param gravityDir The direction of gravity. Set (0, -1, 0) for simulating the gravity. Set (1, 0, 0) for simulating the wind.
     * @param dragForce The resistance (deceleration) of automatic animation.
     * @param center The reference point of a swaying object can be set at any location except the origin.
     *               When implementing UI moving with warp,
     *               the parent node to move with warp can be specified if you don't want to make the object swaying with warp movement.
     * @param hitRadius The radius of the sphere used for the collision detection with colliders.
     * @param bones Specify the node index of the root bone of the swaying object.
     * @param colliderGroups Specify the index of the collider group for collisions with swaying objects.
     */
    constructor(comment, stiffness, gravityPower, gravityDir, dragForce, center, hitRadius, bones, colliderGroups) {
        this.comment = comment;
        this.stiffness = stiffness;
        this.gravityPower = gravityPower;
        this.gravityDir = gravityDir;
        this.dragForce = dragForce;
        this.center = center;
        this.hitRadius = hitRadius;
        this.bones = bones;
        this.colliderGroups = colliderGroups;
        this.verlets = [];
        this.initialLocalRotations = [];
        this.activeBones = [];
        /** @hidden */
        this.drawGizmo = false;
        this.boneGizmoList = [];
        this.colliderGizmoList = [];
        this.activeBones = this.bones.filter((bone) => bone !== null);
        this.activeBones.forEach((bone) => {
            bone.rotationQuaternion = bone.rotationQuaternion || bone.rotation.toQuaternion();
            this.initialLocalRotations.push(bone.rotationQuaternion.clone());
        });
    }
    /**
     * Initialize bones
     *
     * @param force Force reset rotation
     */
    setup(force = false) {
        if (!force) {
            this.activeBones.forEach((bone, index) => {
                bone.rotationQuaternion = this.initialLocalRotations[index].clone();
            });
        }
        this.verlets = [];
        this.activeBones.forEach((bone, index) => {
            this.initialLocalRotations[index] = bone.rotationQuaternion;
            this.setupRecursive(this.center, bone);
        });
    }
    /**
     * Update bones
     *
     * @param deltaTime
     */
    async update(deltaTime) {
        if (this.verlets.length === 0) {
            if (this.activeBones.length === 0) {
                return;
            }
            this.setup();
        }
        const colliderList = [];
        this.colliderGroups.forEach((group) => {
            if (!group) {
                return;
            }
            const absPos = group.transform.getAbsolutePosition();
            if (Number.isNaN(absPos.x)) {
                return;
            }
            group.colliders.forEach((collider) => {
                const pos = absPos.add(collider.offset);
                colliderList.push(new SphereCollider(pos, collider.radius));
                if (this.drawGizmo) {
                    if (this.colliderGizmoList.length < colliderList.length) {
                        const mesh = external_BABYLON_namespaceObject.MeshBuilder.CreateSphere(`${group.transform.name}_colliderGizmo`, {
                            segments: 8,
                            diameter: 1,
                            updatable: true,
                        }, group.transform.getScene());
                        const mat = new external_BABYLON_namespaceObject.StandardMaterial(group.transform.name + '_colliderGizmomat', group.transform.getScene());
                        mat.emissiveColor = external_BABYLON_namespaceObject.Color3.Yellow();
                        mat.wireframe = true;
                        mesh.material = mat;
                        this.colliderGizmoList.push(mesh);
                    }
                    this.colliderGizmoList[colliderList.length - 1].position = pos;
                    this.colliderGizmoList[colliderList.length - 1].scaling = new external_BABYLON_namespaceObject.Vector3(collider.radius * 2, collider.radius * 2, collider.radius * 2);
                }
            });
        });
        const stiffness = this.stiffness * deltaTime;
        const external = Vector3Helper.multiplyByFloat(this.gravityDir, this.gravityPower * deltaTime);
        const promises = this.verlets.map((verlet, index) => {
            return new Promise((resolve) => {
                verlet.update(this.center, stiffness, this.dragForce, external, colliderList);
                if (this.drawGizmo && this.boneGizmoList[index]) {
                    this.boneGizmoList[index].position = verlet.transform.absolutePosition;
                    this.boneGizmoList[index].rotationQuaternion = verlet.transform.rotationQuaternion;
                }
                resolve();
            });
        });
        return Promise.all(promises).then(() => { });
    }
    setupRecursive(center, parent) {
        if (parent.getChildTransformNodes().length === 0) {
            // Leaf
            const ancestor = parent.parent;
            const delta = parent.getAbsolutePosition().subtract(ancestor.getAbsolutePosition()).normalize();
            const childPosition = parent.position.add(Vector3Helper.multiplyByFloat(delta, 0.07));
            this.verlets.push(new VRMSpringBoneLogic(center, this.hitRadius, parent, childPosition));
        }
        else {
            // Not leaf
            const firstChild = parent.getChildTransformNodes().shift();
            const localPosition = firstChild.position;
            const scale = firstChild.scaling;
            this.verlets.push(new VRMSpringBoneLogic(center, this.hitRadius, parent, localPosition.multiply(scale)));
        }
        if (this.drawGizmo) {
            const boneGizmo = external_BABYLON_namespaceObject.MeshBuilder.CreateSphere(parent.name + '_boneGizmo', {
                segments: 8,
                diameter: this.hitRadius * 2,
                updatable: true,
            }, parent.getScene());
            const mat = new external_BABYLON_namespaceObject.StandardMaterial(parent.name + '_boneGizmomat', parent.getScene());
            mat.emissiveColor = external_BABYLON_namespaceObject.Color3.Red();
            mat.wireframe = true;
            boneGizmo.material = mat;
            this.boneGizmoList.push(boneGizmo);
        }
        parent.getChildTransformNodes().forEach((child) => {
            this.setupRecursive(center, child);
        });
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/secondary-animation/spring-bone-controller.ts



/**
 * VRM SpringBone Controller
 */
class SpringBoneController {
    /**
     * @param ext SecondaryAnimation Object
     * @param getBone
     * @param options Override for constructSprings
     */
    constructor(ext, getBone, options) {
        this.ext = ext;
        const colliderGroups = this.constructColliderGroups(getBone);
        this.springs = this.constructSprings(getBone, colliderGroups, options);
    }
    dispose() {
        this.springs = [];
    }
    /**
     * Initialize SpringBones
     */
    setup(force = false) {
        this.springs.forEach((spring) => {
            spring.setup(force);
        });
    }
    /**
     * Update all SpringBones
     *
     * @param deltaTime Elapsed sec from previous frame
     * @see https://docs.unity3d.com/ScriptReference/Time-deltaTime.html
     */
    async update(deltaTime) {
        // ポーズ後のあらぶり防止のため clamp
        deltaTime = Math.max(0.0, Math.min(16.666, deltaTime)) / 1000;
        const promises = this.springs.map((spring) => {
            return spring.update(deltaTime);
        });
        return Promise.all(promises).then(() => { });
    }
    constructColliderGroups(getBone) {
        if (!this.ext.colliderGroups || !this.ext.colliderGroups.length) {
            return [];
        }
        const colliderGroups = [];
        this.ext.colliderGroups.forEach((colliderGroup) => {
            const bone = getBone(colliderGroup.node);
            const g = new ColliderGroup(bone);
            colliderGroup.colliders.forEach((collider) => {
                g.addCollider(
                // Unity 座標系からの変換のため X, Z 軸を反転
                new external_BABYLON_namespaceObject.Vector3(-collider.offset.x, collider.offset.y, -collider.offset.z), collider.radius);
            });
            colliderGroups.push(g);
        });
        return colliderGroups;
    }
    constructSprings(getBone, colliderGroups, options) {
        if (!this.ext.boneGroups || !this.ext.boneGroups.length) {
            return [];
        }
        const springs = [];
        this.ext.boneGroups.forEach((spring) => {
            const rootBones = (spring.bones || []).map((bone) => {
                return getBone(bone);
            });
            const springColliders = (spring.colliderGroups || []).map((g) => {
                return colliderGroups[g];
            });
            springs.push(new VRMSpringBone(spring.comment, options?.stiffness
                ? options.stiffness
                : spring.stiffiness, options?.gravityPower
                ? options.gravityPower
                : spring.gravityPower, options?.gravityDir
                ? options.gravityDir
                : new external_BABYLON_namespaceObject.Vector3(
                // Unity 座標系からの変換のため X, Z 軸を反転
                -spring.gravityDir.x, -spring.gravityDir.y, -spring.gravityDir.z).normalize(), options?.dragForce
                ? options.dragForce
                : spring.dragForce, getBone(spring.center), options?.hitRadius
                ? options.hitRadius
                : spring.hitRadius, rootBones, springColliders));
        });
        return springs;
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/errors.ts
/**
 * Throws when mandatory bone could not find
 */
class BoneNotFoundError extends Error {
    constructor(boneName) {
        super(`Bone:${boneName} NotFound`);
        this.boneName = boneName;
        this.name = 'BoneNotFoundError';
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/humanoid-bone.ts

/**
 * HumanoidBone を取得するメソッド群
 * @see https://docs.unity3d.com/ja/2018.3/ScriptReference/HumanBodyBones.html
 */
class HumanoidBone {
    constructor(nodeMap) {
        this.nodeMap = nodeMap;
    }
    dispose() {
        this.nodeMap = null;
    }
    /**
     * 尻
     */
    get hips() {
        return this.getMandatoryBone('hips');
    }
    /**
     * 左太もも
     */
    get leftUpperLeg() {
        return this.getMandatoryBone('leftUpperLeg');
    }
    /**
     * 右太もも
     */
    get rightUpperLeg() {
        return this.getMandatoryBone('rightUpperLeg');
    }
    /**
     * 左ひざ
     */
    get leftLowerLeg() {
        return this.getMandatoryBone('leftLowerLeg');
    }
    /**
     * 右ひざ
     */
    get rightLowerLeg() {
        return this.getMandatoryBone('rightLowerLeg');
    }
    /**
     * 左足首
     */
    get leftFoot() {
        return this.getMandatoryBone('leftFoot');
    }
    /**
     * 右足首
     */
    get rightFoot() {
        return this.getMandatoryBone('rightFoot');
    }
    /**
     * 脊椎の第一
     */
    get spine() {
        return this.getMandatoryBone('spine');
    }
    /**
     * 胸
     */
    get chest() {
        return this.getMandatoryBone('chest');
    }
    /**
     * 首
     */
    get neck() {
        return this.getMandatoryBone('neck');
    }
    /**
     * 頭
     */
    get head() {
        return this.getMandatoryBone('head');
    }
    /**
     * 左肩
     */
    get leftShoulder() {
        return this.getMandatoryBone('leftShoulder');
    }
    /**
     * 右肩
     */
    get rightShoulder() {
        return this.getMandatoryBone('rightShoulder');
    }
    /**
     * 左上腕
     */
    get leftUpperArm() {
        return this.getMandatoryBone('leftUpperArm');
    }
    /**
     * 右上腕
     */
    get rightUpperArm() {
        return this.getMandatoryBone('rightUpperArm');
    }
    /**
     * 左ひじ
     */
    get leftLowerArm() {
        return this.getMandatoryBone('leftLowerArm');
    }
    /**
     * 右ひじ
     */
    get rightLowerArm() {
        return this.getMandatoryBone('rightLowerArm');
    }
    /**
     * 左手首
     */
    get leftHand() {
        return this.getMandatoryBone('leftHand');
    }
    /**
     * 右手首
     */
    get rightHand() {
        return this.getMandatoryBone('rightHand');
    }
    /**
     * 左つま先(Optional)
     */
    get leftToes() {
        return this.getOptionalBone('leftToes');
    }
    /**
     * 右つま先(Optional)
     */
    get rightToes() {
        return this.getOptionalBone('rightToes');
    }
    /**
     * 左目(Optional)
     */
    get leftEye() {
        return this.getOptionalBone('leftEye');
    }
    /**
     * 右目(Optional)
     */
    get rightEye() {
        return this.getOptionalBone('rightEye');
    }
    /**
     * 顎(Optional)
     */
    get jaw() {
        return this.getOptionalBone('jaw');
    }
    /**
     * 左親指第一指骨(Optional)
     */
    get leftThumbProximal() {
        return this.getOptionalBone('leftThumbProximal');
    }
    /**
     * 左親指第二指骨(Optional)
     */
    get leftThumbIntermediate() {
        return this.getOptionalBone('leftThumbIntermediate');
    }
    /**
     * 左親指第三指骨(Optional)
     */
    get leftThumbDistal() {
        return this.getOptionalBone('leftThumbDistal');
    }
    /**
     * 左人差し指第一指骨(Optional)
     */
    get leftIndexProximal() {
        return this.getOptionalBone('leftIndexProximal');
    }
    /**
     * 左人差し指第二指骨(Optional)
     */
    get leftIndexIntermediate() {
        return this.getOptionalBone('leftIndexIntermediate');
    }
    /**
     * 左人差し指第三指骨(Optional)
     */
    get leftIndexDistal() {
        return this.getOptionalBone('leftIndexDistal');
    }
    /**
     * 左中指第一指骨(Optional)
     */
    get leftMiddleProximal() {
        return this.getOptionalBone('leftMiddleProximal');
    }
    /**
     * 左中指第二指骨(Optional)
     */
    get leftMiddleIntermediate() {
        return this.getOptionalBone('leftMiddleIntermediate');
    }
    /**
     * 左中指第三指骨(Optional)
     */
    get leftMiddleDistal() {
        return this.getOptionalBone('leftMiddleDistal');
    }
    /**
     * 左薬指第一指骨(Optional)
     */
    get leftRingProximal() {
        return this.getOptionalBone('leftRingProximal');
    }
    /**
     * 左薬指第二指骨(Optional)
     */
    get leftRingIntermediate() {
        return this.getOptionalBone('leftRingIntermediate');
    }
    /**
     * 左薬指第三指骨(Optional)
     */
    get leftRingDistal() {
        return this.getOptionalBone('leftRingDistal');
    }
    /**
     * 左小指第一指骨(Optional)
     */
    get leftLittleProximal() {
        return this.getOptionalBone('leftLittleProximal');
    }
    /**
     * 左小指第二指骨(Optional)
     */
    get leftLittleIntermediate() {
        return this.getOptionalBone('leftLittleIntermediate');
    }
    /**
     * 左小指第三指骨(Optional)
     */
    get leftLittleDistal() {
        return this.getOptionalBone('leftLittleDistal');
    }
    /**
     * 右親指第一指骨(Optional)
     */
    get rightThumbProximal() {
        return this.getOptionalBone('rightThumbProximal');
    }
    /**
     * 右親指第二指骨(Optional)
     */
    get rightThumbIntermediate() {
        return this.getOptionalBone('rightThumbIntermediate');
    }
    /**
     * 右親指第三指骨(Optional)
     */
    get rightThumbDistal() {
        return this.getOptionalBone('rightThumbDistal');
    }
    /**
     * 右人差し指第一指骨(Optional)
     */
    get rightIndexProximal() {
        return this.getOptionalBone('rightIndexProximal');
    }
    /**
     * 右人差し指第二指骨(Optional)
     */
    get rightIndexIntermediate() {
        return this.getOptionalBone('rightIndexIntermediate');
    }
    /**
     * 右人差し指第三指骨(Optional)
     */
    get rightIndexDistal() {
        return this.getOptionalBone('rightIndexDistal');
    }
    /**
     * 右中指第一指骨(Optional)
     */
    get rightMiddleProximal() {
        return this.getOptionalBone('rightMiddleProximal');
    }
    /**
     * 右中指第二指骨(Optional)
     */
    get rightMiddleIntermediate() {
        return this.getOptionalBone('rightMiddleIntermediate');
    }
    /**
     * 右中指第三指骨(Optional)
     */
    get rightMiddleDistal() {
        return this.getOptionalBone('rightMiddleDistal');
    }
    /**
     * 右薬指第一指骨(Optional)
     */
    get rightRingProximal() {
        return this.getOptionalBone('rightRingProximal');
    }
    /**
     * 右薬指第二指骨(Optional)
     */
    get rightRingIntermediate() {
        return this.getOptionalBone('rightRingIntermediate');
    }
    /**
     * 右薬指第三指骨(Optional)
     */
    get rightRingDistal() {
        return this.getOptionalBone('rightRingDistal');
    }
    /**
     * 右小指第一指骨(Optional)
     */
    get rightLittleProximal() {
        return this.getOptionalBone('rightLittleProximal');
    }
    /**
     * 右小指第二指骨(Optional)
     */
    get rightLittleIntermediate() {
        return this.getOptionalBone('rightLittleIntermediate');
    }
    /**
     * 右小指第三指骨(Optional)
     */
    get rightLittleDistal() {
        return this.getOptionalBone('rightLittleDistal');
    }
    /**
     * 上胸(Optional)
     */
    get upperChest() {
        return this.getOptionalBone('upperChest');
    }
    /**
     * 必須ボーンを取得する。取得出来ない場合は例外を発生する
     *
     * @throws BoneNotFoundError
     * @param name HumanoidBoneName
     */
    getMandatoryBone(name) {
        const node = this.nodeMap[name];
        if (!node) {
            throw new BoneNotFoundError(name);
        }
        return node;
    }
    /**
     * オプショナルボーンを取得する
     *
     * @param name HumanoidBoneName
     */
    getOptionalBone(name) {
        return this.nodeMap && this.nodeMap[name] || null;
    }
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/vrm-manager.ts



/**
 * VRM キャラクターを動作させるためのマネージャ
 */
class VRMManager {
    /**
     *
     * @param ext glTF.extensions.VRM の中身 json
     * @param scene
     * @param meshesFrom この番号以降のメッシュがこの VRM に該当する
     * @param transformNodesFrom この番号以降の TransformNode がこの VRM に該当する
     * @param uri URI this manager belongs to
     */
    constructor(ext, scene, meshesFrom, transformNodesFrom, uri) {
        this.ext = ext;
        this.scene = scene;
        this.meshesFrom = meshesFrom;
        this.transformNodesFrom = transformNodesFrom;
        this.uri = uri;
        this.morphTargetMap = {};
        this.presetMorphTargetMap = {};
        this.transformNodeMap = {};
        this.transformNodeCache = {};
        this.meshCache = {};
        this._cameras = [];
        this.meshCache = this.constructMeshCache();
        this.transformNodeCache = this.constructTransformNodeCache();
        this.springBoneController = new SpringBoneController(this.ext.secondaryAnimation, this.findTransformNode.bind(this), {
        // gravityPower: 0.5,
        });
        this.springBoneController.setup();
        this.constructMorphTargetMap();
        this.constructTransformNodeMap();
        this._humanoidBone = new HumanoidBone(this.transformNodeMap);
        this.removeDuplicateSkeletons();
        this._rootSkeleton = this.getRootSkeletonNode();
    }
    get cameras() {
        return this._cameras;
    }
    appendCamera(camera) {
        this._cameras.push(camera);
    }
    resetCameras() {
        this._cameras = [];
    }
    /**
     * Remove duplicate skeletons when importing VRM.
     * Only tested on VRoidStudio output files.
     * @private
     */
    removeDuplicateSkeletons() {
        let skeleton = null;
        for (const nodeIndex of Object.keys(this.meshCache).map(Number)) {
            const meshes = this.meshCache[nodeIndex];
            if (meshes.length && meshes[0].skeleton) {
                if (!skeleton) {
                    skeleton = meshes[0].skeleton;
                    if (this._rootMesh) {
                        const rootBone = skeleton.bones[0];
                        // Usually it is called "Root", but there are exceptions
                        if (rootBone.name !== "Root")
                            console.warn('The first bone has a different name than "Root"');
                    }
                }
                else {
                    // weak sanity check
                    if (skeleton.bones.length != meshes[0].skeleton.bones.length)
                        console.warn("Skeletons have different numbers of bones!");
                    meshes[0].skeleton.dispose();
                    for (const mesh of meshes) {
                        mesh.skeleton = skeleton;
                    }
                }
            }
        }
    }
    /**
     * Find the root node of skeleton.
     * @private
     */
    getRootSkeletonNode() {
        const rootMeshChildren = this._rootMesh.getChildren((node) => {
            return node.name === "Root" || node.name === "Armature";
        });
        if (rootMeshChildren.length > 0)
            return rootMeshChildren[0];
        else {
            // Try to find in scene directly
            const rootMeshChild = this.scene.getNodeByName("Root")
                ? this.scene.getNodeByName("Root")
                : this.scene.getNodeByName("Armature");
            if (rootMeshChild && !rootMeshChild.parent)
                return rootMeshChild;
            else
                throw Error("Cannot find root skeleton node!");
        }
    }
    /**
     * Secondary Animation を更新する
     *
     * @param deltaTime 前フレームからの経過秒数(sec)
     */
    async update(deltaTime) {
        await this.springBoneController.update(deltaTime);
    }
    /**
     * 破棄処理
     */
    dispose() {
        this.springBoneController.dispose();
        this._humanoidBone.dispose();
        this.morphTargetMap = null;
        this.presetMorphTargetMap = null;
        this.transformNodeMap = null;
        this.transformNodeCache = null;
        this.meshCache = null;
        this._rootMesh = null;
    }
    /**
     * モーフィングを行う
     * @param label モーフ名
     * @param value 値(0〜1)
     */
    morphing(label, value) {
        if (!this.morphTargetMap[label]) {
            return;
        }
        this.morphTargetMap[label].forEach((setting) => {
            setting.target.influence = Math.max(0, Math.min(1, value)) * (setting.weight / 100);
        });
    }
    /**
     * プリセットモーフのモーフィングを行う
     * @param label モーフ名
     * @param value 値(0〜1)
     */
    morphingPreset(label, value) {
        if (!this.presetMorphTargetMap[label]) {
            return;
        }
        this.presetMorphTargetMap[label].forEach((setting) => {
            setting.target.influence = Math.max(0, Math.min(1, value)) * (setting.weight / 100);
        });
    }
    /**
     * list morphing name
     */
    getMorphingList() {
        return Object.keys(this.morphTargetMap);
    }
    /**
     * 一人称時のカメラ位置を絶対座標として取得する
     *
     * firstPersonBone が未設定の場合は null を返す
     *
     * @returns 一人称時のカメラの現在における絶対座標
     */
    getFirstPersonCameraPosition() {
        const firstPersonBone = this.getFirstPersonBone();
        if (!firstPersonBone) {
            return null;
        }
        let basePos = firstPersonBone.getAbsolutePosition();
        const offsetPos = this.ext.firstPerson.firstPersonBoneOffset;
        return new external_BABYLON_namespaceObject.Vector3(basePos.x + offsetPos.x, basePos.y + offsetPos.y, basePos.z + offsetPos.z);
    }
    /**
     * 一人称時に頭とみなす TransformNode を取得する
     */
    getFirstPersonBone() {
        return this.findTransformNode(this.ext.firstPerson.firstPersonBone);
    }
    /**
     * Get HumanoidBone Methods
     */
    get humanoidBone() {
        return this._humanoidBone;
    }
    /**
     * VRM Root mesh
     *
     * Useful for Model Transformation
     */
    get rootMesh() {
        return this._rootMesh;
    }
    get rootSkeletonNode() {
        return this._rootSkeleton;
    }
    /**
     * node 番号から該当する TransformNode を探す
     * 数が多くなるのでキャッシュに参照を持つ構造にする
     * gltf の node 番号は `metadata.gltf.pointers` に記録されている
     * @param nodeIndex
     */
    findTransformNode(nodeIndex) {
        return this.transformNodeCache[nodeIndex] || null;
    }
    /**
     * mesh 番号からメッシュを探す
     * gltf の mesh 番号は `metadata.gltf.pointers` に記録されている
     */
    findMeshes(meshIndex) {
        return this.meshCache[meshIndex] || null;
    }
    /**
     * 事前に MorphTarget と BlendShape を紐付ける
     */
    constructMorphTargetMap() {
        if (!this.ext.blendShapeMaster || !this.ext.blendShapeMaster.blendShapeGroups) {
            return;
        }
        this.ext.blendShapeMaster.blendShapeGroups.forEach((g) => {
            if (!g.binds) {
                return;
            }
            g.binds.forEach((b) => {
                const meshes = this.findMeshes(b.mesh);
                if (!meshes) {
                    console.log(`Undefined BlendShapeBind Mesh`, b);
                    return;
                }
                meshes.forEach((mesh) => {
                    const morphTargetManager = mesh.morphTargetManager;
                    if (!morphTargetManager) {
                        console.log(`Undefined morphTargetManager`, b);
                        return;
                    }
                    const target = morphTargetManager.getTarget(b.index);
                    this.morphTargetMap[g.name] = this.morphTargetMap[g.name] || [];
                    this.morphTargetMap[g.name].push({
                        target,
                        weight: b.weight,
                    });
                    if (g.presetName) {
                        this.presetMorphTargetMap[g.presetName] = this.presetMorphTargetMap[g.presetName] || [];
                        this.presetMorphTargetMap[g.presetName].push({
                            target,
                            weight: b.weight,
                        });
                    }
                });
            });
            // TODO: materialValues
        });
    }
    /**
     * 事前に TransformNode と bone 名を紐づける
     */
    constructTransformNodeMap() {
        this.ext.humanoid.humanBones.forEach((b) => {
            const node = this.findTransformNode(b.node);
            if (!node) {
                return;
            }
            this.transformNodeMap[b.bone] = node;
        });
    }
    /**
     * node 番号と TransformNode を紐づける
     */
    constructTransformNodeCache() {
        const cache = {};
        for (let index = this.transformNodesFrom; index < this.scene.transformNodes.length; index++) {
            const node = this.scene.transformNodes[index];
            // ポインタが登録されていないものは省略
            if (!node || !node.metadata || !node.metadata.gltf || !node.metadata.gltf.pointers || node.metadata.gltf.pointers.length === 0) {
                continue;
            }
            for (const pointer of node.metadata.gltf.pointers) {
                if (pointer.startsWith('/nodes/')) {
                    const nodeIndex = parseInt(pointer.substr(7), 10);
                    cache[nodeIndex] = node;
                    break;
                }
            }
        }
        return cache;
    }
    /**
     * mesh 番号と Mesh を紐づける
     */
    constructMeshCache() {
        const cache = {};
        for (let index = this.meshesFrom; index < this.scene.meshes.length; index++) {
            const mesh = this.scene.meshes[index];
            if (mesh.id === '__root__') {
                this._rootMesh = mesh;
                continue;
            }
            // ポインタが登録されていないものは省略
            if (!mesh || !mesh.metadata || !mesh.metadata.gltf || !mesh.metadata.gltf.pointers || mesh.metadata.gltf.pointers.length === 0) {
                continue;
            }
            for (const pointer of mesh.metadata.gltf.pointers) {
                const match = pointer.match(/^\/meshes\/(\d+).+$/);
                if (match) {
                    const nodeIndex = parseInt(match[1], 10);
                    cache[nodeIndex] = cache[nodeIndex] || [];
                    cache[nodeIndex].push(mesh);
                    break;
                }
            }
        }
        return cache;
    }
}

;// CONCATENATED MODULE: ./node_modules/tslib/tslib.es6.js
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

;// CONCATENATED MODULE: ./src/shader/babylon-mtoon-material/src/inspectable-custom-properties.ts

/**
 * MToonMaterial に Inspector 上で調整可能なパラメータを設定する
 * @param material
 * @link https://doc.babylonjs.com/how_to/debug_layer#extensibility
 */
function getInspectableCustomProperties() {
    return [
        {
            label: 'DiffuseColor',
            propertyName: 'diffuseColor',
            type: external_BABYLON_namespaceObject.InspectableType.Color3,
        },
        {
            label: 'AmbientColor',
            propertyName: 'ambientColor',
            type: external_BABYLON_namespaceObject.InspectableType.Color3,
        },
        {
            label: 'EmissiveColor',
            propertyName: 'emissiveColor',
            type: external_BABYLON_namespaceObject.InspectableType.Color3,
        },
        {
            label: 'ShadeColor',
            propertyName: 'shadeColor',
            type: external_BABYLON_namespaceObject.InspectableType.Color3,
        },
        {
            label: 'RimColor',
            propertyName: 'rimColor',
            type: external_BABYLON_namespaceObject.InspectableType.Color3,
        },
        {
            label: 'OutlineColor',
            propertyName: 'outlineColor',
            type: external_BABYLON_namespaceObject.InspectableType.Color3,
        },
        {
            label: 'ReceiveShadowRate',
            propertyName: 'receiveShadowRate',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'ShadingGradeRate',
            propertyName: 'shadingGradeRate',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'ShadeShift',
            propertyName: 'shadeShift',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: -1,
            max: 1,
            step: 0.01,
        },
        {
            label: 'ShadeToony',
            propertyName: 'shadeToony',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'LightColorAttenuation',
            propertyName: 'lightColorAttenuation',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'IndirectLightIntensity',
            propertyName: 'indirectLightIntensity',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'RimLightingMix',
            propertyName: 'rimLightingMix',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'RimFresnelPower',
            propertyName: 'rimFresnelPower',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0.01,
            max: 100,
            step: 4,
        },
        {
            label: 'RimLift',
            propertyName: 'rimLift',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0.0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'OutlineWidth',
            propertyName: 'outlineWidth',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0.01,
            max: 1,
            step: 0.01,
        },
        {
            label: 'OutlineScaledMaxDistance',
            propertyName: 'outlineScaledMaxDistance',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 1.0,
            max: 10.0,
            step: 0.01,
        },
        {
            label: 'OutlineLightingMix',
            propertyName: 'outlineLightingMix',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'DebugMode',
            propertyName: 'debugMode',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 2,
            step: 1,
        },
        {
            label: 'OutlineWidthMode',
            propertyName: 'outlineWidthMode',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 2,
            step: 1,
        },
        {
            label: 'OutlineColorMode',
            propertyName: 'outlineColorMode',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 1,
        },
        {
            label: 'CullMode',
            propertyName: 'cullMode',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 2,
            step: 1,
        },
        {
            label: 'OutlineCullMode',
            propertyName: 'outlineCullMode',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 2,
            step: 1,
        },
        {
            label: 'AlphaCutOff',
            propertyName: 'alphaCutOff',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: 0,
            max: 1,
            step: 0.01,
        },
        {
            label: 'UV Animation Scroll X',
            propertyName: 'uvAnimationScrollX',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: -1,
            max: 1,
            step: 0.1,
        },
        {
            label: 'UV Animation Scroll Y',
            propertyName: 'uvAnimationScrollY',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: -1,
            max: 1,
            step: 0.1,
        },
        {
            label: 'UV Animation Rotation',
            propertyName: 'uvAnimationRotation',
            type: external_BABYLON_namespaceObject.InspectableType.Slider,
            min: -0.5,
            max: 0.5,
            step: 0.01,
        },
    ];
}

;// CONCATENATED MODULE: ./src/shader/babylon-mtoon-material/src/mtoon-material-defines.ts

/**
 * Material Defines
 */
class MToonMaterialDefines extends external_BABYLON_namespaceObject.MaterialDefines {
    /**
     * If the reflection texture on this material is in linear color space
     * @hidden
     */
    // public IS_REFLECTION_LINEAR = false;
    /**
     * If the refraction texture on this material is in linear color space
     * @hidden
     */
    // public IS_REFRACTION_LINEAR = false;
    // public EXPOSURE = false;
    constructor() {
        super();
        // MToon Specific
        this.MTOON_OUTLINE_WIDTH_WORLD = false;
        this.MTOON_OUTLINE_WIDTH_SCREEN = false;
        this.MTOON_OUTLINE_COLOR_FIXED = false;
        this.MTOON_OUTLINE_COLOR_MIXED = false;
        this.MTOON_DEBUG_NORMAL = false;
        this.MTOON_DEBUG_LITSHADERRATE = false;
        // MToon textures
        this.SHADE = false;
        this.SHADEDIRECTUV = 0;
        this.RECEIVE_SHADOW = false;
        this.RECEIVE_SHADOWDIRECTUV = 0;
        this.SHADING_GRADE = false;
        this.SHADING_GRADEDIRECTUV = 0;
        this.RIM = false;
        this.RIMDIRECTUV = 0;
        this.MATCAP = false;
        this.MATCAPDIRECTUV = 0;
        this.OUTLINE_WIDTH = false;
        this.OUTLINE_WIDTHDIRECTUV = 0;
        this.UV_ANIMATION_MASK = false;
        this.UV_ANIMATION_MASKDIRECTUV = 0;
        // Misc
        this.MAINUV1 = false;
        this.MAINUV2 = false;
        this.MAINUV3 = false;
        this.MAINUV4 = false;
        this.MAINUV5 = false;
        this.MAINUV6 = false;
        this.DIFFUSE = false;
        this.DIFFUSEDIRECTUV = 0;
        this.DETAIL = false;
        this.DETAILDIRECTUV = 0;
        this.DETAIL_NORMALBLENDMETHOD = 0;
        this.AMBIENT = false;
        this.AMBIENTDIRECTUV = 0;
        // public OPACITY = false;
        // public OPACITYDIRECTUV = 0;
        // public OPACITYRGB = false;
        // public REFLECTION = false;
        this.EMISSIVE = false;
        this.EMISSIVEDIRECTUV = 0;
        this.SPECULAR = false;
        // public SPECULARDIRECTUV = 0;
        this.BUMP = false;
        this.BUMPDIRECTUV = 0;
        // public PARALLAX = false;
        // public PARALLAXOCCLUSION = false;
        // public SPECULAROVERALPHA = false;
        this.CLIPPLANE = false;
        this.CLIPPLANE2 = false;
        this.CLIPPLANE3 = false;
        this.CLIPPLANE4 = false;
        this.CLIPPLANE5 = false;
        this.CLIPPLANE6 = false;
        this.ALPHATEST = false;
        this.DEPTHPREPASS = false;
        this.ALPHAFROMDIFFUSE = false;
        this.POINTSIZE = false;
        this.FOG = false;
        this.SPECULARTERM = false;
        // public DIFFUSEFRESNEL = false;
        // public OPACITYFRESNEL = false;
        // public REFLECTIONFRESNEL = false;
        // public REFRACTIONFRESNEL = false;
        // public EMISSIVEFRESNEL = false;
        // public FRESNEL = false;
        this.NORMAL = false;
        this.TANGENT = false;
        this.UV1 = false;
        this.UV2 = false;
        this.UV3 = false;
        this.UV4 = false;
        this.UV5 = false;
        this.UV6 = false;
        this.VERTEXCOLOR = false;
        this.VERTEXALPHA = false;
        this.NUM_BONE_INFLUENCERS = 0;
        this.BonesPerMesh = 0;
        this.BONETEXTURE = false;
        this.BONES_VELOCITY_ENABLED = false;
        this.INSTANCES = false;
        this.THIN_INSTANCES = false;
        // public GLOSSINESS = false;
        // public ROUGHNESS = false;
        this.EMISSIVEASILLUMINATION = false;
        this.LINKEMISSIVEWITHDIFFUSE = false;
        // public REFLECTIONFRESNELFROMSPECULAR = false;
        // public LIGHTMAP = false;
        // public LIGHTMAPDIRECTUV = 0;
        this.OBJECTSPACE_NORMALMAP = false;
        // public USELIGHTMAPASSHADOWMAP = false;
        // public REFLECTIONMAP_3D = false;
        // public REFLECTIONMAP_SPHERICAL = false;
        // public REFLECTIONMAP_PLANAR = false;
        // public REFLECTIONMAP_CUBIC = false;
        // public USE_LOCAL_REFLECTIONMAP_CUBIC = false;
        // public USE_LOCAL_REFRACTIONMAP_CUBIC = false;
        // public REFLECTIONMAP_PROJECTION = false;
        // public REFLECTIONMAP_SKYBOX = false;
        // public REFLECTIONMAP_EXPLICIT = false;
        // public REFLECTIONMAP_EQUIRECTANGULAR = false;
        // public REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
        // public REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
        // public REFLECTIONMAP_OPPOSITEZ = false;
        // public INVERTCUBICMAP = false;
        this.LOGARITHMICDEPTH = false;
        // public REFRACTION = false;
        // public REFRACTIONMAP_3D = false;
        // public REFLECTIONOVERALPHA = false;
        this.TWOSIDEDLIGHTING = false;
        this.SHADOWFLOAT = false;
        this.MORPHTARGETS = false;
        this.MORPHTARGETS_NORMAL = false;
        this.MORPHTARGETS_TANGENT = false;
        this.MORPHTARGETS_UV = false;
        this.NUM_MORPH_INFLUENCERS = 0;
        this.MORPHTARGETS_TEXTURE = false;
        this.NONUNIFORMSCALING = false; // https://playground.babylonjs.com#V6DWIH
        this.PREMULTIPLYALPHA = false; // https://playground.babylonjs.com#LNVJJ7
        this.ALPHATEST_AFTERALLALPHACOMPUTATIONS = false;
        this.ALPHABLEND = true;
        // public PREPASS = false;
        // public PREPASS_IRRADIANCE = false;
        // public PREPASS_IRRADIANCE_INDEX = -1;
        // public PREPASS_ALBEDO = false;
        // public PREPASS_ALBEDO_INDEX = -1;
        // public PREPASS_DEPTH = false;
        // public PREPASS_DEPTH_INDEX = -1;
        // public PREPASS_NORMAL = false;
        // public PREPASS_NORMAL_INDEX = -1;
        // public PREPASS_POSITION = false;
        // public PREPASS_POSITION_INDEX = -1;
        // public PREPASS_VELOCITY = false;
        // public PREPASS_VELOCITY_INDEX = -1;
        // public PREPASS_REFLECTIVITY = false;
        // public PREPASS_REFLECTIVITY_INDEX = -1;
        // public SCENE_MRT_COUNT = 0;
        // public RGBDLIGHTMAP = false;
        // public RGBDREFLECTION = false;
        // public RGBDREFRACTION = false;
        // public IMAGEPROCESSING = false;
        // public VIGNETTE = false;
        // public VIGNETTEBLENDMODEMULTIPLY = false;
        // public VIGNETTEBLENDMODEOPAQUE = false;
        // public TONEMAPPING = false;
        // public TONEMAPPING_ACES = false;
        // public CONTRAST = false;
        // public COLORCURVES = false;
        // public COLORGRADING = false;
        // public COLORGRADING3D = false;
        // public SAMPLER3DGREENDEPTH = false;
        // public SAMPLER3DBGRMAP = false;
        // public IMAGEPROCESSINGPOSTPROCESS = false;
        this.MULTIVIEW = false;
        this.rebuild();
    }
    setReflectionMode(modeToEnable) {
        // var modes = [
        //     "REFLECTIONMAP_CUBIC", "REFLECTIONMAP_EXPLICIT", "REFLECTIONMAP_PLANAR",
        //     "REFLECTIONMAP_PROJECTION", "REFLECTIONMAP_PROJECTION", "REFLECTIONMAP_SKYBOX",
        //     "REFLECTIONMAP_SPHERICAL", "REFLECTIONMAP_EQUIRECTANGULAR", "REFLECTIONMAP_EQUIRECTANGULAR_FIXED",
        //     "REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED"
        // ];
        //
        // for (var mode of modes) {
        //     (<any>this)[mode] = (mode === modeToEnable);
        // }
        throw new Error('This material cannot use `setReflectionMode`');
    }
}

;// CONCATENATED MODULE: ./src/shader/babylon-mtoon-material/src/mtoon-outline-renderer.ts



const BASE_NAME = 'MToonOutline';
/**
 * MToonMaterial を別のパスで描画するレンダラ
 * @see OutlineRenderer
 */
class MToonOutlineRenderer {
    /**
     * @inheritdoc
     * MToonMaterial ごとにインスタンスを生成する
     */
    constructor(scene, material) {
        this.scene = scene;
        this.material = material;
        this._savedDepthWrite = false;
        this.name = `${BASE_NAME}_${material.name}_${MToonOutlineRenderer.rendererId++}`;
        this.scene._addComponent(this);
        this._engine = this.scene.getEngine();
    }
    /**
     * @inheritdoc
     * シーン描画前後にレンダリング処理を登録する
     */
    register() {
        this.scene._beforeRenderingMeshStage.registerStep(external_BABYLON_namespaceObject.SceneComponentConstants.STEP_BEFORERENDERINGMESH_OUTLINE, this, this._beforeRenderingMesh);
        this.scene._afterRenderingMeshStage.registerStep(external_BABYLON_namespaceObject.SceneComponentConstants.STEP_AFTERRENDERINGMESH_OUTLINE, this, this._afterRenderingMesh);
    }
    /**
     * @inheritdoc
     */
    rebuild() {
        // Nothing to do here.
    }
    /**
     * @inheritdoc
     */
    dispose() {
        // Nothing to do here
    }
    /**
     * アウトラインを描画する
     */
    render(mesh, subMesh, batch, useOverlay = false) {
        const effect = subMesh.effect;
        if (!effect || !effect.isReady() || !this.scene.activeCamera) {
            return;
        }
        const ownerMesh = subMesh.getMesh();
        const replacementMesh = ownerMesh._internalAbstractMeshDataInfo._actAsRegularMesh ? ownerMesh : null;
        const renderingMesh = subMesh.getRenderingMesh();
        const effectiveMesh = replacementMesh ? replacementMesh : renderingMesh;
        const storedCullMode = this.material.cullMode;
        this.material.cullMode = this.material.outlineCullMode;
        this._engine.enableEffect(effect);
        renderingMesh._bind(subMesh, effect, this.material.fillMode);
        this._engine.setZOffset(-1);
        // レンダリング実行
        if (external_BABYLON_namespaceObject.Engine.Version.startsWith('4.0') || external_BABYLON_namespaceObject.Engine.Version.startsWith('4.1')) {
            // for 4.0, 4.1
            renderingMesh._processRendering(subMesh, effect, this.material.fillMode, batch, this.isHardwareInstancedRendering(subMesh, batch), (isInstance, world, effectiveMaterial) => {
                effectiveMaterial.bindForSubMesh(world, mesh, subMesh);
                effect.setMatrix('world', world);
                effect.setFloat('isOutline', 1.0);
            }, this.material);
        }
        else {
            // for 4.2.0-alpha.0 +
            renderingMesh._processRendering(effectiveMesh, subMesh, effect, this.material.fillMode, batch, this.isHardwareInstancedRendering(subMesh, batch), (isInstance, world, effectiveMaterial) => {
                effectiveMaterial.bindForSubMesh(world, mesh, subMesh);
                effect.setMatrix('world', world);
                effect.setFloat('isOutline', 1.0);
            }, this.material);
        }
        this._engine.setZOffset(0);
        this.material.cullMode = storedCullMode;
    }
    /**
     * このメッシュを描画する前に実行されるコールバック
     */
    _beforeRenderingMesh(mesh, subMesh, batch) {
        this._savedDepthWrite = this._engine.getDepthWrite();
        if (!this.willRender(subMesh)) {
            return;
        }
        const material = subMesh.getMaterial();
        if (material.needAlphaBlendingForMesh(mesh)) {
            this._engine.cacheStencilState();
            // Draw only to stencil buffer for the original mesh
            // The resulting stencil buffer will be used so the outline is not visible inside the mesh when the mesh is transparent
            this._engine.setDepthWrite(false);
            this._engine.setColorWrite(false);
            this._engine.setStencilBuffer(true);
            this._engine.setStencilOperationPass(external_BABYLON_namespaceObject.Constants.REPLACE);
            this._engine.setStencilFunction(external_BABYLON_namespaceObject.Constants.ALWAYS);
            this._engine.setStencilMask(MToonOutlineRenderer._StencilReference);
            this._engine.setStencilFunctionReference(MToonOutlineRenderer._StencilReference);
            this.render(subMesh.getRenderingMesh(), subMesh, batch, /* This sets offset to 0 */ true);
            this._engine.setColorWrite(true);
            this._engine.setStencilFunction(external_BABYLON_namespaceObject.Constants.NOTEQUAL);
        }
        // 深度ナシで後ろに描画
        this._engine.setDepthWrite(false);
        this.render(subMesh.getRenderingMesh(), subMesh, batch);
        this._engine.setDepthWrite(this._savedDepthWrite);
        if (material.needAlphaBlendingForMesh(mesh)) {
            this._engine.restoreStencilState();
        }
    }
    /**
     * このメッシュを描画した後に実行されるコールバック
     */
    _afterRenderingMesh(mesh, subMesh, batch) {
        if (!this.willRender(subMesh)) {
            return;
        }
        if (this._savedDepthWrite) {
            // 深度アリで再度書き込む
            this._engine.setDepthWrite(true);
            this._engine.setColorWrite(false);
            this.render(subMesh.getRenderingMesh(), subMesh, batch);
            this._engine.setColorWrite(true);
        }
    }
    /**
     * インスタンシングを行うかどうか
     */
    isHardwareInstancedRendering(subMesh, batch) {
        if (!this._engine.getCaps().instancedArrays) {
            return false;
        }
        let hasThinInstances = false;
        // from 4.2.0
        hasThinInstances = subMesh.getRenderingMesh().hasThinInstances;
        return (batch.visibleInstances[subMesh._id] !== null)
            && (typeof batch.visibleInstances[subMesh._id] !== 'undefined')
            || hasThinInstances;
    }
    /**
    * このメッシュでアウトラインを描画するかどうか
    */
    willRender(subMesh) {
        const material = subMesh.getMaterial();
        if (!material || material.getClassName() !== 'MToonMaterial' || material.getOutlineRendererName() !== this.name) {
            // このコンポーネントの Material ではない
            return false;
        }
        return true;
    }
}
/**
 * Stencil value used to avoid outline being seen within the mesh when the mesh is transparent
 */
MToonOutlineRenderer._StencilReference = 0x04;
MToonOutlineRenderer.rendererId = 0;

;// CONCATENATED MODULE: ./src/shader/babylon-mtoon-material/src/mtoon-material.ts

















// シェーダ文字列を取得
const UboDeclaration = __webpack_require__(463);
const VertexDeclaration = __webpack_require__(486);
const FragmentDeclaration = __webpack_require__(477);
const BumpFragment = __webpack_require__(677);
const LightFragment = __webpack_require__(649);
const VertexShader = __webpack_require__(854);
const FragmentShader = __webpack_require__(483);
/**
 * デバッグモード
 */
var DebugMode;
(function (DebugMode) {
    DebugMode[DebugMode["None"] = 0] = "None";
    DebugMode[DebugMode["Normal"] = 1] = "Normal";
    DebugMode[DebugMode["LitShadeRate"] = 2] = "LitShadeRate";
})(DebugMode || (DebugMode = {}));
/**
 * アウトラインカラーモード
 */
var OutlineColorMode;
(function (OutlineColorMode) {
    OutlineColorMode[OutlineColorMode["FixedColor"] = 0] = "FixedColor";
    OutlineColorMode[OutlineColorMode["MixedLighting"] = 1] = "MixedLighting";
})(OutlineColorMode || (OutlineColorMode = {}));
/**
 * アウトライン幅モード
 */
var OutlineWidthMode;
(function (OutlineWidthMode) {
    OutlineWidthMode[OutlineWidthMode["None"] = 0] = "None";
    OutlineWidthMode[OutlineWidthMode["WorldCorrdinates"] = 1] = "WorldCorrdinates";
    OutlineWidthMode[OutlineWidthMode["ScreenCoordinates"] = 2] = "ScreenCoordinates";
})(OutlineWidthMode || (OutlineWidthMode = {}));
/**
 * Cull モード
 */
var CullMode;
(function (CullMode) {
    CullMode[CullMode["Off"] = 0] = "Off";
    CullMode[CullMode["Front"] = 1] = "Front";
    CullMode[CullMode["Back"] = 2] = "Back";
})(CullMode || (CullMode = {}));
const onCreatedEffectParameters = { effect: null, subMesh: null };
/**
 * MToonMaterial
 *
 * MToon は日本のアニメ的表現をすることを目標としています。
 * 主色 (Lit Color) と陰色 (Shade Color) の 2 色を、Lighting パラメータや光源環境に応じて混合することでそれを実現します。
 * VRM での出力パラメータとプロパティのマッピングは下記となります。
 *
 * @link https://github.com/Santarh/MToon/
 * @link https://vrm.dev/univrm/shaders/mtoon/
 */
class MToonMaterial extends external_BABYLON_namespaceObject.PushMaterial {
    //#endregion
    //#endregion
    /**
     * Instantiates a new MToon material.
     * @see https://vrm.dev/en/docs/univrm/shaders/shader_mtoon/
     * @param name Define the name of the material in the scene
     * @param scene Define the scene the material belong to
     */
    constructor(name, scene) {
        super(name, scene);
        //#region Properties
        //#region Textures
        this._diffuseTexture = null;
        this._ambientTexture = null;
        this._emissiveTexture = null;
        this._specularTexture = null;
        this._bumpTexture = null;
        this._shadeTexture = null;
        this._receiveShadowTexture = null;
        this._shadingGradeTexture = null;
        this._rimTexture = null;
        this._matCapTexture = null;
        this._outlineWidthTexture = null;
        this._uvAnimationMaskTexture = null;
        //#endregion
        //#region Colors
        /**
         * The color of the material lit by the environmental background lighting.
         * @see https://doc.babylonjs.com/babylon101/materials#ambient-color-example
         */
        this.ambientColor = new external_BABYLON_namespaceObject.Color3(0, 0, 0);
        /**
         * The basic color of the material as viewed under a light.
         */
        this.diffuseColor = new external_BABYLON_namespaceObject.Color3(1, 1, 1);
        /**
         * Define how the color and intensity of the highlight given by the light in the material.
         */
        this.specularColor = new external_BABYLON_namespaceObject.Color3(1, 1, 1);
        /**
         * Define the color of the material as if self lit.
         * This will be mixed in the final result even in the absence of light.
         */
        this.emissiveColor = new external_BABYLON_namespaceObject.Color3(0, 0, 0);
        /**
         * shadeTexture に乗算される色
         */
        this.shadeColor = new external_BABYLON_namespaceObject.Color3(0.97, 0.81, 0.86);
        /**
         * Rim の色
         */
        this.rimColor = new external_BABYLON_namespaceObject.Color3(0, 0, 0);
        /**
         * アウトラインの色
         */
        this.outlineColor = new external_BABYLON_namespaceObject.Color3(0, 0, 0);
        //#endregion
        //#region babylon parameters
        /**
         * Defines how sharp are the highlights in the material.
         * The bigger the value the sharper giving a more glossy feeling to the result.
         * Reversely, the smaller the value the blurrier giving a more rough feeling to the result.
         */
        this.specularPower = 64;
        this._useAlphaFromDiffuseTexture = true;
        this._useEmissiveAsIllumination = false;
        this._linkEmissiveWithDiffuse = false;
        this._useSpecularOverAlpha = false;
        this._disableLighting = false;
        this._useObjectSpaceNormalMap = false;
        this._useParallax = false;
        this._useParallaxOcclusion = false;
        /**
         * Defines the alpha limits in alpha test mode.
         */
        this.alphaCutOff = 0.4;
        this._useGlossinessFromSpecularMapAlpha = false;
        this._maxSimultaneousLights = 16;
        this._twoSidedLighting = false;
        /**
         * 頂点カラー非対応
         */
        this.useVertexColor = false;
        /**
         * シェーダボーンは利用可能
         */
        this.useBones = true;
        /**
         * シェーダモーフターゲットは利用可能
         */
        this.useMorphTargets = true;
        /**
         * 頂点アルファは非対応
         */
        this.useVertexAlpha = false;
        /**
         * Defines the detail map parameters for the material.
         */
        this.detailMap = new external_BABYLON_namespaceObject.DetailMapConfiguration(this._markAllSubMeshesAsTexturesDirty.bind(this));
        this._worldViewProjectionMatrix = external_BABYLON_namespaceObject.Matrix.Zero();
        this._globalAmbientColor = new external_BABYLON_namespaceObject.Color3(0, 0, 0);
        //#endregion
        //#region MToon parameters
        this._bumpScale = 0.1;
        /**
         * Apply a scaling factor that determine which "depth" the height map should reprensent. A value between 0.05 and 0.1 is reasonnable in Parallax, you can reach 0.2 using Parallax Occlusion.
         */
        this.parallaxScaleBias = this._bumpScale;
        this._receiveShadowRate = 1;
        this._shadingGradeRate = 1;
        this._shadeShift = 0;
        this._shadeToony = 0.9;
        this._lightColorAttenuation = 0;
        this._indirectLightIntensity = 0.1;
        this._rimLightingMix = 0;
        this._rimFresnelPower = 1;
        this._rimLift = 0;
        this._outlineWidth = 0.5;
        this._outlineScaledMaxDistance = 1;
        this._outlineLightingMix = 1;
        this._uvAnimationScrollX = 0;
        this._uvAnimationScrollY = 0;
        this._uvAnimationRotation = 0;
        this._debugMode = DebugMode.None;
        /** @hidden */
        this.debugMode = DebugMode.None;
        /**
         * MToon Outline Renderer
         * @private
         */
        this.outlineRenderer = new MToonOutlineRenderer(this.getScene(), this);
        this._outlineWidthMode = OutlineWidthMode.None;
        this.outlineWidthMode = OutlineWidthMode.None;
        this._outlineColorMode = OutlineColorMode.MixedLighting;
        this.outlineColorMode = OutlineColorMode.MixedLighting;
        this._cullMode = CullMode.Back;
        this._outlineCullMode = CullMode.Front;
        this.outlineCullMode = CullMode.Front;
        this.storedCullMode = CullMode.Back;
        this.prePassConfiguration = new external_BABYLON_namespaceObject.PrePassConfiguration();
        // シェーダストアに登録する
        if (!external_BABYLON_namespaceObject.Effect.ShadersStore.mtoonVertexShader || !external_BABYLON_namespaceObject.Effect.ShadersStore.mtoonFragmentShader) {
            external_BABYLON_namespaceObject.Effect.IncludesShadersStore.mtoonUboDeclaration = UboDeclaration;
            external_BABYLON_namespaceObject.Effect.IncludesShadersStore.mtoonVertexDeclaration = VertexDeclaration;
            external_BABYLON_namespaceObject.Effect.IncludesShadersStore.mtoonFragmentDeclaration = FragmentDeclaration;
            external_BABYLON_namespaceObject.Effect.IncludesShadersStore.mtoonLightFragment = LightFragment;
            external_BABYLON_namespaceObject.Effect.IncludesShadersStore.mtoonBumpFragment = BumpFragment;
            external_BABYLON_namespaceObject.Effect.ShadersStore.mtoonVertexShader = VertexShader;
            external_BABYLON_namespaceObject.Effect.ShadersStore.mtoonFragmentShader = FragmentShader;
        }
        // Append custom inspectors
        this.inspectableCustomProperties = this.inspectableCustomProperties ?
            this.inspectableCustomProperties.concat(getInspectableCustomProperties())
            : getInspectableCustomProperties();
    }
    /**
     * アクティブなテクスチャ参照の一覧
     */
    appendedActiveTextures() {
        return [
            this._diffuseTexture,
            this._ambientTexture,
            this._emissiveTexture,
            this._specularTexture,
            this._bumpTexture,
            this._shadeTexture,
            this._receiveShadowTexture,
            this._shadingGradeTexture,
            this._rimTexture,
            this._matCapTexture,
            this._outlineWidthTexture,
            this._uvAnimationMaskTexture,
        ].filter((t) => t !== null);
    }
    /**
     * Can this material render to prepass
     */
    get isPrePassCapable() {
        return true;
    }
    get canRenderToMRT() {
        return false;
    }
    get cullMode() {
        return this._cullMode;
    }
    set cullMode(value) {
        this._cullMode = value;
        switch (this._cullMode) {
            case CullMode.Off:
                // 両面を描画する
                this.backFaceCulling = false;
                this.sideOrientation = external_BABYLON_namespaceObject.Material.ClockWiseSideOrientation;
                this.twoSidedLighting = true;
                break;
            case CullMode.Front:
                // 表面を描画しない(=裏面だけ描画する)
                this.backFaceCulling = true;
                this.sideOrientation = external_BABYLON_namespaceObject.Material.CounterClockWiseSideOrientation;
                this.twoSidedLighting = false;
                break;
            case CullMode.Back:
                // 裏面を描画しない(=表面だけ描画する) デフォルト
                this.backFaceCulling = true;
                this.sideOrientation = external_BABYLON_namespaceObject.Material.ClockWiseSideOrientation;
                this.twoSidedLighting = false;
                break;
        }
        this.markAsDirty(external_BABYLON_namespaceObject.Material.TextureDirtyFlag);
    }
    /**
     * アウトライン用 CullMode を設定
     * @hidden
     */
    applyOutlineCullMode() {
        this.storedCullMode = this.cullMode;
        this.cullMode = this._outlineCullMode;
    }
    /**
     * CullMode をリストア
     * @hidden
     */
    restoreOutlineCullMode() {
        this.cullMode = this.storedCullMode;
    }
    /**
     * @hidden
     */
    getOutlineRendererName() {
        return this.outlineRenderer ? this.outlineRenderer.name : "";
    }
    /**
     * Gets the current class name of the material e.g. "StandardMaterial"
     * Mainly use in serialization.
     * @returns the class name
     */
    getClassName() {
        return "MToonMaterial";
    }
    /**
     * In case the depth buffer does not allow enough depth precision for your scene (might be the case in large scenes)
     * You can try switching to logarithmic depth.
     * @see https://doc.babylonjs.com/how_to/using_logarithmic_depth_buffer
     */
    get useLogarithmicDepth() {
        return this._useLogarithmicDepth;
    }
    set useLogarithmicDepth(value) {
        this._useLogarithmicDepth = value && this.getScene().getEngine().getCaps().fragmentDepthSupported;
        this._markAllSubMeshesAsMiscDirty();
    }
    /**
     * Specifies if the material will require alpha blending
     * @returns a boolean specifying if alpha blending is needed
     */
    needAlphaBlending() {
        if (this._disableAlphaBlending) {
            return false;
        }
        return (this.alpha < 1.0) || this._shouldUseAlphaFromDiffuseTexture();
    }
    /**
     * Specifies if this material should be rendered in alpha test mode
     * @returns a boolean specifying if an alpha test is needed.
     */
    needAlphaTesting() {
        if (this._forceAlphaTest) {
            return true;
        }
        return this._hasAlphaChannel() && (this._transparencyMode == null || this._transparencyMode === external_BABYLON_namespaceObject.Material.MATERIAL_ALPHATEST);
    }
    /**
     * Specifies whether or not the alpha value of the diffuse texture should be used for alpha blending.
     */
    _shouldUseAlphaFromDiffuseTexture() {
        return this._diffuseTexture !== null && this._diffuseTexture.hasAlpha && this._useAlphaFromDiffuseTexture && this._transparencyMode !== external_BABYLON_namespaceObject.Material.MATERIAL_OPAQUE;
    }
    /**
     * Specifies whether or not there is a usable alpha channel for transparency.
     */
    _hasAlphaChannel() {
        return (this._diffuseTexture !== null && this._diffuseTexture.hasAlpha);
    }
    /**
     * Get the texture used for alpha test purpose.
     * @returns the diffuse texture in case of the standard material.
     */
    getAlphaTestTexture() {
        return this._diffuseTexture;
    }
    /**
     * Get if the submesh is ready to be used and all its information available.
     * Child classes can use it to update shaders
     * @param mesh defines the mesh to check
     * @param subMesh defines which submesh to check
     * @param useInstances specifies that instances should be used
     * @returns a boolean indicating that the submesh is ready or not
     */
    isReadyForSubMesh(mesh, subMesh, useInstances = false) {
        if (subMesh.effect && this.isFrozen) {
            if (subMesh.effect._wasPreviouslyReady) {
                return true;
            }
        }
        if (!subMesh._materialDefines) {
            subMesh.materialDefines = new MToonMaterialDefines();
        }
        const scene = this.getScene();
        const defines = subMesh._materialDefines;
        if (this._isReadyForSubMesh(subMesh)) {
            return true;
        }
        const engine = scene.getEngine();
        // Lights
        defines._needNormals = external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting) || (this.outlineWidthMode !== OutlineWidthMode.None);
        // Multiview
        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMultiview(scene, defines);
        // PrePass
        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForPrePass(scene, defines, this.canRenderToMRT);
        // Textures
        if (defines._areTexturesDirty) {
            this.applyDefines(defines);
            defines._needUVs = false;
            for (let i = 1; i <= external_BABYLON_namespaceObject.Constants.MAX_SUPPORTED_UV_SETS; ++i) {
                defines["MAINUV" + i] = false;
            }
            if (scene.texturesEnabled) {
                if (this._diffuseTexture && MToonMaterial.DiffuseTextureEnabled) {
                    if (!this._diffuseTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._diffuseTexture, defines, "DIFFUSE");
                    }
                }
                else {
                    defines.DIFFUSE = false;
                }
                if (this._ambientTexture && MToonMaterial.AmbientTextureEnabled) {
                    if (!this._ambientTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._ambientTexture, defines, "AMBIENT");
                    }
                }
                else {
                    defines.AMBIENT = false;
                }
                if (this._emissiveTexture && MToonMaterial.EmissiveTextureEnabled) {
                    if (!this._emissiveTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._emissiveTexture, defines, "EMISSIVE");
                    }
                }
                else {
                    defines.EMISSIVE = false;
                }
                if (this._specularTexture && MToonMaterial.SpecularTextureEnabled) {
                    if (!this._specularTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._specularTexture, defines, "SPECULAR");
                        defines.GLOSSINESS = this._useGlossinessFromSpecularMapAlpha;
                    }
                }
                else {
                    defines.SPECULAR = false;
                }
                if (scene.getEngine().getCaps().standardDerivatives && this._bumpTexture) {
                    // Bump texture can not be not blocking.
                    if (!this._bumpTexture.isReady()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._bumpTexture, defines, "BUMP");
                        defines.PARALLAX = this._useParallax;
                        defines.PARALLAXOCCLUSION = this._useParallaxOcclusion;
                    }
                    defines.OBJECTSPACE_NORMALMAP = this._useObjectSpaceNormalMap;
                }
                else {
                    defines.BUMP = false;
                }
                if (this._shadeTexture) {
                    if (!this._shadeTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._shadeTexture, defines, "SHADE");
                    }
                }
                else {
                    defines.SHADE = false;
                }
                if (this._receiveShadowTexture) {
                    if (!this._receiveShadowTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._receiveShadowTexture, defines, "RECEIVE_SHADOW");
                    }
                }
                else {
                    defines.RECEIVE_SHADOW = false;
                }
                if (this._shadingGradeTexture) {
                    if (!this._shadingGradeTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._shadingGradeTexture, defines, "SHADING_GRADE");
                    }
                }
                else {
                    defines.SHADING_GRADE = false;
                }
                if (this._rimTexture) {
                    if (!this._rimTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._rimTexture, defines, "RIM");
                    }
                }
                else {
                    defines.RIM = false;
                }
                if (this._matCapTexture) {
                    if (!this._matCapTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._matCapTexture, defines, "MATCAP");
                    }
                }
                else {
                    defines.MATCAP = false;
                }
                if (this._outlineWidthTexture) {
                    if (!this._outlineWidthTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._outlineWidthTexture, defines, "OUTLINE_WIDTH");
                    }
                }
                else {
                    defines.OUTLINE_WIDTH = false;
                }
                if (this._uvAnimationMaskTexture) {
                    if (!this._uvAnimationMaskTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMergedUV(this._uvAnimationMaskTexture, defines, "UV_ANIMATION_MASK");
                    }
                }
                else {
                    defines.UV_ANIMATION_MASK = false;
                }
                defines.TWOSIDEDLIGHTING = !this._backFaceCulling && this._twoSidedLighting;
            }
            else {
                defines.DIFFUSE = false;
                defines.AMBIENT = false;
                defines.EMISSIVE = false;
                defines.BUMP = false;
                defines.SHADE = false;
                defines.RECEIVE_SHADOW = false;
                defines.SHADING_GRADE = false;
                defines.RIM = false;
                defines.MATCAP = false;
                defines.OUTLINE_WIDTH = false;
                defines.UV_ANIMATION_MASK = false;
            }
            defines.ALPHAFROMDIFFUSE = this._shouldUseAlphaFromDiffuseTexture();
            defines.EMISSIVEASILLUMINATION = this._useEmissiveAsIllumination;
            defines.LINKEMISSIVEWITHDIFFUSE = this._linkEmissiveWithDiffuse;
            defines.SPECULAROVERALPHA = this._useSpecularOverAlpha;
            defines.PREMULTIPLYALPHA = (this.alphaMode === external_BABYLON_namespaceObject.Constants.ALPHA_PREMULTIPLIED || this.alphaMode === external_BABYLON_namespaceObject.Constants.ALPHA_PREMULTIPLIED_PORTERDUFF);
            defines.ALPHATEST_AFTERALLALPHACOMPUTATIONS = this.transparencyMode !== null;
            defines.ALPHABLEND = this.transparencyMode === null || this.needAlphaBlendingForMesh(mesh); // check on null for backward compatibility
        }
        if (!this.detailMap.isReadyForSubMesh(defines, scene)) {
            return false;
        }
        // Misc.
        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, this._shouldTurnAlphaTestOn(mesh) || this._forceAlphaTest, defines);
        // Attribs
        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForAttributes(mesh, defines, this.useVertexColor, this.useBones, this.useMorphTargets, this.useVertexAlpha);
        // Values that need to be evaluated on every frame
        external_BABYLON_namespaceObject.MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances, null, subMesh.getRenderingMesh().hasThinInstances);
        // External config
        this.detailMap.prepareDefines(defines, scene);
        // Get correct effect
        if (defines.isDirty) {
            const lightDisposed = defines._areLightsDisposed;
            defines.markAsProcessed();
            // Fallbacks
            const fallbacks = new external_BABYLON_namespaceObject.EffectFallbacks();
            if (defines.SPECULAR) {
                fallbacks.addFallback(0, "SPECULAR");
            }
            if (defines.BUMP) {
                fallbacks.addFallback(0, "BUMP");
            }
            if (defines.PARALLAX) {
                fallbacks.addFallback(1, "PARALLAX");
            }
            if (defines.PARALLAXOCCLUSION) {
                fallbacks.addFallback(0, "PARALLAXOCCLUSION");
            }
            if (defines.SPECULAROVERALPHA) {
                fallbacks.addFallback(0, "SPECULAROVERALPHA");
            }
            if (defines.FOG) {
                fallbacks.addFallback(1, "FOG");
            }
            if (defines.POINTSIZE) {
                fallbacks.addFallback(0, "POINTSIZE");
            }
            if (defines.LOGARITHMICDEPTH) {
                fallbacks.addFallback(0, "LOGARITHMICDEPTH");
            }
            external_BABYLON_namespaceObject.MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this._maxSimultaneousLights);
            if (defines.SPECULARTERM) {
                fallbacks.addFallback(0, "SPECULARTERM");
            }
            if (defines.MULTIVIEW) {
                fallbacks.addFallback(0, "MULTIVIEW");
            }
            // Attributes
            const attribs = [external_BABYLON_namespaceObject.VertexBuffer.PositionKind];
            if (defines.NORMAL) {
                attribs.push(external_BABYLON_namespaceObject.VertexBuffer.NormalKind);
            }
            if (defines.TANGENT) {
                attribs.push(external_BABYLON_namespaceObject.VertexBuffer.TangentKind);
            }
            for (let i = 1; i <= external_BABYLON_namespaceObject.Constants.MAX_SUPPORTED_UV_SETS; ++i) {
                if (defines["UV" + i]) {
                    attribs.push(`uv${i === 1 ? "" : i}`);
                }
            }
            if (defines.VERTEXCOLOR) {
                attribs.push(external_BABYLON_namespaceObject.VertexBuffer.ColorKind);
            }
            external_BABYLON_namespaceObject.MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
            external_BABYLON_namespaceObject.MaterialHelper.PrepareAttributesForInstances(attribs, defines);
            external_BABYLON_namespaceObject.MaterialHelper.PrepareAttributesForMorphTargets(attribs, mesh, defines);
            let shaderName = "mtoon";
            const uniforms = ["world", "view", "viewProjection", "vEyePosition", "vLightsType",
                "vAmbientColor", "vDiffuseColor", "vSpecularColor", "vEmissiveColor", "visibility",
                "vFogInfos", "vFogColor", "pointSize",
                "vDiffuseInfos", "vAmbientInfos", "vEmissiveInfos", "vSpecularInfos", "vBumpInfos",
                "mBones",
                "vClipPlane", "vClipPlane2", "vClipPlane3", "vClipPlane4", "vClipPlane5", "vClipPlane6",
                "diffuseMatrix", "ambientMatrix", "emissiveMatrix", "specularMatrix", "bumpMatrix",
                "logarithmicDepthConstant", "vTangentSpaceParams", "alphaCutOff", "boneTextureWidth",
                "vShadeColor", "vShadeInfos", "shadeMatrix",
                "vReceiveShadowInfos", "receiveShadowMatrix",
                "vShadingGradeInfos", "shadingGradeMatrix",
                "vRimColor", "vRimInfos", "RimMatrix",
                "vMatCapInfos", "MatCapMatrix",
                "vOutlineColor", "vOutlineWidthInfos", "outlineWidthMatrix",
                "aspect", "isOutline",
                "shadingGradeRate", "receiveShadowRate", "shadeShift", "shadeToony",
                "rimLightingMix", "rimFresnelPower", "rimLift",
                "lightColorAttenuation", "indirectLightIntensity",
                "outlineWidth", "outlineScaledMaxDistance", "outlineLightingMix",
                "uvAnimationScrollX", "uvAnimationScrollY", "uvAnimationRotation",
                "vEyeUp", "time",
                "morphTargetTextureInfo", "morphTargetTextureIndices"
            ];
            const samplers = ["diffuseSampler", "ambientSampler", "emissiveSampler",
                "specularSampler", "bumpSampler", "boneSampler",
                "shadeSampler", "receiveShadowSampler", "shadingGradeSampler",
                "rimSampler", "matCapSampler", "outlineWidthSampler",
                "uvAnimationMaskSampler", "morphTargets",
            ];
            const uniformBuffers = ["Material", "Scene"];
            external_BABYLON_namespaceObject.DetailMapConfiguration.AddUniforms(uniforms);
            external_BABYLON_namespaceObject.DetailMapConfiguration.AddSamplers(samplers);
            external_BABYLON_namespaceObject.PrePassConfiguration.AddUniforms(uniforms);
            external_BABYLON_namespaceObject.PrePassConfiguration.AddSamplers(samplers);
            external_BABYLON_namespaceObject.MaterialHelper.PrepareUniformsAndSamplersList({
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: defines,
                maxSimultaneousLights: this._maxSimultaneousLights
            });
            const csnrOptions = {};
            if (this.customShaderNameResolve) {
                shaderName = this.customShaderNameResolve(shaderName, uniforms, uniformBuffers, samplers, defines, attribs, csnrOptions);
            }
            const join = defines.toString();
            const previousEffect = subMesh.effect;
            let effect = scene.getEngine().createEffect(shaderName, {
                attributes: attribs,
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: join,
                fallbacks: fallbacks,
                onCompiled: this.onCompiled,
                onError: this.onError,
                indexParameters: {
                    maxSimultaneousLights: this._maxSimultaneousLights,
                    maxSimultaneousMorphTargets: defines.NUM_MORPH_INFLUENCERS
                },
                processFinalCode: csnrOptions.processFinalCode,
                multiTarget: defines.PREPASS
            }, engine);
            if (effect) {
                if (this._onEffectCreatedObservable) {
                    onCreatedEffectParameters.effect = effect;
                    onCreatedEffectParameters.subMesh = subMesh;
                    this._onEffectCreatedObservable.notifyObservers(onCreatedEffectParameters);
                }
                // Use previous effect while new one is compiling
                if (this.allowShaderHotSwapping && previousEffect && !effect.isReady()) {
                    effect = previousEffect;
                    defines.markAsUnprocessed();
                    if (lightDisposed) {
                        // re register in case it takes more than one frame.
                        defines._areLightsDisposed = true;
                        return false;
                    }
                }
                else {
                    scene.resetCachedMaterial();
                    subMesh.setEffect(effect, defines, this._materialContext);
                    this.buildUniformLayout();
                }
            }
        }
        if (!subMesh.effect || !subMesh.effect.isReady()) {
            return false;
        }
        defines._renderId = scene.getRenderId();
        subMesh.effect._wasPreviouslyReady = true;
        return true;
    }
    /**
     * Builds the material UBO layouts.
     * Used internally during the effect preparation.
     */
    buildUniformLayout() {
        // Order is important !
        const ubo = this._uniformBuffer;
        ubo.addUniform("vDiffuseColor", 4);
        ubo.addUniform("vDiffuseInfos", 2);
        ubo.addUniform("diffuseMatrix", 16);
        ubo.addUniform("vSpecularColor", 4);
        ubo.addUniform("vSpecularInfos", 2);
        ubo.addUniform("specularMatrix", 16);
        ubo.addUniform("vAmbientColor", 3);
        ubo.addUniform("vAmbientInfos", 2);
        ubo.addUniform("ambientMatrix", 16);
        ubo.addUniform("vEmissiveColor", 3);
        ubo.addUniform("vEmissiveInfos", 2);
        ubo.addUniform("emissiveMatrix", 16);
        ubo.addUniform("vBumpInfos", 3);
        ubo.addUniform("bumpMatrix", 16);
        ubo.addUniform("vShadeColor", 3);
        ubo.addUniform("vShadeInfos", 2);
        ubo.addUniform("shadeMatrix", 16);
        ubo.addUniform("vReceiveShadowInfos", 2);
        ubo.addUniform("receiveShadowMatrix", 16);
        ubo.addUniform("vShadingGradeInfos", 2);
        ubo.addUniform("shadingGradeMatrix", 16);
        ubo.addUniform("vRimColor", 3);
        ubo.addUniform("vRimInfos", 2);
        ubo.addUniform("rimMatrix", 16);
        ubo.addUniform("vMatCapInfos", 2);
        ubo.addUniform("matCapMatrix", 16);
        ubo.addUniform("vOutlineColor", 3);
        ubo.addUniform("vOutlineWidthInfos", 2);
        ubo.addUniform("outlineWidthMatrix", 16);
        ubo.addUniform("vUvAnimationMaskInfos", 2);
        ubo.addUniform("uvAnimationMaskMatrix", 16);
        ubo.addUniform("vTangentSpaceParams", 2);
        ubo.addUniform("pointSize", 1);
        ubo.addUniform("alphaCutOff", 1);
        ubo.addUniform("shadingGradeRate", 1);
        ubo.addUniform("receiveShadowRate", 1);
        ubo.addUniform("shadeShift", 1);
        ubo.addUniform("shadeToony", 1);
        ubo.addUniform("lightColorAttenuation", 1);
        ubo.addUniform("indirectLightIntensity", 1);
        ubo.addUniform("rimLightingMix", 1);
        ubo.addUniform("rimFresnelPower", 1);
        ubo.addUniform("rimLift", 1);
        ubo.addUniform("outlineWidth", 1);
        ubo.addUniform("outlineScaledMaxDistance", 1);
        ubo.addUniform("outlineLightingMix", 1);
        ubo.addUniform("uvAnimationScrollX", 1);
        ubo.addUniform("uvAnimationScrollY", 1);
        ubo.addUniform("uvAnimationRotation", 1);
        external_BABYLON_namespaceObject.DetailMapConfiguration.PrepareUniformBuffer(ubo);
        ubo.create();
    }
    /**
     * Unbinds the material from the mesh
     */
    unbind() {
        super.unbind();
    }
    /**
     * Binds the submesh to this material by preparing the effect and shader to draw
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh containing the submesh
     * @param subMesh defines the submesh to bind the material to
     */
    bindForSubMesh(world, mesh, subMesh) {
        const scene = this.getScene();
        const defines = subMesh._materialDefines;
        if (!defines) {
            return;
        }
        const effect = subMesh.effect;
        if (!effect) {
            return;
        }
        this._activeEffect = effect;
        // Matrices Mesh.
        mesh.getMeshUniformBuffer().bindToEffect(effect, "Mesh");
        mesh.transferToEffect(world);
        // PrePass
        this.prePassConfiguration.bindForSubMesh(this._activeEffect, scene, mesh, world, this.isFrozen);
        // Normal Matrix
        if (defines.OBJECTSPACE_NORMALMAP) {
            world.toNormalMatrix(this._normalMatrix);
            this.bindOnlyNormalMatrix(this._normalMatrix);
        }
        const mustRebind = this._mustRebind(scene, effect, mesh.visibility);
        // Bones
        external_BABYLON_namespaceObject.MaterialHelper.BindBonesParameters(mesh, effect);
        const ubo = this._uniformBuffer;
        if (mustRebind) {
            ubo.bindToEffect(effect, "Material");
            this.bindViewProjection(effect);
            if (!ubo.useUbo || !this.isFrozen || !ubo.isSync) {
                // Textures
                if (scene.texturesEnabled) {
                    if (this._diffuseTexture && MToonMaterial.DiffuseTextureEnabled) {
                        ubo.updateFloat2("vDiffuseInfos", this._diffuseTexture.coordinatesIndex, this._diffuseTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._diffuseTexture, ubo, "diffuse");
                    }
                    if (this._ambientTexture && MToonMaterial.AmbientTextureEnabled) {
                        ubo.updateFloat2("vAmbientInfos", this._ambientTexture.coordinatesIndex, this._ambientTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._ambientTexture, ubo, "ambient");
                    }
                    if (this._hasAlphaChannel()) {
                        ubo.updateFloat("alphaCutOff", this.alphaCutOff);
                    }
                    if (this._emissiveTexture && MToonMaterial.EmissiveTextureEnabled) {
                        ubo.updateFloat2("vEmissiveInfos", this._emissiveTexture.coordinatesIndex, this._emissiveTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._emissiveTexture, ubo, "emissive");
                    }
                    if (this._specularTexture && MToonMaterial.SpecularTextureEnabled) {
                        ubo.updateFloat2("vSpecularInfos", this._specularTexture.coordinatesIndex, this._specularTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._specularTexture, ubo, "specular");
                    }
                    if (this._bumpTexture && scene.getEngine().getCaps().standardDerivatives && MToonMaterial.BumpTextureEnabled) {
                        ubo.updateFloat3("vBumpInfos", this._bumpTexture.coordinatesIndex, 1.0 / this._bumpTexture.level, this.parallaxScaleBias);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._bumpTexture, ubo, "bump");
                        if (scene._mirroredCameraPosition) {
                            ubo.updateFloat2("vTangentSpaceParams", -1.0, -1.0);
                        }
                        else {
                            ubo.updateFloat2("vTangentSpaceParams", 1.0, 1.0);
                        }
                    }
                    if (this._shadeTexture) {
                        ubo.updateFloat2("vShadeInfos", this._shadeTexture.coordinatesIndex, this._shadeTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._shadeTexture, ubo, "shade");
                    }
                    if (this._receiveShadowTexture) {
                        ubo.updateFloat2("vReceiveShadowInfos", this._receiveShadowTexture.coordinatesIndex, this._receiveShadowTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._receiveShadowTexture, ubo, "receiveShadow");
                    }
                    if (this._shadingGradeTexture) {
                        ubo.updateFloat2("vShadingGradeInfos", this._shadingGradeTexture.coordinatesIndex, this._shadingGradeTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._shadingGradeTexture, ubo, "shadingGrade");
                    }
                    if (this._rimTexture) {
                        ubo.updateFloat2("vRimInfos", this._rimTexture.coordinatesIndex, this._rimTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._rimTexture, ubo, "rim");
                    }
                    if (this._matCapTexture) {
                        ubo.updateFloat2("vMatCapInfos", this._matCapTexture.coordinatesIndex, this._matCapTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._matCapTexture, ubo, "matCap");
                    }
                    if (this._outlineWidthTexture) {
                        ubo.updateFloat2("vOutlineWidthInfos", this._outlineWidthTexture.coordinatesIndex, this._outlineWidthTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._outlineWidthTexture, ubo, "outlineWidth");
                    }
                    if (this._uvAnimationMaskTexture) {
                        ubo.updateFloat2("vUvAnimationMaskInfos", this._uvAnimationMaskTexture.coordinatesIndex, this._uvAnimationMaskTexture.level);
                        external_BABYLON_namespaceObject.MaterialHelper.BindTextureMatrix(this._uvAnimationMaskTexture, ubo, "uvAnimationMask");
                    }
                }
            }
            // Point size
            if (this.pointsCloud) {
                ubo.updateFloat("pointSize", this.pointSize);
            }
            if (defines.SPECULARTERM) {
                ubo.updateColor4("vSpecularColor", this.specularColor, this.specularPower);
            }
            ubo.updateColor3("vEmissiveColor", this.emissiveColor);
            ubo.updateColor4("vDiffuseColor", this.diffuseColor, this.alpha);
            scene.ambientColor.multiplyToRef(this.ambientColor, this._globalAmbientColor);
            ubo.updateColor3("vAmbientColor", this._globalAmbientColor);
            // MToon uniforms
            ubo.updateFloat("receiveShadowRate", this._receiveShadowRate);
            ubo.updateFloat("shadingGradeRate", this._shadingGradeRate);
            ubo.updateFloat("shadeShift", this._shadeShift);
            ubo.updateFloat("shadeToony", this._shadeToony);
            ubo.updateFloat("lightColorAttenuation", this._lightColorAttenuation);
            ubo.updateFloat("indirectLightIntensity", this._indirectLightIntensity);
            ubo.updateFloat("rimLightingMix", this._rimLightingMix);
            ubo.updateFloat("rimFresnelPower", this._rimFresnelPower);
            ubo.updateFloat("rimLift", this._rimLift);
            ubo.updateFloat("outlineWidth", this._outlineWidth);
            ubo.updateFloat("outlineScaledMaxDistance", this._outlineScaledMaxDistance);
            ubo.updateFloat("outlineLightingMix", this._outlineLightingMix);
            ubo.updateFloat("uvAnimationScrollX", this._uvAnimationScrollX);
            ubo.updateFloat("uvAnimationScrollY", this._uvAnimationScrollY);
            ubo.updateFloat("uvAnimationRotation", this._uvAnimationRotation);
            // Textures
            if (scene.texturesEnabled) {
                if (this._diffuseTexture && MToonMaterial.DiffuseTextureEnabled) {
                    effect.setTexture("diffuseSampler", this._diffuseTexture);
                }
                if (this._ambientTexture && MToonMaterial.AmbientTextureEnabled) {
                    effect.setTexture("ambientSampler", this._ambientTexture);
                }
                if (this._emissiveTexture && MToonMaterial.EmissiveTextureEnabled) {
                    effect.setTexture("emissiveSampler", this._emissiveTexture);
                }
                if (this._specularTexture && MToonMaterial.SpecularTextureEnabled) {
                    effect.setTexture("specularSampler", this._specularTexture);
                }
                if (this._bumpTexture && scene.getEngine().getCaps().standardDerivatives && MToonMaterial.BumpTextureEnabled) {
                    effect.setTexture("bumpSampler", this._bumpTexture);
                }
                if (this._shadeTexture) {
                    effect.setTexture("shadeSampler", this._shadeTexture);
                }
                if (this._receiveShadowTexture) {
                    effect.setTexture("receiveShadowSampler", this._receiveShadowTexture);
                }
                if (this._shadingGradeTexture) {
                    effect.setTexture("shadingGradeSampler", this._shadingGradeTexture);
                }
                if (this._rimTexture) {
                    effect.setTexture("rimSampler", this._rimTexture);
                }
                if (this._matCapTexture) {
                    effect.setTexture("matCapSampler", this._matCapTexture);
                }
                if (this._outlineWidthTexture) {
                    effect.setTexture("outlineWidthSampler", this._outlineWidthTexture);
                }
                if (this._uvAnimationMaskTexture) {
                    effect.setTexture("uvAnimationMaskSampler", this._uvAnimationMaskTexture);
                }
            }
            this.detailMap.bindForSubMesh(ubo, scene, this.isFrozen);
            // Clip plane
            external_BABYLON_namespaceObject.MaterialHelper.BindClipPlane(effect, scene);
            // Colors
            this.bindEyePosition(effect);
            effect.setVector3("vEyeUp", scene.activeCamera.upVector);
            ubo.updateColor3("vShadeColor", this.shadeColor);
            ubo.updateColor3("vRimColor", this.rimColor);
            ubo.updateColor4("vOutlineColor", this.outlineColor, 1.0);
        }
        if (mustRebind || !this.isFrozen) {
            // Lights
            if (scene.lightsEnabled && !this._disableLighting) {
                external_BABYLON_namespaceObject.MaterialHelper.BindLights(scene, mesh, effect, defines, this._maxSimultaneousLights);
            }
            // View
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== external_BABYLON_namespaceObject.Scene.FOGMODE_NONE || mesh.receiveShadows) {
                this.bindView(effect);
            }
            // Fog
            external_BABYLON_namespaceObject.MaterialHelper.BindFogParameters(scene, mesh, effect);
            // Morph targets
            if (defines.NUM_MORPH_INFLUENCERS) {
                external_BABYLON_namespaceObject.MaterialHelper.BindMorphTargetParameters(mesh, effect);
            }
            // Log. depth
            if (this.useLogarithmicDepth) {
                external_BABYLON_namespaceObject.MaterialHelper.BindLogDepth(defines, effect, scene);
            }
        }
        effect.setFloat("aspect", scene.getEngine().getAspectRatio(scene.activeCamera));
        effect.setFloat("isOutline", 0);
        const t = window.performance.now() / 1000;
        effect.setVector4("time", new external_BABYLON_namespaceObject.Vector4(t / 20, t, t * 2, t * 3));
        this._afterBind(mesh, this._activeEffect);
        ubo.update();
    }
    /**
     * Get the list of animatables in the material.
     * @returns the list of animatables object used in the material
     */
    getAnimatables() {
        const results = [];
        for (const texture of this.appendedActiveTextures()) {
            if (texture.animations && texture.animations.length > 0) {
                results.push(texture);
            }
        }
        this.detailMap.getAnimatables(results);
        return results;
    }
    /**
     * Gets the active textures from the material
     * @returns an array of textures
     */
    getActiveTextures() {
        const activeTextures = super.getActiveTextures().concat(this.appendedActiveTextures());
        this.detailMap.getActiveTextures(activeTextures);
        return activeTextures;
    }
    /**
     * Specifies if the material uses a texture
     * @param texture defines the texture to check against the material
     * @returns a boolean specifying if the material uses the texture
     */
    hasTexture(texture) {
        if (super.hasTexture(texture)) {
            return true;
        }
        const activeTextures = this.appendedActiveTextures();
        return activeTextures.length > 0 ?
            activeTextures.some((e) => e === texture)
            : this.detailMap.hasTexture(texture);
    }
    /**
     * Disposes the material
     * @param forceDisposeEffect specifies if effects should be forcefully disposed
     * @param forceDisposeTextures specifies if textures should be forcefully disposed
     */
    dispose(forceDisposeEffect, forceDisposeTextures) {
        if (forceDisposeTextures) {
            this.appendedActiveTextures().forEach((e) => e.dispose());
        }
        this.detailMap.dispose(forceDisposeTextures);
        super.dispose(forceDisposeEffect, forceDisposeTextures);
    }
    /**
     * 定数を設定する
     */
    applyDefines(defines) {
        switch (this._debugMode) {
            case DebugMode.Normal:
                if (defines.MTOON_DEBUG_NORMAL !== true) {
                    defines.MTOON_DEBUG_NORMAL = true;
                    defines.MTOON_DEBUG_LITSHADERATE = false;
                    defines.markAsUnprocessed();
                }
                break;
            case DebugMode.LitShadeRate:
                if (defines.MTOON_DEBUG_LITSHADERATE !== true) {
                    defines.MTOON_DEBUG_NORMAL = false;
                    defines.MTOON_DEBUG_LITSHADERATE = true;
                    defines.markAsUnprocessed();
                }
                break;
            case DebugMode.None:
                if (defines.MTOON_DEBUG_NORMAL === true) {
                    defines.MTOON_DEBUG_NORMAL = false;
                    defines.markAsUnprocessed();
                }
                if (defines.MTOON_DEBUG_LITSHADERATE === true) {
                    defines.MTOON_DEBUG_LITSHADERATE = false;
                    defines.markAsUnprocessed();
                }
                break;
        }
        switch (this._outlineWidthMode) {
            case OutlineWidthMode.WorldCorrdinates:
                if (defines.MTOON_OUTLINE_WIDTH_WORLD !== true) {
                    defines.MTOON_OUTLINE_WIDTH_WORLD = true;
                    defines.MTOON_OUTLINE_WIDTH_SCREEN = false;
                    defines.markAsUnprocessed();
                }
                break;
            case OutlineWidthMode.ScreenCoordinates:
                if (defines.MTOON_OUTLINE_WIDTH_SCREEN !== true) {
                    defines.MTOON_OUTLINE_WIDTH_WORLD = false;
                    defines.MTOON_OUTLINE_WIDTH_SCREEN = true;
                    defines.markAsUnprocessed();
                }
                break;
            case OutlineWidthMode.None:
                if (defines.MTOON_OUTLINE_WIDTH_SCREEN !== false || defines.MTOON_OUTLINE_WIDTH_WORLD !== false) {
                    defines.MTOON_OUTLINE_WIDTH_SCREEN = false;
                    defines.MTOON_OUTLINE_WIDTH_WORLD = false;
                    defines.markAsUnprocessed();
                }
                break;
        }
        switch (this._outlineColorMode) {
            case OutlineColorMode.FixedColor:
                if (defines.MTOON_OUTLINE_COLOR_FIXED !== true) {
                    defines.MTOON_OUTLINE_COLOR_FIXED = true;
                    defines.MTOON_OUTLINE_COLOR_MIXED = false;
                    defines.markAsUnprocessed();
                }
                break;
            case OutlineColorMode.MixedLighting:
                if (defines.MTOON_OUTLINE_COLOR_MIXED !== true) {
                    defines.MTOON_OUTLINE_COLOR_FIXED = false;
                    defines.MTOON_OUTLINE_COLOR_MIXED = true;
                    defines.markAsUnprocessed();
                }
                break;
        }
    }
    //#region Misc
    /**
     * Makes a duplicate of the material, and gives it a new name
     * @param name defines the new name for the duplicated material
     * @returns the cloned material
     */
    clone(name) {
        const result = external_BABYLON_namespaceObject.SerializationHelper.Clone(() => new MToonMaterial(name, this.getScene()), this);
        result.name = name;
        result.id = name;
        this.stencil.copyTo(result.stencil);
        return result;
    }
    /**
     * Serializes this material in a JSON representation
     * @returns the serialized material object
     */
    serialize() {
        const serializationObject = external_BABYLON_namespaceObject.SerializationHelper.Serialize(this);
        serializationObject.stencil = this.stencil.serialize();
        return serializationObject;
    }
    /**
     * Creates a standard material from parsed material data
     * @param source defines the JSON representation of the material
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a new standard material
     */
    static Parse(source, scene, rootUrl) {
        const material = external_BABYLON_namespaceObject.SerializationHelper.Parse(() => new MToonMaterial(source.name, scene), source, scene, rootUrl);
        if (source.stencil) {
            material.stencil.parse(source.stencil, scene, rootUrl);
        }
        return material;
    }
    //#endregion
    // Flags used to enable or disable a type of texture for all Standard Materials
    /**
     * Are diffuse textures enabled in the application.
     */
    static get DiffuseTextureEnabled() {
        return external_BABYLON_namespaceObject.MaterialFlags.DiffuseTextureEnabled;
    }
    static set DiffuseTextureEnabled(value) {
        external_BABYLON_namespaceObject.MaterialFlags.DiffuseTextureEnabled = value;
    }
    /**
     * Are ambient textures enabled in the application.
     */
    static get AmbientTextureEnabled() {
        return external_BABYLON_namespaceObject.MaterialFlags.AmbientTextureEnabled;
    }
    static set AmbientTextureEnabled(value) {
        external_BABYLON_namespaceObject.MaterialFlags.AmbientTextureEnabled = value;
    }
    /**
     * Are emissive textures enabled in the application.
     */
    static get EmissiveTextureEnabled() {
        return external_BABYLON_namespaceObject.MaterialFlags.EmissiveTextureEnabled;
    }
    static set EmissiveTextureEnabled(value) {
        external_BABYLON_namespaceObject.MaterialFlags.EmissiveTextureEnabled = value;
    }
    /**
     * Are specular textures enabled in the application.
     */
    static get SpecularTextureEnabled() {
        return external_BABYLON_namespaceObject.MaterialFlags.SpecularTextureEnabled;
    }
    static set SpecularTextureEnabled(value) {
        external_BABYLON_namespaceObject.MaterialFlags.SpecularTextureEnabled = value;
    }
    /**
     * Are bump textures enabled in the application.
     */
    static get BumpTextureEnabled() {
        return external_BABYLON_namespaceObject.MaterialFlags.BumpTextureEnabled;
    }
    static set BumpTextureEnabled(value) {
        external_BABYLON_namespaceObject.MaterialFlags.BumpTextureEnabled = value;
    }
}
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("diffuseTexture")
], MToonMaterial.prototype, "_diffuseTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesAndMiscDirty")
], MToonMaterial.prototype, "diffuseTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("ambientTexture")
], MToonMaterial.prototype, "_ambientTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "ambientTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("emissiveTexture")
], MToonMaterial.prototype, "_emissiveTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "emissiveTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("specularTexture")
], MToonMaterial.prototype, "_specularTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "specularTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("bumpTexture")
], MToonMaterial.prototype, "_bumpTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "bumpTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("shadeTexture")
], MToonMaterial.prototype, "_shadeTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "shadeTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("receiveShadowTexture")
], MToonMaterial.prototype, "_receiveShadowTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "receiveShadowTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("shadingGradeTexture")
], MToonMaterial.prototype, "_shadingGradeTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "shadingGradeTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("rimTexture")
], MToonMaterial.prototype, "_rimTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "rimTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("matCapTexture")
], MToonMaterial.prototype, "_matCapTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "matCapTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("outlineWidthTexture")
], MToonMaterial.prototype, "_outlineWidthTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "outlineWidthTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsTexture)("uvAnimationMaskTexture")
], MToonMaterial.prototype, "_uvAnimationMaskTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "uvAnimationMaskTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("ambient")
], MToonMaterial.prototype, "ambientColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("diffuse")
], MToonMaterial.prototype, "diffuseColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("specular")
], MToonMaterial.prototype, "specularColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("emissive")
], MToonMaterial.prototype, "emissiveColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("shade")
], MToonMaterial.prototype, "shadeColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("rim")
], MToonMaterial.prototype, "rimColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serializeAsColor3)("outline")
], MToonMaterial.prototype, "outlineColor", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)()
], MToonMaterial.prototype, "specularPower", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useAlphaFromDiffuseTexture")
], MToonMaterial.prototype, "_useAlphaFromDiffuseTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesAndMiscDirty")
], MToonMaterial.prototype, "useAlphaFromDiffuseTexture", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useEmissiveAsIllumination")
], MToonMaterial.prototype, "_useEmissiveAsIllumination", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "useEmissiveAsIllumination", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("linkEmissiveWithDiffuse")
], MToonMaterial.prototype, "_linkEmissiveWithDiffuse", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "linkEmissiveWithDiffuse", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useSpecularOverAlpha")
], MToonMaterial.prototype, "_useSpecularOverAlpha", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "useSpecularOverAlpha", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("disableLighting")
], MToonMaterial.prototype, "_disableLighting", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "disableLighting", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useObjectSpaceNormalMap")
], MToonMaterial.prototype, "_useObjectSpaceNormalMap", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "useObjectSpaceNormalMap", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useParallax")
], MToonMaterial.prototype, "_useParallax", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "useParallax", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useParallaxOcclusion")
], MToonMaterial.prototype, "_useParallaxOcclusion", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "useParallaxOcclusion", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)()
], MToonMaterial.prototype, "alphaCutOff", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("useGlossinessFromSpecularMapAlpha")
], MToonMaterial.prototype, "_useGlossinessFromSpecularMapAlpha", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "useGlossinessFromSpecularMapAlpha", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("maxSimultaneousLights")
], MToonMaterial.prototype, "_maxSimultaneousLights", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "maxSimultaneousLights", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("twoSidedLighting")
], MToonMaterial.prototype, "_twoSidedLighting", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
], MToonMaterial.prototype, "twoSidedLighting", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("bumpScale")
], MToonMaterial.prototype, "_bumpScale", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsTexturesAndMiscDirty")
], MToonMaterial.prototype, "bumpScale", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)()
], MToonMaterial.prototype, "parallaxScaleBias", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("receiveShadowRate")
], MToonMaterial.prototype, "_receiveShadowRate", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "receiveShadowRate", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("shadingGradeRate")
], MToonMaterial.prototype, "_shadingGradeRate", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "shadingGradeRate", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("shadeShift")
], MToonMaterial.prototype, "_shadeShift", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "shadeShift", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("shadeToony")
], MToonMaterial.prototype, "_shadeToony", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "shadeToony", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("lightColorAttenuation")
], MToonMaterial.prototype, "_lightColorAttenuation", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "lightColorAttenuation", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("indirectLightIntensity")
], MToonMaterial.prototype, "_indirectLightIntensity", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "indirectLightIntensity", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("rimLightingMix")
], MToonMaterial.prototype, "_rimLightingMix", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "rimLightingMix", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("rimFresnelPower")
], MToonMaterial.prototype, "_rimFresnelPower", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "rimFresnelPower", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("rimLift")
], MToonMaterial.prototype, "_rimLift", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsLightsDirty")
], MToonMaterial.prototype, "rimLift", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("outlineWidth")
], MToonMaterial.prototype, "_outlineWidth", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsAttributesDirty")
], MToonMaterial.prototype, "outlineWidth", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("outlineScaledMaxDistance")
], MToonMaterial.prototype, "_outlineScaledMaxDistance", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsAttributesDirty")
], MToonMaterial.prototype, "outlineScaledMaxDistance", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("outlineLightingMix")
], MToonMaterial.prototype, "_outlineLightingMix", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsAttributesDirty")
], MToonMaterial.prototype, "outlineLightingMix", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("uvAnimationScrollX")
], MToonMaterial.prototype, "_uvAnimationScrollX", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "uvAnimationScrollX", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("uvAnimationScrollY")
], MToonMaterial.prototype, "_uvAnimationScrollY", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "uvAnimationScrollY", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("uvAnimationRotation")
], MToonMaterial.prototype, "_uvAnimationRotation", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "uvAnimationRotation", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("debugMode")
], MToonMaterial.prototype, "_debugMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "debugMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("outlineWidthMode")
], MToonMaterial.prototype, "_outlineWidthMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "outlineWidthMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("outlineColorMode")
], MToonMaterial.prototype, "_outlineColorMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "outlineColorMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("cullMode")
], MToonMaterial.prototype, "_cullMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)("outlineCullMode")
], MToonMaterial.prototype, "_outlineCullMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.expandToProperty)("_markAllSubMeshesAsMiscDirty")
], MToonMaterial.prototype, "outlineCullMode", void 0);
__decorate([
    (0,external_BABYLON_namespaceObject.serialize)()
], MToonMaterial.prototype, "useLogarithmicDepth", null);
external_BABYLON_namespaceObject._TypeStore.RegisteredTypes["BABYLON.MToonMaterial"] = MToonMaterial;

;// CONCATENATED MODULE: ./src/shader/babylon-mtoon-material/src/index.ts


;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/vrm-interfaces.ts
var IVRMMaterialPropertyShader;
(function (IVRMMaterialPropertyShader) {
    IVRMMaterialPropertyShader["VRM_USE_GLTFSHADER"] = "VRM_USE_GLTFSHADER";
    IVRMMaterialPropertyShader["VRMMToon"] = "VRM/MToon";
    IVRMMaterialPropertyShader["VRMUnlitTransparentZWrite"] = "VRM/UnlitTransparentZWrite";
})(IVRMMaterialPropertyShader || (IVRMMaterialPropertyShader = {}));

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/vrm-material-generator.ts





/**
 * VRM で指定される Material を生成する
 * [VRM が提供するシェーダ](https://vrm.dev/vrm_spec/#vrm%E3%81%8C%E6%8F%90%E4%BE%9B%E3%81%99%E3%82%8B%E3%82%B7%E3%82%A7%E3%83%BC%E3%83%80%E3%83%BC) を特定し読み込む
 * - UnlitTexture: 不透明, VRM ファイル側で [KHR_materials_unlit](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit/) が定義されているため、何もしない
 * - UnlitCutout: 透明度が閾値以下の部分を透明とする, 同上
 * - UnlitTransparent: アルファブレンド。ZWriteしない, 同上
 * - UnlitTransparentZWrite: アルファブレンド。ZWriteする, 同上に加え、プロパティで ZWrite を強制しています
 * - MToon: MToonMaterial を差し替えています。
 */
class VRMMaterialGenerator {
    /**
     * @inheritdoc
     */
    constructor(loader) {
        this.loader = loader;
    }
    /**
     * マテリアルを生成する Promise を返す
     * VRM 対象外の場合は null
     */
    generate(context, material, mesh, babylonDrawMode, assign) {
        const materialProp = this.findMaterialPropertyByName(material.name, this.getMaterialProperties());
        if (!materialProp) {
            return null;
        }
        mesh.alphaIndex = materialProp.renderQueue;
        const newMaterial = this.createMaterialByShader(context, material, babylonDrawMode, materialProp);
        if (!newMaterial) {
            return null;
        }
        assign(newMaterial);
        if (newMaterial instanceof MToonMaterial) {
            return this.loadMToonTexturesAsync(context, newMaterial, materialProp);
        }
        return Promise.resolve(newMaterial);
    }
    /**
     * VRM または VCI からマテリアルプロパティの配列を探す
     */
    getMaterialProperties() {
        if (!this.loader.gltf.extensions) {
            return [];
        }
        if (this.loader.gltf.extensions.VRM && this.loader.gltf.extensions.VRM.materialProperties) {
            return this.loader.gltf.extensions.VRM.materialProperties;
        }
        if (this.loader.gltf.extensions.VCAST_vci_material_unity && this.loader.gltf.extensions.VCAST_vci_material_unity.materials) {
            return this.loader.gltf.extensions.VCAST_vci_material_unity.materials;
        }
        return [];
    }
    /**
     * マテリアル名から MaterialProperty を探す
     * @param materialName マテリアル名
     * @param extension 拡張データ
     */
    findMaterialPropertyByName(materialName, materials) {
        if (!materialName || !materials) {
            return null;
        }
        const mats = materials.filter((v) => v.name === materialName);
        if (mats.length === 0) {
            return null;
        }
        else if (mats.length >= 2) {
            this.loader.log(`Duplicated vrm material name found: ${materialName}`);
        }
        return mats[mats.length - 1];
    }
    /**
     * テクスチャを読み込む
     * @param context 現在のコンテキスト
     * @param material 生成した MToonMaterial
     * @param prop 生成した MToonMaterial のマテリアルプロパティ
     */
    loadMToonTexturesAsync(context, material, prop) {
        const promises = [];
        // 全てのテクスチャの UV Offset & Scale はメインテクスチャのものを流用する
        const uvOffsetScale = prop.vectorProperties._MainTex;
        if (!uvOffsetScale) {
            return Promise.resolve(material);
        }
        const applyTexture = (index, callback) => {
            applyPropertyWhenDefined(index, (value) => {
                promises.push(this.loader.loadTextureInfoAsync(`${context}/textures/${index}`, { index: value }, (babylonTexture) => {
                    // 実際は Texture インスタンスが来るのでキャスト
                    const t = babylonTexture;
                    t.uOffset = uvOffsetScale[0];
                    t.vOffset = uvOffsetScale[1];
                    t.uScale = uvOffsetScale[2];
                    t.vScale = uvOffsetScale[3];
                    callback(babylonTexture);
                }));
            });
        };
        applyTexture(prop.textureProperties._MainTex, (texture) => {
            material.diffuseTexture = texture;
            if (material.transparencyMode)
                material.diffuseTexture.hasAlpha = true;
        });
        applyTexture(prop.textureProperties._ShadeTexture, (texture) => material.shadeTexture = texture);
        applyTexture(prop.textureProperties._BumpMap, (texture) => material.bumpTexture = texture);
        applyTexture(prop.textureProperties._ReceiveShadowTexture, (texture) => material.receiveShadowTexture = texture);
        applyTexture(prop.textureProperties._ShadingGradeTexture, (texture) => material.shadingGradeTexture = texture);
        applyTexture(prop.textureProperties._RimTexture, (texture) => material.rimTexture = texture);
        applyTexture(prop.textureProperties._SphereAdd, (texture) => material.matCapTexture = texture);
        applyTexture(prop.textureProperties._EmissionMap, (texture) => material.emissiveTexture = texture);
        applyTexture(prop.textureProperties._OutlineWidthTexture, (texture) => material.outlineWidthTexture = texture);
        applyTexture(prop.textureProperties._UvAnimMaskTexture, (texture) => material.uvAnimationMaskTexture = texture);
        return Promise.all(promises).then(() => material);
    }
    /**
     * シェーダ名からマテリアルを推測して生成する
     * @param context 現在のコンテキスト
     * @param material glTF マテリアル
     * @param babylonDrawMode 描画種類
     * @param prop 生成するマテリアルプロパティ
     */
    createMaterialByShader(context, material, babylonDrawMode, prop) {
        if (prop.shader === IVRMMaterialPropertyShader.VRMMToon) {
            const mtoonMaterial = new MToonMaterial(material.name || `MToonMaterial${material.index}`, this.loader.babylonScene);
            this.setMToonMaterialProperties(mtoonMaterial, prop);
            return mtoonMaterial;
        }
        if (prop.shader === IVRMMaterialPropertyShader.VRMUnlitTransparentZWrite) {
            const mat = this.loader.createMaterial(context, material, babylonDrawMode);
            // 通常マテリアルに Depth Write を強制
            mat.disableDepthWrite = false;
            mat.forceDepthWrite = true;
            return mat;
        }
        return null;
    }
    /**
     * マテリアルに VRM プロパティを設定
     * VRM プロパティとマテリアルプロパティのマッピングを行っている
     * 初期値はマテリアル実装側に持っているため、値がある場合のみ上書きする
     */
    setMToonMaterialProperties(material, prop) {
        applyPropertyWhenDefined(prop.floatProperties._Cutoff, (value) => material.alphaCutOff = value);
        applyPropertyWhenDefined(prop.vectorProperties._Color, (value) => {
            material.diffuseColor = new external_BABYLON_namespaceObject.Color3(value[0], value[1], value[2]);
            material.alpha = value[3];
        });
        applyPropertyWhenDefined(prop.vectorProperties._ShadeColor, (value) => {
            material.shadeColor = new external_BABYLON_namespaceObject.Color3(value[0], value[1], value[2]);
        });
        applyPropertyWhenDefined(prop.floatProperties._BumpScale, (value) => material.bumpScale = value);
        applyPropertyWhenDefined(prop.floatProperties._ReceiveShadowRate, (value) => material.receiveShadowRate = value);
        applyPropertyWhenDefined(prop.floatProperties._ShadingGradeRate, (value) => material.shadingGradeRate = value);
        applyPropertyWhenDefined(prop.floatProperties._ShadeShift, (value) => material.shadeShift = value);
        applyPropertyWhenDefined(prop.floatProperties._ShadeToony, (value) => material.shadeToony = value);
        applyPropertyWhenDefined(prop.floatProperties._LightColorAttenuation, (value) => material.lightColorAttenuation = value);
        applyPropertyWhenDefined(prop.floatProperties._IndirectLightIntensity, (value) => material.indirectLightIntensity = value);
        applyPropertyWhenDefined(prop.vectorProperties._RimColor, (value) => {
            material.rimColor = new external_BABYLON_namespaceObject.Color3(value[0], value[1], value[2]);
        });
        applyPropertyWhenDefined(prop.floatProperties._RimLightingMix, (value) => material.rimLightingMix = value);
        applyPropertyWhenDefined(prop.floatProperties._RimFresnelPower, (value) => material.rimFresnelPower = value);
        applyPropertyWhenDefined(prop.floatProperties._RimLift, (value) => material.rimLift = value);
        applyPropertyWhenDefined(prop.vectorProperties._EmissionColor, (value) => {
            material.emissiveColor = new external_BABYLON_namespaceObject.Color3(value[0], value[1], value[2]);
        });
        applyPropertyWhenDefined(prop.floatProperties._OutlineWidth, (value) => material.outlineWidth = value);
        applyPropertyWhenDefined(prop.floatProperties._OutlineScaledMaxDistance, (value) => material.outlineScaledMaxDistance = value);
        applyPropertyWhenDefined(prop.vectorProperties._OutlineColor, (value) => {
            material.outlineColor = new external_BABYLON_namespaceObject.Color3(value[0], value[1], value[2]);
        });
        applyPropertyWhenDefined(prop.floatProperties._OutlineLightingMix, (value) => material.outlineLightingMix = value);
        applyPropertyWhenDefined(prop.floatProperties._UvAnimScrollX, (value) => material.uvAnimationScrollX = value);
        applyPropertyWhenDefined(prop.floatProperties._UvAnimScrollY, (value) => material.uvAnimationScrollY = value);
        applyPropertyWhenDefined(prop.floatProperties._UvAnimRotation, (value) => material.uvAnimationRotation = value);
        applyPropertyWhenDefined(prop.floatProperties._DebugMode, (value) => material.debugMode = value);
        applyPropertyWhenDefined(prop.floatProperties._BlendMode, (value) => {
            switch (value) {
                case 0: // Opaque
                    material.transparencyMode = external_BABYLON_namespaceObject.Material.MATERIAL_OPAQUE;
                    break;
                case 1: // TransparentCutout
                    material.transparencyMode = external_BABYLON_namespaceObject.Material.MATERIAL_ALPHATEST;
                    material.alphaMode = external_BABYLON_namespaceObject.Engine.ALPHA_COMBINE;
                    break;
                case 2: // Transparent
                    material.transparencyMode = external_BABYLON_namespaceObject.Material.MATERIAL_ALPHABLEND;
                    material.alphaMode = external_BABYLON_namespaceObject.Engine.ALPHA_COMBINE;
                    break;
            }
        });
        applyPropertyWhenDefined(prop.floatProperties._OutlineWidthMode, (value) => material.outlineWidthMode = value);
        applyPropertyWhenDefined(prop.floatProperties._OutlineColorMode, (value) => material.outlineColorMode = value);
        applyPropertyWhenDefined(prop.floatProperties._CullMode, (value) => material.cullMode = value);
        applyPropertyWhenDefined(prop.floatProperties._OutlineCullMode, (value) => material.outlineCullMode = value);
        applyPropertyWhenDefined(prop.floatProperties._ZWrite, (value) => {
            material.forceDepthWrite = (Math.round(value) === 1);
            if (material.forceDepthWrite) {
                material.disableDepthWrite = false;
            }
        });
    }
}
/**
 * プロパティが設定されていればコールバックを実行する
 */
function applyPropertyWhenDefined(prop, callback) {
    if (typeof prop === 'undefined') {
        return;
    }
    callback(prop);
}

;// CONCATENATED MODULE: ./src/importer/babylon-vrm-loader/src/vrm-extension.ts


/**
 * VRM 拡張を処理する
 * [Specification](https://github.com/vrm-c/UniVRM/tree/master/specification/)
 */
class VRMLoaderExtension {
    /**
     * @inheritdoc
     */
    constructor(loader, v3DCore) {
        this.loader = loader;
        this.v3DCore = v3DCore;
        /**
         * @inheritdoc
         */
        this.name = VRMLoaderExtension.NAME;
        /**
         * @inheritdoc
         */
        this.enabled = true;
        /**
         * この Mesh index 以降が読み込み対象
         */
        this.meshesFrom = 0;
        /**
         * この TransformNode index 以降が読み込み対象
         */
        this.transformNodesFrom = 0;
        /**
         * Loader observers
         */
        this.loaderObservers = [];
        // GLTFLoader has already added rootMesh as __root__ before load extension
        // @see glTFLoader._loadData
        this.meshesFrom = this.loader.babylonScene.meshes.length - 1;
        this.transformNodesFrom = this.loader.babylonScene.transformNodes.length;
        this.addLoaderObserver(this.v3DCore);
        this.onLoadedCallBack = () => {
            v3DCore.addVRMManager(this.manager);
        };
        v3DCore.addOnLoadCompleteCallbacks(this.onLoadedCallBack);
    }
    /**
     * @inheritdoc
     */
    dispose() {
        this.loader = null;
        this.loaderObservers = [];
        this.v3DCore.removeOnLoadCompleteCallback(this.onLoadedCallBack);
    }
    /**
     * @inheritdoc
     */
    onReady() {
        if (!this.loader.gltf.extensions || !this.loader.gltf.extensions[VRMLoaderExtension.NAME]) {
            return;
        }
        // Because of the way loader plugin works, this seems to be
        // the best we can do
        const uri = this.loader.parent.uri;
        this.manager = new VRMManager(this.loader.gltf.extensions[VRMLoaderExtension.NAME], this.loader.babylonScene, this.meshesFrom, this.transformNodesFrom, uri);
        this.loader.babylonScene.onDisposeObservable.add(() => {
            // Scene dispose 時に Manager も破棄する
            this.manager.dispose();
        });
        // Inform observers
        for (const observer of this.loaderObservers) {
            observer.onLoadReady();
        }
        console.log("extension onReady");
    }
    /**
     * @inheritdoc
     */
    _loadVertexDataAsync(context, primitive, babylonMesh) {
        if (!primitive.extras || !primitive.extras.targetNames) {
            return null;
        }
        // まだ MorphTarget が生成されていないので、メタ情報にモーフターゲット情報を入れておく
        babylonMesh.metadata = babylonMesh.metadata || {};
        babylonMesh.metadata.vrmTargetNames = primitive.extras.targetNames;
        return null;
    }
    /**
     * @inheritdoc
     */
    _loadMaterialAsync(context, material, mesh, babylonDrawMode, assign) {
        // ジェネレータでマテリアルを生成する
        return (new VRMMaterialGenerator(this.loader)).generate(context, material, mesh, babylonDrawMode, assign);
    }
    /**
     * Add observer
     */
    addLoaderObserver(observer) {
        this.loaderObservers.push(observer);
    }
}
/**
 * `extensions` に入る拡張キー
 */
VRMLoaderExtension.NAME = 'VRM';

;// CONCATENATED MODULE: external "LOADERS.GLTF2"
const external_LOADERS_GLTF2_namespaceObject = LOADERS.GLTF2;
;// CONCATENATED MODULE: ./src/index.ts







class V3DCore {
    constructor(engine, scene) {
        this.engine = engine;
        this.scene = scene;
        /**
         * GLTFFileLoader plugin factory
         * @private
         */
        this._vrmFileLoader = new VRMFileLoader();
        /**
         * Callbacks when loading is done
         */
        this._onLoadCompleteCallbacks = [];
        /**
         * Loaded VRM Managers
         * @private
         */
        this._loadedVRMManagers = [];
        // Register
        this.registerVrmPlugin();
        this.registerVrmExtension();
        if (!this.scene)
            this.scene = new external_BABYLON_namespaceObject.Scene(this.engine);
        else
            this.engine = this.scene.getEngine();
        this.setupSecodaryAnimation();
        this.enableResize();
    }
    addOnLoadCompleteCallbacks(callback) {
        this._onLoadCompleteCallbacks.push(callback);
    }
    removeOnLoadCompleteCallback(callback) {
        const idx = this._onLoadCompleteCallbacks.indexOf(callback);
        if (idx !== -1) {
            this._onLoadCompleteCallbacks.splice(idx, 1);
        }
    }
    resetOnLoadCompleteCallbacks() {
        this._onLoadCompleteCallbacks = [];
    }
    addVRMManager(manager) {
        if (manager)
            this._loadedVRMManagers.push(manager);
    }
    /**
     * Get VRM Manager by index
     * @param idx
     */
    getVRMManagerByIndex(idx) {
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
    getVRMManagerByURI(uri) {
        for (const manager of this._loadedVRMManagers) {
            if (manager.uri === uri)
                return manager;
        }
        return null;
    }
    /**
     * Make background transparent.
     */
    transparentBackground() {
        this.scene.clearColor.a = 0;
    }
    /**
     * Make background solid.
     */
    solidBackground() {
        this.scene.clearColor.a = 1;
    }
    /**
     * Change background color.
     * @param color
     */
    setBackgroundColor(color) {
        this.scene.clearColor = external_BABYLON_namespaceObject.Color4.FromColor3(color, this.scene.clearColor.a);
    }
    addAmbientLight(color) {
        const light = new external_BABYLON_namespaceObject.HemisphericLight("V3DHemiLight", new external_BABYLON_namespaceObject.Vector3(0, 1, 1), this.scene);
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
    attachCameraTo(manager, radius = 3) {
        const camera = new external_BABYLON_namespaceObject.ArcRotateCamera('V3DArcCamera' + manager.cameras.length, 0, 0, radius, manager.rootMesh.position, this.scene, true);
        camera.lowerRadiusLimit = 0.1;
        camera.upperRadiusLimit = 20;
        camera.wheelDeltaPercentage = 0.05;
        camera.minZ = 0;
        camera.setPosition(new external_BABYLON_namespaceObject.Vector3(0, 1.5, -5));
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
    AppendAsync(rootUrl, sceneFilename) {
        return external_BABYLON_namespaceObject.SceneLoader.AppendAsync(rootUrl, sceneFilename, this.scene);
    }
    /**
     * Wrapper for SceneLoader.LoadAsync
     * @param rootUrl a string that defines the root url for the scene and resources or the concatenation of rootURL and filename
     * @param sceneFilename a string that defines the name of the scene file or starts with "data:" following by the stringified version of the scene or a File object (default: empty string)
     */
    LoadAsync(rootUrl, sceneFilename) {
        return external_BABYLON_namespaceObject.SceneLoader.LoadAsync(rootUrl, sceneFilename, this.engine);
    }
    // GLTFLoaderExtensionObserver
    onLoadReady() {
        for (const f of this._onLoadCompleteCallbacks) {
            f();
        }
    }
    /**
     * Set up for time update.
     * @private
     */
    setupSecodaryAnimation() {
        // Update secondary animation
        this.scene.onBeforeRenderObservable.add(() => {
            for (const manager of this._loadedVRMManagers) {
                manager.update(this.engine.getDeltaTime());
            }
        });
    }
    enableResize() {
        this.engine.getRenderingCanvas().onresize = () => {
            this.engine.resize();
        };
    }
    registerVrmExtension() {
        // ローダーに登録する
        external_LOADERS_GLTF2_namespaceObject.GLTFLoader.RegisterExtension(VRMLoaderExtension.NAME, (loader) => {
            return new VRMLoaderExtension(loader, this);
        });
    }
    registerVrmPlugin() {
        if (external_BABYLON_namespaceObject.SceneLoader) {
            external_BABYLON_namespaceObject.SceneLoader.RegisterPlugin(this._vrmFileLoader);
        }
    }
    ;
}
/* harmony default export */ const src = (V3DCore);

})();

window["v3d-core"] = __webpack_exports__;
/******/ })()
;