import { Injectable, signal } from '@angular/core';

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

import { Product } from '../models/product';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })

export class SupabaseService {

private supabase: SupabaseClient;


// Produtos

products = signal<Product[]>([]);


// Usuário logado

user = signal<User | null>(null);


constructor() {

this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);


// Inicializa usuário

this.supabase.auth.getSession().then(({ data: { session } }) => {

this.user.set(session?.user ?? null);

});


// Observa mudanças de autenticação

this.supabase.auth.onAuthStateChange((_event, session) => {

this.user.set(session?.user ?? null);

});

}


// -------------------------

// Auth

// -------------------------


async login(email: string, password: string) {

const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

if (error) throw error;

this.user.set(data.user);

return data.user;

}


async logout() {

const { error } = await this.supabase.auth.signOut();

if (error) throw error;

this.user.set(null);

}


// -------------------------

// Produtos (CRUD)

// -------------------------


async loadProducts() {

const { data, error } = await this.supabase

.from('products')

.select('*')

.order('createdAt', { ascending: false });


if (error) throw error;

this.products.set(data as Product[]);

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

}