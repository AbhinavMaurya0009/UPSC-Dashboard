import React, { useState, useEffect } from 'react';
import './syllabusMapping.css';

const syllabusData = {
  "GS Paper I": {
    "History": ["Prehistoric Cultures", "Indus Valley Civilization", "Vedic Age", "Mauryan Empire", "Post-Mauryan States", "Guptas & Post-Gupta", "Early Medieval India", "Bhakti & Sufi Movements", "Modern Indian History", "Freedom Struggle", "Post-Independence Consolidation", "World History"],
    "Indian Society": ["Features of Indian Society", "Diversity in India", "Caste System", "Women & Population Issues", "Globalization and Social Changes"],
    "Geography": ["Geomorphology", "Climatology", "Oceanography", "Indian Physical Geography", "Resources & Industries", "Human Geography"]
  },
  "GS Paper II": {
    "Polity": ["Constitution & Amendments", "Parliament & Judiciary", "Centre-State Relations", "Local Governance", "Election Commission", "Constitutional Bodies"],
    "Governance": ["E-Governance", "RTI & Citizen Charter", "Social Justice Schemes", "Civil Services & Accountability", "NGOs & SHGs"],
    "International Relations": ["India & Neighbours", "Bilateral & Multilateral Relations", "International Organizations", "Diaspora", "Global Groupings"]
  },
  "GS Paper III": {
    "Economy": ["Planning & NITI Aayog", "Agriculture", "Industry", "Infrastructure", "Public Finance & Budgeting", "Inclusive Growth", "Banking & RBI"],
    "Science & Tech": ["Space Tech", "Defense Tech", "AI & Robotics", "Biotech & Health", "Green Energy", "IT & Cybersecurity"],
    "Environment": ["Ecology & Ecosystems", "Pollution", "Conservation", "Climate Change", "Biodiversity & Environmental Laws"],
    "Security": ["Terrorism & Insurgency", "Cyber Security", "Border Management", "Organized Crime", "Security Agencies"]
  },
  "GS Paper IV": {
    "Ethics, Integrity & Aptitude": ["Ethics & Human Interface", "Attitude & Emotional Intelligence", "Civil Services Values", "Probity in Governance", "Case Studies"]
  },
  "Optional - History": {
    "Paper I": ["Sources", "Prehistory", "Indus Civilization", "Vedic Age", "Mahajanapadas", "Mauryan Empire", "Post-Mauryan States", "Guptas", "South Indian Kingdoms", "Feudalism", "Bhakti & Sufi", "Delhi Sultanate", "Vijayanagar", "Mughals"],
    "Paper II": ["British Expansion", "Economic Impact", "Social Reform Movements", "1857 Revolt", "Indian National Movement", "Gandhian Movements", "Constitutional Developments", "Partition", "Post-Independence India", "World History: Revolutions", "Industrialization", "World Wars", "Cold War & Decolonization"]
  }
};

const SyllabusMapping = () => {
  const [highlight, setHighlight] = useState(() => {
    const saved = localStorage.getItem('syllabusHighlightV2');
    return saved ? JSON.parse(saved) : {};
  });
  const [openGS, setOpenGS] = useState(() => localStorage.getItem('openGS') || '');
  const [openSubject, setOpenSubject] = useState(() => localStorage.getItem('openSubject') || '');

  useEffect(() => {
    localStorage.setItem('syllabusHighlightV2', JSON.stringify(highlight));
  }, [highlight]);

  useEffect(() => {
    localStorage.setItem('openGS', openGS);
  }, [openGS]);

  useEffect(() => {
    localStorage.setItem('openSubject', openSubject);
  }, [openSubject]);

  const toggleHighlight = (topicKey, field) => {
    setHighlight(prev => {
      const updated = {
        ...prev,
        [topicKey]: {
          ...prev[topicKey],
          [field]: !prev[topicKey]?.[field]
        }
      };
      return updated;
    });
  };

  const resetAll = () => {
    setHighlight({});
    setOpenGS('');
    setOpenSubject('');
    localStorage.clear();
  };

  const getRowClass = (topicKey) => {
    const data = highlight[topicKey] || {};
    if (data.studied && data.tough && data.important) return 'bg-studied-tough-important';
    if (data.studied && data.tough) return 'bg-studied-tough';
    if (data.important) return 'bg-important';
    if (data.revision3) return 'bg-revision3';
    if (data.revision2) return 'bg-revision2';
    if (data.revision1) return 'bg-revision1';
    if (data.studied) return 'bg-studied';
    if (data.tough) return 'bg-tough';
    return '';
  };

  return (
    <div className="syllabus-container">
      <h2>Syllabus Mapping</h2>

      <div className="legend">
        <span className="legend-item combo2">Studied + Tough + Important</span>
        <span className="legend-item combo1">Studied + Tough</span>
        <span className="legend-item important">Very Important</span>
        <span className="legend-item rev3">Revision 3</span>
        <span className="legend-item rev2">Revision 2</span>
        <span className="legend-item rev1">Revision 1</span>
        <span className="legend-item studied">Studied</span>
        <span className="legend-item tough">Tough</span>
        <button className="reset-btn" onClick={resetAll}>Reset All</button>
      </div>

      {Object.entries(syllabusData).map(([gsPaper, subjects]) => (
        <div key={gsPaper} className="gs-section">
          <button className="gs-toggle" onClick={() => setOpenGS(openGS === gsPaper ? '' : gsPaper)}>
            {gsPaper}
          </button>

          {openGS === gsPaper && (
            <div className="subject-block">
              {Object.entries(subjects).map(([subject, topics]) => (
                <div key={subject} className="subject-section">
                  <button className="subject-toggle" onClick={() => setOpenSubject(openSubject === subject ? '' : subject)}>
                    {subject}
                  </button>

                  {openSubject === subject && (
                    <table className="syllabus-table">
                      <thead>
                        <tr>
                          <th>Topic</th>
                          <th>Studied</th>
                          <th>Tough</th>
                          <th>Revision 1</th>
                          <th>Revision 2</th>
                          <th>Revision 3</th>
                          <th>Very Important</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topics.map(topic => {
                          const topicKey = `${gsPaper}__${subject}__${topic}`;
                          return (
                            <tr key={topicKey} className={getRowClass(topicKey)}>
                              <td>{topic}</td>
                              {["studied", "tough", "revision1", "revision2", "revision3", "important"].map(field => (
                                <td key={field}>
                                  <input
                                    type="checkbox"
                                    checked={highlight[topicKey]?.[field] || false}
                                    onChange={() => toggleHighlight(topicKey, field)}
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SyllabusMapping;
