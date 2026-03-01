'use client';
import Navbar from '../../src/components/Navbar';
import Footer from '../../src/components/Footer';
import { useState } from 'react';

export default function Checkout() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Order placed for ${name}, shipped to ${address}`);
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Checkout</h1>
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Address:</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}>Place Order</button>
        </form>
      </main>
      <Footer />
    </>
  );
}