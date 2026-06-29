import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function Home() {
    return (
        <div className="mx-auto max-w-3xl p-8 font-sans text-slate-800">
            <h1 className="text-2xl font-semibold tracking-tight">Seo Dashboard</h1>
            <p className="mt-3 text-slate-600">
                React SPA shell is wired. JSON API lives at{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">/api/v1</code>
                — authenticate with{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">POST /api/v1/auth/login</code>{' '}
                and send{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">Authorization: Bearer {'{token}'}</code>.
            </p>
            <p className="mt-4 text-sm text-slate-500">
                Replace this starter with your real routes and UI (e.g. React Query + auth context).
            </p>
            <nav className="mt-6 flex gap-4 text-sm font-medium text-indigo-600">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
            </nav>
        </div>
    );
}

function About() {
    return (
        <div className="mx-auto max-w-3xl p-8 font-sans text-slate-800">
            <h1 className="text-2xl font-semibold">About</h1>
            <p className="mt-3 text-slate-600">Sample route — expand the router in resources/js/app.jsx.</p>
            <Link className="mt-4 inline-block text-sm font-medium text-indigo-600" to="/">
                ← Back
            </Link>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </BrowserRouter>
    );
}

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
