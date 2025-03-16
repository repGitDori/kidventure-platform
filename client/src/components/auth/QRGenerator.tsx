import { useState, useContext } from 'react';
import QRCode from 'react-qr-code';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';

export default function QRGenerator() {
  const { user, setUser } = useContext(UserContext);
  const [qrEnabled, setQrEnabled] = useState(user?.qrEnabled || false);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/generate-qr-token', {});
      const data = await response.json();
      
      if (data.qrUrl) {
        setQrUrl(data.qrUrl);
        setQrEnabled(true);
        
        // Update user context with new QR enabled status
        if (user) {
          setUser({
            ...user,
            qrEnabled: true
          });
        }
        
        toast({
          title: 'QR Code Generated',
          description: 'Your secure QR code has been generated successfully.',
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Failed to Generate QR Code',
        description: 'There was an error creating your QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const disableQRCode = async () => {
    setLoading(true);
    try {
      await apiRequest('POST', '/api/auth/disable-qr', {});
      
      setQrUrl('');
      setQrEnabled(false);
      
      // Update user context with new QR disabled status
      if (user) {
        setUser({
          ...user,
          qrEnabled: false
        });
      }
      
      toast({
        title: 'QR Code Disabled',
        description: 'Your QR code login has been disabled successfully.',
      });
    } catch (error) {
      console.error('Error disabling QR code:', error);
      toast({
        title: 'Failed to Disable QR Code',
        description: 'There was an error disabling your QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (checked: boolean) => {
    if (checked) {
      generateQRCode();
    } else {
      disableQRCode();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">QR Code Authentication</h3>
      <p className="text-gray-600 mb-6">
        Enable QR code for quick and secure login to your account.
      </p>
      
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <Label htmlFor="qr-enabled">QR Login</Label>
          <div className="text-sm text-gray-500">
            {qrEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        <Switch
          id="qr-enabled"
          checked={qrEnabled}
          onCheckedChange={handleToggleChange}
          disabled={loading}
        />
      </div>
      
      {qrUrl && (
        <div className="mt-4 flex flex-col items-center">
          <div className="bg-white p-4 rounded-md mb-3 qr-container">
            <QRCode value={qrUrl} size={200} />
          </div>
          <p className="text-sm text-gray-500 text-center mb-3">
            This QR code gives access to your account. Keep it secure and don't share it.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              // Create a temporary link element and trigger a download
              const link = document.createElement('a');
              // We need to create a downloadable version of the QR code
              const svg = document.querySelector(".qr-container svg"); 
              if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
                const svgUrl = URL.createObjectURL(svgBlob);
                link.href = svgUrl;
                link.download = 'kidventure-qr-code.svg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(svgUrl);
                
                toast({
                  title: 'QR Code Downloaded',
                  description: 'Your QR code has been downloaded.',
                });
              }
            }}
            size="sm"
          >
            Download QR Code
          </Button>
        </div>
      )}
    </Card>
  );
}