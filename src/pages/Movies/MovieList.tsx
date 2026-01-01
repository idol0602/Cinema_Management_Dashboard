import { useState } from "react";
import { useMovie } from "../../hooks/useMovie";
import type { CreateMovieDTO, Movie } from "../../types";

/**
 * Página de Lista de Filmes
 * Exibe todos os filmes cadastrados com opções para criar, editar e deletar
 */
export const MovieListPage = () => {
  const {
    movies,
    loading,
    error,
    createMovie,
    updateMovie,
    deleteMovie,
    clearError,
  } = useMovie();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMovieDTO>({
    title: "",
    description: "",
    genre: "",
    releaseDate: "",
    duration: 0,
    posterUrl: "",
  });

  // Handle form input
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) : value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update
      await updateMovie(editingId, formData);
      setEditingId(null);
    } else {
      // Create
      await createMovie(formData);
    }

    // Reset form
    setFormData({
      title: "",
      description: "",
      genre: "",
      releaseDate: "",
      duration: 0,
      posterUrl: "",
    });
    setIsModalOpen(false);
  };

  // Handle edit
  const handleEdit = (movie: Movie) => {
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      releaseDate: movie.releaseDate,
      duration: movie.duration,
      posterUrl: movie.posterUrl,
    });
    setEditingId(movie.id);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este filme?")) {
      await deleteMovie(id);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      genre: "",
      releaseDate: "",
      duration: 0,
      posterUrl: "",
    });
    clearError();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Filmes
            </h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou remova filmes do catálogo
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Novo Filme
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <p className="text-gray-600 text-center py-8">Carregando filmes...</p>
      )}

      {/* Movies Table */}
      {!loading && movies.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Gênero
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Duração (min)
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Data Lançamento
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {movie.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {movie.genre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {movie.duration}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(movie.releaseDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Nenhum filme cadastrado</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Adicionar Primeiro Filme
          </button>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Editar Filme" : "Novo Filme"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gênero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gênero
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um gênero</option>
                  <option value="Ação">Ação</option>
                  <option value="Comédia">Comédia</option>
                  <option value="Drama">Drama</option>
                  <option value="Ficção Científica">Ficção Científica</option>
                  <option value="Horror">Horror</option>
                  <option value="Aventura">Aventura</option>
                </select>
              </div>

              {/* Data de Lançamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Lançamento
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* URL do Pôster */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Pôster
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieListPage;
