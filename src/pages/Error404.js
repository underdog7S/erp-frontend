import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

const Error404 = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    gridSize: 20,
    cellSize: 20
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    canvas.width = state.gridSize * state.cellSize;
    canvas.height = state.gridSize * state.cellSize;

    const drawGame = () => {
      ctx.fillStyle = '#1a237e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw snake
      ctx.fillStyle = '#4caf50';
      state.snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = '#66bb6a';
        } else {
          ctx.fillStyle = '#4caf50';
        }
        ctx.fillRect(
          segment.x * state.cellSize,
          segment.y * state.cellSize,
          state.cellSize - 2,
          state.cellSize - 2
        );
      });

      // Draw food
      ctx.fillStyle = '#f44336';
      ctx.fillRect(
        state.food.x * state.cellSize,
        state.food.y * state.cellSize,
        state.cellSize - 2,
        state.cellSize - 2
      );
    };

    const moveSnake = () => {
      if (gameOver) return;

      const head = {
        x: state.snake[0].x + state.direction.x,
        y: state.snake[0].y + state.direction.y
      };

      // Check collision with walls
      if (
        head.x < 0 || head.x >= state.gridSize ||
        head.y < 0 || head.y >= state.gridSize
      ) {
        setGameOver(true);
        return;
      }

      // Check collision with self
      if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      state.snake.unshift(head);

      // Check if food eaten
      if (head.x === state.food.x && head.y === state.food.y) {
        setScore(prev => prev + 10);
        // Generate new food
        state.food = {
          x: Math.floor(Math.random() * state.gridSize),
          y: Math.floor(Math.random() * state.gridSize)
        };
      } else {
        state.snake.pop();
      }
    };

    const handleKeyPress = (e) => {
      if (gameOver) return;

      const key = e.key;
      if (key === 'ArrowUp' && state.direction.y === 0) {
        state.direction = { x: 0, y: -1 };
      } else if (key === 'ArrowDown' && state.direction.y === 0) {
        state.direction = { x: 0, y: 1 };
      } else if (key === 'ArrowLeft' && state.direction.x === 0) {
        state.direction = { x: -1, y: 0 };
      } else if (key === 'ArrowRight' && state.direction.x === 0) {
        state.direction = { x: 1, y: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    const gameInterval = setInterval(() => {
      moveSnake();
      drawGame();
    }, 150);

    drawGame();

    return () => {
      clearInterval(gameInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameOver]);

  const resetGame = () => {
    gameStateRef.current = {
      snake: [{ x: 10, y: 10 }],
      direction: { x: 1, y: 0 },
      food: { x: 15, y: 15 },
      gridSize: 20,
      cellSize: 20
    };
    setScore(0);
    setGameOver(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
          Oops! Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
          The page you're looking for doesn't exist. But hey, you can play Snake while you're here! 🐍
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 4,
          p: 3,
          bgcolor: '#f5f5f5',
          borderRadius: 2
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {gameOver ? 'Game Over!' : 'Snake Game'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Score: {score} | Use arrow keys to play
          </Typography>
          <canvas
            ref={canvasRef}
            style={{
              border: '3px solid #1a237e',
              borderRadius: '8px',
              backgroundColor: '#1a237e',
              cursor: 'pointer'
            }}
          />
          {gameOver && (
            <Button
              variant="contained"
              onClick={resetGame}
              sx={{ mt: 2 }}
              startIcon={<RefreshIcon />}
            >
              Play Again
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' } }}
          >
            Go Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.history.back()}
            sx={{ borderColor: '#1a237e', color: '#1a237e' }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Error404;

