import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ElevoreProvider, useElevore } from './contexts/ElevoreContext';
import ClientPortal from './pages/ClientPortal';
import AuthPage from './pages/AuthPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';


function AppRouter() {
    const { view, role, clientJobId, clientID } = useElevore();

    // Portal view has highest priority if parameters are present
    if (view === 'portal' || clientJobId || clientID) {
        return <ClientPortal />;
    }

    if (view === 'auth') {
        return <AuthPage />;
    }

    if (role === 'staff') {
        return <StaffDashboard />;
    }

    // Default to Admin Dashboard
    return <AdminDashboard />;
}

function App() {
    return (
        <ElevoreProvider>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </ElevoreProvider>
    );
}

export default App;
