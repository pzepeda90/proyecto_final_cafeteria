import { useSelector, useDispatch } from 'react-redux';
import { addItem, removeItem, updateQuantity, clearCart } from '../store/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (product) => {
    if (product.stock > 0) {
      dispatch(addItem({ ...product, quantity: 1 }));
    }
  };

  const removeFromCart = (productId) => {
    dispatch(removeItem(productId));
  };

  const updateItemQuantity = (productId, newQuantity) => {
    const item = items.find(item => item.id === productId);
    if (item) {
      const validQuantity = Math.min(Math.max(1, newQuantity), item.stock);
      dispatch(updateQuantity({ id: productId, quantity: validQuantity }));
    }
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  return {
    items,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearCartItems
  };
}; 