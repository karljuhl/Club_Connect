"use client";

// RoadmapPage component
import React from 'react';
import futureFeatures from '../../../config/roadmap/futureFeatures.json';
import integratedFeatures from '../../../config/roadmap/integratedFeatures.json';

function RoadmapPage() {
    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        const suggestion = e.target.elements.suggestion.value;

        const response = await fetch('/api/roadmap', {  // Ensure this is the correct path to your API route
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suggestion }),
        });

        if (response.ok) {
            alert('Thank you for your suggestion!');
            e.target.reset();
        } else {
            alert('Failed to send suggestion. Please try again.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
            <h1 className="text-3xl font-bold text-center mb-12">Product Roadmap</h1>
            <div className="flex flex-wrap -mx-3">
                <section className="w-full lg:w-1/2 px-3 mb-6 lg:mb-0">
                    <h2 className="text-xl font-semibold text-center mb-4">Future Features</h2>
                    <div className="space-y-4">
                        {futureFeatures.map((feature, index) => (
                            <div key={index} className="p-4 bg-rose-50 border border-red-300 rounded-lg">
                                {feature}
                            </div>
                        ))}
                    </div>
                </section>
                <section className="w-full lg:w-1/2 px-3">
                    <h2 className="text-xl font-semibold text-center mb-4">Integrated Features</h2>
                    <div className="space-y-4">
                        {integratedFeatures.map((feature, index) => (
                            <div key={index} className="p-4 bg-emerald-50 border border-green-300 rounded-lg">
                                {feature}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <section className="mt-8 px-3">
                <div className="p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Suggest a Feature</h2>
                    <form onSubmit={handleSuggestionSubmit}>
                <textarea
                    name="suggestion"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your feature suggestion..."
                    required
                />
                <button
                    type="submit"
                    className="mt-4 w-full sm:w-auto px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Submit
                </button>
            </form>
                </div>
            </section>
        </div>
    );
}

export default RoadmapPage;


