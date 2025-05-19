import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProductFromOpenFoodFacts } from "@/services/OpenFoodFactsService";
import { ScannedItem } from "./BarcodeScannerButton";
import ProductDetails from "./ProductDetails";

// Sample UPC codes known to work with Open Food Facts API
const SAMPLE_UPCS = [
  { upc: "0041220576026", name: "Coca-Cola, 20 fl oz" },
  { upc: "0037600530927", name: "Cheerios Cereal" },
  { upc: "0038000138416", name: "Kellogg's Rice Krispies" },
  { upc: "0011110813428", name: "Folgers Classic Roast Coffee" },
  { upc: "0012000161155", name: "Coca-Cola Classic" },
  { upc: "0049000006346", name: "Pepsi-Cola" },
  { upc: "0051000012517", name: "Doritos Nacho Cheese" },
  { upc: "0028400090858", name: "Lay's Classic Potato Chips" },
  { upc: "0018894873213", name: "Nutella Hazelnut Spread" },
  { upc: "0034000040308", name: "Quaker Instant Oatmeal" }
];

const BarcodeScannerTests = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ScannedItem | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    totalTests: number;
    passedTests: number;
  }>({
    success: false,
    message: "",
    totalTests: 0,
    passedTests: 0
  });
  
  const testUPC = async (upc: string) => {
    setIsLoading(true);
    setCurrentProduct(null);
    
    try {
      console.log(`Testing UPC: ${upc}`);
      
      // Test OpenFoodFacts API
      const productDetails = await fetchProductFromOpenFoodFacts(upc);
      console.log("API response:", productDetails);
      
      if (productDetails) {
        // Product found
        const product: ScannedItem = {
          upc: upc,
          ...productDetails
        };
        
        setCurrentProduct(product);
        setTestResult({
          success: true,
          message: `✅ Success! Product "${productDetails.name}" found in database.`,
          totalTests: testResult.totalTests + 1,
          passedTests: testResult.passedTests + 1
        });
      } else {
        // Product not found
        setCurrentProduct({ upc: upc });
        setTestResult({
          success: false,
          message: `❌ Failed: No product found for UPC ${upc}`,
          totalTests: testResult.totalTests + 1,
          passedTests: testResult.passedTests
        });
      }
    } catch (error) {
      console.error("Error testing UPC:", error);
      setTestResult({
        success: false,
        message: `❌ Error: ${error}`,
        totalTests: testResult.totalTests + 1,
        passedTests: testResult.passedTests
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const runAllTests = async () => {
    let passed = 0;
    let total = SAMPLE_UPCS.length;
    
    setTestResult({
      success: false,
      message: "Starting tests...",
      totalTests: total,
      passedTests: 0
    });
    
    for (const sample of SAMPLE_UPCS) {
      setIsLoading(true);
      setTestResult(prev => ({
        ...prev,
        message: `Testing UPC: ${sample.upc} (${sample.name})...`
      }));
      
      try {
        const productDetails = await fetchProductFromOpenFoodFacts(sample.upc);
        if (productDetails) {
          passed++;
          setTestResult(prev => ({
            ...prev,
            passedTests: passed,
            message: `Testing UPC: ${sample.upc} - PASSED`
          }));
        } else {
          setTestResult(prev => ({
            ...prev,
            message: `Testing UPC: ${sample.upc} - FAILED`
          }));
        }
      } catch (error) {
        console.error(`Error testing ${sample.upc}:`, error);
      }
      
      await new Promise(r => setTimeout(r, 1000)); // Wait to avoid rate limiting
    }
    
    setIsLoading(false);
    setTestResult(prev => ({
      ...prev,
      success: passed > 0,
      message: `Tests completed: ${passed}/${total} successful`
    }));
  };
  
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Barcode Scanner API Test</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Status</CardTitle>
          <CardDescription>Click on a UPC code below to test the product lookup API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className={`text-lg ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.message}
            </p>
            {testResult.totalTests > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Tests: {testResult.passedTests}/{testResult.totalTests} passed
              </p>
            )}
          </div>
          
          <Button 
            onClick={runAllTests} 
            disabled={isLoading} 
            className="mb-4 w-full"
          >
            {isLoading ? "Testing..." : "Run All Tests"}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_UPCS.map((sample) => (
              <Button
                key={sample.upc}
                variant="outline"
                onClick={() => testUPC(sample.upc)}
                disabled={isLoading}
                className="justify-start font-mono"
              >
                <div className="flex flex-col items-start">
                  <span className="font-mono">{sample.upc}</span>
                  <span className="text-xs text-muted-foreground">{sample.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {currentProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              UPC: {currentProduct.upc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductDetails product={currentProduct} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScannerTests; 