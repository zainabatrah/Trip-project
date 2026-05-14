import { Link } from "react-router-dom";
import styles from '../Styles/welcome.module.css';
import { FaSearch, FaInfoCircle, FaCreditCard,FaShieldAlt, FaUserLock, FaHeadset, FaUndo} from "react-icons/fa";
import Carousel from "react-bootstrap/Carousel";
export default function Welcome() {
  return (
    <div className={styles.body} >
<nav className={styles.navbar}>

  <div className={styles.leftLinks}>
    <Link to="/" className={styles.link}>Home</Link>
    <Link to="/about" className={styles.link}>About Us</Link>
    <Link to="/private-trip" className={styles.link}>Private Trip</Link>
  </div>

  <div className={styles.rightButtons}>
    <Link to="/login" className={styles.primaryBtn}>Login</Link>
    <Link to="/register" className={styles.secondaryBtn}>Register</Link>
  </div>

</nav>
      

      
 <Carousel>
      <Carousel.Item>
        <img
          className={styles.carouselimage}
          src="/Images/Lebanon-spring-1.jpg"
          alt="First slide"/>
        <Carousel.Caption className={styles.CarouselCaption}>
          <h2>Summer Adventures</h2>
           <p>Admire the stunning rock formations and sunny vistas.</p>
          <Link to="/trips" className="btn btn-warning">
      See Trips
    </Link>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className={styles.carouselimage}
          src="/Images/download.jpg"
          alt="Second slide" />

        <Carousel.Caption className={styles.CarouselCaption}>
          <h2>Spring in Lebanon</h2>
          <p>Enjoy blooming flowers and lush landscapes.</p>
         <Link to="/trips" className="btn btn-success">
      Discover More
    </Link>
        </Carousel.Caption>

      </Carousel.Item>

      <Carousel.Item>
        <img
          className={styles.carouselimage}
          src="/Images/259630922_1135604446844746_4637020193812776409_n-2-e1662372322330.webp"
          alt="Third slide"/>

        <Carousel.Caption className={styles.CarouselCaption} >
    <h2>Autumn Beauty</h2>
    <p>Stroll among colorful trees and golden leaves.</p>
   <Link to="/trips" className="btn btn-danger">
      Book Now
    </Link>
  </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className={styles.carouselimage}
          src="/Images/Faraya.jpg"
          alt="Third slide"/>

        <Carousel.Caption className={styles.CarouselCaption}
        
        >
          <h2>Winter in Faraya</h2>
          <p>Ski slopes, snowy mountains, and cozy evenings.</p>
         <Link to="/trips" className="btn btn-info">
      Explore Trips
    </Link>
        </Carousel.Caption>

      </Carousel.Item>
    </Carousel>




{/* How it Work */}

<div className={styles.howitworks}>
      <h2 className={styles.howitworkstitle}>How It Works</h2>
      <div className={styles.stepscontainer}>

        {/* Step 1 */}
        <div className={styles.stepcard}>
          <div className={styles.stepicon}>
            <FaSearch />
          </div>
          <h3 className={styles.steptitle}>Browse Trip</h3>
          <p className={styles.steptext}>
            Explore the list of trips available for each season.
          </p>
        </div>

        {/* Step 2 */}
        <div className={styles.stepcard}>
          <div className={styles.stepicon}>
            <FaInfoCircle />
          </div>
          <h3 className={styles.steptitle}>Check Full Details</h3>
          <p className={styles.steptext}>
            View trip info, itinerary, and all important details before booking.
          </p>
        </div>

        {/* Step 3 */}
        <div className={styles.stepcard}>
          <div className={styles.stepicon}>
            <FaCreditCard />
          </div>
          <h3 className={styles.steptitle}>Book Your Seat</h3>
          <p className={styles.steptext}>
            Reserve your spot and get ready for an amazing adventure.
          </p>
        </div>

      </div>
    </div>

{/* Why Choose us  */}

<section className={styles.whysection}>
  <h2 className={styles.whytitle}>Why Travelers Choose Us</h2>

  <div className={styles.whycontainer}>
    <div className={styles.whycard}>
      <div className={styles.icon}>✔</div>
      <h3>Transparent Pricing</h3>
      <p>No hidden charges.</p>
    </div>

    <div className={styles.whycard}>
      <div className={styles.icon}>✔</div>
      <h3>Verified & Reliable</h3>
      <p>Trusted trip organizers</p>
      <p>Secure payments</p>
    </div>

    <div className={styles.whycard}>
      <div className={styles.icon}>✔</div>
      <h3>Convenient & Easy</h3>
      <p>Clear availability</p>
      <p>Mobile-friendly system</p>
    </div>
  </div>
</section>



<section className={styles.Categorysection}>

      <h2 className={styles.categoriesTitle}>
        Popular Trip Categories
      </h2>

      <div className={styles.categorycards}>

        <div className={styles.categorycard}>
          <img src="/Images/Tyre-Beach-Lebanon.jpg" alt="Beach Trips" />
          <div className={styles.categoryoverlay}>
            <h3>Beach Trips</h3>
          </div>
        </div>

        <div className={styles.categorycard}>
          <img src="/Images/download.avif" alt="Mountain Trips" />
          <div className={styles.categoryoverlay}>
            <h3>Mountain Trips</h3>
          </div>
        </div>

        <div className={styles.categorycard}>
          <img src="/Images/images (4).jpg" alt="Cultural Trips" />
          <div className={styles.categoryoverlay}>
            <h3>Cultural Trips</h3>
          </div>
        </div>

        <div className={styles.categorycard}>
          <img src="/Images/Outdoor-Adventures-Lebanon_FT1_.webp" alt="Adventure Trips" />
          <div className={styles.categoryoverlay}>
            <h3>Adventure Trips</h3>
          </div>
        </div>

      </div>

    </section>




{/* Trust You */}

 <section className={styles.trustSection}>

      <h2 className={styles.trustTitle}>
        Your Trust, Our Priority
      </h2>

      <div className={styles.trustContainer}>

        <div className={styles.trustItem}>
          <FaShieldAlt className={styles.trustIcon} />
          <p>Secure System</p>
        </div>

        <div className={styles.trustItem}>
          <FaUserLock className={styles.trustIcon} />
          <p>Data Protection</p>
        </div>

        <div className={styles.trustItem}>
          <FaHeadset className={styles.trustIcon} />
          <p>Reliable Support</p>
        </div>

        <div className={styles.trustItem}>
          <FaUndo className={styles.trustIcon} />
          <p>Cancellation Policy</p>
        </div>

        <div className={styles.trustItem}>
          <FaCreditCard className={styles.trustIcon} />
          <p>Safe Payments</p>
        </div>

      </div>

    </section>
  
    </div>
  );
}

