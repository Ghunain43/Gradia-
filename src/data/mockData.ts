import {
  Course,
  DocumentNote,
  FocusSessionRecord,
  QuizResult,
  RevisionPlan,
  UserSettings,
} from '../types';
import { DEFAULT_MAJU_POLICY } from '../utils/calculations';

/**
 * Explicit demonstration profile (not official student records) for Ghunain Fayaz
 * Mohammad Ali Jinnah University (MAJU) — Faculty of Computing
 * BS Computer Science (Fall 2026)
 */
export const INITIAL_USER_SETTINGS: UserSettings = {
  profileMode: 'demo',
  studentName: 'Ghunain Fayaz',
  major: 'BS Computer Science',
  faculty: 'Faculty of Computing',
  university: 'Mohammad Ali Jinnah University (MAJU)',
  currentSemester: 'Fall 2026',
  priorCredits: 53,
  priorCgpa: 4.00,
  targetCgpa: 4.00,
  defaultAttendanceThreshold: 75,
  theme: 'dark',
  activeModel: '',
  gradingPolicy: DEFAULT_MAJU_POLICY,
};

/**
 * Confirmed course names/credits and rounded attendance; assessments, dates, rooms and schedules are illustrative sample records for Ghunain Fayaz (Total 17 credits currently in progress):
 * 1. Digital Logic Design (3 cr, 95% attendance)
 * 2. Database Management Systems Lab (1 cr, 100% attendance)
 * 3. Database Management Systems (3 cr, 95% attendance)
 * 4. Design and Analysis of Algorithms (3 cr, 94% attendance)
 * 5. Ideology and Constitution of Pakistan (2 cr, 93% attendance)
 * 6. Civics and Community Engagement (2 cr, 100% attendance)
 * 7. Digital Logic Design Lab (1 cr, 100% attendance)
 * 8. Entrepreneurship (2 cr, 83% attendance)
 */
