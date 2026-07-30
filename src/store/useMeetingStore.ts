import { create } from 'zustand';
import { LiveQuestion, LivePoll, TranscriptSegment } from '../app/types';

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

  // Actions
  setLiveSessionId: (id: string | null) => void;
  setCurrentSlide: (slide: number) => void;
  setTimer: (timer: number | ((prev: number) => number)) => void;
  setIsRecording: (isRecording: boolean) => void;
  setAudienceCount: (count: number) => void;
  
  askQuestion: (text: string, anon: boolean, author: string) => void;
  triggerReaction: (emoji: string) => void;
  addConfusionAlert: (alert: string) => void;
  addActivity: (activity: { time: string; text: string }) => void;

  setTranscriptionStatus: (status: 'idle' | 'listening' | 'transcribing' | 'completed') => void;
  addTranscriptSegment: (segment: Omit<TranscriptSegment, 'id'>) => void;
  clearTranscripts: () => void;
  setActiveDocumentName: (name: string | null) => void;
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

  setLiveSessionId: (id) => set({ liveSessionId: id }),
  setCurrentSlide: (slide) => set({ currentSlide: slide }),
  setTimer: (timer) => set((state) => ({ 
    timer: typeof timer === 'function' ? timer(state.timer) : timer 
  })),
  setIsRecording: (isRecording) => set({ isRecording }),
  setAudienceCount: (count) => set({ audienceCount: count }),

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
  clearTranscripts: () => set({ transcript: [] }),
  setActiveDocumentName: (name) => set({ activeDocumentName: name })
}));
