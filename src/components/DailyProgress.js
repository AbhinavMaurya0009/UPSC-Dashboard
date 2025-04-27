import React, { useState, useEffect } from 'react';
import './DailyProgress.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toLowerCase();

  const rangeMatch = cleaned.match(/^(\d{1,2})(?::(\d{2}))?-(\d{1,2})(?::(\d{2}))?$/);
  if (rangeMatch) {
    const startHour = parseInt(rangeMatch[1], 10);
    const startMin = parseInt(rangeMatch[2] || '0', 10);
    const endHour = parseInt(rangeMatch[3], 10);
    const endMin = parseInt(rangeMatch[4] || '0', 10);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    return Math.max(endTotal - startTotal, 0);
  }

  const hrMinMatch = cleaned.match(/^(\d+)\s*h(?:\s*(\d+)\s*m)?$/);
  if (hrMinMatch) {
    const hours = parseInt(hrMinMatch[1], 10);
    const minutes = hrMinMatch[2] ? parseInt(hrMinMatch[2], 10) : 0;
    return hours * 60 + minutes;
  }

  const minOnlyMatch = cleaned.match(/^(\d+)\s*m$/);
  if (minOnlyMatch) return parseInt(minOnlyMatch[1], 10);

  const colonMatch = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    return hours * 60 + minutes;
  }

  if (!isNaN(Number(cleaned))) return Number(cleaned);

  return 0;
};

