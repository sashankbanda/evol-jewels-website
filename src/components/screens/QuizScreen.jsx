// src/components/screens/QuizScreen.jsx

import React from 'react';
import { useVibe } from '../../context/VibeContext';

const quizQuestions = {
    1: { question: "Q1. What's the occasion today?", answers: { q1: ['Casual Day Out', 'Professional Setting', 'Evening / Party'] } },
    2: { question: "Q2. What are you shopping for today?", answers: { q2: ['Necklace', 'Ring', 'Earring', 'Bracelet'] } },
    3: { question: "Q3. Pick the outfit style that feels most you.", answers: { q3: ['Classic (Elegant, Timeless)', 'Modern (Bold, Structured)', 'Relaxed (Casual, Layered)'] } },
    4: { question: "Q4. Which type of metal finish do you prefer?", answers: { q4: ['Polished Gold', 'Matte Silver', 'Mixed Metals'] } },
};

const QuizScreen = () => {
    const { currentStep, quizAnswers, answerQuiz } = useVibe();
    const totalQuizSteps = 4;
    const stepKey = `q${currentStep}`;
    const currentQ = quizQuestions[currentStep];
    
    // Fallback if currentStep is somehow out of bounds
    if (!currentQ) return null; 

    const handleAnswerClick = (answer) => {
        answerQuiz(stepKey, answer);
    };

    return (
        <div id="quizScreen" className="screen flex-col flex">
            <div className="w-full max-w-2xl mx-auto">
                <h2 id="quizTitle" className="text-4xl md:text-5xl font-serif font-semibold text-text-light mb-10 text-center">
                    Let's find your perfect style...
                </h2>

                <div id="quizContainer" className="w-full">
                    <div className="quiz-step">
                        <p className="text-xl md:text-3xl font-sans font-semibold mb-6 text-center text-accent-platinum">
                            {currentQ.question}
                        </p>
                        <div className="space-y-4 md:space-y-6">
                            {Object.values(currentQ.answers)[0].map((answer) => (
                                <button
                                    key={answer}
                                    data-answer={answer}
                                    onClick={() => handleAnswerClick(answer)}
                                    className={`quiz-option w-full py-4 rounded-xl text-xl md:text-2xl font-sans 
                                        ${quizAnswers[stepKey] === answer ? 'selected' : ''}`}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 text-lg text-B1B1B1 font-sans">
                <span id="quizProgress">Step {currentStep} of {totalQuizSteps}</span>
            </div>
        </div>
    );
};

export default QuizScreen;