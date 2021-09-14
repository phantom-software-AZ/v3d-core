# v3d-core

WebGL-based humanoid model rendering engine.

## Dependencies

- Babylon.js - 5.0.0-alpha40 (included)

## Features

- Contains one simple API for interacting with scene and models
- Supports `.vrm` file loading, including:
    + Unity Humanoid bone mapping
    + [BlendShape](https://vrm.dev/univrm/components/univrm_blendshape/) morphing
    + [Secondary Animation](https://vrm.dev/univrm/components/univrm_secondary/)
    + [MToonMaterial](https://github.com/phantom-software-AZ/babylon-mtoon-material)

## Usage

### In browser

*Some browsers like IE11 are not supported.*

Please see [examples/browser](./examples/browser) for an example.

### On Babylon.js Playgound

Currently not possible, since our Babylon.js fork is modified.

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
   cd lib/Babylon.js && npm install
   cd Tools/Gulp && npm install
   gulp typescript-libraries
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
