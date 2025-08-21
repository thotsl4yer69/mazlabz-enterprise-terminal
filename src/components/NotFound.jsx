import React from 'react'

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h1>404 - Page Not Found</h1>
import { Link } from 'react-router-dom'
import React from 'react'

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h1>404 - Page Not Found</h1>
    <Link to="/">Return home</Link>
  </div>
)

export default NotFound
