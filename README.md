<p align="center">
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩<br>
🟩⬛🟨⬛⬛⬛🟨⬛🟨🟨🟨🟨⬛🟨🟨🟨🟨⬛🟨🟨⬛⬛⬛🟨⬛⬛⬛🟨🟨🟨⬛🟩<br>
🟩⬛🟨⬛⬛⬛🟨⬛🟨⬛⬛🟨⬛🟨⬛⬛🟨⬛🟨⬛🟨⬛⬛🟨⬛⬛⬛🟨⬛⬛⬛🟩<br>
🟩⬛🟨⬛⬛⬛🟨⬛🟨⬛⬛🟨⬛🟨🟨🟨⬛⬛🟨⬛⬛🟨⬛🟨⬛⬛⬛🟨🟨🟨⬛🟩<br>
🟩⬛🟨⬛🟨⬛🟨⬛🟨⬛⬛🟨⬛🟨⬛🟨🟨⬛🟨⬛🟨⬛⬛🟨⬛⬛⬛🟨⬛⬛⬛🟩<br>
🟩⬛⬛🟨⬛🟨⬛⬛🟨🟨🟨🟨⬛🟨⬛⬛🟨⬛🟨🟨⬛⬛⬛🟨🟨🟨⬛🟨🟨🟨⬛🟩<br>
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
</p>
<h1 align="center">
<a href="https://powerlanguage.co.uk/wordle/">Wordle</a> Solver</h1>

<p align="center">
  <img src="https://img.shields.io/github/v/tag/Astropilot/Wordle_Solver">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-yellow.svg">
</p>

<p align="center">
    <a href="#"><img src="https://imgur.com/3C4iKO0.png" width="64" height="64"></a>
    <a href="#"><img src="https://imgur.com/ihXsdDO.png" width="64" height="64"></a>
    <a href="#edge"><img src="https://imgur.com/vMcaXaw.png" width="64" height="64"></a>
    <a href="#"><img src="https://imgur.com/EuDp4vP.png" width="64" height="64"></a>
    <a href="#"><img src="https://imgur.com/z8yjLZ2.png" width="64" height="64"></a>
    <a href="#"><img src="https://imgur.com/MQYBSrD.png" width="64" height="64"></a>
</p>

## A propos

> ⚠️ **No version available yet**: The links above do not work yet, please wait a few days

This small browser extension allows you to automatically solve the [Wordle](https://powerlanguage.co.uk/wordle/) game. The algorithm will try to guess the word from a dictionary of English words and from the clues given by the game (misplaced letters, well placed or not present in the word).

This project has no great vocation, the idea came to me while playing Wordle and trying to understand the types of information that could be retrieved from the given clues.<br>
I thought it would be challenging to program with the hints, rules to filter on a list of words and see how the program does. And for the moment it does well ;)

To use it, just install the extension, go to the Wordle page and after 2-3sec you will see a "Solve!" button below the keyboard. Just press it and let the magic of the algorithm work!<br>
**Note**: If the button does not appear it is most likely because you have already won/lost or started the game. My program waits for an unstarted game to run.

## Build/Run

### Prerequisites

* [Node.js](https://nodejs.org) v14+ and [npm.js](https://www.npmjs.com) v6+
* A web browser like [Firefox](https://www.mozilla.org/fr/firefox/new), [Chrome](https://www.google.fr/chrome) or [Edge](https://www.microsoft.com/edge)

To compile the extension
```sh
$ cd src/
$ npm install
$ npm run build
```

A `distribution/` folder is now created containing all the files for the web extension. <br>
Now you just have to load the application in your web browser.

You can use the following commands to open a Firefox or Chrome instance on a separate profile with the extension directly loaded and with the Wordle site open at startup:
```sh
# To launch an instance of Chrome
$ npm run start

# To launch an instance of Firefox
$ npm run start:firefox
```

Otherwise you can load the extension manually with the following instructions:

* Firefox
    * Type `about:debugging` in your address bar
    * Go to the tab on the left `This Firefox`.
    * In the `Temporary Extensions` section click on `Load a temporary add-on...` and navigate to the `distribution/` folder and choose the `manifest.json` file then `Open`.
    * The extension is now loaded and usable

* Chrome / Edge
    * Go to `chrome://extensions/` for Chrome or `edge://extensions/` for Edge
    * Activate the `Developer Mode`.
    * Click on `Load Unpacked Extension` / `Load Unpacked Item` then navigate to the `distribution/` folder and click OK
    * The extension is now loaded and usable

To automatically update the extension when you modify a file, use the command
```sh
$ npm run watch
```

## Licence

[MIT - LICENSE File](https://github.com/Astropilot/Wordle_Solver/blob/master/LICENSE)

---

> [Yohann Martin (@Astropilot)](https://codexus.fr) &nbsp;&middot;&nbsp;
> 2022
