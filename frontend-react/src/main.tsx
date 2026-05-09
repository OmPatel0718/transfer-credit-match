import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { RoleViewProvider } from './context/RoleViewContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleViewProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </RoleViewProvider>
  </StrictMode>,
)
