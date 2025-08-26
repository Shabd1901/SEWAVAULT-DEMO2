import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export default function Home() {
  const { data: stats } = useQuery<{ inUse: number; available: number }>({
    queryKey: ["/api/tokens/stats"],
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Token Management</h2>
        <p className="text-gray-600">Manage electronic item deposits for Sangat</p>
      </div>

      <div className="space-y-4">
        <Link href="/deposit">
          <Button 
            className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-colors h-auto"
            data-testid="button-deposit"
          >
            <div className="flex items-center justify-center space-x-3">
              <Download size={24} />
              <span className="text-lg font-medium">Deposit Items</span>
            </div>
          </Button>
        </Link>
        
        <Link href="/return">
          <Button 
            className="w-full bg-success hover:bg-success/90 text-success-foreground py-4 px-6 rounded-lg shadow-md transition-colors h-auto"
            data-testid="button-return"
          >
            <div className="flex items-center justify-center space-x-3">
              <Upload size={24} />
              <span className="text-lg font-medium">Return Items</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Status Overview */}
      <Card className="bg-surface shadow-md mt-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">System Status</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary" data-testid="text-tokens-in-use">
                {stats?.inUse || 0}
              </div>
              <div className="text-sm text-gray-600">Tokens in Use</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-success" data-testid="text-tokens-available">
                {stats?.available || 0}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
