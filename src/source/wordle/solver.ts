interface Window {
  [key: string]: any;
}

interface LetterInfo {
  letter: string;
  type: 'missing' | 'misplaced' | 'correct';
  index: number;
}

interface LetterMisplaced {
  count: number;
  countType: 'min' | 'exact';
  forbiddenPositions: number[];
}

interface GameApp {
  gameStatus: 'IN_PROGRESS' | 'FAIL' | 'WIN';
  boardState: string[];
  rowIndex: number;
}

const IS_DEBUG = true;
const wordle: any = window['wordle'];
const dictionnary = window['dictionnary'];

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

function constructRegexQuery(row: Element): string {
  const rowCellElements = row.shadowRoot
    ?.querySelector('div[class="row"]')
    ?.querySelectorAll('game-tile')!;
  let regexQuery = '';

  rowCellElements.forEach(cellElement => {
    const cellTileElement = cellElement!.shadowRoot!.querySelector<HTMLElement>('div[class="tile"]')!;
    const cellLetter = cellTileElement.textContent!;
    const cellType = cellTileElement.dataset['state'];

    if (cellType === 'empty' || cellType !== 'correct')
      regexQuery += '.';
    else
      regexQuery += cellLetter;
  });

  return regexQuery;
}

function constructFiltersQuery(rowElement: Element, lettersInWord: Map<string, LetterMisplaced>, lettersNotInWord: Set<string>): void {
  const letterCellElements = rowElement.shadowRoot
    ?.querySelector('div[class="row"]')
    ?.querySelectorAll('game-tile')!;;
  let rowInfo: LetterInfo[] = [];

  // We construct our row with easy to access information for each letter
  for (let j = 0; j < letterCellElements.length; j++) {
    const cellElement = letterCellElements.item(j).shadowRoot!.querySelector<HTMLElement>('div[class="tile"]')!;
    const letter = cellElement.textContent || '';
    let cellType: 'missing' | 'misplaced' | 'correct';

    if (cellElement.dataset['state'] === 'absent') {
      cellType = 'missing';
    } else if (cellElement.dataset['state'] === 'present') {
      cellType = 'misplaced';
    } else if (cellElement.dataset['state'] === 'correct') {
      cellType = 'correct';
    } else {
      if (IS_DEBUG) console.error(`Letter "${letter}" on cell index ${j} do not have any type!`, rowElement);
      cellType = 'missing';
    }

    rowInfo.push({ letter: letter, type: cellType, index: j });
  }

  // For each "missing" letter, we add it to our letter exclude list
  for (const letter_info of rowInfo) {
    if (letter_info.type === 'missing') {
      lettersNotInWord.add(letter_info.letter);
    }
  }

  for (const letter_info of rowInfo) {
    if (letter_info.type === 'correct') {
      // If for any reason a correct letter is in the exclude list, we remove it
      if (lettersNotInWord.has(letter_info.letter))
        lettersNotInWord.delete(letter_info.letter);

      if (lettersInWord.has(letter_info.letter)) {
        const info = lettersInWord.get(letter_info.letter)!;

        lettersInWord.set(letter_info.letter, {
          count: info.count - 1,
          countType: info.count - 1 === 0 ? 'min' : info.countType,
          forbiddenPositions: info.forbiddenPositions
        });
      }
    } else if (letter_info.type === 'misplaced') {
      if (lettersInWord.has(letter_info.letter)) {
        const info = lettersInWord.get(letter_info.letter)!;
        let countLetter = 0;
        for (const li of rowInfo) {
          if (li.type === 'misplaced' && li.letter === letter_info.letter) {
            countLetter++;
          }
        }

        lettersInWord.set(letter_info.letter, {
          count: countLetter,
          countType: info.countType,
          forbiddenPositions: [...info.forbiddenPositions, letter_info.index]
        });
      } else {
        lettersInWord.set(letter_info.letter, {
          count: 1,
          countType: 'min',
          forbiddenPositions: [letter_info.index]
        });
      }

      if (lettersNotInWord.has(letter_info.letter)) {
        const info = lettersInWord.get(letter_info.letter)!;

        lettersInWord.set(letter_info.letter, {
          count: info.count,
          countType: 'exact',
          forbiddenPositions: info.forbiddenPositions
        });
        lettersNotInWord.delete(letter_info.letter);
      }
    }
  }
}

