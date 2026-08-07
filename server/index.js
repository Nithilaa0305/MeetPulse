import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const sessionStates = {}; // Map of sessionId -> { currentSlide, currentDocumentName }

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a specific meeting session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session: ${sessionId}`);
    
    // If there is an active presentation state, sync the joining user immediately
    if (sessionStates[sessionId]) {
      socket.emit('slide-changed', sessionStates[sessionId]);
      
      if (sessionStates[sessionId].transcriptionStatus) {
        socket.emit('transcription-status-changed', { status: sessionStates[sessionId].transcriptionStatus });
      }
      if (sessionStates[sessionId].transcript && sessionStates[sessionId].transcript.length > 0) {
        socket.emit('initial-transcripts', { transcript: sessionStates[sessionId].transcript });
      }
    }
  });

  // Slide & Material events
  socket.on('slide-change', (data) => {
    // data: { sessionId, currentSlide, currentDocumentName }
    if (!sessionStates[data.sessionId]) {
      sessionStates[data.sessionId] = { transcript: [], transcriptionStatus: 'idle' };
    }
    sessionStates[data.sessionId].currentSlide = data.currentSlide;
    sessionStates[data.sessionId].currentDocumentName = data.currentDocumentName;
    socket.to(data.sessionId).emit('slide-changed', data);
  });
  
  socket.on('materials-update', (data) => {
    // data: { sessionId, materials }
    socket.to(data.sessionId).emit('materials-updated', data);
  });

  // Transcription events
  socket.on('transcription-status', (data) => {
    // data: { sessionId, status }
    if (!sessionStates[data.sessionId]) {
      sessionStates[data.sessionId] = { transcript: [], transcriptionStatus: 'idle' };
    }
    sessionStates[data.sessionId].transcriptionStatus = data.status;
    socket.to(data.sessionId).emit('transcription-status-changed', data);
  });

  socket.on('transcript-segment', (data) => {
    // data: { sessionId, segment }
    if (!sessionStates[data.sessionId]) {
      sessionStates[data.sessionId] = { transcript: [], transcriptionStatus: 'idle' };
    }
    sessionStates[data.sessionId].transcript.push(data.segment);
    socket.to(data.sessionId).emit('transcript-segment-added', data);
  });

  socket.on('clear-transcripts', (data) => {
    // data: { sessionId }
    if (sessionStates[data.sessionId]) {
      sessionStates[data.sessionId].transcript = [];
    }
    socket.to(data.sessionId).emit('transcripts-cleared');
  });

  // Poll events
  socket.on('launch-poll', (data) => {
    // data: { sessionId, question, options }
    socket.to(data.sessionId).emit('poll-launched', data);
  });
  
  socket.on('submit-poll-vote', (data) => {
    // data: { sessionId, optionIndex }
    socket.to(data.sessionId).emit('poll-vote-received', data);
  });

  socket.on('close-poll', (data) => {
    // data: { sessionId }
    socket.to(data.sessionId).emit('poll-closed');
  });

  // Pulse Check events
  socket.on('pulse-check', (data) => {
    socket.to(data.sessionId).emit('pulse-requested', data);
  });

  socket.on('submit-pulse', (data) => {
    socket.to(data.sessionId).emit('pulse-updated', data);
  });

  // Quiz events
  socket.on('launch-quiz', (data) => {
    socket.to(data.sessionId).emit('quiz-launched', data);
  });

  socket.on('submit-quiz-answer', (data) => {
    socket.to(data.sessionId).emit('quiz-answer-received', data);
  });

  // Alert events
  socket.on('student-alert', (data) => {
    socket.to(data.sessionId).emit('student-alert-received', data);
  });

  // Q&A events
  socket.on('ask-question', (data) => {
    // data: { sessionId, question }
    socket.to(data.sessionId).emit('new-question', data);
  });

  socket.on('mark-question-answered', (data) => {
    // data: { sessionId, questionId }
    socket.to(data.sessionId).emit('question-answered', data);
  });

  socket.on('question-feedback', (data) => {
    // data: { sessionId, questionId, satisfaction }
    socket.to(data.sessionId).emit('question-feedback-received', data);
  });

  socket.on('question-rating', (data) => {
    // data: { sessionId, questionId, rating }
    socket.to(data.sessionId).emit('question-rating-received', data);
  });

  // Reactions (Pulse) events
  socket.on('send-reaction', (data) => {
    // data: { sessionId, reactionType } // e.g. 'confused', 'thumbsup'
    socket.to(data.sessionId).emit('reaction-received', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
