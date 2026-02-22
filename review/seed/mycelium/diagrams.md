# Diagrams

Visual companion to the model documents. All diagrams
use Mermaid for GitHub rendering.

## Protocol Stack

Dependencies between protocols and the design decisions
that shaped each one.

```mermaid
graph BT
  xpath["mc.xpath\nresolve paths → locations"]
  core["mc.core\n5 primitives, Buffer in/out"]
  raw["mc.raw\nformat + compound ops"]
  data["mc.data\nuser data view"]
  meta["mc.meta\nmetadata view"]
  proto["mc.proto\nprotocol resolution"]

  core --> xpath
  raw --> core
  data --> core
  meta --> core
  proto --> core

  style xpath fill:#e8e8e8,stroke:#666
  style core fill:#d4e6f1,stroke:#2980b9
  style raw fill:#d5f5e3,stroke:#27ae60
  style data fill:#fdebd0,stroke:#e67e22
  style meta fill:#fdebd0,stroke:#e67e22
  style proto fill:#fdebd0,stroke:#e67e22
```

```mermaid
graph LR
  subgraph "Design Decisions"
    direction TB
    d1["Uniform factory pattern (P1)"]
    d2["Session from seed doc (JSON arg)"]
    d3["mc.core = stable contract, does not grow"]
    d4["mc.raw = pre-semantic, compound ops (move, copy)"]
    d5["mc.data/meta/proto = semantic views on mc.core"]
    d6["mc.xpath = resolver only, never reads/writes data"]
  end
```

### Protocol Responsibilities

```mermaid
flowchart LR
  subgraph resolve["Resolve Layer"]
    xpath2["mc.xpath"]
  end
  subgraph primitive["Primitive Layer"]
    core2["mc.core"]
  end
  subgraph structural["Structural Layer"]
    raw2["mc.raw"]
  end
  subgraph semantic["Semantic Layer"]
    data2["mc.data"]
    meta2["mc.meta"]
    proto2["mc.proto"]
  end

  resolve --> primitive --> structural
  primitive --> semantic

  style resolve fill:#e8e8e8
  style primitive fill:#d4e6f1
  style structural fill:#d5f5e3
  style semantic fill:#fdebd0
```

## Bootstrap Sequence

How the system starts. Seed doc is the one seam,
then protocols all the way down.

```mermaid
sequenceDiagram
  participant shell as spl (bash)
  participant boot as spl.mjs (boot)
  participant map as mc.proto/map
  participant resolve as mc.proto/resolve
  participant target as requested protocol

  shell->>shell: root = git rev-parse
  shell->>boot: seed doc {"root","argv"}
  Note right of boot: parse seed doc<br/>(one seam)
  boot->>map: ensure proto map
  Note right of map: load from disk<br/>or build from scan
  boot->>boot: create exec doc
  Note right of boot: root + map + prefix<br/>+ resolvePath + resolve
  boot->>resolve: resolve(requested)
  resolve-->>boot: config
  boot->>target: factory(execDoc) → operator
  target-->>boot: result
```

## Context Hierarchy

The repository as a Mycelium context tree. Every
directory with `.spl/` is a context.

```mermaid
graph TD
  root["/ (repo root)\n.spl/"]
  projects["projects/"]
  mycelium["mycelium/"]
  splectrum["splectrum/"]
  haicc["haicc/"]
  spl[".spl/"]
  meta[".spl/meta/"]
  proto[".spl/proto/"]
  exec[".spl/exec/"]
  mccore["mc.core/"]
  mcraw["mc.raw/"]
  mcdata["mc.data/"]
  mcmeta["mc.meta/"]
  mcproto["mc.proto/"]
  mcxpath["mc.xpath/"]
  mcexec["mc.exec/"]

  root --> projects
  root --> mycelium
  root --> splectrum
  root --> haicc
  root --> spl

  spl --> meta
  spl --> proto
  spl --> exec

  proto --> mccore
  proto --> mcraw
  proto --> mcdata
  proto --> mcmeta
  proto --> mcproto
  proto --> mcxpath
  proto --> mcexec

  style root fill:#d4e6f1,stroke:#2980b9
  style spl fill:#fadbd8,stroke:#e74c3c
  style proto fill:#fadbd8,stroke:#e74c3c
  style exec fill:#fadbd8,stroke:#e74c3c
  style meta fill:#fadbd8,stroke:#e74c3c
```

**Blue** = context root. **Red** = .spl namespace
(metadata, not user data). mc.data filters red
from list results.

## Scope Isolation (Designed)

How path rebasing works at protocol invocation
boundaries. Not yet implemented.

```mermaid
sequenceDiagram
  participant caller as Protocol at<br/>/projects/14/
  participant boundary as Invocation<br/>Boundary
  participant mccore as mc.core<br/>at / (root)

  caller->>boundary: list('/src')
  Note over boundary: rebase IN<br/>/src → /projects/14/src
  boundary->>mccore: list('/projects/14/src')
  mccore-->>boundary: results (root-relative paths)
  Note over boundary: rebase OUT<br/>/projects/14/src/... → /src/...
  boundary-->>caller: results (caller-relative paths)
  Note over caller: still at /projects/14/<br/>nothing leaked
```

### Design Invariant

```mermaid
graph LR
  subgraph "Protocol at /projects/14/"
    a["writes /src"]
  end
  subgraph "Protocol at / (root)"
    b["writes /src"]
  end
  subgraph "Same code"
    c["every protocol reasons<br/>from a root node"]
  end

  a --> c
  b --> c
```

## Ancestor Chain Resolution (Designed)

How mc.proto.resolve finds protocols. Walk up from
current context. Nearest distance wins.

Currently implemented as map-based lookup with longest
prefix match (equivalent behavior).

```mermaid
graph BT
  root["/ (root)\n.spl/proto/mc.core ✓\n.spl/proto/mc.raw ✓\n.spl/proto/context-view ✓"]
  projects["projects/"]
  p14["projects/14/\n.spl/proto/evaluate ✓"]
  resolve["mc.proto.resolve('evaluate')\nfrom /projects/14/"]

  resolve -.->|"1. check local → found!"| p14
  p14 ---|parent| projects
  projects ---|parent| root

  style p14 fill:#d5f5e3,stroke:#27ae60
  style resolve fill:#fdebd0,stroke:#e67e22
```

```mermaid
graph BT
  root2["/ (root)\n.spl/proto/context-view ✓"]
  projects2["projects/"]
  p142["projects/14/\n(no context-view)"]
  resolve2["mc.proto.resolve('context-view')\nfrom /projects/14/"]

  resolve2 -.->|"1. check local → not found"| p142
  p142 -.->|"2. check parent → not found"| projects2
  projects2 -.->|"3. check parent → found!"| root2

  style root2 fill:#d5f5e3,stroke:#27ae60
  style resolve2 fill:#fdebd0,stroke:#e67e22
```

- **Static** = found at invocation context (evaluate at /projects/14/)
- **Dynamic** = found via ancestor walk (context-view from root)
