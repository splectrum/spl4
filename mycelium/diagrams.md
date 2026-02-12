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
  raw["mc.raw\nformat interpretation"]
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
    d1["All stateless — no factories, no closures"]
    d2["Session from environment (SPL_ROOT)"]
    d3["mc.core = stable contract, does not grow"]
    d4["mc.raw = pre-semantic, will grow (move, copy)"]
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

How the system starts. One direct-file-access seam,
then protocols all the way down.

```mermaid
sequenceDiagram
  participant shell as spl (bash)
  participant boot as boot mc.proto
  participant proto as proper mc.proto
  participant xpath as mc.xpath
  participant target as requested protocol

  shell->>shell: SPL_ROOT = git root
  shell->>boot: resolve('mc.proto')
  Note right of boot: direct file access<br/>(one seam)
  boot-->>shell: config.json

  shell->>proto: resolve('mc.xpath')
  Note right of proto: uses mc.core.read<br/>(substrate-agnostic)
  proto-->>shell: config.json

  shell->>xpath: resolve('/')
  xpath-->>shell: root location (isContext?)

  shell->>proto: resolve(requested)
  proto-->>shell: config.json

  shell->>target: exec(config.run)
```

## Context Hierarchy

The repository as a Mycelium context tree. Every
directory with `.spl/` is a context.

```mermaid
graph TD
  root["/ (repo root)\n.spl/"]
  projects["projects/"]
  p06["06-mycelium-api/"]
  p07["07-mc-raw/"]
  p08["08-dogfood/"]
  p09["09-documentation/"]
  mycelium["mycelium/"]
  splectrum["splectrum/"]
  haicc["haicc/"]
  exprepo["exploratory-repo/"]
  spl[".spl/"]
  meta[".spl/meta/"]
  proto[".spl/proto/"]
  cv["context-view/"]
  mccore["mc.core/"]
  mcraw["mc.raw/"]
  mcdata["mc.data/"]
  mcmeta["mc.meta/"]
  mcproto["mc.proto/"]
  mcxpath["mc.xpath/"]

  root --> projects
  root --> mycelium
  root --> splectrum
  root --> haicc
  root --> exprepo
  root --> spl

  projects --> p06
  projects --> p07
  projects --> p08
  projects --> p09

  spl --> meta
  spl --> proto

  proto --> cv
  proto --> mccore
  proto --> mcraw
  proto --> mcdata
  proto --> mcmeta
  proto --> mcproto
  proto --> mcxpath

  style root fill:#d4e6f1,stroke:#2980b9
  style spl fill:#fadbd8,stroke:#e74c3c
  style proto fill:#fadbd8,stroke:#e74c3c
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
  participant caller as Protocol at<br/>/projects/06/
  participant boundary as Invocation<br/>Boundary
  participant mccore as mc.core<br/>at / (root)

  caller->>boundary: list('/src')
  Note over boundary: rebase IN<br/>/src → /projects/06/src
  boundary->>mccore: list('/projects/06/src')
  mccore-->>boundary: results (root-relative paths)
  Note over boundary: rebase OUT<br/>/projects/06/src/... → /src/...
  boundary-->>caller: results (caller-relative paths)
  Note over caller: still at /projects/06/<br/>nothing leaked
```

### Design Invariant

```mermaid
graph LR
  subgraph "Protocol at /projects/06/"
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

```mermaid
graph BT
  root["/ (root)\n.spl/proto/mc.core ✓\n.spl/proto/mc.raw ✓\n.spl/proto/context-view ✓"]
  projects["projects/"]
  p06["projects/06/\n.spl/proto/changelog ✓"]
  resolve["mc.proto.resolve('changelog')\nfrom /projects/06/"]

  resolve -.->|"1. check local → found!"| p06
  p06 ---|parent| projects
  projects ---|parent| root

  style p06 fill:#d5f5e3,stroke:#27ae60
  style resolve fill:#fdebd0,stroke:#e67e22
```

```mermaid
graph BT
  root2["/ (root)\n.spl/proto/context-view ✓"]
  projects2["projects/"]
  p062["projects/06/\n(no context-view)"]
  resolve2["mc.proto.resolve('context-view')\nfrom /projects/06/"]

  resolve2 -.->|"1. check local → not found"| p062
  p062 -.->|"2. check parent → not found"| projects2
  projects2 -.->|"3. check parent → found!"| root2

  style root2 fill:#d5f5e3,stroke:#27ae60
  style resolve2 fill:#fdebd0,stroke:#e67e22
```

- **Static** = found at invocation context (changelog at /projects/06/)
- **Dynamic** = found via ancestor walk (context-view from root)
