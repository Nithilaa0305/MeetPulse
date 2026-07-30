import { jsPDF } from "jspdf";
import { TranscriptSegment } from "../types";
import { StudyNote } from "./llmService";

const PRIMARY_COLOR = [79, 70, 229]; // Indigo-600 #4f46e5
const TEXT_DARK = [31, 41, 55];    // Slate-800
const TEXT_MUTED = [107, 114, 128]; // Slate-500
const ACCENT_COLOR = [225, 29, 72]; // Rose-600 #e11d48 (for Homework)
const BG_LIGHT = [249, 250, 251];   // Slate-50

interface CommonPDFProps {
  meetingName: string;
  courseName: string;
  meetingId: string;
  date: string;
}

function initializePDF(props: CommonPDFProps, subtitle: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let yPos = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);

  const checkPageOverflow = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text(`${subtitle}: ${props.meetingName}`, margin, 10);
      doc.line(margin, 12, pageWidth - margin, 12);
      yPos = 20;
    }
  };

  // Background header band
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(props.meetingName.toUpperCase(), margin, 18);

  // Metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Course: ${props.courseName}  |  Meeting ID: ${props.meetingId}  |  Date: ${props.date}`, margin, 26);
  doc.text(`Generated automatically by MeetPulse AI Intelligence Engine`, margin, 32);

  yPos = 55;

  return { doc, yPos, margin, contentWidth, checkPageOverflow, advanceY: (amt: number) => { yPos += amt; return yPos; } };
}

