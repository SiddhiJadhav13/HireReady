import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

function SkillAnalysisPage() {
    const { user, uploadResume, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selectedFile: File) => {
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.');
            return;
        }
        setError('');
        setResumeFile(selectedFile);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    };

    const handleUpload = async () => {
        if (!resumeFile) return;
        // setError(''); // Don't clear error immediately so it stays if needed, or clear it only on success
        setMessage('');
        setIsUploading(true);
        try {
            await uploadResume(resumeFile);
            await refreshUser();
            setMessage('Resume analyzed successfully! Skills and role matches updated.');
            setResumeFile(null);
            setError(''); // Clear error only on success
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload resume.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await api.get('/resume/download', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${user?.name.replace(/\s+/g, '_')}_Resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Failed to download resume.');
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="dashboard-nav-logo">HireReady</div>
                <div className="dashboard-nav-actions">
                    <ThemeToggle />
                    <button className="btn btn-ghost nav-tab nav-tab-active" onClick={() => navigate('/skill-analysis')}>
                        🛠️ Skill Analysis
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                    <button className="btn btn-ghost nav-tab" onClick={() => navigate('/dashboard')}>
                        🏠 Dashboard
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-welcome">
                    <h1>Skill Analysis</h1>
                    <p>Upload your resume and see the extracted skills, languages, and role matches.</p>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {/* Upload + Resume Status Side by Side */}
                <div className="analysis-split">
                    {/* Left: Upload */}
                    <div className="analysis-panel">
                        <h3 className="profile-section-title">📤 Upload Resume</h3>
                        <p className="profile-section-desc">
                            {user.hasResume ? 'Re-upload to refresh analysis.' : 'PDF only, max 5MB.'}
                        </p>
                        <div
                            className={`upload-zone ${resumeFile ? 'upload-zone-has-file' : ''} ${dragOver ? 'upload-zone-has-file' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <div className="upload-icon">{resumeFile ? '📎' : user.hasResume ? '🔄' : '📤'}</div>
                            <div className="upload-text">
                                {resumeFile ? resumeFile.name : user.hasResume ? 'Click to re-upload' : 'Click or drag & drop PDF'}
                            </div>
                            {resumeFile && <div className="upload-size">{(resumeFile.size / 1024).toFixed(0)} KB</div>}
                            {!resumeFile && <div className="upload-size">PDF only • Max 5MB</div>}
                        </div>
                        {resumeFile && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={isUploading}
                                style={{ marginTop: '1rem' }}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Upload & Analyze'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Right: Resume Status + Download */}
                    <div className="analysis-panel">
                        <h3 className="profile-section-title">📄 Your Resume</h3>
                        {user.hasResume ? (
                            <div className="resume-download-card">
                                <div className="resume-download-icon">📄</div>
                                <div className="resume-download-info">
                                    <span className="resume-download-status">✅ Resume Uploaded</span>
                                    <span className="resume-download-hint">Click below to view your uploaded resume</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleDownload}
                                    style={{ width: 'auto', marginTop: '1rem' }}
                                >
                                    ⬇️ View Resume
                                </button>
                            </div>
                        ) : (
                            <div className="resume-download-card">
                                <div className="resume-download-icon" style={{ opacity: 0.4 }}>📄</div>
                                <div className="resume-download-info">
                                    <span className="resume-download-status" style={{ color: 'var(--text-muted)' }}>No resume uploaded</span>
                                    <span className="resume-download-hint">Upload a PDF to get started</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis Results */}
                {user.hasResume && (
                    <>
                        {user.matchedRoles.length > 0 && (
                            <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="profile-section-title">🚀 Top Matched Roles</h3>
                                <p className="profile-section-desc">Based on cosine similarity between your skills and role profiles.</p>
                                <div className="role-match-list">
                                    {user.matchedRoles.map((match, idx) => (
                                        <div key={match.role} className="role-match-item">
                                            <div className="role-match-header">
                                                <span className="role-match-rank">#{idx + 1}</span>
                                                <span className="role-match-name">{match.role}</span>
                                                <span className="role-match-score">{match.matchScore}%</span>
                                            </div>
                                            <div className="role-match-bar-bg">
                                                <div className="role-match-bar-fill" style={{ width: `${match.matchScore}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {user.extractedSkills.length > 0 && (
                            <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="profile-section-title">🛠️ Extracted Skills ({user.extractedSkills.length})</h3>
                                <div className="skill-tags">
                                    {user.extractedSkills.map((skill) => (
                                        <span key={skill} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {user.programmingLanguages.length > 0 && (
                            <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="profile-section-title">💻 Programming Languages ({user.programmingLanguages.length})</h3>
                                <div className="skill-tags">
                                    {user.programmingLanguages.map((lang) => (
                                        <span key={lang} className="skill-tag skill-tag-lang">{lang}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SkillAnalysisPage;
