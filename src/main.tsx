import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SidebarComponent from "./components/SidebarComponent";
import { BrowserRouter } from "react-router";
import AppBarComponent from "./components/AppBarComponent.tsx";
import { FontPresetProvider } from './FontPresetProvider';
import { ColorThemeProvider } from './ColorThemeProvider';
import { SettingsProvider } from './SettingsProvider';
import SettingsDialog from './components/SettingsDialog';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ColorThemeProvider>
        <FontPresetProvider>
          <SettingsProvider>
            <SettingsDialog />
            <div className="app-container-main">
              <AppBarComponent />
              <div className="app-container">
                <SidebarComponent />
                <App />
              </div>
            </div>
          </SettingsProvider>
        </FontPresetProvider>
      </ColorThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
