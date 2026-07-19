import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Feedback() {
  const { tripId } = useParams();

  const [feedback, setFeedback] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetch(`http://localhost:5000/api/feedback/${tripId}`)
      .then((res) => res.json())
      .then((data) => setFeedback(data))
      .catch((err) => console.error(err));
  }, [tripId]);


  async function addFeedback() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip: tripId,
          rating,
          comment,
        }),
      }
    );


    const data = await res.json();


    setFeedback([
      data,
      ...feedback,
    ]);


    setComment("");
    setRating(5);
  }



  return (
    <div style={styles.main}>

      <h1 style={styles.title}>
      We Care About Your Feedback !
      </h1>


      <section style={styles.addSection}>

        <h3 style={styles.subTitle}>
          Add your review
        </h3>


        <label style={styles.field}>
          <span>
            Rating
          </span>

          <select
            value={rating}
            onChange={(e) =>
              setRating(Number(e.target.value))
            }
            style={styles.control}
          >

            <option value={5}>
              ⭐⭐⭐⭐⭐
            </option>

            <option value={4}>
              ⭐⭐⭐⭐
            </option>

            <option value={3}>
              ⭐⭐⭐
            </option>

            <option value={2}>
              ⭐⭐
            </option>

            <option value={1}>
              ⭐
            </option>

          </select>

        </label>



        <label style={styles.field}>

          <span>
            Comment
          </span>


          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Write your experience..."
            style={styles.textarea}
          />

        </label>



        <button
          onClick={addFeedback}
          style={styles.button}
        >
          Submit Review
        </button>


      </section>



      {feedback.length === 0 ? (

        <div style={styles.empty}>
          No reviews yet.
        </div>


      ) : (


        feedback.map((review) => (

          <div
            key={review._id}
            style={styles.reviewCard}
          >


            <div style={styles.header}>


              <div style={styles.avatar}>
                {(review.user?.fullName ||
                  "Anonymous")[0]
                  .toUpperCase()}
              </div>



              <div>

                <h4 style={styles.name}>
                  {review.user?.fullName ||
                    "Anonymous"}
                </h4>


                <span style={styles.date}>
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString()}
                </span>

              </div>


            </div>



            <div style={styles.stars}>
              {"⭐".repeat(review.rating)}
            </div>



            <div style={styles.comment}>
              {review.comment}
            </div>



          </div>

        ))

      )}


    </div>
  );
}

 const styles = {

  main: {
  minHeight: "100vh",
  width: "100%",
  padding: "50px 20px",

  background:
    "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 45%, #60a5fa 100%)",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  fontFamily:
    "Inter, Arial, sans-serif",
},


  title: {
    margin: "0 0 30px",

    fontSize: 34,

    fontWeight: 900,

    letterSpacing: "-0.5px",

    color: "#1e3a8a",
  },


  addSection: {
    width: "100%",
    maxWidth: 680,

    padding: "28px",

    marginBottom: 30,

    borderRadius: 24,

    background:
      "rgba(255,255,255,0.75)",

    border:
      "1px solid rgba(255,255,255,0.8)",

    boxShadow:
      "0 20px 45px rgba(37,99,235,0.18)",

    backdropFilter:
      "blur(18px)",
  },


  subTitle: {
    margin: "0 0 22px",

    fontSize: 22,

    fontWeight: 900,

    color: "#1e40af",
  },


  field: {
    display: "flex",

    flexDirection: "column",

    gap: 9,

    marginBottom: 18,

    color: "#334155",

    fontWeight: 700,

    fontSize: 15,
  },


  control: {
    width: "100%",

    height: 46,

    padding: "0 15px",

    borderRadius: 14,

    border:
      "1px solid #bfdbfe",

    background:
      "rgba(255,255,255,0.9)",

    color:
      "#1e3a8a",

    fontWeight: 700,

    outline: "none",
  },


  textarea: {
    width: "100%",

    minHeight: 130,

    padding: 16,

    borderRadius: 16,

    border:
      "1px solid #bfdbfe",

    background:
      "rgba(255,255,255,0.9)",

    color:
      "#334155",

    fontSize: 15,

    resize: "none",

    outline: "none",
  },


  button: {
    width: "100%",

    height: 48,

    borderRadius: 14,

    border: "none",

    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",

    color:
      "white",

    fontSize: 16,

    fontWeight: 800,

    cursor: "pointer",

    boxShadow:
      "0 10px 25px rgba(37,99,235,0.35)",
  },


  reviewCard: {
    width: "100%",
    maxWidth: 680,

    padding: "24px",

    marginBottom: 20,

    borderRadius: 22,

    background:
      "rgba(255,255,255,0.82)",

    border:
      "1px solid rgba(255,255,255,0.8)",

    boxShadow:
      "0 15px 35px rgba(30,64,175,0.16)",

    backdropFilter:
      "blur(15px)",
  },


  header: {
    display: "flex",

    alignItems: "center",

    gap: 15,
  },


  avatar: {
    width: 58,

    height: 58,

    borderRadius: "50%",

    background:
      "linear-gradient(135deg,#3b82f6,#1d4ed8)",

    color:
      "#fff",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    fontSize: 23,

    fontWeight: 900,

    boxShadow:
      "0 8px 20px rgba(37,99,235,0.35)",
  },


  name: {
    margin: 0,

    color:
      "#1e3a8a",

    fontSize: 19,

    fontWeight: 900,
  },


  date: {
    color:
      "#64748b",

    fontSize: 13,

    fontWeight: 600,
  },


  stars: {
    margin:
      "18px 0 12px",

    fontSize: 23,
  },


  comment: {
    padding: 16,

    borderRadius: 16,

    background:
      "linear-gradient(135deg,#eff6ff,#dbeafe)",

    color:
      "#475569",

    lineHeight: 1.7,

    fontSize: 15,

    border:
      "1px solid #bfdbfe",
  },


  empty: {
    width: 680,

    padding: 25,

    borderRadius: 18,

    background:
      "rgba(255,255,255,0.7)",

    color:
      "#64748b",

    textAlign:
      "center",

    fontWeight: 700,
  },

};