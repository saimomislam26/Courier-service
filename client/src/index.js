import React from 'react';
import ReactDOM from 'react-dom';
import ProjectContext from './context/ProjectContext'

import './assets/scss/style.css';
import './assets/core.css'


ReactDOM.render(
  <React.StrictMode>
    <ProjectContext />
  </React.StrictMode>
  ,document.getElementById('root')); 
