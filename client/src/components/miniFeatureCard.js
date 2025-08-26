import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * MiniFeatureCard Component
 * Renders a single mini feature card with:
 * - An image
 * - A title
 * - A description (truncated with "Read more"/"Show less" toggle)
 * - Floating animation effect
 */

const MiniFeatureCard = ({ feature }) => {
    const [readMore, setReadMore] = useState(false); // Toggle for expanded description
    const maxLength = 80; // Max length of description before truncation
    const shouldTruncate = feature.description.length > maxLength; // Only truncate if needed

    // Function to toggle between full and shortened description
    const toggleReadMore = () => setReadMore(!readMore);

    return (
        <div className="px-4 h-full w-full">
            {/* -------- Card Container with Floating Animation -------- */}
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full"
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                {/* -------- Feature Image -------- */}
                <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-24 h-24 sm:w-24 sm:h-24 object-contain rounded-lg mb-4"
                />

                {/* -------- Feature Title -------- */}
                <h4 className="text-md sm:text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                    {feature.title}
                </h4>

                {/* -------- Feature Description with Read More / Show Less -------- */}
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {shouldTruncate && !readMore
                        ? `${feature.description.slice(0, maxLength)}... ` // Truncated view
                    : feature.description // Full view
                    } 

                    {/* Toggle button appears only if text is long */}
                    {shouldTruncate && (
                        <button
                            onClick={toggleReadMore}
                            className="text-indigo-600 dark:text-indigo-400 underline text-xs ml-1 transition-all duration-300"
                        >
                            {readMore ? "Show less" : "Read more"}
                        </button>
                    )}
                </p>
            </motion.div>
        </div>
    );
};

export default MiniFeatureCard;
