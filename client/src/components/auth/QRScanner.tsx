import { useState, useEffect, useRef, useContext } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useLocation } from 'wouter';
import { UserContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setUser } = useContext(UserContext);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleQrCodeSuccess = async (decodedText: string) => {
    try {
      // Stop the scanner immediately to prevent multiple scans
      if (scannerRef.current) {
        await scannerRef.current.stop();
        setScanning(false);
      }

      // Parse the URL to extract the uid and token
      const url = new URL(decodedText);
      const uid = url.searchParams.get('uid');
      const token = url.searchParams.get('token');

      if (!uid || !token) {
        setErrorMessage('Invalid QR code. Try again.');
        return;
      }

      // Authenticate with the token
      const response = await apiRequest('POST', '/api/auth/qr-login', { uid, token });
      const userData = await response.json();
      
      setUser(userData);
      
      toast({
        title: 'QR Login Successful',
        description: 'Welcome back to Kid-Venture!',
      });
      
      // Redirect to dashboard
      setLocation('/dashboard');
    } catch (error) {
      console.error('QR login error:', error);
      setErrorMessage('Authentication failed. Please try again.');
      
      toast({
        title: 'QR Login Failed',
        description: 'Unable to verify your QR code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleQrCodeFailure = (error: string) => {
    // Don't show errors during scanning as the camera might still be searching
    console.error('QR scan error:', error);
  };

  const startScanner = async () => {
    setErrorMessage('');
    setScanning(true);
    
    try {
      if (!containerRef.current) return;
      
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: 'environment' }, // Use the back camera
        {
          fps: 10,
          qrbox: 250,
        },
        handleQrCodeSuccess,
        handleQrCodeFailure
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setErrorMessage('Could not access camera. Please ensure you have given permission to use the camera.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => {
          console.error('Error stopping scanner on unmount:', err);
        });
      }
    };
  }, []);

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">QR Code Login</h2>
        <p className="text-gray-600">Scan your QR code to login securely</p>
      </div>
      
      <div ref={containerRef} className="mb-4">
        <div 
          id="qr-reader" 
          className={`w-full h-64 bg-gray-100 rounded-md flex items-center justify-center ${scanning ? 'block' : 'hidden'}`}
        >
          {!scanning && <p className="text-gray-500">Camera will appear here</p>}
        </div>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {!scanning ? (
          <Button onClick={startScanner} className="w-full">
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="w-full">
            Stop Scanning
          </Button>
        )}
        
        <Button 
          variant="link" 
          onClick={() => setLocation('/login')} 
          className="mt-2"
        >
          Back to Login
        </Button>
      </div>
    </Card>
  );
}