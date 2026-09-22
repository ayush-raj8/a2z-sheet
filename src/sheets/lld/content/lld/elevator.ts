import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-elevator',
  title: 'Elevator System LLD',
  section: 'lld',
  chapter: 'Case Studies',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-state', 'pattern-strategy', 'lld-methodology'],
  summary:
    'Model elevators, requests, and scheduling strategies — direction, pending stops, and multi-car assignment.',
  keywords: ['elevator', 'scheduler', 'SCAN', 'lld'],
  why:
    'Elevator LLD tests State + Strategy together: each car has direction/state, and a controller assigns requests using a scheduling policy. Follow-ups escalate quickly to multi-car and peak-hour strategies.',
  theory: [
    'Clarify: floors, number of cars, internal vs external buttons, door timing, whether requests can be canceled.',
    'Entities: ElevatorCar, ElevatorController, Request (hall/car), Direction, Door, SchedulingStrategy.',
    'Car state: Idle, MovingUp, MovingDown, DoorOpen — often with current floor and stop sets.',
    'SCAN/LOOK algorithms: continue in direction serving stops, then reverse — like disk scheduling.',
    'Controller assigns external requests to the “best” car (Strategy).',
    'Concurrency: request queue thread-safe; never skip door safety invariants in real systems (mention briefly).',
  ],
  mentalModel:
    'Think of each elevator as a bus on a vertical route with a planned set of stops. The dispatcher assigns new passengers to the bus that will waste the least travel time, while each bus keeps moving in one direction until its stop list in that direction is empty.',
  codeTitle: 'Single car with stop set',
  code: `import java.util.*;

enum Direction { UP, DOWN, IDLE }

class ElevatorCar {
    private int floor = 0;
    private Direction direction = Direction.IDLE;
    private final NavigableSet<Integer> ups = new TreeSet<>();
    private final NavigableSet<Integer> downs = new TreeSet<>(Comparator.reverseOrder());

    synchronized void requestFloor(int target) {
        if (target == floor) return;
        if (target > floor) ups.add(target); else downs.add(target);
        if (direction == Direction.IDLE) {
            direction = target > floor ? Direction.UP : Direction.DOWN;
        }
    }

    synchronized void step() {
        if (direction == Direction.UP) {
            Integer next = ups.pollFirst();
            if (next == null) {
                direction = downs.isEmpty() ? Direction.IDLE : Direction.DOWN;
                return;
            }
            floor = next;
            System.out.println("Arrived " + floor + " dir=" + direction);
            if (ups.isEmpty() && !downs.isEmpty()) direction = Direction.DOWN;
            if (ups.isEmpty() && downs.isEmpty()) direction = Direction.IDLE;
        } else if (direction == Direction.DOWN) {
            Integer next = downs.pollFirst();
            if (next == null) {
                direction = ups.isEmpty() ? Direction.IDLE : Direction.UP;
                return;
            }
            floor = next;
            System.out.println("Arrived " + floor + " dir=" + direction);
            if (downs.isEmpty() && !ups.isEmpty()) direction = Direction.UP;
            if (ups.isEmpty() && downs.isEmpty()) direction = Direction.IDLE;
        }
    }

    int floor() { return floor; }
    Direction direction() { return direction; }
}

public class Demo {
    public static void main(String[] args) {
        ElevatorCar car = new ElevatorCar();
        car.requestFloor(5);
        car.requestFloor(2);
        car.requestFloor(8);
        while (car.direction() != Direction.IDLE) car.step();
    }
}`,
  output: `Arrived 2 dir=UP
Arrived 5 dir=UP
Arrived 8 dir=UP`,
  explain: [
    'Ups and downs are separate sorted stop sets — LOOK-style serving.',
    'Idle car picks direction from the first request.',
    'Production code would model door timing and per-floor hall calls separately.',
  ],
  mermaid: `flowchart LR
    HallCall --> Controller
    Controller -->|assign| Car1
    Controller --> Car2
    Car1 --> Stops[Stop sets]
    Car2 --> Stops2[Stop sets]`,
  mistakes: [
    'Teleporting between floors without a notion of direction/stops.',
    'One global queue that ignores direction — poor latency.',
    'Forgetting that internal car buttons and external hall calls differ.',
  ],
  interviewAsk: 'How do you assign a hall call to one of N elevators?',
  interviewAnswer:
    'Define a cost function: distance, direction compatibility, load, and maybe estimated time of arrival. Encapsulate in SchedulingStrategy so you can swap PeakHourStrategy later. Each car exposes state snapshots; controller picks min cost. Discuss starvation and SCAN fairness briefly.',
  interviewTraps: [
    'Only modeling one car when the prompt says a building bank.',
    'No direction concept.',
  ],
  quiz: {
    question: 'Why keep separate up/down stop sets?',
    options: [
      'To use more memory',
      'To serve requests efficiently in the current direction before reversing',
      'Because Java cannot store integers in one set',
      'To avoid using Strategy',
    ],
    correctIndex: 1,
    explain: 'Directional stop sets support SCAN/LOOK-like behavior.',
  },
  practice:
    'Implement ElevatorController with 2 cars and a NearestCarStrategy that assigns hall calls based on absolute floor distance and direction match.',
  practiceHints: [
    'Prefer a car already moving toward the caller.',
    'Idle cars are always candidates.',
  ],
});
