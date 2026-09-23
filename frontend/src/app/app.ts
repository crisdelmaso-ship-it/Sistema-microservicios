import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from './services/auth.service';
import { StoreService } from './services/store.service';
import { Product, Purchase, DesiredProduct } from './services/models';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly store = inject(StoreService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  mode: 'login' | 'register' = 'login';
  view: 'catalog' | 'wishlist' | 'purchases' = 'catalog';
  loggedIn = false;
  loading = false;
  notice = '';
  error = '';
  products: Product[] = [];
  wishlist: DesiredProduct[] = [];
  purchases: Purchase[] = [];
  credentials = { user: '', password: '' };
  registration = { username: '', email: '', password: '' };

  ngOnInit(): void {
    this.loggedIn = this.auth.isAuthenticated();
    if (this.loggedIn) this.loadProducts();
  }

  submitAuth(): void {
    this.clearMessages();
    this.loading = true;
    const request = this.mode === 'login'
      ? this.auth.login(this.credentials)
      : this.auth.register(this.registration);
    request.pipe(finalize(() => this.finishRequest())).subscribe({
      next: (response) => {
        if (this.mode === 'register') {
          this.mode = 'login';
          this.notice = 'Usuario registrado. Ahora puedes iniciar sesión.';
          return;
        }

        const loginData = response.data as { jwt?: string } | null | undefined;
        if (!loginData?.jwt) {
          this.error = response.message || 'No fue posible iniciar sesión.';
          return;
        }

        this.loggedIn = true;
        this.notice = 'Sesión iniciada correctamente.';
        this.loadProducts();
      },
      error: (error) => { this.error = this.auth.errorMessage(error); }
    });
  }

  loadProducts(): void {
    this.store.products().pipe(finalize(() => this.finishRequest())).subscribe({
      next: (products) => this.products = products,
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  openWishlist(): void {
    this.clearMessages();
    this.view = 'wishlist';
    this.loading = true;
    this.store.wishlist().pipe(finalize(() => this.finishRequest())).subscribe({
      next: (response) => this.wishlist = response.productos ?? [],
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  openPurchases(): void {
    this.clearMessages();
    this.view = 'purchases';
    this.loading = true;
    this.store.purchases().pipe(finalize(() => this.finishRequest())).subscribe({
      next: (purchases) => this.purchases = purchases,
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  addToWishlist(product: Product): void {
    this.clearMessages();
    this.loading = true;
    this.store.addToWishlist(product.id, 1).pipe(finalize(() => this.finishRequest())).subscribe({
      next: () => { this.notice = `${product.nombre} se agregó a tu lista de deseos.`; },
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  buy(product: Product, quantity = 1): void {
    if (quantity > product.stock) { this.error = 'La cantidad supera el stock disponible.'; return; }
    this.clearMessages();
    this.loading = true;
    this.store.buy(product.id, quantity).pipe(finalize(() => this.finishRequest())).subscribe({
      next: () => { this.notice = 'Compra realizada correctamente.'; this.loadProducts(); },
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  buyDesired(item: DesiredProduct): void {
    if (item.producto) this.buy(item.producto, item.cantidad);
  }

  removeDesired(item: DesiredProduct): void {
    this.clearMessages();
    this.loading = true;
    this.store.removeFromWishlist(item.id).pipe(finalize(() => this.finishRequest())).subscribe({
      next: () => this.openWishlist(),
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  logout(): void {
    this.auth.logout();
    this.loggedIn = false;
    this.view = 'catalog';
    this.notice = 'Sesión cerrada.';
  }

  private clearMessages(): void { this.notice = ''; this.error = ''; }

  private finishRequest(): void {
    this.loading = false;
    this.changeDetector.detectChanges();
  }
}
