import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // react-router-dom নিশ্চিত করুন
import { Facebook, Mail, ChevronUp } from 'lucide-react';
import logo from '../../../assets/foodmenu.png'; 
import './Footer.css'; // সিএসএস ফাইল ইম্পোর্ট

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      const footerPosition = footer.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (footerPosition <= windowHeight + 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <Link to="/">
                <img src={logo} alt="FoodMenu BD Logo" loading="lazy" />
              </Link>
            </div>
            <p className="footer-desc">
              Explore menus, order easily, and enjoy your meal with dine-in, pickup, or delivery options.
            </p>
            <div className="footer-socials">
              <a href="https://facebook.com/foodmenubd" target="_blank" rel="noreferrer" className="social-icon">
                <Facebook size={20} />
              </a>
              <a href="mailto:info@smithitbd.com" className="social-icon">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="footer-links-wrapper">
            <div className="link-group">
              <h3>Important Links</h3>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
                <li><Link to="/careers">Careers</Link></li>
              </ul>
            </div>
            <div className="link-group">
              <h3>Food Delivery</h3>
              <ul>
                <li><Link to="/pickup">Pick-Up</Link></li>
                <li><Link to="/dine-in">Dine-In</Link></li>
                <li><Link to="/subscription">Subscription</Link></li>
              </ul>
            </div>
            <div className="link-group">
              <h3>Legal</h3>
              <ul>
                <li><Link to="/help">Help & Support</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p>
            © FoodMenu BD is a product of{' '}
            <a href="https://smithitbd.com" target="_blank" rel="noreferrer">Smith IT</a>. 
            All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Scroll Button */}
      <button 
        onClick={scrollToTop} 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
      >
        <ChevronUp size={24} />
      </button>
    </footer>
  );
};

export default Footer;