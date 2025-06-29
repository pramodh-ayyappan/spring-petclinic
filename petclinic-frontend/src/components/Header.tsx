import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg gradient-facets p-1">
              <div className="w-full h-full bg-background rounded-md flex items-center justify-center p-1">
                <Image
                  src="/facets-cloud-icon.png"
                  alt="Facets Cloud"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PetClinic</h1>
              <p className="text-xs text-facets-teal font-medium">Powered by Facets</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:text-facets-teal hover:bg-facets-teal/10">
                Home
              </Button>
            </Link>
            <Link href="/owners">
              <Button variant="ghost" size="sm" className="hover:text-facets-teal hover:bg-facets-teal/10">
                Owners
              </Button>
            </Link>
            <Link href="/vets">
              <Button variant="ghost" size="sm" className="hover:text-facets-purple hover:bg-facets-purple/10">
                Vets
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="hover:text-facets-teal hover:bg-facets-teal/10">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
