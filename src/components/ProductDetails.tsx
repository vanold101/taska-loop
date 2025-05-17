// No need for next/image in this Vite project
import { ScannedItem } from "./BarcodeScannerButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, Leaf, Tag, ShoppingBag, Scale } from "lucide-react";

interface ProductDetailsProps {
  product: ScannedItem;
}

// Helper to map nutriscore to color and description
const nutriscoreInfo = {
  a: { color: "bg-green-500", text: "Excellent nutritional quality" },
  b: { color: "bg-lime-500", text: "Good nutritional quality" },
  c: { color: "bg-yellow-500", text: "Moderate nutritional quality" },
  d: { color: "bg-orange-500", text: "Low nutritional quality" },
  e: { color: "bg-red-500", text: "Poor nutritional quality" },
};

// Helper to map ecoscore to color and description
const ecoscoreInfo = {
  a: { color: "bg-green-500", text: "Very low environmental impact" },
  b: { color: "bg-lime-500", text: "Low environmental impact" },
  c: { color: "bg-yellow-500", text: "Moderate environmental impact" },
  d: { color: "bg-orange-500", text: "High environmental impact" },
  e: { color: "bg-red-500", text: "Very high environmental impact" },
};

// Helper to map NOVA group to description
const novaInfo = {
  1: "Unprocessed or minimally processed foods",
  2: "Processed culinary ingredients",
  3: "Processed foods",
  4: "Ultra-processed foods",
};

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const hasOpenFoodFactsData = Boolean(
    product.nutriscore || product.ecoscore || product.novaGroup
  );

  // Format the nutriscore for display (e.g., "a" to "A")
  const formattedNutriscore = product.nutriscore?.toUpperCase();
  const nutriscoreData = formattedNutriscore
    ? nutriscoreInfo[formattedNutriscore.toLowerCase() as keyof typeof nutriscoreInfo]
    : undefined;

  // Format the ecoscore for display (e.g., "a" to "A")
  const formattedEcoscore = product.ecoscore?.toUpperCase();
  const ecoscoreData = formattedEcoscore
    ? ecoscoreInfo[formattedEcoscore.toLowerCase() as keyof typeof ecoscoreInfo]
    : undefined;

  // Get NOVA group description
  const novaDescription = product.novaGroup
    ? novaInfo[product.novaGroup as keyof typeof novaInfo]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Product image */}
        {product.image && (
          <div className="relative w-full md:w-1/3 aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={product.image}
              alt={product.name || "Product image"}
              className="object-contain w-full h-full"
            />
          </div>
        )}

        {/* Basic product details */}
        <div className="flex-1 space-y-3">
          <h1 className="text-xl font-semibold">{product.name || "Unknown Product"}</h1>
          
          {product.brand && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Tag className="h-4 w-4" />
              <span>{product.brand}</span>
            </div>
          )}
          
          {product.quantity && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Scale className="h-4 w-4" />
              <span>{product.quantity}</span>
            </div>
          )}
          
          {product.upc && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Barcode: {product.upc}
            </div>
          )}
          
          {product.stores && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <ShoppingBag className="h-4 w-4" />
              <span>Found at: {product.stores}</span>
            </div>
          )}
          
          {product.category && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.category.split(',').map((cat, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cat.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nutritional information */}
      {hasOpenFoodFactsData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nutri-Score */}
            {formattedNutriscore && nutriscoreData && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Nutri-Score</div>
                <div className="flex items-center gap-2">
                  <span className={`text-white font-bold h-8 w-8 rounded-full flex items-center justify-center ${nutriscoreData.color}`}>
                    {formattedNutriscore}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {nutriscoreData.text}
                  </span>
                </div>
              </div>
            )}
            
            {/* Eco-Score */}
            {formattedEcoscore && ecoscoreData && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Eco-Score</div>
                <div className="flex items-center gap-2">
                  <span className={`text-white font-bold h-8 w-8 rounded-full flex items-center justify-center ${ecoscoreData.color}`}>
                    {formattedEcoscore}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {ecoscoreData.text}
                  </span>
                </div>
              </div>
            )}
            
            {/* NOVA Group */}
            {product.novaGroup && novaDescription && (
              <div className="space-y-1">
                <div className="text-sm font-medium">NOVA Group</div>
                <div className="flex items-center gap-2">
                  <span className={`text-white font-bold h-8 w-8 rounded-full flex items-center justify-center ${
                    product.novaGroup >= 3 ? "bg-orange-500" : "bg-green-500"
                  }`}>
                    {product.novaGroup}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {novaDescription}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ingredients */}
      {product.ingredients && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{product.ingredients}</p>
          </CardContent>
        </Card>
      )}

      {/* Data source attribution */}
      <Alert className="text-xs">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Product data provided by{" "}
          <a 
            href="https://openfoodfacts.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Open Food Facts
          </a>
          , available under the{" "}
          <a 
            href="https://opendatacommons.org/licenses/odbl/1-0/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Open Database License
          </a>
          .
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProductDetails; 