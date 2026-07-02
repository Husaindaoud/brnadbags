import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bag_cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bag_cart', JSON.stringify(items));
  }, [items]);

  // size is optional — products without sizes pass null/undefined
  const addItem = (product, qty = 1, size = null) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { product, quantity: qty, size }];
    });
  };

  const removeItem = (productId, size = null) =>
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));

  const updateQuantity = (productId, qty, size = null) => {
    if (qty <= 0) { removeItem(productId, size); return; }
    setItems(prev =>
      prev.map(i => i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.final_price * i.quantity, 0);

  // isInCart: pass size to check a specific size, omit to check any size
  const isInCart = (productId, size = undefined) =>
    items.some(i => i.product.id === productId && (size === undefined || i.size === size));

  const getCartItem = (productId, size = null) =>
    items.find(i => i.product.id === productId && i.size === size);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isInCart, getCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
