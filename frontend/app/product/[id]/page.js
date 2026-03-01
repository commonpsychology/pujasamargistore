'use client';
import Navbar from '../../../src/components/Navbar';
import Footer from '../../../src/components/Footer';
import { useParams } from 'next/navigation';

export default function ProductPage() {
  const { id } = useParams();

  // Normally you would fetch product data from API or database
  const product = { id, name: `Product ${id}`, price: 50, description: `This is the description for product ${id}.` };

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>{product.name}</h1>
        <p>Price: ${product.price}</p>
        <p>{product.description}</p>
        <button style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}>
          Add to Cart
        </button>
      </main>
      <Footer />
    </>
  );
}