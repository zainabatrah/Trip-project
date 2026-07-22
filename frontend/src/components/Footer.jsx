import { 
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from "react-icons/fa";

import styles from "../Styles/footer.module.css";

export default function Footer(){

  return (
    <footer className={styles.footer}>

      <div className={styles.footerContainer}>

        {/* About */}
        <div className={styles.footerSection}>
          <h2>Travel Explorer</h2>

          <p>
            Discover amazing trips, explore beautiful places,
            and create unforgettable memories with us.
          </p>
        </div>


        {/* Quick Links */}
        <div className={styles.footerSection}>

          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/trips">Trips</a>
          <a href="/profile">Profile</a>

        </div>



        {/* Contact */}
        <div className={styles.footerSection}>

          <h3>Contact Us</h3>

          <p>
            <FaMapMarkerAlt />
            Lebanon
          </p>

          <p>
            <FaPhone />
            +961 00 000 000
          </p>

          <p>
            <FaEnvelope />
            travel@example.com
          </p>

        </div>



        {/* Social */}
        <div className={styles.footerSection}>

          <h3>Follow Us</h3>

          <div className={styles.social}>

            <FaFacebook />
            <FaInstagram />
            <FaTwitter />

          </div>

        </div>


      </div>



      <div className={styles.bottom}>

        <p>
          © {new Date().getFullYear()} Travel Explorer.
          All Rights Reserved.
        </p>

      </div>


    </footer>
  );
}