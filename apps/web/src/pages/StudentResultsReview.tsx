import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Award, Search, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface QuestionReview {
  order: number;
  questionId: string;
  questionText: string;
  options: string;
  submittedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean | null;
  points: number;
  explanation: string;
}

interface StudentQuiz {
  isCompleted: boolean;
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string | null;
  questions: QuestionReview[];
}

interface StudentProgress {
  missionId: string;
  order: number;
  title: string;
  status: string;
  completedAt: string | null;
}

interface StudentResult {
  id: string;
  username: string;
  name: string | null;
  classification: string | null;
  rollNumber: number | null;
  role: string;
  team: string;
  level: number;
  xp: number;
  huntScore: number;
  missionsCompleted: number;
  progress: StudentProgress[];
  plantedBugsCount: number;
  claimedBugsCount: number;
  quiz: StudentQuiz | null;
}

const StudentResultsReview = () => {
  const { user } = useOutletContext<{ user?: { role?: string } }>();
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [filterTeam, setFilterTeam] = useState<'ALL' | 'PRINCES' | 'PRINCESSES'>('ALL');
  const [filterRole, setFilterRole] = useState<'ALL' | 'PLAYER' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/admin/student-results', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        setError('Administrator access required.');
        return;
      }

      const data = await res.json();
      setStudents(data);
      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (err) {
      setError('Connection error fetching student results.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0510]">
        <div className="text-red-500 font-mono tracking-widest bg-black p-8 border border-red-500/50">
          Administrator access required.
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(s => {
    const matchesRole = filterRole === 'ALL' || s.role === filterRole;
    const matchesTeam = filterTeam === 'ALL' || s.team === filterTeam;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      s.username.toLowerCase().includes(query) ||
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.classification && s.classification.toLowerCase().includes(query)) ||
      (s.rollNumber !== null && s.rollNumber.toString().includes(query)) ||
      s.team.toLowerCase().includes(query);
    return matchesRole && matchesTeam && matchesSearch;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId) || filteredStudents[0] || null;

  const toggleQuestionExpand = (order: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [order]: !prev[order]
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 p-6 max-w-[1920px] mx-auto z-10 relative animate-slide-in font-mono text-white overflow-hidden">
      {/* HEADER */}
      <header className="glass-panel shrink-0 p-4 border-t-2 border-t-neon-blue flex justify-between items-center bg-[#0a0510] mb-4">
        <div className="flex items-center gap-4">
          <Users className="text-neon-blue glow-text-blue" size={24} />
          <div>
            <h1 className="text-2xl font-title tracking-widest uppercase">
              STUDENT RESULTS & ANSWER REVIEW
            </h1>
            <p className="text-neon-blue text-[10px] mt-0.5 tracking-widest uppercase">
              Live Seminar Evaluation Monitor // 51 Participants
            </p>
          </div>
        </div>

        {/* SUMMARY BADGES */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
            <span className="text-white/50 mr-2">TOTAL:</span>
            <span className="font-bold text-neon-blue">{students.length}</span>
          </div>
          <div className="px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-sm">
            <span className="text-neon-green mr-2">STUDENTS:</span>
            <span className="font-bold text-neon-green">{students.filter(s => s.role === 'PLAYER').length}</span>
          </div>
          <div className="px-3 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded-sm">
            <span className="text-neon-purple mr-2">ADMINS:</span>
            <span className="font-bold text-neon-purple">{students.filter(s => s.role === 'ADMIN').length}</span>
          </div>
          <button
            onClick={fetchResults}
            className="px-4 py-1.5 cyber-button text-xs border-neon-blue text-neon-blue hover:bg-neon-blue/20"
          >
            REFRESH DATA
          </button>
        </div>
      </header>

      {error ? (
        <div className="p-8 text-center text-red-500 font-mono bg-black/60 border border-red-500/30">
          {error}
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-neon-blue font-mono">
          LOADING SEMINAR RESULTS...
        </div>
      ) : (
        <div className="flex gap-6 flex-1 min-h-0">
          {/* LEFT COLUMN: Student Directory */}
          <div className="w-1/3 flex flex-col glass-panel bg-black/70 border border-white/10 min-h-0">
            {/* Search and Filters */}
            <div className="p-3 border-b border-white/10 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH ROLL / ID / NAME / TEAM..."
                  className="w-full bg-black/60 border border-white/10 pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-neon-blue"
                />
              </div>
              {/* Team Filter */}
              <div className="flex gap-2 text-[10px]">
                {(['ALL', 'PRINCES', 'PRINCESSES'] as const).map(team => (
                  <button
                    key={team}
                    onClick={() => setFilterTeam(team)}
                    className={`flex-1 py-1 border transition-all ${
                      filterTeam === team
                        ? 'border-neon-blue bg-neon-blue/20 text-white font-bold'
                        : 'border-white/10 text-white/50 hover:bg-white/5'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>

              {/* Role Filter */}
              <div className="flex gap-2 text-[10px]">
                {(['ALL', 'PLAYER', 'ADMIN'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setFilterRole(role)}
                    className={`flex-1 py-1 border transition-all ${
                      filterRole === role
                        ? 'border-neon-purple bg-neon-purple/20 text-white font-bold'
                        : 'border-white/10 text-white/50 hover:bg-white/5'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40">No participants found.</div>
              ) : (
                filteredStudents.map(student => {
                  const isSelected = selectedStudent?.id === student.id;
                  const quizCompleted = student.quiz?.isCompleted;

                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`p-2.5 border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-neon-blue bg-neon-blue/15 text-white shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-white/5 bg-black/40 text-white/70 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 text-center font-bold text-neon-amber">
                          {student.rollNumber ? `#${student.rollNumber.toString().padStart(2, '0')}` : '--'}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold tracking-wider">{student.name || student.username}</span>
                            {student.classification === 'PRINCE' && (
                              <span className="px-1 py-0.2 text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm">
                                PRINCE
                              </span>
                            )}
                            {student.classification === 'PRINCESS' && (
                              <span className="px-1 py-0.2 text-[8px] bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-sm">
                                PRINCESS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40">{student.username} // {student.team}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {student.role === 'ADMIN' ? (
                          <span className="px-2 py-0.5 text-[9px] bg-neon-purple/20 text-neon-purple border border-neon-purple/40 font-bold">
                            ADMIN
                          </span>
                        ) : (
                          <span className="text-[10px] text-neon-blue">
                            {student.missionsCompleted}/7 M
                          </span>
                        )}

                        {quizCompleted ? (
                          <span className="px-1.5 py-0.5 text-[9px] bg-neon-green/20 text-neon-green border border-neon-green/40">
                            {Math.round(student.quiz!.percentage)}%
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/30">QUIZ --</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Participant Detail & Quiz Review */}
          <div className="w-2/3 flex flex-col glass-panel bg-black/70 border border-white/10 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {!selectedStudent ? (
              <div className="text-center text-white/40 p-12">Select a participant to inspect results.</div>
            ) : (
              <>
                {/* PARTICIPANT OVERVIEW HEADER */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-sm flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-wider text-white">
                        {selectedStudent.name || selectedStudent.username}
                      </h2>
                      {selectedStudent.classification === 'PRINCE' && (
                        <span className="px-2.5 py-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold">
                          PRINCE
                        </span>
                      )}
                      {selectedStudent.classification === 'PRINCESS' && (
                        <span className="px-2.5 py-1 text-xs bg-pink-500/20 text-pink-300 border border-pink-500/50 font-bold">
                          PRINCESS
                        </span>
                      )}
                      {selectedStudent.role === 'ADMIN' ? (
                        <span className="px-2.5 py-1 text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/50 font-bold">
                          ADMIN ORGANIZER
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs bg-neon-blue/20 text-neon-blue border border-neon-blue/50">
                          STUDENT PARTICIPANT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      Roll No: <span className="text-neon-amber font-bold">{selectedStudent.rollNumber ? `#${selectedStudent.rollNumber.toString().padStart(2, '0')}` : 'N/A'}</span>
                      {' '}| Login ID: <span className="text-neon-blue font-mono">{selectedStudent.username}</span>
                      {' '}| Team: <span className="text-white">{selectedStudent.team}</span>
                      {' '}| Level: <span className="text-neon-green">{selectedStudent.level}</span> ({selectedStudent.xp} XP)
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-white/40 uppercase">Hunt Points</div>
                    <div className="text-2xl font-bold text-neon-amber">{selectedStudent.huntScore}</div>
                  </div>
                </div>

                {/* MISSION PROGRESS CARDS */}
                <div>
                  <h3 className="text-xs font-title text-neon-blue tracking-widest uppercase mb-3 flex items-center gap-2">
                    <Award size={14} /> MISSION PROGRESS (7 SYSTEMS)
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {selectedStudent.progress.map(p => {
                      const isComplete = p.status === 'COMPLETE';
                      const isActive = p.status === 'ACTIVE';

                      return (
                        <div
                          key={p.missionId}
                          className={`p-2.5 border text-center font-mono ${
                            isComplete
                              ? 'border-neon-blue/50 bg-neon-blue/10 text-white'
                              : isActive
                              ? 'border-neon-green/50 bg-neon-green/10 text-neon-green'
                              : 'border-white/5 bg-black/40 text-white/30'
                          }`}
                        >
                          <div className="text-[10px] text-white/50">M0{p.order}</div>
                          <div className="text-[11px] font-bold truncate mt-0.5">{p.title}</div>
                          <div className="text-[9px] mt-1 tracking-widest uppercase">
                            {isComplete ? 'ONLINE' : isActive ? 'ACTIVE' : 'LOCKED'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* QUIZ ANSWERS & EVALUATION SECTION */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-title text-neon-green tracking-widest uppercase flex items-center gap-2">
                      <HelpCircle size={14} /> OFFICIAL QUIZ EVALUATION
                    </h3>
                    {selectedStudent.quiz && (
                      <div className="text-xs">
                        <span className="text-white/50 mr-2">SCORE:</span>
                        <span className="font-bold text-neon-amber text-sm mr-4">{selectedStudent.quiz.score} PTS</span>
                        <span className="text-white/50 mr-2">ACCURACY:</span>
                        <span className="font-bold text-neon-green text-sm">
                          {selectedStudent.quiz.correctAnswers}/{selectedStudent.quiz.totalQuestions} ({Math.round(selectedStudent.quiz.percentage)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {!selectedStudent.quiz ? (
                    <div className="p-8 text-center text-xs text-white/40 bg-black/40 border border-white/5">
                      No quiz attempt recorded for this participant yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 border border-white/10 text-xs flex justify-between">
                        <div>Status: <span className="text-neon-green font-bold">{selectedStudent.quiz.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}</span></div>
                        <div>Completed At: <span className="text-white/70">{selectedStudent.quiz.completedAt ? new Date(selectedStudent.quiz.completedAt).toLocaleString() : 'N/A'}</span></div>
                      </div>

                      {/* Question by question breakdown */}
                      <div className="space-y-2">
                        {selectedStudent.quiz.questions.map(q => {
                          const isExpanded = !!expandedQuestions[q.order];
                          let parsedOptions: string[] = [];
                          try {
                            parsedOptions = JSON.parse(q.options);
                          } catch (e) {
                            parsedOptions = [];
                          }

                          return (
                            <div
                              key={q.questionId}
                              className={`border transition-all ${
                                q.isCorrect
                                  ? 'border-neon-green/30 bg-neon-green/5'
                                  : 'border-neon-red/30 bg-neon-red/5'
                              }`}
                            >
                              <div
                                onClick={() => toggleQuestionExpand(q.order)}
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                              >
                                <div className="flex items-center gap-3 pr-4 flex-1">
                                  {q.isCorrect ? (
                                    <CheckCircle size={16} className="text-neon-green shrink-0" />
                                  ) : (
                                    <XCircle size={16} className="text-neon-red shrink-0" />
                                  )}
                                  <div className="text-xs font-mono text-white/90">
                                    <span className="text-white/40 mr-2">Q{q.order.toString().padStart(2, '0')}.</span>
                                    {q.questionText}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 text-xs">
                                  <div className="text-[11px]">
                                    {q.isCorrect ? (
                                      <span className="text-neon-green font-bold">CORRECT (+{q.points} pts)</span>
                                    ) : (
                                      <span className="text-neon-red font-bold">INCORRECT (0 pts)</span>
                                    )}
                                  </div>
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                              </div>

                              {/* Expanded details */}
                              {isExpanded && (
                                <div className="p-4 pt-0 border-t border-white/5 space-y-3 text-xs">
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div className="p-2.5 bg-black/50 border border-white/10">
                                      <div className="text-[10px] text-white/40 uppercase mb-1">Submitted Answer:</div>
                                      <div className={`font-bold ${q.isCorrect ? 'text-neon-green' : 'text-neon-red'}`}>
                                        {q.submittedAnswer || '[ No Answer Submitted ]'}
                                      </div>
                                    </div>
                                    <div className="p-2.5 bg-black/50 border border-white/10">
                                      <div className="text-[10px] text-white/40 uppercase mb-1">Correct Answer:</div>
                                      <div className="font-bold text-neon-green">{q.correctAnswer}</div>
                                    </div>
                                  </div>

                                  {/* Options review */}
                                  {parsedOptions.length > 0 && (
                                    <div>
                                      <div className="text-[10px] text-white/40 uppercase mb-1.5">Options:</div>
                                      <div className="space-y-1">
                                        {parsedOptions.map((opt, i) => (
                                          <div
                                            key={i}
                                            className={`px-3 py-1.5 text-[11px] border ${
                                              opt === q.correctAnswer
                                                ? 'border-neon-green/50 bg-neon-green/10 text-neon-green'
                                                : opt === q.submittedAnswer
                                                ? 'border-neon-red/50 bg-neon-red/10 text-neon-red'
                                                : 'border-white/5 bg-black/30 text-white/50'
                                            }`}
                                          >
                                            {opt}
                                            {opt === q.correctAnswer && '  ✓ [CORRECT KEY]'}
                                            {opt === q.submittedAnswer && opt !== q.correctAnswer && '  ✗ [STUDENT PICK]'}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Explanation */}
                                  {q.explanation && (
                                    <div className="p-2.5 bg-white/5 border-l-2 border-neon-blue text-[11px] text-white/80">
                                      <span className="text-neon-blue font-bold mr-1">EXPLANATION:</span>
                                      {q.explanation}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultsReview;
