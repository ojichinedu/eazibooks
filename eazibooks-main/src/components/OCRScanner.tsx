import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  Camera, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExtractedData {
  documentType?: string;
  vendorName?: string;
  vendorAddress?: string;
  vendorGSTIN?: string;
  invoiceNumber?: string;
  date?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
  }>;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  paymentMethod?: string;
  category?: string;
  confidence?: string;
}

export function OCRScanner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [edgeFunctionsAvailable] = useState(false); // Set to true when Edge Functions are deployed
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Only process if Edge Functions are available
    if (edgeFunctionsAvailable) {
      // Convert to base64 for API
      const base64Reader = new FileReader();
      base64Reader.onload = async (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        await processImage(base64String);
      };
      base64Reader.readAsDataURL(file);
    } else {
      toast.info('Image uploaded. Deploy Edge Functions to enable AI processing.');
    }
  };

  const processImage = async (imageBase64: string) => {
    setIsProcessing(true);
    setExtractedData(null);

    try {
      // TODO: Uncomment when Edge Functions are deployed
      // const { data, error } = await supabase.functions.invoke('ocr-processor', {
      //   body: { image: imageBase64 }
      // });
      // 
      // if (error) throw error;
      // setExtractedData(data);
      // toast.success('Document processed successfully!');
      
      // For now, show a helpful message
      toast.info('Edge Functions deployment required. See documentation for setup instructions.');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to process document. Please check Edge Functions configuration.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const exportToAccounting = () => {
    if (!extractedData) return;
    
    // This would integrate with your accounting module
    toast.success('Data exported to accounting module');
    console.log('Export to accounting:', extractedData);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>AI-Powered OCR Scanner</h1>
        <p className="text-muted-foreground">
          Scan invoices and receipts with automatic data extraction and categorization
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong>Setup Required:</strong> This OCR scanner requires Supabase Edge Functions with OpenAI API integration.
          {' '}The feature will be available once Edge Functions are deployed.
          {' '}<a href="#" className="underline">View setup guide</a>
        </AlertDescription>
      </Alert>

      {!edgeFunctionsAvailable && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <strong>Feature Unavailable:</strong> Edge Functions are not deployed. 
            You can upload images to preview them, but AI extraction will not work until Edge Functions are configured.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3>Upload Document</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <Button 
                    onClick={handleUploadClick}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Different Image
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Upload Invoice or Receipt</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG, or PDF format
                    </p>
                  </div>
                  <Button 
                    onClick={handleUploadClick}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Processing with AI...
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Results Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Extracted Data</h3>
              {extractedData && (
                <Badge 
                  variant={
                    extractedData.confidence === 'high' ? 'default' : 
                    extractedData.confidence === 'medium' ? 'secondary' : 
                    'outline'
                  }
                >
                  {extractedData.confidence || 'unknown'} confidence
                </Badge>
              )}
            </div>

            {!extractedData && !isProcessing && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Upload a document to see extracted data</p>
              </div>
            )}

            {extractedData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Document Type</Label>
                    <p className="font-medium capitalize">{extractedData.documentType || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p className="font-medium">{extractedData.date || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Invoice Number</Label>
                    <p className="font-medium">{extractedData.invoiceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Badge variant="secondary">{extractedData.category || 'Uncategorized'}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Vendor Information</Label>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                    <p className="font-medium">{extractedData.vendorName || 'N/A'}</p>
                    {extractedData.vendorGSTIN && (
                      <p className="text-sm text-muted-foreground">
                        GSTIN: {extractedData.vendorGSTIN}
                      </p>
                    )}
                    {extractedData.vendorAddress && (
                      <p className="text-sm text-muted-foreground">
                        {extractedData.vendorAddress}
                      </p>
                    )}
                  </div>
                </div>

                {extractedData.items && extractedData.items.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Items</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 font-medium">Description</th>
                            <th className="text-right p-2 font-medium">Qty</th>
                            <th className="text-right p-2 font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractedData.items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{item.description}</td>
                              <td className="p-2 text-right">{item.quantity}</td>
                              <td className="p-2 text-right">
                                {extractedData.currency || '₹'} {item.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {extractedData.currency || '₹'} {extractedData.subtotal?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {extractedData.currency || '₹'} {extractedData.taxAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">
                      {extractedData.currency || '₹'} {extractedData.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={exportToAccounting}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Export to Accounting
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleUploadClick}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card className="p-6">
        <h3 className="mb-4">Recent Scans</h3>
        <p className="text-sm text-muted-foreground">
          View and manage your previously scanned documents
        </p>
        {/* This could be expanded to show a list of recent scans from the backend */}
      </Card>
    </div>
  );
}