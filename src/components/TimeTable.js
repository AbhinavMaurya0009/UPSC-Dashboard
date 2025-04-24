import React, { useState, useEffect } from 'react';
import './TimeTable.css';

const defaultSlots = Array.from({ length: 7 }, (_, i) => `T${i + 1}`);
const defaultDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const generateInitialSchedule = () => {
  const schedule = {};
  defaultDays.forEach(day => {
    schedule[day] = {};
    defaultSlots.forEach(slot => {
      schedule[day][slot] = "";
    });
  });
  return schedule;
};

const TimeTable = () => {
  const [editMode, setEditMode] = useState(false);
  const [slots, setSlots] = useState(() => {
    const saved = localStorage.getItem('timeTableSlots');
    return saved ? JSON.parse(saved) : defaultSlots;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('timeTableSchedule');
    return saved ? JSON.parse(saved) : generateInitialSchedule();
  });

  useEffect(() => {
    localStorage.setItem('timeTableSlots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('timeTableSchedule', JSON.stringify(schedule));
  }, [schedule]);

  const handleChange = (day, slot, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: value }
    }));
  };

  const handleSlotChange = (index, value) => {
    const updated = [...slots];
    updated[index] = value;
    setSlots(updated);
  };

  const handleSave = () => setEditMode(false);
  const handleEdit = () => setEditMode(true);

  const handleReset = () => {
    const defaultSchedule = generateInitialSchedule();
    setSchedule(defaultSchedule);
    setSlots(defaultSlots);
    localStorage.setItem('timeTableSchedule', JSON.stringify(defaultSchedule));
    localStorage.setItem('timeTableSlots', JSON.stringify(defaultSlots));
  };

  return (
    <div className="timetable-container">
      <h2>Time Table</h2>
      <div className="button-group">
        {!editMode ? (
          <button className="primary-button" onClick={handleEdit}>Edit Table</button>
        ) : (
          <button className="primary-button" onClick={handleSave}>Save Changes</button>
        )}
        <button className="reset-button" onClick={handleReset}>Reset Table</button>
      </div>

      <table className="timetable">
        <thead>
          <tr>
            <th>Day / Time</th>
            {slots.map((slot, i) => (
              <th key={i}>
                {editMode ? (
                  <input
                    value={slot}
                    onChange={(e) => handleSlotChange(i, e.target.value)}
                  />
                ) : (
                  slot
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {defaultDays.map(day => (
            <tr key={day}>
              <td><strong>{day}</strong></td>
              {slots.map((slot, idx) => (
                <td key={idx}>
                  {editMode ? (
                    <input
                      value={schedule[day][slot]}
                      onChange={(e) => handleChange(day, slot, e.target.value)}
                    />
                  ) : (
                    schedule[day][slot]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeTable;
