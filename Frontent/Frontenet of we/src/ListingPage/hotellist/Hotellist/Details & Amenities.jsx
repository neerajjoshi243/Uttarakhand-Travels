import { useState } from "react";

import { useNavigate } from "react-router-dom";

import "../../../CSS/mainlistingpage/Details&Amenities.css";

import {

  Wifi,
  Car,
  Coffee,
  ShieldCheck,
  Trees,
  ChevronRight,

} from "lucide-react";

function Details() {

  const navigate = useNavigate();

  const [amenities, setAmenities] =
    useState([]);

  const [hotelDescription,
    setHotelDescription] =
    useState("");

  const data = [

    {
      name: "Free Wifi",
      icon: <Wifi size={22} />,
    },

    {
      name: "Parking",
      icon: <Car size={22} />,
    },

    {
      name: "Restaurant",
      icon: <Coffee size={22} />,
    },

    {
      name: "24x7 Security",
      icon: <ShieldCheck size={22} />,
    },

    {
      name: "Nature View",
      icon: <Trees size={22} />,
    },

  ];



  const toggleAmenity = (item) => {

    if (amenities.includes(item)) {

      setAmenities(

        amenities.filter(
          (a) => a !== item
        )

      );

    } else {

      setAmenities([
        ...amenities,
        item
      ]);

    }

  };const handleContinue = async () => {
    const hotelId = localStorage.getItem("hotel_id");
    const token   = localStorage.getItem("token");
  
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
  
    if (!hotelId) {
      alert("Hotel ID missing. Please go back and fill basic info first.");
      navigate("/basic-info");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,   // ✅ Token add kiya
        },
        body: JSON.stringify({
          hotel_id: Number(hotelId),
          hotelDescription,
          amenities,
        }),
      });
  
      const data = await response.json();
      console.log(data);
  
      if (!response.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }
  
      navigate("/photos");
  
    } catch (error) {
      console.log(error);
      alert("Network error. Is the server running?");
    }
  };


  return (

    <div className="details-page">

      <div className="details-container">

        {/* Left Side */}

        <div className="left-side">

          <span className="tag">
            Hotel Listing
          </span>

          <h1>
            Tell Travelers <br />
            About Your Hotel
          </h1>

          <p>
            Add your hotel description,
            facilities, and services to
            attract more visitors.
          </p>

          <div className="progress-box">

            <div className="step active">
              1
            </div>

            <div className="line active-line"></div>

            <div className="step current">
              2
            </div>

            <div className="line"></div>

            <div className="step">
              3
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="form-card">

          <h2>
            Details & Amenities
          </h2>

          {/* Description */}

          <div className="input-box">

            <label>
              Hotel Description
            </label>

            <textarea

              placeholder="Describe your hotel, rooms, nearby attractions and overall experience..."

              value={hotelDescription}

              onChange={(e) =>
                setHotelDescription(
                  e.target.value
                )
              }

            ></textarea>

          </div>

          {/* Amenities */}

          <div className="amenities-section">

            <div className="title-row">

              <h3>
                Select Amenities
              </h3>

              <span>
                Choose available facilities
              </span>

            </div>

            <div className="amenities-grid">

              {data.map((item, index) => (

                <div

                  key={index}

                  className={`amenity-card ${
                    amenities.includes(item.name)
                      ? "selected"
                      : ""
                  }`}

                  onClick={() =>
                    toggleAmenity(item.name)
                  }

                >

                  <div className="icon-box">
                    {item.icon}
                  </div>

                  <p>{item.name}</p>

                </div>

              ))}

            </div>

          </div>

          {/* Buttons */}

          <div className="button-group">

            <button className="back-btn">
              Back
            </button>

            <button
              className="continue-btn"
              onClick={handleContinue}
            >

              Continue

              <ChevronRight size={18} />

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Details;