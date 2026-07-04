import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getCraving = async () => {
    if (!emotion) return;
    setLoading(true);
    
    try {
      const response = await axios.post('https://fictional-broccoli-7vqxprvp76prc4rj-3000.app.github.dev/api/get-craving', {
        emotion_text: emotion
      });
      
      const foodString = response.data.api_payload.search_query;
      const foodArray = foodString.split(',').map(item => item.trim());
      
      setCards(foodArray);
      setCurrentIndex(0); // Reset to the first item
      
    } catch (error) {
      console.error("Failed to fetch food", error);
      alert("Make sure your Node backend is running on port 3000!");
    }
    setLoading(false);
  };

  const handleChoice = (direction, food) => {
    console.log(`Swiped ${direction} on ${food}`);
    if (direction === 'right') {
      alert(`🍕 Ordered ${food.toUpperCase()}! Connecting to Swiggy API...`);
    }
    // Move to the next card in the deck
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="app">
      <h1>VibeBite 🍔</h1>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="How are you feeling right now?" 
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
        />
        <button onClick={getCraving}>
          {loading ? "Translating Vibe..." : "Find Food"}
        </button>
      </div>

      <div className="card-container">
        {cards.length > 0 && currentIndex < cards.length ? (
          <div className="card active-card">
            <h3>{cards[currentIndex].toUpperCase()}</h3>
            <div className="button-group">
              <button className="btn-pass" onClick={() => handleChoice('left', cards[currentIndex])}>
                ❌ Pass
              </button>
              <button className="btn-order" onClick={() => handleChoice('right', cards[currentIndex])}>
                ❤️ Order
              </button>
            </div>
          </div>
        ) : cards.length > 0 && currentIndex >= cards.length ? (
          <div className="card out-of-cards">
            <h3>No more vibes!</h3>
            <p>Try searching another feeling.</p>
          </div>
        ) : (
          <div className="card empty-card">
            <h3>Enter a vibe above</h3>
            <p>Tell me how you feel to discover food.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;