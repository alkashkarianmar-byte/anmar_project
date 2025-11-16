import React from 'react';

// Animation for the Home page
const HomeAnimation = () => (
    <svg viewBox="0 0 200 100" className="w-48 h-24">
        <style>{`
            .book-page { animation: flip 2s ease-in-out infinite alternate; transform-origin: 0 100%; }
            @keyframes flip { from { transform: rotateX(0deg); } to { transform: rotateX(-180deg); } }
            .light-beam { animation: flicker 3s ease-in-out infinite; opacity: 0; }
            @keyframes flicker { 0%, 100% { opacity: 0; } 50% { opacity: 0.8; } }
        `}</style>
        {/* Book */}
        <path d="M50 80 Q60 70 70 80 L70 95 L50 95 Z" fill="#a0522d" />
        <path d="M50 80 Q40 70 30 80 L30 95 L50 95 Z" fill="#a0522d" />
        <rect x="30" y="80" width="40" height="15" fill="#f0e68c" />
        <rect x="30" y="80" width="20" height="15" className="book-page" fill="#fff" />
        {/* Lamp */}
        <line x1="120" y1="95" x2="120" y2="60" stroke="#666" strokeWidth="2" />
        <path d="M110 60 Q120 50 130 60 Z" fill="#888" />
        <polygon points="105,60 135,60 145,80 95,80" fill="#ffcc00" className="light-beam" fillOpacity="0.5" />
        <circle cx="120" cy="55" r="3" fill="#ffeb3b" />
    </svg>
);


// Animation for the Dashboard
const DashboardAnimation = () => (
    <svg viewBox="0 0 200 100" className="w-48 h-24">
         <style>{`
            .stair { animation: rise 2s ease-out forwards; opacity: 0; }
            @keyframes rise { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .flag { animation: wave 1.5s linear infinite; }
            @keyframes wave { 0%, 100% { transform: skewX(0); } 50% { transform: skewX(-10deg); } }
        `}</style>
        <rect x="20" y="80" width="40" height="15" fill="#a0aec0" className="stair" style={{ animationDelay: '0s' }} />
        <rect x="60" y="65" width="40" height="15" fill="#a0aec0" className="stair" style={{ animationDelay: '0.3s' }} />
        <rect x="100" y="50" width="40" height="15" fill="#a0aec0" className="stair" style={{ animationDelay: '0.6s' }} />
        <rect x="140" y="35" width="40" height="15" fill="#a0aec0" className="stair" style={{ animationDelay: '0.9s' }} />
        {/* Flag */}
        <line x1="180" y1="35" x2="180" y2="15" stroke="#718096" strokeWidth="2" className="stair" style={{ animationDelay: '1.2s' }} />
        <polygon points="180,15 160,20 180,25" fill="#4299e1" className="flag stair" style={{ animationDelay: '1.2s' }}/>
    </svg>
);

// Animation for Skills
const SkillsAnimation = () => (
    <svg viewBox="0 0 200 100" className="w-48 h-24">
        <style>{`
            .orbit { animation: orbit 6s linear infinite; transform-origin: 100px 55px; }
            @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .brain-pulse { animation: pulse 2s ease-in-out infinite; }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        `}</style>
        {/* Brain */}
        <g transform="translate(85 35)" className="brain-pulse" style={{transformOrigin: '15px 20px'}}>
             <path d="M15 0 C0 0, 0 20, 15 20 C30 20, 30 0, 15 0 M15 5 C10 5, 10 15, 15 15 C20 15, 20 5, 15 5" fill="#f687b3" />
        </g>
        {/* Orbiting Skills */}
        <g className="orbit" style={{ animationDelay: '0s' }}>
            <text x="140" y="60" fontSize="16" fill="#63b3ed">💡</text>
        </g>
         <g className="orbit" style={{ animationDelay: '-2s' }}>
            <text x="140" y="60" fontSize="16" fill="#a78bfa">⭐</text>
        </g>
         <g className="orbit" style={{ animationDelay: '-4s' }}>
            <text x="140" y="60" fontSize="16" fill="#f6ad55">🏆</text>
        </g>
    </svg>
);

// Animation for Timeline
const TimelineAnimation = () => (
    <svg viewBox="0 0 200 100" className="w-48 h-24">
         <style>{`
            .timeline-path { stroke-dasharray: 300; stroke-dashoffset: 300; animation: draw 4s ease-out forwards; }
            @keyframes draw { to { stroke-dashoffset: 0; } }
            .timeline-dot { animation: move 4s ease-out forwards; offset-path: path('M10 80 C 40 20, 160 20, 190 80'); }
            @keyframes move {
                0% { motion-offset: 0%; }
                100% { motion-offset: 100%; }
            }
        `}</style>
        <path id="timelinePath" d="M10 80 C 40 20, 160 20, 190 80" stroke="#cbd5e0" strokeWidth="2" fill="none" className="timeline-path" />
        <circle r="5" fill="#4299e1" className="timeline-dot" />
    </svg>
);

// Animation for Subjects
const SubjectsAnimation = () => (
    <svg viewBox="0 0 200 100" className="w-48 h-24">
        <style>{`
            .book-stack-book { animation: stack 2s ease-out forwards; opacity: 0; transform: translateX(-20px); }
            @keyframes stack { to { opacity: 1; transform: translateX(0); } }
            .glow { animation: glow 2.5s ease-in-out infinite alternate; }
            @keyframes glow { from { filter: drop-shadow(0 0 2px #f6e05e); } to { filter: drop-shadow(0 0 8px #f6e05e); } }
        `}</style>
        <g transform="translate(60 20)">
            <rect x="0" y="50" width="80" height="15" fill="#a0522d" className="book-stack-book" style={{ animationDelay: '0s' }} />
            <rect x="5" y="35" width="70" height="15" fill="#38a169" className="book-stack-book" style={{ animationDelay: '0.3s' }} />
            <rect x="10" y="20" width="60" height="15" fill="#3182ce" className="book-stack-book" style={{ animationDelay: '0.6s' }} />
            <text x="30" y="15" fontSize="18" className="glow book-stack-book" style={{ animationDelay: '0.9s' }}>⭐</text>
        </g>
    </svg>
);


interface AnimatedHeaderProps {
    page: 'home' | 'dashboard' | 'skills' | 'timeline' | 'subjects';
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ page }) => {
    
    const renderAnimation = () => {
        switch(page) {
            case 'home': return <HomeAnimation />;
            case 'dashboard': return <DashboardAnimation />;
            case 'skills': return <SkillsAnimation />;
            case 'timeline': return <TimelineAnimation />;
            case 'subjects': return <SubjectsAnimation />;
            default: return null;
        }
    }

    return (
        <div className="flex justify-center md:justify-end">
            {renderAnimation()}
        </div>
    );
};

export default AnimatedHeader;
