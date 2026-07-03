import React from "react";
import Link from "next/link";
import { FaInstagram, FaXTwitter, FaLinkedin, FaFacebook } from "react-icons/fa6";
import { Cpu, Mail, Phone, MapPin } from "lucide-react";
export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-slate-100 pt-16 pb-8 text-slate-600 mx-0 overflow-hidden">
      {/* Luxury Background Ornaments */}
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-slate-800/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {" "}
          <div className="flex flex-col gap-4">
            {" "}
            <Link href="/" className="flex items-center gap-2">
              {" "}
              <img
                src="/images/logo.png"
                alt="ZORTUNER Logo"
                className="h-8 w-auto object-contain"
              />{" "}
              <span className="text-lg font-bold tracking-tight text-slate-900" style={{ fontFamily: '"Eurostile Bold Extended", sans-serif' }}>
              {" "}
              ZORTUNER{" "}
            </span>{" "}
            </Link>{" "}
            <p className="text-sm leading-relaxed text-slate-500">
              {" "}
              Transforming digital ideas into physical realities with precision
              3D printing. We design and manufacture high-detail figurines,
              decor, and structural models.{" "}
            </p>{" "}
            <div className="flex gap-3 mt-2">
              {" "}
              <a
                href="https://www.instagram.com/zortuner?igsh=MW13M3hmMmFoaDA0bg=="
                className="rounded-full bg-slate-200/50 p-2 text-[#E1306C] hover:bg-[#E1306C]  border border-[#E1306C]/30 hover:border-[#E1306C] transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full bg-slate-200/50 p-2 text-slate-800 hover:bg-slate-800  border border-slate-300 hover:border-slate-800 transition-all duration-300"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full bg-slate-200/50 p-2 text-[#0077b5] hover:bg-[#0077b5]  border border-[#0077b5]/30 hover:border-[#0077b5] transition-all duration-300"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full bg-slate-200/50 p-2 text-[#1877F2] hover:bg-[#1877F2]  border border-[#1877F2]/30 hover:border-[#1877F2] transition-all duration-300"
              >
                <FaFacebook className="h-4 w-4" />
              </a>
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <h3 className="text-sm font-semibold tracking-wider text-slate-800 uppercase">
              Product Catalog
            </h3>{" "}
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              {" "}
              <li>
                {" "}
                <Link
                  href="/shop?category=home-decor"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Home Decor & Vases{" "}
                </Link>{" "}
              </li>{" "}
              <li>
                {" "}
                <Link
                  href="/shop?category=gaming-accessories"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Gaming Accessories{" "}
                </Link>{" "}
              </li>{" "}
              <li>
                {" "}
                <Link
                  href="/shop?category=anime-figures"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Anime Figures{" "}
                </Link>{" "}
              </li>{" "}
              <li>
                {" "}
                <Link
                  href="/custom-print"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Custom 3D Printing Service{" "}
                </Link>{" "}
              </li>{" "}
            </ul>{" "}
          </div>{" "}
          <div>
            {" "}
            <h3 className="text-sm font-semibold tracking-wider text-slate-800 uppercase">
              Customer Support
            </h3>{" "}
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              {" "}
              <li>
                {" "}
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Track Your Orders{" "}
                </Link>{" "}
              </li>{" "}
              <li>
                {" "}
                <Link
                  href="/dashboard?tab=tickets"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Raise Support Tickets{" "}
                </Link>{" "}
              </li>{" "}
              <li>
                {" "}
                <Link
                  href="/shop"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  Shipping Rates & Times{" "}
                </Link>{" "}
              </li>{" "}
              <li>
                {" "}
                <Link
                  href="/custom-print"
                  className="hover:text-primary transition-colors"
                >
                  {" "}
                  STL Upload Guide{" "}
                </Link>{" "}
              </li>{" "}
            </ul>{" "}
          </div>{" "}
          <div>
            {" "}
            <h3 className="text-sm font-semibold tracking-wider text-slate-800 uppercase">
              Contact & Location
            </h3>{" "}
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              {" "}
              <li className="flex items-start gap-2">
                {" "}
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />{" "}
                <span>
                  E03 RNSIT Dr. Vishnuvardhan Road, Post, Channasandra, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098
                </span>{" "}
              </li>{" "}
              <li className="flex items-center gap-2">
                {" "}
                <Phone className="h-4 w-4 text-primary shrink-0" />{" "}
                <span>8884828247</span>{" "}
              </li>{" "}
              <li className="flex items-center gap-2">
                {" "}
                <Mail className="h-4 w-4 text-primary shrink-0" />{" "}
                <span>support@zortuner.com</span>{" "}
              </li>{" "}
            </ul>{" "}
          </div>{" "}
        </div>{" "}
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500">
          {" "}
          <p>
            &copy; {new Date().getFullYear()} Zortuner. All rights reserved.
            Made in India.
          </p>{" "}
          <div className="flex gap-4">
            {" "}
            <a href="#" className="hover:text-primary hover:underline">
              Privacy Policy
            </a>{" "}
            <a href="#" className="hover:text-primary hover:underline">
              Terms of Service
            </a>{" "}
            <a href="#" className="hover:text-primary hover:underline">
              Refund Policy
            </a>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </footer>
  );
}
