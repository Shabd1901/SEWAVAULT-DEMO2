import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { QrCode, User, List, Check, ArrowLeft, Plus } from "lucide-react";
import BarcodeScanner from "@/components/barcode-scanner";
import { apiRequest } from "@/lib/queryClient";
import type { TokenRecord } from "@shared/schema";
import { ITEM_TYPES } from "@shared/schema";

type ReturnPhase = "scanning" | "details";

const getItemIcon = (itemName: string) => {
  const itemType = ITEM_TYPES.find(type => type.name.toLowerCase() === itemName.toLowerCase());
  return itemType?.icon || "cube";
};

export default function Return() {
  const [phase, setPhase] = useState<ReturnPhase>("scanning");
  const [currentToken, setCurrentToken] = useState<TokenRecord | null>(null);
  const [manualInput, setManualInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateTokenMutation = useMutation({
    mutationFn: async (tokenNumber: number) => {
      const response = await apiRequest("GET", `/api/tokens/${tokenNumber}`);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentToken(data);
      setPhase("details");
    },
    onError: (error: any) => {
      const errorMessage = error.message.includes("404") 
        ? "Token is not currently in use"
        : "Failed to validate token";
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage,
      });
    },
  });

  const confirmReturnMutation = useMutation({
    mutationFn: async (tokenNumber: number) => {
      const response = await apiRequest("DELETE", `/api/deposits/${tokenNumber}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Return Completed",
        description: "Items have been returned and token cleared",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/stats"] });
      // Reset form
      setPhase("scanning");
      setCurrentToken(null);
      setManualInput("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Return Failed",
        description: "Failed to complete return. Please try again.",
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
    // Extract token number from barcode format ABX_1001_IFUD7D_RSSB
    const match = barcode.match(/ABX_(\d+)_/);
    if (match) {
      const tokenNumber = parseInt(match[1]);
      validateTokenMutation.mutate(tokenNumber);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Barcode",
        description: "Barcode format not recognized",
      });
    }
  };

  const handleConfirmReturn = () => {
    if (!currentToken) return;
    confirmReturnMutation.mutate(currentToken.tokenNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Return Items</h2>
          <p className="text-gray-600">Scan token to view deposited items</p>
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
                <p className="text-gray-600">Scan token to retrieve items</p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card className="bg-surface shadow-md">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Manual Token Entry</h3>
              <Input
                type="number"
                placeholder="Enter token number"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="mb-3"
                data-testid="input-return-manual-token"
              />
              <Button
                onClick={handleManualValidation}
                disabled={validateTokenMutation.isPending}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                data-testid="button-validate-return-token"
              >
                {validateTokenMutation.isPending ? "Checking..." : "Check Token"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {phase === "details" && currentToken && currentToken.deposit && (
        <div className="space-y-6">
          {/* Token Info */}
          <Card className="bg-surface shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <QrCode className="text-primary" size={20} />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Token <span data-testid="text-return-token-number">{currentToken.tokenNumber}</span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    In use since: {new Date(currentToken.deposit.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sangat Photo */}
          <Card className="bg-surface shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="text-primary mr-2" size={20} />
                Sangat Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg h-48 overflow-hidden">
                <img
                  src={currentToken.deposit.sangatPhoto}
                  alt="Stored sangat photo"
                  className="w-full h-full object-cover"
                  data-testid="img-sangat-photo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Deposited Items */}
          <Card className="bg-surface shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="text-primary mr-2" size={20} />
                Deposited Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" data-testid="list-deposited-items">
                {currentToken.deposit.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-primary">{item.quantity}</span>
                  </div>
                ))}
              </div>
              
              {currentToken.deposit.others && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Plus className="text-primary" size={16} />
                    <span className="font-medium">Others:</span>
                    <span className="text-gray-700" data-testid="text-other-items">
                      {currentToken.deposit.others}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Action */}
          <Button
            onClick={handleConfirmReturn}
            disabled={confirmReturnMutation.isPending}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground py-4 px-6 rounded-lg shadow-md font-medium text-lg h-auto"
            data-testid="button-confirm-return"
          >
            <div className="flex items-center space-x-2">
              <Check size={20} />
              <span>{confirmReturnMutation.isPending ? "Processing..." : "Confirm Return & Clear Token"}</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setPhase("scanning")}
            className="w-full"
            data-testid="button-back-to-return-scanning"
          >
            Back to Scanning
          </Button>
        </div>
      )}
    </div>
  );
}
