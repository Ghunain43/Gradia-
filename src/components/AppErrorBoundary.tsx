import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
  backupError: string | null;
}

// This boundary intentionally has no dependency on AcademicContext or PDF.js.
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, backupError: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Gradia could not render:', error, info.componentStack);
  }

  downloadBackup = () => {
    try {
      const records: Record<string, string | null> = {};
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith('gradia_')) records[key] = localStorage.getItem(key);
      }
      // Preserve raw strings, including invalid JSON, for diagnosis and recovery.
      const blob = new Blob([JSON.stringify({ records }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'gradia-recovery-backup.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      this.setState({ backupError: 'Browser storage is unavailable. Enable storage access and reload to try again.' });
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main role="alert" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <section className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 space-y-5">
          <p className="font-semibold text-indigo-300">Gradia</p>
          <h1 className="text-2xl font-bold">Gradia couldn't open this screen</h1>
          <p className="text-slate-300">Reload to try again. If the problem continues, download a backup of your saved data before making any changes to browser storage.</p>
          <details className="rounded-lg bg-slate-950 p-4" open>
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-rose-300">{this.state.error.message || String(this.state.error)}</pre>
          </details>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => window.location.reload()} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">Reload Gradia</button>
            <button onClick={this.downloadBackup} className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800">Download saved data</button>
          </div>
          {this.state.backupError && <p className="text-amber-300">{this.state.backupError}</p>}
        </section>
      </main>
    );
  }
}
