import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { questions as premadeQuestions } from '../questions';

const socket = io('http://localhost:3001');

const Host = () => {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(Array(8).fill({ text: '', points: '', revealed: false }));
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [strikes, setStrikes] = useState(0);

  useEffect(() => {
    socket.on('gameState', (gameState) => {
      setQuestion(gameState.question);
      setAnswers(gameState.answers);
      setTeamAScore(gameState.teamAScore);
      setTeamBScore(gameState.teamBScore);
      setStrikes(gameState.strikes);
    });

    return () => {
      socket.off('gameState');
    };
  }, []);

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const updateGameState = () => {
    socket.emit('updateGameState', { question, answers, teamAScore, teamBScore, strikes });
  };

  const revealAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[index].revealed = true;
    setAnswers(newAnswers);
    socket.emit('updateGameState', { question, answers: newAnswers, teamAScore, teamBScore, strikes });
  };
  
  const hideAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[index].revealed = false;
    setAnswers(newAnswers);
    socket.emit('updateGameState', { question, answers: newAnswers, teamAScore, teamBScore, strikes });
  };

  const handleStrike = () => {
    const newStrikes = strikes < 3 ? strikes + 1 : 3;
    setStrikes(newStrikes);
    socket.emit('updateGameState', { question, answers, teamAScore, teamBScore, strikes: newStrikes });
  };
  
  const handleResetStrikes = () => {
    setStrikes(0);
    socket.emit('updateGameState', { question, answers, teamAScore, teamBScore, strikes: 0 });
  }

  const handleScoreUpdate = (team, amount) => {
    if (team === 'A') {
      const newTeamAScore = teamAScore + amount;
      setTeamAScore(newTeamAScore);
      socket.emit('updateGameState', { question, answers, teamAScore: newTeamAScore, teamBScore, strikes });
    } else {
      const newTeamBScore = teamBScore + amount;
      setTeamBScore(newTeamBScore);
      socket.emit('updateGameState', { question, answers, teamAScore, teamBScore: newTeamBScore, strikes });
    }
  };

  const resetGame = () => {
    const initialAnswers = Array(8).fill({ text: '', points: '', revealed: false });
    setQuestion('');
    setAnswers(initialAnswers);
    setTeamAScore(0);
    setTeamBScore(0);
    setStrikes(0);
    socket.emit('updateGameState', {
        question: '',
        answers: initialAnswers,
        teamAScore: 0,
        teamBScore: 0,
        strikes: 0,
    });
  }

  const loadPremadeQuestion = (e) => {
    const questionIndex = e.target.value;
    if (questionIndex === "") {
      setQuestion('');
      setAnswers(Array(8).fill({ text: '', points: '', revealed: false }));
      return;
    }

    const selectedQuestion = premadeQuestions[questionIndex];
    const paddedAnswers = [...selectedQuestion.answers];
    while (paddedAnswers.length < 8) {
      paddedAnswers.push({ text: '', points: '', revealed: false });
    }

    setQuestion(selectedQuestion.question);
    setAnswers(paddedAnswers);
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Host Panel</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Load Premade Question</label>
        <select onChange={loadPremadeQuestion} className="w-full p-2 bg-gray-800 rounded">
          <option value="">Select a question...</option>
          {premadeQuestions.map((q, index) => (
            <option key={index} value={index}>{q.question}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        />
      </div>
      <div className="mb-4">
        <h2 className="text-xl mb-2">Answers</h2>
        {answers.map((answer, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              placeholder={`Answer ${index + 1}`}
              value={answer.text}
              onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
              className="w-1/2 p-2 bg-gray-800 rounded mr-2"
            />
            <input
              type="number"
              placeholder="Points"
              value={answer.points}
              onChange={(e) => handleAnswerChange(index, 'points', parseInt(e.target.value) || 0)}
              className="w-1/4 p-2 bg-gray-800 rounded mr-2"
            />
            <button onClick={() => revealAnswer(index)} className="p-2 bg-green-500 rounded mr-2">Reveal</button>
            <button onClick={() => hideAnswer(index)} className="p-2 bg-yellow-500 rounded">Hide</button>
          </div>
        ))}
      </div>
      <button onClick={updateGameState} className="p-2 bg-blue-500 rounded mb-4">Set Question & Answers</button>
      
      <div className="flex items-center mb-4">
        <h2 className="text-xl mr-4">Strikes: {strikes}</h2>
        <button onClick={handleStrike} className="p-2 bg-red-500 rounded mr-2">Add Strike</button>
        <button onClick={handleResetStrikes} className="p-2 bg-gray-500 rounded">Reset Strikes</button>
      </div>

      <div className="flex justify-around">
        <div>
          <h2 className="text-xl">Team A: {teamAScore}</h2>
          <button onClick={() => handleScoreUpdate('A', 10)} className="p-2 bg-blue-500 rounded mt-2">+10</button>
        </div>
        <div>
          <h2 className="text-xl">Team B: {teamBScore}</h2>
          <button onClick={() => handleScoreUpdate('B', 10)} className="p-2 bg-blue-500 rounded mt-2">+10</button>
        </div>
      </div>
      
      <button onClick={resetGame} className="p-2 bg-red-700 rounded mt-8">Reset Game</button>
    </div>
  );
};

export default Host;
