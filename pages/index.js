import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import Footer from '../components/Footer';
import GenerateButton from '../components/GenerateButton';
import LoadingMessage from '../components/LoadingMessage';
// import ErrorMessage from '../components/ErrorMessage';

const DEBOUNCE_DELAY = 300; // ms
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const Home = () => {
  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [history, setHistory] = useState([]);
  const loadingMessageRef = useRef(null);
  const inputRef = useRef(null);

  // Reset error when user starts typing
  useEffect(() => {
    if (userInput) {
      setError(null);
    }
  }, [userInput]);

  // Save recommendations history to localStorage
  useEffect(() => {
    if (apiOutput) {
      const newHistory = [...history, { input: userInput, output: apiOutput, timestamp: Date.now() }].slice(-5);
      setHistory(newHistory);
      localStorage.setItem('movieWizardHistory', JSON.stringify(newHistory));
    }
  }, [apiOutput]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('movieWizardHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const callGenerateEndpoint = async (retryAttempt = 0) => {
    const trimmedInput = userInput.trim();
    
    if (!trimmedInput && !window.confirm('Generate a random movie recommendation?')) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    loadingMessageRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: trimmedInput || 'random' }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setApiOutput(data.output);
      setRetryCount(0);
    } catch (error) {
      console.error("API call error:", error);
      
      if (retryAttempt < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          callGenerateEndpoint(retryAttempt + 1);
        }, RETRY_DELAY);
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Debounced input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callGenerateEndpoint();
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('movieWizardHistory');
  };

  return (
    <div className="app-container">
      <Head>
        <title>Movie-Wizard | AI Movie Recommendations</title>
        <meta name="description" content="Get personalized movie recommendations using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main-content">
        <header className="hero-section">
          <h1 className="title">Movie-Wizard</h1>
          <div className="subtitle">
            <h2>Discover Your Next Favorite Movie with AI</h2>
          </div>
        </header>

        <section className="search-section">
          <div className="instruction-card">
            <h3>How it works</h3>
            <p>
              🎬 Enter your preferences (theme, genre, actors, mood)<br/>
              ✨ Or leave it blank for a surprise recommendation<br/>
              🎯 Hit Generate or press Enter to get your personalized pick<br/>
              📱 Works great on mobile and desktop devices
            </p>
          </div>

          <div className="input-container">
            <textarea
              ref={inputRef}
              className="prompt-input"
              placeholder="E.g., 'a thought-provoking sci-fi movie with strong female leads'"
              value={userInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              rows={3}
              maxLength={500}
            />
            <div className="input-footer">
              <span className="character-count">
                {userInput.length}/500
              </span>
              <GenerateButton 
                isGenerating={isGenerating} 
                onClick={() => callGenerateEndpoint()}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="output-container" ref={loadingMessageRef}>
            {/* {error && <ErrorMessage message={error} onRetry={() => callGenerateEndpoint()} />} */}
            
            {isGenerating ? (
              <LoadingMessage retryCount={retryCount} />
            ) : (
              apiOutput && (
                <div className="recommendation-card">
                  <h3>Your Perfect Movie Match</h3>
                  <div className="recommendation-content">
                    {apiOutput}
                  </div>
                </div>
              )
            )}
          </div>

          {history.length > 0 && (
            <div className="history-section">
              <div className="history-header">
                <h3>Previous Recommendations</h3>
                <button onClick={clearHistory} className="clear-history-btn">
                  Clear History
                </button>
              </div>
              <div className="history-list">
                {history.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-query">{item.input || 'Random recommendation'}</div>
                    <div className="history-result">{item.output}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          width: 100%;
          box-sizing: border-box;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem 1rem;
        }

        .title {
          font-size: clamp(2.5rem, 8vw, 4rem);
          font-weight: 700;
          background: linear-gradient(to right, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 10px #ff6b6b33, 0 0 20px #ff6b6b33;
          }
          to {
            text-shadow: 0 0 20px #4ecdc433, 0 0 30px #4ecdc433;
          }
        }

        .subtitle {
          font-size: clamp(1.2rem, 4vw, 1.5rem);
          color: #a0aec0;
          margin-bottom: 2rem;
        }

        .search-section {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .instruction-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .instruction-card h3 {
          color: #4ecdc4;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .instruction-card p {
          line-height: 1.6;
          font-size: 1rem;
        }

        .input-container {
          margin-bottom: 2rem;
          position: relative;
        }

        .prompt-input {
          width: 100%;
          padding: 1rem;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 1rem;
          resize: vertical;
          transition: all 0.3s ease;
          margin-bottom: 0.5rem;
          font-family: inherit;
          min-height: 100px;
        }

        .prompt-input:focus {
          outline: none;
          border-color: #4ecdc4;
          box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
        }

        .prompt-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .character-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .recommendation-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 2rem;
          animation: fadeIn 0.5s ease-out;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .history-section {
          margin-top: 3rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .clear-history-btn {
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-history-btn:hover {
          background: rgba(255, 107, 107, 0.3);
        }

        .history-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
        }

        .history-query {
          color: #4ecdc4;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .history-result {
          color: rgba(255, 255, 255, 0.9);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }

          .instruction-card {
            padding: 1rem;
          }

          .recommendation-card {
            padding: 1.5rem;
          }

          .input-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .character-count {
            text-align: right;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 1rem 0.5rem;
          }

          .search-section {
            padding: 0 0.5rem;
          }

          .history-section {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;