const DailyProgress = () => {
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem('dailyProgressRows');
    return saved ? JSON.parse(saved) : Array.from({ length: 5 }, (_, i) => ({ id: i + 1, time: '', task: '', completed: false }));
  });
  const [report, setReport] = useState(() => {
    const saved = localStorage.getItem('dailyProgressReport');
    return saved ? JSON.parse(saved) : [];
  });
  const [remainingTime, setRemainingTime] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteMeaning, setQuoteMeaning] = useState('');

  const updateReport = (updatedRows) => {
    const valid = updatedRows.filter(row => row.time.trim() && row.task.trim());
    const completed = valid.filter(row => row.completed).length;
    const uncompleted = valid.length - completed;
    const percentage = valid.length ? Math.round((completed / valid.length) * 100) : 0;
    const today = new Date().toLocaleDateString('en-GB');
    const newEntry = { date: today, completed, uncompleted, percentage };

    setReport(prev => {
      const filtered = prev.filter(entry => entry.date !== today);
      return [...filtered, newEntry];
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const startOfToday = new Date(now);
      startOfToday.setHours(4, 0, 0, 0); // 4 AM today

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfToday.getDate() + 1);

      if (now < startOfToday) {
        startOfToday.setDate(startOfToday.getDate() - 1);
        startOfTomorrow.setDate(startOfToday.getDate() + 1);
      }

      const diff = startOfTomorrow - now;

      if (now >= startOfTomorrow) {
        updateReport(rows);
        setCurrentDate(new Date().toDateString());
        const resetRows = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, time: '', task: '', completed: false }));
        setRows(resetRows);
      }

      const currentHour = now.getHours();
      if (currentHour >= 4 && currentHour < 12) {
          <p className="greeting-title">🏹 Daily Battle Plan</p>

        setQuote('वीर भोग्या वसुंधरा');
        setQuoteMeaning('The brave shall inherit the Earth. Conquer your destiny today!');
      } else if (currentHour >= 12 && currentHour < 17) {
        
        setQuote('कर्मण्येवाधिकारस्ते मा फलेषु कदाचन');
        setQuoteMeaning('You have the right to work, but not to the fruits of work. Focus on your efforts!');
      } else if (currentHour >= 17 && currentHour < 21) {
        
        setQuote('उद्योगिनं पुरुषसिंहमुपैति लक्ष्मीः');
        setQuoteMeaning('Prosperity embraces the lion-hearted who work hard. Push your limits!');
      } else {
        
        setQuote('यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः');
        setQuoteMeaning('Where there is Krishna and Arjuna, there is victory. Believe, fight, and win!');
      }

      const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setRemainingTime(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDate, rows]);

  useEffect(() => {
    localStorage.setItem('dailyProgressRows', JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem('dailyProgressReport', JSON.stringify(report));
  }, [report]);

  const toggleEdit = () => setEditMode(!editMode);
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
    updateReport(updated);
  };
  const handleCheck = (index) => {
    const updated = [...rows];
    updated[index].completed = !updated[index].completed;
    setRows(updated);
    updateReport(updated);
  };
  const handleAddRow = () => {
    const updated = [...rows, { id: Date.now(), time: '', task: '', completed: false }];
    setRows(updated);
    updateReport(updated);
  };
  const handleDeleteRow = (id) => {
    const updated = rows.filter(row => row.id !== id);
    setRows(updated);
    updateReport(updated);
  };
  const handleResetRows = () => {
    const resetRows = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, time: '', task: '', completed: false }));
    setRows(resetRows);
    localStorage.setItem('dailyProgressRows', JSON.stringify(resetRows));
  };

  const validRows = rows.filter(row => row.time.trim() && row.task.trim());
  const completedCount = validRows.filter(row => row.completed).length;
  const incompleteCount = validRows.length - completedCount;

  const pieData = {
    labels: validRows.length === 0 ? ['No Tasks'] : ['Completed', 'Pending'],
    datasets: [
      {
        data: validRows.length === 0 ? [1] : [completedCount, incompleteCount],
        backgroundColor: validRows.length === 0
          ? ['#d1d5db']
          : [
              getComputedStyle(document.body).getPropertyValue('--pie-complete').trim(),
              getComputedStyle(document.body).getPropertyValue('--pie-pending').trim()
            ],
        borderWidth: 0,
        hoverOffset: 12,
      }
    ]
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: validRows.length !== 0,
        position: 'top',
        labels: {
          padding: 24,
          color: getComputedStyle(document.body).getPropertyValue('--text').trim(),
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (validRows.length === 0) return 'No tasks assigned';
            const label = context.label;
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} task(s) - ${percentage}%`;
          }
        }
      }
    }
  };

  return (
    <div className="progress-wrapper">
      <div className="greeting-wrapper">
        <p className="greeting-text">{greeting}</p>
        <p className="quote-text">{quote}</p>
        <p className="quote-meaning-text">{quoteMeaning}</p>
      </div>
      <p className="reverse-timer">⏳ Day ends in: {remainingTime}</p>

      <div className="table-chart-wrapper">
        <div className="table-section">
          <h2>Daily Progress</h2>
          <button className="primary-button" onClick={toggleEdit}>
            {editMode ? 'Save Changes' : 'Edit Tasks'}
          </button>
          {editMode && (
            <>
              <button className="secondary-button" onClick={handleAddRow}>+ Add Task</button>
              <button className="reset-button" onClick={handleResetRows}>Reset Tasks</button>
            </>
          )}
          <table className="daily-progress-table">
            <thead>
              <tr>
                <th>Done</th>
                <th>Time</th>
                <th>Task</th>
                {editMode && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.completed}
                      onChange={() => handleCheck(index)}
                      disabled={!(row.time.trim() && row.task.trim())}
                      title={!(row.time.trim() && row.task.trim()) ? "Please fill time & task" : ""}
                    />
                  </td>
                  <td>
                    {editMode ? (
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) => handleChange(index, 'time', e.target.value)}
                      />
                    ) : (
                      <div className="static-text">{row.time}</div>
                    )}
                  </td>
                  <td>
                    {editMode ? (
                      <input
                        type="text"
                        value={row.task}
                        onChange={(e) => handleChange(index, 'task', e.target.value)}
                      />
                    ) : (
                      <div className="static-text">{row.task}</div>
                    )}
                  </td>
                  {editMode && (
                    <td>
                      <button className="delete-button" onClick={() => handleDeleteRow(row.id)}>🗑️</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-section">
          
          <div className="pie-container">
            <div className="pie-wrapper">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Daily Progress Report</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Completed Tasks</th>
              <th>Uncompleted Tasks</th>
              <th>% Done</th>
              <th>Total Study Time</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const today = new Date().toLocaleDateString('en-GB');
              const todayRows = rows.filter(row => row.time.trim() && row.task.trim());
              const completedTasks = todayRows.filter(row => row.completed);
              const uncompletedTasks = todayRows.filter(row => !row.completed);
              const percentage = todayRows.length ? Math.round((completedTasks.length / todayRows.length) * 100) : 0;
              const totalCompletedMinutes = completedTasks.reduce((acc, row) => acc + parseTimeToMinutes(row.time), 0);
              const hours = Math.floor(totalCompletedMinutes / 60);
              const minutes = totalCompletedMinutes % 60;
              const formatted = totalCompletedMinutes > 0 ? `${hours}h ${minutes}m` : '-';

              return (
                <tr>
                  <td>{today}</td>
                  <td>{completedTasks.map(row => row.task).join(', ') || '-'}</td>
                  <td>{uncompletedTasks.map(row => row.task).join(', ') || '-'}</td>
                  <td>{percentage}%</td>
                  <td>{formatted}</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyProgress;
