import React, { useState, useEffect } from 'react';
import './DailyProgress.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyProgress = () => {
  const [editMode, setEditMode] = useState(false);

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem('monthlyProgressRows');
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          time: '',
          task: '',
          completed: false,
        }));
  });

  const [report, setReport] = useState(() => {
    const saved = localStorage.getItem('monthlyProgressReport');
    return saved ? JSON.parse(saved) : [];
  });

  const [remainingTime, setRemainingTime] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());

  const updateReport = (updatedRows) => {
    const valid = updatedRows.filter((row) => row.time.trim() && row.task.trim());
    const completed = valid.filter((row) => row.completed).length;
    const uncompleted = valid.length - completed;
    const percentage = valid.length ? Math.round((completed / valid.length) * 100) : 0;
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long', year: 'numeric' });

    const newEntry = { date: month, completed, uncompleted, percentage };

    setReport((prev) => {
      const filtered = prev.filter((entry) => entry.date !== month);
      return [...filtered, newEntry];
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;

      if (now.toDateString() !== currentDate) {
        setCurrentDate(now.toDateString());
        const resetRows = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          time: '',
          task: '',
          completed: false,
        }));
        setRows(resetRows);
        updateReport(resetRows);
      }

      const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setRemainingTime(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('monthlyProgressReport', JSON.stringify(report));
  }, [report]);

  useEffect(() => {
    localStorage.setItem('monthlyProgressRows', JSON.stringify(rows));
  }, [rows]);

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
    const updated = [
      ...rows,
      {
        id: Date.now(),
        time: '',
        task: '',
        completed: false,
      },
    ];
    setRows(updated);
    updateReport(updated);
  };

  const handleDeleteRow = (id) => {
    const updated = rows.filter((row) => row.id !== id);
    setRows(updated);
    updateReport(updated);
  };

  const handleResetTasks = () => {
    const resetRows = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      time: '',
      task: '',
      completed: false,
    }));
    setRows(resetRows);
    updateReport(resetRows);
    localStorage.setItem('monthlyProgressRows', JSON.stringify(resetRows));
  };

  const validRows = rows.filter((row) => row.time.trim() && row.task.trim());
  const completedCount = validRows.filter((row) => row.completed).length;
  const incompleteCount = validRows.length - completedCount;

  const pieData = {
    labels: validRows.length === 0 ? ['No Tasks'] : ['Completed', 'Pending'],
    datasets: [
      {
        data: validRows.length === 0 ? [1] : [completedCount, incompleteCount],
        backgroundColor:
          validRows.length === 0
            ? ['#d1d5db']
            : [
                getComputedStyle(document.body).getPropertyValue('--pie-complete').trim(),
                getComputedStyle(document.body).getPropertyValue('--pie-pending').trim(),
              ],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            if (validRows.length === 0) {
              return 'No tasks assigned';
            }
            const label = context.label;
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} task(s) - ${percentage}%`;
          },
        },
      },
      legend: {
        display: validRows.length !== 0,
        labels: {
          color: getComputedStyle(document.body).getPropertyValue('--text').trim(),
          font: { weight: '500' },
        },
      },
    },
  };

  return (
    <div className="progress-wrapper">
      <div className="table-chart-wrapper">
        <div className="table-section">
          <h2>Monthly Progress</h2>
          <p className="reverse-timer">Day ends in: ⏳ {remainingTime}</p>
          <button className="primary-button" onClick={toggleEdit}>
            {editMode ? 'Save Changes' : 'Edit Tasks'}
          </button>
          {editMode && (
            <>
              <button className="secondary-button" onClick={handleAddRow}>
                + Add Task
              </button>
              <button className="reset-button" onClick={handleResetTasks}>
                🔄 Reset Tasks
              </button>
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
                      title={!(row.time.trim() && row.task.trim()) ? 'Please fill time & task' : ''}
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
                      <button className="delete-button" onClick={() => handleDeleteRow(row.id)}>
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-section">
          <h3>Progress Chart</h3>
          <div className="pie-container">
            <div className='pie-wrapper'>
            <Pie data={pieData} options={pieOptions} />

            </div>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Monthly Progress Report</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Completed Tasks</th>
              <th>Uncompleted Tasks</th>
              <th>% Done</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const today = new Date();
              const month = today.toLocaleString('default', { month: 'long', year: 'numeric' });
              const todayRows = rows.filter((row) => row.time.trim() && row.task.trim());
              const completedTasks = todayRows.filter((row) => row.completed).map((row) => row.task);
              const uncompletedTasks = todayRows.filter((row) => !row.completed).map((row) => row.task);
              const percentage = todayRows.length
                ? Math.round((completedTasks.length / todayRows.length) * 100)
                : 0;
              return (
                <tr>
                  <td>{month}</td>
                  <td>{completedTasks.join(', ') || '-'}</td>
                  <td>{uncompletedTasks.join(', ') || '-'}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyProgress;
