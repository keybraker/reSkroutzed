# ![Alt Text](../icons/48.png) reSkroutzed

### reSkroutzed is a browser extension that enhances the shopping experience on [skroutz.gr](https://skroutz.gr).<br>

|              | Firefox                                                                                                       | Chrome                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Users**    | ![Firefox Add-on Users](https://img.shields.io/amo/users/reskroutzed)                                         | ![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/amglnkndjeoojnjjeepeheobhneeogcl)                               |
| **Version**  | ![Firefox Version](https://img.shields.io/amo/v/reskroutzed)                                                  | ![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/amglnkndjeoojnjjeepeheobhneeogcl)                                 |
| **Rating**   | ![Firefox Rating](https://img.shields.io/amo/stars/reskroutzed)                                               | ![Chrome Rating](https://img.shields.io/chrome-web-store/rating/amglnkndjeoojnjjeepeheobhneeogcl)                                       |
| **Download** | [![Firefox](../imagery/store_images/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/reskroutzed) | [![Chrome](../imagery/store_images/chrome.png)](https://chrome.google.com/webstore/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl) |

## Why it was made?

Skroutz has been using dark patterns to mislead consumers into purchasing sponsored products (advertisements).
The purpose of this extension is to make it easier for consumers to identify which products are sponsored and which are not, so they can make informed purchasing decisions.
It also gives the consumer the ability to hide the sponsored products if they so wish to.

## Where we are now?

reSkroutzed, is a must-have enhancer for website skroutz.gr.

It assists you by making clear what products are ads and giving you the means to remove them.

The price checker makes sure the amount displayed on the product is actually the lowest. For those that "Buy through skroutz" is worth more than buying through a store directly, they can easily select a price difference threshold.

Dark mode is now as easy as clicking one button.

The all new universal selector on the bottom left side of the screen is always there to help you tailor make the experience browsing as you wish!

| ![Screenshot 1](../imagery/chrome/chrome_1280x800_screenshot_1.jpeg) | ![Screenshot 2](../imagery/chrome/chrome_1280x800_screenshot_2.jpeg) |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Screenshot 3](../imagery/chrome/chrome_1280x800_screenshot_3.jpeg) | ![Screenshot 4](../imagery/chrome/chrome_1280x800_screenshot_4.jpeg) |

## Additional functionality

- Lowest price checker outside of _"Buy through Skroutz"_
  - Minimum price difference, option to ignore price differences smaller than threshold
- Dark mode
- Sponsored (Ad) product flagging and removal
  - products in category view
  - stores before product price comparison list
  - frequently bought together
  - videos
  - sponsorships
  - banners
- Available on mobile (Firefox only)

## Development guide (for contributing)

To install the extension via GitHub, simply download the source code from this repository, and follow the instructions based on the browser you wish to load it on.

### Install Dependencies

```bash
# Install all required dependencies
npm install
```

For development, you can use:

### Development Mode

```bash
# Install web-ext to deploy the live browser

npm install --save-dev web-ext
```

```bash
# run locally for development

npm run dev:chrome

# or

npm run dev:firefox
```

These commands will start the extension in development mode with hot reload enabled, making it easier to see your changes in real-time while developing.

### Build

#### Build for Chrome

```bash
npm run build:chrome
```

The extension will be built in the `build/chrome_build` folder. To load it in Chrome:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `build/chrome_build` folder
4. The extension should now appear in your extensions list

#### Build for Firefox

```bash
npm run build:firefox
```

The extension will be packaged as `build/firefox_build.zip`. To load it in Firefox:

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `build/firefox_build.zip` file
4. The extension should now be loaded and active

## Contributing

Contributions are always welcome!

If you have any suggestions for improvements or are facing a bug, feel free to submit a [pull request](https://github.com/keybraker/reskroutzed/discussions).<br>
[Pull requests](https://github.com/keybraker/reskroutzed/pulls) for known problems or ones that solve requests or bugs are very welcome (follow the [Manual Installation](#manual-installation) to start developing!).

## License

This extension is licensed under the GNU general public license. See the LICENSE file for more details.

[![Run Tests](https://github.com/keybraker/reSkroutzed/actions/workflows/tests.yml/badge.svg)](https://github.com/keybraker/reSkroutzed/actions/workflows/tests.yml)
