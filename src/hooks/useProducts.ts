import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useProducts() {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        if (!user?.id) {
            setProducts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .or('is_checkout.is.false,is_checkout.is.null');

        if (error) {
            console.error('Erro ao buscar produtos:', error);
            setProducts([]);
        } else {
            setProducts(data);
        }
        setLoading(false);
    }, [user?.id]);

    const deleteProduct = useCallback(async (productId: string) => {
        if (!user?.id) {
            console.error("Usuário não autenticado para deletar o produto.");
            return;
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Erro ao deletar produto:', error);
        } else {
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchProducts();
        } else {
            // Se não houver usuário, para de carregar e limpa os produtos
            setLoading(false);
            setProducts([]);
        }
    }, [user?.id, fetchProducts]);

    const addProduct = useCallback((newProduct) => {
        setProducts(currentProducts => [newProduct, ...currentProducts]);
    }, []);

    const updateProduct = useCallback((updatedProduct) => {
        setProducts(products => 
            products.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
        );
    }, []);

    return { products, loading, fetchProducts, addProduct, deleteProduct, updateProduct };
} 