declare module 'size-plugin';
declare module 'webpack-merge-and-include-globally';

declare module 'webextension-polyfill' {
  export = browser;
}

interface Window {
  wordle: any;
}
