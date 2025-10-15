
// src/components/screens/QuizScreen.jsx

import React from 'react';
import { useVibe } from '../../context/VibeContext';
import { useTranslation } from 'react-i18next';

const QuizScreen = () => {
    const { t } = useTranslation();
    const { currentStep, quizAnswers, answerQuiz } = useVibe();

    const quizQuestions = {
        1: { question: t('question1'), answers: { q1: [t('occasionCasual'), t('occasionWork'), t('occasionParty')] } },
        2: { question: t('question2'), answers: { q2: [t('categoryNecklace'), t('categoryRing'), t('categoryEarring'), t('categoryBracelet')] } },
        3: { question: t('question3'), answers: { q3: [t('styleClassic'), t('styleModern'), t('styleRelaxed')] } },
        4: { question: t('question4'), answers: { q4: [t('metalGold'), t('metalSilver'), t('metalMixed')] } },
    };

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
                    {t('quizTitle')}
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
                <span id="quizProgress">{t('stepCounter', { current: currentStep, total: totalQuizSteps })}</span>
            </div>
        </div>
    );
};

export default QuizScreen;