export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-dld-301',
    code: 'CS 204',
    name: 'Digital Logic Design',
    credits: 3,
    instructor: 'Faculty of Computing',
    room: 'Lecture Hall Block C-101',
    schedule: 'Mon, Wed 08:30 - 10:00 AM',
    color: 'indigo',
    targetGrade: 'A',
    attendance: {
      totalClasses: 20,
      attendedClasses: 19, // 95%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'dld-a1', name: 'Midterm Examination', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 88, completed: true, dueDate: 'Oct 26' },
      { id: 'dld-a2', name: 'Quizzes Series (1-4)', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 92, completed: true, dueDate: 'Nov 04' },
      { id: 'dld-a3', name: 'Combinational Circuit Project', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 90, completed: true, dueDate: 'Nov 18' },
      { id: 'dld-a4', name: 'Comprehensive Final Exam', category: 'final', weightPercent: 45, maxScore: 100, completed: false, dueDate: 'Dec 15' },
    ],
  },
  {
    id: 'course-db-lab-305l',
    code: 'CS 305L',
    name: 'Database Management Systems Lab',
    credits: 1,
    instructor: 'Faculty of Computing',
    room: 'Software Systems Lab 2',
    schedule: 'Tue 02:00 - 05:00 PM',
    color: 'teal',
    targetGrade: 'A',
    attendance: {
      totalClasses: 14,
      attendedClasses: 14, // 100%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'dbl-a1', name: 'Midterm Lab Practical Exam', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 96, completed: true, dueDate: 'Oct 28' },
      { id: 'dbl-a2', name: 'SQL Schema & Queries Tasks', category: 'coursework', weightPercent: 25, maxScore: 100, currentScore: 98, completed: true, dueDate: 'Nov 12' },
      { id: 'dbl-a3', name: 'Final Database Project & Viva', category: 'final', weightPercent: 50, maxScore: 100, completed: false, dueDate: 'Dec 16' },
    ],
  },
  {
    id: 'course-dbms-305',
    code: 'CS 305',
    name: 'Database Management Systems',
    credits: 3,
    instructor: 'Faculty of Computing',
    room: 'Lecture Hall Block B-203',
    schedule: 'Tue, Thu 10:00 - 11:30 AM',
    color: 'sky',
    targetGrade: 'A',
    attendance: {
      totalClasses: 20,
      attendedClasses: 19, // 95%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'db-a1', name: 'Midterm Examination', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 90, completed: true, dueDate: 'Oct 30' },
      { id: 'db-a2', name: 'Normalization & ER Homework', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 94, completed: true, dueDate: 'Nov 06' },
      { id: 'db-a3', name: 'Transaction Management Quizzes', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 91, completed: true, dueDate: 'Nov 20' },
      { id: 'db-a4', name: 'Comprehensive Final Exam', category: 'final', weightPercent: 45, maxScore: 100, completed: false, dueDate: 'Dec 18' },
    ],
  },
  {
    id: 'course-algo-311',
    code: 'CS 311',
    name: 'Design and Analysis of Algorithms',
    credits: 3,
    instructor: 'Faculty of Computing',
    room: 'Lecture Hall Block A-102',
    schedule: 'Mon, Wed 11:30 AM - 01:00 PM',
    color: 'emerald',
    targetGrade: 'A',
    attendance: {
      totalClasses: 18,
      attendedClasses: 17, // 94.4% ~ 94%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'algo-a1', name: 'Midterm Examination', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 89, completed: true, dueDate: 'Nov 02' },
      { id: 'algo-a2', name: 'Divide & Conquer Problem Sets', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 93, completed: true, dueDate: 'Nov 10' },
      { id: 'algo-a3', name: 'Dynamic Programming Quizzes', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 85, completed: true, dueDate: 'Nov 22' },
      { id: 'algo-a4', name: 'Comprehensive Final Exam', category: 'final', weightPercent: 45, maxScore: 100, completed: false, dueDate: 'Dec 20' },
    ],
  },
  {
    id: 'course-pak-102',
    code: 'HU 102',
    name: 'Ideology and Constitution of Pakistan',
    credits: 2,
    instructor: 'Department of Humanities',
    room: 'Main Academic Block 105',
    schedule: 'Thu 08:30 - 10:30 AM',
    color: 'amber',
    targetGrade: 'A',
    attendance: {
      totalClasses: 15,
      attendedClasses: 14, // 93.3% ~ 93%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'pak-a1', name: 'Midterm Examination', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 91, completed: true, dueDate: 'Nov 03' },
      { id: 'pak-a2', name: 'Constitutional Articles Analysis', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 92, completed: true, dueDate: 'Nov 15' },
      { id: 'pak-a3', name: 'Historical Context Quizzes', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 90, completed: true, dueDate: 'Nov 25' },
      { id: 'pak-a4', name: 'Final Examination', category: 'final', weightPercent: 45, maxScore: 100, completed: false, dueDate: 'Dec 21' },
    ],
  },
  {
    id: 'course-civics-108',
    code: 'HU 108',
    name: 'Civics and Community Engagement',
    credits: 2,
    instructor: 'Department of Humanities',
    room: 'Seminar Hall Block B',
    schedule: 'Fri 09:00 - 11:00 AM',
    color: 'violet',
    targetGrade: 'A',
    attendance: {
      totalClasses: 14,
      attendedClasses: 14, // 100%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'civ-a1', name: 'Midterm Case Reflection', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 95, completed: true, dueDate: 'Nov 05' },
      { id: 'civ-a2', name: 'Community Fieldwork Project', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 96, completed: true, dueDate: 'Nov 19' },
      { id: 'civ-a3', name: 'Civic Responsibility Quizzes', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 94, completed: true, dueDate: 'Dec 01' },
      { id: 'civ-a4', name: 'Final Presentation & Viva', category: 'final', weightPercent: 45, maxScore: 100, completed: false, dueDate: 'Dec 22' },
    ],
  },
  {
    id: 'course-dld-lab-204l',
    code: 'CS 204L',
    name: 'Digital Logic Design Lab',
    credits: 1,
    instructor: 'Faculty of Computing',
    room: 'Hardware Systems Lab 1',
    schedule: 'Fri 02:00 - 05:00 PM',
    color: 'indigo',
    targetGrade: 'A',
    attendance: {
      totalClasses: 14,
      attendedClasses: 14, // 100%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'dldl-a1', name: 'Midterm Practical Breadboard Exam', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 94, completed: true, dueDate: 'Nov 07' },
      { id: 'dldl-a2', name: 'Verilog HDL Lab Experiments', category: 'coursework', weightPercent: 25, maxScore: 100, currentScore: 98, completed: true, dueDate: 'Nov 21' },
      { id: 'dldl-a3', name: 'Final Hardware Implementation & Viva', category: 'final', weightPercent: 50, maxScore: 100, completed: false, dueDate: 'Dec 23' },
    ],
  },
  {
    id: 'course-ent-301',
    code: 'MG 301',
    name: 'Entrepreneurship',
    credits: 2,
    instructor: 'Faculty of Computing & Management',
    room: 'Innovation Center 202',
    schedule: 'Wed 02:00 - 04:00 PM',
    color: 'rose',
    targetGrade: 'A',
    attendance: {
      totalClasses: 18,
      attendedClasses: 15, // 83.3% ~ 83%
      minThresholdPercent: 75,
    },
    assessments: [
      { id: 'ent-a1', name: 'Midterm Startup Pitch Deck', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 85, completed: true, dueDate: 'Nov 09' },
      { id: 'ent-a2', name: 'Customer Discovery & Validation', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 88, completed: true, dueDate: 'Nov 23' },
      { id: 'ent-a3', name: 'Unit Economics & Financial Model', category: 'coursework', weightPercent: 15, maxScore: 100, currentScore: 87, completed: true, dueDate: 'Dec 02' },
      { id: 'ent-a4', name: 'Final Venture Plan & Defence', category: 'final', weightPercent: 45, maxScore: 100, completed: false, dueDate: 'Dec 24' },
    ],
  },
];

