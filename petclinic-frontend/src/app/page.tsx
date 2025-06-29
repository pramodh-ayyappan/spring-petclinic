import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-neo-gray">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-neo-primary mb-4">
              PET CLINIC
            </h1>
            <div className="inline-block bg-neo-yellow border-4 border-neo-primary shadow-neo-lg px-6 py-3 transform -rotate-2">
              <p className="text-2xl font-bold text-neo-primary">NEOBRUTALISM EDITION</p>
            </div>
          </div>
          
          <p className="text-xl text-neo-dark-gray font-medium mb-12 max-w-2xl mx-auto">
            Manage your pet clinic with style! Bold, brutal, and beautiful interface for the modern veterinarian.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/owners">
              <Button variant="blue" size="lg">
                MANAGE OWNERS
              </Button>
            </Link>
            <Link href="/vets">
              <Button variant="purple" size="lg">
                VIEW VETS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-neo-primary text-center mb-16">
            FEATURES THAT BITE BACK
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="accent" className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <CardHeader>
                <div className="text-4xl mb-4">👥</div>
                <CardTitle>Owner Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  Keep track of pet owners with our brutally efficient management system. Add, edit, and organize with style.
                </p>
              </CardContent>
            </Card>

            <Card variant="blue" className="transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <CardHeader>
                <div className="text-4xl mb-4">🐾</div>
                <CardTitle>Pet Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  Comprehensive pet profiles with medical history, visits, and care information. Bold data for better care.
                </p>
              </CardContent>
            </Card>

            <Card variant="green" className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <CardHeader>
                <div className="text-4xl mb-4">👨‍⚕️</div>
                <CardTitle>Vet Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  Manage your veterinary team with specialties and schedules. Raw efficiency meets professional care.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-neo-primary">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-neo-secondary mb-16">
            BY THE NUMBERS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neo-yellow border-4 border-neo-secondary shadow-neo-lg p-8">
              <div className="text-4xl font-bold text-neo-primary mb-2">1000+</div>
              <div className="text-lg font-bold text-neo-primary">HAPPY PETS</div>
            </div>
            
            <div className="bg-neo-pink border-4 border-neo-secondary shadow-neo-lg p-8">
              <div className="text-4xl font-bold text-neo-secondary mb-2">50+</div>
              <div className="text-lg font-bold text-neo-secondary">VET SPECIALISTS</div>
            </div>
            
            <div className="bg-neo-cyan border-4 border-neo-secondary shadow-neo-lg p-8">
              <div className="text-4xl font-bold text-neo-primary mb-2">24/7</div>
              <div className="text-lg font-bold text-neo-primary">CARE AVAILABLE</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
