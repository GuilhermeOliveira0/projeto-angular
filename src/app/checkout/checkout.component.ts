import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatTooltipModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  cartService = inject(CartService);
  router = inject(Router);

  // Dados do formulário
  cep = '';
  cepInvalid = false;
  shippingCalculated = false;

  // Estado do checkout
  showConfirmation = false;

  calculateShipping(): void {
    // Validar CEP (formato: 12345-678 ou 12345678)
    const cepPattern = /^\d{5}-?\d{3}$/;
    
    if (!this.cep || !cepPattern.test(this.cep)) {
      this.cepInvalid = true;
      alert('Por favor, informe um CEP válido (ex: 12345-678)');
      return;
    }

    this.cepInvalid = false;
    this.cartService.calculateShipping(this.cep);
    this.shippingCalculated = true;
  }

  showSummary(): void {
    if (!this.shippingCalculated) {
      alert('Por favor, calcule o frete antes de continuar!');
      return;
    }
    this.showConfirmation = true;
  }

  async finalizePurchase(): Promise<void> {
    if (!this.shippingCalculated) {
      alert('Por favor, calcule o frete antes de finalizar!');
      return;
    }

    const total = this.cartService.total();
    const itemCount = this.cartService.totalItems();
    
    if (confirm(`Confirma a finalização da compra?\n\nTotal: R$ ${total.toFixed(2)}\nItens: ${itemCount}`)) {
      console.log('Finalizando compra...');
      console.log('CEP:', this.cep);
      console.log('Total:', total);
      console.log('Itens:', itemCount);
      
      // Salvar pedido no Supabase
      const orderId = await this.cartService.saveOrder(this.cep);
      
      console.log('Pedido ID retornado:', orderId);
      
      if (orderId) {
        alert(`✅ Compra finalizada com sucesso!\n\n🎉 Pedido #${orderId} criado!\n\nObrigado pela sua compra!`);
        await this.cartService.clearCart();
        this.router.navigate(['/products']);
      } else {
        alert('❌ Erro ao finalizar compra. Verifique o console (F12) para mais detalhes.');
      }
    }
  }

  async confirmPurchase(): Promise<void> {
    // Salvar pedido no Supabase
    const orderId = await this.cartService.saveOrder(this.cep);
    
    if (orderId) {
      alert(`Compra finalizada com sucesso! 🎉\n\nPedido #${orderId}\n\nObrigado pela sua compra!`);
    } else {
      alert('Compra finalizada com sucesso! 🎉\n\nObrigado pela sua compra!');
    }
    
    await this.cartService.clearCart();
    this.router.navigate(['/products']);
  }

  cancelPurchase(): void {
    this.showConfirmation = false;
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  formatCep(): void {
    // Auto-formatar CEP
    let cep = this.cep.replace(/\D/g, '');
    if (cep.length > 5) {
      cep = cep.substring(0, 5) + '-' + cep.substring(5, 8);
    }
    this.cep = cep;
  }
}
