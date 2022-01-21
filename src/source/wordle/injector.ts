const scriptSolver = document.createElement('script');
const scriptDictionary = document.createElement('script');

scriptSolver.src = chrome.extension.getURL('wordle/solver.js');
scriptDictionary.src = chrome.extension.getURL('wordle/dictionary_en.js');

scriptDictionary.addEventListener('load', () => {
  document.head.append(scriptSolver);
});

document.head.append(scriptDictionary);
