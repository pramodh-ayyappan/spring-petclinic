import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const Header = () => {
  return (
    <header className="bg-neo-secondary border-b-4 border-neo-primary shadow-neo-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-neo-accent border-3 border-neo-primary shadow-neo flex items-center justify-center">
              <span className="text-2xl font-bold text-neo-secondary">🐕</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neo-primary">PetClinic</h1>
              <p className="text-sm text-neo-dark-gray font-medium">NEOBRUTALISM EDITION</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="default" size="sm">
                HOME
              </Button>
            </Link>
            <Link href="/owners">
              <Button variant="blue" size="sm">
                OWNERS
              </Button>
            </Link>
            <Link href="/vets">
              <Button variant="purple" size="sm">
                VETS
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="default" size="sm">
              MENU
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
