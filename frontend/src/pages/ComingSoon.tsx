import { Link } from 'react-router-dom';
import { Clock, Bell, ArrowLeft } from 'lucide-react';
import './ComingSoon.css';

const ComingSoon = () => {
    return (
        <div className="coming-soon-page">
            <div className="coming-soon-container">
                <div className="coming-soon-icon">
                    <Clock size={64} />
                </div>
                <h1>Coming Soon</h1>
                <p className="coming-soon-subtitle">
                    We're working hard to bring you our complete product catalog.
                </p>
                <p className="coming-soon-description">
                    Our premium laminate collection from Durian and Rockstar is being curated
                    with care. Subscribe to get notified when we launch!
                </p>

                <div className="coming-soon-notify">
                    <div className="notify-icon">
                        <Bell size={20} />
                    </div>
                    <span>Get notified when products are available</span>
                </div>

                <div className="coming-soon-actions">
                    <Link to="/" className="btn btn-primary">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>
                    <Link to="/contact" className="btn btn-outline">
                        Contact Us
                    </Link>
                </div>

                <div className="coming-soon-contact">
                    <p>Need laminates now? Contact us directly:</p>
                    <a href="tel:+919835268202" className="contact-link">+91 98352 68202</a>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
