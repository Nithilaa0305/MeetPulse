import { create } from 'zustand';
import { LiveQuestion, LivePoll, TranscriptSegment, QuizQuestion } from '../app/types';

interface MeetingState {
  liveSessionId: string | null;
  currentSlide: number;
  timer: number;
  isRecording: boolean;
  audienceCount: number;
  pulseScore: number;
  speakingPace: number;
  
  liveQuestions: LiveQuestion[];
  liveReactions: { id: number; emoji: string }[];
  livePoll: LivePoll | null;
  confusionAlerts: string[];
  activityFeed: { time: string; text: string }[];
  transcript: TranscriptSegment[];
  transcriptionStatus: 'idle' | 'listening' | 'transcribing' | 'completed';
  activeDocumentName: string | null;
  activeQuiz: QuizQuestion[];
  quizStats: Record<string, { correct: number; incorrect: number; question: string }>;
  activeAlerts: { id: string; type: string; studentName: string; timestamp: Date }[];

  // Actions
  setLiveSessionId: (id: string | null) => void;
  setCurrentSlide: (slide: number) => void;
  setTimer: (timer: number | ((prev: number) => number)) => void;
  setIsRecording: (isRecording: boolean) => void;
  setAudienceCount: (count: number) => void;
  
  setLivePoll: (poll: LivePoll | null) => void;
  updatePollVotes: (optionIndex: number) => void;
  setPulseScore: (score: number) => void;
  setActiveQuiz: (quiz: QuizQuestion[]) => void;
  addQuizAnswer: (questionId: string, question: string, isCorrect: boolean) => void;
  
  askQuestion: (text: string, anon: boolean, author: string) => void;
  setLiveQuestions: (questions: LiveQuestion[]) => void;
  triggerReaction: (emoji: string) => void;
  addConfusionAlert: (alert: string) => void;
  addActivity: (activity: { time: string; text: string }) => void;

  setTranscriptionStatus: (status: 'idle' | 'listening' | 'transcribing' | 'completed') => void;
  addTranscriptSegment: (segment: Omit<TranscriptSegment, 'id'>) => void;
  updateTranscriptionStatus: (status: 'idle' | 'listening' | 'transcribing' | 'completed') => void;
  setActiveDocumentName: (name: string | null) => void;
  clearTranscripts: () => void;
  
  addAlert: (alert: Omit<{ id: string; type: string; studentName: string; timestamp: Date }, 'id' | 'timestamp'>) => void;
  removeAlert: (id: string) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  liveSessionId: null,
  currentSlide: 0,
  timer: 0,
  isRecording: false,
  audienceCount: 0,
  pulseScore: 84,
  speakingPace: 118,
  
  liveQuestions: [],
  liveReactions: [],
  livePoll: null,
  confusionAlerts: [],
  activityFeed: [],
  transcript: [],
  transcriptionStatus: 'idle',
  activeDocumentName: null,
  activeQuiz: [],
  quizStats: {},
  activeAlerts: [],

  setLiveSessionId: (id) => set({ liveSessionId: id }),
  setCurrentSlide: (slide) => set({ currentSlide: slide }),
  setTimer: (timer) => set((state) => ({ 
    timer: typeof timer === 'function' ? timer(state.timer) : timer 
  })),
  setIsRecording: (isRecording) => set({ isRecording }),
  setAudienceCount: (count) => set({ audienceCount: count }),

  setLivePoll: (poll) => set({ livePoll: poll }),
  updatePollVotes: (optionIndex) => set((state) => {
    if (!state.livePoll) return state;
    const newVotes = [...state.livePoll.votes];
    newVotes[optionIndex]++;
    return { livePoll: { ...state.livePoll, votes: newVotes } };
  }),
  setPulseScore: (score) => set({ pulseScore: score }),
  setActiveQuiz: (quiz) => set({ activeQuiz: quiz }),
  addQuizAnswer: (questionId, question, isCorrect) => set((state) => {
    const current = state.quizStats[questionId] || { correct: 0, incorrect: 0, question };
    return {
      quizStats: {
        ...state.quizStats,
        [questionId]: {
          ...current,
          correct: current.correct + (isCorrect ? 1 : 0),
          incorrect: current.incorrect + (isCorrect ? 0 : 1)
        }
      }
    };
  }),

  askQuestion: (text, isAnonymous, author) => set((state) => ({
    liveQuestions: [
      {
        id: `q-${Date.now()}`,
        text,
        slide: state.currentSlide + 1,
        votes: 1,
        isAnonymous,
        author: isAnonymous ? "Anonymous" : author,
        isAnswered: false
      },
      ...state.liveQuestions
    ]
  })),

  setLiveQuestions: (questions) => set({ liveQuestions: questions }),
  
  triggerReaction: (emoji) => set((state) => {
    const id = Date.now();
    return {
      liveReactions: [...state.liveReactions, { id, emoji }]
    };
  }),

  addConfusionAlert: (alert) => set((state) => ({
    confusionAlerts: [...state.confusionAlerts, alert]
  })),

  addActivity: (activity) => set((state) => ({
    activityFeed: [activity, ...state.activityFeed]
  })),

  setTranscriptionStatus: (status) => set({ transcriptionStatus: status }),
  addTranscriptSegment: (segment) => set((state) => ({
    transcript: [...state.transcript, { ...segment, id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]
  })),
  updateTranscriptionStatus: (status) => set({ transcriptionStatus: status }),
  setActiveDocumentName: (name) => set({ activeDocumentName: name }),
  clearTranscripts: () => set({ transcript: [] }),

  addAlert: (alertData) => set((state) => ({
    activeAlerts: [...state.activeAlerts, { ...alertData, id: Math.random().toString(36).substring(7), timestamp: new Date() }]
  })),
  removeAlert: (id) => set((state) => ({
    activeAlerts: state.activeAlerts.filter(a => a.id !== id)
  })),
}));
