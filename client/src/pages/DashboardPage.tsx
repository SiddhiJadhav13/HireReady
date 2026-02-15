import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [roleError, setRoleError] = useState('');


    if (!user) return null;

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="dashboard-nav-logo">HireReady</div>
                <div className="dashboard-nav-actions">
                    <ThemeToggle />
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/skill-analysis')}>
                        🛠️ Skill Analysis
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                    <button className="btn btn-ghost nav-tab nav-tab-active" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-welcome">
                    <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
                    <p>Your placement readiness hub.</p>
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/resume')}>
                        Upload Resume
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setRoleError('');
                            navigate('/mocktest');
                        }}
                    >
                        Start Mock Test
                    </button>
                </div>
                {roleError && <div className="alert alert-error">{roleError}</div>}
            </div>
        </div>
    );
}

export default DashboardPage;
