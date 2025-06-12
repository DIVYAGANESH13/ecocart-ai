// App.jsx (React Frontend)
import { useState } from 'react';
import './App.css';

function App() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [impact, setImpact] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            sku,
            name
          }
        ])
      });

      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setImpact(data.impact);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  return (
    <div className="app">
      <h1>🌿 EcoCart AI</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter SKU (e.g., 1001)"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Suggest Eco-Friendly Alternative</button>
      </form>
      <div className="results">
        {suggestions.length > 0 && <h2>🌱 Suggested Alternatives:</h2>}
        <ul>
  {suggestions.map((item, idx) => (
    <li key={idx} className="suggestion">
      <p>
        Replace <b>{item.from}</b> with <b>{item.to}</b><br />
        {item.reason}<br />
        <strong>Cost:</strong> ₹{item.price}<br />
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.to}
            style={{ width: '150px', height: 'auto', marginTop: '10px' }}
          />
        )}
      </p>
    </li>
  ))}
</ul>

        {impact && (
          <div className="impact">
            <h3>🚀 Environmental Impact:</h3>
            <p>Plastic Saved: {impact.plastic_saved_g}g</p>
            <p>CO₂ Saved: {impact.co2_saved_kg}kg</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
