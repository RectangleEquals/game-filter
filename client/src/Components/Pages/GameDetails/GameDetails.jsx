import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Container, Button } from "react-bootstrap";
import { resolveUrl } from "utils/resolveUrl";

const apiUrlBase = import.meta.env.VITE_API_BASEPATH || "http://localhost/api";
const apiUrlGames = resolveUrl(apiUrlBase, 'games');

const GameDetails = () => {
  const params = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    fetch(resolveUrl(apiUrlGames, params.gameId))
      .then((res) => res.json())
      .then((data) => setGame(data));
  }, [game]);

  const validateGame = () => {
    return game && game.length > 0 && game[0]
  }

  if (!validateGame()) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title>ID: {game[0].gameId ? `#${game[0].gameId} - ` : "???"} - Title: {game[0].title ? game[0].title : "???"}</Card.Title>
        <Card.Text>{game[0].description}</Card.Text>
        <Card.Text>Release Date: {game[0].releaseDate}</Card.Text>
        <Card.Text>Developer: {game[0].developer}</Card.Text>
        <Card.Text>Publisher: {game[0].publisher}</Card.Text>
        <Card.Text>Platforms: {game[0].platforms && game[0].platforms.length > 0 && game[0].platforms.join(", ")}</Card.Text>
        <Card.Text>Store Platforms: {game[0].storePlatforms && game[0].storePlatforms.length > 0 && game[0].storePlatforms.join(", ")}</Card.Text>
        <Card.Text>Features: {game[0].features && game[0].features.length > 0 && game[0].features.join(", ")}</Card.Text>
        <Card.Title>Reviews</Card.Title>
        {game[0].reviews && game[0].reviews.length > 0 && game[0].reviews.map((review, index) => (
          <Container key={index}>
            <Button
              variant="outline-secondary"
              className="w-100 mb-2"
              data-bs-toggle="collapse"
              data-bs-target={`#review-${index}`}
              aria-expanded="false"
              aria-controls={`review-${index}`}
              >
              Review by {review.user}
            </Button>
            <Container className="collapse" id={`review-${index}`}>
              <Card.Text>Rating: {review.rating}</Card.Text>
              <Card.Text>Comment: {review.comment}</Card.Text>
            </Container>
          </Container>
        ))}
      </Card.Body>
    </Card>
  );
};

export default GameDetails;
