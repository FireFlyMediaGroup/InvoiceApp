import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <Hero />
    </main>
  );
}
