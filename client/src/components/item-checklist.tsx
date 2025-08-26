import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import QuantityControl from "./quantity-control";
import type { ItemQuantity } from "@shared/schema";
import { ITEM_TYPES } from "@shared/schema";

interface ItemChecklistProps {
  items: ItemQuantity[];
  onChange: (items: ItemQuantity[]) => void;
  others: string;
  onOthersChange: (others: string) => void;
}

export default function ItemChecklist({ items, onChange, others, onOthersChange }: ItemChecklistProps) {
  
  // Initialize items if empty
  useEffect(() => {
    if (items.length === 0) {
      const initialItems = ITEM_TYPES.map(type => ({
        name: type.name,
        quantity: 0,
      }));
      onChange(initialItems);
    }
  }, [items.length, onChange]);

  const updateItemQuantity = (itemName: string, quantity: number) => {
    const updatedItems = items.map(item =>
      item.name === itemName ? { ...item, quantity } : item
    );
    onChange(updatedItems);
  };

  const getItemIcon = (itemId: string) => {
    switch (itemId) {
      case 'mobile': return '📱';
      case 'earphones': return '🎧';
      case 'headset': return '🎧';
      case 'watch': return '⌚';
      case 'charger': return '🔌';
      case 'powerbank': return '🔋';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-4">
      {ITEM_TYPES.map((itemType) => {
        const item = items.find(i => i.name === itemType.name);
        const quantity = item?.quantity || 0;
        
        return (
          <div 
            key={itemType.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            data-testid={`item-row-${itemType.id}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getItemIcon(itemType.id)}</span>
              <span className="font-medium">{itemType.name}</span>
            </div>
            <QuantityControl
              quantity={quantity}
              onChange={(newQuantity) => updateItemQuantity(itemType.name, newQuantity)}
            />
          </div>
        );
      })}

      <Separator />

      {/* Others Field */}
      <div className="p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Plus size={20} className="text-gray-600" />
          <span className="font-medium">Others</span>
        </div>
        <Input
          type="text"
          placeholder="Specify other items (optional)"
          value={others}
          onChange={(e) => onOthersChange(e.target.value)}
          className="text-sm"
          data-testid="input-other-items"
        />
      </div>
    </div>
  );
}
