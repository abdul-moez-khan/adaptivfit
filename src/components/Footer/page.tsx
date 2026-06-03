import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="section__container footer__container">
        <span className="bg__blur"></span>
        <span className="bg__blur footer__blur"></span>
        <div className="footer__col">
          <div className="footer__logo">
            <Image src="/logo.png" alt="logo" width={150} height={70} />
          </div>
          <p>
            AdaptivFit — your personal AI fitness ecosystem driven by intelligent agents. Train,
            recover, and evolve with precise, science-backed adaptation. Your body&apos;s intelligent
            companion.
          </p>
          <div className="footer__socials">
            <Link href="#">
              <i className="ri-facebook-fill"></i>
            </Link>
            <Link href="#">
              <i className="ri-instagram-line"></i>
            </Link>
            <Link href="#">
              <i className="ri-twitter-fill"></i>
            </Link>
          </div>
        </div>
        <div className="footer__col">
          <h4>Intelligent Agents</h4>
          <Link href="#">Posture Agent</Link>
          <Link href="#">Sleep Agent</Link>
          <Link href="#">Digestion Agent</Link>
          <Link href="#">Recovery Agent</Link>
        </div>
        <div className="footer__col">
          <h4>About AdaptivFit</h4>
          <Link href="#">How It Works</Link>
          <Link href="#">Privacy & Security</Link>
          <Link href="#">Science & Research</Link>
          <Link href="#">Careers</Link>
        </div>
        <div className="footer__col">
          <h4>Support</h4>
          <Link href="#">Contact Us</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms & Conditions</Link>
          <Link href="#">FAQ</Link>
        </div>
      </footer>
      <div className="footer__bar">
        Copyright © 2024 AdaptivFit. All rights reserved. Your body&apos;s intelligent companion.
      </div>
    </>
  );
}

