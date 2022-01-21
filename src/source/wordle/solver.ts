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
  matchPositions: Set<number>;
  forbiddenPositions: Set<number>;
}

interface GameApp {
  gameStatus: 'IN_PROGRESS' | 'FAIL' | 'WIN';
  boardState: string[];
  rowIndex: number;
}

const isDebug = false;
const wordle: any = window.wordle;
const dictionary: string[] = window['dictionary'];

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

function letterCountInString(string_: string, letter: string): number {
  const reg = new RegExp(letter, 'g');

  return (string_.match(reg) ?? []).length;
}

function letterCountInRow(rowInfo: LetterInfo[], letter: string): number {
  let count = 0;

  for (const letterInfo of rowInfo) {
    if (letterInfo.letter === letter && letterInfo.type !== 'absent') {
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
    const letter = cellElement.textContent ?? '';
    let cellType: 'absent' | 'present' | 'correct';

    switch (cellElement.dataset['state']) {
      case 'absent': {
        cellType = 'absent';

        break;
      }

      case 'present': {
        cellType = 'present';

        break;
      }

      case 'correct': {
        cellType = 'correct';

        break;
      }

      default: {
        if (isDebug) {
          console.error(`Letter "${letter}" on cell index ${j} do not have any valid type!`, rowElement);
        }

        cellType = 'absent';
      }
    }

    rowInfo.push({letter, type: cellType, index: j});
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
        matchPositions: new Set(),
        forbiddenPositions: new Set(),
      });
    }

    switch (letterInfo.type) {
      case 'absent': {
        lettersFilters.get(letterInfo.letter)!.countType = 'exact';

        break;
      }

      case 'present': {
        lettersFilters.get(letterInfo.letter)!.forbiddenPositions.add(letterInfo.index);

        break;
      }

      case 'correct': {
        lettersFilters.get(letterInfo.letter)!.matchPositions.add(letterInfo.index);

        break;
      }
    // No default
    }
  }
}

function filterDictionary(dictionary: string[], lettersFilters: Map<string, LetterFilter>, wordSize: number): string {
  let potentialWords: string[] = [];

  potentialWords = dictionary.filter(word => {
    if (word.length !== wordSize) {
      return false;
    }

    for (const [letter, info] of lettersFilters) {
      const occurenceCount = letterCountInString(word, letter);

      if (info.countType === 'min' && occurenceCount < info.count) {
        return false;
      }

      if (info.countType === 'exact' && occurenceCount !== info.count) {
        return false;
      }

      for (const letterPosition of info.forbiddenPositions) {
        if (word[letterPosition] === letter) {
          return false;
        }
      }

      for (const letterPosition of info.matchPositions) {
        if (word[letterPosition] !== letter) {
          return false;
        }
      }
    }

    return true;
  });

  if (isDebug) {
    console.log('Potential words list', potentialWords);
  }

  // We count the number of vowels for each potential words
  const wordsWithVowelCount = new Map<string, number>();
  for (const word of potentialWords) {
    const count = word.replaceAll('[^AEIOU]', '').length;

    wordsWithVowelCount.set(word, count);
  }

  const maxVowelCount = Math.max(...wordsWithVowelCount.values());

  potentialWords = [...wordsWithVowelCount.entries()].filter(entry => entry[1] === maxVowelCount).map(entry => entry[0]);

  // We return a word with the highest count of vowels
  const finalWord = potentialWords[Math.floor(Math.random() * potentialWords.length)]!;

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
    const game: GameApp = new window.wordle.bundle.GameApp();
    const currentLineIndex = game.rowIndex;
    const gridRows = getGameElement()?.querySelectorAll('game-row')!;
    const wordSize = gridRows[0]!.shadowRoot!
      .querySelector('div[class="row"]')!
      .querySelectorAll('game-tile')!.length;

    if (currentLineIndex > 0) {
      const rowInfo = constructRowInfo(gridRows[currentLineIndex - 1]!);

      constructFiltersQuery(rowInfo, lettersFilters);
    }

    if (isDebug) {
      console.log('Letters filters', lettersFilters);
    }

    const finalWord = filterDictionary(dictionary, lettersFilters, wordSize);

    if (isDebug) {
      console.log('Final word to write', finalWord);
    }

    sendWordToVirtualKeyboard(finalWord);

    await new Promise(resolve => setTimeout(resolve, 3000));

    if (isDebug) {
      console.log('-----------------------------------------');
    }
  }
}

(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isGameStartedOrFinished = !isGameNotStarted();

  if (isGameStartedOrFinished) {
    return;
  }

  const divContenu = getGameElement();
  const divGameModal = getGameElement()!.querySelector('game-modal');
  const divResolve = document.createElement('div');
  const buttonResolve = document.createElement('button');

  divResolve.append(buttonResolve);
  divContenu?.insertBefore(divResolve, divGameModal);

  buttonResolve.append(document.createTextNode('Solve!'));

  buttonResolve.addEventListener('click', async function handler() {
    this.removeEventListener('click', handler);
    await startGame(dictionary);
    divResolve.remove();
    if (isDebug) {
      console.log('Game finished!');
    }
  });
})();
