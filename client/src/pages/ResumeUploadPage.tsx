import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

function ResumeUploadPage() {
    const { uploadResume } = useAuth();
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
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
        setFile(selectedFile);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) handleFile(selected);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    };

    const handleUpload = async () => {
        if (!file) return;
        setError('');
        setIsUploading(true);
        try {
            await uploadResume(file);
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
                <ThemeToggle />
            </div>
            <div className="auth-card" style={{ maxWidth: '520px' }}>
                <div className="auth-header">
                    <h1>📄 Upload Your Resume</h1>
                    <p>Upload your resume to get started. We'll analyze it to extract your skills, detect programming languages, and match you with suitable job roles.</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div
                    className={`upload-zone ${file ? 'upload-zone-has-file' : ''} ${dragOver ? 'upload-zone-has-file' : ''}`}
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
                    <div className="upload-icon">{file ? '📎' : '📤'}</div>
                    <div className="upload-text">
                        {file ? file.name : 'Click or drag & drop your PDF resume'}
                    </div>
                    {file && (
                        <div className="upload-size">
                            {(file.size / 1024).toFixed(0)} KB
                        </div>
                    )}
                    {!file && (
                        <div className="upload-size">PDF only • Max 5MB</div>
                    )}
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    style={{ marginTop: '1.5rem' }}
                >
                    {isUploading ? (
                        <>
                            <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                            Analyzing Resume...
                        </>
                    ) : (
                        'Upload & Analyze'
                    )}
                </button>
            </div>
        </div>
    );
}

export default ResumeUploadPage;
