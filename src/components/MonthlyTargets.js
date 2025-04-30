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
    const minutes = parseInt(hrMinMatch[2] || '0', 10);
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
    return saved ? JSON.parse(saved) : Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      time: '',
      task: '',
      completed: false
    }));
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

  const updateReport = (rowsToUse, dateString) => {
    const valid = rowsToUse.filter(row => row.time.trim() && row.task.trim());
    const completedTasks = valid.filter(row => row.completed).map(row => row.task);
    const uncompletedTasks = valid.filter(row => !row.completed).map(row => row.task);
    const percentage = valid.length ? Math.round((completedTasks.length / valid.length) * 100) : 0;
    const totalCompletedMinutes = valid.reduce((acc, row) => acc + parseTimeToMinutes(row.time), 0);

    const newEntry = {
      date: dateString,
      completedTasks,
      uncompletedTasks,
      percentage,
      totalStudyTime: totalCompletedMinutes
    };

    setReport(prev => [...prev, newEntry]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const startOfToday = new Date(now);
      startOfToday.setHours(4, 0, 0, 0);
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfToday.getDate() + 1);

      if (now < startOfToday) {
        startOfToday.setDate(startOfToday.getDate() - 1);
        startOfTomorrow.setDate(startOfToday.getDate() + 1);
      }

      const diff = startOfTomorrow - now;

      if (now >= startOfTomorrow) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDate = yesterday.toLocaleDateString('en-GB');

        updateReport(rows, yDate);

        const reset = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          time: '',
          task: '',
          completed: false
        }));
        setRows(reset);
        setCurrentDate(new Date().toDateString());
      }

      const hr = now.getHours();
      if (hr >= 4 && hr < 12) {
        setGreeting('🏹 Daily Battle Plan');
        setQuote('वीर भोग्या वसुंधरा');
        setQuoteMeaning('The brave shall inherit the Earth. Conquer your destiny today!');
      } else if (hr >= 12 && hr < 17) {
        setGreeting('🌞 Keep Moving!');
        setQuote('कर्मण्येवाधिकारस्ते मा फलेषु कदाचन');
        setQuoteMeaning('You have the right to work, but not to the fruits of work. Focus on your efforts!');
      } else if (hr >= 17 && hr < 21) {
        setGreeting('🔥 Power Hour!');
        setQuote('उद्योगिनं पुरुषसिंहमुपैति लक्ष्मीः');
        setQuoteMeaning('Prosperity embraces the lion-hearted who work hard. Push your limits!');
      } else {
        setGreeting('🌙 Night Vigil');
        setQuote('यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः');
        setQuoteMeaning('Where there is Krishna and Arjuna, there is victory. Believe, fight, and win!');
      }

      const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setRemainingTime(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [rows]);

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
  };

  const handleCheck = (index) => {
    const updated = [...rows];
    updated[index].completed = !updated[index].completed;
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, {
      id: Date.now(),
      time: '',
      task: '',
      completed: false
    }]);
  };

  const handleDeleteRow = (id) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const handleResetRows = () => {
    const reset = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      time: '',
      task: '',
      completed: false
    }));
    setRows(reset);
  };

  const validRows = rows.filter(row => row.time.trim() && row.task.trim());
  const completedCount = validRows.filter(row => row.completed).length;
  const incompleteCount = validRows.length - completedCount;

  const pieData = {
    labels: validRows.length === 0 ? ['No Tasks'] : ['Completed', 'Pending'],
    datasets: [{
      data: validRows.length === 0 ? [1] : [completedCount, incompleteCount],
      backgroundColor: validRows.length === 0
        ? ['#d1d5db']
        : [
            getComputedStyle(document.body).getPropertyValue('--pie-complete').trim(),
            getComputedStyle(document.body).getPropertyValue('--pie-pending').trim()
          ],
      borderWidth: 0,
      hoverOffset: 12
    }]
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: validRows.length !== 0,
        position: 'top',
        labels: {
          color: getComputedStyle(document.body).getPropertyValue('--text').trim(),
          font: { size: 14, weight: '600' },
          padding: 24
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
                    />
                  </td>
                  <td>{editMode ? (
                    <input type="text" value={row.time} onChange={(e) => handleChange(index, 'time', e.target.value)} />
                  ) : (<span>{row.time}</span>)}</td>
                  <td>{editMode ? (
                    <input type="text" value={row.task} onChange={(e) => handleChange(index, 'task', e.target.value)} />
                  ) : (<span>{row.task}</span>)}</td>
                  {editMode && (
                    <td><button onClick={() => handleDeleteRow(row.id)}>🗑️</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-section">
          <Pie data={pieData} options={pieOptions} />
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
            {report.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{(entry.completedTasks || []).join(', ') || '-'}</td>
                <td>{(entry.uncompletedTasks || []).join(', ') || '-'}</td>
                <td>{entry.percentage ?? 0}%</td>
                <td>{entry.totalStudyTime > 0
                  ? `${Math.floor(entry.totalStudyTime / 60)}h ${entry.totalStudyTime % 60}m`
                  : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyProgress;
