import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SidebarComponent from "./components/SidebarComponent";
import { HashRouter } from "react-router";
import AppBarComponent from "./components/AppBarComponent.tsx";
import { FontPresetProvider } from './FontPresetProvider';
import { ColorThemeProvider } from './ColorThemeProvider';
import { SettingsProvider } from './SettingsProvider';
import SettingsDialog from './components/SettingsDialog';
import { loadServeConfig } from './config/serve';

const root = createRoot(document.getElementById('root')!);

function ConfigLoadError({ message }: { message: string }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '40rem' }}>
      <h1 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>CONFIG LOAD FAILED</h1>
      <p style={{ marginBottom: '0.75rem' }}>{message}</p>
      <p style={{ opacity: 0.8 }}>
        Ensure <code>public/config.json</code> exists (copied to <code>dist/config.json</code> on deploy).
        See <code>public/config.example.json</code>.
      </p>
    </div>
  );
}

function renderApp() {
  root.render(
    <StrictMode>
      <HashRouter>
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
      </HashRouter>
    </StrictMode>,
  );
}

loadServeConfig()
  .then(() => renderApp())
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown config error';
    root.render(<ConfigLoadError message={message} />);
  });
