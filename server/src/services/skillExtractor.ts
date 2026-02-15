// ============================================================
// Skill Extractor Service
// Extracts skills from resume text using keyword matching
// ============================================================

// Skill categories
const PROGRAMMING_LANGUAGES: string[] = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C', 'C#',
    'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'R', 'SQL',
    'Dart', 'Scala', 'Perl', 'MATLAB', 'Lua', 'Haskell', 'Elixir',
    'Objective-C', 'Shell', 'Bash', 'PowerShell',
];

const FRAMEWORKS: string[] = [
    'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express',
    'Django', 'Flask', 'Spring', 'Spring Boot', '.NET', 'ASP.NET',
    'Laravel', 'Rails', 'Ruby on Rails', 'FastAPI', 'NestJS', 'Svelte',
    'Flutter', 'React Native', 'Tailwind CSS', 'Bootstrap',
    'jQuery', 'Ember.js', 'Backbone.js', 'Gatsby', 'Nuxt.js',
    'Electron', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
    'Pandas', 'NumPy', 'OpenCV', 'Hibernate', 'Maven', 'Gradle',
    'JUnit', 'Jest', 'Mocha', 'Selenium', 'Cypress',
];

const TOOLS_AND_PLATFORMS: string[] = [
    'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'Bitbucket',
    'AWS', 'Azure', 'GCP', 'Google Cloud',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Oracle',
    'Firebase',
    'Jenkins', 'Travis CI', 'CircleCI', 'GitHub Actions',
    'Terraform', 'Ansible', 'Nginx', 'Apache',
    'Linux', 'Ubuntu', 'Windows Server',
    'GraphQL', 'REST', 'gRPC',
    'Kafka', 'RabbitMQ', 'Elasticsearch',
    'Jira', 'Confluence', 'Slack', 'Postman',
    'Figma', 'Adobe XD', 'Sketch',
    'Heroku', 'Vercel', 'Netlify', 'DigitalOcean',
    'Webpack', 'Vite', 'Babel',
    'Spark', 'Airflow', 'Hadoop',
    'Tableau', 'Power BI',
    'Unity', 'Unreal Engine',
    'Xcode', 'Android Studio',
    'VS Code', 'IntelliJ',
];

const CONCEPTS: string[] = [
    'Machine Learning', 'Deep Learning', 'NLP',
    'Natural Language Processing', 'Computer Vision',
    'Data Science', 'Data Analytics', 'Data Engineering',
    'DevOps', 'CI/CD', 'Agile', 'Scrum',
    'Microservices', 'Blockchain', 'Cloud Computing',
    'Cybersecurity', 'Network Security',
    'TDD', 'Test Driven Development',
    'OOP', 'Object Oriented Programming',
    'Functional Programming',
    'RESTful API', 'Web3', 'Smart Contracts',
    'ETL', 'Data Warehousing', 'Data Modeling',
    'System Design', 'Design Patterns',
    'Embedded Systems', 'IoT',
    'AR', 'VR', 'Augmented Reality', 'Virtual Reality',
];

// Build a single lookup map: lowercased skill → canonical name
interface SkillEntry {
    canonical: string;
    category: 'language' | 'framework' | 'tool' | 'concept';
}

function buildSkillMap(): Map<string, SkillEntry> {
    const map = new Map<string, SkillEntry>();

    const addAll = (list: string[], category: SkillEntry['category']) => {
        for (const skill of list) {
            map.set(skill.toLowerCase(), { canonical: skill, category });
        }
    };

    addAll(PROGRAMMING_LANGUAGES, 'language');
    addAll(FRAMEWORKS, 'framework');
    addAll(TOOLS_AND_PLATFORMS, 'tool');
    addAll(CONCEPTS, 'concept');

    return map;
}

const SKILL_MAP = buildSkillMap();

/**
 * Extract skills from resume text using keyword matching.
 * Uses case-insensitive, word-boundary-aware matching.
 */
export function extractSkills(text: string): string[] {
    const normalizedText = text.toLowerCase();
    const found = new Set<string>();

    for (const [key, entry] of SKILL_MAP) {
        // Build a regex with word boundaries for accurate matching
        // Escape special regex characters in the skill name
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[\\s,;()\\[\\]/|•·–—-])${escaped}(?:$|[\\s,;()\\[\\]/|•·–—-])`, 'i');

        if (regex.test(normalizedText)) {
            found.add(entry.canonical);
        }
    }

    return Array.from(found).sort();
}

/**
 * Filter only programming languages from extracted skills.
 */
export function extractProgrammingLanguages(skills: string[]): string[] {
    return skills.filter((skill) => {
        const entry = SKILL_MAP.get(skill.toLowerCase());
        return entry?.category === 'language';
    });
}
