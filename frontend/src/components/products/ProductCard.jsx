import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import Button from '../ui/Button';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              No Disponible
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={!product.available}
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 