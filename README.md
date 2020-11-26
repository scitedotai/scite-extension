# Scite Extension #

## Building ##

```
$ npm i
$ npm run build
```

Then the extension is in `extension`

## Developing ##

For local development you can use [web-ext](https://github.com/mozilla/web-ext) which will run the extension in a browser and reload any change to the build. You can manually build like above or use `npm run watch build` to automatically build any changes you make to src.
```
$ npm run dev # run web-ext
$ npm run watch build # build any changes you make to src.
```

Use web-ext lint to lint your changes
```
$ npm run lint
```

Once you are ready to deploy you may use the build you have run to sideload into firefox and chrome to test the extension to check that works.

## Releasing ##

1. Bump the version in `package.json` and `manifest.json` and commit
2. Tag the release (e.g.):

```bash
$ git tag v1.10.0 -m "My cool new version"
$ git push origin v1.10.0
```

3. Build the extension

```bash
$ npm run build
```

Then for Chrome:

```bash
$ zip -r extension.zip extension/*
```

1. Go to the [developer dashboard](https://chrome.google.com/webstore/developer/dashboard)
1. Click on the extension (if you do not see it check you are looking at the right `scite` publisher in the top right)
1. Click `package` on the left
1. Click upload new package
1. Click submit for review

Then for Firefox:

```bash
$ zip -r extension-full.zip . -x "node_modules/*" -x ".cache/*" -x ".git/*"
$ cd extension
$ zip -r ../extension.zip .
```

1. Go to the [developer dashboard](https://addons.mozilla.org/en-US/developers/addons)
1. Click `New version`
1. Click `Select file` and select the new `extension.zip`
1. Click `Continue`, `Yes`, `Upload source code` and select `extension-full.zip`
1. Click `Continue`, write some release note(s) and submit!

## Scite API Terms ##

https://scite.ai/apiterms
