import React, { useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../lib/socket';
import { useMeetingStore } from '../store/useMeetingStore';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';

export const useSocketSync = () => {
  const { 
    liveSessionId, 
    setCurrentSlide, 
    setActiveDocumentName,
    askQuestion,
    triggerReaction,
    setLivePoll,
    updatePollVotes,
    setPulseScore,
    setActiveQuiz,
    pulseScore,
    addQuizAnswer
  } = useMeetingStore();
  
  const { user, role } = useAuthStore();

  useEffect(() => {
    if (!liveSessionId) {
      disconnectSocket();
      return;
    }

    // Connect to server when a session is active
    connectSocket();
    socket.emit('join-session', liveSessionId);

    // Only participants need to strictly follow the presenter's slide changes
    if (role === 'participant') {
      const handleSlideChanged = (data: any) => {
        if (data.currentDocumentName) {
          setActiveDocumentName(data.currentDocumentName);
        }
        if (data.currentSlide !== undefined) {
          setCurrentSlide(data.currentSlide);
        }
      };
      
      const handleMaterialsUpdated = (data: any) => {
        useDataStore.getState().setSessions((prev: any[]) => prev.map(s => {
          if (s.id === liveSessionId) {
            return { ...s, materials: data.materials };
          }
          return s;
        }));
      };

      const handleTranscriptionStatusChanged = (data: any) => {
        useMeetingStore.getState().setTranscriptionStatus(data.status);
      };

      const handleTranscriptSegmentAdded = (data: any) => {
        const currentTranscript = useMeetingStore.getState().transcript;
        // Avoid duplicates using text match or ID check
        if (!currentTranscript.some((t: any) => t.text === data.segment.text)) {
          useMeetingStore.getState().addTranscriptSegment({
            text: data.segment.text,
            speaker: data.segment.speaker,
            slide: data.segment.slide,
            timestamp: data.segment.timestamp || new Date().toISOString(),
            confidence: data.segment.confidence || 1.0
          });
        }
      };

      const handleTranscriptsCleared = () => {
        useMeetingStore.getState().clearTranscripts();
      };

      const handleInitialTranscripts = (data: any) => {
        useMeetingStore.getState().clearTranscripts();
        data.transcript.forEach((t: any) => {
          useMeetingStore.getState().addTranscriptSegment({
            text: t.text,
            speaker: t.speaker,
            slide: t.slide,
            timestamp: t.timestamp || new Date().toISOString(),
            confidence: t.confidence || 1.0
          });
        });
      };

      const handlePollLaunched = (data: any) => {
        setLivePoll({
          question: data.question,
          options: data.options,
          votes: new Array(data.options.length).fill(0),
          isActive: true
        });
      };

      const handlePollClosed = () => {
        setLivePoll(null);
      };

      const handleQuizLaunched = (data: any) => {
        setActiveQuiz(data.questions);
      };

      const handlePulseRequested = () => {
        // Just trigger a window event or state that the participant dash can listen to
        window.dispatchEvent(new CustomEvent('pulse-check-requested'));
      };

      const handleQuestionAnswered = (data: any) => {
        useMeetingStore.getState().markQuestionAnswered(data.questionId);
      };

      const handleNewQuestion = (data: any) => {
        const store = useMeetingStore.getState();
        if (!store.liveQuestions.find(q => q.id === data.id)) {
          store.askQuestion(data.question, data.isAnonymous, data.author, data.id);
        }
      };

      const handleQuestionFeedbackReceived = (data: any) => {
        useMeetingStore.getState().updateQuestionSatisfaction(data.questionId, data.satisfaction);
      };

      const handleQuestionRatingReceived = (data: any) => {
        useMeetingStore.getState().updateQuestionRating(data.questionId, data.rating);
      };

      socket.on('new-question', handleNewQuestion);
      socket.on('slide-changed', handleSlideChanged);
      socket.on('materials-updated', handleMaterialsUpdated);
      socket.on('transcription-status-changed', handleTranscriptionStatusChanged);
      socket.on('transcript-segment-added', handleTranscriptSegmentAdded);
      socket.on('transcripts-cleared', handleTranscriptsCleared);
      socket.on('initial-transcripts', handleInitialTranscripts);
      socket.on('poll-launched', handlePollLaunched);
      socket.on('poll-closed', handlePollClosed);
      socket.on('quiz-launched', handleQuizLaunched);
      socket.on('pulse-requested', handlePulseRequested);
      socket.on('question-answered', handleQuestionAnswered);
      socket.on('question-feedback-received', handleQuestionFeedbackReceived);
      socket.on('question-rating-received', handleQuestionRatingReceived);
      
      return () => {
        socket.off('new-question', handleNewQuestion);
        socket.off('slide-changed', handleSlideChanged);
        socket.off('materials-updated', handleMaterialsUpdated);
        socket.off('transcription-status-changed', handleTranscriptionStatusChanged);
        socket.off('transcript-segment-added', handleTranscriptSegmentAdded);
        socket.off('transcripts-cleared', handleTranscriptsCleared);
        socket.off('initial-transcripts', handleInitialTranscripts);
        socket.off('poll-launched', handlePollLaunched);
        socket.off('poll-closed', handlePollClosed);
        socket.off('quiz-launched', handleQuizLaunched);
        socket.off('pulse-requested', handlePulseRequested);
        socket.off('question-answered', handleQuestionAnswered);
        socket.off('question-feedback-received', handleQuestionFeedbackReceived);
        socket.off('question-rating-received', handleQuestionRatingReceived);
      };
    }

    // Presenters listen for incoming audience actions
    if (role === 'presenter' || role === 'admin') {
      const handleNewQuestion = (data: any) => {
        // data: { id, question, isAnonymous, author }
        const store = useMeetingStore.getState();
        if (!store.liveQuestions.find(q => q.id === data.id)) {
          store.askQuestion(data.question, data.isAnonymous, data.author, data.id);
        }
      };

      const handleReaction = (data: any) => {
        // data: { reactionType }
        triggerReaction(data.reactionType);
      };

      const handlePollVoteReceived = (data: any) => {
        updatePollVotes(data.optionIndex);
      };

      const handleQuestionFeedbackReceived = (data: any) => {
        useMeetingStore.getState().updateQuestionSatisfaction(data.questionId, data.satisfaction);
      };

      const handleQuestionRatingReceived = (data: any) => {
        useMeetingStore.getState().updateQuestionRating(data.questionId, data.rating);
      };

      const handlePulseUpdated = (data: any) => {
        // Adjust the pulse score slightly up or down based on the feedback
        // 1 = Yes (good), 0 = Kind of (neutral), -1 = No (bad)
        const currentScore = useMeetingStore.getState().pulseScore;
        let change = 0;
        if (data.pulseValue === 1) change = 2;
        else if (data.pulseValue === 0) change = -1;
        else if (data.pulseValue === -1) change = -5;
        
        const newScore = Math.max(0, Math.min(100, currentScore + change));
        setPulseScore(newScore);
      };

      const handleQuizAnswer = (data: any) => {
        addQuizAnswer(data.questionId, data.questionText, data.isCorrect);
      };

      const handleStudentAlert = (data: any) => {
        useMeetingStore.getState().addAlert({
          type: data.type,
          studentName: data.studentName
        });
      };

      const handleQuestionAnswered = (data: any) => {
        useMeetingStore.getState().markQuestionAnswered(data.questionId);
      };

      socket.on('new-question', handleNewQuestion);
      socket.on('reaction-received', handleReaction);
      socket.on('poll-vote-received', handlePollVoteReceived);
      socket.on('pulse-updated', handlePulseUpdated);
      socket.on('quiz-answer-received', handleQuizAnswer);
      socket.on('student-alert-received', handleStudentAlert);
      socket.on('question-answered', handleQuestionAnswered);
      socket.on('question-feedback-received', handleQuestionFeedbackReceived);
      socket.on('question-rating-received', handleQuestionRatingReceived);

      return () => {
        socket.off('new-question', handleNewQuestion);
        socket.off('reaction-received', handleReaction);
        socket.off('poll-vote-received', handlePollVoteReceived);
        socket.off('pulse-updated', handlePulseUpdated);
        socket.off('quiz-answer-received', handleQuizAnswer);
        socket.off('student-alert-received', handleStudentAlert);
        socket.off('question-answered', handleQuestionAnswered);
        socket.off('question-feedback-received', handleQuestionFeedbackReceived);
        socket.off('question-rating-received', handleQuestionRatingReceived);
      };
    }
  }, [liveSessionId, role, setCurrentSlide, setActiveDocumentName, askQuestion, triggerReaction]);

  // Auto-emit slide changes for presenters
  const currentSlide = useMeetingStore(s => s.currentSlide);
  const activeDocumentName = useMeetingStore(s => s.activeDocumentName);
  
  useEffect(() => {
    if (liveSessionId && role === 'presenter') {
      socket.emit('slide-change', {
        sessionId: liveSessionId,
        currentSlide: currentSlide,
        currentDocumentName: activeDocumentName
      });
    }
  }, [liveSessionId, role, currentSlide, activeDocumentName]);

  // Auto-emit transcription status for presenters
  const transcriptionStatus = useMeetingStore(s => s.transcriptionStatus);
  useEffect(() => {
    if (liveSessionId && role === 'presenter') {
      socket.emit('transcription-status', {
        sessionId: liveSessionId,
        status: transcriptionStatus
      });
    }
  }, [liveSessionId, role, transcriptionStatus]);

  // Auto-emit transcription segments for presenters
  const transcript = useMeetingStore(s => s.transcript);
  const lastTranscriptLength = React.useRef(0);
  useEffect(() => {
    if (liveSessionId && role === 'presenter') {
      if (transcript.length > lastTranscriptLength.current) {
        const newSegments = transcript.slice(lastTranscriptLength.current);
        newSegments.forEach(seg => {
          socket.emit('transcript-segment', {
            sessionId: liveSessionId,
            segment: seg
          });
        });
        lastTranscriptLength.current = transcript.length;
      } else if (transcript.length === 0 && lastTranscriptLength.current > 0) {
        socket.emit('clear-transcripts', {
          sessionId: liveSessionId
        });
        lastTranscriptLength.current = 0;
      }
    }
  }, [liveSessionId, role, transcript]);

  // Helper to emit events easily
  const emitSlideChange = (slideIndex: number, docName: string | null) => {
    if (liveSessionId && role === 'presenter') {
      socket.emit('slide-change', {
        sessionId: liveSessionId,
        currentSlide: slideIndex,
        currentDocumentName: docName
      });
    }
  };

  // Auto-emit reactions for participants
  const liveReactions = useMeetingStore(s => s.liveReactions);
  const lastReactionId = React.useRef<number | null>(null);
  
  useEffect(() => {
    if (liveSessionId && role === 'participant' && liveReactions.length > 0) {
      const latestReaction = liveReactions[liveReactions.length - 1];
      if (latestReaction.id !== lastReactionId.current) {
        lastReactionId.current = latestReaction.id;
        socket.emit('send-reaction', {
          sessionId: liveSessionId,
          reactionType: latestReaction.emoji
        });
      }
    }
  }, [liveReactions, liveSessionId, role]);

  // Auto-emit questions for participants
  const liveQuestions = useMeetingStore(s => s.liveQuestions);
  const lastQuestionId = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (liveSessionId && role === 'participant' && liveQuestions.length > 0) {
      const latestQuestion = liveQuestions[0]; // Questions are unshifted (prepended)
      if (latestQuestion.id !== lastQuestionId.current) {
        lastQuestionId.current = latestQuestion.id;
        socket.emit('ask-question', {
          sessionId: liveSessionId,
          id: latestQuestion.id,
          question: latestQuestion.text,
          isAnonymous: latestQuestion.isAnonymous,
          author: latestQuestion.author
        });
      }
    }
  }, [liveQuestions, liveSessionId, role]);

  return {};
};
