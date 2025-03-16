import WaitlistForm from "@/components/ui/waitlist-form";

export default function Waitlist() {
  return (
    <section id="waitlist" className="py-16 bg-primary bg-opacity-5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-3xl text-gray-800 mb-4">
                Join Our Waitlist
              </h2>
              <p className="text-gray-600">
                Be the first to experience KidVenture when we launch. Sign up below to secure your spot!
              </p>
            </div>
            
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
