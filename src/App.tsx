import './App.css'
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from './context/ThemeContext'
import { MantineProvider } from '@mantine/core';
import Auth from './pages/auth';
import { Notifications } from '@mantine/notifications';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MantineProvider>
          <Notifications position="top-right" />
          <div className="w-full h-screen bg-royalblue dark:bg-gray-900 text-gray-900 dark:text-white">
            <Auth />
          </div>
        </MantineProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;