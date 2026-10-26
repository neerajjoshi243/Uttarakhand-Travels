import { useState, useRef } from "react";
import "../../../CSS/mainlistingpage/photos&publis.css";
import { useNavigate } from "react-router-dom";


import {
  Upload,
  X,
  ChevronLeft,
  CheckCircle,
  ShieldCheck,
 ImagePlus,
} from "lucide-react";

const MAX_IMAGES = 8;
const MAX_SIZE_MB = 5;

function PhotosPublish() {

  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [published, setPublished] = useState(false);

  // hotel id
  const hotelId = localStorage.getItem("hotelId");

  // files process
  const processFiles = (files) => {

    const valid = Array.from(files).filter((f) => {

      if (!["image/png", "image/jpeg"].includes(f.type)) {
        alert(`${f.name} is not a PNG or JPG file.`);
        return false;
      }

      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${f.name} exceeds 5MB limit.`);
        return false;
      }

      return true;
    });

    const remaining = MAX_IMAGES - images.length;

    const toAdd = valid.slice(0, remaining).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));

    setImages((prev) => [...prev, ...toAdd]);
  };

  // drag drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  // remove image
  const handleRemove = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // publish
  const handlePublish = async () => {
    const hotelId = localStorage.getItem("hotel_id");
    const token   = localStorage.getItem("token");
  
    console.log("HOTEL ID =", hotelId);
  
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
  
    if (!hotelId) {
      alert("Hotel ID missing. Please go back.");
      navigate("/basic-info");
      return;
    }
  
    if (images.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("hotel_id", hotelId);
      images.forEach((img) => {
        formData.append("hotelImages", img.file);
      });
  
      const response = await fetch("http://localhost:3000/picture", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,  // ✅ Token add kiya
          // ❌ Content-Type mat likhna — browser khud set karega multipart/form-data
        },
        body: formData,
      });
  
      const data = await response.json();
      console.log(data);
  
      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }
  
      // ✅ Listing complete — localStorage clean karo
      localStorage.removeItem("hotel_id");
  
      setPublished(true);
  
    } catch (error) {
      console.log(error);
      alert("Network error. Is the server running?");
    }
  };
  // success page
  if (published) {

    return (
      <div className="pp-page">

        <div className="pp-success">

          <div className="pp-success-icon">
            <CheckCircle size={56} />
          </div>

          <h2>Listing Submitted!</h2>

          <p>
            Your hotel has been submitted for review.
          </p>

          <button
            className="pp-home-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="pp-page">

      <div className="pp-container">

        {/* LEFT */}
        <div className="pp-left">

          <span className="pp-tag">
            Hotel Listing
          </span>

          <h1>
            Share your <br />
            hotel's best <br />
            moments
          </h1>

          <p>
            Upload clear hotel images.
          </p>

          {/* steps */}
          <div className="pp-steps">

            <div className="pp-step pp-done">1</div>

            <div className="pp-line pp-line-done"></div>

            <div className="pp-step pp-done">2</div>

            <div className="pp-line pp-line-done"></div>

            <div className="pp-step pp-active">3</div>

          </div>

          <p className="pp-step-label">
            <strong>Step 3</strong> — Photos & Publish
          </p>

        </div>

        {/* RIGHT */}
        <div className="pp-card">

          {/* header */}
          <div className="pp-card-header">

            <div>

              <h2>Photos & Publish</h2>

              <p className="pp-subtitle">
                Upload Hotel Images ({images.length}/{MAX_IMAGES})
              </p>

            </div>

          </div>

          {/* upload box */}
          <div
            className={`pp-dropzone ${
              dragOver ? "pp-dropzone--over" : ""
            } ${
              images.length >= MAX_IMAGES
                ? "pp-dropzone--full"
                : ""
            }`}
            onClick={() =>
              images.length < MAX_IMAGES &&
              inputRef.current.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >

            <input
              ref={inputRef}
              type="file"
              accept="image/png, image/jpeg"
              multiple
              style={{ display: "none" }}
              onChange={(e) =>
                processFiles(e.target.files)
              }
            />

            <div className="pp-dropzone-inner">

              <div className="pp-upload-icon">
                <ImagePlus size={28} />
              </div>

              <p className="pp-drop-title">

                {images.length >= MAX_IMAGES
                  ? "Maximum images reached"
                  : "Drop images here or click to upload"}

              </p>

              <p className="pp-drop-sub">
                PNG, JPG up to 5MB
              </p>

            </div>

          </div>

          {/* image preview */}
          {images.length > 0 && (

            <div className="pp-grid">

              {images.map((img, i) => (

                <div
                  key={img.id}
                  className={`pp-thumb ${
                    i === 0 ? "pp-thumb--cover" : ""
                  }`}
                >

                  <img
                    src={img.url}
                    alt={img.name}
                  />

                  {i === 0 && (
                    <span className="pp-cover-badge">
                      Cover
                    </span>
                  )}

                  <button
                    type="button"
                    className="pp-remove"
                    onClick={() => handleRemove(img.id)}
                  >
                    <X size={14} />
                  </button>

                </div>

              ))}

            </div>

          )}

          {/* notice */}
          <div className="pp-notice">

            <div className="pp-notice-icon">
              <ShieldCheck size={20} />
            </div>

            <div>

              <p className="pp-notice-title">
                Verified Listing
              </p>

              <p className="pp-notice-body">
                Your listing will be reviewed.
              </p>

            </div>

          </div>

          {/* buttons */}
          <div className="pp-actions">

            <button
              type="button"
              className="pp-back-btn"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <button
              type="button"
              className="pp-publish-btn"
              onClick={handlePublish}
            >
              <Upload size={18} />
              Publish Listing
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PhotosPublish;