function filterDictionnaryFromQuery(dictionnary: string[], searchRegex: string, lettersInWord: Map<string, LetterMisplaced>, lettersNotInWord: Set<string>): string {
  let potentialWords: string[] = [];
  const wordRegex = new RegExp(`^${searchRegex}$`);

  // Step n°1: We filter out all words that do not match the regex (letters that are known to be correctly placed)
  potentialWords = dictionnary.filter(word => wordRegex.test(word));

  // Step n°2: We filter out all words that contains letters that cannot be in the final word
  potentialWords = potentialWords.filter(word => {
    for (const letter of lettersNotInWord) {
      if (word.includes(letter)) return false;
    }
    return true;
  });

  // Step n°3: Based on misplaced letters, we filter out words that have
  // too little or not the exact amount of a letter that we know.
  // Plus we check that for each impossible position we do not have
  // a unwanted letter.
  potentialWords = potentialWords.filter(word => {
    for (const [letter, info] of lettersInWord) {
      var occurence_count = letterCountInString(word, letter);

      if (info.countType === 'min' && occurence_count < info.count) return false;
      else if (info.countType === 'exact' && occurence_count !== info.count) return false;

      for (const letterPosition of info.forbiddenPositions) {
        if (word[letterPosition] === letter) return false;
      }
    }
    return true;
  });

  if (IS_DEBUG) console.log('Potential words list', potentialWords);

  // We count the number of vowels for each potential words
  // const wordsWithVowelCount = new Map<string, number>();
  // for (const word of potentialWords) {
  //   const count = word.replaceAll('[^AEIOU]', '').length;

  //   wordsWithVowelCount.set(word, count);
  // }

  // // We return the word with the highest count of vowels
  // const finalWord = [...wordsWithVowelCount.entries()].reduce((a, e) => e[1] > a[1] ? e : a)[0];
  const finalWord = potentialWords[Math.floor(Math.random()*potentialWords.length)]!;

  return finalWord;
}

function sendWordToVirtualKeyboard(word: string): void {
  for (const letter of word) {
    getKeyboardElement()?.querySelector<HTMLElement>(`button[data-key="${letter.toLowerCase()}"]`)?.click();
  }
  getKeyboardElement()?.querySelector<HTMLElement>('button[data-key="↵"]')?.click();
}

async function startGame(dictionnary: string[]) {
  const lettersInWord = new Map<string, LetterMisplaced>();
  const lettersNotInWord = new Set<string>();

  while (!isGameFinished()) {
    const game: GameApp = new window['wordle'].bundle.GameApp();
    const currentLineIndex = game.rowIndex;

    const gridRows = getGameElement()?.querySelectorAll('game-row')!;
    const searchRegex = constructRegexQuery(gridRows[(currentLineIndex - 1 < 0) ? 0 : currentLineIndex - 1]!);

    if (currentLineIndex > 0)
      constructFiltersQuery(gridRows[currentLineIndex - 1]!, lettersInWord, lettersNotInWord);

    if (IS_DEBUG) console.log('Word regex', searchRegex);
    if (IS_DEBUG) console.log('Letters that should be in the word', lettersInWord);
    if (IS_DEBUG) console.log('Letters that should not be in the word', lettersNotInWord);

    const finalWord = filterDictionnaryFromQuery(dictionnary, searchRegex, lettersInWord, lettersNotInWord);

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
    await startGame(dictionnary);
    divResolve.remove();
    if (IS_DEBUG) console.log('Game finished!');
  });
})();
