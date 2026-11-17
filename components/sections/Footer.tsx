import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#ECECF4] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid grid-cols-1 gap-16 md:grid-cols-5">

          {/* Logo */}
          <div className="md:col-span-2">
            {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logos/logo.svg"
            alt="DesignHub"
            className="h-7 w-auto"
          />
        </Link>

            <p className="mt-6 max-w-sm text-[16px] leading-8 text-slate-500">
              DesignHub helps designers and teams create,
              collaborate and deliver better products.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">
              Product
            </h3>

            <ul className="mt-6 space-y-4 text-[15px] text-slate-500">
              <li><Link href="#">Features</Link></li>
              <li><Link href="#">Dashboard</Link></li>
              <li><Link href="#">Templates</Link></li>
              <li><Link href="#">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">
              Resources
            </h3>

            <ul className="mt-6 space-y-4 text-[15px] text-slate-500">
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Guides</Link></li>
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">
              Company
            </h3>

            <ul className="mt-6 space-y-4 text-[15px] text-slate-500">
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[#ECECF4] pt-8 md:flex-row">

          <p className="text-[14px] text-slate-500">
            © 2026 DesignHub. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-slate-500">

            <Link href="#" className="transition hover:text-violet-600">
              X
            </Link>

            <Link href="#" className="transition hover:text-violet-600">
              Instagram
            </Link>

            <Link href="#" className="transition hover:text-violet-600">
              LinkedIn
            </Link>

            <Link href="#" className="transition hover:text-violet-600">
              GitHub
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}