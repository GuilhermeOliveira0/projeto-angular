import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;

  constructor(private supabase: SupabaseService, private router: Router) {}

  async onRegister() {
    // Validações
    if (!this.name || !this.email || !this.password) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (this.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    this.loading = true;
    try {
      const result = await this.supabase.signUp(this.email, this.password, this.name);
      console.log('Resultado do cadastro:', result);
      
      if (result.user) {
        alert('Conta criada com sucesso! Você já pode fazer login.');
        this.router.navigate(['/login']);
      } else {
        alert('Conta criada! Verifique seu email para confirmar o cadastro.');
        this.router.navigate(['/login']);
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      alert(err.message || err.error_description || 'Erro ao criar conta!');
    } finally {
      this.loading = false;
    }
  }
}
