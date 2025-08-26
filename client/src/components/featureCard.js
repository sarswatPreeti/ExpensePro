import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MiniFeatureCard from "./miniFeatureCard";

/*
 * FeatureSection Component
 * Displays a major feature of the app with an optional expandable mini-feature section.
 * Props:
 * - id: string – DOM id for anchor navigation
 * - title: string – Main feature title
 * - image: string – Path to associated image
 * - description: string – Feature description
 * - miniFeatures: array – Optional list of sub-features (objects)
 * - reverse: boolean – If true, image appears on the right (layout reversed)
 * - isFirst: boolean – If true, renders the "Our Features" section heading
*/

const FeatureSection = ({
    id,
    title,
    image,
    description,
    miniFeatures = [],
    reverse,
    isFirst,
}) => {
    const [isExpanded, setIsExpanded] = useState(false); // Toggle state for showing/hiding mini-features

    return (
        <section
            id={id}
            className="scroll-mt-24 w-full px-4 sm:px-6 md:px-10 lg:px-20 py-12 sm:py-16 md:py-20"
        >
            <div className="max-w-screen-xl mx-auto px-4">
                {/* -------- Our Features Header (Only for the first section) -------- */}
                {isFirst && (
                    <div className="text-center max-w-4xl mx-auto mt-20 mb-20 px-4">
                        <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-4 animate-fade-in">
                            🌟 Our Features
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Discover all the powerful tools that help you track your expenses easily and efficiently.Whether it's recording a new purchase, reviewing your spending habits, or managing categories,our features are designed to make money management stress-free.
                        </p>
                    </div>
                )}

                {/* -------- Main Content Container (Image + Text) -------- */}
                <motion.div
                    className={`flex flex-col ${
                        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                    } items-center gap-10 md:gap-12`}
                    initial={{ opacity: 0, y: 40 }} // Animation start state
                    whileInView={{ opacity: 1, y: 0 }} // Animate into view
                    viewport={{ once: true }} // Animate only the first time in view
                    transition={{ duration: 0.6 }}
                >
                    {/* -------- Image Section -------- */}
                    <div className="relative w-full lg:w-1/2 h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] flex items-center justify-center">
                        <motion.img
                            src={image}
                            alt={title}
                            className="h-full w-auto animate-float"
                            animate={{ y: [0, -12, 0] }} // Floating animation loop
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>

                    {/* -------- Text & Expandable Mini Features -------- */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left space-y-4">
                        {/* Feature Title */}
                        <h3 className="font-bold text-indigo-700 dark:text-indigo-400 text-2xl sm:text-3xl md:text-4xl">
                            {title}
                        </h3>

                        {/* Feature Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg">
                            {description}
                        </p>

                        {/* -------- Explore More Button (Toggle mini-features) -------- */}
                        {miniFeatures.length > 0 && (
                            <button
                            onClick={() => setIsExpanded(!isExpanded)} // Toggle feature card expansion
                            className="text-indigo-600 dark:text-indigo-400 font-medium underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-300"
                            >
                            {isExpanded ? "Show Less" : "Explore More"}
                            </button>
                        )}

                        {/* -------- Expandable Mini Features Section -------- */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} // Start hidden
                                    animate={{ opacity: 1, height: "auto" }} // Animate open
                                    exit={{ opacity: 0, height: 0 }} // Animate close
                                    transition={{ duration: 0.4 }}
                                    className="w-full max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4"
                                >
                                    {miniFeatures.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }} // Stagger animation
                                        >
                                            <MiniFeatureCard feature={feature} /> {/* Display each mini feature */}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FeatureSection;
