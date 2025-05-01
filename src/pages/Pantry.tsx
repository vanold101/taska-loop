
import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock pantry items for demo
const mockPantryItems = [
  {
    id: '1',
    name: 'Milk',
    quantity: 1,
    expiry: '2025-05-05',
    category: 'Dairy',
    lowStock: true
  },
  {
    id: '2',
    name: 'Eggs',
    quantity: 6,
    expiry: '2025-05-10',
    category: 'Dairy',
    lowStock: false
  },
  {
    id: '3',
    name: 'Bread',
    quantity: 3,
    expiry: '2025-05-04',
    category: 'Bakery',
    lowStock: false
  },
  {
    id: '4',
    name: 'Bananas',
    quantity: 2,
    expiry: '2025-05-03',
    category: 'Produce',
    lowStock: true
  },
  {
    id: '5',
    name: 'Pasta',
    quantity: 4,
    expiry: '2025-07-15',
    category: 'Pantry',
    lowStock: false
  },
  {
    id: '6',
    name: 'Tomato Sauce',
    quantity: 1,
    expiry: '2025-08-20',
    category: 'Pantry',
    lowStock: true
  }
];

const PantryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pantryItems, setPantryItems] = useState(mockPantryItems);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = pantryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Pantry</h1>
      </header>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gloop-text-muted" />
        <Input
          placeholder="Search items or categories..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {Object.keys(groupedItems).length > 0 ? (
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-medium mb-3">{category}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gloop-text-muted">
                          Expires: {new Date(item.expiry).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-medium">{item.quantity}</span>
                        {item.lowStock && (
                          <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                            Low
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 border rounded-lg bg-white">
          <p className="text-gloop-text-muted">No items found</p>
          <p className="text-sm mt-2">Try adjusting your search</p>
        </div>
      )}

      <NavBar />
    </div>
  );
};

export default PantryPage;
