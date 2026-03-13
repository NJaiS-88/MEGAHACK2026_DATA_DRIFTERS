// Utility to convert hierarchical topic JSON into nodes/links
// suitable for react-force-graph.
//
// Expected input shape (example):
// {
//   "Thermodynamics": {
//     "Laws of Thermodynamics": [
//       "Zeroth Law and Thermal Equilibrium",
//       "First Law and Conservation of Energy"
//     ],
//     "Thermodynamic Processes": [
//       "Isothermal Processes",
//       "Adiabatic Processes"
//     ]
//   }
// }

/**
 * Parse a hierarchy JSON object into graph data for react-force-graph.
 *
 * @param {object | null} hierarchy
 * @returns {{ nodes: Array, links: Array }}
 */
export function parseHierarchyToGraph(hierarchy) {
  const nodes = [];
  const links = [];

  if (!hierarchy || typeof hierarchy !== 'object') {
    return { nodes, links };
  }

  const seenNodeIds = new Set();

  const ensureNode = (id, group) => {
    if (!id || seenNodeIds.has(id)) return;
    seenNodeIds.add(id);
    nodes.push({ id, group });
  };

  const addLink = (source, target) => {
    if (!source || !target) return;
    links.push({ source, target });
  };

  const topLevelKeys = Object.keys(hierarchy);
  if (topLevelKeys.length === 0) {
    return { nodes, links };
  }

  // Treat each top-level key as a root topic node.
  for (const rootId of topLevelKeys) {
    const subtopics = hierarchy[rootId];

    ensureNode(rootId, 'root');

    if (!subtopics || typeof subtopics !== 'object') {
      continue;
    }

    for (const subtopicId of Object.keys(subtopics)) {
      const concepts = subtopics[subtopicId];

      ensureNode(subtopicId, 'subtopic');
      addLink(rootId, subtopicId);

      if (Array.isArray(concepts)) {
        for (const concept of concepts) {
          if (typeof concept !== 'string') continue;
          const conceptId = concept;
          ensureNode(conceptId, 'concept');
          addLink(subtopicId, conceptId);
        }
      } else if (concepts && typeof concepts === 'object') {
        // In case the extractor ever nests deeper, flatten one more level.
        for (const conceptId of Object.keys(concepts)) {
          ensureNode(conceptId, 'concept');
          addLink(subtopicId, conceptId);
        }
      }
    }
  }

  return { nodes, links };
}

