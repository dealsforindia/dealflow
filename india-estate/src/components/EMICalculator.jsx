import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

const EMICalculator = () => {
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);

    const calculateEMI = () => {
        const principal = loanAmount;
        const ratePerMonth = interestRate / (12 * 100);
        const months = loanTenure * 12;

        const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
            (Math.pow(1 + ratePerMonth, months) - 1);

        return Math.round(emi);
    };

    const monthlyEMI = calculateEMI();
    const totalPayment = monthlyEMI * loanTenure * 12;
    const totalInterest = totalPayment - loanAmount;

    return (
        <section className="py-20 bg-transparent relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 items-center">

                    {/* Content Side */}
                    <div className="lg:w-1/2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-2"
                        >
                            Financial Tools
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold font-serif text-white"
                        >
                            Smart <span className="text-gradient">EMI Calculator</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg"
                        >
                            Plan your finances with our advanced home loan calculator. Get instant estimates on your monthly payments and total interest.
                        </motion.p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-sm mb-1">Monthly EMI</p>
                                <p className="text-2xl font-bold text-white">₹{monthlyEMI.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-sm mb-1">Interest Rate</p>
                                <p className="text-2xl font-bold text-accent">{interestRate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Calculator Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 w-full"
                    >
                        <div className="glass-effect rounded-3xl p-8 border border-white/10 premium-shadow relative">
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-3xl blur opacity-30" />

                            <div className="relative space-y-8">
                                {/* Loan Amount Slider */}
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-white font-medium flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-accent" /> Loan Amount
                                        </label>
                                        <span className="text-accent font-bold">₹{(loanAmount / 100000).toFixed(1)} Lakhs</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000000"
                                        max="100000000"
                                        step="100000"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>₹10L</span>
                                        <span>₹10Cr</span>
                                    </div>
                                </div>

                                {/* Interest Rate Slider */}
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-white font-medium flex items-center gap-2">
                                            <Percent className="w-4 h-4 text-accent" /> Interest Rate
                                        </label>
                                        <span className="text-accent font-bold">{interestRate}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="15"
                                        step="0.1"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>5%</span>
                                        <span>15%</span>
                                    </div>
                                </div>

                                {/* Tenure Slider */}
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-white font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-accent" /> Tenure (Years)
                                        </label>
                                        <span className="text-accent font-bold">{loanTenure} Years</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="30"
                                        step="1"
                                        value={loanTenure}
                                        onChange={(e) => setLoanTenure(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>1 Yr</span>
                                        <span>30 Yrs</span>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">Total Amount Payable</span>
                                        <span className="text-white font-semibold">₹{totalPayment.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total Interest</span>
                                        <span className="text-red-400 font-semibold">₹{totalInterest.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-glow-sm hover:shadow-glow-md flex items-center justify-center gap-2">
                                    <Calculator className="w-5 h-5" />
                                    Check Eligibility
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default EMICalculator;
