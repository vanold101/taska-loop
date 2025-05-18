// No need for next/image in this Vite project
import { ScannedItem } from "./BarcodeScannerButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, Leaf, Tag, ShoppingBag, Scale, CheckCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Determine if it's a product found in database or manually added
  const isProductFound = Boolean(product.name && (product.brand || hasOpenFoodFactsData));

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
    <ScrollArea className="max-h-[70vh] pr-4 -mr-4">
      <div className="space-y-4">
        {/* Barcode Detection Status */}
        <Alert className={isProductFound ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900"}>
          <div className="flex items-center gap-2">
            {isProductFound ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400" />
            )}
            <AlertDescription className="text-sm font-medium break-words">
              {isProductFound 
                ? "Product found in database" 
                : "Product not found in database - using barcode only"}
            </AlertDescription>
          </div>
          <div className="ml-6 text-xs mt-1 text-muted-foreground break-all">
            Barcode: {product.upc}
          </div>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product image */}
          {product.image && (
            <div className="relative w-full sm:w-1/3 h-40 sm:h-auto max-h-60 sm:max-h-none rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
              <img
                src={product.image}
                alt={product.name || "Product image"}
                className="object-contain w-full h-full"
              />
            </div>
          )}

          {/* Basic product details */}
          <div className="flex-1 space-y-3 min-w-0">
            <h1 className="text-xl font-semibold break-words">{product.name || "Unknown Product"}</h1>
            
            {product.brand && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Tag className="h-4 w-4 shrink-0" />
                <span className="truncate">{product.brand}</span>
              </div>
            )}
            
            {product.quantity && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Scale className="h-4 w-4 shrink-0" />
                <span className="truncate">{product.quantity}</span>
              </div>
            )}
            
            {product.stores && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span className="truncate">Found at: {product.stores}</span>
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
                <Info className="h-4 w-4 shrink-0" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nutri-Score */}
              {formattedNutriscore && nutriscoreData && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Nutri-Score</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-white font-bold h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${nutriscoreData.color}`}>
                      {formattedNutriscore}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300 break-words">
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
                    <span className={`text-white font-bold h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${ecoscoreData.color}`}>
                      {formattedEcoscore}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300 break-words">
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
                    <span className={`text-white font-bold h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                      product.novaGroup >= 3 ? "bg-orange-500" : "bg-green-500"
                    }`}>
                      {product.novaGroup}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300 break-words">
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
                <Leaf className="h-4 w-4 shrink-0" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm break-words whitespace-pre-wrap">{product.ingredients}</p>
            </CardContent>
          </Card>
        )}

        {/* Data source attribution - only show if product was found */}
        {isProductFound && (
          <Alert className="text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="break-words">
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
        )}
      </div>
    </ScrollArea>
  );
};

export default ProductDetails; 