export const INITIAL_DOCUMENTS: DocumentNote[] = [
  {
    id: 'doc-algo-dp',
    courseId: 'course-algo-311',
    title: 'Dynamic Programming: Optimal Substructure & 0/1 Knapsack',
    wordCount: 840,
    createdAt: '2026-11-04',
    content: `# Dynamic Programming: Optimal Substructure, Memoization & 0/1 Knapsack

## 1. Core Principle of Dynamic Programming
Dynamic programming solves optimization problems by combining solutions to overlapping subproblems. A problem exhibits optimal substructure if an optimal solution contains within it optimal solutions to subproblems.

### Contrast: Divide-and-Conquer vs. Dynamic Programming
- **Divide and Conquer**: Subproblems are independent (e.g. Merge Sort). Solving them independently does not repeat work.
- **Dynamic Programming**: Subproblems overlap heavily (e.g. Fibonacci, Longest Common Subsequence). Without memoization or tabulation, recursive algorithms incur exponential time complexity O(2^n).

## 2. The 0/1 Knapsack Formulation
Given n items where each item i has weight w[i] and value v[i], and a knapsack with maximum weight capacity W:
Maximize total value subject to total weight <= W.
Each item can either be taken once (1) or left behind (0).

### Recurrence Relation:
Let DP[i][w] be the maximum value attainable using a subset of the first i items with weight capacity w:
- Base Case: DP[0][w] = 0 for all w; DP[i][0] = 0 for all i.
- If w[i] > w:
  DP[i][w] = DP[i-1][w] (Item i cannot fit into capacity w)
- If w[i] <= w:
  DP[i][w] = max(DP[i-1][w], v[i] + DP[i-1][w - w[i]])

### Complexity Analysis:
- Time Complexity: O(n * W)
- Space Complexity: O(n * W) pseudo-polynomial; reducible to O(W) with a single 1D array traversed backwards.

## 3. High-Yield Exam Traps & Misconceptions
- **Greedy Fails on 0/1 Knapsack**: Sorting by value-to-weight ratio (v[i]/w[i]) works strictly for the Fractional Knapsack problem. For 0/1 Knapsack, greedy is not optimal due to empty capacity gaps.
- **Pseudo-Polynomial Nature**: O(n * W) is linear with respect to the numerical value of W, but exponential in the number of bits required to represent W (log W). Hence 0/1 Knapsack is NP-Complete.
- **1D Array Traversal Order**: When optimizing space from DP[i][w] to DP[w], the inner capacity loop MUST iterate backwards from W down to w[i]. Forward iteration allows an item to be selected multiple times, inadvertently solving the Unbounded Knapsack problem.`,
    summary: {
      overview: 'Dynamic Programming systematically solves combinatorial optimization problems characterized by overlapping subproblems and optimal substructure. For 0/1 Knapsack, the optimal choice cannot be determined greedily; instead, a 2D state matrix DP[i][w] computes optimal sub-capacity decisions in O(n*W) pseudo-polynomial time.',
      keyTakeaways: [
        'Greedy algorithms strictly fail for 0/1 Knapsack; they are only guaranteed optimal for Fractional Knapsack.',
        'The recurrence relation balances excluding item i (DP[i-1][w]) against including it (v[i] + DP[i-1][w-w[i]]).',
        'Space optimization from O(n*W) to O(W) requires iterating capacity w backwards to prevent reusing the same item.',
        '0/1 Knapsack time complexity O(n*W) is pseudo-polynomial because W is measured by its numeric magnitude, not input bit-length.',
        'Optimal substructure must hold: any sub-path of an optimal path must itself be optimal.',
      ],
      coreConcepts: [
        { term: 'Optimal Substructure', definition: 'The property where the global optimal solution is constructed directly from the optimal solutions of its constituent subproblems.' },
        { term: 'Overlapping Subproblems', definition: 'A scenario where a recursive algorithm revisits identical subproblem states repeatedly, enabling polynomial speedup via memoization or tabulation.' },
        { term: 'Pseudo-Polynomial Time', definition: 'An algorithm whose running time is polynomial in the numeric value of an input parameter, but exponential in the length (number of bits) of that parameter.' },
      ],
      formulasAndTheorems: [
        { title: '0/1 Knapsack Recurrence', formulaOrRule: 'DP[i][w] = max(DP[i-1][w], v[i] + DP[i-1][w - w[i]]) for w >= w[i]', application: 'Determines whether including item i maximizes value within capacity w' },
        { title: '1D Space Optimization', formulaOrRule: 'for w = W down to w[i]: dp[w] = max(dp[w], v[i] + dp[w - w[i]])', application: 'Reduces auxiliary space from O(n*W) to O(W) while preventing multiple inclusion' },
      ],
      examTraps: [
        'Assuming greedy value-density ranking yields optimal solutions for 0/1 knapsack problems.',
        'Iterating capacity forward in the 1D space-optimized loop, which permits unbounded multiple reuse of an item.',
        'Confusing polynomial complexity with pseudo-polynomial complexity when W is arbitrarily large.',
      ],
      studyTip: 'Draw a small 4x6 DP matrix by hand with 3 items and capacity 5. Manually trace the back-pointers to reconstruct which items were selected.',
    },
    flashcards: [
      { id: 'fc-algo-1', front: 'Why does the greedy value-density heuristic fail for 0/1 Knapsack but work for Fractional Knapsack?', back: 'Fractional knapsack allows taking fractions of items to completely fill leftover capacity. In 0/1 knapsack, indivisible items may leave unused capacity gaps that outweigh greedy density gains.', topic: 'Knapsack Heuristics', difficulty: 'Medium', status: 'learning' as any },
      { id: 'fc-algo-2', front: 'What is the purpose of iterating the capacity loop backwards in 1D array space-optimized 0/1 Knapsack?', back: 'Iterating backwards ensures dp[w - w[i]] represents values from the PREVIOUS item iteration (i-1), preventing an item from being added to the knapsack more than once.', topic: 'Space Optimization', difficulty: 'Hard', status: 'new' as any },
      { id: 'fc-algo-3', front: 'What makes the O(n*W) time complexity of 0/1 Knapsack pseudo-polynomial rather than strictly polynomial?', back: 'Complexity is proportional to the numeric magnitude of W, which takes log(W) bits to represent. As bit size grows, the runtime grows exponentially relative to the input length in bits.', topic: 'Complexity Theory', difficulty: 'Hard', status: 'learning' as any },
      { id: 'fc-algo-4', front: 'State the base cases for the 0/1 Knapsack DP recurrence table.', back: 'DP[0][w] = 0 for all 0 <= w <= W (zero items yield zero value), and DP[i][0] = 0 for all 0 <= i <= n (zero capacity holds zero value).', topic: 'DP Base Cases', difficulty: 'Easy', status: 'mastered' as any },
    ],
    quiz: [
      {
        id: 'q-algo-1',
        question: 'Under what condition does 0/1 Knapsack space optimization to a 1D array dp[w] incorrectly solve the Unbounded Knapsack problem?',
        options: [
          'If the items are sorted by weight ascending before execution',
          'If the capacity loop iterates forward from w[i] up to W',
          'If the array is initialized with zeros instead of negative infinity',
          'If the weights are non-integer values',
        ],
        correctIndex: 1,
        explanation: 'Forward iteration from w[i] to W updates dp[w] using an already-updated dp[w - w[i]] from the current item pass, allowing the same item to be added repeatedly (Unbounded Knapsack).',
        topic: 'Space Optimization',
      },
      {
        id: 'q-algo-2',
        question: 'Why is the 0/1 Knapsack problem classified as NP-Complete despite having an O(n*W) dynamic programming algorithm?',
        options: [
          'Because the subproblems cannot be represented in a DAG',
          'Because memoization requires exponential memory on modern CPUs',
          'Because O(n*W) is pseudo-polynomial: W requires only log2(W) bits to encode',
          'Because optimal substructure does not hold for negative values',
        ],
        correctIndex: 2,
        explanation: 'In computational complexity, problem size is measured by the number of bits in the input. An input W requires k = log2(W) bits. An algorithm taking O(n * 2^k) operations is exponential in the input length, which is pseudo-polynomial.',
        topic: 'Complexity Theory',
      },
      {
        id: 'q-algo-3',
        question: 'Given items with weights [2, 3, 4] and values [3, 4, 5] with maximum capacity W = 5, what is the maximum value attainable in 0/1 Knapsack?',
        options: ['6', '7', '8', '9'],
        correctIndex: 1,
        explanation: 'Taking item 1 (weight 2, value 3) and item 2 (weight 3, value 4) gives total weight 5 and total value 7. Item 3 alone gives value 5. Hence the maximum achievable value is 7.',
        topic: 'DP Computation',
      },
    ],
  },
  {
    id: 'doc-dbms-transactions',
    courseId: 'course-dbms-305',
    title: 'DBMS: ACID Properties, Two-Phase Locking (2PL) & Serializability',
    wordCount: 760,
    createdAt: '2026-11-06',
    content: `# Database Management Systems: Transactions & Concurrency Control

## 1. ACID Properties
- **Atomicity**: All-or-nothing execution guaranteed via Write-Ahead Logging (WAL) and undo logs.
- **Consistency**: Database transitions from one valid state satisfying all declarative constraints to another.
- **Isolation**: Concurrent transactions execute as if running serially without interference.
- **Durability**: Committed transaction updates persist across crashes via redo logs and non-volatile storage.

## 2. Serializability & Conflict Equivalence
A schedule S is conflict serializable if it is conflict equivalent to some serial schedule S'.
Two operations in a schedule conflict if and only if:
1. They belong to different transactions.
2. They access the same data item.
3. At least one of the operations is a write.

### Conflict Precedence Graph (Serialization Graph)
Construct a directed graph where:
- Nodes = Transactions T1, T2, ...
- Directed edge Ti -> Tj exists if Ti performs an operation that conflicts with a subsequent operation by Tj.
Theorem: A schedule is conflict serializable IF AND ONLY IF its precedence graph contains NO cycles.

## 3. Two-Phase Locking (2PL)
2PL guarantees conflict serializability by constraining lock acquisitions and releases:
- **Growing Phase**: Transaction may acquire locks, but CANNOT release any lock.
- **Shrinking Phase**: Transaction may release locks, but CANNOT acquire any new lock.
- Once a transaction releases its first lock, it cannot acquire further locks.

### Rigorous & Strict 2PL
- **Strict 2PL**: All exclusive (X) locks are held until transaction commit/abort (prevents cascading rollbacks).
- **Rigorous 2PL**: ALL shared (S) and exclusive (X) locks are held until transaction commit/abort.`,
    summary: {
      overview: 'Database transaction management guarantees data integrity amidst concurrent executions through ACID guarantees. Two-Phase Locking (2PL) enforces conflict serializability by prohibiting lock acquisitions following the first lock release, while Strict 2PL eliminates cascading rollbacks.',
      keyTakeaways: [
        'Conflict serializability requires that the precedence (serialization) graph is completely acyclic.',
        'Two operations conflict only when they belong to distinct transactions, target the same item, and at least one is a write.',
        'Basic 2PL guarantees conflict serializability but does NOT prevent deadlocks or cascading aborts.',
        'Strict 2PL holds exclusive locks until commit/abort, eliminating cascading aborts.',
        'Rigorous 2PL holds all shared and exclusive locks until commit, producing strict serializability.',
      ],
      coreConcepts: [
        { term: 'Conflict Serializability', definition: 'Property of a schedule that can be transformed into a serial schedule through a sequence of non-conflicting operation swaps.' },
        { term: 'Precedence Graph', definition: 'A directed graph where directed edges indicate order dependencies between conflicting transaction operations; acyclicity proves conflict serializability.' },
        { term: 'Strict 2PL', definition: 'A variant of two-phase locking where exclusive write locks are retained until final commit or abort to prevent cascading rollbacks.' },
      ],
      formulasAndTheorems: [
        { title: 'Conflict Serializability Theorem', formulaOrRule: 'Schedule S is conflict serializable <=> PrecedenceGraph(S) is a Directed Acyclic Graph (DAG)', application: 'Formally verifies concurrency correctness and transaction schedule order' },
        { title: 'Two-Phase Locking Rule', formulaOrRule: 'Phase 1: acquire-only; Phase 2: release-only. No acquires permitted after first release.', application: 'Guarantees conflict serializable schedules in distributed and relational RDBMS engines' },
      ],
      examTraps: [
        'Believing basic 2PL prevents deadlocks. Basic 2PL guarantees serializability, but can still dead-lock.',
        'Classifying read-read operations as conflicting. Two read operations on the same data item never conflict.',
      ],
      studyTip: 'Whenever evaluating an exam schedule, immediately construct the Ti -> Tj precedence graph and inspect for cycles.',
    },
    flashcards: [
      { id: 'fc-db-1', front: 'Does basic Two-Phase Locking (2PL) guarantee freedom from deadlocks?', back: 'No. Basic 2PL guarantees conflict serializability, but transactions can still enter circular wait states resulting in deadlocks.', topic: 'Two-Phase Locking', difficulty: 'Medium', status: 'learning' as any },
      { id: 'fc-db-2', front: 'What three conditions are necessary for two database operations to conflict?', back: '1. They belong to different transactions. 2. They access the exact same data item. 3. At least one of the operations is a write.', topic: 'Conflict Serializability', difficulty: 'Easy', status: 'mastered' as any },
    ],
    quiz: [
      {
        id: 'q-db-1',
        question: 'Which variant of Two-Phase Locking eliminates cascading rollbacks by holding exclusive locks until transaction completion?',
        options: ['Conservative 2PL', 'Strict 2PL', 'Optimistic 2PL', 'Basic 2PL'],
        correctIndex: 1,
        explanation: 'Strict 2PL requires all exclusive (X) locks to be held until the transaction finishes (commit or abort), which prevents other transactions from reading uncommitted dirty data and avoids cascading aborts.',
        topic: 'Locking Protocols',
      },
      {
        id: 'q-db-2',
        question: 'If the precedence graph for a concurrent transaction schedule contains a directed cycle T1 -> T2 -> T3 -> T1, what does this prove?',
        options: [
          'The schedule is conflict serializable but deadlock-prone',
          'The schedule is NOT conflict serializable',
          'The schedule requires undo logging but not redo logging',
          'The schedule satisfies Strict 2PL invariants',
        ],
        correctIndex: 1,
        explanation: 'By the Conflict Serializability Theorem, a schedule is conflict serializable if and only if its precedence graph is acyclic. A cycle proves that no equivalent serial order exists.',
        topic: 'Precedence Graphs',
      },
    ],
  },
  {
    id: 'doc-dld-fsm',
    courseId: 'course-dld-301',
    title: 'Digital Logic Design: Mealy vs Moore FSMs & State Minimization',
    wordCount: 680,
    createdAt: '2026-11-08',
    content: `# Digital Logic Design: Finite State Machines & State Minimization

## 1. Mealy vs Moore State Machine Models
- **Moore Machine**: Outputs are solely dependent on the current state (Outputs = f(Current State)). Outputs change synchronously only on active clock transitions.
- **Mealy Machine**: Outputs depend on BOTH the current state and current inputs (Outputs = g(Current State, Inputs)). Outputs can change asynchronously whenever inputs change, potentially causing glitch pulses.

### Architectural Tradeoffs:
- A Mealy machine typically requires fewer states than an equivalent Moore machine to recognize the same sequence.
- Moore machines offer glitch-free outputs because outputs are decoupled from input signal noise and change only with clock edges.

## 2. State Minimization via Implication Tables
State reduction eliminates redundant equivalent states without altering input/output behavior:
- Two states S_i and S_j are equivalent if:
  1. For every possible input combination, they generate the identical output.
  2. For every possible input combination, their next states are either identical or equivalent.
- Use the lower-triangular implication table to systematically cross off incompatible state pairs.`,
    summary: {
      overview: 'Sequential logic synthesis models synchronous systems using Finite State Machines (FSMs). Moore machines tie outputs strictly to current state for glitch-free operation, whereas Mealy machines depend on inputs and state, often saving flip-flop state bits.',
      keyTakeaways: [
        'Moore outputs depend exclusively on present state; Mealy outputs depend on present state and current inputs.',
        'Mealy machines can react one clock cycle earlier and often use fewer flip-flops, but risk output glitches from input transitions.',
        'State equivalence requires identical outputs and mutually compatible next-state transitions across all inputs.',
        'State reduction via implication tables minimizes required D flip-flops (ceil(log2(N)) states).',
      ],
      coreConcepts: [
        { term: 'Moore Machine', definition: 'A sequential FSM whose outputs are a function of the current state only.' },
        { term: 'Mealy Machine', definition: 'A sequential FSM whose outputs depend on both current state and primary inputs.' },
        { term: 'Implication Table', definition: 'A systematic triangular matrix method used to identify and merge equivalent states in sequential circuit synthesis.' },
      ],
      formulasAndTheorems: [
        { title: 'Flip-Flop State Requirement', formulaOrRule: 'Number of Flip-Flops m = ceil(log2(N)) where N is the number of distinct states', application: 'Determines the register size needed to encode the FSM' },
      ],
      examTraps: [
        'Confusing Moore and Mealy timing: Mealy outputs can change immediately mid-clock-cycle when inputs glitch.',
        'Assuming states are equivalent merely because they output the same value for one input.',
      ],
      studyTip: 'In sequence detector problems, always identify whether overlapping sequences are allowed and note Moore requires N+1 states for an N-bit sequence detector.',
    },
    flashcards: [
      { id: 'fc-dld-1', front: 'In a sequence detector for an N-bit pattern, how many states are required in a Moore machine versus a Mealy machine?', back: 'A Moore machine requires N + 1 states (including the reset state). A Mealy machine requires N states because the final detection output is produced on the transition itself.', topic: 'Sequence Detectors', difficulty: 'Medium', status: 'learning' as any },
    ],
    quiz: [
      {
        id: 'q-dld-1',
        question: 'Why are Moore FSMs generally preferred over Mealy FSMs in high-speed digital circuit designs where outputs feed external logic?',
        options: [
          'Moore machines always use fewer logic gates',
          'Moore outputs are registered and immune to asynchronous primary input glitches',
          'Moore machines can operate without a master clock signal',
          'Moore next-state logic does not require K-map simplification',
        ],
        correctIndex: 1,
        explanation: 'Because Moore outputs depend strictly on state flip-flop outputs, they change cleanly on clock edges and are immune to glitches or propagation delay hazards present on primary inputs.',
        topic: 'FSM Architecture',
      },
    ],
  },
];

