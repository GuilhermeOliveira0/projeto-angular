import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product';
import { CartItem } from '../models/cart-item';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private supabase = inject(SupabaseService);
  
  // Estado do carrinho
  private cartItems = signal<CartItem[]>([]);
  
  // Computed: Total de itens
  totalItems = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  // Computed: Subtotal (sem frete)
  subtotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.subtotal, 0)
  );
  
  // Frete (será calculado com CEP)
  shippingCost = signal<number>(0);
  
  // Computed: Total geral (subtotal + frete)
  total = computed(() => this.subtotal() + this.shippingCost());
  
  // Expor itens do carrinho
  items = this.cartItems.asReadonly();

  constructor() {
    // Carregar carrinho do Supabase ao iniciar
    this.loadCartFromSupabase();
  }

  // Adicionar produto ao carrinho
  async addToCart(product: Product): Promise<void> {
    if (!product.id) return;
    
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      // Produto já existe: incrementar quantidade
      await this.updateQuantity(product.id!, existingItem.quantity + 1);
    } else {
      // Produto novo: adicionar com quantidade 1
      await this.addItemToSupabase(product.id, 1);
      
      const newItem: CartItem = {
        product,
        quantity: 1,
        subtotal: product.price
      };
      this.cartItems.set([...currentItems, newItem]);
    }
  }

  // Atualizar quantidade de um item
  async updateQuantity(productId: number, newQuantity: number): Promise<void> {
    if (newQuantity < 1) return;

    await this.updateItemInSupabase(productId, newQuantity);

    const updatedItems = this.cartItems().map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.product.price * newQuantity
        };
      }
      return item;
    });

    this.cartItems.set(updatedItems);
  }

  // Incrementar quantidade
  async incrementQuantity(productId: number): Promise<void> {
    const item = this.cartItems().find(i => i.product.id === productId);
    if (item) {
      await this.updateQuantity(productId, item.quantity + 1);
    }
  }

  // Decrementar quantidade
  async decrementQuantity(productId: number): Promise<void> {
    const item = this.cartItems().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      await this.updateQuantity(productId, item.quantity - 1);
    }
  }

  // Remover item do carrinho
  async removeItem(productId: number): Promise<void> {
    await this.removeItemFromSupabase(productId);
    
    const updatedItems = this.cartItems().filter(
      item => item.product.id !== productId
    );
    this.cartItems.set(updatedItems);
  }

  // Limpar carrinho
  async clearCart(): Promise<void> {
    await this.clearCartInSupabase();
    this.cartItems.set([]);
    this.shippingCost.set(0);
  }

  // Calcular frete baseado no CEP
  calculateShipping(cep: string): void {
    // Simular cálculo de frete
    // Em produção, você chamaria uma API de frete real
    const subtotal = this.subtotal();
    
    if (subtotal >= 100) {
      // Frete grátis para compras acima de R$100
      this.shippingCost.set(0);
    } else {
      // Simular frete baseado no CEP
      // Aqui você pode integrar com APIs como Correios, Melhor Envio, etc.
      const randomShipping = Math.floor(Math.random() * 20) + 10; // Entre R$10 e R$30
      this.shippingCost.set(randomShipping);
    }
  }

  // Verificar se frete é grátis
  isFreeShipping(): boolean {
    return this.subtotal() >= 100;
  }

  // ============================================
  // MÉTODOS DE INTEGRAÇÃO COM SUPABASE
  // ============================================

  // Carregar carrinho do Supabase
  async loadCartFromSupabase(): Promise<void> {
    const user = this.supabase.user();
    if (!user) return;

    try {
      const { data, error } = await this.supabase['supabase']
        .from('cart_items')
        .select(`
          quantity,
          products (
            id,
            name,
            description,
            price,
            imageUrl,
            createdAt
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const cartItems: CartItem[] = data.map((item: any) => ({
          product: {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.products.price,
            imageUrl: item.products.imageUrl,
            createdAt: item.products.createdAt
          },
          quantity: item.quantity,
          subtotal: item.products.price * item.quantity
        }));

        this.cartItems.set(cartItems);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  }

  // Adicionar item no Supabase
  private async addItemToSupabase(productId: number, quantity: number): Promise<void> {
    const user = this.supabase.user();
    if (!user) {
      console.warn('Usuário não logado - não salvando no Supabase');
      return;
    }

    try {
      // Usar upsert para evitar erro 409
      const { error } = await this.supabase['supabase']
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity: quantity
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) {
        console.error('Erro ao adicionar item:', error);
        throw error;
      }
      
      console.log('Item adicionado/atualizado no Supabase:', productId);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  }

  // Atualizar item no Supabase
  private async updateItemInSupabase(productId: number, quantity: number): Promise<void> {
    const user = this.supabase.user();
    if (!user) {
      console.warn('Usuário não logado - não atualizando no Supabase');
      return;
    }

    try {
      const { error } = await this.supabase['supabase']
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Erro ao atualizar item:', error);
        throw error;
      }
      
      console.log('Item atualizado no Supabase:', productId, 'quantidade:', quantity);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  }

  // Remover item do Supabase
  private async removeItemFromSupabase(productId: number): Promise<void> {
    const user = this.supabase.user();
    if (!user) return;

    try {
      const { error } = await this.supabase['supabase']
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  }

  // Limpar carrinho no Supabase
  private async clearCartInSupabase(): Promise<void> {
    const user = this.supabase.user();
    if (!user) return;

    try {
      const { error } = await this.supabase['supabase']
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  }

  // Salvar pedido no Supabase (quando finalizar compra)
  async saveOrder(cep: string): Promise<number | null> {
    const user = this.supabase.user();
    if (!user) {
      console.error('Usuário não logado');
      alert('Você precisa estar logado para finalizar a compra!');
      return null;
    }

    try {
      console.log('Iniciando salvamento do pedido...');
      console.log('Usuário logado:', user.email);
      console.log('Itens do carrinho:', this.cartItems());
      
      if (this.cartItems().length === 0) {
        alert('Carrinho está vazio!');
        return null;
      }
      
      // 1. Criar o pedido
      const orderData = {
        user_id: user.id,
        total: Number(this.total().toFixed(2)),
        shipping_cost: Number(this.shippingCost().toFixed(2)),
        cep: cep,
        status: 'completed'
      };
      
      console.log('Dados do pedido:', orderData);
      
      const { data: order, error: orderError } = await this.supabase['supabase']
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Erro detalhado ao criar pedido:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        alert(`Erro ao criar pedido: ${orderError.message}\n\nDetalhes: ${orderError.details || 'Verifique se está logado'}`);
        throw orderError;
      }

      if (!order) {
        console.error('Pedido não foi criado - sem dados retornados');
        alert('Erro: Pedido não foi criado. Tente fazer login novamente.');
        return null;
      }

      console.log('Pedido criado:', order);

      // 2. Salvar itens do pedido
      const orderItems = this.cartItems()
        .filter(item => item.product.id) // Apenas itens com ID válido
        .map(item => ({
          order_id: order.id,
          product_id: item.product.id!,
          product_name: item.product.name,
          product_price: Number(item.product.price.toFixed(2)),
          quantity: item.quantity,
          subtotal: Number(item.subtotal.toFixed(2))
        }));

      console.log('Itens a serem salvos:', orderItems);
      
      if (orderItems.length === 0) {
        console.error('Nenhum item válido para salvar!');
        throw new Error('Carrinho vazio ou sem produtos válidos');
      }

      const { error: itemsError } = await this.supabase['supabase']
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Erro ao salvar itens do pedido:', itemsError);
        alert(`Erro ao salvar itens: ${itemsError.message}`);
        throw itemsError;
      }

      console.log('Itens salvos com sucesso!');
      return order.id;
    } catch (error: any) {
      console.error('Erro ao salvar pedido:', error);
      
      // Verificar se é erro de autenticação
      if (error.message?.includes('auth') || error.message?.includes('lock')) {
        alert('Sessão expirada! Por favor, faça login novamente.');
        window.location.href = '/login';
      } else {
        alert('Erro ao salvar pedido. Veja o console (F12) para mais detalhes.');
      }
      return null;
    }
  }

  // Verificar se produto está no carrinho
  isInCart(productId: number): boolean {
    return this.cartItems().some(item => item.product.id === productId);
  }

  // Obter quantidade de um produto no carrinho
  getProductQuantity(productId: number): number {
    const item = this.cartItems().find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }
}
