import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

const BarcodeTestingGuide = () => {
  // List of real-world barcodes for testing
  const testBarcodes = [
    {
      upc: "049000006346",
      name: "Coca-Cola (12oz can)",
      knownInDb: true,
      notes: "Popular beverage, should be found in Open Food Facts"
    },
    {
      upc: "016000275553",
      name: "Cheerios Original Cereal",
      knownInDb: true,
      notes: "Common breakfast cereal"
    },
    {
      upc: "737628064502",
      name: "GT's Synergy Kombucha",
      knownInDb: true,
      notes: "Popular health drink"
    },
    {
      upc: "718037807930",
      name: "RX Bar Chocolate Sea Salt",
      knownInDb: true,
      notes: "Protein bar with minimal ingredients"
    },
    {
      upc: "896547002055",
      name: "Oatly Oat Milk",
      knownInDb: true,
      notes: "Plant-based milk alternative"
    },
    {
      upc: "000000000001",
      name: "Invalid Test Code 1",
      knownInDb: false,
      notes: "Purely for testing 'not found' state"
    },
    {
      upc: "123456789012",
      name: "Invalid Test Code 2",
      knownInDb: false,
      notes: "Another code to test handling of unknown products"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barcode Scanner Testing Guide</CardTitle>
        <CardDescription>
          Use these real-world UPC codes to test the barcode scanner functionality.
          Some are expected to be found in the database, others are test codes that should
          trigger the "not found" state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Method 1: Scan a physical product with these codes if available
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Method 2: Display a barcode image on another device and scan it
          </p>
          <p className="text-sm text-muted-foreground">
            Method 3: Use a barcode generator website to generate and scan codes
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UPC Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testBarcodes.map((barcode) => (
              <TableRow key={barcode.upc}>
                <TableCell className="font-mono">{barcode.upc}</TableCell>
                <TableCell>{barcode.name}</TableCell>
                <TableCell>
                  {barcode.knownInDb ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" /> Should be found
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <XCircle className="h-3 w-3 mr-1" /> Not in database
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{barcode.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium mb-1">Testing the Scanner:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click the "Scan Barcode" button to activate the scanner</li>
            <li>Position the barcode in the center of the scanner frame</li>
            <li>Hold steady until the barcode is detected</li>
            <li>Observe the status message that appears</li>
            <li>For "Database" codes, verify product details are loaded</li>
            <li>For "Not Found" codes, verify the scanner shows this correctly</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeTestingGuide; 