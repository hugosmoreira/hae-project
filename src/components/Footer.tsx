const Footer = () => {
  return (
    <footer className="border-t border-civic-gray bg-civic-gray-dark px-4 py-8 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold">Housing Authority Exchange</h3>
            <p className="text-sm text-gray-300">
              Connecting housing professionals nationwide
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="/terms" 
              className="text-gray-300 transition-colors hover:text-white"
            >
              Terms of Service
            </a>
            <a 
              href="/privacy" 
              className="text-gray-300 transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a 
              href="/contact" 
              className="text-gray-300 transition-colors hover:text-white"
            >
              Contact Us
            </a>
          </nav>
        </div>
        <div className="mt-6 border-t border-gray-600 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 Housing Authority Exchange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;