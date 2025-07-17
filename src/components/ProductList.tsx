import { ClipboardCopy, Trash2, Edit, Loader2, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const copyToClipboard = (text, setCopied) => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  toast.success('Link copiado!');
  setTimeout(() => setCopied(false), 1000);
};

export default function ProductList({ products, loading, onDeleteProduct, onEditProduct }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '10rem', color: '#9CA3AF', fontSize: 16 }}>
        <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} />
        Carregando produtos...
      </div>
    );
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{
      background: '#020204',
      borderRadius: 18,
      padding: '2.2rem 2rem',
      border: '1.5px solid #1A0938',
      maxWidth: 1400,
      margin: '0 auto',
      boxShadow: '0 12px 40px 0 #0001, 0 2px 8px 0 #0002',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    }}>
      {/* Barra de busca */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 32,
        gap: 12,
        background: '#fafaff',
        borderRadius: 10,
        border: '1.5px solid #f3e8ff',
        padding: '0.7rem 1.1rem',
        position: 'relative',
        boxShadow: '0 2px 8px 0 #a78bfa11',
      }}>
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar produtos..."
          style={{
            background: '#fff',
            border: '1.5px solid #e9d5ff',
            borderRadius: 8,
            color: '#23243a',
            padding: '0.7rem 1.1rem',
            fontSize: 16,
            outline: 'none',
            minWidth: 220,
            transition: 'border 0.18s, box-shadow 0.18s',
            boxShadow: '0 1px 8px #a78bfa11',
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        />
      </div>
      {/* Grid de cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
          marginTop: 24,
          marginBottom: 24,
          justifyContent: 'center',
        }}
      >
        {paginatedProducts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#a1a1aa', padding: '2rem', fontSize: 16 }}>Nenhum produto encontrado.</div>
        )}
        {paginatedProducts.map(product => (
          <div key={product.id} style={{
            background: '#fff',
            border: '1.5px solid #a78bfa',
            borderRadius: 16,
            boxShadow: '0 2px 16px #a78bfa11',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            minHeight: 160,
            overflow: 'hidden',
            position: 'relative',
            maxWidth: 365,
            width: '100%',
          }}>
            {/* Imagem do produto */}
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: 90, height: '100%', objectFit: 'cover', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />
            ) : (
              <div style={{ width: 90, height: '100%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#a78bfa', fontWeight: 700, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}>
                {product.name?.[0]?.toUpperCase() || 'P'}
              </div>
            )}
            {/* Infos do produto */}
            <div style={{ flex: 1, padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#23243a', marginBottom: 4 }}>{product.name}</div>
                <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{product.category || 'E-book'}</div>
                <div style={{ display: 'inline-block', background: '#f3f4f6', color: '#22c55e', fontWeight: 600, fontSize: 14, borderRadius: 8, padding: '2px 12px', marginBottom: 8 }}>Aprovado</div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => onEditProduct && onEditProduct(product)}
                  style={{
                    background: '#f3e8ff',
                    border: '1.5px solid #a78bfa',
                    color: '#7c3aed',
                    borderRadius: 8,
                    padding: '0.6rem 1.1rem',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.18s, color 0.18s, border 0.18s',
                  }}
                  title="Editar produto"
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#a78bfa';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#f3e8ff';
                    e.currentTarget.style.color = '#7c3aed';
                  }}
                >
                  <Edit size={18} style={{ marginRight: 4 }} /> Editar
                </button>
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #ef4444',
                    color: '#ef4444',
                    borderRadius: 8,
                    padding: '0.6rem 1.1rem',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.18s, color 0.18s, border 0.18s',
                  }}
                  title="Excluir produto"
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  <Trash2 size={18} style={{ marginRight: 4 }} /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.6rem 1.3rem',
              borderRadius: 8,
              border: 'none',
              background: '#f3e8ff',
              color: '#7c3aed',
              fontWeight: 700,
              fontSize: 16,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: 'all 0.18s',
            }}
          >Anterior</button>
          <span style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 16 }}>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.6rem 1.3rem',
              borderRadius: 8,
              border: 'none',
              background: '#f3e8ff',
              color: '#7c3aed',
              fontWeight: 700,
              fontSize: 16,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: 'all 0.18s',
            }}
          >Próxima</button>
        </div>
      )}
    </div>
  );
} 