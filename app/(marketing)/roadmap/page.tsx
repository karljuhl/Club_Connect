import React from 'react';
import futureFeatures from '../../../config/roadmap/futureFeatures.json';
import integratedFeatures from '../../../config/roadmap/integratedFeatures.json';

function RoadmapPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
            <h1 className="text-3xl font-bold text-center mb-12">Product Roadmap</h1>
            <div className="flex flex-wrap -mx-3">
                <section className="w-full lg:w-1/2 px-3 mb-6 lg:mb-0">
                    <h2 className="text-xl font-semibold mb-4">Future Features</h2>
                    <ul className="list-disc pl-5">
                        {futureFeatures.map((feature, index) => (
                            <li key={index} className="mb-2">{feature}</li>
                        ))}
                    </ul>
                </section>
                <section className="w-full lg:w-1/2 px-3">
                    <h2 className="text-xl font-semibold mb-4">Integrated Features</h2>
                    <ul className="list-disc pl-5">
                        {integratedFeatures.map((feature, index) => (
                            <li key={index} className="mb-2">{feature}</li>
                        ))}
                    </ul>
                </section>
            </div>
            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Suggest a Feature</h2>
                <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your feature suggestion..."
                        required
                    />
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Submit
                    </button>
                </form>
            </section>
        </div>
    );
}

function handleSuggestionSubmit(e) {
    e.preventDefault();
    const suggestion = e.target[0].value;
    console.log(suggestion); // Handle the suggestion
    e.target.reset();
    alert('Thank you for your suggestion!');
}

export default RoadmapPage;
