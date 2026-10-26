import { useState } from "react";
import '../../../CSS/mainlistingpage/BasicInfo.css';
import {
  Hotel,
  User,
  MapPin,
  IndianRupee,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function BasicInfo() {
  const navigate = useNavigate();

  const [hotelName,     setHotelName]     = useState("");
  const [ownerName,     setOwnerName]     = useState("");
  const [ownerEmail,    setOwnerEmail]    = useState("");
  const [hotelLocation, setHotelLocation] = useState("");
  const [price,         setPrice]         = useState("");
  const [contactNumber, setContactNumber] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
  
    // ✅ Check 1: Token hai hi nahi
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
  
    const hotelData = {
      hotelName,
      ownerName,
      ownerEmail,
      hotelLocation,
      pricePerNight: Number(price),
      contactNumber,
    };
  
    try {
      const response = await fetch("http://localhost:3000/basic-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(hotelData),
      });
  
      const data = await response.json();
      console.log("Response:", data);
  
      // ✅ Check 2: Server ne error diya (403 / 401 etc.)
      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;  // ← navigate nahi hoga jab tak hotel_id na mile
      }
  
      // ✅ Check 3: hotel_id aaya ya nahi
      if (!data.hotel_id) {
        alert("Hotel ID not received. Please try again.");
        return;
      }
  
      localStorage.setItem("hotel_id", data.hotel_id);
      navigate("/details");
  
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Is the server running?");
    }
  };

  
  return (
    <div className="basic-page">
      <div className="basic-container">

        {/* LEFT PANEL */}
        <div className="left-side">
          <span className="tag">Hotel Listing</span>
          <h1>Add Your <br /> Hotel Details</h1>
          <p>Fill in the basic information about your hotel to continue the listing process.</p>

          <div className="progress-box">
            <div className="step active">1</div>
            <div className="line active-line"></div>
            <div className="step">2</div>
            <div className="line"></div>
            <div className="step">3</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="form-card">
          <h2>Basic Information</h2>

          <form onSubmit={handleSubmit}>

            {/* Hotel Name */}
            <div className="input-box">
              <label>Hotel Name</label>
              <div className="input-field">
                <Hotel size={20} />
                <input
                  type="text"
                  placeholder="Enter hotel name"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                />
              </div>
            </div>

            {/* Owner Name */}
            <div className="input-box">
              <label>Owner Name</label>
              <div className="input-field">
                <User size={20} />
                <input
                  type="text"
                  placeholder="Enter owner name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
            </div>

            {/* Owner Email */}
            <div className="input-box">
              <label>Owner Email</label>
              <div className="input-field">
                <Mail size={20} />
                <input
                  type="email"
                  placeholder="Enter owner email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="input-box">
              <label>Hotel Location</label>
              <div className="input-field">
                <MapPin size={20} />
                <input
                  type="text"
                  placeholder="Enter hotel location"
                  value={hotelLocation}
                  onChange={(e) => setHotelLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Price */}
            <div className="input-box">
              <label>Price Per Night</label>
              <div className="input-field">
                <IndianRupee size={20} />
                <input
                  type="number"
                  placeholder="Enter room price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="input-box">
              <label>Contact Number</label>
              <div className="input-field">
                <Phone size={20} />
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setContactNumber(value);
                  }}
                />
              </div>
            </div>

            <button type="submit" className="continue-btn">Continue</button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default BasicInfo;