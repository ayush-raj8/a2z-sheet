import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-parking-lot',
  title: 'Parking Lot — Beginner Walkthrough',
  section: 'lld',
  chapter: 'Case Studies',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['lld-methodology', 'pattern-strategy'],
  summary:
    'End-to-end beginner LLD: requirements, entities, spot allocation strategy, entry/exit tickets, fees, and clean Java sketch.',
  keywords: ['parking lot', 'lld', 'allocation', 'ticket', 'fees'],
  why:
    'Parking Lot is the canonical first LLD. Mastering it teaches entity modeling, Strategy for allocation/pricing, and how to extend to floors and vehicle types without rewriting everything.',
  theory: [
    'Clarify: vehicle types (bike/car/truck), multiple floors, entry/exit gates, hourly vs flat pricing, whether reserved spots exist.',
    'Assume single process in-memory first unless told otherwise.',
    'Entities: Vehicle, ParkingSpot, Floor/ParkingLot, Ticket, Gate, ParkingService, FeeCalculator, AllocationStrategy.',
    'Invariants: a spot is free or occupied by at most one vehicle; ticket maps vehicle↔spot↔entry time.',
    'Flow enter: find spot → occupy → issue ticket. Flow exit: lookup ticket → compute fee → free spot.',
    'Use Strategy for allocation (nearest, random, type-matching) and for pricing.',
    'Concurrency follow-up: two cars must not get the same spot — synchronize allocation or use compare-and-set on spot state.',
  ],
  mentalModel:
    'A mall parking garage: floors of painted spots, a ticket machine at entry, a booth at exit. The “brain” assigns a matching empty spot and remembers when you entered so it can charge on the way out.',
  codeTitle: 'Core parking lot sketch',
  code: `import java.time.*;
import java.util.*;

enum SpotType { BIKE, CAR, TRUCK }
enum VehicleType { BIKE, CAR, TRUCK }

class Vehicle {
    final String plate;
    final VehicleType type;
    Vehicle(String plate, VehicleType type) {
        this.plate = plate; this.type = type;
    }
}

class ParkingSpot {
    final String id;
    final SpotType type;
    private Vehicle vehicle;

    ParkingSpot(String id, SpotType type) {
        this.id = id; this.type = type;
    }

    boolean isFree() { return vehicle == null; }

    synchronized boolean tryOccupy(Vehicle v) {
        if (!isFree()) return false;
        if (!compatible(v.type, type)) return false;
        vehicle = v;
        return true;
    }

    synchronized void free() { vehicle = null; }

    static boolean compatible(VehicleType v, SpotType s) {
        return (v == VehicleType.BIKE && s == SpotType.BIKE)
            || (v == VehicleType.CAR && s == SpotType.CAR)
            || (v == VehicleType.TRUCK && s == SpotType.TRUCK);
    }
}

class Ticket {
    final String id;
    final Vehicle vehicle;
    final ParkingSpot spot;
    final Instant entry;
    Ticket(String id, Vehicle vehicle, ParkingSpot spot, Instant entry) {
        this.id = id; this.vehicle = vehicle; this.spot = spot; this.entry = entry;
    }
}

interface AllocationStrategy {
    Optional<ParkingSpot> findSpot(List<ParkingSpot> spots, Vehicle v);
}

class FirstFitAllocation implements AllocationStrategy {
    public Optional<ParkingSpot> findSpot(List<ParkingSpot> spots, Vehicle v) {
        return spots.stream()
            .filter(ParkingSpot::isFree)
            .filter(s -> ParkingSpot.compatible(v.type, s.type))
            .findFirst();
    }
}

class ParkingLot {
    private final List<ParkingSpot> spots;
    private final AllocationStrategy allocator;
    private final Map<String, Ticket> openTickets = new HashMap<>();

    ParkingLot(List<ParkingSpot> spots, AllocationStrategy allocator) {
        this.spots = spots; this.allocator = allocator;
    }

    public synchronized Ticket enter(Vehicle v) {
        ParkingSpot spot = allocator.findSpot(spots, v)
            .orElseThrow(() -> new IllegalStateException("Lot full"));
        if (!spot.tryOccupy(v)) throw new IllegalStateException("Race lost");
        Ticket t = new Ticket(UUID.randomUUID().toString(), v, spot, Instant.now());
        openTickets.put(t.id, t);
        return t;
    }

    public synchronized int exit(String ticketId) {
        Ticket t = openTickets.remove(ticketId);
        if (t == null) throw new IllegalArgumentException("Invalid ticket");
        long hours = Math.max(1, Duration.between(t.entry, Instant.now()).toHours());
        int fee = (int) hours * 20; // flat demo rate
        t.spot.free();
        return fee;
    }
}

public class Demo {
    public static void main(String[] args) {
        List<ParkingSpot> spots = List.of(
            new ParkingSpot("C1", SpotType.CAR),
            new ParkingSpot("B1", SpotType.BIKE)
        );
        ParkingLot lot = new ParkingLot(spots, new FirstFitAllocation());
        Ticket t = lot.enter(new Vehicle("KA01", VehicleType.CAR));
        System.out.println("spot=" + t.spot.id);
        System.out.println("fee=" + lot.exit(t.id));
    }
}`,
  output: `spot=C1
fee=20`,
  explain: [
    'AllocationStrategy keeps ParkingLot open for new policies.',
    'tryOccupy is synchronized for a simple concurrency story.',
    'Fee is simplistic — extract FeeCalculator next.',
  ],
  mermaid: `sequenceDiagram
    participant D as Driver
    participant PL as ParkingLot
    participant A as Allocator
    participant S as Spot
    D->>PL: enter(vehicle)
    PL->>A: findSpot
    A-->>PL: spot
    PL->>S: tryOccupy
    PL-->>D: ticket
    D->>PL: exit(ticketId)
    PL->>S: free
    PL-->>D: fee`,
  mistakes: [
    'One giant ParkingLot class with pricing, allocation, and persistence mixed.',
    'Using vehicle plate as the only key without tickets — fails for edge cases and audits.',
    'Hard-coding spot type checks in five places instead of one policy.',
    'Ignoring full-lot behavior and invalid tickets.',
  ],
  interviewAsk: 'Design a parking lot system.',
  interviewAnswer:
    'Clarify vehicle types, floors, gates, pricing. Model Spot, Vehicle, Ticket, Lot. Enter allocates a compatible free spot and issues a ticket; exit computes fee and frees the spot. Use Strategy for allocation and pricing. Discuss sync on allocation, multi-floor indexing, and later persistence. Draw class + sequence diagrams before coding.',
  interviewTraps: [
    'Jumping to microservices.',
    'No ticket abstraction.',
    'Fee logic scattered in UI/gate code.',
  ],
  quiz: {
    question: 'Why introduce AllocationStrategy in a parking lot design?',
    options: [
      'To make the code longer',
      'To vary spot-picking policies without rewriting ParkingLot',
      'To replace the need for tickets',
      'To force Singleton usage',
    ],
    correctIndex: 1,
    explain: 'Strategy isolates allocation policy for Open/Closed extensibility.',
  },
  practice:
    'Extend the sketch with FeeCalculator interface (HourlyFee, FlatFee) and a Floor class holding spots. Enter should search floors in order.',
  practiceHints: [
    'ParkingLot owns List<Floor>.',
    'Keep Ticket pointing at the concrete ParkingSpot.',
  ],
  deepDive: [
    'Reserved/EV spots: filter in allocation strategy.',
    'Distributed lot: spot reservation needs a DB transaction or lock service.',
  ],
});
