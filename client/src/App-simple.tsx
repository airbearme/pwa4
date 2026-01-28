import React from "react";

function App() {
  console.log("Simple App rendering!");
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🐻 AirBear</h1>
        <p style={{ fontSize: '1.5rem', margin: '0 0 20px 0' }}>Eco Transportation</p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '30px'
        }}>
          <p style={{ margin: 0, fontSize: '1.2rem' }}>✅ React is Working!</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
            If you see this, the React app is rendering successfully.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
