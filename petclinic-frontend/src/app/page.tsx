import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-facets opacity-5"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            {/* Facets Cloud Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-xl gradient-facets p-1">
                <div className="w-full h-full bg-background rounded-lg flex items-center justify-center p-3">
                  <Image
                    src="/facets-cloud-icon.png"
                    alt="Facets Cloud"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
              PET CLINIC
            </h1>
            <div className="inline-block gradient-facets text-white px-6 py-3 rounded-lg mb-4 shadow-lg">
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
              <span className="font-semibold text-facets-teal">Facets Cloud</span>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto">
            Manage your pet clinic with ease! A clean, modern interface powered by cloud-native infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/owners">
              <Button size="lg" className="w-full sm:w-auto bg-facets-teal hover:bg-facets-teal/90 text-white">
                Manage Owners
              </Button>
            </Link>
            <Link href="/vets">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-facets-purple text-facets-purple hover:bg-facets-purple hover:text-white">
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
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-facets-teal">
              <CardHeader>
                <div className="text-4xl mb-4">👥</div>
                <CardTitle className="text-facets-teal">Owner Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep track of pet owners with our efficient management system. Add, edit, and organize with ease.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-facets-purple">
              <CardHeader>
                <div className="text-4xl mb-4">🐾</div>
                <CardTitle className="text-facets-purple">Pet Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive pet profiles with medical history, visits, and care information for better healthcare.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-facets-teal">
              <CardHeader>
                <div className="text-4xl mb-4">👨‍⚕️</div>
                <CardTitle className="text-facets-teal">Vet Directory</CardTitle>
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
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-16">
            By the Numbers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-facets-teal opacity-5"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="text-4xl font-bold text-facets-teal mb-2">1000+</div>
                <div className="text-lg font-semibold text-muted-foreground">Happy Pets</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-facets-purple opacity-5"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="text-4xl font-bold text-facets-purple mb-2">50+</div>
                <div className="text-lg font-semibold text-muted-foreground">Vet Specialists</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 gradient-facets opacity-10"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="text-4xl font-bold text-facets-teal mb-2">24/7</div>
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
            <div className="p-2 gradient-facets rounded-lg">
              <Image
                src="/facets-cloud-icon.png"
                alt="Facets Cloud"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Powered by <span className="text-facets-teal font-bold">Facets Cloud</span>
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
