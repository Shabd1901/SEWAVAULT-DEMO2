import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Camera, CheckCircle, ArrowLeft } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import PhotoCapture from "@/components/photo-capture";
import ItemChecklist from "@/components/item-checklist";
import { apiRequest } from "@/lib/queryClient";
import type { TokenRecord, ItemQuantity } from "@shared/schema";

type DepositPhase = "scanning" | "form";

export default function Deposit() {
  const [phase, setPhase] = useState<DepositPhase>("scanning");
  const [currentToken, setCurrentToken] = useState<TokenRecord | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [sangatPhoto, setSangatPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<ItemQuantity[]>([]);
  const [others, setOthers] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateTokenMutation = useMutation({
    mutationFn: async (tokenNumber: number) => {
      const response = await apiRequest("GET", `/api/tokens/${tokenNumber}/validate`);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentToken(data.token);
      toast({
        title: "Token Validated",
        description: `Token ${data.token.tokenNumber} is available for deposit`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message.includes("409") 
        ? "Token is already in use" 
        : error.message.includes("404")
        ? "Token not found in system"
        : "Failed to validate token";
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage,
      });
    },
  });

  const createDepositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      const response = await apiRequest("POST", "/api/deposits", depositData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Completed",
        description: "Items have been successfully deposited",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/stats"] });
      // Reset form
      setPhase("scanning");
      setCurrentToken(null);
      setSangatPhoto(null);
      setItems([]);
      setOthers("");
      setManualInput("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Deposit Failed",
        description: "Failed to complete deposit. Please try again.",
      });
    },
  });

  const handleManualValidation = () => {
    const tokenNumber = parseInt(manualInput.trim());
    if (!tokenNumber || isNaN(tokenNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid token number",
      });
      return;
    }
    validateTokenMutation.mutate(tokenNumber);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Extract and validate complete barcode format ABX_1001_IFUD7D_RSSB
    const match = barcode.match(/^ABX_(\d+)_([A-Z0-9]+)_RSSB$/);
    if (match) {
      const tokenNumber = parseInt(match[1]);
      const secret = match[2];
      
      // Validate against known tokens (client-side pre-check)
      const validTokens = [
        { token: 1001, secret: "IFUD7D" }, { token: 1002, secret: "FIZD0V" }, { token: 1003, secret: "YQVP14" },
        { token: 1004, secret: "Z55BWY" }, { token: 1005, secret: "CEJ88E" }, { token: 1006, secret: "CKLK5K" },
        { token: 1007, secret: "RFQSZI" }, { token: 1008, secret: "XM4543" }, { token: 1009, secret: "244YOE" },
        { token: 1010, secret: "1AC4NU" }, { token: 1011, secret: "WUNLKM" }, { token: 1012, secret: "PNVMTV" },
        { token: 1013, secret: "YDSARN" }, { token: 1014, secret: "PT6UHX" }, { token: 1015, secret: "YLEYDO" },
        { token: 1016, secret: "DFS7FL" }, { token: 1017, secret: "PEUSRX" }, { token: 1018, secret: "9284O3" },
        { token: 1019, secret: "95FKXI" }, { token: 1020, secret: "ORD1ED" }
      ];
      
      const isValidToken = validTokens.some(t => t.token === tokenNumber && t.secret === secret);
      
      if (isValidToken) {
        validateTokenMutation.mutate(tokenNumber);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Token",
          description: `Token ${tokenNumber} with secret ${secret} is not registered in the system`,
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Barcode Format",
        description: "Expected format: ABX_XXXX_SECRET_RSSB",
      });
    }
  };

  const handleSubmitDeposit = () => {
    if (!currentToken) return;
    
    if (!sangatPhoto) {
      toast({
        variant: "destructive",
        title: "Photo Required",
        description: "Sangat photo is mandatory for deposit",
      });
      return;
    }

    const hasItems = items.some(item => item.quantity > 0) || others.trim();
    if (!hasItems) {
      toast({
        variant: "destructive",
        title: "Items Required",
        description: "Please select at least one item or specify others",
      });
      return;
    }

    createDepositMutation.mutate({
      tokenNumber: currentToken.tokenNumber,
      sangatPhoto,
      items: items.filter(item => item.quantity > 0),
      others: others.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Deposit Items</h2>
          <p className="text-gray-600">Scan token and register items</p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft size={20} />
          </Button>
        </Link>
      </div>

      {phase === "scanning" && (
        <div className="space-y-6">
          {/* Barcode Scanner */}
          <Card className="bg-surface shadow-md overflow-hidden">
            <CardContent className="p-0">
              <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
              <div className="p-4 text-center">
                <p className="text-gray-600">Position barcode within the frame</p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card className="bg-surface shadow-md">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Manual Token Entry</h3>
              <Input
                type="number"
                placeholder="Enter token number (e.g., 1001)"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="mb-3"
                data-testid="input-manual-token"
              />
              <Button
                onClick={handleManualValidation}
                disabled={validateTokenMutation.isPending}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                data-testid="button-validate-token"
              >
                {validateTokenMutation.isPending ? "Validating..." : "Validate Token"}
              </Button>
            </CardContent>
          </Card>

          {/* Scan Result */}
          {currentToken && (
            <Card className="bg-surface shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="text-success" size={20} />
                  <h3 className="font-medium text-gray-800">Token Recognized</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Token <span className="font-medium">{currentToken.tokenNumber}</span> is available
                </p>
                <Button
                  onClick={() => setPhase("form")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-proceed-deposit"
                >
                  Proceed to Deposit Form
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {phase === "form" && (
        <div className="space-y-6">
          {/* Photo Capture */}
          <Card className="bg-surface shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="text-primary mr-2" size={20} />
                Sangat Photo (Required)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoCapture
                onPhotoCapture={setSangatPhoto}
                capturedPhoto={sangatPhoto}
              />
            </CardContent>
          </Card>

          {/* Items Checklist */}
          <Card className="bg-surface shadow-md">
            <CardHeader>
              <CardTitle>Items to Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemChecklist
                items={items}
                onChange={setItems}
                others={others}
                onOthersChange={setOthers}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitDeposit}
            disabled={createDepositMutation.isPending}
            className="w-full bg-success hover:bg-success/90 text-success-foreground py-4 px-6 rounded-lg shadow-md font-medium text-lg h-auto"
            data-testid="button-submit-deposit"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>{createDepositMutation.isPending ? "Completing..." : "Complete Deposit"}</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setPhase("scanning")}
            className="w-full"
            data-testid="button-back-to-scanning"
          >
            Back to Scanning
          </Button>
        </div>
      )}
    </div>
  );
}
