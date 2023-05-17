import React, { useState } from "react";

const AddGame = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    releaseDate: "",
    developer: "",
    publisher: "",
    platforms: "",
    storePlatforms: "",
    features: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Game added successfully!", data);
        setFormData({
          title: "",
          description: "",
          releaseDate: "",
          developer: "",
          publisher: "",
          platforms: "",
          storePlatforms: "",
          features: "",
        });
      })
      .catch((error) => {
        console.error("Error adding game:", error);
      });
  };

  return (
    <div>
      <h2>Add Game</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Release Date:
          <input
            type="text"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Developer:
          <input
            type="text"
            name="developer"
            value={formData.developer}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Publisher:
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Platforms (comma separated):
          <input
            type="text"
            name="platforms"
            value={formData.platforms}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Store Platforms (comma separated):
          <input
            type="text"
            name="storePlatforms"
            value={formData.storePlatforms}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Features (comma separated):
          <input
            type="text"
            name="features"
            value={formData.features}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <button type="submit">Add Game</button>
      </form>
    </div>
  );
};

export default AddGame;