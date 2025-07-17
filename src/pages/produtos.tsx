import { useState, useRef, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { useProducts } from '../hooks/useProducts';
import { Plus, Package } from 'lucide-react';

export default function ProdutosPage() {
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mainRef.current) {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        mainRef.current.style.background = '#fff';
      } else {
        mainRef.current.style.background = '#020204';
      }
    }
    const observer = new MutationObserver(() => {
      if (mainRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          mainRef.current.style.background = '#fff';
        } else {
          mainRef.current.style.background = '#020204';
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mainRef} className="produtosShiftRight" style={{
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'auto',
      paddingTop: '16px', // 1cm do topo
      minHeight: 'calc(100vh + 5cm)',
      background: '#020204',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        {/* Cabeçalho moderno */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ background: '#18122B', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={28} color="#a78bfa" />
            </span>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-1px', margin: 0 }}>Produtos</h1>
              <p style={{ fontSize: 15, color: '#a1a1aa', fontWeight: 400, margin: 0, marginTop: 2 }}>Visualize e gerencie todos seus produtos.</p>
            </div>
          </div>
          <button onClick={() => setShowProductForm(true)} style={{
            background: '#18122B',
            color: '#a78bfa',
            border: '1.5px solid #23243a',
            borderRadius: 10,
            padding: '0.7rem 1.4rem',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 8px 0 #00000033',
            transition: 'all 0.18s',
          }}
            onMouseOver={e => e.currentTarget.style.background = '#23243a'}
            onMouseOut={e => e.currentTarget.style.background = '#18122B'}
          >
            <Plus size={18} /> Novo produto
          </button>
        </div>
        {/* Formulário de produto */}
        {showProductForm && (
          <div style={{
            maxWidth: 800,
            margin: '40px auto',
            background: '#18122B',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2.5rem 2rem',
            border: '1.5px solid #23243a',
          }}>
            <ProductForm 
              product={editProduct}
              onProductCreated={() => { setShowProductForm(false); setEditProduct(null); fetchProducts(); }}
              onCancel={() => { setShowProductForm(false); setEditProduct(null); }}
            />
          </div>
        )}
        {/* Lista de produtos */}
        {!showProductForm && (
          <main style={{ flex: 1, minWidth: 0, padding: '2rem 0' }}>
            <ProductList 
              products={products} 
              loading={loading}
              onDeleteProduct={deleteProduct} 
              onEditProduct={product => { setEditProduct(product); setShowProductForm(true); }}
            />
          </main>
        )}
      </div>
    </div>
  );
} 