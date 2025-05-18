import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchProductFromOpenFoodFacts } from "@/services/OpenFoodFactsService";
import { fetchWithProxy } from "@/services/ProxyService";
import { ScannedItem } from "@/components/BarcodeScannerButton";

// Add proxy support for UPC lookups to avoid CORS issues
const PROXY_ENABLED = true; // Set to true if you're experiencing CORS issues
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

// The same fetchFromUPCItemDB function from BarcodeScannerButton
async function fetchFromUPCItemDB(upc: string): Promise<Omit<ScannedItem, 'upc'> | null> {
  try {
    console.log(`[UPCItemDB] Fetching data for barcode: ${upc}`);
    
    // Use our proxy service instead of direct fetch
    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`;
    console.log(`[UPCItemDB] API URL: ${url}`);
    
    // Try with our new proxy service, using allOrigins as preferred strategy
    const data = await fetchWithProxy<any>(url, {}, 'allOrigins');
    
    if (!data) {
      console.error(`[UPCItemDB] Failed to fetch data`);
      return null;
    }
    
    console.log(`[UPCItemDB] API response code: ${data.code}`);
    
    if (data.code === "OK" && data.items && data.items.length > 0) {
      const item = data.items[0];
      console.log(`[UPCItemDB] Product found: ${item.title || 'Unknown title'}`);
      
      const result = {
        name: item.title,
        brand: item.brand,
        image: item.images && item.images.length > 0 ? item.images[0] : undefined,
      };
      
      console.log(`[UPCItemDB] Successfully extracted product details:`, result);
      return result;
    }
    
    console.log("[UPCItemDB] No items found or error in response", data);
    return null;
  } catch (error) {
    console.error("[UPCItemDB] Error fetching from UPCItemDB:", error);
    return null;
  }
}

const testBarcodes = [
  {
    upc: "049000006346",
    name: "Coca-Cola (12oz can)",
    notes: "Popular beverage, should be found in Open Food Facts"
  },
  {
    upc: "016000275553",
    name: "Cheerios Original Cereal",
    notes: "Common breakfast cereal"
  },
  {
    upc: "737628064502",
    name: "GT's Synergy Kombucha",
    notes: "Popular health drink"
  },
  {
    upc: "000000000001",
    name: "Invalid Test Code",
    notes: "Should not be found in any database"
  }
];

const ApiTestPage = () => {
  const [customBarcode, setCustomBarcode] = useState("");
  const [testResults, setTestResults] = useState<Array<{
    upc: string;
    openFoodFacts: boolean;
    upcItemDb: boolean;
    details?: any;
  }>>([]);
  const [loading, setLoading] = useState(false);
  
  const testBarcode = async (upc: string) => {
    setLoading(true);
    console.log(`Testing barcode: ${upc}`);
    
    const result = {
      upc,
      openFoodFacts: false,
      upcItemDb: false,
      details: null as any
    };
    
    // Test OpenFoodFacts API
    try {
      const offResult = await fetchProductFromOpenFoodFacts(upc);
      if (offResult) {
        result.openFoodFacts = true;
        result.details = { ...offResult, source: 'Open Food Facts' };
        console.log(`Open Food Facts result for ${upc}:`, offResult);
      }
    } catch (error) {
      console.error(`Error testing Open Food Facts for ${upc}:`, error);
    }
    
    // If OFF failed, test UPCItemDB
    if (!result.details) {
      try {
        const upcDbResult = await fetchFromUPCItemDB(upc);
        if (upcDbResult) {
          result.upcItemDb = true;
          result.details = { ...upcDbResult, source: 'UPC Item DB' };
          console.log(`UPC Item DB result for ${upc}:`, upcDbResult);
        }
      } catch (error) {
        console.error(`Error testing UPC Item DB for ${upc}:`, error);
      }
    }
    
    // Add to results
    setTestResults(prev => [result, ...prev]);
    setLoading(false);
    return result;
  };
  
  const testAllBarcodes = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (const barcode of testBarcodes) {
      await testBarcode(barcode.upc);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Barcode API Test</h1>
      
      <div className="mb-8 grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Custom Barcode</CardTitle>
            <CardDescription>Enter a barcode to test the API directly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter barcode (UPC/EAN)"
                value={customBarcode}
                onChange={(e) => setCustomBarcode(e.target.value)}
              />
              <Button 
                onClick={() => testBarcode(customBarcode)} 
                disabled={!customBarcode || loading}
              >
                Test
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Predefined Barcodes</CardTitle>
            <CardDescription>Test a set of known barcodes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testAllBarcodes} 
              className="w-full"
              disabled={loading}
            >
              Test All Sample Barcodes
            </Button>
            
            <div className="mt-4 space-y-2">
              {testBarcodes.map((barcode) => (
                <div key={barcode.upc} className="flex justify-between items-center border p-2 rounded">
                  <div>
                    <div className="font-mono text-sm">{barcode.upc}</div>
                    <div className="text-sm text-muted-foreground">{barcode.name}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testBarcode(barcode.upc)}
                    disabled={loading}
                  >
                    Test
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results from API calls</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Open Food Facts</TableHead>
                  <TableHead>UPC Item DB</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((result, index) => (
                  <TableRow key={`${result.upc}-${index}`}>
                    <TableCell className="font-mono">{result.upc}</TableCell>
                    <TableCell>
                      {result.openFoodFacts ? (
                        <span className="text-green-600">✓ Found</span>
                      ) : (
                        <span className="text-red-600">✗ Not Found</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.upcItemDb ? (
                        <span className="text-green-600">✓ Found</span>
                      ) : (
                        <span className="text-red-600">✗ Not Found</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.details ? (
                        <div className="text-sm">
                          <div><span className="font-semibold">Name:</span> {result.details.name}</div>
                          <div><span className="font-semibold">Brand:</span> {result.details.brand || 'Unknown'}</div>
                          <div className="text-xs text-green-700">{result.details.source}</div>
                        </div>
                      ) : (
                        <span className="text-red-600">Not found in any database</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>This tool directly tests the barcode API connections without going through the scanner interface.</p>
        <p>Check the browser console for detailed API responses and any error messages.</p>
      </div>
    </div>
  );
};

export default ApiTestPage; 