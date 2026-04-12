import { useEffect, useState } from "react";
import API from "../../../services/api";

const ProductivityCard = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    API.get("/usage/productivity-score")
      .then((res) => {
        setScore(res.data.productivityScore);
      })
      .catch((err) => {
        console.error("Error fetching score:", err);
      });
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-72">
      <h2 className="text-lg font-semibold mb-2">
        Productivity Score
      </h2>
      <p className="text-4xl font-bold text-blue-600">
        {score}%
      </p>
    </div>
  );
};

export default ProductivityCard;
