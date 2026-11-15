import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, User, Heart, Share2, MapPin } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

/**
 * PropertyStories - "Housing Shorts" style video stories
 * Additive component to be placed on Home page
 */
const PropertyStories = () => {
    const [selectedStory, setSelectedStory] = useState(null);

    const stories = [
        {
            id: 1,
            title: "Sea View Penthouse",
            location: "Worli, Mumbai",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
            video: "#", // Placeholder
            user: "Estate Pro",
            avatar: "https://i.pravatar.cc/150?u=1",
            likes: "4.5k",
            color: "from-blue-500 to-purple-500"
        },
        {
            id: 2,
            title: "Modern Villa",
            location: "Whitefield, Bangalore",
            image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
            video: "#",
            user: "Luxury Living",
            avatar: "https://i.pravatar.cc/150?u=2",
            likes: "2.8k",
            color: "from-emerald-500 to-teal-500"
        },
        {
            id: 3,
            title: "Heritage Home",
            location: "Goa",
            image: "https://images.unsplash.com/photo-1600596542815-2495db98cfa4?w=600&q=80",
            video: "#",
            user: "Goa Estates",
            avatar: "https://i.pravatar.cc/150?u=3",
            likes: "5.1k",
            color: "from-orange-500 to-red-500"
        },
        {
            id: 4,
            title: "Sky High",
            location: "Gurgaon",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
            video: "#",
            user: "Skyline Infra",
            avatar: "https://i.pravatar.cc/150?u=4",
            likes: "3.2k",
            color: "from-indigo-500 to-blue-500"
        },
        {
            id: 5,
            title: "Eco Living",
            location: "Kerala",
            image: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600&q=80",
            video: "#",
            user: "Green Homes",
            avatar: "https://i.pravatar.cc/150?u=5",
            likes: "1.9k",
            color: "from-green-500 to-emerald-500"
        }
    ];

    return (
        <section className="py-8 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                        <Play className="w-6 h-6 text-accent fill-accent" />
                        Quick Tours
                    </h2>
                    <button className="text-sm text-accent hover:text-white transition-colors">View All</button>
                </div>

                {/* Stories Scroll Area */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {stories.map((story) => (
                        <motion.div
                            key={story.id}
                            className="relative flex-shrink-0 w-36 h-60 md:w-48 md:h-80 rounded-2xl overflow-hidden cursor-pointer snap-start group"
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedStory(story)}
                        >
                            {/* Gradient Border for "Unseen" Look */}
                            <div className={`absolute inset-0 p-[2px] rounded-2xl bg-gradient-to-br ${story.color} z-0`} />

                            <div className="absolute inset-[2px] rounded-xl overflow-hidden bg-gray-900 z-10">
                                <ImageWithFallback
                                    src={story.image}
                                    alt={story.title}
                                    className="w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                                {/* Play Icon */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-50 group-hover:scale-100 duration-300">
                                    <Play className="w-5 h-5 text-white fill-current" />
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-5 h-5 rounded-full border border-white overflow-hidden`}>
                                            <img src={story.avatar} alt="User" />
                                        </div>
                                        <span className="text-xs font-medium truncate">{story.user}</span>
                                    </div>
                                    <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-0.5">{story.title}</h3>
                                    <p className="text-[10px] text-gray-300 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {story.location}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            {/* Placeholder for Video Player */}
                            <ImageWithFallback
                                src={selectedStory.image}
                                alt={selectedStory.title}
                                className="w-full h-full object-cover opacity-50"
                            />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center animate-pulse mb-4">
                                    <Play className="w-8 h-8 fill-current ml-1" />
                                </div>
                                <p className="font-medium">Video Placeholder</p>
                                <p className="text-sm text-gray-400">Video implementation would go here</p>
                            </div>

                            {/* UI Overlay */}
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-white overflow-hidden">
                                        <img src={selectedStory.avatar} alt="User" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{selectedStory.user}</h4>
                                        <p className="text-xs text-gray-300">{selectedStory.location}</p>
                                    </div>
                                    <button className="ml-auto px-3 py-1 bg-accent rounded-full text-xs font-bold text-white">
                                        Follow
                                    </button>
                                </div>
                            </div>

                            {/* Side Actions */}
                            <div className="absolute bottom-20 right-4 flex flex-col gap-4 text-white">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
                                        <Heart className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium">{selectedStory.likes}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
                                        <Share2 className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium">Share</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    onAnimationComplete={() => setSelectedStory(null)}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default PropertyStories;
