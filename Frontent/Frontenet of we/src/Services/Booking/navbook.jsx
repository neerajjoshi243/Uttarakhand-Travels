import { useState } from "react";
import '../../CSS/leftSideBarPannel/filter.css'

function Filter() {
  const [active, setActive] = useState("All");

  const filters = ["All", "Hotel", "Car", "Bike","Scooty"];

  return (
    <div className="filter-container">
      {filters.map((item) => (
        <button
          key={item}
          className={active === item ? "active" : ""}
          onClick={() => setActive(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default Filter;