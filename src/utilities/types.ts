/** Copyright (c) 2021 The v3d Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {IShadowLight, Light,
    Animation} from "@babylonjs/core";
import {Color3, Color4, Quaternion, Size, Vector2, Vector3 } from "@babylonjs/core/Maths/math";

export function isIShadowLight(light: Light) : light is IShadowLight {
    return (light as IShadowLight).setShadowProjectionMatrix !== undefined;
}

export function getAnimationDataType(value: any) {
    let dataType = undefined;

    if (!isNaN(parseFloat(value)) && isFinite(value)) {
        dataType = Animation.ANIMATIONTYPE_FLOAT;
    } else if (value instanceof Quaternion) {
        dataType = Animation.ANIMATIONTYPE_QUATERNION;
    } else if (value instanceof Vector3) {
        dataType = Animation.ANIMATIONTYPE_VECTOR3;
    } else if (value instanceof Vector2) {
        dataType = Animation.ANIMATIONTYPE_VECTOR2;
    } else if (value instanceof Color3) {
        dataType = Animation.ANIMATIONTYPE_COLOR3;
    } else if (value instanceof Color4) {
        dataType = Animation.ANIMATIONTYPE_COLOR4;
    } else if (value instanceof Size) {
        dataType = Animation.ANIMATIONTYPE_SIZE;
    }

    if (dataType == undefined) {
        return null;
    } else {
        return dataType;
    }
}
