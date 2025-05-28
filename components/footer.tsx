import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Tewahedo Answers</h3>
            <p className="text-gray-400">
              A community platform for Ethiopian Orthodox Tewahedo Church questions and answers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/ask" className="hover:text-white">
                  Ask Question
                </Link>
              </li>
              <li>
                <Link href="/questions" className="hover:text-white">
                  Browse Questions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/guidelines" className="hover:text-white">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Tewahedo Answers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
