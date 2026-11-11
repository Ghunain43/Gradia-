import {createRoot} from 'react-dom/client';
import {lazy, Suspense} from 'react';
import {AppErrorBoundary} from './components/AppErrorBoundary';
import './index.css';

// Import failures also reach the boundary rather than preventing it from mounting.
const App = lazy(() => import('./App.tsx'));

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <Suspense fallback={<p role="status" className="min-h-screen bg-slate-950 text-slate-100 p-8">Loading Gradia...</p>}>
      <App />
    </Suspense>
  </AppErrorBoundary>,
);
