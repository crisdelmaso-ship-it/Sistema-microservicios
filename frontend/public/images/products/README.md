# Product images

Add product images in this folder using the product ID as the filename:

- `product-1.webp`
- `product-2.webp`
- `product-3.webp`

The catalog uses `imagenUrl` from the API first. If it is empty or unavailable, it falls back to `/images/products/product-{id}.webp`.

Recommended format: JPG or PNG, landscape or square, at least 800 px wide.