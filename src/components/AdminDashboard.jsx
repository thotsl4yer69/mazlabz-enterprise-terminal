import React from 'react'

const AdminDashboard = ({ onClose, files, metadata, status }) => (
  <div className="admin-modal">
    <div className="admin-content">
      <div className="modal-header">
        <h2>Admin Dashboard</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <h3>System Status</h3>
      <ul>
        <li>CPU: {status.cpu}%</li>
        <li>Memory: {status.memory}%</li>
        <li>Uploaded Files: {status.files}</li>
      </ul>
      <h3>Uploaded Files</h3>
      <ul>
        {files.map(f => (
          <li key={f.name}>{f.name}</li>
        ))}
      </ul>
    </div>
  </div>
)

export default AdminDashboard
