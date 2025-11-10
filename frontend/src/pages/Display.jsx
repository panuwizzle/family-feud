import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3001');

const Display = () => {
  const [gameState, setGameState] = useState({
    question: '',
    answers: Array(8).fill({ text: '', points: '', revealed: false }),
    teamAScore: 0,
    teamBScore: 0,
    strikes: 0,
  });

  const prevGameStateRef = useRef(gameState);

  useEffect(() => {
    socket.on('gameState', (newGameState) => {
      setGameState(newGameState);
    });

    return () => {
      socket.off('gameState');
    };
  }, []);

  useEffect(() => {
    const prevGameState = prevGameStateRef.current;

    // Check if a new answer was revealed
    const newlyRevealed = gameState.answers.find(
      (answer, index) => answer.revealed && !prevGameState.answers[index]?.revealed
    );

    if (newlyRevealed) {
      const goodAnswerSound = new Audio('/sounds/good-answer.mp3');
      goodAnswerSound.play().catch(e => console.error("Error playing sound:", e));
    }

    // Check if a strike was added
    if (gameState.strikes > prevGameState.strikes) {
      const strikeSound = new Audio('/sounds/strike.mp3');
      strikeSound.play().catch(e => console.error("Error playing sound:", e));
    }

    // Update the ref for the next comparison
    prevGameStateRef.current = gameState;
  }, [gameState]);


  return (
    <div className="h-screen bg-blue-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-8 text-center">{gameState.question}</h1>
      
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4 mb-8">
        {gameState.answers.map((answer, index) => (
          <AnimatePresence key={index}>
            {answer.text && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-blue-800 p-4 rounded-lg flex justify-between items-center text-2xl"
              >
                {answer.revealed ? (
                  <>
                    <span>{answer.text}</span>
                    <span>{answer.points}</span>
                  </>
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <div className="flex justify-around w-full max-w-4xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Team A</h2>
          <p className="text-6xl">{gameState.teamAScore}</p>
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-bold">Strikes</h2>
          <div className="flex justify-center mt-4">
            {[...Array(3)].map((_, i) => (
              <AnimatePresence key={i}>
                {i < gameState.strikes && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-16 h-16 bg-red-500 rounded-full mx-2 flex items-center justify-center text-4xl font-bold"
                  >
                    X
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-bold">Team B</h2>
          <p className="text-6xl">{gameState.teamBScore}</p>
        </div>
      </div>
    </div>
  );
};

export default Display;