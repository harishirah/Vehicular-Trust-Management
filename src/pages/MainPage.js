import React from "react";
import "../App.css";

function MainPage() {
  const handleClick = () => {
    console.log("Trust Value Submitted");
  };
  return (
    <div className="App">
      <input placeholder="Enter Trust Value Here" />
      <button onClick={handleClick}>Submit Trust Value</button>
    </div>
  );
}

export default MainPage;
