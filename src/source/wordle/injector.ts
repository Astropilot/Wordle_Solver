const scriptSolver = document.createElement('script');
const scriptDictionnary = document.createElement('script');

scriptSolver.src = chrome.extension.getURL('wordle/solver.js');
scriptDictionnary.src = chrome.extension.getURL('wordle/dictionnary_en.js');

scriptDictionnary.onload = () => {
  document.head.append(scriptSolver);
};

document.head.append(scriptDictionnary);
