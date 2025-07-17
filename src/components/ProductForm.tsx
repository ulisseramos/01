import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { X, PackagePlus, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import styles from "../styles/ProductForm.module.css";

const CATEGORIES = [
  'Cursos',
  'E-Books',
  'Produtos Físicos',
  'Consultoria',
  'Outro',
];

export default function ProductForm({ product = null, onProductCreated = () => { }, onCancel = () => { } }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const priceValue = watch('price') || '';

  // Função para formatar valor como moeda brasileira
  function formatBRL(value) {
    if (!value) return '';
    const numeric = value.toString().replace(/\D/g, '');
    const float = (parseInt(numeric, 10) / 100).toFixed(2);
    return Number(float).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handlePriceChange(e) {
    const raw = e.target.value.replace(/\D/g, '');
    setValue('price', raw ? (parseInt(raw, 10) / 100).toFixed(2) : '');
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file && file.size <= 15 * 1024 * 1024) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 15 * 1024 * 1024) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function onSubmit(data) {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Usuário não autenticado.');
      return;
    }
    // Remover category do objeto enviado
    const { category, ...rest } = data;
    // Corrigir o valor de price para número puro
    let price = rest.price;
    if (typeof price === 'string') {
      const numeric = price.replace(/\D/g, '');
      price = numeric ? (parseInt(numeric, 10) / 100) : 0;
    }
    const productData = {
      ...rest,
      price,
      user_id: user.id,
      // Se quiser salvar a categoria, pode concatenar na descrição:
      // description: `[${category}] ${data.description || ''}`,
    };
    const { error } = await supabase
      .from('products')
      .insert([productData]);
    if (error) {
      setErrorMsg('Erro ao criar produto: ' + error.message);
      return;
    }
    onProductCreated();
  }

  return (
    <div className={styles.productFormOverlay + " " + styles.offsetRight}>
      <div className={styles.productFormModal}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.backButton}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Voltar
        </button>
        <h1 className={styles.title}>Criar Novo Produto</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Imagem do Produto */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Imagem do Produto</h3>
              </div>
              <div className={styles.cardBody}>
                <div
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  tabIndex={0}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                  ) : (
                    <>
                      <span className={styles.uploadIcon}><UploadCloud size={36} /></span>
                      <div className={styles.uploadText}>Arraste e solte um arquivo aqui</div>
                      <div className={styles.uploadSubtext}>ou clique para selecionar</div>
                      <div className={styles.uploadSubtext}>Máximo 15.00MB</div>
                      <div className={styles.uploadSubtext}>Tamanho recomendado: 1920px × 1080px (16:9)</div>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            {/* Detalhes do Produto */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Detalhes do Produto</h3>
              </div>
              <div className={styles.cardBody}>
                <div>
                  <label className={styles.label}>Nome do Produto</label>
                  <input
                    type="text"
                    {...register('name', { required: true })}
                    placeholder="Ex: Ebook de Receitas"
                    className={styles.input}
                  />
                  {typeof errors.name?.message === 'string' && (
                    <p className={styles.errorMsg}>{errors.name.message}</p>
                  )}
                </div>
                <div className={styles.rowGrid}>
                  <div>
                    <label className={styles.label}>Categoria</label>
                    <select
                      {...register('category', { required: true })}
                      className={styles.input}
                    >
                      <option value="" disabled>Selecione a categoria</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {typeof errors.category?.message === 'string' && (
                      <p className={styles.errorMsg}>{errors.category.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={styles.label}>Preço</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      {...register('price', { required: true })}
                      placeholder="Preço"
                      className={styles.input}
                      style={{ width: 'calc(91% - 1cm)' }}
                      value={formatBRL(priceValue)}
                      onChange={handlePriceChange}
                    />
                    {typeof errors.price?.message === 'string' && (
                      <p className={styles.errorMsg}>{errors.price.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Descrição do Produto</label>
                  <textarea
                    {...register('description', { required: true })}
                    placeholder="Descreva seu produto..."
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>
          {errorMsg && (
            <div className={styles.errorMsgBox}>{errorMsg}</div>
          )}
          {/* Botões */}
          <div className={styles.buttonRow}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              X Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Criando...
                </>
              ) : (
                <>
                  <PackagePlus size={22} />
                  Criar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 