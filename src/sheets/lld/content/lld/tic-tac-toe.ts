import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-tic-tac-toe',
  title: 'Tic-Tac-Toe LLD',
  section: 'lld',
  chapter: 'Case Studies',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['lld-methodology'],
  summary:
    'Model board, players, moves, and win/draw detection with clean separation — a small game that still teaches invariants and turn state.',
  keywords: ['tic tac toe', 'game', 'board', 'lld'],
  why:
    'Tic-Tac-Toe is a gentle LLD that still surfaces real issues: validating moves, alternating turns, win strategies, and extending to NxN.',
  theory: [
    'Requirements: 3x3 board, two players X/O, alternate turns, detect win/draw, reject illegal moves.',
    'Entities: Player, Board, Cell/Mark, Game, Move.',
    'Invariants: cannot play on occupied cell; cannot play out of turn; game stops after terminal state.',
    'Win detection: rows, columns, diagonals — extract WinStrategy for NxN / custom rules.',
    'Optional: undo stack (Command), bot player (Strategy).',
    'API: start(), play(row,col), status(), boardSnapshot().',
  ],
  mentalModel:
    'A referee holds the board and the rulebook. Players only propose moves; the referee validates, applies, checks victory, and switches turns.',
  codeTitle: 'Simple Game controller',
  code: `enum Mark { X, O, EMPTY }

class Board {
    private final Mark[][] grid = new Mark[3][3];
    Board() {
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 3; j++)
                grid[i][j] = Mark.EMPTY;
    }

    boolean place(int r, int c, Mark m) {
        if (r < 0 || r > 2 || c < 0 || c > 2) return false;
        if (grid[r][c] != Mark.EMPTY) return false;
        grid[r][c] = m;
        return true;
    }

    boolean wins(Mark m) {
        for (int i = 0; i < 3; i++) {
            if (grid[i][0] == m && grid[i][1] == m && grid[i][2] == m) return true;
            if (grid[0][i] == m && grid[1][i] == m && grid[2][i] == m) return true;
        }
        return (grid[0][0] == m && grid[1][1] == m && grid[2][2] == m)
            || (grid[0][2] == m && grid[1][1] == m && grid[2][0] == m);
    }

    boolean full() {
        for (Mark[] row : grid)
            for (Mark cell : row)
                if (cell == Mark.EMPTY) return false;
        return true;
    }
}

class Game {
    private final Board board = new Board();
    private Mark turn = Mark.X;
    private boolean over;

    public String play(int r, int c) {
        if (over) return "Game over";
        if (!board.place(r, c, turn)) return "Invalid move";
        if (board.wins(turn)) {
            over = true;
            return turn + " wins";
        }
        if (board.full()) {
            over = true;
            return "Draw";
        }
        turn = (turn == Mark.X) ? Mark.O : Mark.X;
        return "OK next=" + turn;
    }
}

public class Demo {
    public static void main(String[] args) {
        Game g = new Game();
        System.out.println(g.play(0, 0));
        System.out.println(g.play(1, 1));
        System.out.println(g.play(0, 1));
        System.out.println(g.play(2, 2));
        System.out.println(g.play(0, 2));
    }
}`,
  output: `OK next=O
OK next=X
OK next=O
OK next=X
X wins`,
  explain: [
    'Game owns turn and terminal flag — Board stays a grid + rules helper.',
    'Illegal moves do not flip the turn.',
    'Win check runs after each successful place.',
  ],
  mermaid: `stateDiagram-v2
    [*] --> XTurn
    XTurn --> OTurn: valid move
    OTurn --> XTurn: valid move
    XTurn --> Finished: win/draw
    OTurn --> Finished: win/draw`,
  mistakes: [
    'Letting UI mutate the grid directly.',
    'Flipping turns even when the move was invalid.',
    'Copy-pasting win logic without thinking about NxN extension.',
  ],
  interviewAsk: 'How would you extend Tic-Tac-Toe to NxN with K-in-a-row?',
  interviewAnswer:
    'Parameterize Board(n) and inject a WinStrategy that checks K consecutive marks in rows/cols/diagonals/maybe diagonals only as required. Keep Game orchestration the same. Discuss complexity of naive scans vs incremental counters for large N.',
  interviewTraps: [
    'Hard-coding 3 everywhere.',
    'No validation API.',
  ],
  quiz: {
    question: 'After an invalid move, the game should:',
    options: [
      'Switch turns anyway',
      'Keep the same turn and reject the move',
      'Reset the board',
      'Always declare a draw',
    ],
    correctIndex: 1,
    explain: 'Turn advances only on accepted moves.',
  },
  practice:
    'Add an undo() using a stack of moves. Ensure turn and over flags restore correctly.',
  practiceHints: [
    'Store row,col,mark on the stack.',
    'Clear the cell and flip turn back.',
  ],
});
