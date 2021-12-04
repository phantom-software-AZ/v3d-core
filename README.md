# v3d-core

WebGL-based humanoid model rendering engine.

## Objectives

This project aims to be an easy-to-use library for rendering 3D and pseudo-2D humanoid models. We choose WebGL because of its portability across platforms, as well as the broad support from JavaScript community.

This project will be part of `project Gamma`, a free and open virtual casting solution strives to provide a friendly and safe environment for streamers.

## Dependencies

- Babylon.js - master (customized, included)

## Features

- Contains one simple API for interacting with scene and models
- Supports `.vrm` file loading, including:
    + Unity Humanoid bone mapping
    + [BlendShape](https://vrm.dev/univrm/components/univrm_blendshape/) morphing
    + [Secondary Animation](https://vrm.dev/univrm/components/univrm_secondary/)
    + [MToonMaterial](https://github.com/phantom-software-AZ/babylon-mtoon-material)

## Demo Viedo

See [this demo video](https://www.youtube.com/watch?v=pQnvU2PVymE).

## Usage

### In browser

*Some older browsers may not be supported.*

Please see [examples/browser](./examples/browser) for an example.

A more complicated example can be found in [examples/classroom](./examples/classroom).

### On Babylon.js Playground

Currently, this is not possible since we use a modified Babylon.js fork.

### For node.js and webpack

*All modules support ES6 imports.*

Please see [index-test.ts](./src/index-test.ts) for an example.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Build

1. Clone this repo and submodules:

   ```s
   $ git clone https://github.com/phantom-software-AZ/v3d-core.git --recurse-submodules
   ```

   If your Internet connection is slow, try the following instead:

   ```s
   git clone https://github.com/phantom-software-AZ/v3d-core.git --recurse-submodules --shallow-submodules
   ```

2. Build Babylon.js

   ```s
   cd lib/Babylon.js && git checkout master-custom && npm install
   cd Tools/Gulp && npm install
   gulp typescript-libraries --noGlobalInstall && gulp npmPackages-es6 --noGlobalInstall
   cd ../../../..
   ```

3. Build v3d-core

   ```s
   npm install
   npm run build
   ```

   Output files will be under `dist` folder.
## Debugging

Go to root folder of this repository and run:

```s
$ npm run debug
```

The debug page can be opened in any browser with `http://localhost:8080/`.

## Credits

- [babylon-vrm-loader](https://github.com/virtual-cast/babylon-vrm-loader)
- [babylon-mtoon-material](https://github.com/virtual-cast/babylon-mtoon-material)

## Licenses

see [LICENSE](./LICENSE).

Babylon.js is licensed under [Apache License 2.0](https://github.com/BabylonJS/Babylon.js/blob/master/license.md).
