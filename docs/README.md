# ![Alt Text](../src/assets/icons/48.png) Skroutz Sponsored Flagger

Skroutz Sponsored Flagger is a browser extension that detects and highlights sponsored products on [skroutz.gr](https://skroutz.gr).<br>

![Alt Text](../assets/large_promo.png)

## Why use Skroutz Sponsored Flagger?

Skroutz has been using dark patterns to mislead consumers into purchasing sponsored products (advertisements). The purpose of this extension is to make it easier for consumers to identify which products are sponsored and which are not, so they can make informed purchasing decisions. It also gives the consumer the ability to hide the sponsored products if they so wish to.

Extra features include:
- Lowest price checker outside of "Buy through Skroutz"
- Product page sponsored flagging and removal
- Frequently bought together sponsored flagging and removal
- Advertisement overview inside of the popup

## Manual Installation (for contributing)

To install the extension via Github, simply download the source code from this repository, and follow the instructions based on the browser you wish to load it on.

### Load on Chrome

```bash
npm run build:chrome
```
and load the build extension by clicking `Load unpacked` at `chrome://extensions/` and clicking on the `build/chrome_build` folder.

### Load on Firefox

```bash
npm run build:firefox
```

and load the build extension from `build/firefox_build.zip` file.

## Contributing

Contributions are always welcome!

If you have any suggestions for improvements or are facing a bug, feel free to submit a [pull request](https://github.com/keybraker/skroutz-sponsored-flagger/discussions).<br>
[Pull requests](https://github.com/keybraker/skroutz-sponsored-flagger/pulls) for known problems or ones that solve requests or bugs are very welcome (follow the [Manual Installation](#manual-installation) to start developing!).

## License

This extension is licensed under the GNU general public license. See the LICENSE file for more details.

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/skroutz-sponsored-flagger">
    <img src="../assets/store_images/firefox.png" alt="Firefox" width="300" style="vertical-align: middle;">
  </a>
  <a href="https://chrome.google.com/webstore/detail/skroutz-sponsored-flagger/amglnkndjeoojnjjeepeheobhneeogcl">
    <img src="../assets/store_images/chrome.png" alt="Chrome" width="300" style="vertical-align: middle;">
  </a>
</p>
