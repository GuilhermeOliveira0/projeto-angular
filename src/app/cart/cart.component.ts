import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);

  async incrementQuantity(productId: number): Promise<void> {
    await this.cartService.incrementQuantity(productId);
  }

  async decrementQuantity(productId: number): Promise<void> {
    await this.cartService.decrementQuantity(productId);
  }

  async removeItem(productId: number): Promise<void> {
    if (confirm('Deseja remover este item do carrinho?')) {
      await this.cartService.removeItem(productId);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  async clearCart(): Promise<void> {
    if (confirm('Deseja esvaziar o carrinho?')) {
      await this.cartService.clearCart();
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