export const INITIAL_QUIZ_RESULTS: QuizResult[] = [
  {
    id: 'qr-algo-1',
    courseId: 'course-algo-311',
    docTitle: 'Dynamic Programming: Optimal Substructure & 0/1 Knapsack',
    score: 2,
    total: 3,
    percentage: 67,
    date: '2026-11-09',
    weakTopics: ['Space Optimization'],
  },
  {
    id: 'qr-dld-1',
    courseId: 'course-dld-301',
    docTitle: 'Digital Logic Design: Mealy vs Moore FSMs',
    score: 1,
    total: 2,
    percentage: 50,
    date: '2026-11-08',
    weakTopics: ['FSM Architecture'],
  },
];

export const INITIAL_REVISION_PLAN: RevisionPlan = {
  generatedAt: '2026-11-10T14:30:00Z',
  strategyOverview:
    'Calibrated based on recent scored quizzes flagging Space Optimization in CS 311 (Algorithms) and FSM Architecture in CS 204 (Digital Logic Design). Employs spaced retrieval practice with deliberate synthesis tasks before upcoming MAJU final examinations.',
  highYieldChecklist: [
    'Hand-trace 1D array backward capacity traversal for 0/1 Knapsack proof',
    'Derive timing diagram comparing Mealy glitch risk vs Moore registered output',
    'Verify Precedence Graph cycle detection on 3 concurrent DBMS transaction schedules',
    'Complete timed practice on DLD Implication Table state reduction',
  ],
  dailySchedules: [
    {
      dayNumber: 1,
      dayTitle: 'Targeted High-Yield Weakness Remediation',
      totalHours: 3,
      sessions: [
        {
          courseCode: 'CS 311',
          topic: 'Space Optimization in 0/1 Knapsack & Array Bounds',
          durationMinutes: 60,
          technique: 'Active Recall & Code Trace',
          specificGoal: 'Trace and write 1D DP code from memory; explain why forward traversal produces unbounded knapsack.',
          completed: true,
        },
        {
          courseCode: 'CS 204',
          topic: 'Mealy vs Moore Timing Hazards & Sequence Detectors',
          durationMinutes: 60,
          technique: 'Feynman Explanation',
          specificGoal: 'Draw timing waveform showing asynchronous glitch propagation on Mealy outputs.',
          completed: false,
        },
        {
          courseCode: 'CS 305',
          topic: 'Strict 2PL vs Rigorous 2PL Cascading Abort Proofs',
          durationMinutes: 60,
          technique: 'Practice Problems',
          specificGoal: 'Construct serialization graphs for 4 complex transaction schedules and verify conflict serializability.',
          completed: false,
        },
      ],
    },
    {
      dayNumber: 2,
      dayTitle: 'Algorithm Complexity & FSM State Reduction',
      totalHours: 3,
      sessions: [
        {
          courseCode: 'CS 311',
          topic: 'Pseudo-Polynomial Time Proofs & NP-Completeness',
          durationMinutes: 75,
          technique: 'Active Recall',
          specificGoal: 'Explain why O(n*W) is exponential in bit-length log(W).',
          completed: false,
        },
        {
          courseCode: 'CS 204',
          topic: 'Implication Table State Minimization Drill',
          durationMinutes: 60,
          technique: 'Deliberate Practice',
          specificGoal: 'Reduce a 7-state sequence detector to minimal state representation using triangular implication chart.',
          completed: false,
        },
        {
          courseCode: 'MG 301',
          topic: 'Unit Economics & Customer Acquisition Cost (CAC)',
          durationMinutes: 45,
          technique: 'Case Review',
          specificGoal: 'Calculate LTV:CAC ratios and payback period for SaaS venture model.',
          completed: false,
        },
      ],
    },
  ],
};

export const INITIAL_FOCUS_SESSIONS: FocusSessionRecord[] = [
  {
    id: 'foc-1',
    courseId: 'course-algo-311',
    mode: 'pomodoro',
    durationMinutes: 25,
    completedAt: '2026-11-10T11:00:00Z',
  },
  {
    id: 'foc-2',
    courseId: 'course-dbms-305',
    mode: 'deepwork',
    durationMinutes: 50,
    completedAt: '2026-11-10T16:30:00Z',
  },
];

export const INITIAL_FOCUS_HISTORY = INITIAL_FOCUS_SESSIONS;
