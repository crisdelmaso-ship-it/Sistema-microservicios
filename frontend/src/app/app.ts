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
  isAdmin = false;
  loading = false;
  notice = '';
  error = '';
  products: Product[] = [];
  wishlist: DesiredProduct[] = [];
  purchases: Purchase[] = [];
  credentials = { user: '', password: '' };
  registration = { username: '', email: '', password: '' };
  showAdminForm = false;
  editingProductId: number | null = null;
  productForm = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    imagenUrl: '',
    activo: true
  };

  ngOnInit(): void {
    this.loggedIn = this.auth.isAuthenticated();
    this.isAdmin = this.auth.isAdmin();
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
        this.isAdmin = this.auth.isAdmin();
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
    if (this.isAdmin && this.showAdminForm) {
      this.notice = 'Cierra el formulario de edición antes de comprar.';
      return;
    }
    if (quantity > product.stock) { this.error = 'La cantidad supera el stock disponible.'; return; }
    this.clearMessages();
    this.loading = true;
    this.store.buy(product.id, quantity).pipe(finalize(() => this.finishRequest())).subscribe({
      next: () => { this.notice = 'Compra realizada correctamente.'; this.loadProducts(); },
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  openCreateProductForm(): void {
    this.showAdminForm = true;
    this.editingProductId = null;
    this.productForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      imagenUrl: '',
      activo: true
    };
  }

  openEditProductForm(product: Product): void {
    this.showAdminForm = true;
    this.editingProductId = product.id;
    this.productForm = {
      nombre: product.nombre,
      descripcion: product.descripcion ?? '',
      precio: Number(product.precio),
      stock: product.stock,
      categoria: product.categoria ?? '',
      imagenUrl: product.imagenUrl ?? '',
      activo: product.activo
    };
  }

  cancelProductForm(): void {
    this.showAdminForm = false;
    this.editingProductId = null;
    this.productForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      imagenUrl: '',
      activo: true
    };
  }

  saveProduct(): void {
    if (!this.productForm.nombre.trim()) {
      this.error = 'El nombre del producto es obligatorio.';
      return;
    }

    if (this.productForm.precio < 0) {
      this.error = 'El precio no puede ser negativo.';
      return;
    }

    if (this.productForm.stock < 0) {
      this.error = 'El stock no puede ser negativo.';
      return;
    }

    this.clearMessages();
    this.loading = true;

    const payload = {
      nombre: this.productForm.nombre,
      descripcion: this.productForm.descripcion,
      precio: Number(this.productForm.precio),
      stock: Number(this.productForm.stock),
      categoria: this.productForm.categoria,
      imagenUrl: this.productForm.imagenUrl,
      activo: this.productForm.activo
    };

    const request$ = this.editingProductId !== null
      ? this.store.updateProduct(this.editingProductId, payload)
      : this.store.createProduct(payload);

    request$.pipe(finalize(() => this.finishRequest())).subscribe({
      next: () => {
        this.notice = this.editingProductId !== null ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
        this.cancelProductForm();
        this.loadProducts();
      },
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`¿Deseas eliminar el producto "${product.nombre}"?`)) {
      return;
    }

    this.clearMessages();
    this.loading = true;
    this.store.deleteProduct(product.id).pipe(finalize(() => this.finishRequest())).subscribe({
      next: () => {
        this.notice = 'Producto eliminado correctamente.';
        this.loadProducts();
      },
      error: (error) => this.error = this.auth.errorMessage(error)
    });
  }

  productImage(product: Product): string {
    return this.isUsableImageUrl(product.imagenUrl)
      ? product.imagenUrl as string
      : `/images/products/product-${product.id}.webp`;
  }

  wishlistProduct(item: DesiredProduct): Product | undefined {
    return item.producto || this.products.find(product => product.id === item.productoId);
  }

  wishlistImage(item: DesiredProduct): string {
    const product = this.wishlistProduct(item);
    return product ? this.productImage(product) : `/images/products/product-${item.productoId}.webp`;
  }

  wishlistName(item: DesiredProduct): string {
    return this.wishlistProduct(item)?.nombre || `Producto #${item.productoId}`;
  }

  private isUsableImageUrl(url?: string): boolean {
    return !!url && !url.includes('ejemplo.com');
  }

  purchaseProduct(purchase: Purchase): Product | undefined {
    return this.products.find(product => product.id === purchase.productoId);
  }

  purchaseImage(purchase: Purchase): string {
    const product = this.purchaseProduct(purchase);
    return product ? this.productImage(product) : `/images/products/product-${purchase.productoId}.webp`;
  }

  purchaseName(purchase: Purchase): string {
    return this.purchaseProduct(purchase)?.nombre || `Producto #${purchase.productoId}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    const productId = image.dataset['productId'];
    const localImage = productId ? `/images/products/product-${productId}.webp` : '';

    if (localImage && !image.src.endsWith(localImage)) {
      image.onerror = null;
      image.src = localImage;
      image.onerror = () => {
        image.hidden = true;
        image.nextElementSibling?.removeAttribute('hidden');
      };
      return;
    }

    image.hidden = true;
    image.nextElementSibling?.removeAttribute('hidden');
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
    this.isAdmin = false;
    this.showAdminForm = false;
    this.editingProductId = null;
    this.view = 'catalog';
    this.notice = 'Sesión cerrada.';
  }

  private clearMessages(): void { this.notice = ''; this.error = ''; }

  private finishRequest(): void {
    this.loading = false;
    this.changeDetector.detectChanges();
  }
}
