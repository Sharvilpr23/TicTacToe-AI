//HTML Elements
const statusDiv = document.querySelector('.status')
const resetDiv = document.querySelector('.reset')
const cellDivs =document.querySelectorAll('.game-cell')

// Game Constants
const xSymbol = '✕';
const oSymbol = '〇';

const human = 'x';
const ai = 'o';

const scores = {
    'x': -1,
    'o': 1,
    'draw': 0
};

const players = [
    human, ai
]

//Game variables
let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

let currentPlayer = human;
let isGameLive = true;
let boardLength = 3; // Default boardLength set to 3
let gameCounter = 0; // Counts the number of rounds

/*
    Returns the token symbol corresponding to the player
*/ 
const lettertoSymbol = (letter) => letter === 'x' ? xSymbol : oSymbol;

/*
    Places the token on the board
*/
const placeToken = (position, currentPlayer) => {
    board[Math.floor(position / boardLength)][position % boardLength] = currentPlayer;
    cellDivs[position].classList.add(`${currentPlayer}`)
}

/*
    Returns the list of available spots on the grid
*/
const getAvailableSpots = () => {
    let freeSpots = [];
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            if(board[i][j] == '') {
                freeSpots.push((i * boardLength) + j);
            }
        }
    }
    return freeSpots;
}

/*
    Calculates the next best spot for the player to place the token using
    the Minimax algorithm. 
*/
const nextMove = () => {
    let bestScore = -Infinity;

    // Return if no available spots 
    if(getAvailableSpots().length === 0) return;

    let I = 0;
    let J = 0;
    for(let i = 0; i < 3; i++) {
       for(let j = 0; j < 3; j++) {
           if(board[i][j] === '') {
                board[i][j] = currentPlayer;
                let score = minimax(false, -Infinity, Infinity);
                board[i][j] = '';
                if(score > bestScore) {
                    bestScore = score;
                    I = i;
                    J = j;
                }
            }
        }
    }
    placeToken(((I * 3) + J), currentPlayer);
}

/*
    Sets up the game board
*/
const setup = () => {
    if(currentPlayer == ai) {
        nextMove();
        let winner = checkGameStatus();
        if(winner != null) endGame(winner);
        currentPlayer = human;
    }
}

/*
    Sets the game status to inactive and prints the result to the board
*/
const endGame = (result) => {
    isGameLive = false;
    if (result === 'draw') {
        statusDiv.innerHTML = `It's a Draw!`;
    } else {
        statusDiv.innerHTML = `${lettertoSymbol(result)} is the Winner!`;
    }
}

/*
    Checks if the 3 provided values match
*/
const checkForWin = (a, b, c) => {
    return a != '' && a === b && b === c;
}

/*
    Checks the game status:
        1. Any horizontal matches
        2. Any vertical matches
        3. Any diagonal matches
        4. If a draw occurred
*/
const checkGameStatus = () => {
    let winner = null;

    // Check for horizontal match 
    for(let i = 0; i < 3; i++) {
        if(checkForWin(board[i][0], board[i][1], board[i][2])) {
            winner = board[i][0];
        }
    }

    // Check for vertical match
    for(let i = 0; i < 3; i++) {
        if(checkForWin(board[0][i], board[1][i], board[2][i])) { 
            winner = board[0][i];
        }
    }

    // Check for left diagonal
    if(checkForWin(board[0][0], board[1][1], board[2][2])) { 
        winner = board[0][0];
    }

    // Check for right diagonal
    if(checkForWin(board[2][0], board[1][1], board[0][2])) { 
        winner = board[2][0];
    }

    // Check for draw
    if(getAvailableSpots().length === 0 && winner === null) 
        winner = 'draw';

    return winner;
};

/*
    A decision making algorithm that minimizes the possible loss for a worst
    case scenario using alpha - beta pruning
*/
const minimax = (isMaximizing, alpha, beta) => {
    let result = checkGameStatus();
    if(result !== null) {
        return scores[result];
    }

    if(isMaximizing) {
        let bestScore = -Infinity;
        for(let i = 0; i < 3; ++i) {
            for(let j = 0; j < 3; ++j) {
                if(board[i][j] === '') {
                    board[i][j] = ai;
                    let score = minimax(false, alpha, beta);
                    board[i][j] = '';
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, score)
                    if(beta <= alpha) break;
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for(let i = 0; i < 3; ++i) {
            for(let j = 0; j < 3; ++j) {
                if(board[i][j] === '') {
                    board[i][j] = human;
                    let score = minimax(true, alpha, beta);
                    board[i][j] = '';
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, score)
                    if(beta <= alpha) break;
                }
            }
        }
        return bestScore;
    }
}

// Event Handlers
const handleReset = () => {
    statusDiv.innerHTML = `${xSymbol} to Play`;
    for(const cellDiv of cellDivs){
        cellDiv.classList.remove('x');
        cellDiv.classList.remove('o');
    }
    isGameLive = true;
    for(let i = 0; i < boardLength; i++) {
        for(let j = 0; j < boardLength; j++) {
            board[i][j] = '';
        }
    }
    currentPlayer = players[gameCounter++ % 2]
    if(currentPlayer == ai) {
        setup();
    }
};


const handleCellClick = (e) => {
    const classList = e.target.classList;
    
    if(!isGameLive || classList[2] === 'x' || classList[2] === 'o'){
        return;
    }

    if(currentPlayer == human) {
        placeToken(parseInt(classList[1]), currentPlayer);
        let winner = checkGameStatus();
        if(winner != null) endGame(winner);
        currentPlayer = ai;
        nextMove();
        winner = checkGameStatus();
        if(winner != null) endGame(winner);
        currentPlayer = human;
    }
};

setup();

// Event Listeners
resetDiv.addEventListener('click', handleReset);

for(const cellDiv of cellDivs) {
    cellDiv.addEventListener('click', handleCellClick);
}
