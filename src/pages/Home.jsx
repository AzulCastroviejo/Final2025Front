import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";

export default function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("https://tu-backend.com/categories/")
      .then(res => {
        // Filtramos las que tienen productos y tomamos las primeras 4
        const withProducts = res.data.filter(cat => cat.products && cat.products.length > 0);
        setCategories(withProducts.slice(0, 4));
      })
      .catch(err => console.error("Error cargando categorías", err));
  }, []);

  const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 4,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 3, slidesToScroll: 3 }
    },
    {
      breakpoint: 768,
      settings: { slidesToShow: 2, slidesToScroll: 2 }
    },
    {
      breakpoint: 480,
      settings: { slidesToShow: 1, slidesToScroll: 1 }
    }
  ]
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido a nuestra tienda</h1>

      <div style={{ background: "#f5f5f5", padding: "40px", margin: "20px 0", textAlign: "center" }}>
        <h2>🎉 Gran promoción de fin de año 🎉</h2>
        <p>Descuentos especiales en todas las categorías</p>
      </div>

      {categories.map(cat => (
        <div key={cat.id_key} style={{ marginBottom: "40px" }}>
          <h2>{cat.name}</h2>
          <Slider {...settings}>
            {cat.products.slice(0, 10).map(prod => (
              <div key={prod.id_key} style={{ padding: "10px" }}>
                <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "10px" }}>
                  <img
                    src={prod.image || "https://via.placeholder.com/150"}
                    alt={prod.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h4 style={{ textAlign: "center" }}>{prod.name}</h4>
                  <p style={{ textAlign: "center" }}>Precio: ${prod.price}</p>
                  <p style={{ textAlign: "center" }}>Stock: {prod.stock}</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ))}
    </div>
  );
}