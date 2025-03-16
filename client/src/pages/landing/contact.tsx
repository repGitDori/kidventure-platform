import ContactForm from "@/components/ui/contact-form";
import { Mail, Phone, Twitter, Youtube, Facebook, Instagram } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-16 bg-gray-100 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-800 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600">
            Have questions? We'd love to hear from you!
          </p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 bg-primary text-white">
              <h3 className="font-heading font-bold text-2xl mb-4">
                Contact Information
              </h3>
              <p className="mb-6">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 mr-3 mt-0.5" />
                  <span>hello@kidventure.example.com</span>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 mr-3 mt-0.5" />
                  <span>(555) 123-4567</span>
                </div>
              </div>
              
              <div className="mt-12">
                <h4 className="font-heading font-semibold text-lg mb-4">
                  Follow Us
                </h4>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
