/**
 * Requirements parser — extracts requirement objects
 * from a REQUIREMENTS.md file.
 *
 * Two formats supported:
 * 1. ### R{n}: {title} — R-numbered requirements
 * 2. ## {section} with numbered items — section format
 *
 * Pure function, no imports beyond the input string.
 */

/**
 * Parse REQUIREMENTS.md content into requirement objects.
 * Tries R-numbered format first, falls back to sections.
 *
 * Returns: [{ id, title, text, gates }]
 */
export function parseRequirements(markdown) {
  const lines = markdown.split('\n');

  const rNumbered = parseRNumbered(lines);
  if (rNumbered.length > 0) {
    const gates = parseGates(lines);
    associateGates(gates, rNumbered);
    return rNumbered;
  }

  return parseSections(lines);
}

/** Parse ### R{n}: {title} format. */
function parseRNumbered(lines) {
  const requirements = [];
  let current = null;

  for (const line of lines) {
    const reqMatch = line.match(/^### (R\d+):\s*(.+)/);
    if (reqMatch) {
      if (current) requirements.push(finishReq(current));
      current = { id: reqMatch[1], title: reqMatch[2].trim(), textLines: [] };
      continue;
    }

    if (line.match(/^## /)) {
      if (current) {
        requirements.push(finishReq(current));
        current = null;
      }
    }

    if (current) current.textLines.push(line);
  }

  if (current) requirements.push(finishReq(current));
  return requirements;
}

/** Parse ## {section} format with numbered items as gates. */
function parseSections(lines) {
  const requirements = [];
  let current = null;
  let index = 0;

  for (const line of lines) {
    if (line.match(/^# /)) continue;

    const sectionMatch = line.match(/^## (.+)/);
    if (sectionMatch) {
      if (current) {
        index++;
        requirements.push({
          id: `S${index}`,
          title: current.title,
          text: current.textLines.join('\n').trim(),
          gates: current.gates,
        });
      }
      current = { title: sectionMatch[1].trim(), textLines: [], gates: [] };
      continue;
    }

    if (current) {
      const numMatch = line.match(/^\d+\.\s+(.+)/);
      if (numMatch) current.gates.push(numMatch[1].trim());
      current.textLines.push(line);
    }
  }

  if (current) {
    index++;
    requirements.push({
      id: `S${index}`,
      title: current.title,
      text: current.textLines.join('\n').trim(),
      gates: current.gates,
    });
  }

  return requirements;
}

function finishReq(current) {
  return {
    id: current.id,
    title: current.title,
    text: current.textLines.join('\n').trim(),
    gates: [],
  };
}

function parseGates(lines) {
  const gates = [];
  let inGates = false;

  for (const line of lines) {
    if (line.match(/^## Quality Gates/)) { inGates = true; continue; }
    if (inGates && line.match(/^## /)) break;
    if (inGates) {
      const bulletMatch = line.match(/^- (.+)/);
      if (bulletMatch) gates.push(bulletMatch[1].trim());
    }
  }

  return gates;
}

function associateGates(gates, requirements) {
  for (const gate of gates) {
    const matched = matchGateToRequirement(gate, requirements);
    if (matched) {
      matched.gates.push(gate);
    } else if (requirements.length > 0) {
      requirements[0].gates.push(gate);
    }
  }
}

function matchGateToRequirement(gate, requirements) {
  const gateLower = gate.toLowerCase();

  for (const req of requirements) {
    const titleWords = req.title.toLowerCase().split(/\s+/);
    const matches = titleWords.filter(w => w.length > 3 && gateLower.includes(w));
    if (matches.length >= 2) return req;
  }

  for (const req of requirements) {
    const titleWords = req.title.toLowerCase().split(/\s+/);
    const significantWords = titleWords.filter(w => w.length > 4);
    for (const word of significantWords) {
      if (gateLower.includes(word)) return req;
    }
  }

  return null;
}
