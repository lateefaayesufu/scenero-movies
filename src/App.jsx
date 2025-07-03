import { useState, useEffect } from "react";
import { Sun, Moon, Search, Heart, VideoIcon } from "lucide-react";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [upcoming, setUpcoming] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    async function fetchMovies(type, setter) {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${type}?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        setter(data.results);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
      }
    }

    fetchMovies("upcoming", setUpcoming);
    fetchMovies("popular", setPopular);
    fetchMovies("top_rated", setTopRated);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) return;
    const fetchMovies = async () => {
      setLoading(true);
      setError("");
      setResults([]);
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&s=${debouncedQuery}`
        );
        const data = await res.json();
        if (data.Response === "False") throw new Error(data.Error);

        const details = await Promise.all(
          data.Search.map(async (movie) => {
            const resDetail = await fetch(
              `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}&plot=full`
            );
            return await resDetail.json();
          })
        );
        setResults(details);
      } catch (err) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [debouncedQuery, API_KEY]);

  const toggleWatchlist = (movie) => {
    const exists = watchlist.find((m) => m.imdbID === movie.imdbID);
    const updated = exists
      ? watchlist.filter((m) => m.imdbID !== movie.imdbID)
      : [...watchlist, movie];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };
  const renderRow = (movies, title) => (
    <section className="mb-10 px-4 mt-15">
      <h2 className="text-3xl sm:text-4xl font-black text-purple-400 mb-6 uppercase drop-shadow-md text-center">
        {title}
      </h2>

      <div className="flex overflow-x-auto gap-4 pb-2">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="min-w-[120px] sm:min-w-[160px] rounded-lg overflow-hidden shadow-md bg-gray-900"
          >
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('image1.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0" />
      <div className="relative z-10">
        <nav className="flex justify-between items-center px-6 py-4 shadow-lg bg-gradient-to-r from-purple-900 via-black to-purple-800">
          <div className="flex items-center gap-3 text-3xl font-bold tracking-wide text-purple-300">
            <VideoIcon size={32} strokeWidth={2.5} className="mt-1.5" />
            Scenero
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-purple-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className={`w-full max-w-[200px] md:max-w-xs px-3 py-1 text-sm p-2 pl-10 rounded-md shadow-md border focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-gray-800 border-purple-500 text-white"
                    : "bg-gray-100 border-purple-400"
                }`}
              />
              <Search
                className="absolute top-2 left-4 text-gray-400"
                size={15}
              />
            </div>
          </div>
        </nav>

        <section className="text-center py-12 px-4">
          <h1 className="text-5xl font-extrabold text-purple-400 mb-4 mt-4">
            Lights. Camera. Search.
          </h1>
          <p className="text-lg max-w-xl mx-auto text-gray-400">
            Find the perfect movie anytime. Dive into plots, posters, ratings
            and more.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies by title..."
                className={`w-full p-4 pl-12 rounded-lg text-lg border focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-gray-800 border-purple-500 text-white"
                    : "bg-gray-100 border-purple-400"
                }`}
              />
              <Search
                className="absolute top-4 left-4 text-gray-400"
                size={24}
              />
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center my-12 gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-300 text-lg italic animate-pulse">
              Lights, camera... fetching your movies
            </p>
          </div>
        )}

        {error && (
          <p className="text-center text-red-500 text-lg mb-4">{error}</p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8 pb-16">
          {results.map((movie) => (
            <div
              key={movie.imdbID}
              onClick={() => {
                setSelectedMovie(movie);
                setShowModal(true);
              }}
              className="cursor-pointer group relative rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition duration-300 bg-gray-900"
            >
              <img
                src={
                  movie.Poster !== "N/A"
                    ? movie.Poster
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.Title}
                className="w-full h-96 object-cover object-top group-hover:blur-[1px] transition"
              />
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm text-white p-4 flex flex-col justify-end transition duration-300 opacity-0 group-hover:opacity-100">
                <h2 className="text-xl font-extrabold text-purple-200">
                  {movie.Title}
                </h2>
                <div className="text-sm text-gray-300 flex justify-between mt-1">
                  <span>{movie.Year}</span>
                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold">
                    ⭐ {movie.imdbRating}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                  {movie.Plot}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(movie);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white text-red-500 hover:scale-110"
                >
                  <Heart
                    fill={
                      watchlist.find((m) => m.imdbID === movie.imdbID)
                        ? "currentColor"
                        : "none"
                    }
                    strokeWidth={2}
                    size={24}
                  />
                </button>
              </div>
            </div>
          ))}
        </section>

        {renderRow(upcoming, "UPCOMING MOVIES")}
        {renderRow(popular, "POPULAR MOVIES")}
        {renderRow(topRated, "TOP RATED MOVIES")}

        {showModal && selectedMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center px-6 py-10">
            <div className="relative w-full max-w-4xl bg-gray-900 text-white rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              <img
                src={
                  selectedMovie.Poster !== "N/A"
                    ? selectedMovie.Poster
                    : "https://via.placeholder.com/400x600?text=No+Image"
                }
                alt={selectedMovie.Title}
                className="w-full md:w-1/2 h-96 md:h-auto object-cover"
              />
              <div className="p-6 flex flex-col gap-3 w-full md:w-1/2">
                <h2 className="text-2xl font-bold text-purple-300">
                  {selectedMovie.Title}
                </h2>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    <span className="font-semibold text-white">Year:</span>{" "}
                    {selectedMovie.Year}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Genre:</span>{" "}
                    {selectedMovie.Genre}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Runtime:</span>{" "}
                    {selectedMovie.Runtime}
                  </p>
                  <p>
                    <span className="font-semibold text-white">IMDb:</span> ⭐{" "}
                    {selectedMovie.imdbRating}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Actors:</span>{" "}
                    {selectedMovie.Actors}
                  </p>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  {selectedMovie.Plot}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-auto self-end px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-gradient-to-r from-purple-950 via-black to-purple-900 text-gray-300 py-8 px-6 mt-20 shadow-inner">
          <div className="max-w-5xl mx-auto text-center space-y-2">
            <p className="text-lg font-semibold tracking-wide text-purple-300">
              &copy; 2025 <span className="text-white font-bold">Scenero</span>
              <sup className="text-xs">™</sup>
            </p>
            <p className="text-sm md:text-base text-gray-400 italic">
              Lights fade, stories stay. Find your next obsession.
            </p>
            <div className="flex justify-center gap-6 pt-4 text-purple-500 text-sm">
              <a href="#" className="hover:text-purple-300 transition">
                About
              </a>
              <a href="#" className="hover:text-purple-300 transition">
                Privacy
              </a>
              <a
                href="https://github.com/lateefaayesufu"
                className="hover:text-purple-300 transition"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
