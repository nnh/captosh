captosh
=====

This application capture contents of a browser and saves them as pdf files in a local folder.
[[Download captosh]](https://github.com/nnh/captosh/releases)


## How to build

## Build electron app for Windows and macOS

```
yarn package
```

## Structures of Directory

- root
  - src: Source directory.
  - __tests__: Test files.
  - build/installer.nsh: The custom installation file for electron-builder for Windows. Register a custom URL scheme of captosh:// in the registry.
  - app: The root directory where electon will be run. At packaging, this folder will be the source.
  - dist: The packaged Windows/Mac binaries will be output.

## gulp tasks.

|task             |description|
|-----------------|-----------|
|gulp webpackBuild|Transpile to sources that can work with electron|
|gulp bundleJsDev |Build sources for development|
|gulp compileCss  |Compile SCSSs to CSSs|
|gulp compileHtml |Compile PUG to HTML|
|gulp copyFont    |Copy fonts to electron|
|gulp watch       |Watch sources and build|
|gulp serve       |Start electron and restart it if the sources change|
|gulp packageMac  |Build electron for Mac|
|gulp packageWin  |Build electron for Windows|
|gulp clean       |Delete app dir|
|gulp compile     |Excute compileCss, compileHtml|
|gulp             |Default task. Excute bundleJsDev, compile, copyFont|
|gulp packagePrepare|Excute bundleJsPro, compile, copyFont|
|gulp dev         |Excute defaultTask, watch, serve|
|gulp devVs       |Excute defaultTask, watch|
|gulp pack        |Excute packagePrepare, packageMac, packageWin|


[![MIT licensed][shield-license]](#)

License
-------
eclipro are licensed under the [MIT](#) license.  
Copyright &copy; 2018, NHO Nagoya Medical Center and NPO-OSCR

[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
