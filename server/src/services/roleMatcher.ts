// ============================================================
// Role Matcher Service
// Predicts suitable job roles using cosine similarity
// ============================================================

export interface RoleMatch {
    role: string;
    matchScore: number; // 0–100 percentage
}

// Role → expected skills mapping
const ROLE_SKILL_MAP: Record<string, string[]> = {
    'Backend Developer': [
        'Node.js', 'Express', 'Python', 'Django', 'Flask', 'FastAPI',
        'Java', 'Spring', 'Spring Boot',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL',
        'REST', 'GraphQL', 'Docker', 'Git', 'Linux',
    ],
    'Frontend Developer': [
        'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
        'Vue.js', 'Angular', 'Next.js', 'Svelte',
        'Tailwind CSS', 'Bootstrap', 'Webpack', 'Vite',
        'Jest', 'Cypress', 'Git', 'Figma',
    ],
    'Full Stack Developer': [
        'React', 'Node.js', 'JavaScript', 'TypeScript',
        'Express', 'MongoDB', 'PostgreSQL', 'SQL',
        'REST', 'GraphQL', 'Docker', 'Git',
        'Next.js', 'Tailwind CSS', 'Firebase',
    ],
    'ML Engineer': [
        'Python', 'TensorFlow', 'PyTorch', 'Keras',
        'Scikit-learn', 'NLP', 'Computer Vision',
        'Deep Learning', 'Machine Learning',
        'Pandas', 'NumPy', 'Docker', 'SQL', 'Git',
    ],
    'Data Scientist': [
        'Python', 'R', 'SQL', 'Machine Learning', 'Data Science',
        'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow',
        'Tableau', 'Power BI', 'Data Analytics',
        'Statistics', 'NLP', 'Deep Learning',
    ],
    'Data Engineer': [
        'Python', 'SQL', 'Kafka', 'Spark', 'Airflow',
        'AWS', 'GCP', 'ETL', 'Data Warehousing', 'Data Modeling',
        'PostgreSQL', 'MongoDB', 'Redis', 'Docker',
        'Hadoop', 'Elasticsearch',
    ],
    'Java Developer': [
        'Java', 'Spring', 'Spring Boot', 'Hibernate',
        'Maven', 'Gradle', 'JUnit', 'SQL',
        'PostgreSQL', 'MySQL', 'Oracle',
        'REST', 'Microservices', 'Docker', 'Git',
    ],
    'Python Developer': [
        'Python', 'Django', 'Flask', 'FastAPI',
        'PostgreSQL', 'MongoDB', 'Redis', 'SQL',
        'REST', 'Docker', 'Git', 'Linux',
        'Pandas', 'NumPy', 'Celery',
    ],
    'DevOps Engineer': [
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible',
        'CI/CD', 'Linux', 'Git', 'Nginx',
        'Shell', 'Bash', 'Python',
    ],
    'Cloud Engineer': [
        'AWS', 'Azure', 'GCP', 'Google Cloud',
        'Docker', 'Kubernetes', 'Terraform',
        'Linux', 'CI/CD', 'Jenkins',
        'Python', 'Shell', 'Bash', 'Nginx',
    ],
    'Mobile Developer': [
        'Flutter', 'React Native', 'Dart', 'Swift', 'Kotlin',
        'Java', 'Firebase', 'REST',
        'Android Studio', 'Xcode', 'Git',
        'TypeScript', 'JavaScript',
    ],
    'iOS Developer': [
        'Swift', 'Objective-C', 'Xcode',
        'Firebase', 'REST', 'Git',
        'UIKit', 'SwiftUI', 'CocoaPods',
    ],
    'Android Developer': [
        'Kotlin', 'Java', 'Android Studio',
        'Firebase', 'REST', 'Git',
        'Jetpack', 'Gradle', 'Room',
    ],
    'QA / Test Engineer': [
        'Selenium', 'Cypress', 'JUnit', 'Jest', 'Mocha',
        'TDD', 'CI/CD', 'Python', 'JavaScript',
        'Postman', 'Git', 'Jira', 'Agile',
    ],
    'Cybersecurity Analyst': [
        'Cybersecurity', 'Network Security', 'Linux',
        'Python', 'Shell', 'Bash',
        'Firewalls', 'Penetration Testing',
        'AWS', 'Docker', 'Git',
    ],
    'AI Research Engineer': [
        'Python', 'TensorFlow', 'PyTorch', 'Keras',
        'Deep Learning', 'NLP', 'Computer Vision',
        'Machine Learning', 'NumPy', 'Pandas',
        'R', 'MATLAB', 'Git',
    ],
    'Game Developer': [
        'C++', 'C#', 'Unity', 'Unreal Engine',
        'OpenGL', 'DirectX', 'Python',
        'Git', 'Lua', 'Blender',
    ],
    'Blockchain Developer': [
        'Solidity', 'Blockchain', 'Web3', 'Smart Contracts',
        'JavaScript', 'TypeScript', 'Node.js',
        'React', 'Git', 'Docker', 'Ethereum',
    ],
    'Database Administrator': [
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Oracle',
        'Redis', 'SQLite', 'Data Modeling',
        'Linux', 'Docker', 'Python', 'Shell',
    ],
    'Systems Engineer': [
        'C', 'C++', 'Linux', 'Shell', 'Bash',
        'Docker', 'Kubernetes', 'Nginx',
        'Embedded Systems', 'IoT', 'Networking',
        'Python', 'Git',
    ],
    'UI/UX Designer': [
        'Figma', 'Adobe XD', 'Sketch',
        'CSS', 'HTML', 'JavaScript',
        'Tailwind CSS', 'Bootstrap',
        'React', 'Design Systems',
    ],
};

/**
 * Compute cosine similarity between two binary skill vectors.
 * Both vectors use the same universe of skills (union of all skills).
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;

    return dot / (magA * magB);
}

/**
 * Match user's extracted skills against role profiles.
 * Returns top 3 roles sorted by cosine similarity score (0–100%).
 */
export function matchRoles(userSkills: string[]): RoleMatch[] {
    if (userSkills.length === 0) return [];

    const userSkillsLower = new Set(userSkills.map((s) => s.toLowerCase()));
    const results: RoleMatch[] = [];

    for (const [role, roleSkills] of Object.entries(ROLE_SKILL_MAP)) {
        const roleSkillsLower = roleSkills.map((s) => s.toLowerCase());

        // Build the union of all skills for the vector space
        const allSkills = new Set([...userSkillsLower, ...roleSkillsLower]);
        const universe = Array.from(allSkills);

        // Create binary vectors
        const userVec = universe.map((s) => (userSkillsLower.has(s) ? 1 : 0));
        const roleVec = universe.map((s) => (roleSkillsLower.includes(s) ? 1 : 0));

        const score = cosineSimilarity(userVec, roleVec);
        const percentage = Math.round(score * 100);

        if (percentage > 0) {
            results.push({ role, matchScore: percentage });
        }
    }

    // Sort descending by score and return top 3
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results.slice(0, 3);
}
