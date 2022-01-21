interface Window {
  [key: string]: any;
}

interface LetterInfo {
  letter: string;
  type: 'absent' | 'present' | 'correct';
  index: number;
}

interface LetterFilter {
  count: number;
  countType: 'min' | 'exact';
  matchPositions: number[];
  forbiddenPositions: number[];
}

interface GameApp {
  gameStatus: 'IN_PROGRESS' | 'FAIL' | 'WIN';
  boardState: string[];
  rowIndex: number;
}

const IS_DEBUG = false;
const wordle: any = window['wordle'];
const dictionary = window['dictionary'];

function getGameElement(): Element | null | undefined {
  return document.querySelector('body > game-app')
      ?.shadowRoot?.querySelector('game-theme-manager')
      ?.querySelector('#game');
}

function getKeyboardElement(): Element | null | undefined {
  return getGameElement()
      ?.querySelector('game-keyboard')
      ?.shadowRoot?.querySelector('#keyboard');
}

function isGameFinished(): boolean {
  const game: GameApp = new wordle.bundle.GameApp();

  return game.gameStatus !== 'IN_PROGRESS';
}

function isGameNotStarted(): boolean {
  const game: GameApp = new wordle.bundle.GameApp();

  return game.gameStatus === 'IN_PROGRESS' && game.rowIndex === 0;
}

function letterCountInString(str: string, letter: string): number {
  const reg = new RegExp(letter, 'g');

  return (str.match(reg) || []).length;
}

function letterCountInRow(rowInfo: LetterInfo[], letter: string): number {
  let count = 0;

  for (const letter_info of rowInfo) {
    if (letter_info.letter === letter && letter_info.type !== 'absent') {
      count++;
    }
  }

  return count;
}

function constructRowInfo(rowElement: Element): LetterInfo[] {
  const letterCellElements = rowElement.shadowRoot
    ?.querySelector('div[class="row"]')
    ?.querySelectorAll('game-tile')!;
  const rowInfo: LetterInfo[] = [];

  // We construct our row with easy to access information for each letter
  for (let j = 0; j < letterCellElements.length; j++) {
    const cellElement = letterCellElements.item(j).shadowRoot!.querySelector<HTMLElement>('div[class="tile"]')!;
    const letter = cellElement.textContent || '';
    let cellType: 'absent' | 'present' | 'correct';

    if (cellElement.dataset['state'] === 'absent') {
      cellType = 'absent';
    } else if (cellElement.dataset['state'] === 'present') {
      cellType = 'present';
    } else if (cellElement.dataset['state'] === 'correct') {
      cellType = 'correct';
    } else {
      if (IS_DEBUG) console.error(`Letter "${letter}" on cell index ${j} do not have any valid type!`, rowElement);
      cellType = 'absent';
    }

    rowInfo.push({ letter: letter, type: cellType, index: j });
  }

  return rowInfo;
}

function constructFiltersQuery(rowInfo: LetterInfo[], lettersFilters: Map<string, LetterFilter>): void {
  for (const letterInfo of rowInfo) {
    const letterCount = letterCountInRow(rowInfo, letterInfo.letter);

    if (lettersFilters.has(letterInfo.letter)) {
      lettersFilters.get(letterInfo.letter)!.count = letterCount;
    } else {
      lettersFilters.set(letterInfo.letter, {
        count: letterCount,
        countType: 'min',
        matchPositions: [],
        forbiddenPositions: []
      });
    }

    if (letterInfo.type === 'absent') {
      lettersFilters.get(letterInfo.letter)!.countType = 'exact';
    } else if (letterInfo.type === 'present') {
      lettersFilters.get(letterInfo.letter)!.forbiddenPositions.push(letterInfo.index);
    } else if (letterInfo.type === 'correct') {
      lettersFilters.get(letterInfo.letter)!.matchPositions.push(letterInfo.index);
    }
  }
}

function filterDictionary(dictionnary: string[], lettersFilters: Map<string, LetterFilter>, wordSize: number): string {
  let potentialWords: string[] = [];

  potentialWords = dictionnary.filter(word => {
    if (word.length !== wordSize) return false;

    for (const [letter, info] of lettersFilters) {
      var occurence_count = letterCountInString(word, letter);

      if (info.countType === 'min' && occurence_count < info.count) return false;
      else if (info.countType === 'exact' && occurence_count !== info.count) return false;

      for (const letterPosition of info.forbiddenPositions) {
        if (word[letterPosition] === letter) return false;
      }

      for (const letterPosition of info.matchPositions) {
        if (word[letterPosition] !== letter) return false;
      }
    }
    return true;
  });

  if (IS_DEBUG) console.log('Potential words list', potentialWords);

  // We count the number of vowels for each potential words
  const wordsWithVowelCount = new Map<string, number>();
  for (const word of potentialWords) {
    const count = word.replaceAll('[^AEIOU]', '').length;

    wordsWithVowelCount.set(word, count);
  }

  const maxVowelCount = Math.max(...wordsWithVowelCount.values());

  potentialWords = [...wordsWithVowelCount.entries()].filter(entry => entry[1] === maxVowelCount).map(entry => entry[0]);

  // We return a word with the highest count of vowels
  const finalWord = potentialWords[Math.floor(Math.random()*potentialWords.length)]!;

  return finalWord;
}

function sendWordToVirtualKeyboard(word: string): void {
  for (const letter of word) {
    getKeyboardElement()?.querySelector<HTMLElement>(`button[data-key="${letter.toLowerCase()}"]`)?.click();
  }
  getKeyboardElement()?.querySelector<HTMLElement>('button[data-key="↵"]')?.click();
}

async function startGame(dictionary: string[]) {
  const lettersFilters = new Map<string, LetterFilter>();

  while (!isGameFinished()) {
    const game: GameApp = new window['wordle'].bundle.GameApp();
    const currentLineIndex = game.rowIndex;
    const gridRows = getGameElement()?.querySelectorAll('game-row')!;
    const wordSize = gridRows[0]!.shadowRoot!
                        .querySelector('div[class="row"]')!
                        .querySelectorAll('game-tile')!.length;

    if (currentLineIndex > 0) {
      const rowInfo = constructRowInfo(gridRows[currentLineIndex - 1]!);

      constructFiltersQuery(rowInfo, lettersFilters);
    }

    if (IS_DEBUG) console.log('Letters filters', lettersFilters);

    const finalWord = filterDictionary(dictionary, lettersFilters, wordSize);

    if (IS_DEBUG) console.log('Final word to write', finalWord);

    sendWordToVirtualKeyboard(finalWord);

    await new Promise(resolve => setTimeout(resolve, 3000));

    if (IS_DEBUG) console.log('-----------------------------------------');
  }
}

(async () => {

  await new Promise(resolve => setTimeout(resolve, 2000));

  const isGameStartedOrFinished = !isGameNotStarted();

  if (isGameStartedOrFinished) return;

  const divContenu = getGameElement();
  const divGameModal = getGameElement()!.querySelector('game-modal');
  const divResolve = document.createElement('div');
  const buttonResolve = document.createElement('button');

  divResolve.appendChild(buttonResolve);
  divContenu?.insertBefore(divResolve, divGameModal);

  buttonResolve.appendChild(document.createTextNode('Solve!'));

  buttonResolve.addEventListener('click', async function handler() {
    this.removeEventListener('click', handler);
    await startGame(dictionary);
    divResolve.remove();
    if (IS_DEBUG) console.log('Game finished!');
  });
})();
