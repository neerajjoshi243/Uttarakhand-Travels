import { useState } from "react";
import SearchBar from "./Search/Seacrch"
import BookingSection from "./Booking/outerbooking"
import ServiceSidebar from "./Listing/ListingOuter/booklist"

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #faf9f7;
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .pannel-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
    max-width: 1240px;
    margin: 0 auto;
    padding: 32px 20px 64px;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .pannel-layout {
      grid-template-columns: 1fr 260px;
      gap: 18px;
    }
  }

  @media (max-width: 900px) {
    .pannel-layout {
      grid-template-columns: 1fr;
    }

    /* On mobile/tablet, sidebar goes BELOW the booking section */
    .pannel-sidebar {
      order: 2;
    }

    .pannel-main {
      order: 1;
    }
  }

  @media (max-width: 480px) {
    .pannel-layout { padding: 20px 10px 48px; gap: 16px; }
  }
`;

function Pannel() {
  const [filters, setFilters] = useState({
    location: "", checkIn: "", checkOut: "", guests: 1
  });

  const clearFilters = () => setFilters({ location: "", checkIn: "", checkOut: "", guests: 1 });

  return (
    <>
      <style>{styles}</style>

      {/* Search Hero — full width */}
      <SearchBar onSearch={setFilters} />

      {/* Two-column layout below */}
      <div className="pannel-layout">
        <div className="pannel-main">
          <BookingSection filters={filters} onClearFilters={clearFilters} />
        </div>
        <div className="pannel-sidebar">
          <ServiceSidebar />
        </div>
      </div>
    </>
  );
}

export default Pannel;