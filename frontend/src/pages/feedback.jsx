import "./Feedback.css";
export default function Feedback() {
  return (
    <div className="feedback-container">

      <div className="feedback-card">
        <h1>Feedback</h1>

        <form className="feedback-form">

          <input type="text" placeholder="Your Name" />

          <input type="email" placeholder="Your Email" />

          <select>
            <option>Rate Us</option>
            <option>⭐ 1</option>
            <option>⭐ 2</option>
            <option>⭐ 3</option>
            <option>⭐ 4</option>
            <option>⭐ 5</option>
          </select>

          <textarea
            placeholder="Write your feedback..."
            rows="5"
          ></textarea>

          <button type="submit">
            Submit Feedback
          </button>

        </form>
      </div>

    </div>
  );
}