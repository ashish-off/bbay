"use client";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { Search, ShoppingCart, Heart, PackageIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { checkAdminStatus, fetchCart, fetchWatchlist } from "@/lib/api";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const { data: adminData } = useQuery({
    queryKey: ['admin-check'],
    queryFn: checkAdminStatus,
    enabled: Boolean(user),
  });
  const isAdmin = Boolean(adminData?.isAdmin);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: Boolean(user),
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
  });

  const router = useRouter();

  const [search, setSearch] = useState("");
  const reduxCartCount = useSelector((state) => state.cart.total);
  const reduxWatchlistCount = useSelector((state) => state.watchlist.items.length);

  const cartCount = cartData?.items
    ? cartData.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : reduxCartCount;

  const watchlistCount = Array.isArray(watchlistData)
    ? watchlistData.length
    : reduxWatchlistCount;

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          <Link
            href="/"
            className="relative text-3xl font-bold text-slate-800 tracking-tight"
          >
            <span className="text-indigo-600">B</span>bay
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-7 text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition">
              Home
            </Link>
            <Link href="/shop" className="hover:text-indigo-600 transition">
              Shop
            </Link>
            <Link href="/sell" className="hover:text-indigo-600 transition">
              Sell
            </Link>
            <Link href="/orders" className="hover:text-indigo-600 transition">
              Activity
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition">
                Admin
              </Link>
            )}

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search listings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            {/* Watchlist Icon */}
            <Link
              href="/watchlist"
              className="relative flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition"
              title="Watchlist"
            >
              <Heart size={18} />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 left-2.5 text-[9px] text-white bg-red-500 min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold">
                  {watchlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 left-2.5 text-[9px] text-white bg-indigo-600 min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-7 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-full text-sm font-medium"
              >
                Login
              </button>
            ) : (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    labelIcon={<PackageIcon size={16} />}
                    label="Orders"
                    onClick={() => router.push("/orders")}
                  />
                  {isAdmin && (
                    <UserButton.Action
                      labelIcon={<ShieldCheck size={16} />}
                      label="Admin Panel"
                      onClick={() => router.push("/admin")}
                    />
                  )}
                </UserButton.MenuItems>
              </UserButton>
            )}
          </div>

          {/* Mobile User Button  */}
          <div className="sm:hidden flex items-center gap-3">
            <Link href="/watchlist" className="relative text-slate-600 p-1">
              <Heart size={20} />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] text-white bg-red-500 size-3.5 rounded-full flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </Link>
            {user ? (
              <div>
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      labelIcon={<PackageIcon size={16} />}
                      label="Orders"
                      onClick={() => router.push("/orders")}
                    />
                    <UserButton.Action
                      labelIcon={<ShoppingCart size={16} />}
                      label="Cart"
                      onClick={() => router.push("/cart")}
                    />
                    <UserButton.Action
                      labelIcon={<Heart size={16} />}
                      label="Watchlist"
                      onClick={() => router.push("/watchlist")}
                    />
                    {isAdmin && (
                      <UserButton.Action
                        labelIcon={<ShieldCheck size={16} />}
                        label="Admin Panel"
                        onClick={() => router.push("/admin")}
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            ) : (
              <button
                onClick={openSignIn}
                className="px-6 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-sm transition text-white rounded-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      <hr className="border-gray-200" />
    </nav>
  );
};

export default Navbar;
