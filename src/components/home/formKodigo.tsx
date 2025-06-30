'use client';

import { useState } from 'react';

export default function AddBookForm() {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        genre: '',
        publicationDate: '',
        review: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Book submitted:', formData);
    };

    return (
        <div className="min-h-screen bg-[#0D1F16] text-white px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Add a New Book</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                    className="w-full bg-[#112D20] border border-[#1E3D2E] rounded-md p-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
                />
                </div>
                <div>
                <label className="block font-semibold mb-1">Author</label>
                <input
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Enter author's name"
                    className="w-full bg-[#112D20] border border-[#1E3D2E] rounded-md p-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
                />
                </div>
                <div>
                <label className="block font-semibold mb-1">Genre</label>
                <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full bg-[#112D20] border border-[#1E3D2E] rounded-md p-3 text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                    <option value="">Select genre</option>
                    <option value="fiction">Fiction</option>
                    <option value="nonfiction">Non-fiction</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="sci-fi">Sci-Fi</option>
                </select>
                </div>
                <div>
                <label className="block font-semibold mb-1">Publication Date</label>
                <input
                    type="date"
                    name="publicationDate"
                    value={formData.publicationDate}
                    onChange={handleChange}
                    className="w-full bg-[#112D20] border border-[#1E3D2E] rounded-md p-3 text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
                />
                </div>
                <div>
                <label className="block font-semibold mb-1">Short Review</label>
                <textarea
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Write a short review of the book"
                    className="w-full bg-[#112D20] border border-[#1E3D2E] rounded-md p-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
                />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-md"
                    >
                        Save Book
                    </button>
                </div>
            </form>
        </div>
    );
}
