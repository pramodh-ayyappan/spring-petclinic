import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            {/* Facets Cloud Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 p-4">
                <Image
                  src="/facets-cloud-icon.png"
                  alt="Facets Cloud"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
              PET CLINIC
            </h1>
            <div className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg mb-4">
              <p className="text-2xl font-semibold">Modern Pet Care Management</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span>Powered by</span>
              <Image
                src="/facets-cloud-icon.png"
                alt="Facets Cloud"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold">Facets Cloud</span>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto">
            Manage your pet clinic with ease! A clean, modern interface powered by cloud-native infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/owners">
              <Button size="lg" className="w-full sm:w-auto">
                Manage Owners
              </Button>
            </Link>
            <Link href="/vets">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Vets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">
            Features That Make a Difference
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="text-4xl mb-4">👥</div>
                <CardTitle>Owner Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep track of pet owners with our efficient management system. Add, edit, and organize with ease.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="text-4xl mb-4">🐾</div>
                <CardTitle>Pet Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive pet profiles with medical history, visits, and care information for better healthcare.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="text-4xl mb-4">👨‍⚕️</div>
                <CardTitle>Vet Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage your veterinary team with specialties and schedules. Professional care made simple.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-16">
            By the Numbers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-lg font-semibold text-muted-foreground">Happy Pets</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-lg font-semibold text-muted-foreground">Vet Specialists</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-lg font-semibold text-muted-foreground">Care Available</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/facets-cloud-icon.png"
              alt="Facets Cloud"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-foreground">
              Powered by Facets Cloud
            </span>
          </div>
          <p className="text-muted-foreground">
            Cloud-native infrastructure for modern applications
          </p>
        </div>
      </footer>
    </div>
  );
}
