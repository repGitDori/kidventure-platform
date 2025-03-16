import QRScanner from "@/components/auth/QRScanner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function QRLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M6 14c0-3.5 2.5-6.5 6-6.5s6 3 6 6.5M8 15c-1.5 0-2.25 0.5-3 2c0.75-0.5 1.5-0.5 3 0c1.5 0.5 3 0.5 4.5 0c1.5-0.5 2.25-0.5 3 0c-0.75-1.5-1.5-2-3-2M7 10l-1.5-1M17 10l1.5-1M9 8.5l1 1M15 8.5l-1 1" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Kid-Venture</h1>
          <p className="text-gray-600 mt-1">Secure QR Code Login</p>
        </div>
        
        <QRScanner />
        
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center text-sm text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}