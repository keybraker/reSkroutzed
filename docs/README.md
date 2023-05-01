# Skroutz sponsored flagger

Skroutz Sponsored Flagger is a browser extension that detects and highlights sponsored products on [skroutz.gr](https://skroutz.gr). It is available for download on the [Chrome Extension store](https://chrome.google.com/webstore/detail/skroutz-sponsored-flagger/amglnkndjeoojnjjeepeheobhneeogcl) and can be installed on any Chromium-powered browser or Firefox.

## Why use Skroutz sponsored flagger?

Skroutz has been using dark patterns to mislead consumers into purchasing sponsored products (advertisements).
The purpose of this extension is to make it easier for consumers to identify which products are sponsored and which ones are not, so they can make informed purchasing decisions.
It also gives the consumer the ability to hide the sponsored products if they so wish to.

## Installation

To install the extension via Github, simply download the source code from this repository, run command:

### Load on Chrome

```bash
npm run build:chrome
```

and load the build extension by clicking `Load unpacked` at `chrome://extensions/` and clicking on the `dist` folder.

### Load on Firefox

```bash
npm run build:firefox
```

and load the build extension from folder `dist`.

### Showcase

|                                                  |                                                   |
| :----------------------------------------------- | :------------------------------------------------ |
| ![Alt Text](../assets/showcase_listings.jpg)     | ![Alt Text](../assets/showcase_listings2.jpg)     |
| ![Alt Text](../assets/showcase_product_list.jpg) | ![Alt Text](../assets/showcase_product_list2.jpg) |

## Contributing

Contributions are always welcome! If you have any suggestions or improvements, feel free to submit a pull request.

## License

This extension is licensed under the GNU general public license. See the LICENSE file for more details.
