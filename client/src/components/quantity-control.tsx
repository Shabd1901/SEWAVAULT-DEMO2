import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityControl({ 
  quantity, 
  onChange, 
  min = 0, 
  max = 99 
}: QuantityControlProps) {
  
  const increment = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  return (
    <div className="quantity-control">
      <Button
        variant="outline"
        size="sm"
        className="quantity-btn bg-gray-200 hover:bg-gray-300"
        onClick={decrement}
        disabled={quantity <= min}
        data-testid="button-quantity-minus"
      >
        <Minus size={12} />
      </Button>
      <span 
        className="quantity-display text-primary"
        data-testid="text-quantity"
      >
        {quantity}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="quantity-btn bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={increment}
        disabled={quantity >= max}
        data-testid="button-quantity-plus"
      >
        <Plus size={12} />
      </Button>
    </div>
  );
}
