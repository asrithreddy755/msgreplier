
"use client";

import { useEffect, useState } from 'react';
import { LoveRoomMember } from '@/types/love-space';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Heart, Trophy, PenTool, CheckCircle, Loader2, XCircle, Wand2 } from 'lucide-react';
import presetQuestions from '@/data/love-questions.json';

interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

interface LoveQuiz {
    id: string;
    room_id: string;
    creator_id: string;
    taker_id?: string;
    title: string;
    questions: QuizQuestion[];
    score: number | null;
    status: 'pending' | 'completed';
    created_at: string;
    taker_answers?: number[];
}

interface LoveQuizProps {
    roomId: string;
    currentMember: LoveRoomMember;
    members: LoveRoomMember[];
}

export function LoveQuiz({ roomId, currentMember, members }: LoveQuizProps) {
    const [quizzes, setQuizzes] = useState<LoveQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'dashboard' | 'create' | 'take' | 'details'>('dashboard');
    const [currentQuiz, setCurrentQuiz] = useState<LoveQuiz | null>(null);

    // Quiz Creation State
    const [newQuizTitle, setNewQuizTitle] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { id: '1', text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);

    // Quiz Taking State
    const [answers, setAnswers] = useState<number[]>([]);

    const otherMember = members.find(m => m.id !== currentMember.id);
    const partnerName = otherMember ? otherMember.nickname : 'your partner';

    useEffect(() => {
        fetchQuizzes();
    }, [roomId]);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch(`/api/love-space/quiz?roomId=${roomId}`);
            const data = await res.json();
            if (data.quizzes) setQuizzes(data.quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now().toString(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]);
    };

    const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handlePresets = () => {
        if (!presetQuestions || presetQuestions.length === 0) {
            toast.error("The preset questions list is empty.");
            return;
        }
        const shuffled = [...presetQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map((q, idx) => ({
            id: Date.now().toString() + idx,
            text: q.text,
            options: q.options,
            correctAnswer: (q as any).correctOptionIndex || 0
        }));
        setQuestions(selected);
        toast.success("Loaded 5 random questions!");
    };

    const handleSinglePreset = (index: number) => {
        if (!presetQuestions || presetQuestions.length === 0) return;

        const currentTexts = questions.map(q => q.text);
        const available = presetQuestions.filter(p => !currentTexts.includes(p.text));

        if (available.length === 0) {
            toast.error("You are already using all available preset questions!");
            return;
        }

        const randomPreset = available[Math.floor(Math.random() * available.length)];
        const updated = [...questions];
        updated[index] = {
            ...updated[index],
            text: randomPreset.text,
            options: randomPreset.options,
            correctAnswer: (randomPreset as any).correctOptionIndex || 0
        };
        setQuestions(updated);
    };

    const handleCreateQuiz = async () => {
        if (!newQuizTitle.trim()) {
            toast.error('Please enter a quiz title');
            return;
        }
        if (questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
            toast.error('Please fill in all questions and options');
            return;
        }

        try {
            const res = await fetch('/api/love-space/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    quizData: {
                        room_id: roomId,
                        creator_id: currentMember.id,
                        title: newQuizTitle,
                        questions,
                        status: 'pending'
                    }
                })
            });

            if (res.ok) {
                toast.success('Quiz created successfully!');
                setView('dashboard');
                fetchQuizzes();
                // Reset form
                setNewQuizTitle('');
                setQuestions([{ id: '1', text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
            } else {
                toast.error('Failed to create quiz');
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
            toast.error('Something went wrong');
        }
    };

    const handleTakeQuiz = (quiz: LoveQuiz) => {
        setCurrentQuiz(quiz);
        setAnswers(new Array(quiz.questions.length).fill(-1));
        setView('take');
    };

    const handleSubmitQuiz = async () => {
        if (!currentQuiz) return;
        if (answers.some(a => a === -1)) {
            toast.error('Please answer all questions');
            return;
        }

        try {
            const res = await fetch('/api/love-space/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit',
                    quizId: currentQuiz.id,
                    answers,
                    takerId: currentMember.id
                })
            });

            if (res.ok) {
                toast.success('Quiz submitted!');
                setView('dashboard');
                fetchQuizzes();
            } else {
                toast.error('Failed to submit quiz');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Something went wrong');
        }
    };

    const myQuiz = quizzes.find(q => q.creator_id === currentMember.id);
    const partnerQuiz = quizzes.find(q => q.creator_id !== currentMember.id);

    // Calculate Final Love Score
    const finalScore = (myQuiz?.score !== undefined && myQuiz.score !== null && partnerQuiz?.score !== undefined && partnerQuiz.score !== null)
        ? Math.round((myQuiz.score + partnerQuiz.score) / 2)
        : null;

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-500" /></div>;

    if (view === 'create') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-pink-100 dark:border-pink-900/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-pink-600 dark:text-pink-400">Create Quiz for {partnerName}</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePresets} className="text-pink-600 border-pink-200 hover:bg-pink-50">
                            <Wand2 className="w-4 h-4 mr-2" />
                            Presets
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>Cancel</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Quiz Title</Label>
                        <Input
                            value={newQuizTitle}
                            onChange={(e) => setNewQuizTitle(e.target.value)}
                            placeholder="e.g., How well do you know me?"
                            className="mt-1"
                        />
                    </div>

                    {questions.map((q, qIndex) => (
                        <Card key={q.id} className="p-4 border-pink-100 dark:border-pink-900/30 relative flex flex-col pt-10">
                            <button
                                type="button"
                                onClick={() => handleSinglePreset(qIndex)}
                                className="absolute top-2 right-2 text-pink-500 hover:text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/40 p-2 rounded-full transition-colors shadow-sm"
                                title="Random Preset"
                            >
                                <Wand2 className="w-4 h-4" />
                            </button>
                            <div className="space-y-3">
                                <div>
                                    <Label>Question {qIndex + 1}</Label>
                                    <Input
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                        placeholder="Type your question..."
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <Input
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                className="w-4 h-4 text-pink-600 focus:ring-pink-500 cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 italic">* Select the radio button next to the correct answer</p>
                            </div>
                        </Card>
                    ))}

                    <Button variant="outline" onClick={handleAddQuestion} className="w-full border-dashed border-pink-300 text-pink-500 hover:bg-pink-50">
                        + Add Another Question
                    </Button>

                    <Button onClick={handleCreateQuiz} className="w-full bg-pink-500 hover:bg-pink-600 text-white mt-4">
                        Save Quiz
                    </Button>
                </div>
            </div>
        );
    }

    if (view === 'take' && currentQuiz) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-pink-100 dark:border-pink-900/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-pink-600 dark:text-pink-400">{currentQuiz.title}</h2>
                    <Button variant="ghost" onClick={() => setView('dashboard')}>Cancel</Button>
                </div>

                <div className="space-y-6">
                    {currentQuiz.questions.map((q, qIndex) => (
                        <Card key={qIndex} className="p-4 border-pink-100 dark:border-pink-900/30">
                            <h3 className="font-semibold text-lg mb-3">{q.text}</h3>
                            <RadioGroup value={answers[qIndex]?.toString()} onValueChange={(val) => {
                                const newAnswers = [...answers];
                                newAnswers[qIndex] = parseInt(val);
                                setAnswers(newAnswers);
                            }}>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={oIndex.toString()}
                                            id={`q${qIndex}-opt${oIndex}`}
                                            className="border-slate-300 dark:border-slate-600 text-pink-500 w-5 h-5 focus:ring-pink-500"
                                        />
                                        <Label
                                            htmlFor={`q${qIndex}-opt${oIndex}`}
                                            className="cursor-pointer flex-1 bg-slate-50 hover:bg-pink-50 dark:bg-slate-950 dark:hover:bg-slate-800/80 border dark:border-slate-800 p-4 rounded-lg transition-colors text-base"
                                        >
                                            {opt}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </Card>
                    ))}

                    <Button onClick={handleSubmitQuiz} className="w-full bg-pink-500 hover:bg-pink-600 text-white mt-4">
                        Submit Answers
                    </Button>
                </div>
            </div>
        );
    }

    if (view === 'details' && currentQuiz) {
        const isMyQuiz = currentQuiz.creator_id === currentMember.id;
        const takerName = isMyQuiz ? partnerName : 'You';

        return (
            <div className="space-y-6 w-full max-w-2xl mx-auto pb-8">
                <div className="flex justify-between items-center mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-pink-100 dark:border-pink-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-pink-600 dark:text-pink-400">Quiz Results: {currentQuiz.title}</h2>
                        <p className="text-sm text-gray-500">Taken by {takerName}</p>
                    </div>
                    <Button variant="ghost" onClick={() => setView('dashboard')}>Back</Button>
                </div>

                <div className="space-y-6">
                    {currentQuiz.questions.map((q, qIndex) => {
                        const correctIndex = q.correctAnswer ?? (q as any).correctOptionIndex;
                        const takerAnswerIndex = Array.isArray(currentQuiz.taker_answers)
                            ? currentQuiz.taker_answers[qIndex]
                            : (currentQuiz.taker_answers as any)?.[q.id];

                        const isCorrect = takerAnswerIndex === correctIndex;

                        return (
                            <Card key={qIndex} className="border-2 border-pink-100 dark:border-pink-900/50 shadow-md bg-white dark:bg-slate-900">
                                <CardHeader className="pb-4 bg-pink-50/50 dark:bg-pink-900/10 border-b dark:border-pink-900/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-pink-500 tracking-wider uppercase drop-shadow-sm">Question {qIndex + 1} of {currentQuiz.questions.length}</span>
                                        {isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-rose-500" />
                                        )}
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl leading-relaxed text-slate-800 dark:text-slate-100 mt-2">{q.text}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5 space-y-2">
                                    {q.options.map((option, optIndex) => {
                                        const isThisCorrect = optIndex === correctIndex;
                                        const isThisUser = optIndex === takerAnswerIndex;
                                        const isWrongUser = isThisUser && !isThisCorrect;

                                        const baseClass = "flex items-center justify-between rounded-lg border px-3 py-2 text-sm sm:text-base";
                                        const statusClass = isThisCorrect
                                            ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                            : isWrongUser
                                                ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                                                : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950";

                                        return (
                                            <div key={optIndex} className={`${baseClass} ${statusClass}`}>
                                                <span>{option}</span>
                                                {isThisCorrect ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : isWrongUser ? (
                                                    <XCircle className="w-4 h-4" />
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                    <div className="pt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                        {takerName}'s answer: <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {takerAnswerIndex !== undefined && takerAnswerIndex !== null && q.options[takerAnswerIndex] ? q.options[takerAnswerIndex] : "No Answer"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            {/* Main Score Dashboard */}
            <Card className="border-none shadow-md bg-gradient-to-br from-pink-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Heart className="w-32 h-32 text-pink-500" />
                </div>
                <CardHeader className="pb-2 text-center relative z-10">
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <Heart className="w-6 h-6 text-pink-500 fill-pink-500" /> Love Score
                    </CardTitle>
                    <CardDescription>How well do you know each other?</CardDescription>
                </CardHeader>
                <CardContent className="text-center relative z-10 pb-8">
                    {finalScore !== null ? (
                        <div className="animate-in zoom-in duration-500 bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-inner border border-pink-100 dark:border-pink-900/30">
                            <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full w-fit mb-4">
                                <Trophy className="w-12 h-12 text-amber-500 fill-amber-500/20" />
                            </div>
                            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-red-600 drop-shadow-sm">
                                {finalScore}%
                            </span>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-4">
                                {finalScore === 100 ? "Perfect Soulmates! 💘" : finalScore >= 80 ? "It's True Love! ❤️" : finalScore >= 50 ? "Getting There! 💕" : "We Need To Talk... 💔"}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Combined Match Rate</p>
                        </div>
                    ) : (
                        <div className="py-4">
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                                {myQuiz && partnerQuiz ? "Waiting for results..." : "Complete both quizzes to reveal your score!"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Quiz Status */}
                <Card className="border-pink-100 dark:border-pink-900/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-purple-500" />
                            Your Quiz for {partnerName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myQuiz ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`font-semibold px-2 py-0.5 rounded-full ${myQuiz.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {myQuiz.status === 'completed' ? 'Completed' : 'Pending Partner'}
                                    </span>
                                </div>
                                {myQuiz.status === 'completed' && (
                                    <>
                                        <div className="flex justify-between items-center text-sm mt-2">
                                            <span className="text-gray-500">{partnerName}'s Score:</span>
                                            <span className="font-bold text-lg text-pink-600">{myQuiz.score}%</span>
                                        </div>
                                        <div className="mt-4">
                                            <Button variant="outline" onClick={() => { setCurrentQuiz(myQuiz); setView('details'); }} className="w-full text-pink-600 border-pink-200 hover:bg-pink-50">
                                                View Answers
                                            </Button>
                                        </div>
                                    </>
                                )}
                                {myQuiz.status === 'pending' && (
                                    <p className="text-xs text-gray-400 italic mt-2">Waiting for {partnerName} to take it...</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 mb-4">Create a quiz to test {partnerName}'s knowledge about you!</p>
                                <Button onClick={() => setView('create')} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                                    Create Quiz
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Partner's Quiz Status */}
                <Card className="border-pink-100 dark:border-pink-900/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-orange-500" />
                            {partnerName}'s Quiz for You
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {partnerQuiz ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`font-semibold px-2 py-0.5 rounded-full ${partnerQuiz.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {partnerQuiz.status === 'completed' ? 'Completed' : 'Ready to Take'}
                                    </span>
                                </div>
                                {partnerQuiz.status === 'completed' ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm mt-2">
                                            <span className="text-gray-500">Your Score:</span>
                                            <span className="font-bold text-lg text-pink-600">{partnerQuiz.score}%</span>
                                        </div>
                                        <div className="mt-4">
                                            <Button variant="outline" onClick={() => { setCurrentQuiz(partnerQuiz); setView('details'); }} className="w-full text-pink-600 border-pink-200 hover:bg-pink-50">
                                                View Your Answers
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-4">
                                        <Button onClick={() => handleTakeQuiz(partnerQuiz)} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                            Take Quiz Now
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-gray-400 italic">
                                    {partnerName} hasn't created a quiz for you yet.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
