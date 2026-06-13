"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSubjectHealth = calculateSubjectHealth;
exports.getSubjectRecommendation = getSubjectRecommendation;
function calculateSubjectHealth(attrs) {
    return Math.round((attrs.understanding + attrs.retention + attrs.problemSolving + attrs.confidence) / 4);
}
function getSubjectRecommendation(subjectName, attrs) {
    const lowestVal = Math.min(attrs.understanding, attrs.retention, attrs.problemSolving, attrs.confidence);
    if (lowestVal === attrs.understanding) {
        return {
            skill: "Understanding",
            method: "Feynman Technique",
            description: `Explain the core concepts of "${subjectName}" in simple terms to identify comprehension gaps.`
        };
    }
    else if (lowestVal === attrs.retention) {
        return {
            skill: "Retention",
            method: "Spaced Repetition & Flashcards",
            description: `Create flashcards for key definitions in "${subjectName}" and review them daily.`
        };
    }
    else if (lowestVal === attrs.problemSolving) {
        return {
            skill: "Problem Solving",
            method: "First Principles Deconstruction",
            description: `Break down complex "${subjectName}" problems into fundamental building blocks.`
        };
    }
    else {
        return {
            skill: "Confidence",
            method: "Timed Self-Testing",
            description: `Complete small 20-minute practice tests in "${subjectName}" under strict timing.`
        };
    }
}