function renderHomeworkSection(
  doc: jsPDF, 
  transcript: TranscriptSegment[], 
  margin: number, 
  contentWidth: number, 
  yPos: number, 
  checkPageOverflow: (neededHeight: number) => void,
  advanceY: (amt: number) => number
) {
  const homeworkKeywords = [/\bhomework\b/i, /\bassign(ed|ment|ments)?\b/i, /\btodo\b/i, /\bdue\b/i, /\bsubmit\b/i, /\bread\b/i, /\bexercise\b/i, /\btask(s)?\b/i];
  const spokenHomework = transcript.filter(seg => homeworkKeywords.some(pattern => pattern.test(seg.text)));
  const homeworkItems: string[] = [];

  if (spokenHomework.length > 0) {
    const uniqueHomeworkText = Array.from(new Set(spokenHomework.map(seg => seg.text.trim())));
    uniqueHomeworkText.forEach(text => homeworkItems.push(text));
  } else {
    homeworkItems.push("No specific homework or assignments were verbalized during this session.");
  }

  checkPageOverflow((homeworkItems.length * 15) + 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
  doc.text("Assigned Homework & Tasks", margin, yPos);
  yPos = advanceY(6);

  let totalBoxTextHeight = 0;
  const splitItems = homeworkItems.map(item => {
    const split = doc.splitTextToSize(`•  ${item}`, contentWidth - 10);
    totalBoxTextHeight += (split.length * 4.5);
    return split;
  });

  const boxHeight = totalBoxTextHeight + 8;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, contentWidth, boxHeight, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  let boxY = yPos + 6;
  splitItems.forEach((splitItem) => {
    doc.text(splitItem, margin + 5, boxY);
    boxY += (splitItem.length * 4.5);
  });
  
  advanceY(boxHeight + 10);
}

function cleanAndReconstructSpeech(transcript: TranscriptSegment[]): string[] {
  if (transcript.length === 0) return [];
  
  const rawText = transcript.map(t => t.text.trim()).join(" ");
  const rawSentences = rawText.split(/\.\s+/);
  const cleanSentences: string[] = [];
  
  const conjunctions = new Set([
    "and", "but", "or", "nor", "for", "yet", "so", 
    "from", "into", "at", "to", "with", "by", "of", "on", "in", "about", 
    "that", "which", "who", "whom", "whose", "then", "turning"
  ]);

  rawSentences.forEach((sentence) => {
    let trimmed = sentence.trim();
    if (!trimmed) return;
    
    trimmed = trimmed
      .replace(/\bthat\s+that\b/gi, "that")
      .replace(/\bthe\s+the\b/gi, "the")
      .replace(/\bin\s+our\s+in\s+our\b/gi, "in our")
      .replace(/^ok\s*,\s*so\s+now\s+let's\b/gi, "let's")
      .replace(/^so\s+let's\s+start\s+with\b/gi, "starting with")
      .replace(/^so\s+let's\b/gi, "let's")
      .replace(/^so\s+really\b/gi, "really")
      .replace(/^so\b/gi, "")
      .trim();

    if (!trimmed) return;

    const words = trimmed.split(/\s+/);
    const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, "");
    
    const isFirstWordConjunction = conjunctions.has(firstWord);
    const isVeryShort = words.length <= 2;
    const startsWithLowercase = trimmed[0] && trimmed[0] === trimmed[0].toLowerCase() && trimmed[0] !== trimmed[0].toUpperCase();

    if (cleanSentences.length > 0 && (isFirstWordConjunction || isVeryShort || startsWithLowercase)) {
      let prev = cleanSentences[cleanSentences.length - 1];
      if (prev.endsWith(".")) {
        prev = prev.slice(0, -1);
      }
      const currentText = trimmed[0].toLowerCase() + trimmed.slice(1);
      cleanSentences[cleanSentences.length - 1] = `${prev} ${currentText}.`;
    } else {
      const capitalized = trimmed[0].toUpperCase() + trimmed.slice(1);
      const dotted = capitalized.endsWith(".") ? capitalized : `${capitalized}.`;
      cleanSentences.push(dotted);
    }
  });

  return cleanSentences;
}

// 1. generateTranscriptPDF
export function generateTranscriptPDF(props: CommonPDFProps & { transcript: TranscriptSegment[] }) {
  const { doc, margin, contentWidth, checkPageOverflow } = initializePDF(props, "Transcript & Tasks");
  let currentY = 55;
  const advanceY = (amt: number) => { currentY += amt; return currentY; };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("1. Clean Transcript", margin, currentY);
  advanceY(8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  if (props.transcript.length === 0) {
    doc.text("No transcript data recorded.", margin, currentY);
    advanceY(10);
  } else {
    const cleanSentences = cleanAndReconstructSpeech(props.transcript);
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    
    cleanSentences.forEach((sentence, idx) => {
      currentParagraph.push(sentence);
      if (currentParagraph.length === 4 || idx === cleanSentences.length - 1) {
        paragraphs.push(currentParagraph.join(" "));
        currentParagraph = [];
      }
    });

    paragraphs.forEach((para) => {
      const splitPara = doc.splitTextToSize(para, contentWidth);
      checkPageOverflow((splitPara.length * 5) + 6);
      doc.text(splitPara, margin, currentY);
      advanceY((splitPara.length * 5) + 6);
    });
  }

  advanceY(10);
  renderHomeworkSection(doc, props.transcript, margin, contentWidth, currentY, checkPageOverflow, advanceY);

  doc.save(`Transcript_${props.meetingId}.pdf`);
}

// 2. generateAISummaryPDF
export function generateAISummaryPDF(props: CommonPDFProps & { summaryParagraphs: string[], transcript: TranscriptSegment[] }) {
  const { doc, margin, contentWidth, checkPageOverflow } = initializePDF(props, "AI Lecture Summary");
  let currentY = 55;
  const advanceY = (amt: number) => { currentY += amt; return currentY; };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("AI Generated Lecture Summary", margin, currentY);
  advanceY(8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  props.summaryParagraphs.forEach((para) => {
    const splitPara = doc.splitTextToSize(para, contentWidth);
    checkPageOverflow((splitPara.length * 5) + 6);
    doc.text(splitPara, margin, currentY);
    advanceY((splitPara.length * 5) + 6);
  });

  advanceY(10);
  renderHomeworkSection(doc, props.transcript, margin, contentWidth, currentY, checkPageOverflow, advanceY);

  doc.save(`AISummary_${props.meetingId}.pdf`);
}

// 3. generateAIStudyNotesPDF
export function generateAIStudyNotesPDF(props: CommonPDFProps & { studyNotes: StudyNote[] }) {
  const { doc, margin, contentWidth, checkPageOverflow } = initializePDF(props, "Comprehensive Study Notes");
  let currentY = 55;
  const advanceY = (amt: number) => { currentY += amt; return currentY; };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("Core Concepts & Study Guide", margin, currentY);
  advanceY(8);

  if (props.studyNotes.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No study notes were generated.", margin, currentY);
  }

  props.studyNotes.forEach(note => {
    checkPageOverflow(30);
    
    // Sub-title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.text(note.title, margin, currentY);
    advanceY(5);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitDesc = doc.splitTextToSize(note.desc, contentWidth);
    doc.text(splitDesc, margin, currentY);
    advanceY((splitDesc.length * 5) + 2);

    // Bullets if any
    if (note.bullets && note.bullets.length > 0) {
      note.bullets.forEach(bullet => {
        const splitBullet = doc.splitTextToSize(`• ${bullet}`, contentWidth - 5);
        doc.text(splitBullet, margin + 5, currentY);
        advanceY((splitBullet.length * 5) + 1);
      });
      advanceY(2);
    }

    // Example if any
    if (note.example) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      const splitEx = doc.splitTextToSize(`Example: ${note.example}`, contentWidth - 5);
      doc.text(splitEx, margin + 5, currentY);
      advanceY((splitEx.length * 5) + 2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    }
    
    advanceY(4);
  });

  doc.save(`AIStudyNotes_${props.meetingId}.pdf`);
}
