import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Product } from '../Models/products';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  supabase: SupabaseClient;
  products = signal<Product[]>([]);
 
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
 
  async loadProducts() {
    const { data, error } = await this.supabase.from('products').select('*');
    if (error) throw error;
    this.products.set(data as Product[]);
  }
 
  getProducts(): Product[] {
    return this.products();
  }
 
  async addProduct(product: Product) {
    const { error } = await this.supabase.from('products').insert([product]);
    if (error) throw error;
    await this.loadProducts();
  }
 
  async updateProduct(id: number, updates: Partial<Product>) {
    const { error } = await this.supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
    await this.loadProducts();
  }
 
  async deleteProduct(id: number) {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await this.loadProducts();
  }
 
  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }
 
  async logout() {
    await this.supabase.auth.signOut();
  }
}