// src/Pages/AdminMoviesPage.jsx
import { useEffect, useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import axiosInstance from "../Assests/api/axiosInstance";

// ---------- Reusable Upload Card ----------
function ImageUploadCard({ imageType, title, description, preview, onRemove, onPick }) {
  const inputId = `${imageType}-upload`;
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>

        {preview ? (
          <div className="relative group">
            {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
            <img src={preview} alt={`${title} preview`} className="w-full h-48 object-cover rounded-lg mb-4" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button
                onClick={() => onRemove(imageType)}
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 hover:border-gray-500 transition-colors">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(imageType, e.target.files?.[0] || null)}
        />
        <label
          htmlFor={inputId}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer inline-block"
        >
          {preview ? "Change Image" : "Upload Image"}
        </label>
      </div>
    </div>
  );
}

// ========== Page ==========
export default function AdminMoviesPage() {
  // modal mode: null = add, string = editing _id
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // list + ui state
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [contentType, setContentType] = useState("movie"); // 'movie' | 'series'
  const [episodes, setEpisodes] = useState([{ title: "", link: "" }]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "bollywood-movies", // used if movie; if series, we send "web-series"
    genre: "action",
    movieLink: "",
    trailerLink: "",
    numberOfEpisodes: 1,
    mainPoster: null,
    backgroundPoster: null,
    mobilePoster: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    mainPoster: null,
    backgroundPoster: null,
    mobilePoster: null,
  });

  // constants
  const movieTypes = [
    { value: "bollywood-movies", label: "Bollywood Movies" },
    { value: "south-hindi-dubbed", label: "South Hindi Dubbed Movies" },
    { value: "hollywood-movies", label: "Hollywood Movies" },
    { value: "web-series", label: "Web Series" },
  ];
  const genres = [
    "Action","Comedy","Drama","Horror","Romance","Thriller",
    "Adventure","Animation","Crime","Documentary","Fantasy",
    "Mystery","Sci-Fi","War","Western","Musical",
  ];

  // ---------- helpers ----------
  const onField = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const onPickImage = (imageType, file) => {
    if (!file) return;
    setFormData((s) => ({ ...s, [imageType]: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreviews((s) => ({ ...s, [imageType]: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const onRemoveImage = (imageType) => {
    setFormData((s) => ({ ...s, [imageType]: null }));
    setImagePreviews((s) => ({ ...s, [imageType]: null }));
  };

  const onEpisodeChange = (index, field, value) => {
    setEpisodes((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };
  const addEpisode = () => setEpisodes((e) => [...e, { title: "", link: "" }]);
  const removeEpisode = (index) =>
    setEpisodes((e) => (e.length > 1 ? e.filter((_, i) => i !== index) : e));

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "bollywood-movies",
      genre: "action",
      movieLink: "",
      trailerLink: "",
      numberOfEpisodes: 1,
      mainPoster: null,
      backgroundPoster: null,
      mobilePoster: null,
    });
    setImagePreviews({ mainPoster: null, backgroundPoster: null, mobilePoster: null });
    setEpisodes([{ title: "", link: "" }]);
    setContentType("movie");
  };

  // ---------- API ----------
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/movies");
      setMovies(data.items || []);
    } catch (err) {
      console.error(err);
      window.alert("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (movie) => {
    setEditingId(movie._id);
    setContentType(movie.type === "web-series" ? "series" : "movie");
    setEpisodes(movie.episodes?.length ? movie.episodes : [{ title: "", link: "" }]);

    setFormData({
      name: movie.name || "",
      description: movie.description || "",
      type: movie.type === "web-series" ? "web-series" : (movie.type || "bollywood-movies"),
      genre: (movie.genre || "action").toLowerCase(),
      movieLink: movie.type !== "web-series" ? (movie.movieLink || "") : "",
      trailerLink: movie.trailerLink || "",
      numberOfEpisodes: movie.episodes?.length || 1,
      mainPoster: null,
      backgroundPoster: null,
      mobilePoster: null,
    });

    setImagePreviews({
      mainPoster: movie.posters?.main?.url || null,
      backgroundPoster: movie.posters?.background?.url || null,
      mobilePoster: movie.posters?.mobile?.url || null,
    });

    setShowModal(true);
  };

  const onSubmit = async () => {
    // validate
    if (!formData.name || !formData.description) {
      window.alert("Please fill in all required fields");
      return;
    }
    if (contentType === "movie" && !formData.movieLink) {
      window.alert("Please provide movie link");
      return;
    }
    if (contentType === "series" && !episodes.some((e) => e.title && e.link)) {
      window.alert("Please add at least one episode");
      return;
    }

    try {
      setSubmitting(true);

      const typeToSend = contentType === "series" ? "web-series" : formData.type;
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("type", typeToSend);
      fd.append("genre", formData.genre.toLowerCase());
      if (formData.trailerLink) fd.append("trailerLink", formData.trailerLink);
      if (typeToSend === "web-series") {
        fd.append("episodes", JSON.stringify(episodes));
      } else {
        fd.append("movieLink", formData.movieLink);
      }
      // only send new files (keeps current Cloudinary images otherwise)
      if (formData.mainPoster instanceof File) fd.append("mainPoster", formData.mainPoster);
      if (formData.backgroundPoster instanceof File) fd.append("backgroundPoster", formData.backgroundPoster);
      if (formData.mobilePoster instanceof File) fd.append("mobilePoster", formData.mobilePoster);

      if (editingId) {
        await axiosInstance.put(`/movies/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        window.alert("Content updated!");
      } else {
        await axiosInstance.post("/movies", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        window.alert("Content added successfully!");
      }

      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchMovies();
    } catch (err) {
      console.error(err);
      window.alert(err?.response?.data?.message || (editingId ? "Failed to update" : "Failed to add content"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    const ok = typeof window !== "undefined" && window.confirm("Delete this item?");
    if (!ok) return;
    try {
      await axiosInstance.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err) {
      console.error(err);
      window.alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar showMobileToggle />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Movies Management</h1>
              <p className="text-gray-400 mt-1">Manage your movies and web series content</p>
            </div>
            <button
              onClick={openAdd}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Content
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Total Items</h3>
              <p className="text-3xl font-black text-white">{movies.length.toLocaleString()}</p>
              <p className="text-green-400 text-sm mt-2">Auto count</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Web Series</h3>
              <p className="text-3xl font-black text-white">
                {movies.filter((m) => m.type === "web-series").length.toLocaleString()}
              </p>
              <p className="text-blue-400 text-sm mt-2">Auto count</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Active Content</h3>
              <p className="text-3xl font-black text-white">
                {movies.filter((m) => m.status !== "Inactive").length.toLocaleString()}
              </p>
              <p className="text-purple-400 text-sm mt-2">Currently live</p>
            </div>
           
          </div>

          {/* Table */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Content</h2>
                <div className="flex gap-4">
                  <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>All Types</option>
                    <option>Movies</option>
                    <option>Web Series</option>
                  </select>
                  <input
                    type="search"
                    placeholder="Search content..."
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Genre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr><td className="px-6 py-6 text-gray-400" colSpan={5}>Loading...</td></tr>
                  ) : movies.length === 0 ? (
                    <tr><td className="px-6 py-6 text-gray-400" colSpan={5}>No content yet</td></tr>
                  ) : (
                    movies.map((movie) => (
                      <tr key={movie._id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-white">{movie.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                            {movie.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{movie.genre}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
                            {movie.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                              title="Edit"
                              onClick={() => openEdit(movie)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDelete(movie._id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[95vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? "Edit Content" : "Add New Content"}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); setEditingId(null); }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                <div className="space-y-8">

                  {/* Content Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setContentType("movie")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        contentType === "movie"
                          ? "border-red-500 bg-red-600/20 text-red-400"
                          : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V4m-9 0h10M9 8h6m-6 4h6m-6 4h3" />
                      </svg>
                      <span className="font-semibold">Movie</span>
                    </button>
                    <button
                      onClick={() => setContentType("series")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        contentType === "series"
                          ? "border-red-500 bg-red-600/20 text-red-400"
                          : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="font-semibold">Web Series</span>
                    </button>
                  </div>

                  {/* Posters */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Poster Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ImageUploadCard
                        imageType="mainPoster"
                        title="Main Poster"
                        description="Primary poster image (Recommended: 300x450px)"
                        preview={imagePreviews.mainPoster}
                        onRemove={onRemoveImage}
                        onPick={onPickImage}
                      />
                      <ImageUploadCard
                        imageType="backgroundPoster"
                        title="Background Poster"
                        description="Background/banner image (Recommended: 1920x1080px)"
                        preview={imagePreviews.backgroundPoster}
                        onRemove={onRemoveImage}
                        onPick={onPickImage}
                      />
                      <ImageUploadCard
                        imageType="mobilePoster"
                        title="Mobile Poster"
                        description="Mobile optimized poster (Recommended: 300x400px)"
                        preview={imagePreviews.mobilePoster}
                        onRemove={onRemoveImage}
                        onPick={onPickImage}
                      />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          {contentType === "movie" ? "Movie" : "Series"} Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={onField}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder={`Enter ${contentType} name`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Genre *</label>
                        <select
                          name="genre"
                          value={formData.genre}
                          onChange={onField}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {genres.map((g) => (
                            <option key={g} value={g.toLowerCase()}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Content Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={onField}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {movieTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        When <b>Series</b> is selected above, the value sent to backend is forced to <code>web-series</code>.
                      </p>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={onField}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder={`Enter ${contentType} description`}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Trailer Link</label>
                      <input
                        type="url"
                        name="trailerLink"
                        value={formData.trailerLink}
                        onChange={onField}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      />
                      <p className="text-sm text-gray-400 mt-2">Optional</p>
                    </div>
                  </div>

                  {/* Movie Link */}
                  {contentType === "movie" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Movie Link *</label>
                      <input
                        type="url"
                        name="movieLink"
                        value={formData.movieLink}
                        onChange={onField}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://example.com/movie-link"
                      />
                    </div>
                  )}

                  {/* Episodes */}
                  {contentType === "series" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-gray-300">Episodes</label>
                        <button
                          onClick={addEpisode}
                          type="button"
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          Add Episode
                        </button>
                      </div>
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {episodes.map((ep, idx) => (
                          <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-300">Episode {idx + 1}</h4>
                              {episodes.length > 1 && (
                                <button
                                  onClick={() => removeEpisode(idx)}
                                  type="button"
                                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Episode title"
                                value={ep.title}
                                onChange={(e) => onEpisodeChange(idx, "title", e.target.value)}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                              <input
                                type="url"
                                placeholder="Episode link"
                                value={ep.link}
                                onChange={(e) => onEpisodeChange(idx, "link", e.target.value)}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700">
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => { setShowModal(false); setEditingId(null); }}
                    type="button"
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSubmit}
                    type="button"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60"
                    disabled={submitting}
                  >
                    {submitting
                      ? (editingId ? "Updating..." : "Saving...")
                      : (editingId
                        ? `Update ${contentType === "movie" ? "Movie" : "Series"}`
                        : `Add ${contentType === "movie" ? "Movie" : "Series"}`)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
