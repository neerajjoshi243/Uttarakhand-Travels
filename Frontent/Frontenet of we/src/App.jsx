import { Routes, Route } from "react-router-dom";
import Homepage       from "./Home Page/homepage";
import Login          from "./Loginpage/login";
import Signup         from "./SignUp/signup";
import ForgotPassword from "./Loginpage/ForgotPassword";  // ✅ New
import Pannel         from "./Services/lisitngbookingpannel";
import ListYourService from "./ListingPage/mainlandingpage/main";
import BasicInfo      from "./ListingPage/hotellist/Hotellist/Basic Info";
import Details        from "./ListingPage/hotellist/Hotellist/Details & Amenities";
import PhotosPublish  from "./ListingPage/hotellist/Hotellist/Photos & Publish";
import ListYourCar    from "./ListingPage/carlist/Listyourcar";
import ListYourBike   from "./ListingPage/bikelist/ListBike";
import OwnerDashboard from "./OwerDeskBord.jsx/Ownerdashboard ";
import UserDashboard from "./Home Page/UserDashboard";

function App() {
  return (
    <Routes>
      <Route path="/"                element={<Homepage />}       />
      <Route path="/login"           element={<Login />}          />
      <Route path="/signup"          element={<Signup />}         />
      <Route path="/forgot-password" element={<ForgotPassword />} />  {/* ✅ New */}
      <Route path="/signupdesbord"   element={<Pannel />}         />
      <Route path="/listing"         element={<ListYourService />} />
      <Route path="/BasicInfo"       element={<BasicInfo />}      />
      <Route path="/Details"         element={<Details />}        />
      <Route path="/photos"          element={<PhotosPublish />}  />
      <Route path="/carrent"         element={<ListYourCar />}    />
      <Route path="/bikerent"        element={<ListYourBike />}   />
      <Route path="/owner-dashboard" element={<OwnerDashboard />} />

    <Route path="/my-dashboard" element={<UserDashboard />} />


    </Routes>
  );
}

export default App;