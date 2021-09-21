/** Copyright (c) 2021 The v3d Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Calculate a 32 bit FNV-1a hash
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param str the input value
 * @param seed optionally pass the hash of the previous chunk
 * @returns hash
 */
export function hashFnv32a(str: string, seed?: number) {
    let hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (let i = 0; i < str.length; i++) {
        hval = Math.imul(hval ^ str.charCodeAt(i), 16777619);
    }
    // Convert to 8 digit hex string
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
}

/**
 * Extended 64 bit FNV-1a hash
 * @param str the input value
 * @param seed optionally pass the hash of the previous chunk
 * @returns hash
 */
export function hashFnv64a(str: string, seed?: number) {
    const h1 = hashFnv32a(str, seed);  // returns 32 bit (as 8 byte hex string)
    return h1 + hashFnv32a(h1 + str, seed);  // 64 bit (as 16 byte hex string)
}
