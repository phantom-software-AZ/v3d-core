import {IShadowLight, Light } from "@babylonjs/core";

export function isIShadowLight(light: Light) : light is IShadowLight {
    return (light as IShadowLight).setShadowProjectionMatrix !== undefined;
}
