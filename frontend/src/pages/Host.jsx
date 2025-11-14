import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { questions as premadeQuestions } from "../questions";

const socket = io("http://localhost:3001");

const Host = () => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(
    Array(8).fill({ text: "", points: "", revealed: false })
  );
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [activeTeam, setActiveTeam] = useState(null);
  const [roundScore, setRoundScore] = useState({ A: 0, B: 0 });

  useEffect(() => {
    socket.on("gameState", (gameState) => {
      setQuestion(gameState.question);
      setAnswers(gameState.answers);
      setTeamAScore(gameState.teamAScore);
      setTeamBScore(gameState.teamBScore);
      setStrikes(gameState.strikes);
      setActiveTeam(gameState.activeTeam);
    });

    return () => {
      socket.off("gameState");
    };
  }, []);

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const updateGameState = () => {
    socket.emit("updateGameState", {
      question,
      answers,
      teamAScore,
      teamBScore,
      strikes,
      activeTeam,
    });
  };

  const revealAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[index].revealed = true;
    setAnswers(newAnswers);

    let newTeamAScore = teamAScore;
    let newTeamBScore = teamBScore;
    const points = Number(newAnswers[index].points);

    if (activeTeam === "A") {
      newTeamAScore += points;
      setTeamAScore(newTeamAScore);
      setRoundScore((prev) => ({ ...prev, A: prev.A + points }));
    } else if (activeTeam === "B") {
      newTeamBScore += points;
      setTeamBScore(newTeamBScore);
      setRoundScore((prev) => ({ ...prev, B: prev.B + points }));
    }

    socket.emit("updateGameState", {
      question,
      answers: newAnswers,
      teamAScore: newTeamAScore,
      teamBScore: newTeamBScore,
      strikes,
      activeTeam,
    });
  };

  const hideAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[index].revealed = false;
    setAnswers(newAnswers);
    socket.emit("updateGameState", {
      question,
      answers: newAnswers,
      teamAScore,
      teamBScore,
      strikes,
      activeTeam,
    });
  };

  const handleStrike = () => {
    const newStrikes = strikes < 3 ? strikes + 1 : 3;
    setStrikes(newStrikes);

    let newActiveTeam = activeTeam;
    if (newStrikes === 3) {
      if (activeTeam === "A") {
        newActiveTeam = "B";
      } else if (activeTeam === "B") {
        newActiveTeam = "A";
      }
      setActiveTeam(newActiveTeam);
    }
    socket.emit("updateGameState", {
      question,
      answers,
      teamAScore,
      teamBScore,
      strikes: newStrikes,
      activeTeam: newActiveTeam,
    });
  };

  const handleResetStrikes = () => {
    setStrikes(0);
    socket.emit("updateGameState", {
      question,
      answers,
      teamAScore,
      teamBScore,
      strikes: 0,
      activeTeam,
    });
  };

  const handleActiveTeamChange = (team) => {
    setActiveTeam(team);
    socket.emit("updateGameState", {
      question,
      answers,
      teamAScore,
      teamBScore,
      strikes,
      activeTeam: team,
    });
  };

  const handleSteal = (stealingTeam) => {
    if (stealingTeam === "B") {
      const pointsToSteal = roundScore.A;
      const newTeamAScore = teamAScore - pointsToSteal;
      const newTeamBScore = teamBScore + pointsToSteal;
      setTeamAScore(newTeamAScore);
      setTeamBScore(newTeamBScore);
      setRoundScore({ A: 0, B: roundScore.B + pointsToSteal });
      socket.emit("updateGameState", {
        question,
        answers,
        teamAScore: newTeamAScore,
        teamBScore: newTeamBScore,
        strikes,
        activeTeam,
      });
    } else if (stealingTeam === "A") {
      const pointsToSteal = roundScore.B;
      const newTeamBScore = teamBScore - pointsToSteal;
      const newTeamAScore = teamAScore + pointsToSteal;
      setTeamBScore(newTeamBScore);
      setTeamAScore(newTeamAScore);
      setRoundScore({ B: 0, A: roundScore.A + pointsToSteal });
      socket.emit("updateGameState", {
        question,
        answers,
        teamAScore: newTeamAScore,
        teamBScore: newTeamBScore,
        strikes,
        activeTeam,
      });
    }
  };

  const resetGame = () => {
    const initialAnswers = Array(8).fill({
      text: "",
      points: "",
      revealed: false,
    });
    setQuestion("");
    setAnswers(initialAnswers);
    setTeamAScore(0);
    setTeamBScore(0);
    setStrikes(0);
    setActiveTeam(null);
    setRoundScore({ A: 0, B: 0 });
    socket.emit("updateGameState", {
      question: "",
      answers: initialAnswers,
      teamAScore: 0,
      teamBScore: 0,
      strikes: 0,
      activeTeam: null,
    });
  };

  const loadPremadeQuestion = (e) => {
    const questionIndex = e.target.value;
    if (questionIndex === "") {
      setQuestion("");
      setAnswers(Array(8).fill({ text: "", points: "", revealed: false }));
      return;
    }

    const selectedQuestion = premadeQuestions[questionIndex];
    const paddedAnswers = [...selectedQuestion.answers];
    while (paddedAnswers.length < 8) {
      paddedAnswers.push({ text: "", points: "", revealed: false });
    }

    setQuestion(selectedQuestion.question);
    setAnswers(paddedAnswers);
    setRoundScore({ A: 0, B: 0 });
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Host Panel</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-4">
            <label className="block mb-2">Load Premade Question</label>
            <select
              onChange={loadPremadeQuestion}
              className="w-full p-2 bg-gray-800 rounded"
            >
              <option value="">Select a question...</option>
              {premadeQuestions.map((q, index) => (
                <option key={index} value={index}>
                  {q.question}
                </option>
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
                  onChange={(e) =>
                    handleAnswerChange(index, "text", e.target.value)
                  }
                  className="w-1/2 p-2 bg-gray-800 rounded mr-2"
                />
                <input
                  type="number"
                  placeholder="Points"
                  value={answer.points}
                  onChange={(e) =>
                    handleAnswerChange(
                      index,
                      "points",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-1/4 p-2 bg-gray-800 rounded mr-2"
                />
                <button
                  onClick={() => revealAnswer(index)}
                  className="p-2 bg-green-500 rounded mr-2"
                >
                  Reveal
                </button>
                <button
                  onClick={() => hideAnswer(index)}
                  className="p-2 bg-yellow-500 rounded"
                >
                  Hide
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={updateGameState}
            className="p-2 bg-blue-500 rounded mb-4"
          >
            Set Question & Answers
          </button>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-xl mr-4">Strikes: {strikes}</h2>
            <button
              onClick={handleStrike}
              className="p-2 bg-red-500 rounded mr-2"
            >
              Add Strike
            </button>
            <button
              onClick={handleResetStrikes}
              className="p-2 bg-gray-500 rounded"
            >
              Reset Strikes
            </button>
          </div>

          <div className="flex justify-around">
            <div className="text-center">
              <h2 className="text-xl mb-2">
                Team A: {teamAScore} (Round: {roundScore.A})
              </h2>
              <button
                onClick={() => handleActiveTeamChange("A")}
                className={`p-2 rounded ${
                  activeTeam === "A" ? "bg-green-500" : "bg-blue-500"
                }`}
              >
                Set Active
              </button>
              <button
                onClick={() => handleSteal("A")}
                className="p-2 bg-orange-500 rounded ml-2"
              >
                Steal
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-xl mb-2">Active Team</h2>
              <button
                onClick={() => handleActiveTeamChange(null)}
                className="p-2 bg-gray-500 rounded"
              >
                Clear
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-xl mb-2">
                Team B: {teamBScore} (Round: {roundScore.B})
              </h2>
              <button
                onClick={() => handleActiveTeamChange("B")}
                className={`p-2 rounded ${
                  activeTeam === "B" ? "bg-green-500" : "bg-blue-500"
                }`}
              >
                Set Active
              </button>
              <button
                onClick={() => handleSteal("B")}
                className="p-2 bg-orange-500 rounded ml-2"
              >
                Steal
              </button>
            </div>
          </div>

          <button onClick={resetGame} className="p-2 bg-red-700 rounded mt-8">
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Host;
